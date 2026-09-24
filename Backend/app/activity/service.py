from typing import Any, Optional

from sqlalchemy.orm import Session

from app.activity.models import ActivityLog


def log_activity(
    db: Session,
    account_id: str,
    activity_type: str,
    title: str,
    description: Optional[str] = None,
    event_metadata: Optional[Any] = None,
) -> ActivityLog:
    entry = ActivityLog(
        account_id=account_id,
        activity_type=activity_type,
        title=title,
        description=description,
        event_metadata=event_metadata,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_recent_activity(db: Session, account_id: str, limit: int = 20) -> list[ActivityLog]:
    return (
        db.query(ActivityLog)
        .filter(ActivityLog.account_id == account_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
