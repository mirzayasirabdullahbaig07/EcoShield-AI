import { AssistantPanel } from "@/components/ai/AssistantPanel";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { cookies } from "next/headers";
import { PREFS_COOKIE, parsePrefs } from "@/lib/prefs";

export const metadata = { title: "AI Assistant | EcoShield AI" };

export default async function AssistantPage() {
  const { items } = await getNeighbourhoods();
  const pref = parsePrefs((await cookies()).get(PREFS_COOKIE)?.value, items.map((x) => x.id)).area;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">AI climate assistant</h1>
        <p className="text-muted">Pick a neighbourhood and get the live rainfall outlook explained in plain language, with a preparedness checklist.</p>
      </header>
      <AssistantPanel hoods={items.map(({ id, name, city }) => ({ id, name, city }))} initialId={pref ?? undefined} />
    </div>
  );
}
