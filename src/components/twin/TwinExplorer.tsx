"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Box, List, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { RiskBadge, SimulatedTag } from "@/components/ui/Badges";
import { BUILDINGS, LEGEND, MAX_WATER_M, PREP_LABEL, RISK_LABEL, depthAt, riskOf, type Layer } from "@/data/twin";
import { cn } from "@/lib/cn";
import { Boundary } from "@/components/twin/Boundary";
import { hasWebGL } from "@/lib/webgl";

const Scene = dynamic(() => import("@/components/twin/TwinScene"), { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-none" /> });

const noop = () => () => {};
const seg = (on: boolean) => cn("min-h-11 flex-1 rounded-lg border px-3 text-sm transition", on ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/60");

export function TwinExplorer() {
  const webgl = useSyncExternalStore(noop, hasWebGL, () => true);
  const [chosen, setChosen] = useState<"3d" | "list">("3d");
  const [failed, setFailed] = useState(false);
  const [viewKey, setViewKey] = useState(0);
  const view = webgl && !failed ? chosen : "list";
  const note = !webgl ? "3D could not start on this device, so the list view is shown instead." : failed ? "3D hit a problem on this device, so the list view is shown instead." : "";
  const [layer, setLayer] = useState<Layer>("flood");
  const [waterM, setWaterM] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => { document.body.style.cursor = hoveredId ? "pointer" : ""; return () => { document.body.style.cursor = ""; }; }, [hoveredId]);

  const selected = BUILDINGS.find((b) => b.id === selectedId) ?? null;
  const flooded = useMemo(() => BUILDINGS.filter((b) => depthAt(b, waterM) > 0).length, [waterM]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        <div className="flex gap-2" role="tablist" aria-label="View">
          <button role="tab" aria-selected={view === "3d"} className={seg(view === "3d")} onClick={() => setChosen("3d")}><Box size={16} className="mr-1.5 inline" aria-hidden />3D view</button>
          <button role="tab" aria-selected={view === "list"} className={seg(view === "list")} onClick={() => setChosen("list")}><List size={16} className="mr-1.5 inline" aria-hidden />List view</button>
        </div>
        {note && <p role="status" className="rounded-lg bg-tint p-3 text-sm text-muted">{note}</p>}

        {view === "3d" ? (
          <div className="relative h-[380px] overflow-hidden rounded-[var(--radius-card)] border border-line sm:h-[540px]">
            <button type="button" onClick={() => setViewKey((k) => k + 1)} className="absolute right-3 top-3 z-10 flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-card/90 px-3 text-sm shadow-sm hover:border-brand/60">
              <RotateCcw size={14} aria-hidden /> Reset view
            </button>
            <Boundary onError={() => setFailed(true)}>
              <Scene key={viewKey} layer={layer} waterM={waterM} selectedId={selectedId} hoveredId={hoveredId} onSelect={setSelectedId} onHover={setHoveredId} />
            </Boundary>
          </div>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Buildings in the demo neighbourhood</caption>
              <thead className="bg-tint text-muted"><tr><th className="p-3">Building</th><th className="p-3">Flood risk</th><th className="p-3">Preparedness</th><th className="p-3">In scenario</th></tr></thead>
              <tbody>
                {BUILDINGS.map((b) => (
                  <tr key={b.id} className={cn("border-t border-line", b.id === selectedId && "bg-brand-soft/50")}>
                    <th scope="row" className="p-3 font-medium"><button className="underline-offset-2 hover:underline" aria-pressed={b.id === selectedId} onClick={() => setSelectedId(b.id)}>{b.name}</button></th>
                    <td className="p-3">{RISK_LABEL[riskOf(b.elevation)]}</td><td className="p-3">{PREP_LABEL[b.prep]}</td>
                    <td className="p-3">{depthAt(b, waterM) > 0 ? `Flooded by ${depthAt(b, waterM).toFixed(1)} m` : "Dry"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        <p className="text-xs text-muted">Drag to rotate, scroll or pinch to zoom, click a building. Illustrative layout, not a map of a real place.</p>
      </div>

      <aside className="space-y-4" aria-label="Controls and details">
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Layer</h2><SimulatedTag /></div>
          <div className="flex gap-2" role="radiogroup" aria-label="Map layer">
            <button role="radio" aria-checked={layer === "flood"} className={seg(layer === "flood")} onClick={() => setLayer("flood")}>Flood risk</button>
            <button role="radio" aria-checked={layer === "prep"} className={seg(layer === "prep")} onClick={() => setLayer("prep")}>Preparedness</button>
          </div>
          <ul className="space-y-1 text-sm">
            {LEGEND[layer].map((l) => <li key={l.label} className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-sm border border-ink/20" style={{ background: l.colour }} aria-hidden />{l.label}</li>)}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold">Flood scenario</h2>
          <label htmlFor="water" className="block text-sm">Illustrative water rise: <strong>{waterM.toFixed(1)} m</strong></label>
          <input id="water" type="range" min={0} max={MAX_WATER_M} step={0.1} value={waterM} onChange={(e) => setWaterM(Number(e.target.value))} className="w-full accent-[var(--color-brand)]" />
          <p aria-live="polite" className="text-sm">{waterM === 0 ? "Move the slider to raise the water." : `${flooded} of ${BUILDINGS.length} buildings are flooded in this scenario.`}</p>
          <p className="text-xs text-muted">An illustration with made-up elevations. It is not a flood prediction or a hydrological model.</p>
        </Card>

        <Card className="space-y-2" aria-live="polite">
          <h2 className="font-semibold">Selected building</h2>
          {!selected ? <p className="text-sm text-muted">Click a building in the 3D view or choose one from the list.</p> : (
            <div className="space-y-2 text-sm">
              <p className="text-lg font-semibold">{selected.name}</p>
              <RiskBadge level={riskOf(selected.elevation)} />
              <dl className="grid grid-cols-2 gap-1">
                <dt className="text-muted">Ground level</dt><dd>{selected.elevation.toFixed(1)} m (simulated)</dd>
                <dt className="text-muted">Preparedness</dt><dd>{PREP_LABEL[selected.prep]}</dd>
                <dt className="text-muted">In scenario</dt><dd>{depthAt(selected, waterM) > 0 ? `Flooded by ${depthAt(selected, waterM).toFixed(1)} m` : "Dry"}</dd>
              </dl>
              <Link href="/reports/new" className="inline-block text-brand underline">Report a problem near here</Link>
            </div>
          )}
        </Card>
      </aside>
    </div>
  );
}
