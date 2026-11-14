import secrets
from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from backend.app.core.config import settings


def verify_password(plain_password: str, expected_password: str) -> bool:
    """Safely compare passwords using constant-time comparison."""
    if not plain_password or not expected_password:
        return False
    return secrets.compare_digest(plain_password.strip(), expected_password.strip())


def is_authenticated_admin(request: Request) -> bool:
    """
    Check if the incoming request has valid admin credentials:
    1. Cookie: admin_session == 'authenticated' or matching SECRET_KEY
    2. Header: Authorization: Bearer <ADMIN_PASSWORD> or <SECRET_KEY>
    """
    # Check session cookie
    cookie_val = request.cookies.get(settings.ADMIN_SESSION_COOKIE)
    if cookie_val in ("authenticated", settings.SECRET_KEY):
        return True

    # Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        if secrets.compare_digest(token, settings.ADMIN_PASSWORD) or secrets.compare_digest(token, settings.SECRET_KEY):
            return True

    return False


def require_admin(request: Request) -> bool:
    """Dependency for admin-protected routes."""
    if not is_authenticated_admin(request):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hujaidhinishwa kama admin. Tafadhali ingia kwanza."
        )
    return True
