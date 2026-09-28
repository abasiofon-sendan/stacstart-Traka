import { createRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

function RegisterPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const handleAuth = useAuthStore((s) => s.handleAuth);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect an already-signed-in visitor away — but only while still sitting
  // on this route. handleAuth() flips `authenticated` immediately after signup
  // and we navigate to /auth/whatsapp in the same tick; guarding inside the
  // render body used to win that race and bounce the user to the dashboard.
  useEffect(() => {
    if (authenticated && location.pathname === "/auth/register") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authenticated, location.pathname, navigate]);

  return (
    <AuthShell variant="signup">
      <RegisterForm
        onAuthenticate={() => {
          handleAuth();
          navigate({ to: "/auth/whatsapp" });
        }}
      />
    </AuthShell>
  );
}

const registerRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/auth/register",
  component: RegisterPage,
});

export const Route = registerRoute;
