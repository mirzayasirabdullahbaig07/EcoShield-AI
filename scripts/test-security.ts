import assert from "node:assert/strict";
import { decode, encode } from "../src/lib/session";
import { passcodeOk } from "../src/lib/passcode";
import { memoryHit } from "../src/lib/ratelimit";
import { DEFAULT_PREFS, parsePrefs, serializePrefs } from "../src/lib/prefs";
import { canSeeEvidence } from "../src/lib/reports-db";

process.env.SESSION_SECRET = "unit-test-secret";
const sid = "a".repeat(32);

// signed session cookie
const t = encode({ role: "reviewer", name: "Demo Reviewer", sid });
assert.deepEqual(decode(t), { role: "reviewer", name: "Demo Reviewer", sid });
assert.equal(decode(undefined), null);
assert.equal(decode("garbage"), null);
assert.equal(decode(t.slice(0, -2) + "xx"), null, "tampered signature rejected");
const [payload] = t.split(".");
const forged = Buffer.from(JSON.stringify({ role: "reviewer", name: "x", sid })).toString("base64url");
assert.equal(decode(`${forged}.${t.split(".")[1]}`), null, "payload swapped under an old signature is rejected");
assert.notEqual(forged, payload);
const noSid = Buffer.from(JSON.stringify({ role: "citizen", name: "x" })).toString("base64url");
process.env.SESSION_SECRET = "unit-test-secret";
assert.equal(decode(`${noSid}.whatever`), null, "cookies without a session id are rejected");
process.env.SESSION_SECRET = "another-secret";
assert.equal(decode(t), null, "a cookie signed with a different secret is rejected");
process.env.SESSION_SECRET = "unit-test-secret";

// reviewer passcode
assert.equal(passcodeOk("open-sesame", "open-sesame"), true);
assert.equal(passcodeOk("open-sesame ", "open-sesame"), false);
assert.equal(passcodeOk("", "open-sesame"), false);
assert.equal(passcodeOk("anything", ""), false, "an empty expected passcode never matches");

// evidence access: reviewers and the owning session only
const rep = { author_session: "owner" };
assert.equal(canSeeEvidence(rep, { role: "reviewer", sid: "x" }), true);
assert.equal(canSeeEvidence(rep, { role: "citizen", sid: "owner" }), true);
assert.equal(canSeeEvidence(rep, { role: "citizen", sid: "someone-else" }), false);
assert.equal(canSeeEvidence({ author_session: null }, { role: "citizen", sid: "" }), false, "reports without an owner are hidden from citizens");
assert.equal(canSeeEvidence({}, { role: "", sid: "" }), false);

// rate limiter (memory fallback)
const store = new Map<string, { start: number; hits: number }>();
const r = [0, 1, 2, 3, 4].map(() => memoryHit(store, "k", 1000, 3, 60_000));
assert.deepEqual(r.map((x) => x.ok), [true, true, true, false, false]);
assert.ok(r[3].retryAfter >= 1 && r[3].retryAfter <= 60);
assert.equal(memoryHit(store, "other", 1000, 3, 60_000).ok, true, "keys are independent");
assert.equal(memoryHit(store, "k", 1000 + 60_001, 3, 60_000).ok, true, "window resets");

// preferences cookie
assert.deepEqual(parsePrefs(undefined), DEFAULT_PREFS);
assert.deepEqual(parsePrefs("%7Bnot-json"), DEFAULT_PREFS);
const p = parsePrefs(serializePrefs({ area: "gulberg-lahore", motion: "off", size: "large" }), ["gulberg-lahore"]);
assert.deepEqual(p, { area: "gulberg-lahore", motion: "off", size: "large" });
assert.equal(parsePrefs(serializePrefs({ area: "evil", motion: "off", size: "normal" }), ["gulberg-lahore"]).area, null, "unknown areas are dropped");
assert.equal(parsePrefs(encodeURIComponent(JSON.stringify({ motion: "<script>", size: 9 }))).motion, "on");
console.log("security: all assertions passed");
