/**
 * One config entry per country. Everything country-specific in the app reads
 * from here: currency + decimals, phone format, payment label, languages,
 * seed products and demo stores.
 *
 * The backend has no country/currency column yet, so this file is the single
 * source of truth on the client. When `Account.country` lands server-side, the
 * signup country gets persisted there and this config stays as the lookup.
 */

import type { AiLanguage } from "./endpoints";

export type CountryCode = "NG" | "KE" | "GH" | "UG";
export type CurrencyCode = "NGN" | "KES" | "GHS" | "UGX";

export interface SeedProduct {
  name: string;
  /** Major units (naira/shillings/cedis). Converted to minor units on display. */
  cost: number;
  /** Major units. */
  price: number;
  qty: number;
}

export interface DemoAccount {
  /** Stored format: leading zero + national digits. */
  phone: string;
  store: string;
  role: string;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: {
    code: CurrencyCode;
    /** Used for compact display where a full word is too long. */
    symbol: string;
    /** Major-unit name, e.g. "Nigerian Naira". */
    name: string;
    /** Minor-unit digits: 100 for NGN/KES/GHS, 1 for UGX. */
    decimals: 0 | 2;
  };
  phone: {
    dial: string;
    /** Validated against the number WITHOUT its leading zero. */
    pattern: string;
    /** How many digits the merchant types, leading zero excluded. */
    localDigits: number;
    /** Placeholder for the phone field, e.g. "801 234 5678". */
    example: string;
    /** Shown as the field helper and in the invalid-phone toast. */
    helper: string;
  };
  payment: {
    /** How we name the payment source in-app for this country. */
    label: string;
    /** Short form for buttons and action cards. */
    short: string;
  };
  languages: AiLanguage[];
  defaultLanguage: AiLanguage;
  sampleStore: string;
  demoAccounts: DemoAccount[];
  seedProducts: SeedProduct[];
  /** Landing + settings copy that names the country. */
  copy: {
    footerLine: string;
    /** The merchant's store number in the landing "how it works" visual. */
    storeNumber: string;
    /** City used in the landing "field notes" label. */
    market: string;
    /** Locally-named customers used in the landing examples. */
    customerA: string;
    customerB: string;
    /** Named amounts used by the landing marketing sections, major units. */
    demo: {
      cashSale: number;
      transfer: number;
      debtorOne: number;
      debtorTwo: number;
      debtorTotal: number;
      /** Most recent settled payment, used in the voice examples. */
      lastPayment: number;
      dayTotal: number;
      dayCash: number;
      dayTransfer: number;
      dailyCloseCash: number;
      dailyCloseTransfer: number;
    };
  };
}

const COUNTRIES: Record<CountryCode, CountryConfig> = {
  NG: {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: {
      code: "NGN",
      symbol: "₦",
      name: "Nigerian Naira",
      decimals: 2,
    },
    phone: {
      dial: "+234",
      pattern: "^[789]\\d{9}$",
      localDigits: 10,
      example: "801 234 5678",
      helper: "Start with 070, 080 or 090.",
    },
    payment: {
      label: "Store account",
      short: "Bank transfer",
    },
    languages: ["en", "pidgin", "ha", "yo"],
    defaultLanguage: "en",
    sampleStore: "Mama Blessing Stores",
    demoAccounts: [{ phone: "08100000001", store: "Mama Blessing", role: "Foodstuff" }],
    seedProducts: [
      { name: "Peak Milk Tin", cost: 1050, price: 1200, qty: 24 },
      { name: "Indomie Noodles (Carton)", cost: 4300, price: 4800, qty: 18 },
      { name: "Loaf of Bread", cost: 700, price: 850, qty: 30 },
      { name: "Coconut Oil 1L", cost: 6200, price: 6800, qty: 12 },
      { name: "Rice 50kg Bag", cost: 32000, price: 35500, qty: 8 },
      { name: "Tomato Paste Tin", cost: 1550, price: 1800, qty: 20 },
    ],
    copy: {
      footerLine: "One clean record for Nigerian traders and small businesses.",
      storeNumber: "7040 198 119",
      market: "Lagos",
      customerA: "Chidi",
      customerB: "Aisha",
      demo: {
        cashSale: 2350,
        transfer: 7800,
        debtorOne: 12500,
        debtorTwo: 4000,
        debtorTotal: 16500,
        lastPayment: 6000,
        dayTotal: 48200,
        dayCash: 21400,
        dayTransfer: 26800,
        dailyCloseCash: 16500,
        dailyCloseTransfer: 21400,
      },
    },
  },

  KE: {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    currency: {
      code: "KES",
      symbol: "KSh",
      name: "Kenyan Shilling",
      decimals: 2,
    },
    phone: {
      dial: "+254",
      pattern: "^[17]\\d{8}$",
      localDigits: 9,
      example: "712 345 678",
      helper: "Start with 011 or 071.",
    },
    payment: {
      label: "M-Pesa payment received",
      short: "M-Pesa",
    },
    languages: ["sw", "en"],
    defaultLanguage: "sw",
    sampleStore: "Mama Njeri Duka",
    demoAccounts: [{ phone: "0710000001", store: "Mama Njeri", role: "Foodstuff" }],
    seedProducts: [
      { name: "Unga wa Maisons (2kg)", cost: 520, price: 620, qty: 26 },
      { name: "Blue Band Tin", cost: 780, price: 890, qty: 20 },
      { name: "Brooke Bond Tea 250g", cost: 340, price: 420, qty: 30 },
      { name: "Cooking Oil 1L", cost: 940, price: 1120, qty: 14 },
      { name: "Maize Flour Sukuma Wiki", cost: 260, price: 330, qty: 24 },
      { name: "Safi Sanitary Towels", cost: 380, price: 460, qty: 16 },
    ],
    copy: {
      footerLine: "One clean record for Kenyan traders and small businesses.",
      storeNumber: "712 345 678",
      market: "Nairobi",
      customerA: "Wanjiku",
      customerB: "Otieno",
      demo: {
        cashSale: 2350,
        transfer: 7800,
        debtorOne: 12500,
        debtorTwo: 4000,
        debtorTotal: 16500,
        lastPayment: 6000,
        dayTotal: 48200,
        dayCash: 21400,
        dayTransfer: 26800,
        dailyCloseCash: 16500,
        dailyCloseTransfer: 21400,
      },
    },
  },

  GH: {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    currency: {
      code: "GHS",
      symbol: "GH₵",
      name: "Ghanaian Cedi",
      decimals: 2,
    },
    phone: {
      dial: "+233",
      pattern: "^[25]\\d{8}$",
      localDigits: 9,
      example: "24 123 4567",
      helper: "Start with 02 or 05.",
    },
    payment: {
      label: "MoMo payment received",
      short: "MoMo",
    },
    languages: ["en"],
    defaultLanguage: "en",
    sampleStore: "Kofi Provisions",
    demoAccounts: [{ phone: "0240000001", store: "Kofi", role: "Provisions" }],
    seedProducts: [
      { name: "Gino Tomato Paste", cost: 42, price: 52, qty: 28 },
      { name: "Fan Milk Sachets (Box)", cost: 36, price: 46, qty: 20 },
      { name: "Kalyppo Malt 600g", cost: 18, price: 24, qty: 34 },
      { name: "Gari 1kg", cost: 22, price: 28, qty: 26 },
      { name: "Gold Top Canned Tuna", cost: 38, price: 48, qty: 16 },
      { name: "Kleenit Toilet Roll", cost: 26, price: 34, qty: 22 },
    ],
    copy: {
      footerLine: "One clean record for Ghanaian traders and small businesses.",
      storeNumber: "24 123 4567",
      market: "Accra",
      customerA: "Kofi",
      customerB: "Ama",
      demo: {
        cashSale: 235,
        transfer: 780,
        debtorOne: 1250,
        debtorTwo: 400,
        debtorTotal: 1650,
        lastPayment: 600,
        dayTotal: 4820,
        dayCash: 2140,
        dayTransfer: 2680,
        dailyCloseCash: 1650,
        dailyCloseTransfer: 2140,
      },
    },
  },

  UG: {
    code: "UG",
    name: "Uganda",
    flag: "🇺🇬",
    currency: {
      code: "UGX",
      symbol: "USh",
      name: "Ugandan Shilling",
      decimals: 0,
    },
    phone: {
      dial: "+256",
      pattern: "^7\\d{8}$",
      localDigits: 9,
      example: "712 345 678",
      helper: "Start with 07.",
    },
    payment: {
      label: "MoMo payment received",
      short: "MoMo",
    },
    languages: ["en"],
    defaultLanguage: "en",
    sampleStore: "Nakawa Retail",
    demoAccounts: [{ phone: "0772000001", store: "Nakawa", role: "General" }],
    seedProducts: [
      { name: "Kwera Maize Flour", cost: 12000, price: 15000, qty: 26 },
      { name: "Blue Band Tin", cost: 26000, price: 31000, qty: 18 },
      { name: "Rwenzori Water 500ml", cost: 1500, price: 2500, qty: 40 },
      { name: "Cooking Oil 1L", cost: 18000, price: 22000, qty: 12 },
      { name: "Sugar 1kg", cost: 7000, price: 9000, qty: 24 },
      { name: "Salt 1kg", cost: 3000, price: 4000, qty: 20 },
    ],
    copy: {
      footerLine: "One clean record for Ugandan traders and small businesses.",
      storeNumber: "772 123 456",
      market: "Kampala",
      customerA: "Okello",
      customerB: "Nansubuga",
      demo: {
        cashSale: 23500,
        transfer: 78000,
        debtorOne: 125000,
        debtorTwo: 40000,
        debtorTotal: 165000,
        lastPayment: 60000,
        dayTotal: 482000,
        dayCash: 214000,
        dayTransfer: 268000,
        dailyCloseCash: 165000,
        dailyCloseTransfer: 214000,
      },
    },
  },
};

export const COUNTRY_LIST: CountryConfig[] = [
  COUNTRIES.NG,
  COUNTRIES.KE,
  COUNTRIES.GH,
  COUNTRIES.UG,
];

export const DEFAULT_COUNTRY: CountryCode = "NG";

export function getCountry(code: CountryCode | string | null | undefined): CountryConfig {
  if (code && code in COUNTRIES) {
    return COUNTRIES[code as CountryCode];
  }
  return COUNTRIES[DEFAULT_COUNTRY];
}

/** Every demo account across all countries, flagged with its country. */
export function allDemoAccounts(): Array<DemoAccount & { country: CountryConfig }> {
  return COUNTRY_LIST.flatMap((country) =>
    country.demoAccounts.map((a) => ({ ...a, country })),
  );
}
