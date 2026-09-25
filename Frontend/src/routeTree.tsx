import { createRouter } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { Route as IndexRoute } from "@/routes/index";
import { Route as AuthRoute } from "@/routes/auth";
import { Route as AuthRegisterRoute } from "@/routes/auth-register";
import { Route as DashboardRoute } from "@/routes/dashboard";
import { Route as InventoryRoute } from "@/routes/inventory";
import { Route as DebtorsRoute } from "@/routes/debtors";
import { Route as TransactionsRoute } from "@/routes/transactions";
import { Route as NotificationsRoute } from "@/routes/notifications";
import { Route as InsightsRoute } from "@/routes/insights";
import { Route as SettingsRoute } from "@/routes/settings";
import { Route as SandboxRoute } from "@/routes/sandbox";

const routeTree = RootRoute.addChildren([
  IndexRoute,
  AuthRoute,
  AuthRegisterRoute,
  DashboardRoute,
  InventoryRoute,
  DebtorsRoute,
  TransactionsRoute,
  NotificationsRoute,
  InsightsRoute,
  SettingsRoute,
  SandboxRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
