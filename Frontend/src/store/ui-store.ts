import { create } from "zustand";
import type { DebtorEntry, InventoryItem, ModalId } from "./types";
import { useDebtorsStore } from "./debtors-store";
import { useInventoryStore } from "./inventory-store";

interface IncomingTransferPayload {
  amount: number;
  sender: string;
  bank: string;
}

interface UiState {
  activeModal: ModalId;
  incomingTransferAmount: number;
  incomingTransferSender: string;
  incomingTransferBank: string;
  settleTarget: DebtorEntry | null;
  collectTarget: DebtorEntry | null;
  editTarget: InventoryItem | null;
  setActiveModal: (v: ModalId) => void;
  closeModal: () => void;
  openSettleConfirm: (id: string) => void;
  openCollectDebt: (id: string) => void;
  openEditProduct: (item: InventoryItem) => void;
  openIncomingTransfer: () => void;
  receiveIncomingTransfer: (payload: IncomingTransferPayload) => void;
}

/** Modal/dialog open state and their targets. Looks up debtors/inventory
 *  via the domain stores — this store never owns server data itself. */
export const useUiStore = create<UiState>()((set) => ({
  activeModal: null,
  incomingTransferAmount: 0,
  incomingTransferSender: "",
  incomingTransferBank: "",
  settleTarget: null,
  collectTarget: null,
  editTarget: null,

  setActiveModal: (activeModal) => set({ activeModal }),

  closeModal: () =>
    set({
      activeModal: null,
      incomingTransferAmount: 0,
      incomingTransferSender: "",
      incomingTransferBank: "",
      settleTarget: null,
      collectTarget: null,
      editTarget: null,
    }),

  openSettleConfirm: (id) => {
    const target = useDebtorsStore.getState().entries.find((d) => d.id === id);
    if (target) set({ settleTarget: target, activeModal: "settle-debt" });
  },

  openCollectDebt: (id) => {
    const target = useDebtorsStore.getState().entries.find((d) => d.id === id);
    if (target) set({ collectTarget: target, activeModal: "collect-debt" });
  },

  openEditProduct: (item) => set({ editTarget: item, activeModal: "edit-product" }),

  openIncomingTransfer: () => {
    const items = useInventoryStore.getState().items;
    if (items.length === 0) return;
    const idx = Math.floor(Math.random() * items.length);
    const item = items[idx];
    if (!item) return;
    const multipliers = [1, 2, 3, 5];
    const m = multipliers[Math.floor(Math.random() * multipliers.length)] ?? 1;
    set({
      incomingTransferSender: "",
      incomingTransferBank: "",
      incomingTransferAmount: item.selling * m,
      activeModal: "incoming-transfer",
    });
  },

  receiveIncomingTransfer: ({ amount, sender, bank }) =>
    set({
      incomingTransferSender: sender,
      incomingTransferBank: bank,
      incomingTransferAmount: amount,
      activeModal: "incoming-transfer",
    }),
}));
