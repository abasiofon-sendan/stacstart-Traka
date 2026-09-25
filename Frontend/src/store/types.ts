export type TabId = "dashboard" | "inventory" | "debtors";

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  cost: number;
  selling: number;
}

export interface DebtorItem {
  product_name: string;
  qty: number;
  price: number;
}

export interface DebtorEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  items: DebtorItem[];
}

/** Transient basket item used in the Log Credit Sale form. */
export interface CreditBasketItem {
  inventoryId: string;
  product_name: string;
  qty: number;
  unit_price: number;
}

export interface PaidDebt {
  name: string;
  amount: number;
  time: string;
}

export interface Notification {
  id: number;
  title: string;
  desc: string;
  type: "system" | "sale" | "credit";
  time: string;
}

export interface StagedProduct {
  name: string;
  qty: number;
  cost: number;
  selling: number;
  img: string;
}

export type ModalId = "manual-cash" | "log-debt" | "incoming-transfer" | "settle-debt" | "collect-debt" | "edit-product" | null;
