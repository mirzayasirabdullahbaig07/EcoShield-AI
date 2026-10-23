import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";

type Entry = { start: number; hits: number };
export type RateResult = { ok: boolean; retryAfter: number };

/** Fixed-window counter in memory. Used only as a fallback when the database function is unavailable. */
export function memoryHit(store: Map<string, Entry>, key: string, now: number, limit: number, windowMs: number): RateResult {
  const e = store.get(key);
  if (!e || now - e.start >= windowMs) { store.set(key, { start: now, hits: 1 }); return { ok: true, retryAfter: 0 }; }
  e.hits++;
  return e.hits <= limit ? { ok: true, retryAfter: 0 } : { ok: false, retryAfter: Math.max(1, Math.ceil((e.start + windowMs - now) / 1000)) };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (fwd || req.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

const mem = new Map<string, Entry>();

/** Shared across serverless instances through the `hit_rate_limit` SQL function (supabase/phase11.sql); falls back to memory, never blocks the app on a limiter fault. */
export async function checkRate(req: Request, bucket: string, limit: number, windowSec: number): Promise<RateResult> {
  const key = `${bucket}:${clientIp(req)}`;
  if (isDbConfigured()) {
    try {
      const { data, error } = await db().rpc("hit_rate_limit", { p_key: key, p_window_seconds: windowSec, p_limit: limit });
      if (!error && Array.isArray(data) && data.length) return { ok: Boolean(data[0].allowed), retryAfter: Number(data[0].retry_after) || 0 };
      console.error("Rate limit function unavailable, using memory fallback:", error?.message);
    } catch { console.error("Rate limit call failed, using memory fallback"); }
  }
  return memoryHit(mem, key, Date.now(), limit, windowSec * 1000);
}

export const tooMany = (retryAfter: number) =>
  NextResponse.json({ error: `Too many requests. Please try again in ${Math.max(1, retryAfter)} seconds.` }, { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfter)) } });
