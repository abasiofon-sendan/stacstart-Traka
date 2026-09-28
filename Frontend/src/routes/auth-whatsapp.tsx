import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { AuthShell } from "@/components/auth/auth-shell";
import { WhatsAppConnectCard } from "@/components/whatsapp-connect-card";
import { useAuthStore } from "@/store/auth-store";

/**
 * Post-signup onboarding step. The backend can only file debts from a number
 * that matches a registered account, so we introduce WhatsApp here rather
 * than burying it in Settings. Skippable — Settings carries the same card.
 */
function WhatsAppOnboardingPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const navigate = useNavigate();

  if (!authenticated) {
    navigate({ to: "/auth", replace: true });
    return null;
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
