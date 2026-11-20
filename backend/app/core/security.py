import hashlib
import hmac
import secrets
import time
from fastapi import Request, HTTPException, status
from backend.app.core.config import settings


def verify_password(plain_password: str, expected_password: str) -> bool:
    """Safely compare passwords using constant-time comparison."""
    if not plain_password or not expected_password:
        return False
    return secrets.compare_digest(
        plain_password.encode("utf-8"),
        expected_password.encode("utf-8"),
    )


def create_admin_session() -> str:
    expires_at = str(int(time.time()) + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        expires_at.encode("ascii"),
        hashlib.sha256,
    ).hexdigest()
    return f"{expires_at}.{signature}"


def is_authenticated_admin(request: Request) -> bool:
    """
    Check whether the request contains a valid, signed admin session cookie.
    """
    cookie_val = request.cookies.get(settings.ADMIN_SESSION_COOKIE)
    if not cookie_val or not settings.SECRET_KEY:
        return False

    try:
        expires_at, signature = cookie_val.split(".", 1)
        if not expires_at.isascii() or not expires_at.isdecimal():
            return False
        if int(expires_at) <= int(time.time()):
            return False
    except (ValueError, TypeError):
        return False

    if len(signature) != 64 or any(character not in "0123456789abcdef" for character in signature):
        return False

    expected_signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        expires_at.encode("ascii"),
        hashlib.sha256,
    ).hexdigest()
    return secrets.compare_digest(signature, expected_signature)


def require_admin(request: Request) -> bool:
    """Dependency for admin-protected routes."""
    if not is_authenticated_admin(request):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hujaidhinishwa kama admin. Tafadhali ingia kwanza."
        )
    return True
