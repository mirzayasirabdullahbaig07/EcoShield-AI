import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "danger" | "light";

const styles: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand-dark font-semibold",
  light: "bg-white text-brand-dark hover:bg-brand-soft font-semibold",
  outline: "border border-brand/50 text-brand hover:bg-brand/10",
  ghost: "text-muted hover:text-ink hover:bg-tint",
  danger: "border border-risk-high/60 text-risk-high hover:bg-risk-high/10",
};

type Props = {
  variant?: Variant;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ variant = "primary", href, className, children, ...rest }: Props) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    styles[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
