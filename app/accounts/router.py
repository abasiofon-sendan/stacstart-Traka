from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.accounts import schemas, service

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"]
)

@router.post("/signup", response_model=schemas.AccountResponse, status_code=status.HTTP_201_CREATED)
def signup(account_in: schemas.AccountCreate, db: Session = Depends(get_db)):
    """
    Create a new account with business name, phone number, nin, and a 6-digit pin.
    """
    return service.create_account(db=db, account_in=account_in)

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.AccountLogin, db: Session = Depends(get_db)):
    """
    Authenticate an account using phone number and pin.
    Returns access token, refresh token, and the generated virtual account number.
    """
    return service.authenticate_account(db=db, login_data=login_data)

@router.get("/me", response_model=schemas.AccountMeResponse)
def get_me(
    db: Session = Depends(get_db),
    account_id: str = Depends(service.get_current_account_id),
):
    """
    Return the profile of the currently authenticated account holder.
    """
    return service.get_account(db=db, account_id=account_id)
