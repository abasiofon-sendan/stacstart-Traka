import { useEffect, useRef, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { useToast } from "@/components/ui/toast";
import { useInventory, useDebtors, useDashboard, useMe } from "@/lib/query-hooks";
import { queryClient } from "@/lib/query-client";
import { setNotifyHandler } from "./notify";
import { useAuthStore } from "./auth-store";
import { useSessionStore } from "./session-store";
import { useInventoryStore } from "./inventory-store";
import { useDebtorsStore } from "./debtors-store";

const MARKETING_ROUTES = ["/", "/auth", "/auth/register"];

interface StoreBootstrapProps {
  children: ReactNode;
  /** Current pathname — App sits above the router, so main.tsx subscribes
      to history changes and passes the path down. */
  pathname: string;
}

/**
 * Replaces AppProvider. Owns the app-data queries (route-gated, never on
 * landing/auth), the /me 401 handler, login invalidation, and hydration of
 * the session/inventory/debtors mirrors. No UI of its own.
 */
export function StoreBootstrap({ children, pathname }: StoreBootstrapProps) {
  const { toast } = useToast();
  const authenticated = useAuthStore((s) => s.authenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  // Stores toast outside React; the bridge lives here inside ToastProvider.
  useEffect(() => {
    setNotifyHandler((title, description, variant) =>
      toast({ title, description, variant }),
    );
    return () => setNotifyHandler(null);
  }, [toast]);

  // Fetch app data only on app routes — never on landing/auth, even when a
  // stored session token exists (that's what spammed /reports, /inventory…).
  const appDataEnabled = authenticated && !MARKETING_ROUTES.includes(pathname);
  const { data: meData, isError: meError } = useMe(appDataEnabled);
  const { data: inventoryData, isLoading: inventoryLoading } =
    useInventory(appDataEnabled);
  const { data: debtorsData, isLoading: debtorsLoading } = useDebtors(appDataEnabled);
  const { data: dashboardData, isLoading: dashboardLoading } =
    useDashboard(appDataEnabled);

  useEffect(() => {
    if (!meError) return;
    // Only a genuine auth rejection ends the session. Transient /me failures
    // (network blip, sleep/wake, 5xx) must never kill the app chrome.
    const status = isAxiosError(meError) ? meError.response?.status : undefined;
    if (status === 401 || status === 403) setAuthenticated(false);
  }, [meError, setAuthenticated]);

  const prevAuth = useRef(authenticated);
  useEffect(() => {
    if (authenticated && !prevAuth.current) {
      queryClient.invalidateQueries();
    }
    prevAuth.current = authenticated;
  }, [authenticated]);

  useEffect(() => {
    useSessionStore.getState().setMe(meData ?? null);
  }, [meData]);

  useEffect(() => {
    useSessionStore.getState().setDashboard(dashboardData ?? null);
  }, [dashboardData]);

  useEffect(() => {
    useSessionStore.getState().setLoading({
      inventory: inventoryLoading,
      debtors: debtorsLoading,
      dashboard: dashboardLoading,
    });
  }, [inventoryLoading, debtorsLoading, dashboardLoading]);

  useEffect(() => {
    if (inventoryData) {
      useInventoryStore.getState().replaceItems(
        inventoryData.map((p) => ({
          id: p.id,
          name: p.name,
          qty: p.quantity,
          cost: p.cost_price,
          selling: p.selling_price,
        })),
      );
    }
  }, [inventoryData]);

  useEffect(() => {
    if (debtorsData) {
      useDebtorsStore.getState().replaceEntries(
        debtorsData.debtors.map((d) => ({
          id: d.id,
          name: d.name,
          amount: d.amount,
          date: d.created_at.split("T")[0]!,
          items: d.items.map((i) => ({
            product_name: i.product_name,
            qty: i.qty,
            price: i.price,
          })),
        })),
      );
    }
  }, [debtorsData]);

  return <>{children}</>;
}
