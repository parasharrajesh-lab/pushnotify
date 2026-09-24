import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background text-foreground">
        <p className="font-display text-4xl font-medium">Nock</p>
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <Shell />;
}
