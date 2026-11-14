import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class OrderItemSchema(BaseModel):
    slug: str
    name: str
    priceValue: float = Field(..., ge=0)
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    name: str = Field(..., min_length=2, description="Customer full name")
    phone: str = Field(..., min_length=7, description="Customer phone number")
    address: str = Field(..., min_length=5, description="Delivery physical address")
    items: List[OrderItemSchema] = Field(..., min_length=1, description="List of items in cart")
    subtotal: float = Field(..., ge=0)
    deliveryFee: float = Field(default=0.0, ge=0)
    total: float = Field(..., ge=0)


class OrderOut(BaseModel):
    id: int
    order_ref: str
    customer_name: str
    customer_phone: str
    customer_address: str
    items: List[Any]
    subtotal: float
    delivery_fee: float
    total: float
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class DayRevenue(BaseModel):
    day: str
    total: float


class TopProduct(BaseModel):
    name: str
    quantity: int


class SalesMetrics(BaseModel):
    total_orders: int
    total_revenue: float
    avg_order: float
    revenue_by_day: List[DayRevenue]
    top_products: List[TopProduct]
    recent_orders: List[OrderOut]
