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
import { useCountryStore } from "./country-store";
import { getCountry } from "@/lib/countries";
import { toMoney, asCurrency } from "@/lib/money";
import { seedCountryInventory } from "@/lib/seed";

// Routes that render no app data. /auth/whatsapp is the post-signup step —
// it polls its own /accounts/whatsapp-status but must not pull the whole
// dashboard down before the merchant has actually entered the app.
const MARKETING_ROUTES = ["/", "/auth", "/auth/register", "/auth/whatsapp"];

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

  // The account's country on the server is the truth. localStorage only
  // carries a guess — set at signup, or picked on the sign-in screen — so
  // wherever they disagree (an account created before signup sent `country`),
  // the server wins and the ledger relabels to the right currency.
  useEffect(() => {
    if (meData?.country) useCountryStore.getState().adoptCountry(meData.country);
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

  // Subscribed rather than read via getState(): adoptCountry() above runs in
  // an effect, and without a subscription this would keep the pre-/me country
  // until something else happened to re-render us — converting debts with one
  // country's scale while every display component formats in another's.
  // Products and debtors also carry their own currency from the API, so this
  // is only the fallback for payloads from before they did.
  const currency = getCountry(useCountryStore((s) => s.code)).currency.code;

  useEffect(() => {
    if (inventoryData) {
      useInventoryStore.getState().replaceItems(
        inventoryData.map((p) => {
          // Prefer the product's own currency: an account whose country we
          // have only just adopted must not render its stock in the old one.
          const c = asCurrency(p.currency, currency);
          return {
            id: p.id,
            name: p.name,
            qty: p.quantity,
            cost: p.cost_price,
            selling: p.selling_price,
            currency: c,
            costMinor: toMoney(p.cost_price, c).minor,
            sellingMinor: toMoney(p.selling_price, c).minor,
          };
        }),
      );
    }
  }, [inventoryData, currency]);

  // A brand-new store lands on an empty ledger otherwise. Only fires once per
  // account+country, and only when the inventory is genuinely empty or was
  // seeded at zero stock. /me must have resolved first: it carries the
  // account's real country, and seeding before it lands would post another
  // market's products at its prices.
  useEffect(() => {
    if (!appDataEnabled || inventoryLoading || !meData) return;
    void seedCountryInventory(inventoryData);
  }, [appDataEnabled, inventoryLoading, meData, inventoryData]);

  useEffect(() => {
    if (debtorsData) {
      useDebtorsStore.getState().replaceEntries(
        debtorsData.debtors.map((d) => {
          const c = asCurrency(d.currency, currency);
          return {
            id: d.id,
            name: d.name,
            amount: d.amount,
            date: d.created_at.split("T")[0]!,
            items: d.items.map((i) => ({
              product_name: i.product_name,
              qty: i.qty,
              price: i.price,
            })),
            currency: c,
            amountMinor: toMoney(d.amount, c).minor,
          };
        }),
      );
    }
  }, [debtorsData, currency]);

  return <>{children}</>;
}
