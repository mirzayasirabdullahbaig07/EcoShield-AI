// Pure helpers (no network): parsing, summary and the transparent rainfall indicator.
export type DailyPoint = { date: string; precipMm: number | null; probPct: number | null; isForecast: boolean };
export type Level = "high" | "medium" | "low";

export const THRESHOLDS = { high: 50, medium: 20 } as const;
export const INDICATOR_RULE =
  "Peak forecast daily rainfall of 50 mm or more is High, 20 mm or more is Medium, otherwise Low. " +
  "These are simple illustrative thresholds, not an official flood warning and not a prediction of flooding.";

type Num = number | null;
const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
const num = (v: unknown): Num => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function localToday(utcOffsetSeconds: number, now = Date.now()): string {
  return new Date(now + utcOffsetSeconds * 1000).toISOString().slice(0, 10);
}

export function parseForecast(json: unknown, today: string): DailyPoint[] {
  const d = (json as { daily?: Record<string, unknown> } | null)?.daily;
  const time = d?.time, mm = d?.precipitation_sum, prob = d?.precipitation_probability_max;
  if (!isArr(time) || !isArr(mm) || mm.length !== time.length) throw new Error("Unexpected forecast response");
  return time.map((t, i) => ({
    date: String(t),
    precipMm: num(mm[i]),
    probPct: isArr(prob) ? num(prob[i]) : null,
    isForecast: String(t) >= today,
  }));
}

export function parseRiverPeak(json: unknown): number | null {
  const q = (json as { daily?: { river_discharge?: unknown } } | null)?.daily?.river_discharge;
  if (!isArr(q)) return null;
  const vals = q.map(num).filter((v): v is number => v !== null);
  return vals.length ? Math.max(...vals) : null;
}

export function summarise(points: DailyPoint[]) {
  const fc = points.filter((p) => p.isForecast && p.precipMm !== null);
  if (!fc.length) return null;
  const totalMm = fc.reduce((s, p) => s + (p.precipMm ?? 0), 0);
  const peak = fc.reduce((a, b) => ((b.precipMm ?? 0) > (a.precipMm ?? 0) ? b : a));
  const peakMm = peak.precipMm ?? 0;
  const probs = fc.map((p) => p.probPct).filter((v): v is number => v !== null);
  const level: Level = peakMm >= THRESHOLDS.high ? "high" : peakMm >= THRESHOLDS.medium ? "medium" : "low";
  return {
    totalMm, peakMm, peakDate: peak.date, level,
    maxProbPct: probs.length ? Math.max(...probs) : null,
    days: fc.length,
  };
}

/** Orders areas from wettest to driest by peak forecast day. Areas without data go last, in their original order. */
export function rankAreas<T extends { peakMm: number | null }>(items: T[]): T[] {
  return items
    .map((v, i) => ({ v, i }))
    .sort((a, b) => (b.v.peakMm ?? -1) - (a.v.peakMm ?? -1) || a.i - b.i)
    .map((x) => x.v);
}
