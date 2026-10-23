import { Card } from "@/components/ui/Card";
import { ReportForm } from "@/components/reports/ReportForm";
import { getNeighbourhoods } from "@/data/neighbourhoods";

export const metadata = { title: "New report | EcoShield AI" };

export default async function NewReportPage() {
  const { items } = await getNeighbourhoods();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Report a climate issue</h1>
        <p className="text-muted">Help your community by reporting a problem or sharing an action you took.</p>
      </header>
      <Card><ReportForm hoods={items.map(({ id, name, city }) => ({ id, name, city }))} /></Card>
    </div>
  );
}
