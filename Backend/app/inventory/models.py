import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: f"p-{uuid.uuid4().hex[:10]}")
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    low_stock_threshold = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="products")
