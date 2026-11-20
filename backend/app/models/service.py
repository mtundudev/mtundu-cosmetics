import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from backend.app.db.base import Base


class StoreService(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    title_en = Column(String(120), nullable=False, default="")
    description_en = Column(Text, nullable=False, default="")
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
