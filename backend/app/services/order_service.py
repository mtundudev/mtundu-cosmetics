import datetime
import html
import random
from collections import defaultdict
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.order import Order
from backend.app.schemas.order import OrderCreate, OrderOut, SalesMetrics, DayRevenue, TopProduct
from backend.app.core.email import send_order_email


def generate_order_ref() -> str:
    date_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    random_code = random.randint(1000, 9999)
    return f"MC-{date_str}-{random_code}"


def create_order(db: Session, order_in: OrderCreate) -> Tuple[Order, str]:
    order_ref = generate_order_ref()

    items_data = [item.model_dump() for item in order_in.items]

    db_order = Order(
        order_ref=order_ref,
        customer_name=order_in.name.strip(),
        customer_phone=order_in.phone.strip(),
        customer_address=order_in.address.strip(),
        subtotal=order_in.subtotal,
        delivery_fee=order_in.deliveryFee,
        total=order_in.total,
        status="pending"
    )
    db_order.items = items_data

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Prepare summary text and HTML for email
    items_summary_lines = []
    items_html_lines = []
    for item in order_in.items:
        line_total = item.priceValue * item.quantity
        items_summary_lines.append(f"{item.name} x{item.quantity} = TZS {line_total:,.0f}")
        items_html_lines.append(
            f"<li>{html.escape(item.name)} x{item.quantity} = TZS {line_total:,.0f}</li>"
        )

    items_summary = "\n".join(items_summary_lines)
    items_html = "".join(items_html_lines)

    # Non-blocking email attempt
    try:
        send_order_email(
            order_ref=order_ref,
            name=order_in.name,
            phone=order_in.phone,
            address=order_in.address,
            items_summary=items_summary,
            subtotal=order_in.subtotal,
            delivery_fee=order_in.deliveryFee,
            total=order_in.total,
            items_html=items_html
        )
    except Exception as exc:
        print(f"[Order Email Error] {exc}")

    return db_order, order_ref


def get_order_by_ref(db: Session, order_ref: str) -> Optional[Order]:
    return db.query(Order).filter(Order.order_ref == order_ref).first()


def get_all_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
    return db.query(Order).order_by(desc(Order.created_at)).offset(skip).limit(limit).all()


def get_sales_metrics(db: Session) -> SalesMetrics:
    orders = db.query(Order).order_by(Order.created_at.asc()).all()

    total_orders = len(orders)
    total_revenue = sum(o.total for o in orders)
    avg_order = (total_revenue / total_orders) if total_orders > 0 else 0.0

    # Revenue by day
    revenue_map: Dict[str, float] = defaultdict(float)
    for o in orders:
        day_str = o.created_at.strftime("%d/%m")
        revenue_map[day_str] += o.total

    revenue_by_day = [
        DayRevenue(day=day, total=total) for day, total in revenue_map.items()
    ]

    # Top products sold
    product_map: Dict[str, int] = defaultdict(int)
    for o in orders:
        for item in o.items:
            name = item.get("name", "Unknown")
            quantity = int(item.get("quantity", 1))
            product_map[name] += quantity

    sorted_products = sorted(product_map.items(), key=lambda x: x[1], reverse=True)[:6]
    top_products = [
        TopProduct(name=name, quantity=qty) for name, qty in sorted_products
    ]

    recent_orders_db = db.query(Order).order_by(desc(Order.created_at)).limit(10).all()
    recent_orders = [
        OrderOut(
            id=o.id,
            order_ref=o.order_ref,
            customer_name=o.customer_name,
            customer_phone=o.customer_phone,
            customer_address=o.customer_address,
            items=o.items,
            subtotal=o.subtotal,
            delivery_fee=o.delivery_fee,
            total=o.total,
            status=o.status,
            created_at=o.created_at
        ) for o in recent_orders_db
    ]

    return SalesMetrics(
        total_orders=total_orders,
        total_revenue=total_revenue,
        avg_order=round(avg_order, 2),
        revenue_by_day=revenue_by_day,
        top_products=top_products,
        recent_orders=recent_orders
    )
