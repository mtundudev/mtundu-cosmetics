from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.contact import ContactInquiry
from backend.app.schemas.contact import ContactCreate
from backend.app.core.email import send_contact_email


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

    # Attempt to send notification email
    try:
        send_contact_email(
            name=db_contact.name,
            email=db_contact.email,
            phone=db_contact.phone,
            message=db_contact.message
        )
    except Exception as exc:
        print(f"[Contact Email Error] {exc}")

    return db_contact


def get_all_inquiries(db: Session, skip: int = 0, limit: int = 100) -> List[ContactInquiry]:
    return (
        db.query(ContactInquiry)
        .order_by(desc(ContactInquiry.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
