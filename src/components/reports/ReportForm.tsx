"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, DESC_MAX, DESC_MIN, MAX_FILE_BYTES, type Category } from "@/lib/reports";
import { cn } from "@/lib/cn";

type Hood = { id: string; name: string; city: string };
const field = "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-brand";

export function ReportForm({ hoods }: { hoods: Hood[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | "">("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function pick(f: File | null) {
    if (f && f.size > MAX_FILE_BYTES) { setError("The photo is larger than 4 MB."); setFile(null); return; }
    setError(""); setFile(f);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!category) return setError("Choose a report category.");
    setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("category", category);
    if (file) fd.set("evidence", file); else fd.delete("evidence");
    try {
      const res = await fetch("/api/reports", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
      router.push(`/reports/${json.publicId}?submitted=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network problem. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <span id="cat" className="text-sm font-semibold">Category</span>
        <div role="radiogroup" aria-labelledby="cat" className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORIES) as Category[]).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={category === c} onClick={() => setCategory(c)}
              className={cn("min-h-11 rounded-full border px-4 text-sm transition",
                category === c ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/60")}>
              {CATEGORIES[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="hood" className="text-sm font-semibold">Neighbourhood</label>
        <select id="hood" name="neighbourhoodId" className={field} defaultValue={hoods[0]?.id}>
          {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}, {h.city}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="desc" className="text-sm font-semibold">What did you see or do?</label>
        <textarea id="desc" name="description" rows={5} maxLength={DESC_MAX} value={desc}
          onChange={(e) => setDesc(e.target.value)} className={field}
          placeholder="e.g. Water is not draining near the main road after yesterday's rain." />
        <p className="text-xs text-muted">{desc.trim().length}/{DESC_MAX} characters (minimum {DESC_MIN}). Do not include names or phone numbers.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="file" className="text-sm font-semibold">Photo evidence (optional)</label>
        <label htmlFor="file" className="flex min-h-20 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-brand/50 bg-brand-soft/40 px-4 text-sm text-muted hover:bg-brand-soft">
          <ImagePlus className="text-brand" size={22} aria-hidden />
          {file ? `${file.name} (${file.size < 1048576 ? Math.max(1, Math.round(file.size / 1024)) + " KB" : (file.size / 1048576).toFixed(1) + " MB"})` : "Choose a JPEG, PNG or WebP photo, up to 4 MB"}
        </label>
        <input id="file" name="evidence" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={(e) => pick(e.target.files?.[0] ?? null)} />
        <p className="text-xs text-muted">Photos can reveal location and faces. Only upload what you are happy for reviewers to see.</p>
      </div>
      <p role="alert" className="min-h-5 text-sm text-risk-high">{error}</p>
      <Button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit report"}</Button>
    </form>
  );
}
