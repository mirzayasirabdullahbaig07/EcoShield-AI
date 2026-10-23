"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RESPONSE_MAX, RESPONSE_MIN } from "@/lib/reports";

export function RespondForm({ publicId }: { publicId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/reports/${publicId}/respond`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not send your reply.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Network problem. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="reply" className="text-sm font-semibold">Your reply to the reviewer</label>
      <textarea id="reply" rows={4} maxLength={RESPONSE_MAX} value={text} onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-brand" />
      <p className="text-xs text-muted">{text.trim().length}/{RESPONSE_MAX} characters (minimum {RESPONSE_MIN}). Do not include personal information.</p>
      <p role="alert" className="min-h-5 text-sm text-risk-high">{error}</p>
      <Button onClick={send} disabled={busy}>{busy ? "Sending…" : "Send reply and return to review"}</Button>
    </div>
  );
}
