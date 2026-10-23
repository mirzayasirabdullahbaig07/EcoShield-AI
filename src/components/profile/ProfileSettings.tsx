"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PREFS_COOKIE, parsePrefs, serializePrefs, type Prefs } from "@/lib/prefs";
import { cn } from "@/lib/cn";

type Hood = { id: string; name: string; city: string };
const chip = (on: boolean) => cn("min-h-11 rounded-full border px-4 text-sm transition", on ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/60");

/** Real settings: they are saved in a cookie and change how the app looks and which area opens first. */
export function ProfileSettings({ hoods, initial }: { hoods: Hood[]; initial: Prefs }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saved, setSaved] = useState("");

  function update(next: Partial<Prefs>, message: string) {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    document.cookie = `${PREFS_COOKIE}=${serializePrefs(merged)}; path=/; max-age=31536000; samesite=lax`;
    const applied = parsePrefs(serializePrefs(merged));
    document.documentElement.dataset.motion = applied.motion;
    document.documentElement.dataset.size = applied.size;
    setSaved(message);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Home neighbourhood</legend>
        <p className="text-xs text-muted">The dashboard and AI assistant open on this area first.</p>
        <div role="radiogroup" aria-label="Home neighbourhood" className="flex flex-wrap gap-2">
          <button type="button" role="radio" aria-checked={prefs.area === null} className={chip(prefs.area === null)} onClick={() => update({ area: null }, "Home neighbourhood reset.")}>First in list</button>
          {hoods.map((h) => <button key={h.id} type="button" role="radio" aria-checked={prefs.area === h.id} className={chip(prefs.area === h.id)} onClick={() => update({ area: h.id }, `Home neighbourhood set to ${h.name}.`)}>{h.name}, {h.city}</button>)}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4">
        <div><p id="motion-label" className="text-sm font-semibold">Animations</p><p className="text-xs text-muted">Turn off motion effects (the 3D scene still works).</p></div>
        <button type="button" role="switch" aria-checked={prefs.motion === "on"} aria-labelledby="motion-label" onClick={() => update({ motion: prefs.motion === "on" ? "off" : "on" }, prefs.motion === "on" ? "Animations turned off." : "Animations turned on.")}
          className={cn("relative h-7 w-12 shrink-0 rounded-full border transition", prefs.motion === "on" ? "border-brand bg-brand" : "border-line bg-tint2")}>
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", prefs.motion === "on" ? "left-6" : "left-0.5")} />
          <span className="sr-only">{prefs.motion === "on" ? "On" : "Off"}</span>
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Text size</legend>
        <div role="radiogroup" aria-label="Text size" className="flex gap-2">
          <button type="button" role="radio" aria-checked={prefs.size === "normal"} className={chip(prefs.size === "normal")} onClick={() => update({ size: "normal" }, "Text size: normal.")}>Normal</button>
          <button type="button" role="radio" aria-checked={prefs.size === "large"} className={chip(prefs.size === "large")} onClick={() => update({ size: "large" }, "Text size: large.")}>Large</button>
        </div>
      </fieldset>
      <p role="status" className="min-h-5 text-sm text-brand-dark">{saved}</p>
    </div>
  );
}
