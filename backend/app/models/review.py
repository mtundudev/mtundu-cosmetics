import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from backend.app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    rating = Column(Integer, nullable=False, default=5)
    message = Column(Text, nullable=False)
    approved = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
