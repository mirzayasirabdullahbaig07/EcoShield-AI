import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time comparison (both sides hashed first so lengths match and timing leaks nothing). */
export function passcodeOk(input: string, expected: string): boolean {
  if (!expected) return false;
  const h = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(input), h(expected));
}
