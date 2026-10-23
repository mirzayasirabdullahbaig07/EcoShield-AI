# Submission text (edit to fit the form)

**Name:** EcoShield AI
**Tagline:** Know the risk. Protect what matters. Prove the impact.
**Live demo:** <your Vercel URL>   **Reviewer passcode for judges:** <your REVIEWER_PASSCODE> (Citizen needs none)   **Repository:** <your GitHub URL>   **Video:** <link>

## Short description (about 50 words)
EcoShield AI helps people understand flood preparedness in their neighbourhood, take practical action, and create public, tamper-evident records of community climate actions. Citizens report issues with photo evidence; AI assists; a human approves; evidence hashes are registered on a blockchain testnet and can be verified by anyone.

## Problem
Climate risk information is hard for ordinary people to read, and community climate actions are hard to trust because evidence can be reused, edited or disputed.

## Solution
A complete journey: real rainfall data and plain-language AI guidance, an explorable 3D neighbourhood, a report flow with photo evidence and duplicate warnings, human review with an audit trail, blockchain registration of evidence hashes, and a public verification page that re-checks the chain and lets anyone test a file.

## How AI and blockchain are used, and their limits
- **AI (Groq, server-side):** explains rainfall outlooks, drafts preparedness checklists, summarises reports and flags gaps. It cannot see photos, never approves a report and never certifies a claim. A labelled demo mode runs without a key.
- **Blockchain (Solidity on Sepolia):** stores only the report ID, a photo hash and a record hash. It shows the evidence was unchanged after approval. It does not prove that the claim is true.

## Real vs simulated
Real: Open-Meteo forecasts, reports, hashes, review trail, AI output, Sepolia transactions. Simulated and labelled: the 3D colony, its elevations and flood scenario; demo accounts.

## Built with
Next.js, TypeScript, Tailwind, Vercel, Supabase, Groq, Open-Meteo, React Three Fiber, Solidity, ethers.

## Challenges
Keeping a free-tier-only deployment (4.5 MB request limit, serverless time limits); making blockchain claims honest (only "verified" after a confirmed, re-checked transaction); building a rich 3D scene that stays fast by merging geometry into few draw calls; testing without GPU or live services, so we separated pure logic into unit tests and wrote an end-to-end checklist for the rest.

## What is next
Real flood-hazard datasets, wallet-signed submissions, IPFS evidence storage, notifications, per-building reports in the 3D view, multi-city support.

---

## Devpost submission checklist

The official rules and judging rubric are on the hackathon's Devpost page (ieee-climatechain-hack.devpost.com). Read its Rules tab: the exact required fields, video length and judging criteria were not available to the person who wrote this checklist.

- [ ] Devpost account created, registered for the hackathon, project submitted before the deadline (25 October 2026)
- [ ] Live URL works from a private window (run `npm run smoke` against it)
- [ ] GitHub repository link; README renders the banner; `.env.local` is NOT in the repository
- [ ] Demo video uploaded (public or unlisted link that opens without login); within the length the rules allow
- [ ] Screenshots added in Devpost: landing, dashboard chart, 3D twin, report + AI analysis, reviewer queue, blockchain card with the Etherscan link, public verification page showing "Verified"
- [ ] Reviewer passcode for judges written in the submission notes (Citizen needs none)
- [ ] The "real vs simulated" table is visible in the description
- [ ] Team members and roles listed; sources and credits (Open-Meteo CC BY 4.0) included
