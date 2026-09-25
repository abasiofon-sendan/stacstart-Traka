from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.notifications import schemas, service
from app.accounts.service import get_current_account_id

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.get_notifications(db, account_id)
