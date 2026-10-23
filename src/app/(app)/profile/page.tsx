import Link from "next/link";
import { cookies } from "next/headers";
import { ClipboardList, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badges";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { StatusPanel } from "@/components/profile/StatusPanel";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { listMyReports, listReports } from "@/lib/reports-db";
import { PREFS_COOKIE, parsePrefs } from "@/lib/prefs";
import { CATEGORIES, type Category } from "@/lib/reports";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Profile | EcoShield AI" };

export default async function ProfilePage() {
  const [s, hoods, jar] = await Promise.all([getSession(), getNeighbourhoods(), cookies()]);
  const prefs = parsePrefs(jar.get(PREFS_COOKIE)?.value, hoods.items.map((h) => h.id));
  const reviewer = s?.role === "reviewer";

  let mine: Awaited<ReturnType<typeof listMyReports>> = { rows: [], unavailable: false };
  let pending = 0;
  if (isDbConfigured() && s) {
    try { if (reviewer) pending = (await listReports("pending")).length; else mine = await listMyReports(s.sid); } catch { mine = { rows: [], unavailable: true }; }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Profile</h1>
        <p className="text-muted">A shared demo account with real, saved settings.</p>
      </header>

      <Card interactive className="space-y-3">
        <h2 className="font-semibold">Account</h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Name</dt><dd className="font-medium">{s?.name}</dd></div>
          <div><dt className="text-muted">Role</dt><dd className="font-medium capitalize">{s?.role}</dd></div>
        </dl>
        <p className="text-sm text-muted">
          {reviewer ? "Reviewers can approve or reject reports and register approved records on the blockchain." : "Citizens can view risks, explore the 3D twin, use the AI assistant and submit reports."} Demo sessions last 8 hours. Please do not enter personal information.
        </p>
        <form action="/api/auth/logout" method="post"><input type="hidden" name="to" value="/login" />
          <Button type="submit" variant="outline"><LogOut size={16} aria-hidden /> Switch role</Button></form>
      </Card>

      <Card interactive className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold"><ClipboardList size={18} className="text-brand" aria-hidden /> {reviewer ? "Review workload" : "My recent reports"}</h2>
        {reviewer ? (
          <p className="text-sm">{isDbConfigured() ? <><strong>{pending}</strong> report{pending === 1 ? "" : "s"} waiting for a decision. <Link href="/review" className="text-brand underline">Open the queue</Link></> : "The database is not configured."}</p>
        ) : mine.unavailable ? <p className="text-sm text-muted">Your reports could not be loaded. If you are the admin: run supabase/phase11.sql.</p>
          : mine.rows.length === 0 ? <p className="text-sm text-muted">You have not submitted a report in this session yet. <Link href="/reports/new" className="text-brand underline">Submit one</Link></p>
          : (
            <ul className="space-y-2">
              {mine.rows.map((r) => (
                <li key={r.public_id}><Link href={`/reports/${r.public_id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm transition hover:border-brand/60 hover:bg-tint">
                  <span><strong>{r.public_id}</strong> · {CATEGORIES[r.category as Category] ?? r.category} <span className="text-xs text-muted">· {fmtDateTime(r.created_at)}</span></span><StatusBadge value={r.status} />
                </Link></li>
              ))}
            </ul>
          )}
      </Card>

      <Card interactive className="space-y-3"><h2 className="font-semibold">Settings</h2><ProfileSettings hoods={hoods.items.map(({ id, name, city }) => ({ id, name, city }))} initial={prefs} /></Card>

      <Card interactive className="space-y-3"><h2 className="font-semibold">Connection status</h2><StatusPanel /></Card>

      <Card interactive className="space-y-1">
        <h2 className="font-semibold">What we store</h2>
        {[
          ["Reports", "Category, description, neighbourhood, time and a random session id (so you can see your own reports)."],
          ["Photos", "In a private bucket with a SHA-256 fingerprint. Only reviewers and the session that submitted the report can open a photo. Public pages never show photos."],
          ["Decisions", "Reviewer decisions, notes and an audit history."],
          ["On the blockchain", "Only the report ID and two hashes, never photos or text."],
        ].map(([t, d]) => (
          <details key={t} className="group/d rounded-lg px-2 py-1.5 open:bg-tint"><summary className="cursor-pointer text-sm font-medium marker:text-brand">{t}</summary><p className="pt-1 text-sm text-muted">{d}</p></details>
        ))}
      </Card>

      <Card className="space-y-1 text-sm text-muted">
        <h2 className="font-semibold text-ink">Real and simulated</h2>
        <p>Rainfall data (Open-Meteo), reports, hashes and blockchain records are real. The 3D colony, its elevations and the flood scenario are simulated and labelled. A blockchain record shows evidence was unchanged after approval; it does not prove a claim is true. <Link href="/verify" className="text-brand underline">Verify a record</Link></p>
      </Card>
    </div>
  );
}
