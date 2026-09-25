import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { DebtorsView } from "@/components/views/debtors-view";
import { useSessionStore } from "@/store/session-store";
import { useDebtorsStore } from "@/store/debtors-store";
import { useUiStore } from "@/store/ui-store";

function DebtorsPage() {
  const debtorsLoading = useSessionStore((s) => s.loading.debtors);
  const debtors = useDebtorsStore((s) => s.entries);
  const openSettleConfirm = useUiStore((s) => s.openSettleConfirm);
  const openCollectDebt = useUiStore((s) => s.openCollectDebt);
  const setActiveModal = useUiStore((s) => s.setActiveModal);

  return (
    <DebtorsView
      loading={debtorsLoading}
      debtors={debtors}
      onOpenLogDebt={() => setActiveModal("log-debt")}
      onCollectDebt={openCollectDebt}
      onMarkPaid={openSettleConfirm}
    />
  );
}

const debtorsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/debtors",
  component: DebtorsPage,
});

export const Route = debtorsRoute;
