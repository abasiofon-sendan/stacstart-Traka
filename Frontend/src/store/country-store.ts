import { create } from "zustand";
import {
  DEFAULT_COUNTRY,
  getCountry,
  isCountryCode,
  type CountryCode,
  type CountryConfig,
} from "@/lib/countries";

const STORAGE_KEY = "traka_country";

function readStoredCountry(): CountryCode {
  if (typeof window === "undefined") return DEFAULT_COUNTRY;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isCountryCode(stored) ? stored : DEFAULT_COUNTRY;
}

interface CountryState {
  code: CountryCode;
  setCountry: (code: CountryCode) => void;
  /**
   * Adopt a country that came from the server. Ignores codes this build
   * doesn't know, so a newer backend can't push an older client sideways.
   */
  adoptCountry: (raw: string) => void;
}

/**
 * The active country. Set at signup, remembered afterwards, and switchable
 * from sign-in. It drives currency, phone format, payment labels, language and
 * seed data — everything country-specific in `lib/countries.ts`.
 *
 * localStorage carries it between sessions, but the account's own country on
 * `/accounts/me` is what actually wins — see StoreBootstrap.
 *
 * Non-React callers (toasts, zustand stores) use `activeCountry()`.
 */
export const useCountryStore = create<CountryState>()((set, get) => ({
  code: readStoredCountry(),

  setCountry: (code) => {
    localStorage.setItem(STORAGE_KEY, code);
    set({ code });
  },

  adoptCountry: (raw) => {
    if (!isCountryCode(raw) || get().code === raw) return;
    localStorage.setItem(STORAGE_KEY, raw);
    set({ code: raw });
  },
}));

/** Active country config, for use outside React components. */
export function activeCountry(): CountryConfig {
  return getCountry(useCountryStore.getState().code);
}
