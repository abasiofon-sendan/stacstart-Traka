import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { FeaturesPage } from "@/components/features-page";

function FeaturesRoutePage() {
  return <FeaturesPage />;
}

const featuresRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/features",
  component: FeaturesRoutePage,
});

export const Route = featuresRoute;
