from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    cost_price: int  # whole minor units
    selling_price: int  # whole minor units
    quantity: int
    low_stock_threshold: Optional[int] = 3

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    cost_price: Optional[int] = None
    selling_price: Optional[int] = None
    quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None

class ProductResponse(BaseModel):
    id: str
    account_id: str
    name: str
    cost_price: int
    selling_price: int
    currency: str
    quantity: int
    low_stock_threshold: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductExtractionResponse(BaseModel):
    names: list[str]
