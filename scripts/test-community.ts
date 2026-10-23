import assert from "node:assert/strict";
import { journeySteps, statusCounts, type Status } from "../src/lib/community";

const c = statusCounts([{ status: "pending" }, { status: "approved" }, { status: "registered" }, { status: "registered" }, { status: "rejected" }, { status: "needs_info" }]);
assert.deepEqual(c, { total: 6, pending: 1, needs_info: 1, approved: 1, rejected: 1, registered: 2 });
assert.equal(statusCounts([]).total, 0);

const st = (s: Status, chain: { confirmed: boolean } | null = null) => journeySteps({ status: s }, chain).map((x) => x.state);
assert.deepEqual(st("pending"), ["done", "current", "todo", "todo"]);
assert.deepEqual(st("approved"), ["done", "done", "current", "todo"]);
assert.deepEqual(st("approved", { confirmed: false }), ["done", "done", "current", "todo"]);
assert.match(journeySteps({ status: "approved" }, { confirmed: false })[2].detail, /waiting for confirmation/i);
assert.match(journeySteps({ status: "approved" }, null)[2].detail, /ready to register/i);
assert.deepEqual(st("registered", { confirmed: true }), ["done", "done", "done", "done"]);
assert.deepEqual(st("rejected"), ["done", "failed", "todo", "todo"]);
assert.deepEqual(st("needs_info"), ["done", "current", "todo", "todo"]);
assert.match(journeySteps({ status: "needs_info" }, null)[1].detail, /more information/i);
assert.equal(journeySteps({ status: "rejected" }, null)[2].detail, "Not applicable");
assert.ok(journeySteps({ status: "pending" }, null).every((s) => s.label && s.detail && s.key));
console.log("community: all assertions passed");
