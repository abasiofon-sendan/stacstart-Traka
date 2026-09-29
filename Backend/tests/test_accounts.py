import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid

from main import app
from app.db.database import Base, get_db

# In-memory SQLite shared across threads (TestClient runs endpoints
# in a worker thread, so the default per-connection memory DB would
# appear empty there). StaticPool keeps a single shared connection.
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_signup():
    response = client.post(
        "/accounts/signup",
        json={
            "business_name": "Test Business",
            "phone_number": "08012345678",
            "country": "NG",
            "pin": "123456"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["business_name"] == "Test Business"
    assert data["phone_number"] == "08012345678"
    assert data["country"] == "NG"
    assert data["currency"] == "NGN"
    assert "nin" not in data
    assert "id" in data
    assert data["virtual_account_number"] == "8012345678"
    assert "access_token" in data
    assert "refresh_token" in data

def test_signup_kenya_seeds():
    phone = f"0712{uuid.uuid4().hex[:6]}"
    response = client.post(
        "/accounts/signup",
        json={
            "business_name": "Kenya Shop",
            "phone_number": phone,
            "country": "KE",
            "pin": "123456"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["currency"] == "KES"
    # Other test modules override the auth dependency globally, so restore
    # the real one temporarily to exercise the authed /accounts/me endpoint.
    from app.accounts.service import get_current_account_id
    saved = app.dependency_overrides.pop(get_current_account_id, None)
    try:
        me = client.get("/accounts/me",
                        headers={"Authorization": f"Bearer {data['access_token']}"})
        products = client.get("/inventory",
                              headers={"Authorization": f"Bearer {data['access_token']}"})
    finally:
        if saved is not None:
            app.dependency_overrides[get_current_account_id] = saved
    assert me.status_code == 200
    assert me.json()["currency"] == "KES"
    # seed catalogue stocked automatically in minor units + KES
    assert products.status_code == 200
    assert len(products.json()) == 5
    assert all(p["currency"] == "KES" for p in products.json())

def test_signup_invalid_country():
    response = client.post(
        "/accounts/signup",
        json={
            "business_name": "Nowhere Shop",
            "phone_number": "08012345670",
            "country": "XX",
            "pin": "123456"
        }
    )
    assert response.status_code == 400

def test_signup_invalid_pin():
    response = client.post(
        "/accounts/signup",
        json={
            "business_name": "Test Business 2",
            "phone_number": "08012345679",
            "country": "NG",
            "pin": "123" # Too short
        }
    )
    assert response.status_code == 422 # Validation error

def test_login():
    # Setup - Signup first
    phone = f"08099{uuid.uuid4().hex[:6]}"
    client.post(
        "/accounts/signup",
        json={
            "business_name": "Login Test Business",
            "phone_number": phone,
            "country": "NG",
            "pin": "123456"
        }
    )
    
    # Login
    response = client.post(
        "/accounts/login",
        json={
            "phone_number": phone,
            "pin": "123456"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["virtual_account_number"] == phone[1:]
