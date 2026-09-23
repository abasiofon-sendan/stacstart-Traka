import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from main import app
from app.db.database import Base, get_db

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
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
    test_nin = f"NIN{uuid.uuid4().hex[:10]}"
    response = client.post(
        "/accounts/signup",
        json={
            "business_name": "Test Business",
            "phone_number": "08012345678",
            "nin": test_nin,
            "pin": "123456"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["business_name"] == "Test Business"
    assert data["phone_number"] == "08012345678"
    assert "id" in data
    assert data["virtual_account_number"] == "8012345678"
    assert "access_token" in data
    assert "refresh_token" in data

def test_signup_invalid_pin():
    response = client.post(
        "/accounts/signup",
        json={
            "business_name": "Test Business 2",
            "phone_number": "08012345679",
            "nin": "12345678901",
            "pin": "123" # Too short
        }
    )
    assert response.status_code == 422 # Validation error

def test_login():
    # Setup - Signup first
    phone = f"08099{uuid.uuid4().hex[:6]}"
    nin = f"NIN{uuid.uuid4().hex[:10]}"
    client.post(
        "/accounts/signup",
        json={
            "business_name": "Login Test Business",
            "phone_number": phone,
            "nin": nin,
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
