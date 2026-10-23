// Integration test against a LOCAL Hardhat chain (not Sepolia). Run: see README section "Testing the chain code".
import assert from "node:assert/strict";
import { ChainError, chainWriteConfigured, confirmTx, readRecord, sendRegister } from "../src/lib/chain";
import { recordHashHex, toBytes32, ZERO_HASH } from "../src/lib/record-hash";

const rep = { public_id: "CS-2026-7001", category: "blocked_drainage", neighbourhood_id: "gulberg-lahore", description: "Drain blocked near the market.", evidence_sha256: "ab".repeat(32), created_at: "2026-10-17T10:00:00.000+00:00" };

(async () => {
  const h = recordHashHex(rep);
  assert.equal(h, recordHashHex({ ...rep, created_at: "2026-10-17T10:00:00Z" }), "same instant, same hash");
  assert.notEqual(h, recordHashHex({ ...rep, description: "Drain blocked near the market!" }), "text change changes hash");
  assert.notEqual(h, recordHashHex({ ...rep, evidence_sha256: null }), "photo change changes hash");
  assert.equal(toBytes32(null), ZERO_HASH);

  assert.ok(chainWriteConfigured(), "env must point at the local chain");
  const tx = await sendRegister(rep.public_id, toBytes32(rep.evidence_sha256), toBytes32(h));
  assert.match(tx, /^0x[0-9a-f]{64}$/);
  const c = await confirmTx(tx);
  assert.equal(c.confirmed, true); assert.ok(typeof c.blockNumber === "number");

  const rec = await readRecord(rep.public_id);
  assert.equal(rec.state, "registered");
  if (rec.state === "registered") { assert.equal(rec.recordHash, toBytes32(h)); assert.equal(rec.evidenceHash, toBytes32(rep.evidence_sha256)); }

  await assert.rejects(sendRegister(rep.public_id, ZERO_HASH, toBytes32(h)), (e) => e instanceof ChainError && /already registered/i.test(e.message));
  assert.equal((await readRecord("CS-2026-0000")).state, "not_registered");

  // a no-photo report registers with a zero evidence hash
  const tx2 = await sendRegister("CS-2026-7002", ZERO_HASH, toBytes32(h));
  assert.equal((await confirmTx(tx2)).confirmed, true);

  const saved = { id: process.env.CHAIN_ID, url: process.env.SEPOLIA_RPC_URL };
  process.env.CHAIN_ID = "11155111";
  assert.equal((await readRecord(rep.public_id)).state, "unreachable", "wrong chain is never trusted");
  await assert.rejects(sendRegister("CS-2026-7003", ZERO_HASH, toBytes32(h)), (e) => e instanceof ChainError && /expected/.test(e.message));
  process.env.CHAIN_ID = saved.id;
  process.env.SEPOLIA_RPC_URL = "http://127.0.0.1:1";
  assert.equal((await readRecord(rep.public_id)).state, "unreachable");
  console.log("chain: all assertions passed (local chain)");
})().catch((e) => { console.error(e); process.exit(1); });
