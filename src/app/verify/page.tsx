import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { LookupForm } from "@/components/verify/LookupForm";

export const metadata = { title: "Verify a record | EcoShield AI" };

export default function VerifyIndex() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Logo />
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">Verify a climate action record</h1>
        <p className="text-muted">Enter the ID from a report to see its status and check whether its evidence matches the blockchain record. No account is needed.</p>
      </header>
      <Card><LookupForm /></Card>
    </main>
  );
}
