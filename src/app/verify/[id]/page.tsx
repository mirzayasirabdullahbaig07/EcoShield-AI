import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, ShieldQuestion, ShieldX } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/Badges";
import { HashVerifier } from "@/components/verify/HashVerifier";
import { CopyLink } from "@/components/verify/CopyLink";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { isDbConfigured } from "@/lib/db";
import { chainReadConfigured, readRecord, txUrl, type OnChain } from "@/lib/chain";
import { getPublicRecord } from "@/lib/public-record";
import { computeVerdict, type Verdict } from "@/lib/verify-logic";
import { CATEGORIES, type Category } from "@/lib/reports";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Public verification | EcoShield AI" };

const BANNER: Record<Verdict, { cls: string; Icon: typeof Clock; title: string; text: string }> = {
  verified: { cls: "border-brand/40 bg-brand-soft text-brand-dark", Icon: CheckCircle2, title: "Verified on the blockchain", text: "The registered on-chain record matches this record's text and evidence hash, so it has not changed since approval. This does not prove the reported claim itself is true." },
  pending_confirmation: { cls: "border-risk-med/50 bg-risk-med/10 text-risk-med", Icon: Clock, title: "Not verified yet", text: "A blockchain transaction was sent but has not been confirmed. Check again in a minute." },
  not_registered: { cls: "border-line bg-tint text-ink", Icon: ShieldQuestion, title: "Approved, but no blockchain proof yet", text: "A reviewer approved this record, but it has not been registered on the blockchain, so its integrity cannot be checked yet." },
  unreachable: { cls: "border-risk-med/50 bg-risk-med/10 text-risk-med", Icon: AlertTriangle, title: "Could not check the blockchain", text: "The blockchain network could not be reached just now, so this record's integrity could not be checked. Please try again later." },
  mismatch: { cls: "border-risk-high/50 bg-risk-high/10 text-risk-high", Icon: ShieldX, title: "Warning: the record does not match", text: "The on-chain record does not match what is stored for this report. The stored data may have been changed after registration." },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between"><Logo /><span className="text-sm text-muted">Public verification</span></header>
      {children}
    </main>
  );
}

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) return <Shell><ErrorState title="Verification unavailable" message="The record database is not configured." /></Shell>;
  let rec;
  try { rec = await getPublicRecord(id); } catch { return <Shell><ErrorState title="Verification unavailable" message="The record could not be loaded. Please try again later." /></Shell>; }
  if (!rec) notFound();
  const { view: v, recordHash, evidenceHash } = rec;

  const confirmed = Boolean(v.chain?.blockNumber);
  const onChain: OnChain | null = confirmed && chainReadConfigured() ? await readRecord(v.publicId) : null;
  const verdict = computeVerdict({ chain: v.chain ? { confirmed } : null, onChain, recordHash, evidenceHash });
  const b = BANNER[verdict];
  const hood = (await getNeighbourhoods()).items.find((h) => h.id === v.neighbourhoodId);
  const link = v.chain ? txUrl(v.chain.txHash) : null;
  const expected = onChain?.state === "registered" ? onChain.evidenceHash : evidenceHash;

  return (
    <Shell>
      <section className="space-y-3">
        <p className="text-sm text-muted">Climate action record</p>
        <h1 className="font-display text-4xl font-semibold">{v.publicId}</h1>
        <StatusBadge value={v.status} />
      </section>

      <div role={verdict === "verified" ? "status" : "alert"} className={`flex items-start gap-3 rounded-xl border p-4 ${b.cls}`}>
        <b.Icon size={22} className="mt-0.5 shrink-0" aria-hidden />
        <div><p className="font-semibold">{b.title}</p><p className="text-sm">{b.text}</p></div>
      </div>

      <Card className="space-y-3">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Category</dt><dd className="font-medium">{CATEGORIES[v.category as Category] ?? v.category}</dd></div>
          <div><dt className="text-muted">Neighbourhood</dt><dd className="font-medium">{hood ? `${hood.name}, ${hood.city}` : "Not listed"}</dd></div>
          <div><dt className="text-muted">Submitted</dt><dd className="font-medium">{fmtDateTime(v.createdAt)}</dd></div>
        </dl>
        <div><p className="text-sm text-muted">Description (reviewed before approval; emails and long numbers are hidden)</p><p className="whitespace-pre-wrap text-sm">{v.description}</p></div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold">Evidence integrity</h2>
        {!v.hasPhoto ? <p className="text-sm text-muted">This record has no photo evidence. The registered fingerprint covers its text only.</p> : (
          <>
            <p className="break-all text-xs text-muted">Evidence SHA-256: <code>{evidenceHash.replace(/^0x/, "")}</code></p>
            <p className="text-sm text-muted">The original photo is not shown publicly. If you were given the photo, check that it matches:</p>
            <HashVerifier expectedHash={expected} source={onChain?.state === "registered" ? "blockchain" : "database"} />
          </>
        )}
      </Card>

      {v.chain && (
        <Card className="space-y-2">
          <h2 className="font-semibold">Blockchain record</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">Network</dt><dd className="font-medium">{v.chain.network}</dd></div>
            {confirmed && <div><dt className="text-muted">Block</dt><dd className="font-medium">{v.chain.blockNumber}</dd></div>}
            <div className="sm:col-span-2"><dt className="text-muted">Transaction hash</dt>
              <dd className="break-all font-mono text-xs">{link ? <a className="text-brand underline" href={link} target="_blank" rel="noreferrer">{v.chain.txHash}</a> : v.chain.txHash}</dd></div>
          </dl>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3"><CopyLink path={`/verify/${v.publicId}`} />
        <p className="text-xs text-muted">Anyone with this link can check the record. No account is needed.</p></div>
    </Shell>
  );
}
