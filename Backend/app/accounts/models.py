import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    country = Column(String, nullable=False, default="NG", index=True)
    currency = Column(String(3), nullable=False, default="NGN")
    pin_hash = Column(String, nullable=False)
    virtual_account_number = Column(String, unique=True, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    products = relationship("Product", back_populates="account")
    debtors = relationship("Debtor", back_populates="account")
    transactions = relationship("Transaction", back_populates="account")


class WhatsAppLink(Base):
    """Tracks which WhatsApp senders have messaged the Twilio sandbox number.

    Written on every inbound webhook hit so the app can show "Connected"
    without the user telling us. sender is E164 (e.g. +2347077165827).
    account_id is null when the sender has no Traka account (yet).
    """
    __tablename__ = "whatsapp_links"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, unique=True, index=True, nullable=False)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=True, index=True)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now(),
                       onupdate=func.now())
