import uuid
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    nin = Column(String, unique=True, nullable=False)
    pin_hash = Column(String, nullable=False)
    virtual_account_number = Column(String, unique=True, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    products = relationship("Product", back_populates="account")
    debtors = relationship("Debtor", back_populates="account")
    transactions = relationship("Transaction", back_populates="account")
