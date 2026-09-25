from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timezone
from app.db.database import SessionLocal
from app.inventory.models import Product
from app.debtors.models import Debtor
from app.notifications.service import create_notification

def check_low_stock():
    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.stock <= Product.low_stock_threshold).all()
        for p in products:
            create_notification(
                db=db,
                account_id=p.account_id,
                title="Low Stock Alert",
                message=f"Product '{p.name}' is low on stock ({p.stock} remaining)."
            )
    finally:
        db.close()

def check_due_debts():
    db = SessionLocal()
    try:
        today = datetime.now(timezone.utc).date()
        debtors = db.query(Debtor).filter(
            Debtor.status == "Unpaid",
            Debtor.due_date <= today
        ).all()
        for d in debtors:
            create_notification(
                db=db,
                account_id=d.account_id,
                title="Debt Due Alert",
                message=f"Debt for {d.name} ({d.amount}) is due today or overdue."
            )
    finally:
        db.close()

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_low_stock, 'interval', hours=24)
    scheduler.add_job(check_due_debts, 'interval', hours=24)
    scheduler.start()
