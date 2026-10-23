"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Box, ClipboardCheck, CloudRain, FileText, LayoutDashboard, LogOut, User, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; Icon: LucideIcon; ready: boolean };

// `ready` flips to true as each phase ships; unbuilt pages are shown disabled, never as dead links.
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, ready: true },
  { href: "/twin", label: "3D Map", Icon: Box, ready: true },
  { href: "/risks", label: "Climate Risks", Icon: CloudRain, ready: true },
  { href: "/reports", label: "Reports", Icon: FileText, ready: true },
  { href: "/assistant", label: "AI Assistant", Icon: Bot, ready: true },
  { href: "/profile", label: "Profile", Icon: User, ready: true },
];
const REVIEW: NavItem = { href: "/review", label: "Review", Icon: ClipboardCheck, ready: true };

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact?: boolean }) {
  const { Icon, label, href, ready } = item;
  const base = compact
    ? "flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 text-[11px]"
    : "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm";
  if (!ready) {
    return (
      <span aria-disabled="true" className={cn(base, "cursor-not-allowed text-muted/60")}>
        <Icon size={18} aria-hidden />
        {label}
        {!compact && <span className="ml-auto text-[11px]">Soon</span>}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(base, active ? "bg-brand/10 text-brand" : "text-muted hover:bg-tint hover:text-ink")}
    >
      <Icon size={18} aria-hidden />
      {label}
    </Link>
  );
}

function LogoutForm({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="post">
      <button type="submit" className={cn("flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted hover:bg-tint hover:text-ink", className)}>
        <LogOut size={16} aria-hidden /> Log out
      </button>
    </form>
  );
}

export function AppShell({ children, role, name }: { children: React.ReactNode; role: "citizen" | "reviewer"; name: string }) {
  const pathname = usePathname();
  const items = role === "reviewer" ? [NAV[0], REVIEW, ...NAV.slice(1)] : NAV;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="hidden border-r border-line bg-card p-4 md:flex md:flex-col md:gap-6">
        <Logo />
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-line pt-3">
          <p className="px-3 text-xs text-muted">{name} ({role})</p>
          <LogoutForm />
          <p className="flex flex-wrap gap-x-3 px-3 pt-1 text-xs text-muted"><Link href="/resources" className="underline">Emergency</Link><Link href="/about" className="underline">About</Link><Link href="/privacy" className="underline">Privacy</Link></p>
        </div>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-line bg-card px-4 py-2 md:hidden">
          <Logo />
          <LogoutForm />
        </header>
        <main className="px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
      </div>
      <nav aria-label="Primary, mobile" className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-line bg-card md:hidden">
        {items.map((item) => (
          <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} compact />
        ))}
      </nav>
    </div>
  );
}
