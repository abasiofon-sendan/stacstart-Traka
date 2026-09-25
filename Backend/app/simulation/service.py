import uuid

from sqlalchemy.orm import Session

from app.webhooks.service import ingest_settlement


def trigger_transfer(db: Session, sender_name: str, simulated_amount: float, virtual_account_target: str) -> dict:
    """
    Builds a Paystack-mirrored webhook payload and routes it internally through
    the shared webhook ingestion logic, bypassing HMAC signature verification.
    """
    reference = f"TXN-SIM-{uuid.uuid4().hex[:8].upper()}"

    # Mirror the real Paystack charge.success payload shape
    mirrored_payload = {
        "event": "charge.success",
        "data": {
            "reference": reference,
            # Store amount as plain Naira — ingest_settlement detects simulation channel
            "amount": simulated_amount,
            "gateway_response": "Successful",
            "channel": "simulation",
            "sender_name": sender_name,
            "virtual_account_target": virtual_account_target,
            "dedicated_nuban": {
                "account_number": virtual_account_target,
            },
            "customer": {},
        },
    }

    return ingest_settlement(db=db, payload=mirrored_payload)
