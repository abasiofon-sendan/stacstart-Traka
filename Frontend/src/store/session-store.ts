import { create } from "zustand";
import type { AccountMeResponse, DashboardResponse } from "@/lib/endpoints";

interface LoadingFlags {
  inventory: boolean;
  debtors: boolean;
  dashboard: boolean;
}

interface SessionState {
  /** Latest /me payload (written by StoreBootstrap, read via useAccount). */
  me: AccountMeResponse | null;
  /** Latest dashboard payload (written by StoreBootstrap). */
  dashboard: DashboardResponse | null;
  /** First-load flags for the bootstrap queries (drives the preloader). */
  loading: LoadingFlags;
  setMe: (me: AccountMeResponse | null) => void;
  setDashboard: (dashboard: DashboardResponse | null) => void;
  setLoading: (loading: LoadingFlags) => void;
}

/**
 * Read-only mirror of the two server queries every screen needs. The queries
 * themselves still live in TanStack Query and are owned by StoreBootstrap —
 * this store just lets components select derived fields without re-fetching.
 */
export const useSessionStore = create<SessionState>()((set) => ({
  me: null,
  dashboard: null,
  loading: { inventory: false, debtors: false, dashboard: false },
  setMe: (me) => set({ me }),
  setDashboard: (dashboard) => set({ dashboard }),
  setLoading: (loading) => set({ loading }),
}));

export function useAccount(): {
  accountName: string;
  accountNumber: string;
  bankName: string;
} {
  const me = useSessionStore((s) => s.me);
  return {
    accountName: me?.business_name ?? "",
    accountNumber: me?.virtual_account_number ?? "",
    bankName: "Wema Bank",
  };
}

export function useDashboardStats(): {
  revenue: number;
  profit: number;
  totalDebt: number;
  unpaidDebtorCount: number;
  lowStockCount: number;
} {
  const dashboard = useSessionStore((s) => s.dashboard);
  return {
    revenue: dashboard?.today_revenue ?? 0,
    profit: dashboard?.today_profit ?? 0,
    totalDebt: dashboard?.total_debt_outstanding ?? 0,
    unpaidDebtorCount: dashboard?.unpaid_debtor_count ?? 0,
    lowStockCount: dashboard?.low_stock_count ?? 0,
  };
}
