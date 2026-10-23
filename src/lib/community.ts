export type Status = "pending" | "needs_info" | "approved" | "rejected" | "registered";
export type Counts = Record<Status | "total", number>;

export function statusCounts(rows: { status: Status }[]): Counts {
  const c: Counts = { total: rows.length, pending: 0, needs_info: 0, approved: 0, rejected: 0, registered: 0 };
  for (const r of rows) if (r.status in c) c[r.status]++;
  return c;
}

export type StepState = "done" | "current" | "todo" | "failed";
export type Step = { key: string; label: string; state: StepState; detail: string };

/** The report's path: submitted, human review, blockchain proof, public link. Derived only from stored facts. */
export function journeySteps(r: { status: Status }, chain: { confirmed: boolean } | null): Step[] {
  const rejected = r.status === "rejected", pending = r.status === "pending", registered = r.status === "registered", needsInfo = r.status === "needs_info";
  const review: Step = rejected
    ? { key: "review", label: "Human review", state: "failed", detail: "Rejected by a reviewer" }
    : needsInfo ? { key: "review", label: "Human review", state: "current", detail: "Reviewer asked for more information" }
    : pending ? { key: "review", label: "Human review", state: "current", detail: "Waiting for a reviewer" }
    : { key: "review", label: "Human review", state: "done", detail: "Approved by a reviewer" };
  const chainStep: Step = registered
    ? { key: "chain", label: "Blockchain proof", state: "done", detail: "Hashes registered and confirmed" }
    : r.status === "approved"
      ? { key: "chain", label: "Blockchain proof", state: "current", detail: chain && !chain.confirmed ? "Sent, waiting for confirmation" : "Ready to register" }
      : { key: "chain", label: "Blockchain proof", state: "todo", detail: rejected ? "Not applicable" : "After approval" };
  return [
    { key: "submitted", label: "Submitted", state: "done", detail: "Evidence hash recorded" },
    review,
    chainStep,
    { key: "public", label: "Public link", state: registered ? "done" : "todo", detail: registered ? "Anyone can verify it" : "Available once registered" },
  ];
}
