import { create } from "zustand";
import { queryClient } from "@/lib/query-client";
import { notify } from "./notify";
import { useSessionStore } from "./session-store";
import { useInventoryStore } from "./inventory-store";
import { useDebtorsStore } from "./debtors-store";
import { useAiStore } from "./ai-store";
import { useScanStore } from "./scan-store";
import { useUiStore } from "./ui-store";

interface AuthState {
  authenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  handleAuth: () => void;
  logout: () => void;
}

/**
 * Session auth state. Server profile/stats stay in TanStack Query (see
 * session-store); this store only tracks whether a session token exists and
 * owns the sign-in / sign-out transitions.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  authenticated:
    typeof window !== "undefined" && localStorage.getItem("traka_user") !== null,

  setAuthenticated: (authenticated) => set({ authenticated }),

  handleAuth: () => {
    set({ authenticated: true });
    notify(
      "Session Active",
      "Merchant authenticated secure ledger session parameters.",
    );
  },

  // Sign out: drop the stored session, wipe every per-user detail so
  // nothing leaks into the next login on this device (server cache,
  // account/dashboard mirror, stock, debtors, AI chat + voice blobs,
  // staged scans, open modal targets), then route back to /auth through
  // the same event the backend 401 handler dispatches.
  logout: () => {
    localStorage.removeItem("traka_user");
    useAiStore.getState().clearAi();
    useScanStore.getState().clearScan();
    useUiStore.getState().closeModal();
    useSessionStore.getState().clearSession();
    useInventoryStore.getState().clearInventory();
    useDebtorsStore.getState().clearDebtors();
    queryClient.clear();
    set({ authenticated: false });
    window.dispatchEvent(new Event("traka:unauthorized"));
  },
}));
