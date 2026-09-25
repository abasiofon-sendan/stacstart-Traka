from typing import List, Optional
from pydantic import BaseModel


class DashboardResponse(BaseModel):
    # All-time totals — the two main cards on the dashboard
    total_revenue:          float   # ₦94,500 — updates the moment Confirm is tapped
    total_profit:           float   # ₦20,350

    # Today only
    today_revenue:          float
    today_profit:           float

    # Badge counters
    total_debt_outstanding: float
    unpaid_debtor_count:    int
    low_stock_count:        int


class DailySalesEntry(BaseModel):
    day: str        # "M" | "T" | "W" | "T" | "F" | "S" | "S"
    amount: float


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
    revenue: float                  # ₦194,500
    revenue_change: float           # +14.0  (% vs last week, negative = down)

    # ── Profit card ───────────────────────────────────────────────────────────
    profit: float                   # ₦40,350
    profit_change: float            # -2.0

    # ── Daily Sales Pattern bar chart ─────────────────────────────────────────
    daily_sales: List[DailySalesEntry]   # 7 entries Mon→Sun

    # ── Stock Performance ─────────────────────────────────────────────────────
    fastest_selling: Optional[FastestSellingProduct] = None

    # ── Stock Alert Status ────────────────────────────────────────────────────
    low_stock_items: List[LowStockItem]

    # ── Debtors summary ───────────────────────────────────────────────────────
    total_debt_outstanding: float
    unpaid_debtor_count: int
