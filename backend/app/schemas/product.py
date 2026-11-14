import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    slug: str
    name: str
    category: str
    price: str
    price_value: float
    description: str
    image: str
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[str] = None
    price_value: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
