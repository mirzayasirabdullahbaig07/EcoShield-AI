import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db, isDbConfigured } from "@/lib/db";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { runAi } from "@/lib/ai";
import { checkRate, tooMany } from "@/lib/ratelimit";
import { CATEGORIES, type Category } from "@/lib/reports";
import { demoReportAnalysis, reportPrompt, validateReportAnalysis, type ReportFacts } from "@/lib/ai-logic";

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const rate = await checkRate(req, "ai", 20, 3600);
  if (!rate.ok) return tooMany(rate.retryAfter);
  if (!isDbConfigured()) return NextResponse.json({ error: "The database is not configured." }, { status: 503 });
  const body = await req.json().catch(() => null);
  if (typeof body?.publicId !== "string") return NextResponse.json({ error: "Missing report id." }, { status: 400 });

  const { data: r } = await db().from("reports")
    .select("public_id,category,description,neighbourhood_id,evidence_path,duplicate_flags,created_at")
    .eq("public_id", body.publicId).maybeSingle();
  if (!r) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const hood = (await getNeighbourhoods()).items.find((h) => h.id === r.neighbourhood_id);
  const facts: ReportFacts = {
    publicId: r.public_id, category: CATEGORIES[r.category as Category] ?? r.category,
    neighbourhood: hood ? `${hood.name}, ${hood.city}` : "unknown", description: r.description,
    createdAt: r.created_at, hasPhoto: Boolean(r.evidence_path), flags: r.duplicate_flags ?? [],
  };
  return NextResponse.json(await runAi(reportPrompt(facts), validateReportAnalysis, () => demoReportAnalysis(facts)));
}
