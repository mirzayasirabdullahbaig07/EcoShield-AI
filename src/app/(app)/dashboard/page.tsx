import { Suspense } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { ClimatePanel } from "@/components/dashboard/ClimatePanel";
import { CommunityPanel } from "@/components/dashboard/CommunityPanel";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import { PREFS_COOKIE, parsePrefs } from "@/lib/prefs";
import { cn } from "@/lib/cn";

export const metadata = { title: "Dashboard | EcoShield AI" };

function PanelSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading rainfall data" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-52" />
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const [session, hoods, { n }, jar] = await Promise.all([getSession(), getNeighbourhoods(), searchParams, cookies()]);
  const pref = parsePrefs(jar.get(PREFS_COOKIE)?.value, hoods.items.map((x) => x.id)).area;
  const area = hoods.items.find((x) => x.id === n) ?? hoods.items.find((x) => x.id === pref) ?? hoods.items[0];
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Welcome, {session?.name}</h1>
        <p className="text-muted">Rainfall outlook for {area.name}, {area.city}.</p>
      </header>

      <nav aria-label="Neighbourhood" className="flex flex-wrap gap-2">
        {hoods.items.map((x) => (
          <Link
            key={x.id}
            href={`/dashboard?n=${x.id}`}
            aria-current={x.id === area.id ? "true" : undefined}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2.5 text-sm transition",
              x.id === area.id ? "border-brand bg-brand text-white" : "border-line bg-card text-ink hover:border-brand/60",
            )}
          >
            {x.name}, {x.city}
          </Link>
        ))}
      </nav>

      <Suspense key={area.id} fallback={<PanelSkeleton />}>
        <ClimatePanel area={area} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-64" />}>
        <CommunityPanel />
      </Suspense>

      <Card className="text-sm text-muted">
        Building-level risk shown in the 3D view later will be <strong>simulated demo data</strong> and is not a
        prediction for any real street. Weather data by{" "}
        <a className="text-brand underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a>{" "}
        (CC BY 4.0). For official alerts and emergency numbers see <Link className="text-brand underline" href="/resources">emergency resources</Link>.
      </Card>
      <p className="text-xs text-muted">
        Neighbourhood list source: {hoods.source === "database" ? "Supabase database" : "built-in seed data"}.
      </p>
    </div>
  );
}
