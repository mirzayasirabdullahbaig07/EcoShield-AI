"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Bullets, ModeBadge } from "@/components/ai/AiBits";
import type { ReportAnalysis as Analysis } from "@/lib/ai-logic";

type Run = { mode: "live" | "demo"; model?: string; note?: string; result: Analysis };

export function ReportAnalysis({ publicId }: { publicId: string }) {
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function analyse() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/ai/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setRun(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network problem. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">AI analysis (advisory)</h2>
        {run && <ModeBadge mode={run.mode} model={run.model} />}
      </div>
      {!run && <Button variant="outline" onClick={analyse} disabled={busy}><Sparkles size={16} aria-hidden /> {busy ? "Analysing…" : "Analyse this report"}</Button>}
      <p role="alert" className="text-sm text-risk-high">{error}</p>
      {run && (
        <div className="space-y-3">
          {run.note && <p className="rounded-lg bg-tint p-3 text-xs text-muted">{run.note}</p>}
          <p className="text-sm">{run.result.summary}</p>
          <Bullets title="Possible concerns" items={run.result.concerns} />
          <Bullets title="Missing details" items={run.result.missing} />
          <Bullets title="What a reviewer should check" items={run.result.reviewerChecks} />
        </div>
      )}
      <p className="text-xs text-muted">The AI reads the text only, not the photo. It cannot confirm that a report is true or approve it: a human reviewer decides.</p>
    </div>
  );
}
