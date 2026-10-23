import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Terms | EcoShield AI" };

export default function TermsPage() {
  return (
    <PublicShell>
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">Terms of use</h1>
        <p className="text-muted">EcoShield AI is a hackathon prototype provided as is. These terms are a plain-language summary, not legal advice.</p>
      </header>
      {[
        ["Not an emergency or warning service", "Nothing in EcoShield AI is an official warning, a flood prediction or a guarantee of safety. In an emergency call your local emergency number. See the emergency resources page."],
        ["Information may be wrong", "Forecasts are uncertain, the 3D scene is simulated, and AI output can be incomplete or mistaken. Use your own judgement and official sources."],
        ["What a blockchain record means", "A verified record shows that submitted evidence was unchanged after approval. It does not prove that the reported event happened or that an action was effective."],
        ["Your submissions", "Only submit content you have the right to share, with no personal information. Reports may be rejected or removed. Do not try to disrupt, overload or bypass the prototype's limits."],
        ["No warranty", "The service is provided without warranties and may change, pause or stop at any time. Demo data may be deleted."],
      ].map(([t, d]) => <Card key={t} className="space-y-1"><h2 className="font-semibold">{t}</h2><p className="text-sm text-muted">{d}</p></Card>)}
    </PublicShell>
  );
}
