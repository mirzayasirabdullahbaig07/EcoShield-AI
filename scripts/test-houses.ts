import assert from "node:assert/strict";
import { Box3 } from "three";
import { BUILDINGS, LOT_D, LOT_W, RIVER } from "../src/data/twin";
import { getHouseParts, getLotFrame, houseHeight } from "../src/components/twin/houseGeometry";
import { getColony } from "../src/components/twin/colonyGeometry";

const must = ["walls", "band", "statics"] as const;
let tris = 0;
for (const b of BUILDINGS) {
  const parts = getHouseParts(b);
  const bb = new Box3();
  for (const k of must) assert.ok(parts[k], `${b.name} has ${k}`);
  for (const [k, g] of Object.entries(parts)) {
    if (!g) continue;
    const pos = g.getAttribute("position").array as Float32Array;
    assert.ok(pos.every(Number.isFinite), `${b.name}.${k} has finite positions`);
    assert.ok(g.getAttribute("normal").count === g.getAttribute("position").count && g.getIndex(), `${b.name}.${k} has normals and indices`);
    g.computeBoundingBox(); bb.union(g.boundingBox!); tris += (g.getIndex()!.count) / 3;
  }
  assert.ok(bb.min.x >= -LOT_W / 2 - 0.02 && bb.max.x <= LOT_W / 2 + 0.02, `${b.name} fits the plot width (${bb.min.x.toFixed(2)}..${bb.max.x.toFixed(2)})`);
  assert.ok(bb.min.z >= -LOT_D / 2 - 0.02 && bb.max.z <= LOT_D / 2 + 0.02, `${b.name} fits the plot depth (${bb.min.z.toFixed(2)}..${bb.max.z.toFixed(2)})`);
  assert.ok(bb.min.y >= -0.001 && bb.max.y < houseHeight(b) + 1.3, `${b.name} height is sane`);
  assert.equal(parts.statics!.getAttribute("color").count, parts.statics!.getAttribute("position").count, `${b.name} has a colour per vertex`);
}
assert.equal(getHouseParts(BUILDINGS[0]), getHouseParts({ ...BUILDINGS[0] }), "geometry is cached per house type");
assert.ok(getLotFrame().getAttribute("position").count > 0);

const c = getColony();
assert.ok(c.statics, "colony exists");
const all = c.statics!; all.computeBoundingBox();
assert.equal(all.getAttribute("color").count, all.getAttribute("position").count);
assert.ok(all.boundingBox!.max.z > RIVER.z && all.boundingBox!.max.x < 45 && all.boundingBox!.min.x > -45, "colony stays inside the ground plane");
const draws = BUILDINGS.length * 4 + 3;
console.log(`houses: all assertions passed (${BUILDINGS.length} houses, ~${Math.round(tris)} triangles in shared geometry, ~${draws} draw calls)`);
