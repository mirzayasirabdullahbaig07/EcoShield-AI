import { AlertTriangle, CheckCircle2, Clock, FlaskConical, MessageCircleQuestion, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type RiskLevel = "high" | "medium" | "low";
export type ReviewStatus = "pending" | "needs_info" | "approved" | "rejected" | "registered";

const pill = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold";

const risk = {
  high: { label: "High risk", cls: "border-risk-high/50 bg-risk-high/10 text-risk-high", Icon: AlertTriangle },
  medium: { label: "Medium risk", cls: "border-risk-med/50 bg-risk-med/10 text-risk-med", Icon: AlertTriangle },
  low: { label: "Low risk", cls: "border-risk-low/50 bg-risk-low/10 text-risk-low", Icon: ShieldCheck },
};

const status = {
  pending: { label: "Under review", cls: "border-risk-med/50 bg-risk-med/10 text-risk-med", Icon: Clock },
  needs_info: { label: "More info needed", cls: "border-risk-med/50 bg-risk-med/10 text-risk-med", Icon: MessageCircleQuestion },
  approved: { label: "Approved", cls: "border-risk-low/50 bg-risk-low/10 text-risk-low", Icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "border-risk-high/50 bg-risk-high/10 text-risk-high", Icon: XCircle },
  registered: { label: "Registered on-chain", cls: "border-brand/50 bg-brand/10 text-brand", Icon: ShieldCheck },
};

// Colour is never the only signal: every badge has an icon and a text label.
export function RiskBadge({ level }: { level: RiskLevel }) {
  const { label, cls, Icon } = risk[level];
  return (
    <span className={cn(pill, cls)}>
      <Icon size={14} aria-hidden /> {label}
    </span>
  );
}

export function StatusBadge({ value }: { value: ReviewStatus }) {
  const { label, cls, Icon } = status[value];
  return (
    <span className={cn(pill, cls)}>
      <Icon size={14} aria-hidden /> {label}
    </span>
  );
}

/** Marks any figure that is not from a real, timestamped source. */
export function SimulatedTag() {
  return (
    <span className={cn(pill, "border-line bg-tint text-muted")}>
      <FlaskConical size={14} aria-hidden /> Simulated demo data
    </span>
  );
}

/** Source + timestamp + uncertainty line for real data. */
export function DataSourceTag({ source, updated, note }: { source: string; updated: string; note?: string }) {
  return (
    <p className="text-xs text-muted">
      Source: {source}. Updated {updated}.{note ? ` ${note}` : ""}
    </p>
  );
}
