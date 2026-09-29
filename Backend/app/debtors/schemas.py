from pydantic import BaseModel, field_serializer
from typing import List, Optional
from datetime import datetime, date
from app.core.countries import to_major

def _major(amount_minor: int, currency: str) -> float:
    """Stored minor units -> API major units (naira float)."""
    return to_major(amount_minor or 0, currency or "NG")

class DebtorItemCreate(BaseModel):
    product_name: str
    qty: int
    price: float  # major units (naira); stored as minor

class DebtorItemResponse(DebtorItemCreate):
    id: int
    debtor_id: str
    currency: str

    @field_serializer("price")
    def _ser_price(self, v):
        return _major(v, self.currency)

    class Config:
        from_attributes = True

class DebtorCreate(BaseModel):
    name: str
    amount: float  # major units (naira); stored as minor
    items_summary: str
    due_date: Optional[date] = None
    items: List[DebtorItemCreate]

class DebtorResponse(BaseModel):
    id: str
    account_id: str
    name: str
    amount: float  # major units (naira)
    currency: str
    items_summary: str
    due_date: Optional[date]
    status: str
    created_at: datetime
    items: List[DebtorItemResponse] = []

    @field_serializer("amount")
    def _ser_amount(self, v):
        return _major(v, self.currency)

    class Config:
        from_attributes = True

class DebtorLinkResponse(BaseModel):
    link: str

class DebtorsSummaryResponse(BaseModel):
    total_outstanding: float  # major units (naira)
    currency: str
    debtors: List[DebtorResponse]
