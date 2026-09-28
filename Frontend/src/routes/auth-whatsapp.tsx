import { createRoute, useNavigate } from "@tanstack/react-router";
import { LockKey } from "@phosphor-icons/react";
import { Route as RootRoute } from "@/routes/__root";
import { AuthShell } from "@/components/auth/auth-shell";
import { WhatsAppConnectCard } from "@/components/whatsapp-connect-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

/**
 * Post-signup onboarding step. The backend can only file debts from a number
 * that matches a registered account, so we introduce WhatsApp here rather
 * than burying it in Settings. Skippable — Settings carries the same card.
 */
function WhatsAppOnboardingPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const navigate = useNavigate();

  // Never render nothing: an unauthenticated visitor (dead session, deep
  // link, hard refresh) used to hit a bare `return null`, which is just a
  // blank screen with nothing in the console to debug.
  if (!authenticated) {
    return (
      <AuthShell variant="whatsapp">
        <div className="rounded-sm border border-border bg-card p-6 text-center shadow-card">
          <span className="mx-auto grid size-10 place-items-center rounded-sm bg-muted text-muted-foreground">
            <LockKey weight="fill" className="size-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-foreground">
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your session ended, so we can&rsquo;t reach your Traka line yet. Sign
            in and pick this back up — it takes a second.
          </p>
          <Button
            className="mt-5 w-full"
            onClick={() => navigate({ to: "/auth" })}
          >
            Go to sign in
          </Button>
          <Button
            variant="ghost"
            className="mt-1 w-full"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Back to dashboard
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell variant="whatsapp">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-balance text-foreground">
          Your shop is live
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Now let&rsquo;s make sure you never chase a debtor again.
        </p>
      </div>

      <WhatsAppConnectCard onSkip={() => navigate({ to: "/dashboard" })} />
    </AuthShell>
  );
}

const authWhatsappRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/auth/whatsapp",
  component: WhatsAppOnboardingPage,
});

export const Route = authWhatsappRoute;
