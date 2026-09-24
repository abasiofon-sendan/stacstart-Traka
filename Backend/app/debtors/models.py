import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Date, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Debtor(Base):
    __tablename__ = "debtors"

    id = Column(String, primary_key=True, default=lambda: f"d-{uuid.uuid4().hex[:10]}")
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    items_summary = Column(String, nullable=False)
    due_date = Column(Date, nullable=True)
    status = Column(String, default="Unpaid")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="debtors")
    items = relationship("DebtorItem", back_populates="debtor", cascade="all, delete-orphan")


class DebtorItem(Base):
    __tablename__ = "debtor_items"

    id = Column(Integer, primary_key=True, index=True)
    debtor_id = Column(String, ForeignKey("debtors.id"), nullable=False)
    product_name = Column(String, nullable=False)
    qty = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    debtor = relationship("Debtor", back_populates="items")
