import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { chainReadConfigured, chainWriteConfigured, networkInfo, readRecord } from "@/lib/chain";
import { checkRate, tooMany } from "@/lib/ratelimit";

export const maxDuration = 20;
type Probe = { state: "ok" | "error" | "off"; ms?: number };

/** Live connectivity check. Returns on/off/error states only: never keys, URLs or addresses. */
export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const rate = await checkRate(req, "status", 20, 60);
  if (!rate.ok) return tooMany(rate.retryAfter);

  const time = async (fn: () => Promise<boolean>): Promise<Probe> => { const t = Date.now(); try { return { state: (await fn()) ? "ok" : "error", ms: Date.now() - t }; } catch { return { state: "error", ms: Date.now() - t }; } };
  const [database, chain] = await Promise.all([
    isDbConfigured() ? time(async () => !(await db().from("neighbourhoods").select("id").limit(1)).error) : Promise.resolve<Probe>({ state: "off" }),
    chainReadConfigured() ? time(async () => (await readRecord("CS-STATUS-PROBE")).state !== "unreachable") : Promise.resolve<Probe>({ state: "off" }),
  ]);
  return NextResponse.json({
    database, chain: { ...chain, network: networkInfo().name, canRegister: chainWriteConfigured() },
    ai: { state: process.env.GROQ_API_KEY ? "ok" : "off" } satisfies Probe, checkedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": "no-store" } });
}
