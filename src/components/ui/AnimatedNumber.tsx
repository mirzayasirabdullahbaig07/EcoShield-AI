"use client";

import { useEffect, useRef } from "react";

/** Counts up to `value` once on mount. The final number is in the server HTML, so it also works without JavaScript. */
export function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now(), dur = 800;
    let raf = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / dur), eased = 1 - (1 - p) ** 3;
      el.textContent = (value * eased).toFixed(decimals) + suffix;
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [value, decimals, suffix]);
  return <span ref={ref}>{value.toFixed(decimals) + suffix}</span>;
}
