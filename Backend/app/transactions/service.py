import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.transactions import models as tx_models
from app.inventory import models as inv_models
from app.debtors import models as debtor_models
from app.activity.service import log_activity


# ─── Read ────────────────────────────────────────────────────────────────────

def get_transactions(db: Session, account_id: str) -> List[tx_models.Transaction]:
    return (
        db.query(tx_models.Transaction)
        .filter(tx_models.Transaction.account_id == account_id)
        .order_by(tx_models.Transaction.created_at.desc())
        .all()
    )


def get_unallocated(db: Session, account_id: str) -> List[tx_models.Transaction]:
    return (
        db.query(tx_models.Transaction)
        .filter(
            tx_models.Transaction.account_id == account_id,
            tx_models.Transaction.status == "unallocated",
        )
        .order_by(tx_models.Transaction.created_at.desc())
        .all()
    )


# ─── Shared basket helper ────────────────────────────────────────────────────

def _apply_basket(
    db: Session,
    account_id: str,
    items: List[dict],  # [{"product_id": str, "quantity": int}]
) -> tuple[float, float, str]:
    """
    Validates each basket item, decrements stock, and returns
    (total_revenue, total_cost, details_string).
    Revenue is sum of selling_price * qty; cost is sum of cost_price * qty.
    """
    total_revenue = 0.0
    total_cost = 0.0
    item_labels = []

    for item in items:
        product = (
            db.query(inv_models.Product)
            .filter(
                inv_models.Product.id == item["product_id"],
                inv_models.Product.account_id == account_id,
            )
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product '{item['product_id']}' not found",
            )
        qty = item["quantity"]
        if product.quantity < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}' "
                       f"(have {product.quantity}, need {qty})",
            )
        product.quantity -= qty
        total_revenue += product.selling_price * qty
        total_cost    += product.cost_price    * qty
        item_labels.append(f"{product.name} x{qty}")

    return total_revenue, total_cost, ", ".join(item_labels)


# ─── Cash Sale ───────────────────────────────────────────────────────────────

def log_cash_sale(
    db: Session,
    account_id: str,
    sender_name: str,
    items: List[dict],
) -> tx_models.Transaction:
    """
    Logs a direct cash sale. No prior unallocated transaction exists —
    the Transaction row is created and immediately reconciled in one step.
    Revenue is computed from product selling prices × quantities.
    """
    total_revenue, total_cost, details = _apply_basket(db, account_id, items)
    profit = total_revenue - total_cost

    txn = tx_models.Transaction(
        account_id=account_id,
        reference=f"CASH-{uuid.uuid4().hex[:10].upper()}",
        sender_name=sender_name,
        channel="cash",
        status="reconciled",
        amount=total_revenue,
        profit=profit,
        payment_method="cash",
        transaction_type="sale",
        title="Cash Sale",
        details=details,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    log_activity(
        db,
        account_id=account_id,
        activity_type="sale_reconciled",
        title="Cash Sale",
        description=f"₦{txn.amount:,.2f} cash sale — {txn.details}",
        event_metadata={
            "amount": txn.amount,
            "profit": txn.profit,
            "reference": txn.reference,
        },
    )

    return txn


# ─── Reconciliation ──────────────────────────────────────────────────────────

def _get_unallocated_txn(
    db: Session, reference: str, account_id: str
) -> tx_models.Transaction:
    txn = (
        db.query(tx_models.Transaction)
        .filter(
            tx_models.Transaction.reference == reference,
            tx_models.Transaction.account_id == account_id,
            tx_models.Transaction.status == "unallocated",
        )
        .first()
    )
    if not txn:
        raise HTTPException(
            status_code=404,
            detail=f"Unallocated transaction '{reference}' not found for this account",
        )
    return txn


def reconcile_as_sale(
    db: Session,
    account_id: str,
    reference: str,
    items: List[dict],
) -> tx_models.Transaction:
    """
    Maps an unallocated (transfer) transaction to a retail sale.
    Delegates stock decrement + revenue calc to _apply_basket.
    """
    txn = _get_unallocated_txn(db, reference, account_id)
    total_revenue, total_cost, details = _apply_basket(db, account_id, items)

    txn.status = "reconciled"
    txn.transaction_type = "sale"
    txn.payment_method = txn.channel or "transfer"
    txn.title = "Sales Income"
    txn.details = details
    txn.profit = total_revenue - total_cost

    db.commit()
    db.refresh(txn)

    log_activity(
        db,
        account_id=account_id,
        activity_type="sale_reconciled",
        title="Sale Reconciled",
        description=f"₦{txn.amount:,.2f} sale — {txn.details}",
        event_metadata={
            "amount": txn.amount,
            "profit": txn.profit,
            "reference": txn.reference,
        },
    )

    return txn


def reconcile_as_debt(
    db: Session,
    account_id: str,
    reference: str,
    debtor_id: str,
    repayment_amount: float,
) -> tx_models.Transaction:
    """
    Maps an unallocated transaction to a debt repayment.
    Credits the debtor's outstanding balance and marks the debtor Paid when
    the balance reaches zero.
    """
    txn = _get_unallocated_txn(db, reference, account_id)

    debtor = (
        db.query(debtor_models.Debtor)
        .filter(
            debtor_models.Debtor.id == debtor_id,
            debtor_models.Debtor.account_id == account_id,
        )
        .first()
    )
    if not debtor:
        raise HTTPException(status_code=404, detail=f"Debtor '{debtor_id}' not found")

    debtor.amount = max(0.0, debtor.amount - repayment_amount)
    if debtor.amount == 0.0:
        debtor.status = "Paid"

    txn.status = "reconciled"
    txn.transaction_type = "debt_repayment"
    txn.payment_method = txn.channel or "transfer"
    txn.title = f"Debt Repayment — {debtor.name}"
    txn.details = f"₦{repayment_amount:,.2f} credited against outstanding balance"
    txn.profit = 0.0  # debt repayments carry no margin profit

    db.commit()
    db.refresh(txn)

    log_activity(
        db,
        account_id=account_id,
        activity_type="debt_repayment_reconciled",
        title="Debt Repayment Reconciled",
        description=f"₦{repayment_amount:,.2f} credited to {debtor.name}",
        event_metadata={
            "amount": repayment_amount,
            "debtor_id": debtor_id,
            "reference": txn.reference,
        },
    )

    return txn
