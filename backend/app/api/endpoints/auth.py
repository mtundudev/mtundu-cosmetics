from fastapi import APIRouter, Response, Request, status, HTTPException, Depends
from backend.app.core.config import settings
from backend.app.core.security import verify_password, is_authenticated_admin, require_admin
from backend.app.schemas.auth import AdminLogin, TokenResponse, AdminStatus

router = APIRouter(prefix="/admin", tags=["Admin Auth"])


@router.post("/login", response_model=TokenResponse)
def admin_login(payload: AdminLogin, response: Response):
    """Admin login endpoint setting HTTP-only session cookie."""
    if not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin password bado haijasanidiwa kwenye mfumo."
        )

    if not verify_password(payload.password, settings.ADMIN_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password sio sahihi."
        )

    response.set_cookie(
        key=settings.ADMIN_SESSION_COOKIE,
        value="authenticated",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )

    return TokenResponse(ok=True, token="authenticated", message="Umefanikiwa kuingia.")


@router.post("/logout")
def admin_logout(response: Response):
    """Admin logout endpoint clearing session cookie."""
    response.delete_cookie(key=settings.ADMIN_SESSION_COOKIE, path="/")
    return {"ok": True, "message": "Umetoka kwenye akaunti."}


@router.get("/me", response_model=AdminStatus)
def check_admin_status(request: Request):
    """Check if the current session has admin privileges."""
    is_auth = is_authenticated_admin(request)
    return AdminStatus(authenticated=is_auth, user="admin")
