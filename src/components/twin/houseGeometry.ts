import type { BufferGeometry } from "three";
import { LOT_D, LOT_W, type Building } from "@/data/twin";
import { COLOUR, ball, box, cyl, merge, mergeColoured, wheel } from "@/components/twin/geo";

export type PartName = "walls" | "band" | "trim" | "glass" | "dark" | "roof" | "lawn" | "stone" | "trunk" | "leaf" | "car" | "sign";
/** walls and band take the layer colour; statics holds every other part with colours baked in (one draw call). */
export type Parts = { walls: BufferGeometry | null; band: BufferGeometry | null; statics: BufferGeometry | null };
type Bag = Record<PartName, BufferGeometry[]>;
type Spec = Pick<Building, "kind" | "floors" | "w" | "d" | "variant">;

export const floorHeight = (kind: Building["kind"]) => (kind === "Community hall" ? 0.9 : 0.62);
export const houseHeight = (b: Spec) => b.floors * floorHeight(b.kind);
export const PARAPET = 0.14;
export const HOUSE_CZ = -0.45; // house sits toward the back of its plot; the front is yard, driveway and gate

const winFront = (bag: Bag, x: number, y: number, z: number) => {
  bag.dark.push(box(0.27, 0.33, 0.02, x, y, z + 0.01));
  bag.glass.push(box(0.21, 0.27, 0.02, x, y, z + 0.022));
  bag.trim.push(box(0.31, 0.03, 0.06, x, y - 0.18, z + 0.03));
};
const winSide = (bag: Bag, x: number, y: number, z: number, s: 1 | -1) => {
  bag.dark.push(box(0.02, 0.33, 0.27, x + s * 0.01, y, z));
  bag.glass.push(box(0.02, 0.27, 0.21, x + s * 0.022, y, z));
  bag.trim.push(box(0.06, 0.03, 0.31, x + s * 0.03, y - 0.18, z));
};

function build({ kind, floors, w, d, variant }: Spec): Parts {
  const bag: Bag = { walls: [], band: [], trim: [], glass: [], dark: [], roof: [], lawn: [], stone: [], trunk: [], leaf: [], car: [], sign: [] };
  const hall = kind === "Community hall";
  const fh = floorHeight(kind), H = floors * fh, cz = HOUSE_CZ, zf = cz + d / 2, hw = w / 2;

  // body, floor slabs, parapet and roof
  bag.walls.push(box(w, H, d, 0, H / 2, cz));
  for (let f = 1; f < floors; f++) bag.trim.push(box(w + 0.06, 0.05, d + 0.06, 0, f * fh, cz));
  bag.trim.push(box(w + 0.08, 0.05, d + 0.08, 0, 0.025, cz));
  const t = 0.05;
  bag.band.push(
    box(w + 0.06, PARAPET, t, 0, H + PARAPET / 2, cz + d / 2 + 0.005), box(w + 0.06, PARAPET, t, 0, H + PARAPET / 2, cz - d / 2 - 0.005),
    box(t, PARAPET, d + 0.06, hw + 0.005, H + PARAPET / 2, cz), box(t, PARAPET, d + 0.06, -hw - 0.005, H + PARAPET / 2, cz),
  );
  bag.roof.push(box(w - 0.02, 0.03, d - 0.02, 0, H + 0.015, cz));

  // windows on the front and both sides, one row per floor
  const nF = Math.max(2, Math.round(w / 0.55)), nS = Math.max(1, Math.round(d / 0.7));
  for (let f = 0; f < floors; f++) {
    const y = f * fh + fh * 0.56;
    for (let i = 0; i < nF; i++) {
      const x = -hw + ((i + 0.5) * w) / nF;
      if (f === 0 && Math.abs(x) < 0.3) continue; // leave room for the door
      winFront(bag, x, y, zf);
    }
    for (let i = 0; i < nS; i++) { const z = cz - d / 2 + ((i + 0.5) * d) / nS; winSide(bag, hw, y, z, 1); winSide(bag, -hw, y, z, -1); }
  }

  // door and porch (columned portico for the hall)
  bag.dark.push(box(0.2, 0.36, 0.03, 0, 0.18, zf + 0.015));
  if (hall) {
    for (let i = 0; i < 4; i++) bag.trim.push(cyl(0.05, 0.05, 0.8, -0.75 + i * 0.5, 0.4, zf + 0.4));
    bag.trim.push(box(2.0, 0.06, 0.5, 0, 0.83, zf + 0.35));
  } else {
    bag.trim.push(box(0.55, 0.04, 0.38, 0, 0.46, zf + 0.19), cyl(0.025, 0.025, 0.46, -0.23, 0.23, zf + 0.34), cyl(0.025, 0.025, 0.46, 0.23, 0.23, zf + 0.34));
  }
  // glass-railed balcony on the first floor
  if (floors >= 2 && variant !== 1 && kind === "House") {
    const bw = w * 0.5;
    bag.trim.push(box(bw, 0.04, 0.3, 0, fh + 0.02, zf + 0.15), box(0.04, 0.2, 0.04, -bw / 2, fh + 0.14, zf + 0.3), box(0.04, 0.2, 0.04, bw / 2, fh + 0.14, zf + 0.3));
    bag.glass.push(box(bw, 0.18, 0.015, 0, fh + 0.14, zf + 0.3));
  }
  // rooftop water tanks, stair housing and an AC unit
  if (kind === "House" && variant !== 1) {
    const ty = H + PARAPET, tx = -w * 0.25, tz = cz - d * 0.25;
    bag.dark.push(cyl(0.1, 0.1, 0.22, tx, ty + 0.17, tz), cyl(0.1, 0.1, 0.22, tx + 0.24, ty + 0.17, tz), box(0.1, 0.17, 0.02, w * 0.28, ty + 0.09, cz - d * 0.2 + 0.165));
    bag.trim.push(box(0.5, 0.06, 0.28, tx + 0.12, ty + 0.03, tz), box(0.14, 0.1, 0.1, w * 0.3, ty + 0.05, cz + d * 0.3));
    bag.walls.push(box(0.32, 0.26, 0.32, w * 0.28, ty + 0.13, cz - d * 0.2));
  }
  if (kind === "School") {
    bag.dark.push(cyl(0.012, 0.012, 0.7, hw - 0.15, H + PARAPET + 0.35, zf - 0.2));
    bag.sign.push(box(0.26, 0.15, 0.01, hw - 0.01, H + PARAPET + 0.62, zf - 0.2));
  }
  if (kind === "Clinic") bag.sign.push(box(0.26, 0.07, 0.015, 0, H - 0.2, zf + 0.012), box(0.07, 0.26, 0.015, 0, H - 0.2, zf + 0.012));

  // boundary wall with a gate, lawn, driveway, car and a tree
  const hx = LOT_W / 2 - 0.03, hz = LOT_D / 2 - 0.03, wh = 0.18, gap = 0.55, seg = (LOT_W - 0.06 - gap) / 2;
  bag.stone.push(
    box(0.05, wh, LOT_D - 0.06, -hx, wh / 2, 0), box(0.05, wh, LOT_D - 0.06, hx, wh / 2, 0), box(LOT_W - 0.06, wh, 0.05, 0, wh / 2, -hz),
    box(seg, wh, 0.05, -(gap / 2 + seg / 2), wh / 2, hz), box(seg, wh, 0.05, gap / 2 + seg / 2, wh / 2, hz),
    box(0.08, 0.26, 0.08, -gap / 2, 0.13, hz), box(0.08, 0.26, 0.08, gap / 2, 0.13, hz), box(0.62, 0.032, 0.95, 0, 0.016, 1.05),
  );
  bag.dark.push(box(gap - 0.08, 0.14, 0.02, 0, 0.1, hz));
  bag.lawn.push(box(LOT_W - 0.2, 0.025, 0.95, 0, 0.0125, 1.05));
  bag.car.push(box(0.34, 0.1, 0.62, 0, 0.11, 1.08), box(0.3, 0.09, 0.32, 0, 0.2, 1.03));
  bag.glass.push(box(0.32, 0.06, 0.34, 0, 0.205, 1.03));
  bag.dark.push(wheel(0.06, 0.05, -0.18, 0.06, 0.9), wheel(0.06, 0.05, 0.18, 0.06, 0.9), wheel(0.06, 0.05, -0.18, 0.06, 1.26), wheel(0.06, 0.05, 0.18, 0.06, 1.26));
  bag.trunk.push(cyl(0.03, 0.04, 0.38, 1.0, 0.19, 1.05));
  bag.leaf.push(ball(0.26, 1.0, 0.6, 1.05), ball(0.19, 1.17, 0.5, 1.1), ball(0.17, 0.85, 0.52, 0.97));

  const staticParts: PartName[] = ["trim", "glass", "dark", "roof", "lawn", "stone", "trunk", "leaf", "sign"];
  const statics = mergeColoured([
    ...staticParts.map((k) => ({ geos: bag[k], colour: COLOUR[k as keyof typeof COLOUR] as string })),
    { geos: bag.car, colour: COLOUR.car[variant] },
  ]);
  return { walls: merge(bag.walls), band: merge(bag.band), statics };
}

const cache = new Map<string, Parts>();
/** Geometry is built once per house type and shared by every house of that type. */
export function getHouseParts(b: Spec): Parts {
  const key = `${b.kind}|${b.floors}|${b.w}|${b.d}|${b.variant}`;
  let p = cache.get(key);
  if (!p) { p = build(b); cache.set(key, p); }
  return p;
}

let frame: BufferGeometry | null = null;
/** Outline drawn around the selected plot. */
export function getLotFrame(): BufferGeometry {
  if (!frame) {
    const e = 0.05;
    frame = merge([
      box(LOT_W + 2 * e, 0.06, 0.08, 0, 0.03, LOT_D / 2 + e), box(LOT_W + 2 * e, 0.06, 0.08, 0, 0.03, -LOT_D / 2 - e),
      box(0.08, 0.06, LOT_D + 2 * e, LOT_W / 2 + e, 0.03, 0), box(0.08, 0.06, LOT_D + 2 * e, -LOT_W / 2 - e, 0.03, 0),
    ])!;
  }
  return frame;
}
