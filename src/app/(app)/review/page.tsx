import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { ReportList } from "@/components/reports/ReportList";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { listReports, type ReportRow } from "@/lib/reports-db";

export const metadata = { title: "Review queue | EcoShield AI" };

export default async function ReviewPage() {
  const session = await getSession();
  if (session?.role !== "reviewer") {
    return (
      <Card className="mx-auto max-w-xl space-y-2">
        <h1 className="text-xl font-semibold">Reviewers only</h1>
        <p className="text-muted">This page is limited to reviewer accounts. Log out and continue as Reviewer to see it.</p>
      </Card>
    );
  }
  const hoods = await getNeighbourhoods();
  const names = Object.fromEntries(hoods.items.map((h) => [h.id, `${h.name}, ${h.city}`]));
  let reports: ReportRow[] = [];
  let waiting: ReportRow[] = [];
  let error = "";
  if (!isDbConfigured()) error = "The database is not configured.";
  else try { reports = await listReports("pending"); waiting = await listReports("needs_info"); } catch { error = "The queue could not be loaded. Did you run supabase/phase4.sql?"; }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Review queue</h1>
        <p className="text-muted">Reports waiting for a decision. Open one to approve or reject it.</p>
      </header>
      {error ? <ErrorState title="Cannot show the queue" message={error} />
        : reports.length === 0 ? <Card className="text-center text-sm text-muted">Nothing to review right now.</Card>
        : <ReportList reports={reports} hoodNames={names} />}
      {waiting.length > 0 && (
        <section aria-labelledby="waiting" className="space-y-2"><h2 id="waiting" className="font-semibold">Waiting for the author ({waiting.length})</h2><ReportList reports={waiting} hoodNames={names} /></section>
      )}
    </div>
  );
}
