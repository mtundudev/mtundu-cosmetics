import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, description="Sender name")
    email: EmailStr = Field(..., description="Valid email address")
    phone: Optional[str] = Field(default=None, description="Optional phone number")
    message: str = Field(..., min_length=5, description="Inquiry message text")


class ContactOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    replied: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ContactReplyUpdate(BaseModel):
    replied: bool
