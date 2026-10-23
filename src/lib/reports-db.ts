import { db } from "@/lib/db";
import type { DupFlag } from "@/lib/duplicates";

export type ReportRow = {
  id: string; public_id: string; neighbourhood_id: string | null; category: string; description: string;
  status: "pending" | "needs_info" | "approved" | "rejected" | "registered"; evidence_path: string | null; evidence_sha256: string | null;
  author_name: string | null; author_session?: string | null; duplicate_flags: DupFlag[]; reviewer_note: string | null; reviewed_at: string | null; created_at: string;
};
export type ChainRow = { report_id: string; network: string; tx_hash: string; block_number: number | null; registered_at: string };
export type AuditRow = { id: number; actor_role: string; action: string; note: string | null; created_at: string };

export async function listReports(status?: ReportRow["status"]) {
  let q = db().from("reports").select("*").order("created_at", { ascending: false }).limit(50);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as ReportRow[];
}

export const canSeeEvidence = (r: { author_session?: string | null }, v: { role: string; sid: string }) =>
  v.role === "reviewer" || (Boolean(r.author_session) && r.author_session === v.sid);

/** Evidence URLs are only created for reviewers and for the demo session that submitted the report. */
export async function getReportBundle(publicId: string, viewer: { role: string; sid: string }) {
  const { data, error } = await db().from("reports").select("*").eq("public_id", publicId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const report = data as ReportRow;
  const { data: audit } = await db().from("audit_events").select("*").eq("report_id", report.id).order("created_at");
  const { data: chainData } = await db().from("chain_records").select("*").eq("report_id", report.id).maybeSingle();
  let evidenceUrl: string | null = null;
  const mayView = canSeeEvidence(report, viewer);
  if (report.evidence_path && mayView) {
    const { data: signed } = await db().storage.from("evidence").createSignedUrl(report.evidence_path, 600);
    evidenceUrl = signed?.signedUrl ?? null;
  }
  return { report, audit: (audit ?? []) as AuditRow[], evidenceUrl, mayView, chain: (chainData ?? null) as ChainRow | null };
}

/** Recent reports created by this demo session (used on the Profile page). `unavailable` means the owner column does not exist yet. */
export async function listMyReports(sid: string) {
  const { data, error } = await db().from("reports").select("public_id,category,status,created_at").eq("author_session", sid).order("created_at", { ascending: false }).limit(5);
  if (error) return { rows: [] as Pick<ReportRow, "public_id" | "category" | "status" | "created_at">[], unavailable: true };
  return { rows: (data ?? []) as Pick<ReportRow, "public_id" | "category" | "status" | "created_at">[], unavailable: false };
}
