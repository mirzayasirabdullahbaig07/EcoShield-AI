import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-tint2/70", className)} />;
}

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="flex items-start gap-3 border-risk-high/40" >
      <AlertCircle className="mt-0.5 shrink-0 text-risk-high" size={20} aria-hidden />
      <div role="alert">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted">{message}</p>
      </div>
    </Card>
  );
}
