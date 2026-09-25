from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.accounts.service import get_current_account_id
from app.reports import schemas, service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """
    Live dashboard totals. Call this on page load and again after every
    Confirm action (cash sale or reconcile-unallocated) to refresh the
    revenue and profit cards.
    """
    return service.get_dashboard(db=db, account_id=account_id)


@router.get("/weekly", response_model=schemas.WeeklyReportResponse)
def get_weekly_report(
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """
    Returns Weekly Reports & Insights for the authenticated merchant.

    Covers:
    - Revenue & Profit cards with % change vs last week
    - Daily Sales Pattern (Mon–Sun bar chart data)
    - Stock Performance: fastest-selling product
    - Stock Alert Status: items at or below low_stock_threshold
    - Debtors summary: total outstanding + unpaid count
    """
    return service.get_weekly_report(db=db, account_id=account_id)
