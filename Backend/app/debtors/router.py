from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.debtors import schemas, service
from app.accounts.service import get_current_account_id

router = APIRouter(
    prefix="/debtors",
    tags=["debtors"]
)

@router.get("/all", response_model=schemas.DebtorsSummaryResponse)
def get_debtors(db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.get_debtors_summary(db=db, account_id=account_id)

@router.post("/new", response_model=schemas.DebtorResponse, status_code=status.HTTP_201_CREATED)
def create_debtor(debtor_in: schemas.DebtorCreate, db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.create_debtor(db=db, debtor_in=debtor_in, account_id=account_id)

@router.get("/{debtor_id}/link", response_model=schemas.DebtorLinkResponse)
def get_debtor_link(debtor_id: str):
    link = service.generate_debtor_link(debtor_id)
    return schemas.DebtorLinkResponse(link=link)

@router.post("/{debtor_id}/settle", status_code=status.HTTP_200_OK)
def settle_debt(debtor_id: str, db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.settle_debt(db=db, debtor_id=debtor_id, account_id=account_id)
