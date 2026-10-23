"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LookupForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const v = id.trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,40}$/.test(v)) return setError("Enter a record ID like CS-2026-0001.");
    router.push(`/verify/${v}`);
  }

  return (
    <form onSubmit={go} className="space-y-3" noValidate>
      <label htmlFor="rid" className="text-sm font-semibold">Record ID</label>
      <div className="flex flex-wrap gap-2">
        <input id="rid" value={id} onChange={(e) => { setId(e.target.value); setError(""); }} placeholder="CS-2026-0001" autoComplete="off"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-brand" />
        <Button type="submit"><Search size={16} aria-hidden /> Check record</Button>
      </div>
      <p role="alert" className="min-h-5 text-sm text-risk-high">{error}</p>
    </form>
  );
}
