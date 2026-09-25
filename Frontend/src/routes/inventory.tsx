import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { InventoryView } from "@/components/views/inventory-view";
import { useSessionStore } from "@/store/session-store";
import { useInventoryStore } from "@/store/inventory-store";
import { useScanStore } from "@/store/scan-store";

function InventoryPage() {
  const inventoryLoading = useSessionStore((s) => s.loading.inventory);
  const inventory = useInventoryStore((s) => s.items);
  const stagedProducts = useScanStore((s) => s.stagedProducts);
  const activeStagedIdx = useScanStore((s) => s.activeStagedIdx);
  const scanning = useScanStore((s) => s.scanning);
  const setActiveStagedIdx = useScanStore((s) => s.setActiveStagedIdx);
  const triggerBatchScan = useScanStore((s) => s.triggerBatchScan);
  const updateStagedField = useScanStore((s) => s.updateStagedField);
  const commitBatch = useScanStore((s) => s.commitBatch);
  const discardBatch = useScanStore((s) => s.discardBatch);

  return (
    <InventoryView
      loading={inventoryLoading}
      inventory={inventory}
      stagedProducts={stagedProducts}
      activeStagedIdx={activeStagedIdx}
      scanning={scanning}
      onBatchScan={triggerBatchScan}
      onSelectStaged={setActiveStagedIdx}
      onUpdateStagedField={updateStagedField}
      onCommitBatch={commitBatch}
      onDiscardBatch={discardBatch}
    />
  );
}

const inventoryRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/inventory",
  component: InventoryPage,
});

export const Route = inventoryRoute;
