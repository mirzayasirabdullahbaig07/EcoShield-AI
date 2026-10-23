import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
      <ShieldCheck className="text-brand" size={26} aria-hidden />
      EcoShield AI
    </Link>
  );
}
