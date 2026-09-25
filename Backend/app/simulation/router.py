from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.accounts.service import get_current_account_id
from app.simulation import service

router = APIRouter(prefix="/simulation", tags=["simulation"])


class TriggerTransferPayload(BaseModel):
    sender_name: str
    simulated_amount: float
    virtual_account_target: str


@router.post("/trigger-transfer", status_code=status.HTTP_201_CREATED)
def trigger_transfer(
    payload: TriggerTransferPayload,
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """
    Simulates an inward bank transfer against a merchant virtual account.
    Internally mirrors a Paystack charge.success webhook payload and routes it
    through the settlement ingestion pipeline, creating an unallocated
    Transaction record and triggering the SSE broadcast.
    """
    return service.trigger_transfer(
        db=db,
        sender_name=payload.sender_name,
        simulated_amount=payload.simulated_amount,
        virtual_account_target=payload.virtual_account_target,
    )
