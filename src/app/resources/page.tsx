import { PhoneCall, TriangleAlert } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Emergency resources | EcoShield AI" };

type Item = { name: string; tel?: string; note: string; href?: string; link?: string };
const AREAS: { title: string; places: string; items: Item[] }[] = [
  { title: "Punjab, Pakistan", places: "Faisalabad and Lahore", items: [
    { name: "Rescue 1122 (Punjab Emergency Service)", tel: "1122", note: "Emergency rescue, ambulance and fire.", href: "https://rescue.gov.pk/", link: "rescue.gov.pk" },
    { name: "PDMA Punjab emergency helpline", tel: "1129", note: "Disaster complaints and reports (listed on the PDMA Punjab website).", href: "https://pdma.punjab.gov.pk/helpline", link: "pdma.punjab.gov.pk" },
    { name: "PDMA Punjab flood warnings and weather alerts", note: "Official river and rainfall alerts for Punjab.", href: "https://pdma.punjab.gov.pk/flood_warning", link: "Flood warnings" },
  ] },
  { title: "Jakarta, Indonesia", places: "Central Jakarta", items: [
    { name: "Jakarta Siaga 112 (BPBD DKI Jakarta)", tel: "112", note: "Emergency line run by Jakarta's disaster agency. Free and available 24 hours, according to BPBD announcements.", href: "https://bpbd.jakarta.go.id/", link: "bpbd.jakarta.go.id" },
    { name: "Water level monitoring", note: "BPBD publishes live water levels.", href: "https://bpbd.jakarta.go.id/waterlevel", link: "bpbd.jakarta.go.id/waterlevel" },
    { name: "Pantau Banjir (flood monitoring)", note: "Neighbourhood-level flood conditions. Residents can also report flooding in the JAKI app.", href: "https://pantaubanjir.jakarta.go.id", link: "pantaubanjir.jakarta.go.id" },
  ] },
];

export default function ResourcesPage() {
  return (
    <PublicShell>
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">Emergency resources</h1>
        <p className="text-muted">Official contacts and alert pages for the areas EcoShield AI covers.</p>
      </header>
      <div role="note" className="flex items-start gap-3 rounded-xl border border-risk-high/40 bg-risk-high/10 p-4 text-sm">
        <TriangleAlert className="mt-0.5 shrink-0 text-risk-high" size={20} aria-hidden />
        <p><strong>If you or someone near you is in danger, call the emergency number first.</strong> EcoShield AI is not an emergency service and does not send help. Its rainfall indicator is not an official warning: follow your local authorities.</p>
      </div>
      {AREAS.map((a) => (
        <section key={a.title} aria-labelledby={a.title} className="space-y-3">
          <h2 id={a.title} className="font-display text-2xl font-semibold">{a.title} <span className="text-base font-normal text-muted">({a.places})</span></h2>
          <ul className="space-y-3">
            {a.items.map((i) => (
              <li key={i.name}>
                <Card interactive className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-sm text-muted">{i.note}</p>
                    {i.href && <a href={i.href} target="_blank" rel="noreferrer" className="text-sm text-brand underline underline-offset-2">{i.link}</a>}
                  </div>
                  {i.tel && <a href={`tel:${i.tel}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"><PhoneCall size={16} aria-hidden /> Call {i.tel}</a>}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-xs text-muted">These contacts were checked against the official websites and announcements named above in October 2026. Numbers and pages can change, so confirm them locally. Other areas are not covered here.</p>
    </PublicShell>
  );
}
