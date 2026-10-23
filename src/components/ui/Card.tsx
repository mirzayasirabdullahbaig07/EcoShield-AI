import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  interactive,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      data-spotlight={interactive ? "" : undefined}
      className={cn(
        "group rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-[0_1px_2px_rgba(16,33,27,0.04)]",
        interactive &&
          "transition duration-200 hover:-translate-y-1 active:scale-[0.99] hover:border-brand/60 hover:shadow-[0_16px_36px_-14px_rgba(15,107,76,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
