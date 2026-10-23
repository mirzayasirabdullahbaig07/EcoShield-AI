import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";

export default function VerifyNotFound() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Logo />
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">No public record found</h1>
        <p className="text-sm text-muted">There is no public record with this ID. It may not exist, or it may not have been approved yet. Check the ID and try again.</p>
      </Card>
    </main>
  );
}
