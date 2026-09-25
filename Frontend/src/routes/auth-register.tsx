import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuthStore } from "@/store/auth-store";

function RegisterPage() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const handleAuth = useAuthStore((s) => s.handleAuth);
  const navigate = useNavigate();

  if (authenticated) {
    navigate({ to: "/dashboard", replace: true });
    return null;
  }

  return (
    <AuthShell variant="signup">
      <RegisterForm
        onAuthenticate={() => {
          handleAuth();
          navigate({ to: "/dashboard", replace: true });
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
