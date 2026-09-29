import { create } from "zustand";
import {
  getCountry,
  type CountryCode,
  type CountryConfig,
} from "@/lib/countries";

const STORAGE_KEY = "traka_country";

function readStoredCountry(): CountryCode {
  if (typeof window === "undefined") return "NG";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "KE" || stored === "GH" || stored === "UG" || stored === "NG"
    ? stored
    : "NG";
}

interface CountryState {
  code: CountryCode;
  setCountry: (code: CountryCode) => void;
}

/**
 * The active country. Set at signup, remembered afterwards, and switchable
 * from sign-in. It drives currency, phone format, payment labels, language and
 * seed data — everything country-specific in `lib/countries.ts`.
 *
 * Non-React callers (toasts, zustand stores) use `activeCountry()`.
 */
export const useCountryStore = create<CountryState>()((set) => ({
  code: readStoredCountry(),

  setCountry: (code) => {
    localStorage.setItem(STORAGE_KEY, code);
    set({ code });
  },
}));

/** Active country config, for use outside React components. */
export function activeCountry(): CountryConfig {
  return getCountry(useCountryStore.getState().code);
}
