import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { checkRate, tooMany } from "@/lib/ratelimit";
import { validateResponse } from "@/lib/reports";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** The session that submitted a report answers the reviewer's request for more information; the report returns to the review queue. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Please log in first.", 401);
  const rate = await checkRate(req, "respond", 10, 3600);
  if (!rate.ok) return tooMany(rate.retryAfter);
  const v = validateResponse((await req.json().catch(() => null))?.message);
  if (!v.ok) return fail(v.error, 400);
  if (!isDbConfigured()) return fail("The database is not configured.", 503);

  const { id } = await params;
  const { data: r } = await db().from("reports").select("id,status,author_session").eq("public_id", id).maybeSingle();
  if (!r) return fail("Report not found.", 404);
  if (!r.author_session || r.author_session !== session.sid) return fail("Only the session that submitted this report can reply.", 403);
  if (r.status !== "needs_info") return fail("This report is not waiting for more information.", 409);

  const { data, error } = await db().from("reports").update({ status: "pending" }).eq("id", r.id).eq("status", "needs_info").select("id");
  if (error || !data?.length) return fail("Could not send your reply. Please try again.", 500);
  await db().from("audit_events").insert({ report_id: r.id, actor_role: "citizen", action: "info_provided", note: v.message });
  return NextResponse.json({ ok: true });
}
