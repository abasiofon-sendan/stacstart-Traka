from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class DebtorItemCreate(BaseModel):
    product_name: str
    qty: int
    price: int  # whole minor units

class DebtorItemResponse(DebtorItemCreate):
    id: int
    debtor_id: str
    currency: str

    class Config:
        from_attributes = True

class DebtorCreate(BaseModel):
    name: str
    amount: int  # whole minor units (kobo/cents/pesewas; UGX whole)
    items_summary: str
    due_date: Optional[date] = None
    items: List[DebtorItemCreate]

class DebtorResponse(BaseModel):
    id: str
    account_id: str
    name: str
    amount: int
    currency: str
    items_summary: str
    due_date: Optional[date]
    status: str
    created_at: datetime
    items: List[DebtorItemResponse] = []

    class Config:
        from_attributes = True

class DebtorLinkResponse(BaseModel):
    link: str

class DebtorsSummaryResponse(BaseModel):
    total_outstanding: int  # whole minor units
    currency: str
    debtors: List[DebtorResponse]
