import { Card } from "@/components/ui/Card";
import { RiskBadge, DataSourceTag } from "@/components/ui/Badges";
import { ErrorState } from "@/components/ui/States";
import { RainChart } from "@/components/dashboard/RainChart";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { INDICATOR_RULE } from "@/lib/climate-logic";
import { fetchRainfall } from "@/lib/climate";
import type { Neighbourhood } from "@/data/neighbourhoods";

const fmtDay = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtTime = (s: string) =>
  new Date(s).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card interactive className="space-y-1">
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-3xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </Card>
  );
}

export async function ClimatePanel({ area }: { area: Neighbourhood }) {
  const r = await fetchRainfall(area.lat, area.lng);
  if (!r.ok) return <ErrorState title="Rainfall data unavailable" message={r.error} />;
  const s = r.summary;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card interactive className="space-y-2">
          <p className="text-sm text-muted">Rainfall indicator</p>
          <RiskBadge level={s.level} />
          <p className="text-xs text-muted">Based on the peak day in the next {s.days} days.</p>
        </Card>
        <Stat label="Rain, next 7 days" value={<AnimatedNumber value={s.totalMm} suffix=" mm" />} sub="Total forecast" />
        <Stat label="Wettest day" value={s.peakMm < 0.5 ? "No rain" : <AnimatedNumber value={s.peakMm} suffix=" mm" />} sub={s.peakMm < 0.5 ? "None expected in the next 7 days" : fmtDay(s.peakDate)} />
        <Stat label="Max rain chance" value={s.maxProbPct === null ? "n/a" : <AnimatedNumber value={s.maxProbPct} suffix="%" />} sub="Highest daily probability" />
      </div>

      <Card className="space-y-3">
        <h2 className="font-semibold">Daily rainfall</h2>
        <RainChart points={r.points} />
      </Card>

      <Card className="space-y-1">
        <h2 className="font-semibold">River discharge (coarse model)</h2>
        {r.riverPeakM3s === null ? (
          <p className="text-sm text-muted">No river discharge data is available for this location.</p>
        ) : (
          <p className="text-sm">
            Peak forecast discharge near this point: <strong>{r.riverPeakM3s.toFixed(1)} m³/s</strong>. This comes from a
            global river model with a grid of several kilometres, so it is not street-level information.
          </p>
        )}
      </Card>

      <div className="space-y-1 rounded-xl bg-tint p-4">
        <DataSourceTag
          source="Open-Meteo forecast and flood APIs (open-meteo.com)"
          updated={fmtTime(r.fetchedAt)}
          note="Forecasts are uncertain and can change; cached up to 30 minutes."
        />
        <p className="text-xs text-muted"><strong>How the indicator works.</strong> {INDICATOR_RULE}</p>
      </div>
    </div>
  );
}
