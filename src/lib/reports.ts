export const CATEGORIES = {
  blocked_drainage: "Blocked drainage",
  flooding: "Flooding observation",
  tree_planting: "Tree planting",
  cleanup: "Community clean-up",
  other: "Other climate action",
} as const;
export type Category = keyof typeof CATEGORIES;

export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const DESC_MIN = 20;
export const DESC_MAX = 1000;

export type ReportInput = { category: Category; description: string; neighbourhoodId: string };

export function validateReport(
  raw: { category: unknown; description: unknown; neighbourhoodId: unknown },
  validHoods: string[],
): { ok: true; value: ReportInput } | { ok: false; error: string } {
  const { category, neighbourhoodId } = raw;
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (typeof category !== "string" || !(category in CATEGORIES)) return { ok: false, error: "Choose a report category." };
  if (typeof neighbourhoodId !== "string" || !validHoods.includes(neighbourhoodId)) return { ok: false, error: "Choose a supported neighbourhood." };
  if (description.length < DESC_MIN) return { ok: false, error: `Describe what you saw or did in at least ${DESC_MIN} characters.` };
  if (description.length > DESC_MAX) return { ok: false, error: `Keep the description under ${DESC_MAX} characters.` };
  return { ok: true, value: { category: category as Category, description, neighbourhoodId } };
}

/** Checks real file signatures, not just the browser-supplied type. */
export function detectImageType(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const s = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (b.length > 12 && s(0, 4) === "RIFF" && s(8, 12) === "WEBP") return "image/webp";
  return null;
}

export const RESPONSE_MIN = 10;
export const RESPONSE_MAX = 500;
export function validateResponse(raw: unknown): { ok: true; message: string } | { ok: false; error: string } {
  const message = typeof raw === "string" ? raw.trim() : "";
  if (message.length < RESPONSE_MIN) return { ok: false, error: `Please write at least ${RESPONSE_MIN} characters.` };
  if (message.length > RESPONSE_MAX) return { ok: false, error: `Keep the reply under ${RESPONSE_MAX} characters.` };
  return { ok: true, message };
}
