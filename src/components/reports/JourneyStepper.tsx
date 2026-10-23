import { Check, Circle, Clock, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Step } from "@/lib/community";
import { cn } from "@/lib/cn";

const ICON = { done: Check, current: Clock, failed: X, todo: Circle } as const;
const RING = {
  done: "bg-brand text-white", current: "bg-risk-med/15 text-risk-med ring-2 ring-risk-med/40", failed: "bg-risk-high/15 text-risk-high ring-2 ring-risk-high/40", todo: "bg-tint text-muted",
} as const;
const WORD = { done: "Done", current: "In progress", failed: "Rejected", todo: "Not yet" } as const;

export function JourneyStepper({ steps }: { steps: Step[] }) {
  return (
    <Card>
      <ol className="grid gap-4 sm:grid-cols-4" aria-label="Report progress">
        {steps.map((s, i) => {
          const Icon = ICON[s.state];
          return (
            <li key={s.key} className="fade-up flex items-start gap-3 sm:flex-col" style={{ animationDelay: `${i * 90}ms` }}>
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform hover:scale-110", RING[s.state])}><Icon size={18} aria-hidden /></span>
              <div>
                <p className="text-sm font-semibold">{s.label} <span className="sr-only">({WORD[s.state]})</span></p>
                <p className="text-xs text-muted">{s.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
