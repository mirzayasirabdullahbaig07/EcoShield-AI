import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { SpotlightEffect } from "@/components/ui/SpotlightEffect";
import { PrefsApplier } from "@/components/profile/PrefsApplier";

export const metadata: Metadata = {
  title: "EcoShield AI: Know the risk. Protect what matters. Prove the impact.",
  description:
    "Understand flood risk in your neighbourhood, take practical action, and create verifiable records of community climate actions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}<SpotlightEffect /><PrefsApplier /></body>
    </html>
  );
}
