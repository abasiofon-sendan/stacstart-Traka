import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.db.database import Base, get_db

# Shared in-memory DB across threads (see test_accounts.py).
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

from app.accounts.service import get_current_account_id

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_account_id():
    return "dummy-account-id"

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_account_id] = override_get_current_account_id

client = TestClient(app)

def setup_account():
    db = TestingSessionLocal()
    from app.accounts.models import Account
    existing = db.query(Account).filter(Account.id == "dummy-account-id").first()
    if not existing:
        acc = Account(
            id="dummy-account-id",
            business_name="Dummy Business",
            phone_number="08000000000",
            nin="NIN1234567",
            pin_hash="hashed_pin"
        )
        db.add(acc)
        db.commit()
    db.close()

def test_create_debtor():
    setup_account()
    response = client.post(
        "/debtors/new",
        json={
            "name": "John Doe",
            "amount": 500.0,
            "items_summary": "3x Peak Milk",
            "items": [
                {
                    "product_name": "Peak Milk",
                    "qty": 3,
                    "price": 166.67
                }
            ]
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["amount"] == 500.0
    assert len(data["items"]) == 1
    assert data["items"][0]["product_name"] == "Peak Milk"
    return data["id"]

def test_get_debtors():
    setup_account()
    response = client.get("/debtors/all")
    assert response.status_code == 200
    data = response.json()
    assert "total_outstanding" in data
    assert isinstance(data["debtors"], list)

def test_get_debtor_link():
    debtor_id = test_create_debtor()
    response = client.get(f"/debtors/{debtor_id}/link")
    assert response.status_code == 200
    data = response.json()
    assert data["link"] == f"pay.traka/d-{debtor_id.replace('d-', '')}"

def test_settle_debt():
    debtor_id = test_create_debtor()
    response = client.post(f"/debtors/{debtor_id}/settle")
    assert response.status_code == 200
    assert response.json()["message"] == "Debt settled successfully"
