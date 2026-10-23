import { db } from "@/lib/db";
import { recordHashHex, toBytes32 } from "@/lib/record-hash";
import { redactPublic } from "@/lib/verify-logic";

export type PublicView = {
  publicId: string; category: string; neighbourhoodId: string | null; description: string;
  status: "approved" | "registered"; createdAt: string; hasPhoto: boolean;
  chain: { network: string; txHash: string; blockNumber: number | null } | null;
};

/** Returns only public-safe fields. Never author, photo path, reviewer note or duplicate flags. Pending/rejected reports are not public. */
export async function getPublicRecord(publicId: string) {
  if (!/^[A-Za-z0-9-]{1,40}$/.test(publicId)) return null;
  const { data: r } = await db().from("reports")
    .select("id,public_id,neighbourhood_id,category,description,status,evidence_sha256,created_at")
    .eq("public_id", publicId).in("status", ["approved", "registered"]).maybeSingle();
  if (!r) return null;
  const { data: c } = await db().from("chain_records").select("network,tx_hash,block_number").eq("report_id", r.id).maybeSingle();
  const view: PublicView = {
    publicId: r.public_id, category: r.category, neighbourhoodId: r.neighbourhood_id, description: redactPublic(r.description),
    status: r.status, createdAt: r.created_at, hasPhoto: Boolean(r.evidence_sha256),
    chain: c ? { network: c.network, txHash: c.tx_hash, blockNumber: c.block_number } : null,
  };
  // Hashes are computed from the RAW stored record, exactly as at registration time.
  return { view, recordHash: toBytes32(recordHashHex(r)), evidenceHash: toBytes32(r.evidence_sha256) };
}
