import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataSourceTag, RiskBadge } from "@/components/ui/Badges";
import { ErrorState } from "@/components/ui/States";
import { RainChart } from "@/components/dashboard/RainChart";
import { fetchRainfall } from "@/lib/climate";
import { INDICATOR_RULE, rankAreas } from "@/lib/climate-logic";
import { fmtDateTime } from "@/lib/format";
import type { Neighbourhood } from "@/data/neighbourhoods";

const fmtDay = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export async function RiskCompare({ areas }: { areas: Neighbourhood[] }) {
  const rows = rankAreas((await Promise.all(areas.map(async (a) => ({ a, r: await fetchRainfall(a.lat, a.lng) })))).map((x) => ({ ...x, peakMm: x.r.ok ? x.r.summary.peakMm : null })));
  const fetchedAt = rows.map((x) => x.r).find((r) => r.ok)?.fetchedAt;
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {rows.map(({ a, r }, i) => (
          <li key={a.id}>
            {!r.ok ? <ErrorState title={`${a.name}, ${a.city}: data unavailable`} message={r.error} /> : (
              <Card interactive className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">{i === 0 && rows.length > 1 && r.summary.peakMm >= 0.5 ? "Wettest outlook: " : ""}{a.name}, {a.city}</h2>
                  <RiskBadge level={r.summary.level} />
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><dt className="text-muted">Rain, next 7 days</dt><dd className="font-semibold">{r.summary.totalMm.toFixed(0)} mm</dd></div>
                  <div><dt className="text-muted">Wettest day</dt><dd className="font-semibold">{r.summary.peakMm < 0.5 ? "No rain" : `${r.summary.peakMm.toFixed(0)} mm, ${fmtDay(r.summary.peakDate)}`}</dd></div>
                  <div><dt className="text-muted">Max rain chance</dt><dd className="font-semibold">{r.summary.maxProbPct === null ? "n/a" : `${r.summary.maxProbPct}%`}</dd></div>
                  <div><dt className="text-muted">River discharge peak</dt><dd className="font-semibold">{r.riverPeakM3s === null ? "no data" : `${r.riverPeakM3s.toFixed(1)} m³/s`}</dd></div>
                </dl>
                <RainChart points={r.points} compact />
                <Link href={`/dashboard?n=${a.id}`} className="text-sm text-brand underline underline-offset-2">See the daily chart</Link>
              </Card>
            )}
          </li>
        ))}
      </ul>
      <div className="space-y-1 rounded-xl bg-tint p-4">
        {fetchedAt && <DataSourceTag source="Open-Meteo forecast and flood APIs (open-meteo.com)" updated={fmtDateTime(new Date(fetchedAt).toISOString())} note="Forecasts are uncertain and can change; cached up to 30 minutes." />}
        <p className="text-xs text-muted"><strong>How the indicator works.</strong> {INDICATOR_RULE}</p>
      </div>
    </div>
  );
}
