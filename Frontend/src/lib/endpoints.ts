import { api } from "./api";

/* ─── Types matching openapi.json ─── */

export interface AccountCreate {
  business_name: string;
  phone_number: string;
  /**
   * Server-side market. The backend defaults this to NG, so sending it is not
   * optional — omit it and a Kenyan merchant is stored as Nigeria/NGN.
   */
  country: string;
  pin: string;
}

export interface AccountLogin {
  phone_number: string;
  pin: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  /** Null until a receiving-account provider provisions one. */
  virtual_account_number: string | null;
}

export interface AccountResponse {
  id: string;
  business_name: string;
  phone_number: string;
  country: string;
  currency: string;
  virtual_account_number: string | null;
  access_token: string;
  refresh_token: string;
}

export interface ProductResponse {
  id: string;
  account_id: string;
  name: string;
  /** Major units, in this product's `currency`. */
  cost_price: number;
  /** Major units, in this product's `currency`. */
  selling_price: number;
  /** The account's currency — prices above are denominated in it. */
  currency: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
  low_stock_threshold?: number;
}

export interface ProductUpdate {
  name?: string;
  cost_price?: number;
  selling_price?: number;
  quantity?: number;
  low_stock_threshold?: number;
}

export interface CashSaleRequest {
  sender_name: string;
  items: Array<{ product_id: string; quantity: number }>;
}

export interface DebtorCreate {
  name: string;
  amount: number;
  items_summary: string;
  due_date?: string;
  items: DebtorItemCreate[];
}

export interface DebtorItemCreate {
  product_name: string;
  qty: number;
  price: number;
}

export interface DebtorResponse {
  id: string;
  account_id: string;
  name: string;
  amount: number;
  /** The currency `amount` is denominated in. */
  currency: string;
  items_summary: string;
  due_date: string | null;
  status: string;
  created_at: string;
  items: DebtorItemResponse[];
}

export interface DebtorItemResponse {
  id: number;
  debtor_id: string;
  product_name: string;
  qty: number;
  price: number;
}

export interface DebtorLinkResponse {
  link: string;
}

export interface DebtorsSummaryResponse {
  total_outstanding: number;
  debtors: DebtorResponse[];
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface WeeklyReportResponse {
  period: string;
  week_start: string;
  week_end: string;
  revenue: number;
  revenue_change: number;
  profit: number;
  profit_change: number;
  daily_sales: DailySalesEntry[];
  fastest_selling: FastestSellingProduct | null;
  low_stock_items: LowStockItem[];
  total_debt_outstanding: number;
  unpaid_debtor_count: number;
}

export interface DashboardResponse {
  total_revenue: number;
  total_profit: number;
  today_revenue: number;
  today_profit: number;
  total_debt_outstanding: number;
  unpaid_debtor_count: number;
  low_stock_count: number;
  /** Currency all the amounts above are denominated in. */
  currency: string;
}

export interface FastestSellingProduct {
  product_id: string;
  product_name: string;
  badge: string;
}

export interface LowStockItem {
  product_id: string;
  product_name: string;
  quantity: number;
  low_stock_threshold: number;
}

export interface DailySalesEntry {
  day: string;
  amount: number;
}

export interface UnallocatedTransactionResponse {
  id: number;
  reference: string | null;
  sender_name: string | null;
  amount: number;
  channel: string | null;
  status: string;
  title: string | null;
  details: string | null;
  profit: number | null;
  payment_method: string | null;
  transaction_type: string | null;
  created_at: string;
}

export interface ReconcileRequest {
  transaction_id: string;
  product_id: string;
  quantity: number;
}

export interface TriggerTransferPayload {
  product_name: string;
  quantity: number;
  amount: number;
}

export interface ProductExtractionResponse {
  names: string[];
}

export interface BasketItem {
  product_id: string;
  name: string;
  selling_price: number;
  quantity: number;
}

/* ─── Accounts ─── */

export interface AccountMeResponse {
  id: string;
  business_name: string;
  phone_number: string;
  /** The account's real market — server truth, wins over localStorage. */
  country: string;
  /** Currency derived from `country` by the backend. */
  currency: string;
  /** Null until a receiving-account provider provisions one. */
  virtual_account_number: string | null;
}

export interface WhatsAppSetupResponse {
  sandbox_number: string;
  join_code: string;
  join_message: string;
  wa_link: string;
  trial_note: string;
}

export interface WhatsAppStatusResponse {
  linked: boolean;
  sender?: string | null;
  last_seen?: string | null;
}

export const accountsApi = {
  signup: (data: AccountCreate) =>
    api.post<TokenResponse>("/accounts/signup", data).then((r) => r.data),

  login: (data: AccountLogin) =>
    api.post<TokenResponse>("/accounts/login", data).then((r) => r.data),

  me: () =>
    api.get<AccountMeResponse>("/accounts/me").then((r) => r.data),

  /** Public join config for the Twilio sandbox — no auth needed. */
  whatsappSetup: () =>
    api.get<WhatsAppSetupResponse>("/accounts/whatsapp-setup").then((r) => r.data),

  /** Has this account's number messaged us yet? */
  whatsappStatus: () =>
    api.get<WhatsAppStatusResponse>("/accounts/whatsapp-status").then((r) => r.data),
};

/* ─── Inventory / Products ─── */

export const inventoryApi = {
  list: () =>
    api.get<ProductResponse[]>("/inventory").then((r) => r.data),

  get: (id: string) =>
    api.get<ProductResponse>(`/inventory/${id}`).then((r) => r.data),

  create: (data: ProductCreate) =>
    api.post<ProductResponse>("/inventory", data).then((r) => r.data),

  update: (id: string, data: ProductUpdate) =>
    api.put<ProductResponse>(`/inventory/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/inventory/${id}`).then((r) => r.data),

  extractProduct: (files: File[]) => {
    const form = new FormData();
    files.slice(0, 3).forEach((f) => form.append("images", f));
    return api
      .post<ProductExtractionResponse>("/inventory/extract-product", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

/* ─── Transactions ─── */

export const transactionsApi = {
  list: () =>
    api.get<UnallocatedTransactionResponse[]>("/transactions").then((r) => r.data),

  cashSale: (data: CashSaleRequest) =>
    api.post("/transactions/cash-sale", data).then((r) => r.data),

  triggerTransfer: (data: TriggerTransferPayload) =>
    api.post("/simulation/trigger-transfer", data).then((r) => r.data),

  unallocated: () =>
    api.get<UnallocatedTransactionResponse[]>("/transactions/unallocated").then((r) => r.data),

  reconcile: (data: ReconcileRequest) =>
    api.post("/transactions/reconcile-unallocated", data).then((r) => r.data),
};

/* ─── Debtors ─── */

export const debtorsApi = {
  list: () =>
    api.get<DebtorsSummaryResponse>("/debtors/all").then((r) => r.data),

  create: (data: DebtorCreate) =>
    api.post<DebtorResponse>("/debtors/new", data).then((r) => r.data),

  settle: (debtorId: string, data?: { payment_method: string }) =>
    api.post<{ message: string }>(`/debtors/${debtorId}/settle`, data).then((r) => r.data),
};

/* ─── Notifications ─── */

export const notificationsApi = {
  list: () =>
    api.get<NotificationResponse[]>("/notifications").then((r) => r.data),
};

/* ─── Activity ─── */

export interface ActivityResponse {
  id: number;
  account_id: string;
  activity_type: string;
  title: string;
  description: string;
  event_metadata: string;
  created_at: string;
}

export const activityApi = {
  recent: () =>
    api.get<ActivityResponse[]>("/activity/recent").then((r) => r.data),
};

/* ─── Reports ─── */

export const reportsApi = {
  dashboard: () =>
    api.get<DashboardResponse>("/reports/dashboard").then((r) => r.data),
  weekly: () =>
    api.get<WeeklyReportResponse>("/reports/weekly").then((r) => r.data),
};

/* ─── Voice / AI Advisor ─── */

export type AiLanguage = "en" | "yo" | "ha" | "pidgin" | "sw";

/**
 * `/voice/ask/text` types `language` as a Literal of these four, so anything
 * else comes back 422. Swahili is offered in the UI (Kenya) but answered in
 * English until the backend adds it — see the note shown under the picker.
 */
export const BACKEND_LANGUAGES = ["en", "yo", "ha", "pidgin"] as const;

/** Selectable in the UI but not yet answerable by the backend. */
export const PENDING_LANGUAGES: AiLanguage[] = ["sw"];

export function toApiLanguage(language: AiLanguage): (typeof BACKEND_LANGUAGES)[number] {
  return (BACKEND_LANGUAGES as readonly string[]).includes(language)
    ? (language as (typeof BACKEND_LANGUAGES)[number])
    : "en";
}

export interface AdvisorResponse {
  transcript: string;
  language_detected: string;
  reply: string;
}

export const voiceApi = {
  askText: (question: string, language: AiLanguage) =>
    api
      .post<AdvisorResponse>("/voice/ask/text", {
        question,
        language: toApiLanguage(language),
      })
      .then((r) => r.data),

  askVoice: (audio: Blob, context?: string) => {
    const form = new FormData();
    form.append("audio", audio, "recording.webm");
    if (context) form.append("context", context);
    return api
      .post<AdvisorResponse>("/voice/ask/voice", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

/* ─── Webhooks ─── */

export const webhooksApi = {
  bankSettlement: (data: TriggerTransferPayload) =>
    api.post("/webhooks/bank-settlement", data).then((r) => r.data),
};
