import { create } from "zustand";
import type { DebtorEntry, DebtorItem, PaidDebt } from "./types";
import { debtorsApi } from "@/lib/endpoints";
import { notify } from "./notify";
import { getErrorMessage } from "@/lib/utils";

interface DebtorsState {
  /** Local mirror of /debtors, adjusted by log/settle actions. */
  entries: DebtorEntry[];
  paidDebts: PaidDebt[];
  replaceEntries: (entries: DebtorEntry[]) => void;
  logDebt: (name: string, amount: number, date: string, items: DebtorItem[]) => Promise<void>;
  settleDebt: (id: string) => Promise<void>;
}

export const useDebtorsStore = create<DebtorsState>()((set, get) => ({
  entries: [],
  paidDebts: [],

  replaceEntries: (entries) => set({ entries }),

  logDebt: async (name, amount, date, items) => {
    // Optimistic: show the debt immediately, swap in the server id after.
    const tempId = `d-local-${Date.now()}`;
    set({ entries: [...get().entries, { id: tempId, name, amount, date, items }] });
    notify(
      "Credit Logged",
      `Logged ₦${amount} pending payment debt balance for ${name}.`,
    );
    try {
      const created = await debtorsApi.create({
        name,
        amount,
        items_summary: items.map((i) => `${i.qty}× ${i.product_name}`).join(", "),
        items: items.map((i) => ({
          product_name: i.product_name,
          qty: i.qty,
          price: i.price,
        })),
      });
      set({
        entries: get().entries.map((e) => (e.id === tempId ? { ...e, id: created.id } : e)),
      });
    } catch (err) {
      set({ entries: get().entries.filter((e) => e.id !== tempId) });
      notify(
        "Debt Log Failed",
        getErrorMessage(err, "Could not save debt to server. Rolled back."),
        "destructive",
      );
    }
  },

  settleDebt: async (id) => {
    const idx = get().entries.findIndex((d) => d.id === id);
    const target = idx >= 0 ? get().entries[idx]! : undefined;
    if (!target) return;
    // Optimistic: clear the debt immediately, roll back on failure.
    const paidEntry: PaidDebt = { name: target.name, amount: target.amount, time: "Just Now" };
    set({
      entries: get().entries.filter((d) => d.id !== id),
      paidDebts: [paidEntry, ...get().paidDebts],
    });
    notify(
      "Debt Fully Settled",
      `${target.name} cleared balance of ₦${target.amount.toLocaleString()}.`,
    );
    try {
      await debtorsApi.settle(id, { payment_method: "CASH" });
    } catch (err) {
      const entries = [...get().entries];
      entries.splice(Math.min(idx, entries.length), 0, target);
      set({
        entries,
        paidDebts: get().paidDebts.filter((p) => p !== paidEntry),
      });
      notify(
        "Settlement Failed",
        getErrorMessage(err, "Could not record settlement with server. Rolled back."),
        "destructive",
      );
    }
  },
}));
