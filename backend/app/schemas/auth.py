from pydantic import BaseModel, Field


class AdminLogin(BaseModel):
    password: str = Field(..., min_length=1, description="Admin master password")


class TokenResponse(BaseModel):
    ok: bool = True
    token: str = "authenticated"
    message: str = "Login imefanikiwa"


class AdminStatus(BaseModel):
    authenticated: bool
    user: str = "admin"
