"use client";

import { useState } from "react";
import { CheckCircle2, CircleSlash, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Probe = { state: "ok" | "error" | "off"; ms?: number };
type Result = { database: Probe; chain: Probe & { network: string; canRegister: boolean }; ai: Probe; checkedAt: string };

const ICON = { ok: CheckCircle2, error: XCircle, off: CircleSlash } as const;
const COLOUR = { ok: "text-brand", error: "text-risk-high", off: "text-muted" } as const;
const WORD = { ok: "working", error: "problem", off: "not set up" } as const;

/** Runs a live connectivity check on demand and shows what actually answered. */
export function StatusPanel() {
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function check() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.error ?? "The check failed.");
      setRes(json);
    } catch (e) { setError(e instanceof Error ? e.message : "Network problem."); }
    finally { setBusy(false); }
  }

  const rows: { label: string; p: Probe | undefined; note: string }[] = [
    { label: "Database", p: res?.database, note: "Reports and photos are saved here." },
    { label: "AI (Groq)", p: res?.ai, note: res?.ai.state === "ok" ? "A key is set. Live answers come from the model." : "No key: the assistant runs in labelled demo mode." },
    { label: "Blockchain", p: res?.chain, note: res ? (res.chain.state === "off" ? "Not configured." : `${res.chain.network}. ${res.chain.canRegister ? "Can register records." : "Read-only (no registrar key)."}`) : "Registers approved records." },
  ];
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map(({ label, p, note }) => {
          const Icon = p ? ICON[p.state] : CircleSlash;
          return (
            <li key={label} className="flex items-start gap-2 text-sm">
              <Icon size={18} className={`mt-0.5 shrink-0 ${p ? COLOUR[p.state] : "text-muted"}`} aria-hidden />
              <span><strong>{label}:</strong> {p ? WORD[p.state] : "not checked yet"}{p?.ms !== undefined ? ` (${p.ms} ms)` : ""}. <span className="text-muted">{note}</span></span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={check} disabled={busy}><RefreshCw size={16} className={busy ? "animate-spin" : ""} aria-hidden /> {busy ? "Checking…" : "Check connections now"}</Button>
        {res && <span className="text-xs text-muted">Checked {new Date(res.checkedAt).toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC</span>}
      </div>
      <p role="alert" className="text-sm text-risk-high">{error}</p>
      <p className="text-xs text-muted">Only working, problem or not set up is shown. No keys, URLs or addresses.</p>
    </div>
  );
}
