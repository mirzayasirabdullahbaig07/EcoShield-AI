import Link from "next/link";
import { ArrowRight, Bot, Box, FilePlus2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badges";
import { ErrorState } from "@/components/ui/States";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { isDbConfigured } from "@/lib/db";
import { listReports, type ReportRow } from "@/lib/reports-db";
import { statusCounts } from "@/lib/community";
import { CATEGORIES, type Category } from "@/lib/reports";
import { fmtDateTime } from "@/lib/format";

const ACTIONS = [
  { href: "/reports/new", title: "Report an issue", text: "Blocked drain, flooding, clean-up or tree planting.", Icon: FilePlus2 },
  { href: "/twin", title: "Explore the 3D twin", text: "Click buildings and raise the water.", Icon: Box },
  { href: "/assistant", title: "Ask the AI", text: "The outlook in plain language.", Icon: Bot },
  { href: "/verify", title: "Verify a record", text: "Check evidence against the blockchain.", Icon: ShieldCheck },
];

export async function CommunityPanel() {
  let reports: ReportRow[] = [];
  let error = "";
  if (!isDbConfigured()) error = "Community statistics need the database, which is not configured.";
  else try { reports = await listReports(); } catch { error = "Community reports could not be loaded."; }
  const counts = statusCounts(reports);
  const recent = reports.slice(0, 3);

  return (
    <section aria-labelledby="community" className="space-y-4">
      <h2 id="community" className="font-display text-2xl font-semibold">Community actions</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map(({ href, title, text, Icon }) => (
          <Link key={href} href={href} className="block">
            <Card interactive className="h-full space-y-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:scale-110 group-hover:bg-brand group-hover:text-white"><Icon size={20} aria-hidden /></span>
              <p className="flex items-center gap-1 font-semibold">{title} <ArrowRight size={14} className="transition group-hover:translate-x-1" aria-hidden /></p>
              <p className="text-sm text-muted">{text}</p>
            </Card>
          </Link>
        ))}
      </div>

      {error ? <ErrorState title="Community statistics unavailable" message={error} /> : counts.total === 0 ? (
        <Card className="text-sm text-muted">No reports yet. Submit the first one to see community statistics here.</Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([["Total reports", counts.total], ["Under review", counts.pending], ["Approved", counts.approved + counts.registered], ["On blockchain", counts.registered]] as const).map(([l, n]) => (
              <Card key={l} interactive className="space-y-1"><p className="text-sm text-muted">{l}</p><p className="font-display text-3xl font-semibold"><AnimatedNumber value={n} /></p></Card>
            ))}
          </div>
          <Card className="space-y-3"><h3 className="font-semibold">Report statuses</h3><StatusBar counts={counts} /></Card>
          <div className="space-y-2">
            <h3 className="font-semibold">Recent community actions</h3>
            <ul className="grid gap-3 md:grid-cols-3">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/reports/${r.public_id}`} className="block h-full">
                    <Card interactive className="h-full space-y-2">
                      <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{CATEGORIES[r.category as Category] ?? r.category}</p><StatusBadge value={r.status} /></div>
                      <p className="line-clamp-2 text-sm text-muted">{r.description}</p>
                      <p className="text-xs text-muted">{r.public_id} · {fmtDateTime(r.created_at)}</p>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
