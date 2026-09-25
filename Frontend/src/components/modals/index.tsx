import { CashSaleModal } from "./cash-sale-modal";
import { LogDebtModal } from "./log-debt-modal";
import { IncomingTransferModal } from "./incoming-transfer-modal";
import { SettleDebtConfirmModal } from "./settle-debt-modal";
import { CollectDebtDrawer } from "./collect-debt-drawer";
import { EditProductDrawer } from "./edit-product-drawer";
import { useAccount } from "@/store/session-store";
import { useInventoryStore } from "@/store/inventory-store";
import { useDebtorsStore } from "@/store/debtors-store";
import { useUiStore } from "@/store/ui-store";
import { notify } from "@/store/notify";

export function Modals() {
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const inventory = useInventoryStore((s) => s.items);
  const manualCashSale = useInventoryStore((s) => s.manualCashSale);
  const processTransfer = useInventoryStore((s) => s.processTransfer);
  const logDebt = useDebtorsStore((s) => s.logDebt);
  const settleDebt = useDebtorsStore((s) => s.settleDebt);
  const settleTarget = useUiStore((s) => s.settleTarget);
  const collectTarget = useUiStore((s) => s.collectTarget);
  const editTarget = useUiStore((s) => s.editTarget);
  const incomingTransferAmount = useUiStore((s) => s.incomingTransferAmount);
  const incomingTransferSender = useUiStore((s) => s.incomingTransferSender);
  const incomingTransferBank = useUiStore((s) => s.incomingTransferBank);
  const { accountName, accountNumber, bankName } = useAccount();

  return (
    <>
      <IncomingTransferModal
        open={activeModal === "incoming-transfer"}
        onClose={closeModal}
        inventory={inventory}
        incomingAmount={incomingTransferAmount}
        sender={incomingTransferSender}
        bank={incomingTransferBank}
        onConfirm={(basket) => {
          basket.forEach(({ prodId, qty }) => processTransfer(prodId, qty, incomingTransferSender));
        }}
      />
      <CashSaleModal
        open={activeModal === "manual-cash"}
        onClose={closeModal}
        inventory={inventory}
        onConfirm={(basket) => { basket.forEach(({ prodId, qty }) => manualCashSale(prodId, qty)); }}
      />
      <LogDebtModal
        open={activeModal === "log-debt"}
        onClose={closeModal}
        onConfirm={logDebt}
        inventory={inventory}
      />
      <SettleDebtConfirmModal
        open={activeModal === "settle-debt"}
        onClose={closeModal}
        target={settleTarget}
        onConfirm={settleDebt}
      />
      <CollectDebtDrawer
        open={activeModal === "collect-debt"}
        onClose={closeModal}
        target={collectTarget}
        bankName={bankName}
        accountNumber={accountNumber}
        accountName={accountName}
        onRemind={(title, message) => notify(title, message)}
      />
      <EditProductDrawer
        open={activeModal === "edit-product"}
        onClose={closeModal}
        target={editTarget}
      />
    </>
  );
}
