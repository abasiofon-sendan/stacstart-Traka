from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.accounts.service import get_current_account_id
from app.transactions import schemas, service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post(
    "/cash-sale",
    response_model=schemas.UnallocatedTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_cash_sale(
    body: schemas.CashSaleRequest,
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """
    Logs a cash sale directly — no inbound transfer required.
    Creates a reconciled Transaction immediately from the basket.
    Revenue and profit are computed from product selling/cost prices.
    """
    return service.log_cash_sale(
        db=db,
        account_id=account_id,
        sender_name=body.sender_name,
        items=[i.model_dump() for i in body.items],
    )


@router.get("", response_model=List[schemas.UnallocatedTransactionResponse])
def list_transactions(
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """Returns all transactions for the authenticated merchant, newest first."""
    return service.get_transactions(db=db, account_id=account_id)


@router.get("/unallocated", response_model=List[schemas.UnallocatedTransactionResponse])
def list_unallocated(
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """Returns only unallocated (pending reconciliation) transactions."""
    return service.get_unallocated(db=db, account_id=account_id)


@router.post(
    "/reconcile-unallocated",
    response_model=schemas.UnallocatedTransactionResponse,
    status_code=status.HTTP_200_OK,
)
def reconcile_unallocated(
    body: schemas.ReconcileRequest,
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """
    Called when the merchant taps Confirm on the Transfer Received modal.

    - reconciliation_type "sale" → items basket required (product_id + quantity)
    - reconciliation_type "debt" → debtor_id + repayment_amount required
    """
    if body.reconciliation_type == "sale":
        if not body.items:
            from fastapi import HTTPException
            raise HTTPException(status_code=422, detail="items basket is required for type 'sale'")
        return service.reconcile_as_sale(
            db=db,
            account_id=account_id,
            reference=body.transaction_reference,
            items=[i.model_dump() for i in body.items],
        )

    else:  # "debt" — Literal enforces only these two values reach here
        if not body.debtor_id or body.repayment_amount is None:
            from fastapi import HTTPException
            raise HTTPException(status_code=422, detail="debtor_id and repayment_amount are required for type 'debt'")
        return service.reconcile_as_debt(
            db=db,
            account_id=account_id,
            reference=body.transaction_reference,
            debtor_id=body.debtor_id,
            repayment_amount=body.repayment_amount,
        )
