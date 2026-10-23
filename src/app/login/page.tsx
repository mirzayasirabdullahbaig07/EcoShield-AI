import { redirect } from "next/navigation";
import { AlertCircle, ClipboardCheck, KeyRound, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/session";

export const metadata = { title: "Enter the demo | EcoShield AI" };

const ERRORS: Record<string, string> = {
  passcode: "That passcode is not correct.",
  rate: "Too many attempts. Please wait a few minutes and try again.",
  "reviewer-off": "Reviewer login is not configured on this server.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }] = await Promise.all([searchParams]);
  if (await getSession()) redirect("/dashboard");
  const message = error ? ERRORS[error] : undefined;
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <Logo />
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">Enter the demo</h1>
        <p className="text-muted">Demo accounts are shared. Please do not enter personal information.</p>
      </div>
      {message && <p role="alert" className="flex items-center gap-2 rounded-xl border border-risk-high/40 bg-risk-high/10 p-3 text-sm text-risk-high"><AlertCircle size={18} aria-hidden /> {message}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <form action="/api/auth/demo" method="post">
          <input type="hidden" name="role" value="citizen" />
          <button type="submit" className="block h-full w-full text-left">
            <Card interactive className="h-full space-y-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white"><Users size={22} aria-hidden /></span>
              <h2 className="font-semibold">Continue as Citizen</h2>
              <p className="text-sm text-muted">Check risk, submit reports, and track their review.</p>
            </Card>
          </button>
        </form>
        <form action="/api/auth/demo" method="post">
          <input type="hidden" name="role" value="reviewer" />
          <Card interactive className="space-y-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white"><ClipboardCheck size={22} aria-hidden /></span>
            <h2 className="font-semibold">Continue as Reviewer</h2>
            <p className="text-sm text-muted">Review submitted evidence and approve or reject it. Needs the reviewer passcode.</p>
            <label htmlFor="passcode" className="flex items-center gap-1.5 text-sm font-semibold"><KeyRound size={14} aria-hidden /> Reviewer passcode</label>
            <input id="passcode" name="passcode" type="password" autoComplete="off" className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-brand" />
            <Button type="submit" className="w-full">Continue as Reviewer</Button>
          </Card>
        </form>
      </div>
    </main>
  );
}
