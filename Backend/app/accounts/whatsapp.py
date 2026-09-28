"""WhatsApp onboarding helpers (Twilio sandbox).

The sandbox join itself cannot be automated — WhatsApp requires the user to
send `join <code>` herself. This module makes that frictionless:
  - setup_info(): public join config (number, code, tap-to-join wa.me link)
  - record_sender(): persist every inbound sender for "Connected" detection
  - linkage_status(): has this account's number messaged us yet?
"""

from __future__ import annotations

import os
import re
from datetime import datetime
from typing import Optional
from urllib.parse import quote

from sqlalchemy.orm import Session

from app.accounts import models as acct_models

TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
# Confirm/update from Twilio console -> Sandbox Settings when it rotates.
TWILIO_SANDBOX_JOIN_CODE = os.getenv("TWILIO_SANDBOX_JOIN_CODE", "twilio-trial")


def sandbox_digits() -> str:
    """Sandbox number in wa.me form: country code + number, no '+' or spaces."""
    return re.sub(r"\D", "", TWILIO_WHATSAPP_NUMBER.lstrip("whatsapp:"))


def setup_info() -> dict:
    code = (TWILIO_SANDBOX_JOIN_CODE or "").strip()
    join_message = f"join {code}" if code else ""
    wa_link = (
        f"https://wa.me/{sandbox_digits()}?text={quote(join_message)}"
        if code and sandbox_digits() else ""
    )
    return {
        "sandbox_number": TWILIO_WHATSAPP_NUMBER,
        "join_code": code,
        "join_message": join_message,
        "wa_link": wa_link,
        "trial_note": (
            "Trial sandbox: tap the link, send the join message once, then chat. "
            "Text messages create debt records; voice notes need a paid Twilio plan."
            if code else
            "WhatsApp sandbox is not configured yet (missing join code)."
        ),
    }


def _candidate_senders(phone_number: str) -> list[str]:
    """E164 + local variants of a registered phone (mirrors webhook lookup)."""
    s = (phone_number or "").strip().replace(" ", "")
    out = [s]
    if s.startswith("+234"):
        out.append("0" + s[4:])
    elif s.startswith("234"):
        out.append("0" + s[3:])
        out.append("+" + s)
    elif s.startswith("0"):
        out.append("+234" + s[1:])
    return list(dict.fromkeys(out))


def record_sender(db: Session, sender: str, account_id: Optional[str]) -> None:
    """Upsert inbound sender (E164, no whatsapp: prefix). Never raises."""
    try:
        link = db.query(acct_models.WhatsAppLink).filter(
            acct_models.WhatsAppLink.sender == sender).first()
        if link:
            link.last_seen = datetime.utcnow()
            if account_id and not link.account_id:
                link.account_id = account_id
        else:
            link = acct_models.WhatsAppLink(sender=sender, account_id=account_id)
            db.add(link)
        db.commit()
    except Exception:
        db.rollback()


def linkage_status(db: Session, account_id: str) -> dict:
    """Has this account's WhatsApp number reached us? Used for 'Connected' UI."""
    account = db.query(acct_models.Account).filter(
        acct_models.Account.id == account_id).first()
    if not account:
        return {"linked": False, "sender": None, "last_seen": None}
    link = (
        db.query(acct_models.WhatsAppLink)
        .filter(acct_models.WhatsAppLink.account_id == account_id)
        .order_by(acct_models.WhatsAppLink.last_seen.desc())
        .first()
    )
    if not link:
        # Sender seen but account linked later (or vice versa): match by number.
        link = (
            db.query(acct_models.WhatsAppLink)
            .filter(acct_models.WhatsAppLink.sender.in_(
                _candidate_senders(account.phone_number)))
            .order_by(acct_models.WhatsAppLink.last_seen.desc())
            .first()
        )
    if not link:
        return {"linked": False, "sender": None, "last_seen": None}
    last_seen = link.last_seen.isoformat() if link.last_seen else None
    return {"linked": True, "sender": link.sender, "last_seen": last_seen}
