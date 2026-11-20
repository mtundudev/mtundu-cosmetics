import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.contact import ContactInquiry
from backend.app.schemas.contact import ContactCreate
from backend.app.core.email import send_contact_email

logger = logging.getLogger(__name__)


def create_contact_inquiry(db: Session, contact_in: ContactCreate) -> ContactInquiry:
    db_contact = ContactInquiry(
        name=contact_in.name.strip(),
        email=contact_in.email.strip(),
        phone=contact_in.phone.strip() if contact_in.phone else None,
        message=contact_in.message.strip(),
        replied=False
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    return db_contact


def send_contact_notification(
    name: str,
    email: str,
    phone: Optional[str],
    message: str,
) -> None:
    try:
        if not send_contact_email(name=name, email=email, phone=phone, message=message):
            logger.error("Contact notification email was not sent for %s.", email)
    except Exception:
        logger.exception("Could not send contact notification email for %s.", email)


def get_all_inquiries(db: Session, skip: int = 0, limit: int = 100) -> List[ContactInquiry]:
    return (
        db.query(ContactInquiry)
        .order_by(desc(ContactInquiry.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_inquiry_replied(db: Session, inquiry_id: int, replied: bool) -> Optional[ContactInquiry]:
    inquiry = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if not inquiry:
        return None
    inquiry.replied = replied
    db.commit()
    db.refresh(inquiry)
    return inquiry
