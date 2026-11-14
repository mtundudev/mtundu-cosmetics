"""Business logic and services."""
from backend.app.services.order_service import create_order, get_order_by_ref, get_all_orders, get_sales_metrics
from backend.app.services.review_service import create_review, get_approved_reviews, get_all_reviews, update_review_approval
from backend.app.services.contact_service import create_contact_inquiry, get_all_inquiries
from backend.app.services.product_service import get_products, get_product_by_slug

__all__ = [
    "create_order",
    "get_order_by_ref",
    "get_all_orders",
    "get_sales_metrics",
    "create_review",
    "get_approved_reviews",
    "get_all_reviews",
    "update_review_approval",
    "create_contact_inquiry",
    "get_all_inquiries",
    "get_products",
    "get_product_by_slug"
]
