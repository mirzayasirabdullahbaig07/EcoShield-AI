"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CopyLink({ path }: { path: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(window.location.origin + path); setDone(true); setTimeout(() => setDone(false), 2000); } catch { /* clipboard blocked */ }
  }
  return <Button variant="outline" onClick={copy}>{done ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {done ? "Link copied" : "Copy public link"}</Button>;
}
