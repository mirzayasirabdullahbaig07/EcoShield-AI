// SIMULATED demo neighbourhood. Layout, elevations and preparedness are made up for illustration; none of it is real data.
export type Layer = "flood" | "prep";
export type Risk = "high" | "medium" | "low";
export type Prep = "prepared" | "partial" | "none";
export type Building = {
  id: string; name: string; kind: "House" | "School" | "Clinic" | "Community hall";
  x: number; z: number; w: number; d: number; floors: number; variant: 0 | 1 | 2; elevation: number; prep: Prep;
};

export const SCALE = 0.35; // world units per metre of elevation or water
export const MAX_WATER_M = 4.5;
export const RISK_THRESHOLDS = { high: 1.2, medium: 2.6 } as const; // ground elevation in metres (simulated)

export const riskOf = (elevation: number): Risk =>
  elevation < RISK_THRESHOLDS.high ? "high" : elevation < RISK_THRESHOLDS.medium ? "medium" : "low";
export const depthAt = (b: Building, waterM: number) => Math.max(0, +(waterM - b.elevation).toFixed(2));

export const RISK_LABEL: Record<Risk, string> = { high: "High risk", medium: "Medium risk", low: "Low risk" };
export const PREP_LABEL: Record<Prep, string> = { prepared: "Prepared", partial: "Partly prepared", none: "Not started" };
const RISK_COLOUR: Record<Risk, string> = { high: "#e5484d", medium: "#f2a33a", low: "#3fa96b" };
const PREP_COLOUR: Record<Prep, string> = { prepared: "#2f7fc1", partial: "#8fb8de", none: "#c7bea6" };
export const tint = (hex: string, amount: number, toward = "#f1ebdc") => {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)), b = [1, 3, 5].map((i) => parseInt(toward.slice(i, i + 2), 16));
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, "0")).join("");
};
export const colourFor = (b: Building, layer: Layer) => (layer === "flood" ? RISK_COLOUR[riskOf(b.elevation)] : PREP_COLOUR[b.prep]);
export const LEGEND = {
  flood: (["high", "medium", "low"] as Risk[]).map((r) => ({ label: RISK_LABEL[r], colour: RISK_COLOUR[r] })),
  prep: (["prepared", "partial", "none"] as Prep[]).map((p) => ({ label: PREP_LABEL[p], colour: PREP_COLOUR[p] })),
};

export function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export const COLS = 6, ROWS = 4, DX = 4.2, DZ = 4.4;
export const LOT_W = 2.9, LOT_D = 3.1; // each plot, metres-ish world units
export const colX = (i: number) => (i - (COLS - 1) / 2) * DX;
export const rowZ = (j: number) => (j - (ROWS - 1) / 2) * DZ - 0.5;
const SPECIAL: Record<string, Building["kind"]> = { "2,1": "School", "4,2": "Clinic", "1,0": "Community hall" };
const PARK = new Set(["2,2", "3,2"]);

function build(): Building[] {
  const r = rng(2026);
  const out: Building[] = [];
  let n = 101;
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const key = `${i},${j}`;
    if (PARK.has(key)) continue;
    const kind = SPECIAL[key] ?? "House";
    const elevation = +(3.4 - j * 0.95 + (r() - 0.5) * 0.6).toFixed(2); // rows nearer the river (high j) sit lower
    const p = r(), f = r(), v = Math.floor(r() * 3) as 0 | 1 | 2;
    const house = kind === "House";
    out.push({
      id: `b${i}${j}`, name: house ? `House #${n++}` : kind, kind,
      x: +colX(i).toFixed(2), z: +rowZ(j).toFixed(2),
      w: house ? +(1.7 + r() * 0.3).toFixed(2) : kind === "Clinic" ? 2.2 : 2.5,
      d: house ? +(1.4 + r() * 0.2).toFixed(2) : kind === "Clinic" ? 1.6 : 1.75,
      floors: house ? (f < 0.2 ? 1 : f < 0.75 ? 2 : 3) : kind === "Community hall" ? 1 : 2,
      variant: v, elevation, prep: p < 0.4 ? "prepared" : p < 0.75 ? "partial" : "none",
    });
  }
  return out;
}
export const BUILDINGS: Building[] = build();

export const RIVER = { z: 10.9, w: 3.4 };

/** Landing-page demo: water level in metres at time t (seconds). Starts dry, peaks at 2.4 m, then recedes. */
export const demoWaterMetres = (t: number) => 2.4 * (0.5 - 0.5 * Math.cos(t * 0.35));
