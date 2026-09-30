"""Regression: WhatsApp debtor creation must convert major->minor exactly once.

Bug seen live: 'Mama ngozi ... 5k' stored 50,000,000 kobo because the
webhook pre-converted to minor and create_debtor() converted again.
"""
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base

# Import models so they register with Base before create_all.
from app.accounts import models as _acct_models  # noqa: F401
from app.activity import models as _act_models  # noqa: F401
from app.debtors import models as _debtor_models  # noqa: F401
from app.inventory import models as _inv_models  # noqa: F401
from app.transactions import models as _tx_models  # noqa: F401
from app.notifications import models as _notif_models  # noqa: F401

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def _setup_account(db):
    from app.accounts.models import Account
    acc = Account(
        id="wa-acct-1",
        business_name="WA Shop",
        phone_number="+2348011112222",
        country="NG",
        currency="NGN",
        pin_hash="x",
    )
    db.add(acc)
    db.commit()
    return acc


def test_whatsapp_creates_single_conversion():
    from app.webhooks import whatsapp_twilio as W
    from app.debtors.models import Debtor

    W._PENDING.clear()
    db = TestingSessionLocal()
    acc = _setup_account(db)
    extracted = {"name": "Mama ngozi", "amount": 5000, "items_summary": "rice",
                 "due_date": "Friday", "confidence": 0.95}
    with patch("app.webhooks.whatsapp_twilio.debt_parse.groq_extract_debt",
               return_value=dict(extracted)):
        reply = W.handle_text_message(
            db, "whatsapp:+2348011112222", acc.id,
            "Mama ngozi dey owe me 5k for rice, she go pay on Friday")
    assert "₦5,000" in reply, reply
    row = db.query(Debtor).filter(Debtor.account_id == acc.id).one()
    assert row.amount == 500000, f"double conversion! stored {row.amount}"
    assert row.currency == "NGN"
    W._PENDING.clear()
    db.close()
