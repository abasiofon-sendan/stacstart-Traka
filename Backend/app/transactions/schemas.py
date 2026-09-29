from typing import List, Optional, Literal
from pydantic import BaseModel
from datetime import datetime


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
    repayment_amount: Optional[int] = None  # whole minor units


# ─── Direct creation (e.g. debt settlement) ───────────────────────────────────

class TransactionCreate(BaseModel):
    title: str
    details: Optional[str] = None
    amount: int  # whole minor units
    profit: int = 0
    currency: Optional[str] = None  # defaults to the account currency
    payment_method: Optional[str] = None
    transaction_type: Optional[str] = None  # "sale" | "debt_repayment"


# ─── GET /unallocated — everything the modal needs to render ──────────────────

class UnallocatedTransactionResponse(BaseModel):
    id: int
    reference: Optional[str]
    sender_name: Optional[str]      # shown as "from Chinedu Okafor"
    amount: int                     # whole minor units
    currency: str
    channel: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
