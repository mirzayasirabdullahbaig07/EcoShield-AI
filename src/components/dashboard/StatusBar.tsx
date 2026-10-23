"use client";

import { useState } from "react";
import type { Counts, Status } from "@/lib/community";

const SEGMENTS: { key: Status; label: string; colour: string }[] = [
  { key: "pending", label: "Under review", colour: "#9a4a07" },
  { key: "needs_info", label: "More info needed", colour: "#b45309" },
  { key: "approved", label: "Approved", colour: "#137536" },
  { key: "registered", label: "On blockchain", colour: "#0f6b4c" },
  { key: "rejected", label: "Rejected", colour: "#c62828" },
];

/** Stacked bar of report statuses. Hover or focus a segment or legend item to highlight it and read the exact count. */
export function StatusBar({ counts }: { counts: Counts }) {
  const [on, setOn] = useState<Status | null>(null);
  const shown = SEGMENTS.filter((s) => counts[s.key] > 0);
  const pct = (n: number) => (counts.total ? Math.round((n / counts.total) * 100) : 0);
  const sel = on ? SEGMENTS.find((s) => s.key === on)! : null;
  return (
    <div className="space-y-3">
      <div className="flex h-5 w-full gap-0.5 overflow-hidden rounded-full bg-tint" role="group" aria-label="Report statuses">
        {shown.map((s, i) => (
          <button key={s.key} type="button" aria-label={`${s.label}: ${counts[s.key]} of ${counts.total}`}
            onPointerEnter={() => setOn(s.key)} onPointerLeave={() => setOn(null)} onFocus={() => setOn(s.key)} onBlur={() => setOn(null)}
            className="h-full origin-left transition-all duration-300 first:rounded-l-full last:rounded-r-full focus-visible:ring-2"
            style={{ width: `${(counts[s.key] / counts.total) * 100}%`, background: s.colour, opacity: on && on !== s.key ? 0.35 : 1, transform: on === s.key ? "scaleY(1.35)" : undefined, animation: `grow 0.6s ${i * 80}ms both`, transformOrigin: "left center" }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {SEGMENTS.map((s) => (
          <li key={s.key} onPointerEnter={() => setOn(s.key)} onPointerLeave={() => setOn(null)} className={on && on !== s.key ? "opacity-50 transition" : "transition"}>
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.colour }} aria-hidden />{s.label}: <strong>{counts[s.key]}</strong>
          </li>
        ))}
      </ul>
      <p role="status" className="min-h-5 text-xs text-muted">{sel ? `${sel.label}: ${counts[sel.key]} of ${counts.total} reports (${pct(counts[sel.key])}%)` : "Hover a segment to see its share."}</p>
    </div>
  );
}
