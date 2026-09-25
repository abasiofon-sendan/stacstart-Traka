from datetime import datetime, timedelta, timezone
from typing import List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.transactions import models as tx_models
from app.inventory import models as inv_models
from app.debtors import models as debtor_models


# ─── Dashboard ───────────────────────────────────────────────────────────────

def get_dashboard(db: Session, account_id: str) -> dict:
    """
    Live dashboard totals — recomputed on every call so the frontend always
    gets up-to-date figures the moment a sale is confirmed.
    """
    today = datetime.now(timezone.utc)
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end   = today_start + timedelta(days=1)

    # All reconciled sales (all-time)
    all_sales = (
        db.query(tx_models.Transaction)
        .filter(
            tx_models.Transaction.account_id == account_id,
            tx_models.Transaction.status == "reconciled",
            tx_models.Transaction.transaction_type == "sale",
        )
        .all()
    )

    # Today's reconciled sales
    today_sales = [
        t for t in all_sales
        if _as_utc(t.created_at) >= today_start
    ]

    total_revenue  = sum(t.amount for t in all_sales)
    total_profit   = sum(t.profit  for t in all_sales)
    today_revenue  = sum(t.amount for t in today_sales)
    today_profit   = sum(t.profit  for t in today_sales)

    # Unpaid debtors
    unpaid_debtors = (
        db.query(debtor_models.Debtor)
        .filter(
            debtor_models.Debtor.account_id == account_id,
            debtor_models.Debtor.status == "Unpaid",
        )
        .all()
    )

    # Low stock count
    low_stock_count = (
        db.query(inv_models.Product)
        .filter(
            inv_models.Product.account_id == account_id,
            inv_models.Product.quantity <= inv_models.Product.low_stock_threshold,
        )
        .count()
    )

    return {
        # All-time cards shown on the main dashboard screen
        "total_revenue":          total_revenue,
        "total_profit":           total_profit,

        # Today's snapshot
        "today_revenue":          today_revenue,
        "today_profit":           today_profit,

        # Debt & stock alert badges
        "total_debt_outstanding": sum(d.amount for d in unpaid_debtors),
        "unpaid_debtor_count":    len(unpaid_debtors),
        "low_stock_count":        low_stock_count,
    }


def _as_utc(dt: datetime) -> datetime:
    """Normalise naive datetimes (SQLite) to UTC-aware for comparison."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _week_bounds(offset_weeks: int = 0):
    """
    Returns (start, end) UTC datetimes for the ISO week that is `offset_weeks`
    ago.  offset_weeks=0 → current week, offset_weeks=1 → last week.
    """
    today = datetime.now(timezone.utc)
    # Monday of the target week
    monday = today - timedelta(days=today.weekday(), weeks=offset_weeks)
    start = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=7)
    return start, end


def _reconciled_sales(db: Session, account_id: str, start: datetime, end: datetime):
    return (
        db.query(tx_models.Transaction)
        .filter(
            tx_models.Transaction.account_id == account_id,
            tx_models.Transaction.status == "reconciled",
            tx_models.Transaction.transaction_type == "sale",
            tx_models.Transaction.created_at >= start,
            tx_models.Transaction.created_at < end,
        )
        .all()
    )


# ─── Weekly Report ────────────────────────────────────────────────────────────

def get_weekly_report(db: Session, account_id: str) -> dict:
    this_start, this_end = _week_bounds(0)
    last_start, last_end = _week_bounds(1)

    this_week_txns = _reconciled_sales(db, account_id, this_start, this_end)
    last_week_txns = _reconciled_sales(db, account_id, last_start, last_end)

    # ── Revenue & Profit ─────────────────────────────────────────────────────
    this_revenue = sum(t.amount for t in this_week_txns)
    last_revenue = sum(t.amount for t in last_week_txns)
    this_profit  = sum(t.profit  for t in this_week_txns)
    last_profit  = sum(t.profit  for t in last_week_txns)

    def pct_change(current: float, previous: float) -> float:
        if previous == 0:
            return 0.0
        return round(((current - previous) / previous) * 100, 1)

    revenue_change = pct_change(this_revenue, last_revenue)
    profit_change  = pct_change(this_profit,  last_profit)

    # ── Daily Sales Pattern (Mon–Sun) ────────────────────────────────────────
    # Build a dict keyed by weekday index 0=Mon … 6=Sun
    day_labels = ["M", "T", "W", "T", "F", "S", "S"]
    daily_buckets: dict[int, float] = {i: 0.0 for i in range(7)}
    for txn in this_week_txns:
        # created_at may be naive (SQLite) or aware — normalise to weekday
        dt = txn.created_at
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        daily_buckets[dt.weekday()] += txn.amount

    daily_sales = [
        {"day": day_labels[i], "amount": daily_buckets[i]}
        for i in range(7)
    ]

    # ── Stock Performance ─────────────────────────────────────────────────────
    # "Fastest Selling" = product whose total quantity sold this week is highest
    # We derive this from the transaction details string "Product x3, ..."
    # Instead, use the inventory directly: lowest quantity remaining (most sold)
    products = (
        db.query(inv_models.Product)
        .filter(inv_models.Product.account_id == account_id)
        .all()
    )

    # top_seller: product with highest (selling_price - cost_price) * units sold
    # Since we don't store per-product sale counters, we use lowest remaining qty
    # as a proxy for "fastest selling" — straightforward and no extra model needed
    fastest_selling = None
    if products:
        sorted_products = sorted(products, key=lambda p: p.quantity)
        fastest_selling = {
            "product_id":   sorted_products[0].id,
            "product_name": sorted_products[0].name,
            "badge":        "Top Seller",
        }

    # ── Stock Alert Status ────────────────────────────────────────────────────
    low_stock_items = [
        {
            "product_id":        p.id,
            "product_name":      p.name,
            "quantity":          p.quantity,
            "low_stock_threshold": p.low_stock_threshold,
        }
        for p in products
        if p.quantity <= p.low_stock_threshold
    ]

    # ── Debtors Summary ───────────────────────────────────────────────────────
    unpaid_debtors = (
        db.query(debtor_models.Debtor)
        .filter(
            debtor_models.Debtor.account_id == account_id,
            debtor_models.Debtor.status == "Unpaid",
        )
        .all()
    )
    total_debt_outstanding = sum(d.amount for d in unpaid_debtors)

    return {
        "period":           "this_week",
        "week_start":       this_start.date().isoformat(),
        "week_end":         (this_end - timedelta(days=1)).date().isoformat(),

        # Cards
        "revenue":          this_revenue,
        "revenue_change":   revenue_change,   # % vs last week, positive = up
        "profit":           this_profit,
        "profit_change":    profit_change,

        # Chart data
        "daily_sales":      daily_sales,

        # Stock section
        "fastest_selling":  fastest_selling,
        "low_stock_items":  low_stock_items,

        # Debtors section
        "total_debt_outstanding": total_debt_outstanding,
        "unpaid_debtor_count":    len(unpaid_debtors),
    }
