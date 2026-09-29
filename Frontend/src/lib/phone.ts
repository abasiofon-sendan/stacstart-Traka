/** Backend contract unchanged: numbers are stored/sent as 0XXXXXXXXX. */
import type { CountryConfig } from "./countries";

/**
 * Validated against the number WITHOUT its leading zero — the form state, the
 * same way the Nigerian rule always worked.
 */
export function isValidLocalPhone(digits: string, country: CountryConfig): boolean {
  return new RegExp(country.phone.pattern).test(digits);
}

/** Prefixes a local entry with the leading zero. */
export function toStoredPhone(digits: string): string {
  return `0${digits}`;
}

/** "0712 345 678" — the stored number grouped for display next to a flag. */
export function formatPhone(stored: string, country: CountryConfig): string {
  const digits = stored.replace(/\D/g, "");
  const local = digits.startsWith("0") ? digits.slice(1) : digits;
  const groups =
    country.code === "NG"
      ? [local.slice(0, 3), local.slice(3, 6), local.slice(6)]
      : [local.slice(0, 2), local.slice(2, 5), local.slice(5)];
  return `${country.phone.dial} ${groups.filter(Boolean).join(" ")}`;
}
