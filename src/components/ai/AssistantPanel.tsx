"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Bullets, ModeBadge } from "@/components/ai/AiBits";
import type { RiskAdvice } from "@/lib/ai-logic";
import { cn } from "@/lib/cn";

type Hood = { id: string; name: string; city: string };
type Run = { mode: "live" | "demo"; model?: string; note?: string; result: RiskAdvice };

export function AssistantPanel({ hoods, initialId }: { hoods: Hood[]; initialId?: string }) {
  const [id, setId] = useState(initialId ?? hoods[0]?.id ?? "");
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true); setError(""); setRun(null);
    try {
      const res = await fetch("/api/ai/risk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ neighbourhoodId: id }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setRun(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network problem. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Neighbourhood" className="flex flex-wrap gap-2">
        {hoods.map((h) => (
          <button key={h.id} type="button" role="radio" aria-checked={id === h.id} onClick={() => setId(h.id)}
            className={cn("min-h-11 rounded-full border px-4 text-sm transition", id === h.id ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/60")}>
            {h.name}, {h.city}
          </button>
        ))}
      </div>
      <Button onClick={ask} disabled={busy}><Sparkles size={16} aria-hidden /> {busy ? "Thinking…" : "Explain the rainfall outlook"}</Button>
      <p role="alert" className="min-h-5 text-sm text-risk-high">{error}</p>
      {run && (
        <Card className="space-y-4" >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Plain-language outlook</h2>
            <ModeBadge mode={run.mode} model={run.model} />
          </div>
          {run.note && <p className="rounded-lg bg-tint p-3 text-xs text-muted">{run.note}</p>}
          <p className="text-sm">{run.result.summary}</p>
          <Bullets title="Preparedness checklist" items={run.result.checklist} />
          <Bullets title="Why this advice" items={run.result.why} />
          <p className="text-xs text-muted">AI guidance is advisory. It is not an official warning and cannot guarantee safety. Follow local authorities in an emergency.</p>
        </Card>
      )}
    </div>
  );
}
