"use client";

import { useState } from "react";
import { FileCheck2, ShieldX, ShieldCheck } from "lucide-react";
import { sha256HexOfBuffer } from "@/lib/hash-client";
import { hashesMatch } from "@/lib/verify-logic";

const MAX = 25 * 1024 * 1024;

export function HashVerifier({ expectedHash, source }: { expectedHash: string; source: "blockchain" | "database" }) {
  const [state, setState] = useState<{ name: string; hash: string; match: boolean } | null>(null);
  const [error, setError] = useState("");

  async function check(f: File | null) {
    setState(null); setError("");
    if (!f) return;
    if (f.size > MAX) return setError("Please choose a file under 25 MB.");
    try {
      const hash = await sha256HexOfBuffer(await f.arrayBuffer());
      setState({ name: f.name, hash, match: hashesMatch(hash, expectedHash) });
    } catch { setError("Your browser could not read this file."); }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="verify-file" className="flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-brand/50 bg-brand-soft/40 px-4 text-sm text-muted hover:bg-brand-soft">
        <FileCheck2 className="text-brand" size={22} aria-hidden /> Choose the photo file you want to check
      </label>
      <input id="verify-file" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => check(e.target.files?.[0] ?? null)} />
      <p className="text-xs text-muted">The file is checked inside your browser and is never uploaded. The expected hash comes from the {source === "blockchain" ? "blockchain record" : "database (not yet on the blockchain)"}.</p>
      <p role="alert" className="text-sm text-risk-high">{error}</p>
      {state && (state.match ? (
        <p role="status" className="flex items-start gap-2 rounded-lg bg-brand-soft p-3 text-sm text-brand-dark"><ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden /> <span><strong>Match.</strong> {state.name} has exactly the registered hash, so it is the same file.</span></p>
      ) : (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-risk-high/50 bg-risk-high/10 p-3 text-sm text-risk-high"><ShieldX size={18} className="mt-0.5 shrink-0" aria-hidden /> <span><strong>No match.</strong> {state.name} is not the file that was registered. It may be a different or edited file.</span></p>
      ))}
      {state && <p className="break-all text-xs text-muted">Your file&apos;s SHA-256: <code>{state.hash}</code></p>}
    </div>
  );
}
