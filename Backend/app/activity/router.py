from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.accounts.service import get_current_account_id
from app.activity import schemas, service

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("/recent", response_model=List[schemas.ActivityLogResponse])
def get_recent_activity(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    return service.get_recent_activity(db, account_id, limit=limit)
