import datetime
import json
from typing import Any, List
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_ref = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_address = Column(String(300), nullable=False)
    customer_email = Column(String(254), nullable=True)
    items_json = Column(Text, nullable=False, default="[]")
    subtotal = Column(Float, nullable=False, default=0.0)
    delivery_fee = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    status = Column(String(30), nullable=False, default="pending")
    payment_status = Column(String(30), nullable=False, default="unpaid")
    payment_method = Column(String(30), nullable=False, default="manual")
    payment_gateway_order_id = Column(String(100), nullable=True, unique=True)
    payment_gateway_url = Column(String(1000), nullable=True)
    payment_provider_ref = Column(String(100), nullable=True)
    payment_access_token_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    @property
    def items(self) -> List[Any]:
        try:
            return json.loads(self.items_json)
        except Exception:
            return []

    @items.setter
    def items(self, value: List[Any]) -> None:
        self.items_json = json.dumps(value)
