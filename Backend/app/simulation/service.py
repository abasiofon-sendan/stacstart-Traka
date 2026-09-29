import uuid

from sqlalchemy.orm import Session

from app.webhooks.service import ingest_settlement


def trigger_transfer(db: Session, sender_name: str, simulated_amount: float, virtual_account_target: str) -> dict:
    """
    Builds a Paystack-mirrored webhook payload and routes it internally through
    the shared webhook ingestion logic, bypassing HMAC signature verification.
    simulated_amount arrives in major units and is converted to minor,
    mirroring real gateways which settle in minor units (kobo/cents).
    """
    from app.accounts import models as acct_models
    from app.core.countries import to_minor

    reference = f"TXN-SIM-{uuid.uuid4().hex[:8].upper()}"
    acc = (
        db.query(acct_models.Account)
        .filter(acct_models.Account.virtual_account_number == virtual_account_target)
        .first()
    )
    country = acc.country if acc and acc.country else "NG"

    # Mirror the real Paystack charge.success payload shape
    mirrored_payload = {
        "event": "charge.success",
        "data": {
            "reference": reference,
            # Minor units, like a real gateway (kobo/cents/pesewas)
            "amount": to_minor(simulated_amount, country),
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
