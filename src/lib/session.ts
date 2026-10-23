import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export type Role = "citizen" | "reviewer";
export type Session = { role: Role; name: string; sid: string };
export const SESSION_COOKIE = "es_session";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-secret-change-me";
  throw new Error("SESSION_SECRET is not set");
}
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

export function encode(s: Session): string {
  const p = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${p}.${sign(p)}`;
}

export function decode(token?: string): Session | null {
  if (!token) return null;
  const [p, sig] = token.split(".");
  if (!p || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(p));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(p, "base64url").toString());
    if ((s.role === "citizen" || s.role === "reviewer") && typeof s.name === "string" && typeof s.sid === "string" && /^[a-f0-9]{16,64}$/.test(s.sid)) return s;
  } catch {}
  return null;
}

export async function getSession(): Promise<Session | null> {
  return decode((await cookies()).get(SESSION_COOKIE)?.value);
}
