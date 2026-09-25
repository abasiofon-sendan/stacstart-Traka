import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuthStore } from "@/store/auth-store";
import { useNavigate } from "@tanstack/react-router";

function AuthPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const handleAuth = useAuthStore((s) => s.handleAuth);
  const navigate = useNavigate();

  if (authenticated) {
    navigate({ to: "/dashboard", replace: true });
    return null;
  }

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
