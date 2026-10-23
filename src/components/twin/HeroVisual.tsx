"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroTwin } from "@/components/layout/HeroTwin";
import { Skeleton } from "@/components/ui/States";
import { Boundary } from "@/components/twin/Boundary";
import { LEGEND } from "@/data/twin";
import { hasWebGL, prefersReducedMotion } from "@/lib/webgl";

const Scene = dynamic(() => import("@/components/twin/HeroScene"), { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-none" /> });
const noop = () => () => {};

/** Landing-page visual: the real 3D colony, falling back to a static illustration if WebGL is unavailable. */
export function HeroVisual() {
  const webgl = useSyncExternalStore(noop, hasWebGL, () => true);
  const reduced = useSyncExternalStore(noop, prefersReducedMotion, () => false);
  const [failed, setFailed] = useState(false);
  if (!webgl || failed) return <HeroTwin />;
  return (
    <div className="space-y-3">
      <div className="relative h-[300px] overflow-hidden rounded-xl border border-line sm:h-[400px]">
        <Boundary onError={() => setFailed(true)}><Scene animate={!reduced} /></Boundary>
        <ul className="absolute bottom-3 left-3 space-y-1 rounded-lg border border-line bg-card/90 p-2 text-xs shadow-sm" aria-label="Flood risk colours">
          {LEGEND.flood.map((l) => <li key={l.label} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-ink/20" style={{ background: l.colour }} aria-hidden />{l.label}</li>)}
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">Illustrative demo colony. The rising water is a made-up scenario, not a prediction.</p>
        <Link href="/twin" className="inline-flex items-center gap-1 text-sm font-semibold text-brand underline-offset-2 hover:underline">Explore the 3D twin <ArrowRight size={14} aria-hidden /></Link>
      </div>
    </div>
  );
}
