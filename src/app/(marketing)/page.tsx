import { Bell, Bot, Box, CheckCircle2, Link2, MapPin, ScanSearch, ShieldCheck, Share2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { SimulatedTag } from "@/components/ui/Badges";
import { HeroVisual } from "@/components/twin/HeroVisual";
import { LiveStrip } from "@/components/marketing/LiveStrip";
import { SiteFooter } from "@/components/layout/PublicShell";
import { Skeleton } from "@/components/ui/States";
import { Suspense } from "react";

export const revalidate = 1800; // regenerate the page (and its live strip) at most every 30 minutes

const features = [
  { Icon: Bell, title: "Climate risk alerts", text: "See flood-related information for your area, with its source and date." },
  { Icon: Bot, title: "AI guidance", text: "Plain-language explanations and a preparedness checklist you can act on." },
  { Icon: Box, title: "3D neighbourhood", text: "Explore your area and click a building to see its risk and actions." },
  { Icon: ShieldCheck, title: "Verified actions", text: "Approved community actions get a public record anyone can check." },
];

const journey = [
  { Icon: MapPin, title: "Discover risk", text: "Pick your neighbourhood and read what the data says." },
  { Icon: ShieldCheck, title: "Take action", text: "Follow practical steps to protect your home." },
  { Icon: ScanSearch, title: "Submit evidence", text: "Report a problem or an action with a photo." },
  { Icon: UserCheck, title: "Get reviewed", text: "AI flags issues; a person decides." },
  { Icon: Link2, title: "Record the proof", text: "Approved evidence is fingerprinted on a public testnet." },
  { Icon: Share2, title: "Share the link", text: "Anyone can verify the record without an account." },
];

export default function LandingPage() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav aria-label="Site" className="flex items-center gap-2">
          <Button href="/verify" variant="ghost" className="hidden sm:inline-flex">Verify a record</Button>
          <Button href="/dashboard">Try the demo</Button>
        </nav>
      </header>

      <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="fade-up font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Know the Risk.
            <span className="block shimmer">Protect What Matters.</span>
            <span className="block shimmer">Prove the Impact.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            EcoShield AI helps ordinary people understand flood risk where they live, take practical steps, and keep a
            public, tamper-evident record of what their community actually did.
          </p>
          <ul className="flex flex-wrap gap-2 text-xs text-muted" aria-label="Highlights">
            {["Real 7-day rainfall data", "AI guidance", "Interactive 3D twin", "SHA-256 evidence hashes", "Sepolia blockchain proof"].map((t) => <li key={t} className="rounded-full border border-line bg-card px-3 py-1">{t}</li>)}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button href="/dashboard">Get started free</Button>
            <Button href="#journey" variant="outline">See how it works</Button>
          </div>
        </div>

        <Card className="fade-up space-y-4 p-5 [animation-delay:150ms]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Madina Town, Faisalabad (demo)</h2>
            <SimulatedTag />
          </div>
          <HeroVisual />
        </Card>
      </section>

      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 pb-14"><Skeleton className="h-36" /></div>}><LiveStrip /></Suspense>

      <section aria-label="Features" data-reveal className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ Icon, title, text }) => (
          <Card key={title} interactive className="space-y-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:scale-110 group-hover:bg-brand group-hover:text-paper"><Icon size={22} aria-hidden /></span>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted">{text}</p>
          </Card>
        ))}
      </section>

      <section id="journey" data-reveal aria-labelledby="journey-title" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 id="journey-title" className="mb-6 font-display text-3xl font-semibold">From a blocked drain to a public record</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map(({ Icon, title, text }, i) => (
            <li key={title}>
              <Card interactive className="flex h-full gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-paper">
                  <Icon size={20} aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold">{i + 1}. {title}</h3>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-start gap-2 text-sm text-muted">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          A blockchain record proves evidence was not changed after approval. It does not prove the claim itself is
          true; that is what human review is for.
        </p>
      </section>
      <section data-reveal className="bg-brand-dark text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2">
            <h2 className="font-display text-3xl font-semibold">See the whole journey in five minutes.</h2>
            <p className="text-white/80">Explore the demo: check risk, report a problem, review it, and verify the record.</p>
          </div>
          <Button href="/dashboard" variant="light">Try the demo</Button>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
