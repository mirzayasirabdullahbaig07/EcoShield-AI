import assert from "node:assert/strict";
import { findDuplicates, similarity, normalize, type Candidate } from "../src/lib/duplicates";
import { detectImageType, validateReport, validateResponse } from "../src/lib/reports";

const now = Date.UTC(2026, 9, 17);
const day = (n: number) => new Date(now - n * 86_400_000).toISOString();
const base: Candidate = { public_id: "CS-2026-0001", description: "Water is not draining near the main road after rain.", category: "blocked_drainage", neighbourhood_id: "a", evidence_sha256: "abc", created_at: day(2) };

assert.equal(normalize("  Hello,   WORLD!! "), "hello world");
assert.ok(similarity("Water not draining near main road", "water is not draining near the main road") > 0.6);
assert.equal(similarity("", "anything here"), 0);
const n = { description: "Water not draining near the main road after rain", category: "blocked_drainage", neighbourhoodId: "a", hash: null };
assert.equal(findDuplicates(n, [base], now)[0].kind, "similar_text");
assert.equal(findDuplicates({ ...n, hash: "abc" }, [base], now)[0].kind, "same_file");
assert.equal(findDuplicates({ ...n, neighbourhoodId: "b" }, [base], now).length, 0, "different area");
assert.equal(findDuplicates({ ...n, category: "flooding" }, [base], now).length, 0, "different category");
assert.equal(findDuplicates(n, [{ ...base, created_at: day(60) }], now).length, 0, "too old");
assert.equal(findDuplicates({ ...n, description: "Planted five trees along the canal bank" }, [base], now).length, 0, "unrelated text");
assert.equal(findDuplicates({ ...n, neighbourhoodId: "b", hash: "abc" }, [base], now)[0].kind, "same_file", "same file in any area");

const ok = { category: "flooding", description: "x".repeat(25), neighbourhoodId: "a" };
assert.equal(validateReport(ok, ["a"]).ok, true);
assert.equal(validateReport({ ...ok, category: "nope" }, ["a"]).ok, false);
assert.equal(validateReport({ ...ok, description: "short" }, ["a"]).ok, false);
assert.equal(validateReport({ ...ok, description: "x".repeat(1001) }, ["a"]).ok, false);
assert.equal(validateReport({ ...ok, neighbourhoodId: "zzz" }, ["a"]).ok, false);

assert.equal(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0])), "image/jpeg");
assert.equal(detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d])), "image/png");
assert.equal(detectImageType(new TextEncoder().encode("RIFF1234WEBPVP8 ")), "image/webp");
assert.equal(detectImageType(new TextEncoder().encode("<?php echo 1; ?>")), null);
assert.equal(validateResponse("too short").ok, false);
assert.equal(validateResponse("   ").ok, false);
assert.equal(validateResponse(42).ok, false);
assert.equal(validateResponse("x".repeat(501)).ok, false);
const okReply = validateResponse("  The photo was taken on Friday morning.  ");
assert.ok(okReply.ok && okReply.message === "The photo was taken on Friday morning.", "reply is trimmed");
console.log("reports/duplicates: all assertions passed");
