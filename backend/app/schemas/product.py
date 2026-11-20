import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    slug: Optional[str] = None
    name: str
    category: str
    price: str
    price_value: float
    discount_percent: int = Field(default=0, ge=0, le=100)
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
    discount_percent: Optional[int] = Field(default=None, ge=0, le=100)
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
