"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/climate-logic";
import { THRESHOLDS } from "@/lib/climate-logic";

const W = 560;
const PAD = { l: 34, r: 8, t: 10, b: 22 };
const label = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Daily rainfall bars. Hover, tap or focus a bar (Tab / arrow keys) to read its exact value. */
export function RainChart({ points, compact = false }: { points: DailyPoint[]; compact?: boolean }) {
  const H = compact ? 84 : 130;
  const [active, setActive] = useState<number | null>(null);
  const peak = Math.max(...points.map((p) => p.precipMm ?? 0));
  const max = Math.max(compact ? 10 : 25, peak * 1.15);
  const bw = (W - PAD.l - PAD.r) / points.length;
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const a = active === null ? null : points[active];

  return (
    <figure className="space-y-2">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="group" aria-label="Daily rainfall in millimetres for the past 7 and next 7 days. Use Tab to move between days."
          onPointerLeave={() => setActive(null)}>
          {!compact && [THRESHOLDS.medium, THRESHOLDS.high].filter((t) => t <= max).map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#9a4a07" strokeDasharray="4 4" strokeOpacity={0.55} />
              <text x={PAD.l - 4} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#55665f">{t}</text>
            </g>
          ))}
          <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke="#d9d4c5" />
          {active !== null && <line x1={PAD.l + (active + 0.5) * bw} x2={PAD.l + (active + 0.5) * bw} y1={PAD.t} y2={y(0)} stroke="#10211b" strokeOpacity={0.25} strokeDasharray="2 3" />}
          {points.map((p, i) => {
            const v = p.precipMm ?? 0, x = PAD.l + i * bw, h = Math.max(v > 0 ? 3 : 1, y(0) - y(v));
            const on = active === i;
            return (
              <g key={p.date} tabIndex={0} role="img" className="cursor-pointer outline-none"
                aria-label={`${label(p.date)}, ${p.isForecast ? "forecast" : "past"}: ${p.precipMm === null ? "no data" : v.toFixed(1) + " millimetres"}${p.probPct !== null ? `, ${p.probPct}% chance of rain` : ""}`}
                onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                onKeyDown={(e) => { if (e.key === "ArrowRight") setActive(Math.min(points.length - 1, i + 1)); if (e.key === "ArrowLeft") setActive(Math.max(0, i - 1)); }}>
                <rect x={x} y={PAD.t} width={bw} height={H - PAD.t - PAD.b} fill="transparent" />
                <rect className="bar-grow" style={{ animationDelay: `${i * 35}ms` }} x={x + 3} width={bw - 6} y={y(0) - h} height={h} rx="3"
                  fill={p.isForecast ? (on ? "#0a4a35" : "#0f6b4c") : on ? "#4f6d5e" : "#789486"} opacity={active !== null && !on ? 0.55 : 1} />
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="9" fill={on ? "#10211b" : "#55665f"} fontWeight={on ? 700 : 400}>{p.date.slice(8)}</text>
              </g>
            );
          })}
        </svg>
        {a && (
          <div role="status" className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-card px-3 py-1.5 text-xs shadow-md"
            style={{ left: `${((PAD.l + ((active ?? 0) + 0.5) * bw) / W) * 100}%` }}>
            <strong>{label(a.date)}</strong> · {a.isForecast ? "forecast" : "past"}<br />
            {a.precipMm === null ? "no data" : `${a.precipMm.toFixed(1)} mm`}{a.probPct !== null ? ` · ${a.probPct}% chance` : ""}
          </div>
        )}
      </div>
      <figcaption className="flex flex-wrap gap-4 text-xs text-muted">
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#789486]" />Past 7 days</span>
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-brand" />Next 7 days</span>
        {!compact && <span>Hover or focus a day for details. Dashed lines mark the 20 mm and 50 mm thresholds when in range.</span>}
      </figcaption>
      <table className="sr-only">
        <caption>Daily rainfall (mm)</caption>
        <thead><tr><th>Date</th><th>Rainfall mm</th><th>Type</th></tr></thead>
        <tbody>{points.map((p) => <tr key={p.date}><td>{label(p.date)}</td><td>{p.precipMm ?? "no data"}</td><td>{p.isForecast ? "forecast" : "past"}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
