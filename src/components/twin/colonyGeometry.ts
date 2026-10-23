import type { BufferGeometry } from "three";
import { COLS, DX, DZ, LOT_D, LOT_W, RIVER, ROWS, SCALE, colX, rng, rowZ } from "@/data/twin";
import { COLOUR, ball, box, cyl, mergeColoured, wheel } from "@/components/twin/geo";

export type ColonyPart = "asphalt" | "marks" | "stone" | "lawn" | "trunk" | "leaf" | "dark" | "trim" | "glass" | "river" | "plinth" | "car0" | "car1" | "car2";
export type Colony = { statics: BufferGeometry | null };

export const RW = 0.8; // road width
export const PARK_ELEVATION_M = 1.5;
export const PARK_BASE = PARK_ELEVATION_M * SCALE;
export const PARK_W = colX(3) - colX(2) + LOT_W;

let built: Colony | null = null;
/** Roads, lane markings, street trees and lights, the park, the river with its embankments and a bridge. Built once. */
export function getColony(): Colony {
  if (built) return built;
  const bag: Record<ColonyPart, BufferGeometry[]> = { asphalt: [], marks: [], stone: [], lawn: [], trunk: [], leaf: [], dark: [], trim: [], glass: [], river: [], plinth: [], car0: [], car1: [], car2: [] };
  const r = rng(11);
  const x0 = colX(0) - DX / 2, x1 = colX(COLS - 1) + DX / 2, zA = rowZ(0) - DZ / 2, zB = rowZ(ROWS - 1) + DZ / 2;
  const xs = Array.from({ length: COLS + 1 }, (_, k) => x0 + k * DX), zs = Array.from({ length: ROWS + 1 }, (_, k) => zA + k * DZ);
  const nearJunction = (v: number, list: number[]) => list.some((c) => Math.abs(v - c) < 0.65);

  for (const z of zs) bag.asphalt.push(box(x1 - x0 + RW, 0.04, RW, (x0 + x1) / 2, 0.02, z));
  for (const x of xs) bag.asphalt.push(box(RW, 0.04, zB - zA + RW, x, 0.02, (zA + zB) / 2));
  for (const z of zs) for (let t = x0 + 0.4; t < x1; t += 0.7) if (!nearJunction(t, xs)) bag.marks.push(box(0.3, 0.006, 0.04, t, 0.043, z));
  for (const x of xs) for (let t = zA + 0.4; t < zB; t += 0.7) if (!nearJunction(t, zs)) bag.marks.push(box(0.04, 0.006, 0.3, x, 0.043, t));

  // street trees and lights
  xs.forEach((x, k) => { for (let j = 0; j < ROWS; j++) {
    const tx = x + (j % 2 ? 0.55 : -0.55), tz = rowZ(j) + (r() - 0.5) * 0.6;
    bag.trunk.push(cyl(0.03, 0.04, 0.4, tx, 0.22, tz)); bag.leaf.push(ball(0.27, tx, 0.62, tz), ball(0.2, tx + 0.12, 0.52, tz + 0.08));
    if (k % 2 === 1 && j % 2 === 0) { const lz = rowZ(j) + 1.0; bag.dark.push(cyl(0.015, 0.02, 0.8, x + 0.5, 0.4, lz), box(0.22, 0.02, 0.03, x + 0.4, 0.8, lz)); bag.trim.push(box(0.1, 0.04, 0.06, x + 0.3, 0.8, lz)); }
  } });

  // parked cars along the vertical roads
  const car = (v: 0 | 1 | 2, x: number, z: number) => {
    bag[`car${v}`].push(box(0.3, 0.1, 0.6, x, 0.1, z), box(0.26, 0.09, 0.3, x, 0.19, z - 0.03));
    bag.glass.push(box(0.28, 0.06, 0.32, x, 0.195, z - 0.03));
    bag.dark.push(wheel(0.055, 0.05, x - 0.15, 0.06, z - 0.2), wheel(0.055, 0.05, x + 0.15, 0.06, z - 0.2), wheel(0.055, 0.05, x - 0.15, 0.06, z + 0.2), wheel(0.055, 0.05, x + 0.15, 0.06, z + 0.2));
  };
  [[1, 0, 0], [2, 1, 1], [3, 2, 2], [4, 0, 0], [5, 2, 1], [2, 3, 0], [4, 3, 2]].forEach(([k, j, v]) => car(v as 0 | 1 | 2, xs[k] + 0.18, rowZ(j) + 0.9));

  // park in the gap left by two missing plots
  const pz = rowZ(2), pw = PARK_W;
  bag.plinth.push(box(pw, PARK_BASE, LOT_D, 0, PARK_BASE / 2, pz));
  bag.lawn.push(box(pw - 0.1, 0.03, LOT_D - 0.1, 0, PARK_BASE + 0.015, pz));
  bag.stone.push(box(pw - 0.1, 0.035, 0.3, 0, PARK_BASE + 0.02, pz), box(0.3, 0.035, LOT_D - 0.1, 0, PARK_BASE + 0.02, pz));
  [[-2.8, -1.0], [-2.3, 1.0], [-1.2, -1.1], [1.2, 1.1], [2.4, -0.9], [2.9, 1.0], [-3.1, 0.2]].forEach(([dx, dz]) => {
    bag.trunk.push(cyl(0.035, 0.045, 0.45, dx, PARK_BASE + 0.25, pz + dz)); bag.leaf.push(ball(0.3, dx, PARK_BASE + 0.72, pz + dz), ball(0.22, dx + 0.15, PARK_BASE + 0.6, pz + dz + 0.1));
  });
  bag.trim.push(box(0.4, 0.04, 0.12, -0.8, PARK_BASE + 0.1, pz + 0.45), box(0.4, 0.04, 0.12, 0.8, PARK_BASE + 0.1, pz - 0.45));
  [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]].forEach(([dx, dz]) => bag.dark.push(cyl(0.025, 0.025, 0.45, 1.8 + dx * 0.9, PARK_BASE + 0.25, pz + dz * 0.9)));
  bag.trim.push(box(0.8, 0.05, 0.8, 1.8, PARK_BASE + 0.5, pz));

  // river, embankments, bridge and the far bank
  const rz = RIVER.z, half = RIVER.w / 2, bx = xs[3];
  bag.river.push(box(80, 0.06, RIVER.w, 0, 0.03, rz));
  bag.stone.push(box(80, 0.3, 0.15, 0, 0.15, rz - half - 0.075), box(80, 0.3, 0.15, 0, 0.15, rz + half + 0.075));
  bag.asphalt.push(box(RW + 0.2, 0.1, RIVER.w + 1.4, bx, 0.2, rz));
  bag.trim.push(box(0.06, 0.2, RIVER.w + 1.4, bx - 0.5, 0.35, rz), box(0.06, 0.2, RIVER.w + 1.4, bx + 0.5, 0.35, rz));
  bag.lawn.push(box(80, 0.03, 4, 0, 0.015, rz + half + 2.4));
  for (let i = 0; i < 9; i++) { const tx = -14 + i * 3.4 + r(), tz = rz + half + 1.6 + r() * 1.5; bag.trunk.push(cyl(0.04, 0.05, 0.5, tx, 0.25, tz)); bag.leaf.push(ball(0.36, tx, 0.8, tz), ball(0.26, tx + 0.2, 0.68, tz + 0.1)); }

  const colourOf = (k: ColonyPart): string => (k.startsWith("car") ? COLOUR.car[Number(k[3])] : (COLOUR as unknown as Record<string, string>)[k]);
  const out: Colony = { statics: mergeColoured((Object.keys(bag) as ColonyPart[]).map((k) => ({ geos: bag[k], colour: colourOf(k) }))) };
  built = out;
  return out;
}
