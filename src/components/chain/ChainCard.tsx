import { AlertTriangle, CheckCircle2, Link2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RegisterButton } from "@/components/chain/RegisterButton";
import { chainReadConfigured, chainWriteConfigured, networkInfo, readRecord, txUrl } from "@/lib/chain";
import { recordHashHex, toBytes32 } from "@/lib/record-hash";
import { computeVerdict } from "@/lib/verify-logic";
import Link from "next/link";
import type { ChainRow, ReportRow } from "@/lib/reports-db";

export async function ChainCard({ report: r, chain, canRegister }: { report: ReportRow; chain: ChainRow | null; canRegister: boolean }) {
  const confirmed = Boolean(chain?.block_number);
  let check: "match" | "mismatch" | "unreachable" | "none" = "none";
  if (confirmed) {
    const verdict = computeVerdict({
      chain: { confirmed },
      onChain: chainReadConfigured() ? await readRecord(r.public_id) : null,
      recordHash: toBytes32(recordHashHex(r)),
      evidenceHash: toBytes32(r.evidence_sha256),
    });
    check = verdict === "verified" ? "match" : verdict === "mismatch" ? "mismatch" : "unreachable";
  }
  const url = chain ? txUrl(chain.tx_hash) : null;
  return (
    <Card className="space-y-3">
      <h2 className="flex items-center gap-2 font-semibold"><Link2 size={18} className="text-brand" aria-hidden /> Blockchain record</h2>
      <p className="text-sm"><Link className="text-brand underline" href={`/verify/${r.public_id}`}>Open the public verification page</Link> <span className="text-muted">(shareable, no login needed)</span></p>
      {!chain && r.status === "approved" && !chainWriteConfigured() && <p className="text-sm text-muted">The blockchain is not configured on this server yet, so approved reports cannot be registered.</p>}
      {!chain && r.status === "approved" && chainWriteConfigured() && (canRegister
        ? <><p className="text-sm text-muted">Approved. Registering stores only hashes on {networkInfo().name}, never the photo or text.</p><RegisterButton publicId={r.public_id} pending={false} /></>
        : <p className="text-sm text-muted">Approved. A reviewer can now register it on the blockchain.</p>)}
      {!chain && r.status !== "approved" && <p className="text-sm text-muted">Only approved reports can be registered.</p>}
      {chain && !confirmed && (
        <>
          <p className="text-sm text-muted">A transaction was sent but is <strong>not confirmed yet</strong>. This report is not blockchain-verified until it is.</p>
          {canRegister && <RegisterButton publicId={r.public_id} pending />}
        </>
      )}
      {chain && (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Network</dt><dd className="font-medium">{chain.network}</dd></div>
          {confirmed && <div><dt className="text-muted">Block</dt><dd className="font-medium">{chain.block_number}</dd></div>}
          <div className="sm:col-span-2"><dt className="text-muted">Transaction</dt>
            <dd className="break-all font-mono text-xs">{url ? <a className="text-brand underline" href={url} target="_blank" rel="noreferrer">{chain.tx_hash}</a> : chain.tx_hash}</dd></div>
        </dl>
      )}
      {check === "match" && <p role="status" className="flex items-start gap-2 text-sm text-brand-dark"><CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden /> The on-chain record matches this report&apos;s text and photo hash, so they are unchanged since approval. This does not prove the claim itself is true.</p>}
      {check === "mismatch" && <p role="alert" className="flex items-start gap-2 text-sm text-risk-high"><AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden /> Warning: the on-chain record does NOT match this report. The stored data may have changed.</p>}
      {check === "unreachable" && <p role="alert" className="flex items-start gap-2 text-sm text-risk-med"><AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden /> The blockchain could not be reached just now, so the record could not be checked.</p>}
    </Card>
  );
}
