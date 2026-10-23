import { TwinExplorer } from "@/components/twin/TwinExplorer";

export const metadata = { title: "3D Climate Twin | EcoShield AI" };

export default function TwinPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">3D Climate Twin</h1>
        <p className="text-muted">Explore a demo neighbourhood, switch layers, and raise the water to see which buildings would be affected in an illustrative scenario.</p>
      </header>
      <TwinExplorer />
    </div>
  );
}
