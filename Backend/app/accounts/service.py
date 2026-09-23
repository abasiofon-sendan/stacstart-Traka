from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.accounts import models, schemas
from app.db.database import get_db

security = HTTPBearer()

# Security configurations
SECRET_KEY = "supersecretkey_please_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 3  # 3 days
REFRESH_TOKEN_EXPIRE_DAYS = 60 * 24 * 3

def get_pin_hash(pin: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pin.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    return bcrypt.checkpw(plain_pin.encode('utf-8'), hashed_pin.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_virtual_account(phone_number: str) -> str:
    if phone_number.startswith("0"):
        return phone_number[1:]
    return phone_number

def create_account(db: Session, account_in: schemas.AccountCreate) -> schemas.AccountResponse:
    # Check if phone number exists
    existing_phone = db.query(models.Account).filter(models.Account.phone_number == account_in.phone_number).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    # Check if NIN exists
    existing_nin = db.query(models.Account).filter(models.Account.nin == account_in.nin).first()
    if existing_nin:
        raise HTTPException(status_code=400, detail="NIN already registered")

    virtual_acc = generate_virtual_account(account_in.phone_number)
    
    db_account = models.Account(
        business_name=account_in.business_name,
        phone_number=account_in.phone_number,
        nin=account_in.nin,
        pin_hash=get_pin_hash(account_in.pin),
        virtual_account_number=virtual_acc
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_account.phone_number}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"sub": db_account.phone_number}, expires_delta=refresh_token_expires
    )
    
    return schemas.AccountResponse(
        id=db_account.id,
        business_name=db_account.business_name,
        phone_number=db_account.phone_number,
        nin=db_account.nin,
        virtual_account_number=db_account.virtual_account_number,
        access_token=access_token,
        refresh_token=refresh_token
    )

def authenticate_account(db: Session, login_data: schemas.AccountLogin) -> schemas.TokenResponse:
    account = db.query(models.Account).filter(models.Account.phone_number == login_data.phone_number).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or PIN",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_pin(login_data.pin, account.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or PIN",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # The prompt indicates the virtual account is created on authentication. 
    # If for some reason it's not set, we can update it, but we already set it on creation.
    if not account.virtual_account_number:
        account.virtual_account_number = generate_virtual_account(account.phone_number)
        db.commit()
        db.refresh(account)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": account.phone_number}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"sub": account.phone_number}, expires_delta=refresh_token_expires
    )

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        virtual_account_number=account.virtual_account_number
    )

def get_account(db: Session, account_id: str) -> models.Account:
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


def get_current_account_id(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
) -> str:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    account = db.query(models.Account).filter(models.Account.phone_number == phone_number).first()
    if account is None:
        raise credentials_exception
    return account.id
