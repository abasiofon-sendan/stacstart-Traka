import { create } from "zustand";
import type { InventoryItem } from "./types";
import { notify } from "./notify";
import { getErrorMessage } from "@/lib/utils";

interface InventoryState {
  /** Local mirror of /inventory, adjusted by cash sales and batch commits. */
  items: InventoryItem[];
  replaceItems: (items: InventoryItem[]) => void;
  appendItems: (items: InventoryItem[]) => void;
  /** Instant local patch used for optimistic add/edit rollouts. */
  patchItem: (id: string, patch: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  /** Restore a snapshot after a failed optimistic mutation. */
  restoreItem: (item: InventoryItem) => void;
  manualCashSale: (prodId: string, qty: number) => Promise<void>;
  processTransfer: (prodId: string, qty: number, sender: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  items: [],

  replaceItems: (items) => set({ items }),

  appendItems: (items) => set((s) => ({ items: [...s.items, ...items] })),

  patchItem: (id, patch) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  restoreItem: (item) =>
    set((s) => ({
      items: s.items.some((i) => i.id === item.id)
        ? s.items.map((i) => (i.id === item.id ? item : i))
        : [...s.items, item],
    })),

  manualCashSale: async (prodId, qty) => {
    const item = get().items.find((i) => i.id === prodId);
    if (!item || item.qty < qty) return;
    // Optimistic: decrement stock immediately, roll back on failure.
    set({
      items: get().items.map((i) => (i.id === prodId ? { ...i, qty: i.qty - qty } : i)),
    });
    notify(
      "Cash Sale Recorded",
      `Manually logged cash payment of ₦${item.selling * qty} for ${qty}x ${item.name}.`,
    );
    const { api } = await import("@/lib/api");
    try {
      await api.post("/transactions/cash-sale", {
        sender_name: "Cash",
        items: [{ product_id: prodId, quantity: qty }],
      });
    } catch (err) {
      set({
        items: get().items.map((i) => (i.id === prodId ? { ...i, qty: i.qty + qty } : i)),
      });
      notify(
        "Sale Failed",
        getErrorMessage(err, "Could not record cash sale with server. Rolled back."),
        "destructive",
      );
    }
  },

  processTransfer: async (prodId, qty, sender) => {
    const item = get().items.find((i) => i.id === prodId);
    if (!item || item.qty < qty) return;
    // Optimistic: decrement stock immediately, roll back on failure.
    set({
      items: get().items.map((i) => (i.id === prodId ? { ...i, qty: i.qty - qty } : i)),
    });
    notify(
      "Transfer Received",
      `₦${item.selling * qty} transfer cleared for ${qty}x ${item.name}.`,
    );
    const { api } = await import("@/lib/api");
    try {
      await api.post("/transactions/cash-sale", {
        sender_name: sender || "Transfer",
        items: [{ product_id: prodId, quantity: qty }],
      });
    } catch (err) {
      set({
        items: get().items.map((i) => (i.id === prodId ? { ...i, qty: i.qty + qty } : i)),
      });
      notify(
        "Transfer Failed",
        getErrorMessage(err, "Could not record transfer with server. Rolled back."),
        "destructive",
      );
    }
  },
}));
