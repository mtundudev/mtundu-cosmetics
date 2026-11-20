import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr


class OrderItemSchema(BaseModel):
    slug: str
    name: str
    priceValue: float = Field(..., ge=0)
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    name: str = Field(..., min_length=2, description="Customer full name")
    phone: str = Field(..., min_length=7, description="Customer phone number")
    address: str = Field(..., min_length=5, description="Delivery physical address")
    email: EmailStr | None = None
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
    customer_email: EmailStr | None = None
    items: List[Any]
    subtotal: float
    delivery_fee: float
    total: float
    status: str
    payment_status: str = "unpaid"
    payment_method: str = "manual"
    payment_provider_ref: str | None = None
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


class StatusCount(BaseModel):
    status: str
    count: int


class AdminOverview(BaseModel):
    total_products: int
    active_products: int
    total_orders: int
    pending_orders: int
    paid_orders: int
    unpaid_orders: int
    total_revenue: float
    paid_revenue: float
    total_contacts: int
    unanswered_contacts: int
    total_reviews: int
    pending_reviews: int
    orders_by_status: List[StatusCount]


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|processing|shipped|completed|cancelled)$")


class CheckoutRequest(BaseModel):
    access_token: str = Field(..., min_length=32, max_length=128)
    email: EmailStr


class TestPaymentRequest(BaseModel):
    access_token: str = Field(..., min_length=32, max_length=128)


class PaymentStatusOut(BaseModel):
    order_ref: str
    payment_status: str
    payment_method: str
    payment_provider_ref: str | None = None
    test_mode: bool
