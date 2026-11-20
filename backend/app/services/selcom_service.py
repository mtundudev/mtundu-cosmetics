import base64
import hashlib
import hmac
from datetime import datetime
from typing import Any
from urllib.parse import urlparse

import requests

from backend.app.core.config import settings
from backend.app.models.order import Order


class SelcomError(RuntimeError):
    pass


def _request_headers(fields: dict[str, Any]) -> dict[str, str]:
    if not settings.SELCOM_API_KEY or not settings.SELCOM_API_SECRET:
        raise SelcomError("Selcom API credentials are not configured.")

    timestamp = datetime.now().astimezone().isoformat(timespec="seconds")
    signed_fields = ",".join(fields)
    signing_string = "timestamp=" + timestamp + "".join(
        f"&{key}={value}" for key, value in fields.items()
    )
    digest = base64.b64encode(
        hmac.new(
            settings.SELCOM_API_SECRET.encode("utf-8"),
            signing_string.encode("utf-8"),
            hashlib.sha256,
        ).digest()
    ).decode("ascii")
    api_key = base64.b64encode(settings.SELCOM_API_KEY.encode("utf-8")).decode("ascii")
    return {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"SELCOM {api_key}",
        "Digest-Method": "HS256",
        "Digest": digest,
        "Timestamp": timestamp,
        "Signed-Fields": signed_fields,
    }


def _check_success(payload: Any) -> dict[str, Any]:
    if (
        not isinstance(payload, dict)
        or payload.get("result") != "SUCCESS"
        or str(payload.get("resultcode")) != "000"
    ):
        raise SelcomError("Selcom rejected the payment request.")
    return payload


def create_checkout(order: Order, email: str) -> tuple[str, str]:
    if not settings.SELCOM_BASE_URL or not settings.SELCOM_VENDOR_ID:
        raise SelcomError("Selcom merchant settings are not configured.")

    names = order.customer_name.split(maxsplit=1)
    first_name = names[0]
    last_name = names[1] if len(names) > 1 else names[0]
    phone = "".join(character for character in order.customer_phone if character.isdigit())
    if phone.startswith("0"):
        phone = "255" + phone[1:]
    elif not phone.startswith("255"):
        phone = "255" + phone

    frontend = settings.FRONTEND_PUBLIC_URL.rstrip("/")
    fields = {
        "vendor": settings.SELCOM_VENDOR_ID,
        "order_id": order.order_ref,
        "buyer_email": email,
        "buyer_name": order.customer_name,
        "buyer_userid": "",
        "buyer_phone": phone,
        "gateway_buyer_uuid": "",
        "amount": int(round(order.total)),
        "currency": "TZS",
        "payment_methods": "ALL",
        "redirect_url": base64.b64encode(
            f"{frontend}/kikapu?order={order.order_ref}".encode("utf-8")
        ).decode("ascii"),
        "cancel_url": base64.b64encode(
            f"{frontend}/kikapu?order={order.order_ref}&payment=cancelled".encode("utf-8")
        ).decode("ascii"),
        "billing.firstname": first_name,
        "billing.lastname": last_name,
        "billing.address_1": order.customer_address,
        "billing.address_2": "",
        "billing.city": "Mbeya",
        "billing.state_or_region": "Mbeya",
        "billing.postcode_or_pobox": "00000",
        "billing.country": "TZ",
        "billing.phone": phone,
        "shipping.firstname": first_name,
        "shipping.lastname": last_name,
        "shipping.address_1": order.customer_address,
        "shipping.address_2": "",
        "shipping.city": "Mbeya",
        "shipping.state_or_region": "Mbeya",
        "shipping.postcode_or_pobox": "00000",
        "shipping.country": "TZ",
        "shipping.phone": phone,
        "buyer_remarks": order.order_ref,
        "merchant_remarks": "Omega Cosmetics order",
        "no_of_items": sum(item.get("quantity", 0) for item in order.items),
    }

    try:
        response = requests.post(
            f"{settings.SELCOM_BASE_URL.rstrip('/')}/v1/checkout/create-order",
            json=fields,
            headers=_request_headers(fields),
            timeout=15,
        )
        response.raise_for_status()
        payload = _check_success(response.json())
    except requests.RequestException as exc:
        raise SelcomError("Could not reach Selcom checkout.") from exc
    except ValueError as exc:
        raise SelcomError("Selcom returned an invalid response.") from exc

    data = payload.get("data")
    if not isinstance(data, list) or not data or not isinstance(data[0], dict):
        raise SelcomError("Selcom response did not include a checkout link.")
    encoded_url = data[0].get("payment_gateway_url")
    reference = payload.get("reference")
    if not isinstance(encoded_url, str) or not isinstance(reference, str):
        raise SelcomError("Selcom response did not include payment details.")
    try:
        checkout_url = base64.b64decode(encoded_url, validate=True).decode("utf-8")
    except (ValueError, UnicodeDecodeError) as exc:
        raise SelcomError("Selcom returned an invalid checkout link.") from exc
    parsed_url = urlparse(checkout_url)
    if parsed_url.scheme != "https" or not parsed_url.netloc:
        raise SelcomError("Selcom returned a non-secure checkout link.")
    return checkout_url, reference


def get_order_status(order_id: str) -> dict[str, Any]:
    if not settings.SELCOM_BASE_URL:
        raise SelcomError("Selcom merchant settings are not configured.")
    fields = {"order_id": order_id}
    try:
        response = requests.get(
            f"{settings.SELCOM_BASE_URL.rstrip('/')}/v1/checkout/order-status",
            params=fields,
            headers=_request_headers(fields),
            timeout=10,
        )
        response.raise_for_status()
        payload = _check_success(response.json())
    except requests.RequestException as exc:
        raise SelcomError("Could not check the Selcom payment status.") from exc
    except ValueError as exc:
        raise SelcomError("Selcom returned an invalid status response.") from exc

    data = payload.get("data")
    if not isinstance(data, list) or not data or not isinstance(data[0], dict):
        raise SelcomError("Selcom response did not include order status.")
    return data[0]
