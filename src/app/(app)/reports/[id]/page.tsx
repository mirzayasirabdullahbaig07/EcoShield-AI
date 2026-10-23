import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badges";
import { ErrorState } from "@/components/ui/States";
import { ReviewActions } from "@/components/reports/ReviewActions";
import { ReportAnalysis } from "@/components/ai/ReportAnalysis";
import { ChainCard } from "@/components/chain/ChainCard";
import { JourneyStepper } from "@/components/reports/JourneyStepper";
import { RespondForm } from "@/components/reports/RespondForm";
import { journeySteps } from "@/lib/community";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getReportBundle } from "@/lib/reports-db";
import { CATEGORIES, type Category } from "@/lib/reports";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Report | EcoShield AI" };

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ submitted?: string }> }) {
  const [{ id }, { submitted }, session, hoods] = await Promise.all([params, searchParams, getSession(), getNeighbourhoods()]);
  if (!isDbConfigured()) return <ErrorState title="Cannot show this report" message="The database is not configured." />;
  let bundle;
  try { bundle = await getReportBundle(id, { role: session?.role ?? "", sid: session?.sid ?? "" }); } catch { return <ErrorState title="Cannot show this report" message="The report could not be loaded." />; }
  if (!bundle) notFound();
  const { report: r, audit, evidenceUrl, mayView, chain } = bundle;
  const hood = hoods.items.find((h) => h.id === r.neighbourhood_id);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {submitted && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-brand-soft p-3 text-sm text-brand-dark">
          <CheckCircle2 size={18} aria-hidden /> Report submitted. A reviewer will look at it.
        </p>
      )}
      <header className="space-y-2">
        <Link href="/reports" className="text-sm text-brand underline">All reports</Link>
        <h1 className="font-display text-3xl font-semibold">{r.public_id}</h1>
        <StatusBadge value={r.status} />
      </header>

      <JourneyStepper steps={journeySteps(r, chain ? { confirmed: Boolean(chain.block_number) } : null)} />

      <Card className="space-y-3">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Category</dt><dd className="font-medium">{CATEGORIES[r.category as Category] ?? r.category}</dd></div>
          <div><dt className="text-muted">Neighbourhood</dt><dd className="font-medium">{hood ? `${hood.name}, ${hood.city}` : "Unknown"}</dd></div>
          <div><dt className="text-muted">Submitted</dt><dd className="font-medium">{fmtDateTime(r.created_at)}</dd></div>
          <div><dt className="text-muted">By</dt><dd className="font-medium">{r.author_name ?? "Unknown"}</dd></div>
        </dl>
        <p className="whitespace-pre-wrap text-sm">{r.description}</p>
      </Card>

      {r.evidence_path && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Evidence</h2>
          {!mayView ? <p className="text-sm text-muted">The photo is private. Only reviewers and the demo session that submitted this report can view it.</p> : evidenceUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={evidenceUrl} alt="Evidence photo submitted with this report" className="max-h-96 rounded-lg border border-line" />
          ) : <p className="text-sm text-muted">The photo could not be loaded.</p>}
          <p className="break-all text-xs text-muted">SHA-256: <code>{r.evidence_sha256}</code></p>
        </Card>
      )}

      <Card><ReportAnalysis publicId={r.public_id} /></Card>

      {(r.status === "approved" || r.status === "registered") && <ChainCard report={r} chain={chain} canRegister={session?.role === "reviewer"} />}

      {r.duplicate_flags?.length > 0 && (
        <Card className="space-y-2 border-risk-med/50">
          <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle size={18} className="text-risk-med" aria-hidden /> Possible duplicate</h2>
          <p className="text-sm text-muted">This is a warning for the reviewer, not proof of anything. Similar reports can be genuine.</p>
          <ul className="list-disc pl-5 text-sm">
            {r.duplicate_flags.map((f) => (
              <li key={f.publicId}>
                <Link className="text-brand underline" href={`/reports/${f.publicId}`}>{f.publicId}</Link>:{" "}
                {f.kind === "same_file" ? "identical photo file" : `similar description (${Math.round(f.score * 100)}% word overlap)`}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {r.reviewer_note && <Card className="text-sm"><p className="font-semibold">Reviewer note</p><p className="text-muted">{r.reviewer_note}</p></Card>}

      {r.status === "needs_info" && (
        <Card className="space-y-2 border-risk-med/50">
          <h2 className="font-semibold">More information requested</h2>
          {mayView && session?.role !== "reviewer" ? <RespondForm publicId={r.public_id} /> : <p className="text-sm text-muted">Waiting for the person who submitted this report to reply.</p>}
        </Card>
      )}

      {session?.role === "reviewer" && r.status === "pending" && (
        <Card className="space-y-2"><h2 className="font-semibold">Review this report</h2><ReviewActions publicId={r.public_id} /></Card>
      )}

      <Card className="space-y-2">
        <h2 className="font-semibold">Audit history</h2>
        <ol className="space-y-1 text-sm">
          {audit.map((a) => (
            <li key={a.id} className="text-muted">
              {fmtDateTime(a.created_at)} · <strong className="text-ink">{a.action}</strong> by {a.actor_role}{a.note ? ` (${a.note})` : ""}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
