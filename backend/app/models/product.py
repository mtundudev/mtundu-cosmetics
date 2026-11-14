import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from backend.app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(80), nullable=False, index=True)
    price = Column(String(50), nullable=False)
    price_value = Column(Float, nullable=False, default=0.0)
    description = Column(Text, nullable=False)
    image = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
