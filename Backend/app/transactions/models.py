import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)

    # Gateway / simulation fields
    reference = Column(String, unique=True, nullable=True, index=True)
    sender_name = Column(String, nullable=True)
    channel = Column(String, nullable=True)                     # e.g. "dedicated_nuban", "simulation"

    # Lifecycle status: "unallocated" → "reconciled"
    status = Column(String, nullable=False, default="unallocated")

    # Ledger fields (populated on reconciliation or direct creation)
    title = Column(String, nullable=True)
    details = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    profit = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String, nullable=True)
    transaction_type = Column(String, nullable=True)            # "sale" | "debt_repayment" | None

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="transactions")
