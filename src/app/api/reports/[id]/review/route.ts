import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { checkRate, tooMany } from "@/lib/ratelimit";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Please log in first.", 401);
  if (session.role !== "reviewer") return fail("Only reviewers can review reports.", 403);
  const rate = await checkRate(req, "review", 60, 3600);
  if (!rate.ok) return tooMany(rate.retryAfter);

  const body = await req.json().catch(() => null);
  const decision = body?.decision;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : "";
  if (decision !== "approved" && decision !== "rejected" && decision !== "needs_info") return fail("Invalid decision.", 400);
  if (decision === "rejected" && note.length < 5) return fail("Please give a short reason for rejecting.", 400);
  if (decision === "needs_info" && note.length < 10) return fail("Please say what information is missing (at least 10 characters).", 400);
  if (!isDbConfigured()) return fail("The database is not configured.", 503);

  const { id } = await params;
  const { data, error } = await db()
    .from("reports")
    .update({ status: decision, reviewer_note: note || null, reviewed_at: decision === "needs_info" ? null : new Date().toISOString() })
    .eq("public_id", id).eq("status", "pending").select("id");
  if (error) return fail("Could not save the decision.", 500);
  if (!data?.length) return fail("This report was not found or has already been reviewed.", 409);

  await db().from("audit_events").insert({ report_id: data[0].id, actor_role: "reviewer", action: decision, note: note || null });
  return NextResponse.json({ ok: true });
}
