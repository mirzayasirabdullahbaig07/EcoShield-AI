import { CloudRain } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badges";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { SEED_NEIGHBOURHOODS } from "@/data/neighbourhoods";
import { fetchRainfall } from "@/lib/climate";

/** Real forecast data on the landing page. Renders nothing at all if the weather service cannot be reached. */
export async function LiveStrip() {
  const rows = (await Promise.all(SEED_NEIGHBOURHOODS.map(async (a) => ({ a, r: await fetchRainfall(a.lat, a.lng) })))).flatMap(({ a, r }) => (r.ok ? [{ a, s: r.summary }] : []));
  if (!rows.length) return null;
  return (
    <section aria-labelledby="live-title" className="mx-auto max-w-6xl px-4 pb-14" data-reveal>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 id="live-title" className="flex items-center gap-2 font-display text-2xl font-semibold"><CloudRain className="text-brand" size={22} aria-hidden /> Rainfall outlook right now</h2>
        <p className="text-xs text-muted">Live forecast from Open-Meteo, next 7 days. Not an official warning.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {rows.map(({ a, s }) => (
          <li key={a.id}>
            <Card interactive className="space-y-2">
              <div className="flex items-center justify-between gap-2"><p className="font-semibold">{a.city}</p><RiskBadge level={s.level} /></div>
              <p className="text-sm text-muted">{a.name}</p>
              <p className="text-sm">Wettest day: <strong>{s.peakMm < 0.5 ? "no rain" : <AnimatedNumber value={s.peakMm} suffix=" mm" />}</strong> · total <strong><AnimatedNumber value={s.totalMm} suffix=" mm" /></strong></p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
