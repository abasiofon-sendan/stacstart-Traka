from typing import List, Optional
from pydantic import BaseModel


class DashboardResponse(BaseModel):
    # All-time totals in whole minor units — the two main cards on the dashboard
    total_revenue:          int
    total_profit:           int
    currency:               str

    # Today only
    today_revenue:          int
    today_profit:           int

    # Badge counters
    total_debt_outstanding: int
    unpaid_debtor_count:    int
    low_stock_count:        int


class DailySalesEntry(BaseModel):
    day: str        # "M" | "T" | "W" | "T" | "F" | "S" | "S"
    amount: int     # whole minor units


class FastestSellingProduct(BaseModel):
    product_id: str
    product_name: str
    badge: str      # "Top Seller"


class LowStockItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    low_stock_threshold: int


class WeeklyReportResponse(BaseModel):
    period: str                     # "this_week"
    week_start: str                 # ISO date  e.g. "2025-07-14"
    week_end: str

    # ── Revenue card ──────────────────────────────────────────────────────────
    revenue: int                    # whole minor units
    revenue_change: float           # +14.0  (% vs last week, negative = down)

    # ── Profit card ───────────────────────────────────────────────────────────
    profit: int                     # whole minor units
    profit_change: float            # -2.0
    currency: str

    # ── Daily Sales Pattern bar chart ─────────────────────────────────────────
    daily_sales: List[DailySalesEntry]   # 7 entries Mon→Sun

    # ── Stock Performance ─────────────────────────────────────────────────────
    fastest_selling: Optional[FastestSellingProduct] = None

    # ── Stock Alert Status ────────────────────────────────────────────────────
    low_stock_items: List[LowStockItem]

    # ── Debtors summary ───────────────────────────────────────────────────────
    total_debt_outstanding: int
    unpaid_debtor_count: int
