import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from backend.app.db.base import Base


class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    replied = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
