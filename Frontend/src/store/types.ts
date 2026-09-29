import type { CurrencyCode } from "@/lib/countries";

export type TabId = "dashboard" | "inventory" | "debtors";

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  /** Major units, as the API sends them. */
  cost: number;
  /** Major units, as the API sends them. */
  selling: number;
  /** Currency this record belongs to. */
  currency: CurrencyCode;
  /** Whole minor units — the canonical stored amount. */
  costMinor: number;
  sellingMinor: number;
}

export interface DebtorItem {
  product_name: string;
  qty: number;
  price: number;
}

export interface DebtorEntry {
  id: string;
  name: string;
  /** Major units, as the API sends them. */
  amount: number;
  date: string;
  items: DebtorItem[];
  /** Currency this record belongs to. */
  currency: CurrencyCode;
  /** Whole minor units — the canonical stored amount. */
  amountMinor: number;
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
