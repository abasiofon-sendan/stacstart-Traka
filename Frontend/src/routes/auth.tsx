import { useEffect } from "react";
import { createRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuthStore } from "@/store/auth-store";

function AuthPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const handleAuth = useAuthStore((s) => s.handleAuth);
  const navigate = useNavigate();
  const location = useLocation();

  // Guard runs in an effect (not the render body) so handleAuth() + navigate()
  // in the same tick can't be hijacked by a redirect fired during render.
  useEffect(() => {
    if (authenticated && location.pathname === "/auth") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authenticated, location.pathname, navigate]);

  return (
    <AuthShell variant="signin">
      <SignInForm
        onAuthenticate={() => {
          handleAuth();
          navigate({ to: "/dashboard", replace: true });
        }}
      />
    </AuthShell>
  );
}

const authRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/auth",
  component: AuthPage,
});

export const Route = authRoute;
