import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { computeVerdict, hashesMatch, redactPublic } from "../src/lib/verify-logic";
import { sha256HexOfBuffer } from "../src/lib/hash-client";

const A = "0x" + "aa".repeat(32), B = "0x" + "bb".repeat(32), Z = "0x" + "00".repeat(32);
const reg = (rec: string, ev: string) => ({ state: "registered" as const, recordHash: rec, evidenceHash: ev, registeredAt: 1 });
const v = (o: Partial<Parameters<typeof computeVerdict>[0]>) => computeVerdict({ chain: { confirmed: true }, onChain: reg(A, B), recordHash: A, evidenceHash: B, ...o });

assert.equal(v({}), "verified");
assert.equal(v({ chain: null }), "not_registered");
assert.equal(v({ chain: { confirmed: false } }), "pending_confirmation");
assert.equal(v({ onChain: null }), "unreachable");
assert.equal(v({ onChain: { state: "unreachable" } }), "unreachable");
assert.equal(v({ onChain: { state: "not_registered" } }), "mismatch");
assert.equal(v({ onChain: reg(B, B) }), "mismatch", "record text changed");
assert.equal(v({ onChain: reg(A, A) }), "mismatch", "photo hash changed");
assert.equal(v({ onChain: reg(A, Z), evidenceHash: Z }), "verified", "no-photo report");
assert.equal(v({ chain: { confirmed: false }, onChain: reg(A, B) }), "pending_confirmation", "never verified before confirmation");

assert.ok(hashesMatch("0xABCD", "abcd")); assert.ok(!hashesMatch("ab", "ac"));

assert.equal(redactPublic("Mail me at ali.khan@example.com now"), "Mail me at [email removed] now");
assert.equal(redactPublic("call 0300-1234567 today"), "call [number removed] today");
assert.equal(redactPublic("CNIC 33100-1234567-1"), "CNIC [number removed]");
assert.equal(redactPublic("+92 300 1234567"), "[number removed]");
assert.equal(redactPublic("Planted 12 saplings on 2026-10-17 near block 4"), "Planted 12 saplings on 2026-10-17 near block 4");

(async () => {
  const bytes = new TextEncoder().encode("EcoShield test file");
  assert.equal(await sha256HexOfBuffer(bytes.buffer as ArrayBuffer), createHash("sha256").update(bytes).digest("hex"));
  console.log("verify: all assertions passed");
})().catch((e) => { console.error(e); process.exit(1); });
