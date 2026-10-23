import { BoxGeometry, BufferGeometry, Color, CylinderGeometry, Float32BufferAttribute, SphereGeometry } from "three";

export const box = (w: number, h: number, d: number, x = 0, y = 0, z = 0) => new BoxGeometry(w, h, d).translate(x, y, z);
export const cyl = (rt: number, rb: number, h: number, x = 0, y = 0, z = 0, seg = 10) => new CylinderGeometry(rt, rb, h, seg).translate(x, y, z);
export const wheel = (r: number, w: number, x: number, y: number, z: number) => new CylinderGeometry(r, r, w, 10).rotateZ(Math.PI / 2).translate(x, y, z);
export const ball = (r: number, x: number, y: number, z: number) => new SphereGeometry(r, 9, 7).translate(x, y, z);

/** Merges many small geometries into one, so a whole house costs a handful of draw calls instead of hundreds. */
export function merge(list: BufferGeometry[]): BufferGeometry | null {
  if (!list.length) return null;
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  let off = 0;
  for (const g of list) {
    const p = g.getAttribute("position"), n = g.getAttribute("normal"), ix = g.getIndex();
    for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); }
    if (ix) for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
    else for (let i = 0; i < p.count; i++) idx.push(i + off);
    off += p.count;
    g.dispose();
  }
  const out = new BufferGeometry();
  out.setAttribute("position", new Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new Float32BufferAttribute(nor, 3));
  out.setIndex(idx);
  return out;
}

export const COLOUR = {
  trim: "#efe8d6", glass: "#8db5cc", dark: "#3b3f44", roof: "#a8a396", lawn: "#9ccf86", stone: "#cbc4b0", trunk: "#6b4a2f", leaf: "#3f8f4f",
  sign: "#d64545", asphalt: "#5d6166", marks: "#f4f1e6", river: "#4f96d3", plinth: "#c9c1ab", car: ["#f2f2f0", "#b83a3a", "#6b7a8a"],
} as const;

/** Like merge(), but bakes a colour into every vertex so many differently coloured parts become ONE mesh and ONE draw call. */
export function mergeColoured(list: { geos: BufferGeometry[]; colour: string }[]): BufferGeometry | null {
  const parts: BufferGeometry[] = [], col: number[] = [];
  for (const { geos, colour } of list) {
    const m = merge(geos);
    if (!m) continue;
    const c = new Color(colour);
    for (let i = 0; i < m.getAttribute("position").count; i++) col.push(c.r, c.g, c.b);
    parts.push(m);
  }
  const out = merge(parts);
  out?.setAttribute("color", new Float32BufferAttribute(col, 3));
  return out;
}
