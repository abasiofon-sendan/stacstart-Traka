from typing import List, Optional, Literal
from pydantic import BaseModel, field_serializer
from datetime import datetime
from app.core.countries import to_major

def _major(amount_minor: int, currency: str) -> float:
    return to_major(amount_minor or 0, currency or "NG")


# ─── Shared basket item ───────────────────────────────────────────────────────

class BasketItem(BaseModel):
    product_id: str
    quantity: int


# ─── Cash Sale modal — POST /transactions/cash-sale ───────────────────────────

class CashSaleRequest(BaseModel):
    sender_name: str                # "from Chinedu Okafor" shown in the modal
    items: List[BasketItem]


# ─── Transfer reconcile modal — POST /transactions/reconcile-unallocated ──────

class ReconcileRequest(BaseModel):
    transaction_reference: str
    reconciliation_type: Literal["sale", "debt"]

    # Required when reconciliation_type == "sale"
    items: Optional[List[BasketItem]] = None

    # Required when reconciliation_type == "debt"
    debtor_id: Optional[str] = None
    repayment_amount: Optional[float] = None  # major units (naira)


# ─── Direct creation (e.g. debt settlement) ───────────────────────────────────

class TransactionCreate(BaseModel):
    title: str
    details: Optional[str] = None
    amount: float  # major units (naira); stored as minor
    profit: float = 0.0
    payment_method: Optional[str] = None
    transaction_type: Optional[str] = None  # "sale" | "debt_repayment"


# ─── GET /unallocated — everything the modal needs to render ──────────────────

class UnallocatedTransactionResponse(BaseModel):
    id: int
    reference: Optional[str]
    sender_name: Optional[str]      # shown as "from Chinedu Okafor"
    amount: float                   # major units (naira)
    currency: str
    channel: Optional[str]
    status: str
    created_at: datetime

    @field_serializer("amount")
    def _ser_amount(self, v):
        return _major(v, self.currency)

    class Config:
        from_attributes = True
