import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Privacy | EcoShield AI" };

export default function PrivacyPage() {
  return (
    <PublicShell>
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">Privacy</h1>
        <p className="text-muted">EcoShield AI is a hackathon prototype using shared demo accounts. This page describes what the prototype does with data. It is not legal advice and should be reviewed before any real-world use.</p>
      </header>
      {[
        ["What we collect", ["The reports you submit: category, description, chosen neighbourhood, time and the demo account name.", "Photos you attach, stored privately, and their SHA-256 fingerprints.", "A random session id, so you can see your own reports and your own photos.", "Display preferences saved in a cookie on your device (home neighbourhood, animations, text size).", "Your IP address is used briefly for rate limiting, in a counter table. It is not linked to reports."]],
        ["Who can see it", ["Photos: reviewers and the session that submitted the report. Never on public pages.", "Public verification pages: category, neighbourhood, time, a description with emails and long numbers hidden, hashes and the blockchain transaction. No photo, author or reviewer note.", "Descriptions are read by reviewers and, when you press Analyse, sent to an AI service for a summary."]],
        ["The blockchain", ["Only the report ID and two hashes are written to a public test network. Blockchain records cannot be edited or deleted. Hashes cannot be turned back into your photo or text."]],
        ["Please do not", ["Enter names, phone numbers, addresses or other personal information in descriptions.", "Upload photos showing faces or private places. Photos can also contain location data in their metadata, which this prototype does not remove."]],
        ["Retention and deletion", ["The prototype has no automatic deletion schedule. Demo data may be removed at any time. Blockchain records stay on the test network."]],
      ].map(([t, items]) => (
        <Card key={t as string} className="space-y-2">
          <h2 className="font-semibold">{t as string}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{(items as string[]).map((i) => <li key={i}>{i}</li>)}</ul>
        </Card>
      ))}
    </PublicShell>
  );
}
