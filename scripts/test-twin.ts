import assert from "node:assert/strict";
import { BUILDINGS, MAX_WATER_M, RISK_THRESHOLDS, colourFor, demoWaterMetres, depthAt, riskOf } from "../src/data/twin";

assert.ok(BUILDINGS.length >= 20 && BUILDINGS.length <= 26, `building count ${BUILDINGS.length}`);
assert.equal(new Set(BUILDINGS.map((b) => b.id)).size, BUILDINGS.length, "unique ids");
assert.equal(new Set(BUILDINGS.map((b) => b.name)).size, BUILDINGS.length, "unique names");
for (const b of BUILDINGS) { assert.ok(b.elevation > 0.1 && b.elevation < MAX_WATER_M, `${b.name} elevation ${b.elevation}`); assert.ok(b.w > 0 && b.d > 0 && [1, 2, 3].includes(b.floors) && [0, 1, 2].includes(b.variant)); }
for (const r of ["high", "medium", "low"] as const) assert.ok(BUILDINGS.some((b) => riskOf(b.elevation) === r), `some ${r}`);
for (const p of ["prepared", "partial", "none"] as const) assert.ok(BUILDINGS.some((b) => b.prep === p), `some ${p}`);
assert.equal(riskOf(RISK_THRESHOLDS.high - 0.01), "high"); assert.equal(riskOf(RISK_THRESHOLDS.high), "medium");
assert.equal(riskOf(RISK_THRESHOLDS.medium - 0.01), "medium"); assert.equal(riskOf(RISK_THRESHOLDS.medium), "low");
const lowest = [...BUILDINGS].sort((a, b) => a.elevation - b.elevation)[0];
assert.equal(depthAt(lowest, 0), 0);
assert.equal(depthAt(lowest, lowest.elevation), 0, "water at ground level is not flooding");
assert.equal(depthAt(lowest, lowest.elevation + 1), 1);
assert.equal(BUILDINGS.filter((b) => depthAt(b, MAX_WATER_M) > 0).length, BUILDINGS.length, "max slider floods everything");
const flooded = (m: number) => BUILDINGS.filter((b) => depthAt(b, m) > 0).length;
assert.ok(flooded(1) <= flooded(2) && flooded(2) <= flooded(3), "flooding grows with the water level");
assert.notEqual(colourFor(lowest, "flood"), colourFor(lowest, "prep"));
assert.equal(demoWaterMetres(0), 0, "demo loop starts dry");
assert.ok(Math.abs(demoWaterMetres(Math.PI / 0.35) - 2.4) < 1e-9, "peaks at 2.4 m");
assert.ok(Array.from({ length: 500 }, (_, i) => demoWaterMetres(i * 0.1)).every((m) => m >= -1e-9 && m <= MAX_WATER_M), "stays within the slider range");
assert.ok(Math.abs(demoWaterMetres(2 * Math.PI / 0.35)) < 1e-9, "recedes to dry, then repeats");
console.log(`twin data: all assertions passed (${BUILDINGS.length} buildings; flooded at 1 m: ${flooded(1)}, 2 m: ${flooded(2)}, 3 m: ${flooded(3)})`);
