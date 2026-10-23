import { Bot, FlaskConical } from "lucide-react";

export function ModeBadge({ mode, model }: { mode: "live" | "demo"; model?: string }) {
  return mode === "live" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-dark">
      <Bot size={14} aria-hidden /> Live AI (Groq{model ? `, ${model}` : ""})
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-tint px-2.5 py-1 text-xs font-semibold text-muted">
      <FlaskConical size={14} aria-hidden /> Demo mode: sample response
    </span>
  );
}

export function Bullets({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}
