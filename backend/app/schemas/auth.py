from pydantic import BaseModel, Field


class AdminLogin(BaseModel):
    password: str = Field(..., min_length=1, description="Admin master password")


class TokenResponse(BaseModel):
    ok: bool = True
    message: str = "Login imefanikiwa"


class AdminStatus(BaseModel):
    authenticated: bool
    user: str = "admin"
