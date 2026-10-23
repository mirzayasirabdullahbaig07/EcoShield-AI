import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { ReportList } from "@/components/reports/ReportList";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { isDbConfigured } from "@/lib/db";
import { listReports, type ReportRow } from "@/lib/reports-db";

export const metadata = { title: "Reports | EcoShield AI" };

const FILTERS = [["", "All"], ["pending", "Under review"], ["needs_info", "More info needed"], ["approved", "Approved"], ["registered", "On blockchain"], ["rejected", "Rejected"]] as const;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const found = FILTERS.find(([v]) => v && v === status)?.[0];
  const filter = found || undefined; // "" means "All"
  const hoods = await getNeighbourhoods();
  const names = Object.fromEntries(hoods.items.map((h) => [h.id, `${h.name}, ${h.city}`]));
  let reports: ReportRow[] = [];
  let error = "";
  if (!isDbConfigured()) error = "The database is not configured.";
  else try { reports = await listReports(filter); } catch { error = "Reports could not be loaded. Did you run supabase/phase4.sql?"; }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold">Community reports</h1>
          <p className="text-muted">Demo accounts are shared, so this list shows every demo report.</p>
        </div>
        <Button href="/reports/new"><Plus size={16} aria-hidden /> New report</Button>
      </header>
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {FILTERS.map(([v, label]) => (
          <Link key={v} href={v ? `/reports?status=${v}` : "/reports"} aria-current={(filter ?? "") === v ? "true" : undefined}
            className={cn("min-h-11 rounded-full border px-4 py-2.5 text-sm transition", (filter ?? "") === v ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/60")}>{label}</Link>
        ))}
      </nav>
      {error ? <ErrorState title="Cannot show reports" message={error} />
        : reports.length === 0 ? (
          <Card className="space-y-2 text-center">
            <p className="font-semibold">No reports yet</p>
            <p className="text-sm text-muted">{filter ? "No reports with this status yet." : "Be the first: report a blocked drain or a community action."}</p>
          </Card>
        ) : <ReportList reports={reports} hoodNames={names} />}
    </div>
  );
}
