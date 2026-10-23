import { Suspense } from "react";
import { Skeleton } from "@/components/ui/States";
import { RiskCompare } from "@/components/dashboard/RiskCompare";
import { getNeighbourhoods } from "@/data/neighbourhoods";

export const metadata = { title: "Climate Risks | EcoShield AI" };

export default async function RisksPage() {
  const { items } = await getNeighbourhoods();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Climate risks, compared</h1>
        <p className="text-muted">The rainfall outlook for every supported neighbourhood, wettest first. Real forecast data; the indicator is a simple rule, not a flood model.</p>
      </header>
      <Suspense fallback={<div role="status" aria-busy="true" aria-label="Loading rainfall data" className="space-y-3">{items.map((a) => <Skeleton key={a.id} className="h-36" />)}</div>}>
        <RiskCompare areas={items} />
      </Suspense>
    </div>
  );
}
