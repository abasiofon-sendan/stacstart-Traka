import { create } from "zustand";
import { queryClient } from "@/lib/query-client";
import { notify } from "./notify";

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

  // Sign out: drop the stored session, wipe the query cache so nothing
  // leaks into the next login, then route back to /auth through the same
  // event the backend 401 handler dispatches.
  logout: () => {
    localStorage.removeItem("traka_user");
    queryClient.clear();
    set({ authenticated: false });
    window.dispatchEvent(new Event("traka:unauthorized"));
  },
}));
