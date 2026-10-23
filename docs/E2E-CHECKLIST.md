# End-to-end checklist (the 3 to 5 minute demo story)

Run this on the deployed site and again before recording the video. Tick each box only after you SEE it work.
Use two browsers (or one normal + one incognito window) so you can be logged in as two roles.

## Before you start
- [ ] `npm test` passes locally (all assertions, contrast check)
- [ ] `BASE_URL=<your url> node scripts/smoke.mjs` passes
- [ ] `BASE_URL=<your url> node scripts/a11y.mjs` reports no violations
- [ ] Supabase project is awake (free projects pause after about 7 days idle): open the dashboard once
- [ ] Registrar wallet still has Sepolia ETH

## The story
1. [ ] Landing page explains the problem in one screen. "Try the demo" opens the login page
2. [ ] Login as **Citizen**. Dashboard shows real rainfall with a source and a time. Switch all 3 neighbourhoods
3. [ ] **AI Assistant**: explain the outlook. Badge says "Live AI (Groq…)" (or "Demo mode" if no key, and then say so out loud)
4. [ ] **3D Map**: click a building, switch layers, raise the water to ~1.5 m. Say the data is simulated
5. [ ] **New report**: blocked drainage + description + `01_blocked_drain.jpg`. Report page shows ID, hash, "Under review"
6. [ ] Press **Analyse this report**: summary and reviewer checks appear, marked advisory
7. [ ] Submit the same photo again in another report: "Possible duplicate: identical photo file" appears
8. [ ] Log in as **Reviewer** (other browser) with the passcode; a wrong passcode must be refused. Queue shows the pending reports. **Approve** the first
8b. [ ] On another pending report press **Request more info** with a note. As the report's author (same browser session) open it, send a reply: it returns to the review queue and the audit history shows "info_provided"
9. [ ] Press **Register on blockchain**. Wait up to a minute. Card shows network, block and a transaction link
10. [ ] Open the Etherscan link: the transaction is real and succeeded
11. [ ] Open the **public verification link in a private window**: green "Verified on the blockchain"
12. [ ] Public page: choose `01_blocked_drain.jpg` => Match. Choose `02_flooded_street.jpg` => No match
13. [ ] Public page for a pending or unknown ID shows "No public record found"

## Failure drills (do at least two, so you know what the app does)
- [ ] Wrong password style failures: log out and open `/reports` => goes to login
- [ ] As a citizen, open a report that another session created: the photo must be hidden ("The photo is private")
- [ ] Profile: change the home neighbourhood, switch animations off and text size to Large; reload and check they stick; press "Check connections now"
- [ ] Remove `GROQ_API_KEY` locally => AI shows "Demo mode: sample response" with a reason
- [ ] Upload `NEG_fake_photo.jpg` and `NEG_too_big_over_4MB.jpg` => clear error messages
- [ ] Phone check: open the site on a phone. Menu bar at the bottom works, the 3D scene responds to touch, the list view works
