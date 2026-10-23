import { createHash } from "node:crypto";

export type HashableReport = {
  public_id: string; category: string; neighbourhood_id: string | null; description: string;
  evidence_sha256: string | null; created_at: string;
};

/** SHA-256 (hex) over a canonical, versioned JSON of the public fields of a report. */
export function recordHashHex(r: HashableReport): string {
  const canonical = JSON.stringify({
    v: 1, publicId: r.public_id, category: r.category, neighbourhoodId: r.neighbourhood_id,
    description: r.description, evidenceSha256: r.evidence_sha256, createdAt: new Date(r.created_at).toISOString(),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export const ZERO_HASH = "0x" + "00".repeat(32);
export const toBytes32 = (hex: string | null): string => (hex ? "0x" + hex : ZERO_HASH);
