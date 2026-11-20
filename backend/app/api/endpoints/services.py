from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from backend.app.core.security import is_authenticated_admin, require_admin
from backend.app.db.session import get_db
from backend.app.schemas.service import ServiceCreate, ServiceOut, ServiceUpdate
from backend.app.services.service_service import (
    create_service as service_create,
    get_services as service_get_all,
    update_service as service_update,
)

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=List[ServiceOut])
def list_services(
    request: Request,
    include_inactive: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    if include_inactive and not is_authenticated_admin(request):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hujaidhinishwa kama admin. Tafadhali ingia kwanza.",
        )
    return service_get_all(db=db, include_inactive=include_inactive)


@router.post("", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def add_service(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    return service_create(db=db, service_in=service_in)


@router.patch("/{service_id}", response_model=ServiceOut)
def modify_service(
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    updated = service_update(db=db, service_id=service_id, service_in=service_in)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Huduma haikupatikana.",
        )
    return updated
