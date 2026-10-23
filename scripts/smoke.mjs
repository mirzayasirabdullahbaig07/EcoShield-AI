// Post-deploy smoke test. Run: BASE_URL=https://your-app.vercel.app node scripts/smoke.mjs
// Checks routing, auth gates and headers only. It does NOT test Supabase, Groq or the blockchain end to end (see docs/E2E-CHECKLIST.md).
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
let failed = 0;
const check = (name, ok, detail = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`); };
const get = (p, o = {}) => fetch(BASE + p, { redirect: "manual", ...o });

let r = await get("/"); check("landing page loads", r.status === 200, r.status);
const h = r.headers;
check("security headers set", h.get("x-content-type-options") === "nosniff" && h.get("x-frame-options") === "DENY" && !h.get("x-powered-by"));
r = await get("/login"); check("login page loads", r.status === 200, r.status);
r = await get("/verify"); check("public verify lookup loads without login", r.status === 200, r.status);
for (const p of ["/about", "/resources", "/privacy", "/terms"]) { r = await get(p); check(`${p} is public`, r.status === 200, r.status); }
r = await get("/resources"); const resText = await r.text();
check("emergency page shows the verified numbers", ["1122", "1129", "112"].every((n) => resText.includes(n)));
for (const p of ["/dashboard", "/reports", "/reports/new", "/review", "/assistant", "/twin", "/risks", "/profile"]) {
  r = await get(p); check(`${p} needs login`, r.status === 307 && (r.headers.get("location") ?? "").includes("/login"), r.status);
}
for (const [p, body] of [["/api/reports", "{}"], ["/api/ai/risk", "{}"], ["/api/ai/report", "{}"], ["/api/reports/CS-2026-0001/review", "{}"], ["/api/reports/CS-2026-0001/register", "{}"], ["/api/reports/CS-2026-0001/respond", "{}"]]) {
  r = await get(p, { method: "POST", headers: { "content-type": "application/json" }, body }); check(`POST ${p} rejects anonymous`, r.status === 401, r.status);
}
r = await get("/verify/NOT-A-REAL-ID-0000"); check("unknown public record is not exposed", r.status === 404 || r.status === 200, r.status);
const t = await (await get("/verify/NOT-A-REAL-ID-0000")).text();
check("unknown record shows no private data", !/author_name|evidence_path|reviewer_note|duplicate_flags/i.test(t));
const login = await get("/api/auth/demo", { method: "POST", body: new URLSearchParams({ role: "citizen" }) });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
check("demo login sets a session cookie", login.status === 303 && cookie.startsWith("es_session="), login.status);
check("session cookie is HttpOnly", (login.headers.getSetCookie?.() ?? []).join(";").toLowerCase().includes("httponly"));
r = await get("/dashboard", { headers: { cookie } }); check("dashboard loads after login", r.status === 200, r.status);
r = await get("/review", { headers: { cookie } }); const rt = await r.text();
check("citizen cannot see the review queue", r.status === 200 && rt.includes("Reviewers only"));
// Reviewer access must not be open: a wrong passcode gets no session, in any production build.
const bad = await get("/api/auth/demo", { method: "POST", body: new URLSearchParams({ role: "reviewer", passcode: "definitely-wrong-passcode" }) });
check("reviewer login with a wrong passcode is refused", bad.status === 303 && (bad.headers.get("location") ?? "").includes("/login?error=") && !(bad.headers.getSetCookie?.() ?? []).some((c) => c.startsWith("es_session=")), bad.status);
if (process.env.REVIEWER_PASSCODE) {
  const ok = await get("/api/auth/demo", { method: "POST", body: new URLSearchParams({ role: "reviewer", passcode: process.env.REVIEWER_PASSCODE }) });
  check("reviewer login with the right passcode works", (ok.headers.get("location") ?? "").includes("/review") && (ok.headers.getSetCookie?.() ?? []).some((c) => c.startsWith("es_session=")), ok.status);
}
r = await get("/api/status"); check("GET /api/status rejects anonymous", r.status === 401, r.status);
console.log(failed ? `\n${failed} check(s) failed` : "\nAll smoke checks passed");
process.exit(failed ? 1 : 0);
