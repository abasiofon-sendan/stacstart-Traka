from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.accounts import schemas, service
from app.accounts import whatsapp as whatsapp_onboarding

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"]
)

@router.post("/signup", response_model=schemas.AccountResponse, status_code=status.HTTP_201_CREATED)
def signup(account_in: schemas.AccountCreate, db: Session = Depends(get_db)):
    """
    Create a new account with business name, phone number, country
    (NG/KE/GH/UG, default NG) and a 6-digit pin. Currency follows the
    country and seed products are stocked automatically.
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

@router.get("/whatsapp-setup", response_model=schemas.WhatsAppSetupResponse)
def whatsapp_setup():
    """
    Public join config for the Twilio WhatsApp sandbox: sandbox number,
    join code and a tap-to-join wa.me link. No auth — the join code is
    not a secret. Frontend shows this on the post-signup WhatsApp card.
    """
    return whatsapp_onboarding.setup_info()

@router.get("/whatsapp-status", response_model=schemas.WhatsAppStatusResponse)
def whatsapp_status(
    db: Session = Depends(get_db),
    account_id: str = Depends(service.get_current_account_id),
):
    """
    Has this account's WhatsApp number messaged us yet? Frontend polls
    this after showing the join card and flips to 'Connected' on true.
    """
    return whatsapp_onboarding.linkage_status(db=db, account_id=account_id)
