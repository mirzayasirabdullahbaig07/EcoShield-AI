export type Prefs = { area: string | null; motion: "on" | "off"; size: "normal" | "large" };
export const PREFS_COOKIE = "es_prefs";
export const DEFAULT_PREFS: Prefs = { area: null, motion: "on", size: "normal" };

/** Reads the (non-sensitive) preferences cookie. Anything unexpected falls back to the defaults. */
export function parsePrefs(raw: string | undefined | null, validAreas: string[] | null = null): Prefs {
  if (!raw) return { ...DEFAULT_PREFS };
  try {
    const o = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    return {
      area: typeof o.area === "string" && (validAreas === null || validAreas.includes(o.area)) ? o.area : null,
      motion: o.motion === "off" ? "off" : "on",
      size: o.size === "large" ? "large" : "normal",
    };
  } catch { return { ...DEFAULT_PREFS }; }
}
export const serializePrefs = (p: Prefs) => encodeURIComponent(JSON.stringify(p));
