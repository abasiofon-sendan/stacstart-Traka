import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { DashboardView } from "@/components/views/dashboard-view";
import { useSessionStore, useDashboardStats, useAccount } from "@/store/session-store";
import { useInventoryStore } from "@/store/inventory-store";
import { useUiStore } from "@/store/ui-store";
import { useScanStore } from "@/store/scan-store";

function DashboardPage() {
  const dashboardLoading = useSessionStore((s) => s.loading.dashboard);
  const { revenue, profit, totalDebt, unpaidDebtorCount, lowStockCount } = useDashboardStats();
  const inventory = useInventoryStore((s) => s.items);
  const { accountName, accountNumber } = useAccount();
  const openIncomingTransfer = useUiStore((s) => s.openIncomingTransfer);
  const setActiveModal = useUiStore((s) => s.setActiveModal);
  const addStagedProduct = useScanStore((s) => s.addStagedProduct);
  const navigate = useNavigate();

  return (
    <DashboardView
      loading={dashboardLoading}
      revenue={revenue}
      profit={profit}
      totalDebt={totalDebt}
      unpaidDebtorCount={unpaidDebtorCount}
      lowStockCount={lowStockCount}
      inventory={inventory}
      accountName={accountName}
      accountNumber={accountNumber}
      onSimulateTransfer={openIncomingTransfer}
      onOpenCashModal={() => setActiveModal("manual-cash")}
      onNavigateInventory={() => navigate({ to: "/inventory" })}
      onAddProduct={addStagedProduct}
    />
  );
}

const dashboardRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

export const Route = dashboardRoute;
