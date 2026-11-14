from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import require_admin
from backend.app.schemas.order import OrderCreate, OrderOut, SalesMetrics
from backend.app.services.order_service import (
    create_order as service_create_order,
    get_order_by_ref as service_get_order_by_ref,
    get_all_orders as service_get_all_orders,
    get_sales_metrics as service_get_sales_metrics
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", status_code=status.HTTP_200_OK)
def place_order(order_in: OrderCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Submit a customer order.
    Saves order in database, generates reference 'MC-YYYYMMDD-XXXX',
    and attempts to send email notification to the store owner.
    """
    try:
        db_order, order_ref = service_create_order(db=db, order_in=order_in)
        return {
            "ok": True,
            "orderRef": order_ref,
            "message": "Order imepokelewa kikamilifu."
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hitilafu wakati wa kutunza order: {str(exc)}"
        )


@router.get("/metrics", response_model=SalesMetrics)
def get_order_sales_metrics(
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin dashboard sales analytics and revenue aggregations."""
    return service_get_sales_metrics(db=db)


@router.get("", response_model=List[OrderOut])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin endpoint to retrieve paginated list of all customer orders."""
    orders = service_get_all_orders(db=db, skip=skip, limit=limit)
    return [
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
        ) for o in orders
    ]


@router.get("/{order_ref}", response_model=OrderOut)
def get_order_details(order_ref: str, db: Session = Depends(get_db)):
    """Look up an order by its reference code (e.g., MC-20261114-1234)."""
    order = service_get_order_by_ref(db=db, order_ref=order_ref)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order haikupatikana."
        )
    return OrderOut(
        id=order.id,
        order_ref=order.order_ref,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        items=order.items,
        subtotal=order.subtotal,
        delivery_fee=order.delivery_fee,
        total=order.total,
        status=order.status,
        created_at=order.created_at
    )
