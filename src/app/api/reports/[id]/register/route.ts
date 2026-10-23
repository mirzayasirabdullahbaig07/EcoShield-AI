import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ChainError, chainWriteConfigured, confirmTx, networkInfo, sendRegister } from "@/lib/chain";
import { recordHashHex, toBytes32 } from "@/lib/record-hash";
import type { ReportRow } from "@/lib/reports-db";
import { checkRate, tooMany } from "@/lib/ratelimit";

export const maxDuration = 60; // Sepolia blocks take ~12 s; Vercel Hobby allows up to 60 s.

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function markRegistered(reportId: string, txHash: string, blockNumber: number) {
  await db().from("chain_records").update({ block_number: blockNumber }).eq("report_id", reportId);
  const { data } = await db().from("reports").update({ status: "registered" }).eq("id", reportId).eq("status", "approved").select("id");
  if (data?.length) await db().from("audit_events").insert({ report_id: reportId, actor_role: "system", action: "registered_on_chain", note: txHash });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Please log in first.", 401);
  if (session.role !== "reviewer") return fail("Only reviewers can register records.", 403);
  if (!isDbConfigured()) return fail("The database is not configured.", 503);
  if (!chainWriteConfigured()) return fail("The blockchain is not configured on this server.", 503);
  const rate = await checkRate(req, "register", 10, 3600);
  if (!rate.ok) return tooMany(rate.retryAfter);

  const { id } = await params;
  const { data } = await db().from("reports").select("*").eq("public_id", id).maybeSingle();
  const r = data as ReportRow | null;
  if (!r) return fail("Report not found.", 404);
  if (r.status !== "approved" && r.status !== "registered") return fail("Only approved reports can be registered.", 409);

  try {
    const { data: row } = await db().from("chain_records").select("*").eq("report_id", r.id).maybeSingle();
    if (row) {
      if (row.block_number) return NextResponse.json({ confirmed: true, txHash: row.tx_hash, already: true });
      const c = await confirmTx(row.tx_hash);
      if (c.confirmed && c.blockNumber) { await markRegistered(r.id, row.tx_hash, c.blockNumber); return NextResponse.json({ confirmed: true, txHash: row.tx_hash }); }
      return NextResponse.json({ confirmed: false, txHash: row.tx_hash }, { status: 202 });
    }

    const txHash = await sendRegister(r.public_id, toBytes32(r.evidence_sha256), toBytes32(recordHashHex(r)));
    // Save the hash straight away so a timeout never loses a sent transaction.
    const ins = await db().from("chain_records").insert({ report_id: r.id, network: networkInfo().name, tx_hash: txHash, block_number: null });
    if (ins.error) return fail("The transaction was sent but could not be saved. Contact the admin with: " + txHash, 500);
    const c = await confirmTx(txHash);
    if (c.confirmed && c.blockNumber) { await markRegistered(r.id, txHash, c.blockNumber); return NextResponse.json({ confirmed: true, txHash }, { status: 201 }); }
    return NextResponse.json({ confirmed: false, txHash }, { status: 202 });
  } catch (e) {
    return fail(e instanceof ChainError ? e.message : "Registration failed.", 502);
  }
}
