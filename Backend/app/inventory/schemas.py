from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime
from app.core.countries import to_major

def _major(amount_minor: int, currency: str) -> float:
    return to_major(amount_minor or 0, currency or "NG")

class ProductCreate(BaseModel):
    name: str
    cost_price: float  # major units (naira); stored as minor
    selling_price: float  # major units (naira); stored as minor
    quantity: int
    low_stock_threshold: Optional[int] = 3

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None

class ProductResponse(BaseModel):
    id: str
    account_id: str
    name: str
    cost_price: float  # major units (naira)
    selling_price: float  # major units (naira)
    currency: str
    quantity: int
    low_stock_threshold: int
    created_at: datetime

    @field_serializer("cost_price", "selling_price")
    def _ser_prices(self, v):
        return _major(v, self.currency)

    class Config:
        from_attributes = True

class ProductExtractionResponse(BaseModel):
    names: list[str]
