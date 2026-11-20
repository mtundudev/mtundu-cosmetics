from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.service import StoreService
from backend.app.schemas.service import ServiceCreate, ServiceUpdate


def get_services(db: Session, include_inactive: bool = False) -> List[StoreService]:
    query = db.query(StoreService)
    if not include_inactive:
        query = query.filter(StoreService.is_active.is_(True))
    return query.order_by(StoreService.id.asc()).all()


def create_service(db: Session, service_in: ServiceCreate) -> StoreService:
    service = StoreService(
        **{
            key: value.strip() if isinstance(value, str) else value
            for key, value in service_in.model_dump().items()
        }
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def update_service(
    db: Session,
    service_id: int,
    service_in: ServiceUpdate,
) -> Optional[StoreService]:
    service = db.query(StoreService).filter(StoreService.id == service_id).first()
    if service is None:
        return None
    for key, value in service_in.model_dump(exclude_unset=True).items():
        setattr(service, key, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(service)
    return service
