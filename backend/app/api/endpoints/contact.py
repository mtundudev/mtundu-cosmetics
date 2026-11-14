from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import require_admin
from backend.app.schemas.contact import ContactCreate, ContactOut
from backend.app.services.contact_service import (
    create_contact_inquiry as service_create_contact,
    get_all_inquiries as service_get_all_inquiries
)

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_200_OK)
def submit_contact_form(contact_in: ContactCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Submit customer contact message.
    Saves inquiry in database and sends notification email to store owner.
    """
    try:
        service_create_contact(db=db, contact_in=contact_in)
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
