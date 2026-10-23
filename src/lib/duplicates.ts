// Duplicate detection is a warning for the reviewer, never proof of fraud.
export type DupFlag = { kind: "same_file" | "similar_text"; publicId: string; score: number };
export type Candidate = {
  public_id: string; description: string; category: string;
  neighbourhood_id: string | null; evidence_sha256: string | null; created_at: string;
};

export const SIMILARITY_THRESHOLD = 0.5;
const WINDOW_DAYS = 30;

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const words = (s: string) => new Set(normalize(s).split(" ").filter((w) => w.length > 2));

/** Jaccard similarity of word sets, 0 to 1. */
export function similarity(a: string, b: string): number {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export function findDuplicates(
  n: { description: string; category: string; neighbourhoodId: string; hash: string | null },
  candidates: Candidate[],
  now = Date.now(),
): DupFlag[] {
  const flags = new Map<string, DupFlag>();
  for (const c of candidates) {
    if (n.hash && c.evidence_sha256 === n.hash) {
      flags.set(c.public_id, { kind: "same_file", publicId: c.public_id, score: 1 });
      continue;
    }
    const recent = now - new Date(c.created_at).getTime() <= WINDOW_DAYS * 86_400_000;
    if (recent && c.neighbourhood_id === n.neighbourhoodId && c.category === n.category) {
      const score = Math.round(similarity(n.description, c.description) * 100) / 100;
      if (score >= SIMILARITY_THRESHOLD) flags.set(c.public_id, { kind: "similar_text", publicId: c.public_id, score });
    }
  }
  return [...flags.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}
