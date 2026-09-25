from sqlalchemy.orm import Session
from app.notifications import models

def get_notifications(db: Session, account_id: str):
    return db.query(models.Notification).filter(
        models.Notification.account_id == account_id
    ).order_by(models.Notification.created_at.desc()).all()

def create_notification(db: Session, account_id: str, title: str, message: str):
    db_notif = models.Notification(account_id=account_id, title=title, message=message)
    db.add(db_notif)
    db.commit()
    return db_notif
