// Automated accessibility scan (axe-core on server-rendered HTML). Run: BASE_URL=http://localhost:3000 node scripts/a11y.mjs
// Limits: it cannot check colour contrast (see contrast.mjs), keyboard flow, screen-reader wording or the 3D canvas.
import { JSDOM } from "jsdom";
import axe from "axe-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const login = await fetch(`${BASE}/api/auth/demo`, { method: "POST", body: new URLSearchParams({ role: "reviewer", passcode: process.env.REVIEWER_PASSCODE ?? "" }), redirect: "manual" });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
if (!cookie) { console.error("Could not log in to the demo (is the server running?)"); process.exit(2); }

const pages = ["/", "/login", "/verify", "/verify/CS-2026-0001", "/dashboard", "/reports", "/reports/new", "/review", "/assistant", "/twin", "/risks", "/profile", "/about", "/resources", "/privacy", "/terms"];
let violations = 0;
for (const path of pages) {
  const res = await fetch(BASE + path, { headers: { cookie } });
  const html = await res.text();
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.eval(axe.source);
  const out = await dom.window.axe.run(dom.window.document, { rules: { "color-contrast": { enabled: false } } });
  console.log(`${out.violations.length ? "FAIL" : "ok  "} ${path} (HTTP ${res.status}, ${out.passes.length} rules passed)`);
  for (const v of out.violations) { violations++; console.log(`   - [${v.impact}] ${v.id}: ${v.help}\n     ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`); }
}
console.log(violations ? `\n${violations} violation(s)` : "\nNo automated violations found");
process.exit(violations ? 1 : 0);
