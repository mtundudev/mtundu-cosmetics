import datetime
import hashlib
import json
import logging
import secrets
from collections import defaultdict
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from backend.app.models.contact import ContactInquiry
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.review import Review
from backend.app.schemas.order import (
    AdminOverview,
    DayRevenue,
    OrderCreate,
    OrderOut,
    SalesMetrics,
    StatusCount,
    TopProduct,
)
from backend.app.core.email import send_order_email

logger = logging.getLogger(__name__)


def generate_order_ref() -> str:
    date_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    random_code = secrets.token_hex(4).upper()
    return f"MC-{date_str}-{random_code}"


def create_order(db: Session, order_in: OrderCreate) -> Tuple[Order, str, str]:
    order_ref = generate_order_ref()
    access_token = secrets.token_urlsafe(32)
    requested_slugs = {item.slug for item in order_in.items}
    products = (
        db.query(Product)
        .filter(Product.slug.in_(requested_slugs), Product.is_active.is_(True))
        .all()
    )
    product_map = {product.slug: product for product in products}
    if len(product_map) != len(requested_slugs):
        raise ValueError("Bidhaa moja au zaidi hazipatikani tena dukani.")

    items_data = []
    for item in order_in.items:
        product = product_map[item.slug]
        discount_percent = int(product.discount_percent or 0)
        original_price = product.price_value
        discounted_price = (
            int((original_price * (100 - discount_percent) / 100) + 0.5)
            if discount_percent
            else original_price
        )
        items_data.append(
            {
                "slug": item.slug,
                "name": product.name,
                "priceValue": discounted_price,
                "originalPriceValue": original_price,
                "discountPercent": discount_percent,
                "quantity": item.quantity,
            }
        )
    subtotal = sum(item["priceValue"] * item["quantity"] for item in items_data)
    delivery_fee = 0.0 if subtotal >= 50000 else 5000.0

    db_order = Order(
        order_ref=order_ref,
        customer_name=order_in.name.strip(),
        customer_phone=order_in.phone.strip(),
        customer_address=order_in.address.strip(),
        customer_email=str(order_in.email) if order_in.email else None,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=subtotal + delivery_fee,
        status="pending",
        payment_status="unpaid",
        payment_method="manual",
        payment_access_token_hash=hashlib.sha256(access_token.encode("utf-8")).hexdigest(),
    )
    db_order.items = items_data

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order, order_ref, access_token


def send_order_notification(
    order_ref: str,
    name: str,
    phone: str,
    address: str,
    customer_email: Optional[str],
    items: List[Dict[str, Any]],
    subtotal: float,
    delivery_fee: float,
    total: float,
) -> None:
    try:
        email_sent = send_order_email(
            order_ref=order_ref,
            name=name,
            phone=phone,
            address=address,
            customer_email=customer_email,
            items=items,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
        )
        if not email_sent:
            logger.error("Order notification email was not sent for %s.", order_ref)
    except Exception:
        logger.exception("Could not send order notification email for %s.", order_ref)


def get_order_by_ref(db: Session, order_ref: str) -> Optional[Order]:
    return db.query(Order).filter(Order.order_ref == order_ref).first()


def get_all_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
    return db.query(Order).order_by(desc(Order.created_at)).offset(skip).limit(limit).all()


def get_sales_metrics(db: Session) -> SalesMetrics:
    total_orders, total_revenue = (
        db.query(func.count(Order.id), func.coalesce(func.sum(Order.total), 0))
        .one()
    )
    total_orders = int(total_orders)
    total_revenue = float(total_revenue)
    avg_order = (total_revenue / total_orders) if total_orders > 0 else 0.0

    revenue_map: Dict[str, float] = defaultdict(float)
    revenue_rows = (
        db.query(func.date(Order.created_at), func.sum(Order.total))
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at).asc())
        .all()
    )
    for day, daily_total in revenue_rows:
        day_str = datetime.datetime.strptime(str(day)[:10], "%Y-%m-%d").strftime("%d/%m")
        revenue_map[day_str] += float(daily_total or 0)

    revenue_by_day = [
        DayRevenue(day=day, total=total) for day, total in revenue_map.items()
    ]

    product_map: Dict[str, int] = defaultdict(int)
    for order_ref, items_json in db.query(Order.order_ref, Order.items_json).all():
        try:
            items = json.loads(items_json or "[]")
        except (TypeError, ValueError):
            logger.warning("Skipping invalid item data for order %s.", order_ref)
            continue
        if not isinstance(items, list):
            logger.warning("Skipping invalid item data for order %s.", order_ref)
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
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
            customer_email=o.customer_email,
            items=o.items,
            subtotal=o.subtotal,
            delivery_fee=o.delivery_fee,
            total=o.total,
            status=o.status,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            payment_provider_ref=o.payment_provider_ref,
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


def get_admin_overview(db: Session) -> AdminOverview:
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0
    active_products = (
        db.query(func.count(Product.id))
        .filter(Product.is_active.is_(True))
        .scalar()
        or 0
    )
    total_contacts = db.query(func.count(ContactInquiry.id)).scalar() or 0
    unanswered_contacts = (
        db.query(func.count(ContactInquiry.id))
        .filter(ContactInquiry.replied.is_(False))
        .scalar()
        or 0
    )
    total_reviews = db.query(func.count(Review.id)).scalar() or 0
    pending_reviews = (
        db.query(func.count(Review.id))
        .filter(Review.approved.is_(False))
        .scalar()
        or 0
    )
    pending_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status == "pending")
        .scalar()
        or 0
    )
    paid_orders = (
        db.query(func.count(Order.id))
        .filter(Order.payment_status == "paid")
        .scalar()
        or 0
    )
    unpaid_orders = (
        db.query(func.count(Order.id))
        .filter(Order.payment_status != "paid")
        .scalar()
        or 0
    )
    total_revenue = db.query(func.coalesce(func.sum(Order.total), 0)).scalar() or 0
    paid_revenue = (
        db.query(func.coalesce(func.sum(Order.total), 0))
        .filter(Order.payment_status == "paid")
        .scalar()
        or 0
    )
    order_statuses = (
        db.query(Order.status, func.count(Order.id))
        .group_by(Order.status)
        .all()
    )
    return AdminOverview(
        total_products=total_products,
        active_products=active_products,
        total_orders=total_orders,
        pending_orders=pending_orders,
        paid_orders=paid_orders,
        unpaid_orders=unpaid_orders,
        total_revenue=float(total_revenue),
        paid_revenue=float(paid_revenue),
        total_contacts=total_contacts,
        unanswered_contacts=unanswered_contacts,
        total_reviews=total_reviews,
        pending_reviews=pending_reviews,
        orders_by_status=[
            StatusCount(status=status, count=count)
            for status, count in order_statuses
        ],
    )


def update_order_status(db: Session, order_ref: str, new_status: str) -> Optional[Order]:
    order = get_order_by_ref(db, order_ref)
    if not order:
        return None
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
