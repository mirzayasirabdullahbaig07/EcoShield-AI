import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const LINKS = [["/about", "About"], ["/resources", "Emergency resources"], ["/verify", "Verify a record"], ["/privacy", "Privacy"], ["/terms", "Terms"]] as const;

/** Header + footer for public information pages. Same links everywhere so nothing is a dead end. */
export function PublicShell({ children, width = "max-w-3xl" }: { children: React.ReactNode; width?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <Logo />
        <nav aria-label="Site" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {LINKS.slice(0, 3).map(([h, l]) => <Link key={h} href={h} className="text-muted hover:text-ink">{l}</Link>)}
          <Link href="/login" className="font-semibold text-brand">Open the demo</Link>
        </nav>
      </header>
      <main className={`mx-auto w-full flex-1 space-y-6 px-4 pb-16 ${width}`}>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
        <p>EcoShield AI is a hackathon prototype, not an emergency service. In danger, call your local emergency number.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-1">
          {LINKS.map(([h, l]) => <Link key={h} href={h} className="hover:text-ink">{l}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
