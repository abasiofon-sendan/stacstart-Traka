import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { LandingPage } from "@/components/landing-page";

function IndexPage() {
  return <LandingPage />;
}

const indexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: IndexPage,
});

export const Route = indexRoute;
