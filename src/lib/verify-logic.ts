import type { OnChain } from "@/lib/chain";

export type Verdict = "verified" | "pending_confirmation" | "not_registered" | "unreachable" | "mismatch";

export const hashesMatch = (a: string, b: string) => {
  const n = (x: string) => x.trim().toLowerCase().replace(/^0x/, "");
  return n(a) === n(b);
};

/** "verified" is returned ONLY for a confirmed transaction whose on-chain hashes match what we recompute now. */
export function computeVerdict(i: {
  chain: { confirmed: boolean } | null;
  onChain: OnChain | null;
  recordHash: string; // 0x… recomputed from the stored record
  evidenceHash: string; // 0x… from the stored record (zero when no photo)
}): Verdict {
  if (!i.chain) return "not_registered";
  if (!i.chain.confirmed) return "pending_confirmation";
  if (!i.onChain || i.onChain.state === "unreachable") return "unreachable";
  if (i.onChain.state !== "registered") return "mismatch";
  return hashesMatch(i.onChain.recordHash, i.recordHash) && hashesMatch(i.onChain.evidenceHash, i.evidenceHash) ? "verified" : "mismatch";
}

/** Defence in depth for the public page: strip emails and long digit runs (phones, ID numbers). */
export function redactPublic(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email removed]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, (m) => (m.replace(/\D/g, "").length >= 9 ? "[number removed]" : m));
}
