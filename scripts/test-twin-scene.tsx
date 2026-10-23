// Renders the 3D scene graph with @react-three/test-renderer (no GPU, no browser).
// This checks that components mount, clicks select buildings and the water eases to the right height. It cannot check how it LOOKS.
import assert from "node:assert/strict";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { TwinWorld } from "../src/components/twin/TwinWorld";
import { BUILDINGS, SCALE } from "../src/data/twin";

(async () => {
  const picks: (string | null)[] = [];
  const hovers: (string | null)[] = [];
  const props = { layer: "flood" as const, waterM: 0, selectedId: null as string | null, hoveredId: null as string | null, onSelect: (id: string | null) => picks.push(id), onHover: (id: string | null) => hovers.push(id) };

  const r = await ReactThreeTestRenderer.create(<TwinWorld {...props} />);
  const groups = r.scene.findAll((n) => n.type === "Group" && String(n.props.name ?? "").startsWith("building-"));
  assert.equal(groups.length, BUILDINGS.length, "one group per building");

  const g = groups[0];
  let stopped = false;
  g.props.onClick?.({ stopPropagation: () => { stopped = true; } } as never);
  assert.deepEqual(picks, [BUILDINGS[0].id]); assert.ok(stopped, "click does not leak to the background");
  g.props.onPointerOver?.({ stopPropagation: () => {} } as never); g.props.onPointerOut?.({} as never);
  assert.deepEqual(hovers, [BUILDINGS[0].id, null]);

  const water = r.scene.find((n) => n.props.name === "scenario-water");
  await r.advanceFrames(2, 1 / 60);
  assert.equal(water.instance.visible, false, "no water at 0 m");

  await r.update(<TwinWorld {...props} waterM={2} />);
  await r.advanceFrames(240, 1 / 60);
  assert.ok(Math.abs(water.instance.position.y - 2 * SCALE) < 0.02, `water settles at 2 m (got ${water.instance.position.y})`);
  assert.equal(water.instance.visible, true);

  await r.update(<TwinWorld {...props} waterM={0} />);
  await r.advanceFrames(400, 1 / 60);
  assert.equal(water.instance.visible, false, "water drains away at 0 m");

  const before = r.scene.findAll((n) => n.type === "Mesh").length;
  await r.update(<TwinWorld {...props} selectedId={BUILDINGS[0].id} />);
  assert.equal(r.scene.findAll((n) => n.type === "Mesh").length, before + 1, "selection adds one outline mesh");
  await r.update(<TwinWorld {...props} layer="prep" />);
  // the landing-page variant must mount cleanly (its timing is checked in test-twin.ts; the test renderer has no running clock)
  const looped = await ReactThreeTestRenderer.create(<TwinWorld {...props} demoLoop />);
  assert.equal(looped.scene.findAll((n) => n.type === "Group" && String(n.props.name ?? "").startsWith("building-")).length, BUILDINGS.length);
  await looped.unmount();
  await r.unmount();
  console.log(`twin scene: all assertions passed (${groups.length} buildings, ${before} meshes)`);
})().catch((e) => { console.error(e); process.exit(1); });
