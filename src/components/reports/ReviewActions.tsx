"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReviewActions({ publicId }: { publicId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: "approved" | "rejected" | "needs_info") {
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/reports/${publicId}/review`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, note }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not save the decision.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network problem. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="note" className="text-sm font-semibold">Reviewer note (required to reject or to ask for more information)</label>
      <textarea id="note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-brand" />
      <p role="alert" className="min-h-5 text-sm text-risk-high">{error}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => decide("approved")} disabled={busy}>Approve</Button>
        <Button variant="outline" onClick={() => decide("needs_info")} disabled={busy}>Request more info</Button>
        <Button variant="danger" onClick={() => decide("rejected")} disabled={busy}>Reject</Button>
      </div>
    </div>
  );
}
