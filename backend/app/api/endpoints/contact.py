from typing import List, Dict, Any
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import require_admin
from backend.app.schemas.contact import ContactCreate, ContactOut, ContactReplyUpdate
from backend.app.services.contact_service import (
    create_contact_inquiry as service_create_contact,
    send_contact_notification as service_send_contact_notification,
    get_all_inquiries as service_get_all_inquiries,
    update_inquiry_replied as service_update_inquiry_replied,
)

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_200_OK)
def submit_contact_form(
    contact_in: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Submit customer contact message.
    Saves inquiry in database and sends notification email to store owner.
    """
    try:
        inquiry = service_create_contact(db=db, contact_in=contact_in)
        background_tasks.add_task(
            service_send_contact_notification,
            name=inquiry.name,
            email=inquiry.email,
            phone=inquiry.phone,
            message=inquiry.message,
        )
        return {
            "ok": True,
            "message": "Asante! Ujumbe wako umepokelewa, tutawasiliana nawe hivi punde."
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Imeshindikana kutuma ujumbe: {str(exc)}"
        )


@router.get("", response_model=List[ContactOut])
def list_contact_inquiries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin endpoint to view customer messages and inquiries."""
    return service_get_all_inquiries(db=db, skip=skip, limit=limit)


@router.patch("/{inquiry_id}", response_model=ContactOut)
def update_contact_inquiry(
    inquiry_id: int,
    payload: ContactReplyUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    inquiry = service_update_inquiry_replied(
        db=db,
        inquiry_id=inquiry_id,
        replied=payload.replied,
    )
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ujumbe haukupatikana.")
    return inquiry
