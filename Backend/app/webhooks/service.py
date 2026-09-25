import uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.transactions import models as tx_models
from app.accounts import models as acct_models
from app.activity.service import log_activity


def ingest_settlement(db: Session, payload: dict) -> dict:
    """
    Core settlement ingestion logic shared by the webhook endpoint and the
    simulation trigger. Creates an unallocated Transaction for the matched merchant.
    """
    data = payload.get("data", {})

    # Resolve the merchant account from the target virtual account number
    virtual_account_number = (
        data.get("dedicated_nuban", {}).get("account_number") or
        data.get("virtual_account_target")
    )
    account = (
        db.query(acct_models.Account)
        .filter(acct_models.Account.virtual_account_number == virtual_account_number)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=404,
            detail=f"No merchant found for virtual account {virtual_account_number}",
        )

    # Kobo → Naira conversion (gateway amounts arrive as integers in minor units)
    raw_amount = data.get("amount", 0)
    amount_naira = raw_amount / 100 if raw_amount > 100 else raw_amount  # simulation sends plain Naira

    customer = data.get("customer", {})
    sender_name = (
        data.get("sender_name")  # simulation field
        or f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()
        or "Unknown"
    )

    reference = data.get("reference") or f"TXN-{uuid.uuid4().hex[:10].upper()}"

    # Idempotency: skip if we already processed this reference
    existing = (
        db.query(tx_models.Transaction)
        .filter(tx_models.Transaction.reference == reference)
        .first()
    )
    if existing:
        return {"status": "duplicate", "reference": reference, "transaction_id": existing.id}

    txn = tx_models.Transaction(
        account_id=account.id,
        reference=reference,
        sender_name=sender_name,
        channel=data.get("channel", "dedicated_nuban"),
        status="unallocated",
        amount=amount_naira,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    log_activity(
        db,
        account_id=account.id,
        activity_type="payment_received",
        title="Payment Received",
        description=f"₦{txn.amount:,.2f} received from {txn.sender_name}",
        event_metadata={
            "amount": txn.amount,
            "sender_name": txn.sender_name,
            "reference": txn.reference,
        },
    )

    return {
        "status": "received",
        "reference": txn.reference,
        "transaction_id": txn.id,
        "amount": txn.amount,
        "account_id": account.id,
    }
