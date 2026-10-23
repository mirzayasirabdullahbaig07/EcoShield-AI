"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RegisterButton({ publicId, pending }: { publicId: string; pending: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function go() {
    setBusy(true); setMsg("");
    try {
      const res = await fetch(`/api/reports/${publicId}/register`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 202) throw new Error(json.error ?? "Registration failed.");
      if (res.status === 202) setMsg("The transaction was sent but is not confirmed yet. Wait a minute and press the button again to re-check.");
      router.refresh();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Network problem. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-2">
      <Button onClick={go} disabled={busy}><Link2 size={16} aria-hidden /> {busy ? "Waiting for the network (up to a minute)…" : pending ? "Re-check confirmation" : "Register on blockchain"}</Button>
      <p role="alert" className="text-sm text-risk-high">{msg}</p>
    </div>
  );
}
