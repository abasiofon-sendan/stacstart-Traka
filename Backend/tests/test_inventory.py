from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch
import uuid

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
    # Setup dummy account directly in DB to satisfy foreign keys
    db = TestingSessionLocal()
    from app.accounts.models import Account
    acc = Account(
        id="dummy-account-id",
        business_name="Dummy Business",
        phone_number="08000000000",
        nin="NIN1234567",
        pin_hash="hashed_pin"
    )
    # Check if exists to avoid errors on multiple tests
    existing = db.query(Account).filter(Account.id == "dummy-account-id").first()
    if not existing:
        db.add(acc)
        db.commit()
    db.close()

def test_create_product():
    setup_account()
    response = client.post(
        "/inventory",
        json={
            "name": "Test Product",
            "cost_price": 100.0,
            "selling_price": 150.0,
            "quantity": 10,
            "low_stock_threshold": 5
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"
    assert data["quantity"] == 10
    assert "id" in data
    return data["id"]

def test_get_products():
    setup_account()
    response = client.get("/inventory")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_product():
    product_id = test_create_product()
    response = client.put(
        f"/inventory/{product_id}",
        json={
            "quantity": 15
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 15

def test_delete_product():
    product_id = test_create_product()
    response = client.delete(f"/inventory/{product_id}")
    assert response.status_code == 200
    # verify deletion
    response2 = client.get("/inventory")
    ids = [p["id"] for p in response2.json()]
    assert product_id not in ids

def test_extract_product():
    setup_account()
    with patch("app.inventory.service.extract_product_from_images") as mock_extract:
        mock_extract.return_value = [{"index": 0, "name": "Peak Milk Tin (400g)"}]

        file_content = b"fake image content"
        response = client.post(
            "/inventory/extract-product",
            files={"images": ("test.jpg", file_content, "image/jpeg")}
        )
        assert response.status_code == 200
        assert response.json()["names"] == ["Peak Milk Tin (400g)"]
        mock_extract.assert_called_once()
