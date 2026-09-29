/**
 * Money is held and printed in whole minor units with a currency code, so a
 * 1,500.50 naira sale and a 1,500 shilling sale never get mixed up or rounded
 * into each other. Amounts cross the API boundary in major units because the
 * backend stores floats — `toMoney`/`toMajor` are the only two places that
 * conversion happens.
 */

import { useCallback } from "react";
import { getCountry, type CountryConfig, type CurrencyCode } from "./countries";
import { useCountryStore, activeCountry } from "@/store/country-store";

export interface Money {
  /** Whole minor units: kobo, cents, or plain shillings for UGX. */
  minor: number;
  currency: CurrencyCode;
}

/** Minor units per major unit. UGX has no minor unit, so this is 1. */
export function scaleFor(currency: CurrencyCode): number {
  return getCountryForCurrency(currency).currency.decimals === 0 ? 1 : 100;
}

const CURRENCY_OWNERS: Record<CurrencyCode, CountryConfig> = {
  NGN: getCountry("NG"),
  KES: getCountry("KE"),
  GHS: getCountry("GH"),
  UGX: getCountry("UG"),
};

export function getCountryForCurrency(currency: CurrencyCode): CountryConfig {
  return CURRENCY_OWNERS[currency];
}

/**
 * Narrow an untrusted currency string (straight off an API payload) to a code
 * we can format with — `getCountryForCurrency` indexes a record, so an unknown
 * code would otherwise throw.
 */
export function asCurrency(
  code: string | null | undefined,
  fallback: CurrencyCode = "NGN",
): CurrencyCode {
  return code && code in CURRENCY_OWNERS ? (code as CurrencyCode) : fallback;
}

/** Major units (as the API sends them) → whole minor units. */
export function toMoney(amount: number, currency: CurrencyCode): Money {
  const scale = scaleFor(currency);
  // `Math.round` on the scaled value keeps float dust (0.1 + 0.2) from
  // producing 14999 minor units where 15000 is correct. For UGX the scale is
  // 1, so a fractional amount rounds to whole shillings — the currency has no
  // subunit, and inventing one would be wrong.
  return { minor: Math.round(amount * scale), currency };
}

/** Whole minor units → major units, for API writes. */
export function toMajor(money: Money): number {
  return money.minor / scaleFor(money.currency);
}

/** Major units → whole minor units using the active country's currency. */
export function toLocalMinor(amount: number, country: CountryConfig): number {
  return Math.round(amount * scaleFor(country.currency.code));
}

const FORMATTERS = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: CurrencyCode, withDecimals: boolean): Intl.NumberFormat {
  const key = `${currency}:${withDecimals}`;
  let fmt = FORMATTERS.get(key);
  if (!fmt) {
    const decimals = getCountryForCurrency(currency).currency.decimals;
    fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: withDecimals ? decimals : 0,
      maximumFractionDigits: decimals,
    });
    FORMATTERS.set(key, fmt);
  }
  return fmt;
}

/**
 * Whole minor units → "$7,800.00". Without `withDecimals` a whole amount
 * prints clean: "USh 780,000", never "USh 780,000.00".
 */
export function formatMinor(
  minor: number,
  currency: CurrencyCode,
  withDecimals = false,
): string {
  const amount = minor / scaleFor(currency);
  return formatterFor(currency, withDecimals).format(amount);
}

export function formatMoney(money: Money, withDecimals = false): string {
  return formatMinor(money.minor, money.currency, withDecimals);
}

/**
 * Major-unit amount straight off the API → formatted string in the active
 * country's currency. This is what the views call.
 */
export function formatAmount(
  amount: number,
  country: CountryConfig,
  withDecimals = false,
): string {
  return formatMinor(toLocalMinor(amount, country), country.currency.code, withDecimals);
}

/** "KSh 7,800" — symbol first, for places where the symbol reads better. */
export function formatWithSymbol(
  amount: number,
  country: CountryConfig,
  withDecimals = false,
): string {
  return `${country.currency.symbol} ${formatAmount(amount, country, withDecimals)
    .replace(/^[^\d-]+/, "")
    .trim()}`;
}

/**
 * Amount → formatted string, bound to the active country and re-rendered when
 * the country changes. This is what every view and modal calls: `money(1250)`.
 */
export function useMoney(): (amount: number, withDecimals?: boolean) => string {
  const code = useCountryStore((s) => s.code);
  return useCallback(
    (amount: number, withDecimals = false) =>
      formatAmount(amount, getCountry(code), withDecimals),
    [code],
  );
}

/**
 * Same thing for non-React callers — zustand stores, toast helpers, share
 * text. Reads the country at call time, so it never goes stale.
 */
export function money(amount: number, withDecimals = false): string {
  return formatAmount(amount, activeCountry(), withDecimals);
}
