from fastapi import APIRouter, Response, Request, status, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.admin_profile import AdminProfile
from backend.app.schemas.admin import AdminProfileOut, AdminProfileUpdate
from backend.app.schemas.order import AdminOverview
from backend.app.core.config import settings
from backend.app.core.security import (
    create_admin_session,
    is_authenticated_admin,
    require_admin,
    verify_password,
)
from backend.app.schemas.auth import AdminLogin, TokenResponse, AdminStatus
from backend.app.services.order_service import get_admin_overview

router = APIRouter(prefix="/admin", tags=["Admin Auth"])


@router.post("/login", response_model=TokenResponse)
def admin_login(payload: AdminLogin, response: Response):
    """Admin login endpoint setting HTTP-only session cookie."""
    if not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin password bado haijasanidiwa kwenye mfumo."
        )
    if not settings.SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Secret key haijasanidiwa kwenye mfumo."
        )

    if not verify_password(payload.password, settings.ADMIN_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password sio sahihi."
        )

    response.set_cookie(
        key=settings.ADMIN_SESSION_COOKIE,
        value=create_admin_session(),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
        path="/",
    )

    return TokenResponse(ok=True, message="Umefanikiwa kuingia.")


@router.post("/logout")
def admin_logout(response: Response):
    """Admin logout endpoint clearing session cookie."""
    response.delete_cookie(
        key=settings.ADMIN_SESSION_COOKIE,
        path="/",
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
    )
    return {"ok": True, "message": "Umetoka kwenye akaunti."}


@router.get("/me", response_model=AdminStatus)
def check_admin_status(request: Request):
    """Check if the current session has admin privileges."""
    is_auth = is_authenticated_admin(request)
    return AdminStatus(authenticated=is_auth, user="admin")


@router.get("/overview", response_model=AdminOverview)
def admin_overview(
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    return get_admin_overview(db)


def _get_or_create_profile(db: Session) -> AdminProfile:
    profile = db.query(AdminProfile).filter(AdminProfile.id == 1).first()
    if profile:
        return profile
    profile = AdminProfile(id=1, display_name="Msimamizi")
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/profile", response_model=AdminProfileOut)
def get_admin_profile(
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    return _get_or_create_profile(db)


@router.put("/profile", response_model=AdminProfileOut)
def update_admin_profile(
    profile_in: AdminProfileUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    profile = _get_or_create_profile(db)
    profile.display_name = profile_in.display_name.strip()
    profile.avatar_path = profile_in.avatar_path
    db.commit()
    db.refresh(profile)
    return profile
