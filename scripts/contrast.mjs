// WCAG contrast check of the palette pairs actually used in the UI. Run: node scripts/contrast.mjs
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const C = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k, v]));
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = ([r, g, b]) => { const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const blend = (fg, bg, a) => fg.map((v, i) => Math.round(v * a + bg[i] * (1 - a)));
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const c = (n) => rgb(C[n]);
const WHITE = [255, 255, 255];

// [label, text colour, background colour, minimum ratio]
const pairs = [
  ["ink on paper", c("ink"), c("paper"), 4.5], ["ink on card", c("ink"), c("card"), 4.5],
  ["muted on paper", c("muted"), c("paper"), 4.5], ["muted on card", c("muted"), c("card"), 4.5], ["muted on tint", c("muted"), c("tint"), 4.5],
  ["white on brand (buttons)", WHITE, c("brand"), 4.5], ["white on brand-dark", WHITE, c("brand-dark"), 4.5],
  ["white 80% on brand-dark (CTA text)", blend(WHITE, c("brand-dark"), 0.8), c("brand-dark"), 4.5],
  ["brand on card (links)", c("brand"), c("card"), 4.5], ["brand on paper (links)", c("brand"), c("paper"), 4.5], ["brand on tint (links)", c("brand"), c("tint"), 4.5],
  ["brand-dark on brand-soft", c("brand-dark"), c("brand-soft"), 4.5], ["brand on brand-soft (badge)", c("brand"), c("brand-soft"), 4.5],
  ["brand on white at 15% (active nav)", c("brand"), blend(c("brand"), c("card"), 0.1), 4.5],
  ...["high", "med", "low"].flatMap((k) => [
    [`risk-${k} on card`, c(`risk-${k}`), c("card"), 4.5],
    [`risk-${k} on its 10% tint`, c(`risk-${k}`), blend(c(`risk-${k}`), c("card"), 0.1), 4.5],
  ]),
  ["risk-med on paper", c("risk-med"), c("paper"), 4.5], ["risk-high on paper", c("risk-high"), c("paper"), 4.5],
  ["white on brand (selected chips)", WHITE, c("brand"), 4.5],
];
let bad = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg); const ok = r >= min; if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}  (need ${min})  ${label}`);
}
console.log(bad ? `\n${bad} pair(s) below WCAG AA` : "\nAll pairs meet WCAG AA (4.5:1)");
process.exit(bad ? 1 : 0);
