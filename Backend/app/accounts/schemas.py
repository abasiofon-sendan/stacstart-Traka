from pydantic import BaseModel, Field, constr
from typing import Optional

class AccountCreate(BaseModel):
    business_name: str
    phone_number: str
    country: str = "NG"
    pin: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$", description="6 digit PIN")

class AccountLogin(BaseModel):
    phone_number: str
    pin: str

class AccountResponse(BaseModel):
    id: str
    business_name: str
    phone_number: str
    country: str
    currency: str
    virtual_account_number: Optional[str] = None
    access_token: str
    refresh_token: str

    class Config:
        from_attributes = True

class AccountMeResponse(BaseModel):
    id: str
    business_name: str
    phone_number: str
    country: str
    currency: str
    virtual_account_number: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    virtual_account_number: Optional[str] = None

class WhatsAppSetupResponse(BaseModel):
    sandbox_number: str
    join_code: str
    join_message: str
    wa_link: str
    trial_note: str

class WhatsAppStatusResponse(BaseModel):
    linked: bool
    sender: Optional[str] = None
    last_seen: Optional[str] = None
