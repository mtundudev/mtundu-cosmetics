import hashlib
import hmac
import secrets
from typing import List, Dict, Any
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.core.security import require_admin
from backend.app.schemas.order import (
    CheckoutRequest,
    OrderCreate,
    OrderOut,
    OrderStatusUpdate,
    PaymentStatusOut,
    SalesMetrics,
    TestPaymentRequest,
)
from backend.app.services.order_service import (
    create_order as service_create_order,
    get_order_by_ref as service_get_order_by_ref,
    get_all_orders as service_get_all_orders,
    get_sales_metrics as service_get_sales_metrics,
    send_order_notification as service_send_order_notification,
    update_order_status as service_update_order_status,
)
from backend.app.services.selcom_service import (
    SelcomError,
    create_checkout as create_selcom_checkout,
    get_order_status as get_selcom_order_status,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", status_code=status.HTTP_200_OK)
def place_order(
    order_in: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Submit a customer order.
    Saves order in database, generates reference 'MC-YYYYMMDD-XXXX',
    and attempts to send email notification to the store owner.
    """
    try:
        db_order, order_ref, access_token = service_create_order(db=db, order_in=order_in)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    background_tasks.add_task(
        service_send_order_notification,
        order_ref=order_ref,
        name=db_order.customer_name,
        phone=db_order.customer_phone,
        address=db_order.customer_address,
        customer_email=db_order.customer_email,
        items=db_order.items,
        subtotal=db_order.subtotal,
        delivery_fee=db_order.delivery_fee,
        total=db_order.total,
    )
    return {
        "ok": True,
        "orderRef": order_ref,
        "accessToken": access_token,
        "total": db_order.total,
        "subtotal": db_order.subtotal,
        "deliveryFee": db_order.delivery_fee,
        "items": db_order.items,
        "message": "Order imepokelewa kikamilifu."
    }


@router.get("/payment-config")
def payment_config():
    return {
        "online_enabled": settings.PAYMENT_MODE in {"test", "selcom"},
        "test_mode": settings.PAYMENT_MODE == "test",
    }


def _get_order_for_customer(db: Session, order_ref: str, access_token: str):
    order = service_get_order_by_ref(db=db, order_ref=order_ref)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order haikupatikana.")
    token_hash = hashlib.sha256(access_token.encode("utf-8")).hexdigest()
    if not order.payment_access_token_hash or not hmac.compare_digest(
        token_hash,
        order.payment_access_token_hash,
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token ya oda si sahihi.")
    return order


@router.post("/{order_ref}/checkout")
def start_checkout(
    order_ref: str,
    checkout_in: CheckoutRequest,
    db: Session = Depends(get_db),
):
    order = _get_order_for_customer(db, order_ref, checkout_in.access_token)
    if order.payment_status == "paid":
        return {"order_ref": order.order_ref, "payment_status": "paid", "already_paid": True}
    if settings.PAYMENT_MODE == "manual":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Malipo ya mtandaoni hayajawashwa. Tafadhali tumia maelekezo ya ankara.",
        )

    order.customer_email = str(checkout_in.email)
    if settings.PAYMENT_MODE == "test":
        order.payment_method = "selcom_test"
        order.payment_status = "pending"
        db.commit()
        return {
            "order_ref": order.order_ref,
            "payment_status": "pending",
            "test_mode": True,
        }

    if order.payment_gateway_url and order.payment_status == "pending":
        return {
            "order_ref": order.order_ref,
            "payment_status": "pending",
            "checkout_url": order.payment_gateway_url,
            "test_mode": False,
        }
    try:
        checkout_url, provider_reference = create_selcom_checkout(
            order=order,
            email=str(checkout_in.email),
        )
    except SelcomError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Imeshindikana kuanzisha malipo ya Selcom. Jaribu tena baadaye.",
        ) from exc
    order.payment_method = "selcom"
    order.payment_status = "pending"
    order.payment_gateway_order_id = order.order_ref
    order.payment_gateway_url = checkout_url
    order.payment_provider_ref = provider_reference
    db.commit()
    return {
        "order_ref": order.order_ref,
        "payment_status": "pending",
        "checkout_url": checkout_url,
        "test_mode": False,
    }


@router.post("/{order_ref}/test-payment")
def complete_test_payment(
    order_ref: str,
    payment_in: TestPaymentRequest,
    db: Session = Depends(get_db),
):
    if settings.PAYMENT_MODE != "test" or settings.APP_ENV == "production":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test payments are disabled.",
        )
    order = _get_order_for_customer(db, order_ref, payment_in.access_token)
    if order.payment_method != "selcom_test" or order.payment_status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Oda hii haina malipo ya majaribio yanayosubiri.",
        )
    order.payment_status = "paid"
    order.payment_provider_ref = f"TEST-{secrets.token_hex(4).upper()}"
    db.commit()
    return {
        "order_ref": order.order_ref,
        "payment_status": order.payment_status,
        "test_mode": True,
    }


@router.get("/{order_ref}/payment-status", response_model=PaymentStatusOut)
def get_payment_status(
    order_ref: str,
    access_token: str,
    db: Session = Depends(get_db),
):
    order = _get_order_for_customer(db, order_ref, access_token)
    if (
        settings.PAYMENT_MODE == "selcom"
        and order.payment_method == "selcom"
        and order.payment_status != "paid"
        and order.payment_gateway_order_id
    ):
        try:
            provider_status = get_selcom_order_status(order.payment_gateway_order_id)
        except SelcomError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Imeshindikana kuthibitisha hali ya malipo kwa Selcom.",
            ) from exc
        if provider_status.get("order_id") != order.order_ref:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Selcom ilirejesha taarifa ya oda isiyolingana.",
            )
        try:
            provider_amount = round(float(provider_status.get("amount")))
        except (TypeError, ValueError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Selcom ilirejesha kiasi cha malipo kisicho sahihi.",
            ) from exc
        if provider_amount != round(order.total):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Kiasi cha malipo kilichothibitishwa hakilingani na oda.",
            )
        status_map = {
            "COMPLETED": "paid",
            "CANCELLED": "cancelled",
            "USERCANCELLED": "cancelled",
            "REJECTED": "failed",
        }
        provider_payment_status = provider_status.get("payment_status")
        mapped_status = status_map.get(provider_payment_status)
        if mapped_status:
            order.payment_status = mapped_status
            order.payment_provider_ref = (
                provider_status.get("transid")
                or provider_status.get("reference")
                or order.payment_provider_ref
            )
            db.commit()
            db.refresh(order)
    return PaymentStatusOut(
        order_ref=order.order_ref,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        payment_provider_ref=order.payment_provider_ref,
        test_mode=order.payment_method == "selcom_test",
    )


@router.get("/metrics", response_model=SalesMetrics)
def get_order_sales_metrics(
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin dashboard sales analytics and revenue aggregations."""
    return service_get_sales_metrics(db=db)


@router.patch("/{order_ref}/status", response_model=OrderOut)
def update_order(
    order_ref: str,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    order = service_update_order_status(db, order_ref, payload.status)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order haikupatikana.")
    return OrderOut.model_validate(order)


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
        customer_email=order.customer_email,
        items=order.items,
        subtotal=order.subtotal,
        delivery_fee=order.delivery_fee,
        total=order.total,
        status=order.status,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        payment_provider_ref=order.payment_provider_ref,
        created_at=order.created_at
    )
