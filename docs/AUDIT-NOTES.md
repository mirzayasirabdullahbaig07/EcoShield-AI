# EcoShield AI: Feature Audit (snapshot from 21 Oct 2026)

> This snapshot predates later work: reviewer passcode, rate limiting, private photo access, interactive profile, emergency/about/privacy/terms pages and the "request more information" review state were added afterwards. It is kept as an honest record of what was and was not verified at the time.

Method: read the repository, grepped for each capability, and ran the tests. **Complete** = implemented and a passing test or direct evidence exists. **Not Tested** = code exists but I have no test or observation of it working. Nothing is marked Complete on the strength of UI alone.

## Scorecard

| Section | Complete | Partial | Missing | Not Tested | Items |
|---|---|---|---|---|---|
| 1. Authentication & User Management | 2 | 3 | 0 | 0 | 5 |
| 2. Climate Intelligence Dashboard | 3 | 3 | 1 | 0 | 7 |
| 3. Interactive 2D Map | 0 | 1 | 6 | 0 | 7 |
| 4. Interactive 3D Climate Twin | 4 | 2 | 1 | 2 | 9 |
| 5. AI Climate Assistant | 8 | 2 | 0 | 0 | 10 |
| 6. Community Reporting System | 1 | 3 | 3 | 3 | 10 |
| 7. Evidence Management & Integrity | 4 | 4 | 0 | 1 | 9 |
| 8. Human Review & Admin Console | 0 | 7 | 2 | 1 | 10 |
| 9. Blockchain Verification | 10 | 0 | 0 | 3 | 13 |
| 10. Public Verification Portal | 3 | 0 | 0 | 5 | 8 |
| 11. Community Actions & Impact | 1 | 5 | 5 | 0 | 11 |
| 12. Scenario Lab & Prioritisation | 2 | 2 | 3 | 0 | 7 |
| 13. Notifications & Alerts | 0 | 1 | 6 | 0 | 7 |
| 14. Public Website & Information Pages | 3 | 3 | 2 | 0 | 8 |
| 15. UI/UX & Accessibility | 4 | 3 | 0 | 4 | 11 |
| 16. Backend, Database & Security | 5 | 4 | 1 | 0 | 10 |
| 17. Deployment & Reliability | 4 | 1 | 0 | 5 | 10 |
| 18. Testing & Final Delivery | 5 | 7 | 3 | 0 | 15 |
| **Total** | **59** | **51** | **33** | **24** | **167** |

## 1. Authentication & User Management

| Feature | Status | Evidence / note |
|---|---|---|
| Sign up and login | **Partial** | Login only, as shared demo roles (`api/auth/demo`). No sign-up, no passwords, no email. |
| Guest/demo mode | **Complete** | `/login` + signed HttpOnly cookie (`lib/session.ts`). Smoke test passes; forged-cookie rejection checked by hand earlier. |
| User profiles and settings | **Partial** | `/profile` shows account, storage notes, system status. Read-only, no settings, cards have no interaction (0 client code in the file). |
| Role-based access: Citizen, Reviewer, Admin | **Partial** | Citizen + Reviewer only; no Admin. **Anyone can choose Reviewer with no credential** (probed: HTTP 303 success). |
| Protected routes and permissions | **Complete** | Layout redirect + API checks. Smoke: every private page 307 to /login, every private API 401 anonymous, citizen sees 'Reviewers only'. |

## 2. Climate Intelligence Dashboard

| Feature | Status | Evidence / note |
|---|---|---|
| Climate risk overview | **Complete** | `/dashboard`, `/risks`; real Open-Meteo data seen in your screenshots; parsing/indicator unit-tested. |
| Flood and extreme-heat information | **Partial** | Rainfall + river discharge only. No heat/temperature data anywhere in `src`. |
| Location selection and search | **Partial** | 3 fixed neighbourhood chips. No search, no arbitrary location. |
| Data sources and last-updated timestamps | **Complete** | `DataSourceTag` on dashboard/risks; Open-Meteo attribution. |
| Risk explanations and uncertainty indicators | **Complete** | Indicator rule text, forecast-uncertainty notes, AI explanation with 'not an official warning'. |
| Personalised preparedness recommendations | **Partial** | AI checklist depends on neighbourhood and forecast, not on the user's home or profile. |
| Official alerts and emergency resources | **Missing** | No NDMA/PDMA/rescue-service links or numbers. Only disclaimers. |

## 3. Interactive 2D Map

| Feature | Status | Evidence / note |
|---|---|---|
| Interactive neighbourhood map | **Missing** | No map library in the project (no Leaflet/MapLibre). |
| Location search and selection | **Missing** | Chips only. |
| Buildings, roads and report markers | **Missing** | Exist only inside the simulated 3D scene; no report markers anywhere. |
| Risk layers and map legends | **Missing** | Layers + legend exist in the 3D view only. |
| Report clustering and filtering | **Missing** | Status filter exists on the reports list, not on a map. |
| Selected-location details | **Missing** | 3D side panel only. |
| Mobile-friendly map/list fallback | **Partial** | 3D has a list fallback; there is no 2D map to fall back from. |

## 4. Interactive 3D Climate Twin

| Feature | Status | Evidence / note |
|---|---|---|
| 3D neighbourhood with buildings, roads and trees | **Complete** | `TwinWorld`, `houseGeometry`, `colonyGeometry`; geometry + scene tests pass; your screenshot shows it rendering. |
| Clickable buildings and locations | **Complete** | Scene test: click selects, does not leak to background; your screenshot shows a selected building. |
| Building information side panel | **Complete** | `TwinExplorer`; seen in your screenshot. |
| Flood-risk and heat-risk visualisation | **Partial** | Flood-risk and preparedness layers. No heat layer. |
| Flood scenario simulation | **Complete** | Slider, eased water, flooded count; `test-twin*` pass. Labelled simulated. |
| Before/after scenario comparison | **Missing** | Not implemented. |
| Risk and report overlays | **Partial** | Risk colours yes; reports are not linked to buildings. |
| Camera controls and smooth animations | **Not Tested** | OrbitControls + water easing in code; smoothness/frame rate never measured (no GPU here). |
| Responsive performance and 2D fallback | **Not Tested** | List view exists; frame rate and phone performance never measured. |

## 5. AI Climate Assistant

| Feature | Status | Evidence / note |
|---|---|---|
| Climate information explanations | **Complete** | `/api/ai/risk`; validators, prompts, mocked-fetch tests pass. Live Groq call not observed by me. |
| Preparedness checklists | **Complete** | Schema-validated checklist; demo fallback tested. |
| Personalised recommendations | **Partial** | Area/forecast-specific only. |
| Community report summarisation | **Complete** | `/api/ai/report`; validators + demo tested; needs DB so route not run here. |
| Missing-information detection | **Complete** | `missing` field in prompt/schema and demo logic (tested). |
| Contradiction and anomaly warnings | **Partial** | Relies on the model's `concerns`; no deterministic contradiction checker. |
| Similar-report detection | **Complete** | `duplicates.ts` unit-tested (text similarity, same file hash, area/category/30-day window). |
| Explainable AI outputs and limitations | **Complete** | `why` list, advisory labels, 'reads text only' notice. |
| Secure API integration | **Complete** | Key read only in server code; 0 secret names in client bundle; key only in Authorization header (tested). |
| Error handling and demo fallback | **Complete** | 429, bad JSON, empty, 500, no-key cases tested; labelled demo mode. |

## 6. Community Reporting System

| Feature | Status | Evidence / note |
|---|---|---|
| Report blocked drains, flooding and environmental problems | **Not Tested** | Form + route + validation exist; validation tested; DB write path never run here. |
| Submit community climate actions | **Not Tested** | Same form (tree planting, clean-up); same caveat. |
| Report descriptions, categories and locations | **Partial** | Validated; location is neighbourhood-level only (no pin/address). |
| Photo/document evidence upload | **Partial** | JPEG/PNG/WebP only, 4 MB; no documents/PDF. Upload path untested (you hit a storage error earlier; fix applied, outcome unseen). |
| Report IDs and timestamps | **Not Tested** | `report_seq` default in `phase4.sql`; not verified live. |
| Report status tracking | **Complete** | Statuses + `journeySteps` (tested) + list filters. |
| Edit or withdraw reports where permitted | **Missing** | No edit/withdraw route or UI. |
| Comments or additional observations | **Missing** | No comments table, route or UI. |
| Duplicate reports linked to a shared incident | **Partial** | Warnings only; no incident entity or linking. |
| Resolution and completion evidence | **Missing** | No 'resolved' state or completion evidence. |

## 7. Evidence Management & Integrity

| Feature | Status | Evidence / note |
|---|---|---|
| Secure evidence storage | **Not Tested** | Private bucket via SQL/auto-create; never verified end to end. |
| File type and size validation | **Complete** | Signature check (`detectImageType`, tested) + 4 MB limit in UI and route. |
| SHA-256 evidence hashing | **Complete** | Server `createHash` in the upload route; browser hashing tested against Node. |
| Evidence metadata and timestamps | **Partial** | Hash + `created_at` stored; filename/MIME/size not stored. |
| Evidence preview for authorised reviewers | **Partial** | Signed URL (10 min) is shown to **any logged-in user**, not only reviewers. |
| Evidence integrity verification | **Complete** | `computeVerdict` + browser verifier; tests pass. |
| Modified-file detection | **Complete** | Hash mismatch paths tested (record, photo, no-photo). |
| Private evidence and public-access controls | **Partial** | Public page shows hash only, never the photo or author; but all demo users can view all evidence. |
| Evidence history and audit trail | **Partial** | `audit_events` for submit/review/register. No evidence-replacement history; actor is a role, not a person. |

## 8. Human Review & Admin Console

| Feature | Status | Evidence / note |
|---|---|---|
| Reviewer dashboard and pending queue | **Not Tested** | `/review` gating tested; queue content needs DB. |
| Evidence inspection | **Partial** | Report page shows photo + hash; untested live. |
| AI findings and warnings | **Partial** | On-demand analysis, not stored with the report. |
| Approve, reject or request more evidence | **Partial** | Approve/reject only; no 'request more evidence' state. |
| Reviewer identity and decision timestamp | **Partial** | `reviewed_at` stored; identity is the shared 'Demo Reviewer', audit stores `actor_role` only. |
| Duplicate and suspicious-report alerts | **Partial** | Duplicate alerts yes; no suspicious-pattern alerts. |
| Resolution verification | **Missing** | No resolution workflow. |
| Role-based permissions | **Partial** | Enforced server-side (403 for citizens), but the reviewer role is self-selectable (see Security). |
| Complete decision history | **Partial** | Note + timestamp + action; no reviewer identity. |
| Admin console (users, roles, settings) | **Missing** | Not implemented. |

## 9. Blockchain Verification

| Feature | Status | Evidence / note |
|---|---|---|
| Solidity smart contract | **Complete** | `contracts/src/ActionRegistry.sol`; 7 Hardhat tests pass. |
| EVM-compatible testnet integration | **Not Tested** | Passed on a LOCAL Hardhat chain; Sepolia never observed by me (you said Phase 6 completed). |
| Unique record IDs | **Complete** | Contract test: duplicate ID reverts. |
| Approved evidence hashes registered on-chain | **Complete** | Local-chain integration test passes (with and without photo hash). |
| Duplicate registration prevention | **Complete** | Contract + library test ('already registered'). |
| Transaction submission and confirmation status | **Not Tested** | Library tested locally; the DB state machine in `register/route.ts` (pending then registered) was never run. |
| Transaction hash and block information | **Not Tested** | `ChainCard` code; never rendered with real data. |
| Public record retrieval | **Complete** | `readRecord` tested locally; unknown IDs and unreachable RPC handled. |
| Evidence hash comparison | **Complete** | Verdict tests, plus on-chain vs recomputed hash in `ChainCard`/public page. |
| Tamper detection | **Complete** | Record/photo hash change tests produce 'mismatch'. |
| Blockchain failure handling | **Complete** | Wrong chain, bad RPC, timeouts tested; clear messages. |
| No false success messages | **Complete** | 'Verified' only for a confirmed tx whose hashes match (10 verdict cases tested). |
| No sensitive personal information stored on-chain | **Complete** | Only report ID + two hashes (contract + route code reviewed). |

## 10. Public Verification Portal

| Feature | Status | Evidence / note |
|---|---|---|
| Shareable public verification URLs | **Not Tested** | `/verify/[id]` loads without login (smoke); never rendered with a real record. |
| Public report ID and non-sensitive details | **Not Tested** | Code whitelist in `public-record.ts`; untested live. |
| Review and approval status | **Not Tested** | Same. |
| Evidence hash | **Not Tested** | Same. |
| Blockchain transaction details | **Not Tested** | Same. |
| Independent evidence-integrity check | **Complete** | Browser SHA-256 check; hash logic tested. |
| Clear verified, failed or unavailable states | **Complete** | Five verdict states, all tested. |
| Privacy-safe public records | **Complete** | Field whitelist, redaction tests, smoke: unknown record leaks no private fields. |

## 11. Community Actions & Impact

| Feature | Status | Evidence / note |
|---|---|---|
| Browse community initiatives | **Missing** | Reports list only; no initiatives. |
| Join or submit climate actions | **Partial** | Submit as reports; no joining. |
| Track action completion | **Missing** | No completion state. |
| Completion evidence | **Missing** | No. |
| Community activity feed | **Partial** | 'Recent community actions' cards on the dashboard (needs DB). |
| Area-wise issue statistics | **Missing** | Counts are global, not per area. |
| Reports submitted, approved and resolved | **Partial** | Submitted/approved/registered counts; no 'resolved'. |
| Average resolution time | **Missing** | No resolution timestamps. |
| Verified impact metrics | **Partial** | Counts of registered records only. |
| Charts and downloadable reports | **Partial** | Status bar + rain charts; no download/export. |
| No fabricated statistics or impact claims | **Complete** | All counts come from the DB; demo data is labelled. |

## 12. Scenario Lab & Prioritisation

| Feature | Status | Evidence / note |
|---|---|---|
| What-if flood scenarios | **Partial** | One water-level slider on the 3D page. |
| Adjustable illustrative scenario parameters | **Partial** | Water rise only. |
| Clear separation of simulations from real predictions | **Complete** | 'Simulated' tags and 'not a prediction' text on 3D, landing and profile. |
| Affected-building visualisation | **Complete** | Flooded count, per-building depth, water plane (tested). |
| Before/after comparisons | **Missing** | No. |
| Explainable community issue prioritisation | **Missing** | No scoring. |
| Severity and evidence-based review queue | **Missing** | Queue is newest-first only. |

## 13. Notifications & Alerts

| Feature | Status | Evidence / note |
|---|---|---|
| Relevant climate alerts | **Missing** | No alert engine. |
| Report submission confirmations | **Partial** | In-page banner after submit only. |
| Review status updates | **Missing** | Status visible on the page; no notification. |
| Requests for additional evidence | **Missing** | No. |
| Resolution notifications | **Missing** | No. |
| In-app notifications | **Missing** | No notifications table or UI. |
| Notification preferences | **Missing** | No. |

## 14. Public Website & Information Pages

| Feature | Status | Evidence / note |
|---|---|---|
| Professional landing page | **Complete** | Seen in your screenshots; a11y scan clean. |
| Product overview and how it works | **Complete** | Journey section on landing. |
| Feature explanations | **Complete** | Feature cards on landing. |
| Public community explorer | **Missing** | Only a record-ID lookup (`/verify`). |
| About and methodology | **Partial** | In README/Profile; no `/about` page. |
| Data sources and limitations | **Partial** | Profile + footers; no dedicated page. |
| Privacy policy and terms | **Missing** | None. |
| Signup/login pages | **Partial** | Login (demo) only. |

## 15. UI/UX & Accessibility

| Feature | Status | Evidence / note |
|---|---|---|
| Consistent premium dark navy and teal design | **Partial** | Deliberately changed to light ivory + forest green at your request; differs from this checklist. |
| Responsive desktop, tablet and mobile layouts | **Not Tested** | Responsive classes only; never viewed on a phone. |
| Reusable design system and components | **Complete** | `components/ui/*`, tokens in `globals.css`. |
| Functional buttons and forms | **Not Tested** | All wired (no 'Soon' items left); not exercised live. |
| Loading, empty, success and error states | **Complete** | Skeletons, EmptyState-style cards, ErrorState, success banners (code review). |
| Form validation | **Complete** | `validateReport` tests + client checks. |
| Accessible contrast and keyboard navigation | **Partial** | 23/23 WCAG pairs pass, axe clean on 12 pages; keyboard flow never manually tested. |
| Clear risk labels beyond colour alone | **Complete** | Icon + text in badges, legend and list view. |
| Smooth, purposeful animations | **Not Tested** | Present in code; not seen by me. |
| No broken links or placeholder pages | **Not Tested** | No link crawler run; no 'Soon' pages remain. |
| Consistent navigation across all pages | **Partial** | App shell consistent; login/verify pages use their own simple shell. |

## 16. Backend, Database & Security

| Feature | Status | Evidence / note |
|---|---|---|
| Persistent database | **Complete** | Your screenshot: 'Source: Supabase database'. |
| Correct data models and relationships | **Partial** | Schema with FKs; only `neighbourhoods` reads were seen working. |
| Secure authentication and authorisation | **Partial** | Signed cookie OK, but reviewer role requires no credential. |
| Server-side API key protection | **Complete** | 0 secret env names in client bundle. |
| Input validation and sanitisation | **Complete** | Server validation, signature check, React escaping, public redaction, AI prompt fencing. |
| Secure file access | **Partial** | Private bucket + 10-min signed URL, but any logged-in user can request it. |
| Rate limiting where appropriate | **Missing** | None on upload, AI or register routes. |
| Error logging and useful error messages | **Partial** | Server `console.error` + friendly messages; no aggregation/monitoring. |
| No reliance on in-memory data for persistence | **Complete** | All state in Supabase/chain. |
| No exposed secrets or sensitive information | **Complete** | .env git-ignored, `.env.example` tracked; hot-wallet risk documented. |

## 17. Deployment & Reliability

| Feature | Status | Evidence / note |
|---|---|---|
| Successful Vercel deployment | **Not Tested** | No evidence of a deployment. |
| Environment variables documented | **Complete** | README table + `.env.example` + `docs/DEPLOY.md`. |
| Database and storage configured | **Not Tested** | DB reads confirmed; storage never confirmed. |
| AI integration tested | **Not Tested** | Mocked tests only; profile page shows the key is set. |
| Blockchain integration tested | **Partial** | Local chain only; Sepolia not observed. |
| No required paid backend / card-dependent service without fallback | **Complete** | Seed data, demo AI mode, local chain path. Vercel/Supabase signup requirements not verified. |
| Graceful handling of unavailable external services | **Complete** | Weather, AI, chain and DB failures all return labelled states. |
| Production build succeeds | **Complete** | `npm run build` passes (re-run for this audit). |
| No critical console errors | **Not Tested** | No browser available to me. |
| Mobile and browser compatibility | **Not Tested** | Never tested. |

## 18. Testing & Final Delivery

| Feature | Status | Evidence / note |
|---|---|---|
| Authentication tests | **Partial** | Smoke script checks gates/cookie flags; no unit tests for `session.ts`. |
| Role and permission tests | **Partial** | Smoke: anonymous 401s and citizen blocked from review page; 403 API checks not in the repo. |
| Report submission tests | **Partial** | Validation unit-tested; route not tested. |
| File upload and hash tests | **Partial** | Signature + SHA-256 tested; upload not. |
| Duplicate detection tests | **Complete** | `test-reports.ts`. |
| Reviewer workflow tests | **Missing** | None (needs a database). |
| Blockchain registration and verification tests | **Complete** | 7 contract tests + local-chain integration test (not Sepolia). |
| Modified-evidence negative tests | **Complete** | Mismatch cases in `test-verify.ts` and `test-chain.ts`. |
| Public verification tests | **Partial** | Verdict/redaction/smoke; page never rendered with data. |
| End-to-end workflow test | **Missing** | Only a manual checklist (`docs/E2E-CHECKLIST.md`); never run. |
| README and setup instructions | **Complete** | `README.md`, `docs/DEPLOY.md`. |
| Architecture documentation | **Partial** | README stack/layout; no architecture document or diagram. |
| Demo credentials or guest mode | **Complete** | Citizen/Reviewer demo login. |
| Screenshots and demo video | **Missing** | None in the repo; video not recorded. |
| Final 3–5 minute presentation | **Partial** | Script written (`docs/DEMO-SCRIPT.md`); not recorded. |

---

# Required audit report (summary)

## 1. Complete features
59 of 167 items (see tables). Strongest areas: AI integration and fallbacks, blockchain contract + hash comparison + tamper detection, public verification states, 3D scene, design system, documentation.

## 2. Partially implemented
51 items. Biggest: reviewer identity/permissions, evidence access control, heat data, location search, report-to-incident linking, community impact metrics, scenario lab, profile/settings.

## 3. Missing
33 items. Biggest: 2D map, notifications, sign-up/admin, edit/withdraw/comments, resolution workflow, request-more-evidence, official alerts/emergency resources, privacy/terms/about pages, downloadable reports, rate limiting.

## 4. Exists only as UI / mock data
- 3D colony, elevations, preparedness and flood scenario (simulated by design, labelled).
- Demo accounts (shared, no passwords).
- Profile cards (read-only text; no settings or interaction).
- Landing 3D hero (illustrative).

## 5. Implemented but not tested
24 items: the whole database path (report save, upload, review queue, registration state machine, public record page with data), Sepolia, Vercel deployment, mobile, browser console, frame rate.

## 6. Broken functionality and bugs
- Profile page cards are static (user-reported; confirmed: no client code in `profile/page.tsx`).
- If the 3D view fails once, the 3D tab cannot be retried without a reload (`TwinExplorer.tsx`).
- Reports list shows at most 50 reports, no pagination (`reports-db.ts`).
- Audit trail records roles, not people (`api/reports/**`).

## 7. Security and deployment problems
1. **Anyone can become Reviewer** (no credential) and so approve reports and spend registrar gas. Probed: HTTP 303. (`api/auth/demo/route.ts`)
2. No rate limiting on upload, AI and register routes (storage fill, Groq quota, gas drain).
3. Evidence photos can be opened by any logged-in demo user (`reports-db.ts` signed URL, report page).
4. Photos keep EXIF/GPS metadata; no stripping.
5. No Content-Security-Policy header (only nosniff, frame, referrer, permissions).
6. Registrar private key is a hot wallet in an env var (testnet only; documented).
7. Not deployed; Vercel free limits (4.5 MB body, function duration) and Supabase pause-on-idle are untested risks.
8. Public verify page reads the RPC on every request (public RPC rate limits).

## 8. Prioritised remaining work (deadline 25 Oct)
P0: deploy + run the E2E checklist on the live site; reviewer passcode; basic rate limits; evidence visible to reviewer/owner only.
P1: profile interactive; official alerts/emergency resources page; request-more-evidence status; 2D map (MapLibre + OpenFreeMap) with report markers; about/privacy/terms pages.
P2: resolution state + timeline + average resolution time; in-app notifications; per-area stats; before/after scenario comparison; CSV export; link duplicates to an incident.
P3: real sign-up, admin console, heat data, photoreal/real-building 3D.

## 9. Exact files that need changes
- Reviewer passcode: `src/app/api/auth/demo/route.ts`, `src/app/login/page.tsx`, `.env.example`, `README.md`.
- Rate limits: `src/app/api/reports/route.ts`, `src/app/api/ai/*/route.ts`, `src/app/api/reports/[id]/register/route.ts`, new `src/lib/ratelimit.ts` + a table in `supabase/`.
- Evidence access: `src/lib/reports-db.ts`, `src/app/(app)/reports/[id]/page.tsx`.
- Profile interactivity: `src/app/(app)/profile/page.tsx` (+ new client components).
- 2D map: new `src/app/(app)/map/page.tsx`, `src/components/map/*`, `AppShell.tsx` nav.
- Request more evidence / resolution: `supabase/*.sql`, `api/reports/[id]/review/route.ts`, `ReviewActions.tsx`, `lib/community.ts`.
- Info pages: new `src/app/about`, `privacy`, `terms`, `resources`.

## 10. Final test results (run for this audit)
| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | pass |
| ESLint | pass |
| `npm test` (climate, reports/duplicates, AI mocked, verify, community, 3D data, houses, scene, WCAG contrast) | all pass |
| Hardhat contract tests | 7 passing |
| Chain library on a local Hardhat node | pass (local chain, not Sepolia) |
| `next build` | pass |
| axe accessibility scan, 12 pages | 0 violations (contrast checked separately, 23/23 pairs) |
| Smoke script | all pass |
| Secret names in client bundle | 0 |
| Anonymous reviewer login probe | **succeeds (security issue)** |
| Content-Security-Policy header | absent |
| **End-to-end workflow on live Supabase/Groq/Sepolia/Vercel** | **NOT RUN** (no access from here) |
