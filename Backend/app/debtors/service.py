from sqlalchemy.orm import Session
from app.debtors import models, schemas
from fastapi import HTTPException
from app.activity.service import log_activity

def get_debtors_summary(db: Session, account_id: str):
    debtors = db.query(models.Debtor).filter(
        models.Debtor.account_id == account_id,
        models.Debtor.status == "Unpaid"
    ).all()
    total_outstanding = sum(d.amount for d in debtors)
    return {"total_outstanding": total_outstanding, "debtors": debtors}

def create_debtor(db: Session, debtor_in: schemas.DebtorCreate, account_id: str):
    db_debtor = models.Debtor(
        account_id=account_id,
        name=debtor_in.name,
        amount=debtor_in.amount,
        items_summary=debtor_in.items_summary,
        due_date=debtor_in.due_date
    )
    db.add(db_debtor)
    db.flush() # flush to get the debtor id for items

    for item_in in debtor_in.items:
        db_item = models.DebtorItem(
            debtor_id=db_debtor.id,
            product_name=item_in.product_name,
            qty=item_in.qty,
            price=item_in.price
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_debtor)

    log_activity(
        db,
        account_id=account_id,
        activity_type="debtor_created",
        title="Debtor Added",
        description=f"{db_debtor.name} added with outstanding balance of ₦{db_debtor.amount:,.2f}",
        event_metadata={
            "debtor_id": db_debtor.id,
            "debtor_name": db_debtor.name,
            "amount": db_debtor.amount,
        },
    )

    return db_debtor

def generate_debtor_link(debtor_id: str):
    return f"pay.traka/d-{debtor_id.replace('d-', '')}" if debtor_id.startswith('d-') else f"pay.traka/d-{debtor_id}"

def settle_debt(db: Session, debtor_id: str, account_id: str):
    debtor = db.query(models.Debtor).filter(
        models.Debtor.id == debtor_id,
        models.Debtor.account_id == account_id
    ).first()
    
    if not debtor:
        raise HTTPException(status_code=404, detail="Debtor not found")
        
    if debtor.status == "Paid":
        raise HTTPException(status_code=400, detail="Debt is already paid")
        
    debtor.status = "Paid"
    
    from app.transactions import schemas as txn_schemas
    from app.transactions import service as txn_service
    
    txn_in = txn_schemas.TransactionCreate(
        title=f"Debt Repayment: {debtor.name}",
        details=f"Settlement of outstanding debt: {debtor.items_summary}",
        amount=debtor.amount,
        profit=0.0,
        payment_method="Transfer",
        transaction_type="debt_repayment"
    )
    
    txn_service.create_transaction(db=db, transaction_in=txn_in, account_id=account_id)
    
    db.commit()
    db.refresh(debtor)

    log_activity(
        db,
        account_id=account_id,
        activity_type="debt_settled",
        title="Debt Settled",
        description=f"{debtor.name}'s debt has been fully settled",
        event_metadata={
            "debtor_id": debtor.id,
            "debtor_name": debtor.name,
        },
    )

    return {"message": "Debt settled successfully"}
