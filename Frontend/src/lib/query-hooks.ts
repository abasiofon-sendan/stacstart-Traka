import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  accountsApi,
  inventoryApi,
  transactionsApi,
  debtorsApi,
  notificationsApi,
  activityApi,
  reportsApi,
  type ProductCreate,
  type ProductUpdate,
  type CashSaleRequest,
  type DebtorCreate,
  type AccountCreate,
  type AccountLogin,
  type ReconcileRequest,
} from "./endpoints";

/* ─── Keys ─── */

export const queryKeys = {
  me: ["me"] as const,
  whatsapp: {
    setup: ["whatsapp", "setup"] as const,
    status: ["whatsapp", "status"] as const,
  },
  inventory: { all: ["inventory"] as const, detail: (id: string) => ["inventory", id] as const },
  transactions: { all: ["transactions"] as const, unallocated: ["transactions", "unallocated"] as const },
  debtors: { all: ["debtors"] as const },
  notifications: { all: ["notifications"] as const },
  activity: { recent: ["activity", "recent"] as const },
  reports: { weekly: ["reports", "weekly"] as const, dashboard: ["reports", "dashboard"] as const },
};

/* ─── Account ─── */

export function useSignup() {
  return useMutation({
    mutationFn: (data: AccountCreate) => accountsApi.signup(data),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: AccountLogin) => accountsApi.login(data),
  });
}

/* ─── WhatsApp linking ─── */

/** Public sandbox join config (number, code, wa.me link). Stable — no polling. */
export function useWhatsAppSetup(enabled = true) {
  return useQuery({
    queryKey: queryKeys.whatsapp.setup,
    queryFn: () => accountsApi.whatsappSetup(),
    enabled,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

/**
 * Polls "has this account's number messaged us yet" until it flips true.
 * Stops polling on success so we don't keep hitting the API once connected.
 */
export function useWhatsAppStatus(enabled = true, poll = true) {
  return useQuery({
    queryKey: queryKeys.whatsapp.status,
    queryFn: () => accountsApi.whatsappStatus(),
    enabled,
    refetchInterval: (query) => {
      if (!poll) return false;
      return query.state.data?.linked ? false : 4_000;
    },
    retry: 1,
  });
}

/* ─── Inventory ─── */

export function useInventory(enabled = true) {
  return useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: () => inventoryApi.list(),
    enabled,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id),
    queryFn: () => inventoryApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreate) => inventoryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductUpdate) => inventoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
  });
}

export function useExtractProduct() {
  return useMutation({
    mutationFn: (files: File[]) => inventoryApi.extractProduct(files),
  });
}

/* ─── Transactions ─── */

export function useTransactions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.transactions.all,
    queryFn: () => transactionsApi.list(),
    enabled,
  });
}

export function useCashSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CashSaleRequest) => transactionsApi.cashSale(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useTriggerTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.triggerTransfer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useUnallocatedTransactions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.transactions.unallocated,
    queryFn: () => transactionsApi.unallocated(),
    enabled,
  });
}

/* ─── Debtors ─── */

export function useDebtors(enabled = true) {
  return useQuery({
    queryKey: queryKeys.debtors.all,
    queryFn: () => debtorsApi.list(),
    enabled,
  });
}

export function useCreateDebtor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DebtorCreate) => debtorsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.debtors.all }),
  });
}

export function useSettleDebtor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payment_method }: { id: string; payment_method: string }) =>
      debtorsApi.settle(id, { payment_method }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.debtors.all }),
  });
}

/* ─── Notifications ─── */

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationsApi.list(),
    enabled,
    refetchInterval: 15_000,
  });
}

/* ─── Activity ─── */

export function useRecentActivity(enabled = true) {
  return useQuery({
    queryKey: queryKeys.activity.recent,
    queryFn: () => activityApi.recent(),
    enabled,
    refetchInterval: 15_000,
  });
}

/* ─── Reports ─── */

export function useWeeklyReport(enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.weekly,
    queryFn: () => reportsApi.weekly(),
    enabled,
    refetchInterval: 30_000,
  });
}

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.dashboard,
    queryFn: () => reportsApi.dashboard(),
    enabled,
    refetchInterval: 15_000,
  });
}

/* ─── Reconcile ─── */

export function useReconcile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReconcileRequest) => transactionsApi.reconcile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: queryKeys.transactions.unallocated });
    },
  });
}

/* ─── Me ─── */

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => accountsApi.me(),
    enabled,
    // Retry transient failures (network blips, laptop wake, 5xx) up to 3× —
    // but never a 4xx; only the interceptor may end the session on 401.
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status !== undefined && status < 500) return false;
      }
      return failureCount < 3;
    },
  });
}
