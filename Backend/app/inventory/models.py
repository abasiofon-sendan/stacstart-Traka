import uuid
from sqlalchemy import Column, String, BigInteger, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: f"p-{uuid.uuid4().hex[:10]}")
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    cost_price = Column(BigInteger, nullable=False)  # whole minor units
    selling_price = Column(BigInteger, nullable=False)  # whole minor units
    currency = Column(String(3), nullable=False, default="NGN")
    quantity = Column(Integer, nullable=False, default=0)
    low_stock_threshold = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="products")
