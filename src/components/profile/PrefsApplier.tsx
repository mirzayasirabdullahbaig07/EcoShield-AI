"use client";

import { useEffect } from "react";
import { PREFS_COOKIE, parsePrefs } from "@/lib/prefs";

/** Applies saved display preferences (animations, text size) to the page. Static pages stay static: this runs in the browser. */
export function PrefsApplier() {
  useEffect(() => {
    const raw = document.cookie.split("; ").find((c) => c.startsWith(PREFS_COOKIE + "="))?.slice(PREFS_COOKIE.length + 1);
    const p = parsePrefs(raw);
    document.documentElement.dataset.motion = p.motion;
    document.documentElement.dataset.size = p.size;
  }, []);
  return null;
}
