import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badges";
import { CATEGORIES, type Category } from "@/lib/reports";
import { fmtDateTime } from "@/lib/format";
import type { ReportRow } from "@/lib/reports-db";

export function ReportList({ reports, hoodNames }: { reports: ReportRow[]; hoodNames: Record<string, string> }) {
  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li key={r.id}>
          <Link href={`/reports/${r.public_id}`} className="block">
            <Card interactive className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{r.public_id} · {CATEGORIES[r.category as Category] ?? r.category}</p>
                <StatusBadge value={r.status} />
              </div>
              <p className="line-clamp-2 text-sm text-muted">{r.description}</p>
              <p className="text-xs text-muted">
                {hoodNames[r.neighbourhood_id ?? ""] ?? "Unknown area"} · {fmtDateTime(r.created_at)}
                {r.duplicate_flags?.length ? " · possible duplicate flagged" : ""}
              </p>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
