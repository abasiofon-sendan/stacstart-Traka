from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.webhooks import service

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/bank-settlement")
async def bank_settlement(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Receives inward settlement events (mock only for now).
    Creates an unallocated Transaction record against the matched merchant account.
    Signature verification is intentionally skipped until a real gateway is wired in.
    """
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Request body is empty — expected a JSON payload")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON in request body")

    return service.ingest_settlement(db=db, payload=payload)
