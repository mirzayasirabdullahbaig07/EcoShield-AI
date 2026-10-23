# Deploying to Vercel (free tier, no paid backend)

Do this early, then redeploy after every change. Most deployment problems show up the first time, so do not leave it for the last day.

## 0. Before you start
- [ ] `npm test` passes locally
- [ ] `git status` does **not** list `.env.local` (it is git-ignored; `.env.example` should be tracked)
- [ ] Supabase: `schema.sql`, `phase4.sql`, `phase11.sql` and `phase12.sql` have been run (in that order), the `evidence` bucket exists (Storage menu)
- [ ] If tables say "permission denied", run once in the SQL Editor:
```sql
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
```
- [ ] The contract is deployed on Sepolia and the registrar wallet has test ETH

## 1. Put the code on GitHub
```bash
git init
git add .
git status          # check no .env.local or keys appear in this list
git commit -m "EcoShield AI"
git branch -M main
git remote add origin https://github.com/<you>/ecoshield-ai.git
git push -u origin main
```
Keep the repository private until you have checked that no secret was committed. If a key ever reached GitHub, treat it as leaked: rotate it (new Supabase key, new Groq key, new wallet).

## 2. Import into Vercel
1. vercel.com > Add New > Project > import the GitHub repo. Framework should auto-detect as Next.js. Leave build settings as they are.
2. Open "Environment Variables" and add every row from the table in `README.md` (Production at least), **including `REVIEWER_PASSCODE`** (choose a passcode you can safely share with the judges). For `SESSION_SECRET` generate a long random value:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
3. Deploy. Environment variables only apply to **new** deployments, so after changing one, redeploy.

I could not check Vercel's current signup requirements from here. As far as I know the Hobby plan does not ask for a card, but read what the signup page says before you continue.

## 3. After the first deploy
```bash
REVIEWER_PASSCODE=<your passcode> BASE_URL=https://<your-app>.vercel.app npm run smoke
REVIEWER_PASSCODE=<your passcode> BASE_URL=https://<your-app>.vercel.app npm run a11y
```
Then walk through `docs/E2E-CHECKLIST.md` on the live site.

## 4. Common problems
| Symptom | Likely cause | Fix |
|---|---|---|
| Login returns an error / 500 | `SESSION_SECRET` missing in Vercel | add it, redeploy |
| "Reviewer login is not configured" | `REVIEWER_PASSCODE` missing | add it, redeploy |
| "Too many requests" (429) | rate limit hit (login 5/10 min for reviewer, 10 uploads/hour, 20 AI calls/hour per IP) | wait, or raise the limits in the route files |
| Profile says your reports could not be loaded | `phase11.sql` not run | run it |
| "Request more info" fails with a database error | `phase12.sql` not run (old status check) | run it |
| Dashboard says "built-in seed data" | wrong Supabase URL or key, or tables not granted | check variables; run the grants above |
| "Could not store the photo" | `evidence` bucket missing | run `phase4.sql` (the app also tries to create the bucket) |
| Upload fails with 413 | photo above 4 MB / Vercel 4.5 MB limit | use a smaller photo |
| AI shows "Demo mode" | no `GROQ_API_KEY`, wrong `GROQ_MODEL`, or rate limit | read the reason shown under the badge |
| Register button says chain not configured | one of the three chain variables is missing | add them, redeploy |
| Registration "not confirmed yet" | Sepolia block was slow | press the button again to re-check |
| "registrar wallet has no test ETH" | wallet is empty | top up from a faucet |
| Public page says "Could not check the blockchain" | RPC is rate-limited or down | retry later; try `https://sepolia.drpc.org` |
| 3D page is blank | WebGL blocked on that device | the list view works as a fallback |

## 5. Before recording the demo video
- Wake the Supabase project (open its dashboard) and check the registrar wallet balance.
- Create the demo reports in advance so the registration step is not the first time you run it live.
- Use the same Vercel production URL in the video and in the submission form.
