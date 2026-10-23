"use client";

import { useState } from "react";
import { RiskBadge, type RiskLevel } from "@/components/ui/Badges";

// Illustrative isometric preview. Names and risk levels are simulated, not real data.
type Block = { id: string; name: string; gx: number; gy: number; h: number; risk: RiskLevel };

const BLOCKS: Block[] = [
  { id: "a", name: "House #101", gx: 0.4, gy: 0.3, h: 26, risk: "low" },
  { id: "b", name: "Community Hall", gx: 2.2, gy: 0.2, h: 38, risk: "low" },
  { id: "c", name: "House #102", gx: 4.2, gy: 0.4, h: 28, risk: "medium" },
  { id: "d", name: "House #103", gx: 0.3, gy: 1.6, h: 30, risk: "medium" },
  { id: "e", name: "School", gx: 2.3, gy: 1.7, h: 44, risk: "low" },
  { id: "f", name: "House #104", gx: 4.4, gy: 1.7, h: 26, risk: "high" },
  { id: "g", name: "House #105", gx: 0.5, gy: 3.9, h: 28, risk: "high" },
  { id: "h", name: "Clinic", gx: 2.6, gy: 4.0, h: 36, risk: "medium" },
  { id: "i", name: "House #106", gx: 4.5, gy: 4.1, h: 30, risk: "high" },
];

const TOP: Record<RiskLevel, string> = { high: "#e5484d", medium: "#f2a33a", low: "#3fa96b" };
const CX = 260, CY = 30, W = 38, H = 19;
const P = (gx: number, gy: number, z = 0) => `${CX + (gx - gy) * W},${CY + (gx + gy) * H - z}`;

function Cube({ b, active, onPick }: { b: Block; active: boolean; onPick: () => void }) {
  const { gx, gy, h } = b;
  const [x0, x1, y0, y1] = [gx + 0.05, gx + 0.95, gy + 0.05, gy + 0.95];
  const poly = (pts: [number, number, number][]) => pts.map(([x, y, z]) => P(x, y, z)).join(" ");
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${b.name}, ${b.risk} risk (simulated)`}
      className="cursor-pointer outline-none"
      onClick={onPick}
      onMouseEnter={onPick}
      onFocus={onPick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick()}
      style={{ filter: active ? "drop-shadow(0 0 10px rgba(15,107,76,.55))" : undefined }}
    >
      <polygon points={poly([[x1, y0, h], [x1, y1, h], [x1, y1, 0], [x1, y0, 0]])} fill="#c7bea6" stroke="#a79f88" />
      <polygon points={poly([[x1, y1, h], [x0, y1, h], [x0, y1, 0], [x1, y1, 0]])} fill="#d8d0bc" stroke="#a79f88" />
      <polygon points={poly([[x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]])} fill={TOP[b.risk]} fillOpacity={active ? 1 : 0.85} stroke="#7a7460" />
      {b.risk === "high" && (
        <circle className="ring" cx={CX + (gx - gy) * W} cy={CY + (gx + gy + 1) * H - h} r="14" fill="none" stroke="#e5484d" strokeWidth="2" />
      )}
    </g>
  );
}

export function HeroTwin() {
  const [id, setId] = useState("f");
  const active = BLOCKS.find((b) => b.id === id)!;
  const sorted = [...BLOCKS].sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-b from-tint to-paper">
        <svg viewBox="0 0 520 290" className="w-full" role="group" aria-label="Interactive illustrative neighbourhood">
          <polygon points={`${P(0, 0)} ${P(6, 0)} ${P(6, 6)} ${P(0, 6)}`} fill="#e8e3d3" stroke="#cbc4ae" />
          <polygon points={`${P(0, 2.9)} ${P(6, 2.9)} ${P(6, 3.7)} ${P(0, 3.7)}`} fill="#3b82c4" fillOpacity="0.85" />
          <polyline className="flow" points={`${P(0, 3.3)} ${P(6, 3.3)}`} stroke="#eaf5ff" strokeWidth="2" fill="none" strokeOpacity="0.8" />
          {sorted.map((b) => (
            <Cube key={b.id} b={b} active={b.id === id} onPick={() => setId(b.id)} />
          ))}
        </svg>
        <div className="floaty absolute right-3 top-3 rounded-lg border border-line bg-card/90 p-3 text-sm shadow-lg">
          <p className="mb-1.5 font-semibold">{active.name}</p>
          <RiskBadge level={active.risk} />
        </div>
      </div>
      <p className="text-xs text-muted">Hover or tap a building. This is an illustrative preview; the full 3D twin is in the app.</p>
    </div>
  );
}
