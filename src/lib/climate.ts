import { localToday, parseForecast, parseRiverPeak, summarise, type DailyPoint } from "@/lib/climate-logic";

export type Rainfall =
  | { ok: true; points: DailyPoint[]; summary: NonNullable<ReturnType<typeof summarise>>; riverPeakM3s: number | null; fetchedAt: string }
  | { ok: false; error: string };

const get = (url: string) => fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) });

export async function fetchRainfall(lat: number, lng: number): Promise<Rainfall> {
  try {
    const f = await get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&daily=precipitation_sum,precipitation_probability_max&past_days=7&forecast_days=7&timezone=auto`,
    );
    if (!f.ok) return { ok: false, error: `Open-Meteo returned status ${f.status}.` };
    const json = await f.json();
    const points = parseForecast(json, localToday(Number(json.utc_offset_seconds) || 0));
    const summary = summarise(points);
    if (!summary) return { ok: false, error: "No forecast rainfall values were returned for this location." };

    // River discharge is a bonus signal: failure here must not break the page.
    let riverPeakM3s: number | null = null;
    try {
      const r = await get(
        `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge&forecast_days=7`,
      );
      if (r.ok) riverPeakM3s = parseRiverPeak(await r.json());
    } catch {}

    return { ok: true, points, summary, riverPeakM3s, fetchedAt: f.headers.get("date") ?? new Date().toUTCString() };
  } catch {
    return { ok: false, error: "Could not reach the Open-Meteo weather service. Please try again shortly." };
  }
}
