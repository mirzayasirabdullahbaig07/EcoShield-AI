import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { fetchRainfall } from "@/lib/climate";
import { runAi } from "@/lib/ai";
import { checkRate, tooMany } from "@/lib/ratelimit";
import { demoRiskAdvice, riskPrompt, validateRiskAdvice, type RiskFacts } from "@/lib/ai-logic";

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const rate = await checkRate(req, "ai", 20, 3600);
  if (!rate.ok) return tooMany(rate.retryAfter);
  const body = await req.json().catch(() => null);
  const hoods = await getNeighbourhoods();
  const area = hoods.items.find((h) => h.id === body?.neighbourhoodId);
  if (!area) return NextResponse.json({ error: "Choose a supported neighbourhood." }, { status: 400 });

  // Numbers come from the server's own fetch, never from the client.
  const r = await fetchRainfall(area.lat, area.lng);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 502 });
  const facts: RiskFacts = {
    area: `${area.name}, ${area.city}`, level: r.summary.level, totalMm: r.summary.totalMm, peakMm: r.summary.peakMm,
    peakDate: r.summary.peakDate, maxProbPct: r.summary.maxProbPct, days: r.summary.days, riverPeakM3s: r.riverPeakM3s,
  };
  return NextResponse.json(await runAi(riskPrompt(facts), validateRiskAdvice, () => demoRiskAdvice(facts)));
}
