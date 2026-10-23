import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";
import { INDICATOR_RULE } from "@/lib/climate-logic";

export const metadata = { title: "About and methodology | EcoShield AI" };

export default function AboutPage() {
  return (
    <PublicShell>
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">About and methodology</h1>
        <p className="text-muted">EcoShield AI helps people understand flood preparedness, take practical action, and keep a public, tamper-evident record of community climate actions. It was built as a prototype for the IEEE ClimateChain hackathon.</p>
      </header>
      <Card className="space-y-2">
        <h2 className="font-semibold">What is real and what is simulated</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li><strong className="text-ink">Real:</strong> rainfall and river-discharge forecasts (Open-Meteo), submitted reports, photo hashes, reviewer decisions, AI explanations (Groq) and blockchain registrations on the Sepolia test network.</li>
          <li><strong className="text-ink">Simulated and always labelled:</strong> the 3D colony, its ground heights, preparedness levels and the flood-scenario water level.</li>
        </ul>
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">How the rainfall indicator works</h2>
        <p className="text-sm text-muted">{INDICATOR_RULE} Forecasts are uncertain and change often. River discharge comes from a coarse global model and is not street-level information.</p>
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">How a report becomes a verifiable record</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>A citizen submits a description and an optional photo. The server computes a SHA-256 fingerprint of the photo and checks for duplicates.</li>
          <li>A human reviewer approves, rejects, or asks for more information. The AI never decides.</li>
          <li>For approved reports, a hash of the photo and a hash of the record are registered on a public blockchain test network. No photo or text goes on-chain.</li>
          <li>Anyone can open the public page, which re-reads the chain and compares. &quot;Verified&quot; appears only for a confirmed transaction whose hashes still match.</li>
        </ol>
        <p className="text-sm text-muted">A blockchain record shows that evidence was <strong className="text-ink">unchanged after approval</strong>. It does not prove the reported claim is true.</p>
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">Data sources and credits</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Weather data by <a className="text-brand underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a> (CC BY 4.0).</li>
          <li>AI explanations by Groq-hosted models. They read text only, not photos, and never approve or certify anything.</li>
          <li>Storage and database by Supabase; hosting by Vercel; records on Ethereum Sepolia.</li>
        </ul>
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">Limitations</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Not an emergency service and not an official warning. See <Link href="/resources" className="text-brand underline">emergency resources</Link>.</li>
          <li>Three demo areas only; no heat data; no real sign-up (shared demo accounts).</li>
          <li>Photos are limited to 4 MB, and the AI cannot see them.</li>
          <li>Public RPC services can be slow; a record may show &quot;could not check the blockchain&quot; temporarily.</li>
        </ul>
      </Card>
    </PublicShell>
  );
}
