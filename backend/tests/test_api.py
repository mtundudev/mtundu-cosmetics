import os
import sys
from unittest.mock import patch

# Ensure project root is in path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.init_db import init_db
from backend.app.db.session import SessionLocal
from backend.app.core.config import settings
from backend.app.models.product import Product
from backend.app.models.review import Review

# Initialize database
init_db()

def run_all_tests():
    settings.ADMIN_PASSWORD = "test-admin-password"
    settings.SECRET_KEY = "test-secret-key-for-admin-sessions"
    settings.COOKIE_SECURE = False
    settings.PAYMENT_MODE = "test"
    settings.MEDIA_STORAGE = "local"
    settings.SMTP_HOST = ""
    settings.SMTP_USER = ""
    settings.SMTP_PASS = ""
    settings.ORDER_NOTIFICATION_EMAIL = "orders@example.com"

    with TestClient(app) as client:
        print("Testing root endpoint...")
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        data = res.json()
        assert data["status"] == "online"
        print("  Root: OK")

        print("Testing health check...")
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"
        print("  Health: OK")

        res = client.get("/api/v1/products")
        assert res.status_code == 200
        assert res.json() == []
        with SessionLocal() as db:
            db.add_all(
                [
                    Product(
                        slug="foundation-glow",
                        name="Foundation ya Glow",
                        category="Uso",
                        price="TZS 28,000",
                        price_value=28000,
                        description="Test foundation product.",
                        image="/products/foundation.jpg",
                    ),
                    Product(
                        slug="lipstick-matte-luxury",
                        name="Lipstick ya Matte",
                        category="Midomo",
                        price="TZS 15,000",
                        price_value=15000,
                        description="Test lipstick product.",
                        image="/products/lipstick.jpg",
                    ),
                    Product(
                        slug="luxury-perfume",
                        name="Perfume ya Kifahari ya Omega",
                        category="Manukato",
                        price="TZS 35,000",
                        price_value=35000,
                        description="Test perfume product.",
                        image="/products/perfume.jpg",
                    ),
                ]
            )
            db.commit()

        print("Testing products listing...")
        res = client.get("/api/v1/products")
        assert res.status_code == 200
        products = res.json()
        assert len(products) > 0
        assert all("discount_percent" in product for product in products)
        print(f"  Products: OK ({len(products)} products found)")
        with SessionLocal() as db:
            perfume = db.query(Product).filter(Product.slug == "luxury-perfume").first()
            review = db.query(Review).filter(Review.name == "Amina J.").first()
            assert perfume is not None and review is not None
            perfume.name = "Perfume ya Kifahari ya Mtundu"
            review.message = (
                "Bidhaa za Mtundu Cosmetics zimebadilisha kabisa jinsi ngozi yangu "
                "inavyoonekana. Huduma yao ni ya haraka na ya uaminifu mkubwa."
            )
            db.commit()
        init_db()
        assert client.get("/api/v1/products/luxury-perfume").json()["name"] == "Perfume ya Kifahari ya Omega"
        assert any(
            "Omega Cosmetics" in review["message"]
            for review in client.get("/api/v1/reviews").json()
        )
        print("  Brand data migration: OK")
        services = client.get("/api/v1/services")
        assert services.status_code == 200
        assert services.json()
        assert all(service["is_active"] for service in services.json())
        payment_config = client.get("/api/v1/orders/payment-config")
        assert payment_config.status_code == 200
        assert payment_config.json() == {"online_enabled": True, "test_mode": True}

        print("Testing product category filtering...")
        res = client.get("/api/v1/products?category=Uso")
        assert res.status_code == 200
        uso_products = res.json()
        assert len(uso_products) > 0
        print(f"  Category filter (Uso): OK ({len(uso_products)} items)")

        print("Testing contact inquiry...")
        contact_payload = {
            "name": "Maria Test",
            "email": "maria@example.com",
            "phone": "+255712345678",
            "message": "Habari, naulizia bei ya jumla ya bidhaa za ngozi."
        }
        with patch("backend.app.core.email.send_email", return_value=True) as send_email:
            res = client.post("/api/v1/contact", json=contact_payload)
        assert res.status_code == 200
        assert res.json()["ok"] is True
        send_email.assert_called_once()
        print("  Contact: OK")

        print("Testing reviews endpoint...")
        res = client.get("/api/v1/reviews")
        assert res.status_code == 200
        reviews = res.json()
        print(f"  Reviews: OK ({len(reviews)} approved reviews)")
        with patch("backend.app.core.email.send_email", return_value=True) as send_email:
            submitted_review = client.post(
                "/api/v1/reviews",
                json={"name": "Asha Test", "rating": 5, "message": "Huduma nzuri sana."},
            )
        assert submitted_review.status_code == 200
        send_email.assert_called_once()

        print("Testing customer order creation...")
        order_payload = {
            "name": "Fatma Said",
            "phone": "+255768999888",
            "address": "Mwanjerwa Sokoni, Mbeya",
            "email": "fatma@example.com",
            "items": [
                {
                    "slug": "foundation-glow",
                    "name": "Foundation ya Glow",
                    "priceValue": 1.0,
                    "quantity": 2
                },
                {
                    "slug": "lipstick-matte-luxury",
                    "name": "Lipstick ya Matte ya Kifahari",
                    "priceValue": 2.0,
                    "quantity": 1
                }
            ],
            "subtotal": 4.0,
            "deliveryFee": 0.0,
            "total": 4.0
        }
        with patch("backend.app.core.email.send_email", return_value=True) as send_email:
            res = client.post("/api/v1/orders", json=order_payload)
        assert res.status_code == 200
        res_data = res.json()
        assert res_data["ok"] is True
        order_ref = res_data["orderRef"]
        access_token = res_data["accessToken"]
        assert res_data["items"][0]["priceValue"] != 1
        expected_subtotal = sum(
            item["priceValue"] * item["quantity"] for item in res_data["items"]
        )
        expected_total = expected_subtotal + (0 if expected_subtotal >= 50000 else 5000)
        assert res_data["total"] == expected_total
        assert res_data["subtotal"] == expected_subtotal
        assert res_data["deliveryFee"] == expected_total - expected_subtotal
        send_email.assert_called_once()
        email_args = send_email.call_args
        assert email_args.kwargs["to_email"] == "orders@example.com"
        assert "<table" in email_args.args[2]
        assert "Bidhaa zilizoagizwa" in email_args.args[2]
        assert "fatma@example.com" in email_args.args[2]
        assert "Foundation ya Glow" in email_args.args[2]
        assert order_ref.startswith("MC-")
        print(f"  Order creation: OK (Ref: {order_ref})")

        print("Testing order retrieval by ref...")
        res = client.get(f"/api/v1/orders/{order_ref}")
        assert res.status_code == 200
        order_data = res.json()
        assert order_data["customer_name"] == "Fatma Said"
        assert order_data["total"] == expected_total
        print("  Order retrieval: OK")

        checkout = client.post(
            f"/api/v1/orders/{order_ref}/checkout",
            json={"access_token": access_token, "email": "fatma@example.com"},
        )
        assert checkout.status_code == 200
        assert checkout.json()["test_mode"] is True
        assert checkout.json()["payment_status"] == "pending"
        test_payment = client.post(
            f"/api/v1/orders/{order_ref}/test-payment",
            json={"access_token": access_token},
        )
        assert test_payment.status_code == 200
        assert test_payment.json()["payment_status"] == "paid"
        payment_status = client.get(
            f"/api/v1/orders/{order_ref}/payment-status",
            params={"access_token": access_token},
        )
        assert payment_status.status_code == 200
        assert payment_status.json()["payment_status"] == "paid"
        assert payment_status.json()["test_mode"] is True
        print("  Test payment flow: OK (simulated, no funds transferred)")

        print("Testing admin authentication...")
        res_unauthorized = client.get("/api/v1/orders/metrics")
        assert res_unauthorized.status_code == 401

        res_forged = client.get(
            "/api/v1/admin/me",
            cookies={settings.ADMIN_SESSION_COOKIE: "authenticated"}
        )
        assert res_forged.status_code == 200
        assert res_forged.json()["authenticated"] is False

        res_bad = client.post("/api/v1/admin/login", json={"password": "wrong"})
        assert res_bad.status_code == 401

        res_good = client.post(
            "/api/v1/admin/login",
            json={"password": "test-admin-password"}
        )
        assert res_good.status_code == 200
        assert res_good.json()["ok"] is True
        assert "token" not in res_good.json()
        assert client.get("/api/v1/admin/me").json()["authenticated"] is True

        review_rows = client.get("/api/v1/reviews?all_reviews=true").json()
        visible_review_id = next(review["id"] for review in review_rows if review["approved"])
        hidden_review = client.patch(
            f"/api/v1/reviews/{visible_review_id}/approve",
            json={"approved": False},
        )
        assert hidden_review.status_code == 200
        assert all(
            review["id"] != visible_review_id
            for review in client.get("/api/v1/reviews").json()
        )
        visible_review = client.patch(
            f"/api/v1/reviews/{visible_review_id}/approve",
            json={"approved": True},
        )
        assert visible_review.status_code == 200
        assert any(
            review["id"] == visible_review_id
            for review in client.get("/api/v1/reviews").json()
        )

        service_payload = {
            "title": "Huduma ya majaribio",
            "description": "Maelezo ya huduma ya majaribio.",
            "title_en": "Test service",
            "description_en": "A test service description.",
            "is_active": True,
        }
        client.post("/api/v1/admin/logout")
        forbidden_service = client.post("/api/v1/services", json=service_payload)
        assert forbidden_service.status_code == 401
        client.post("/api/v1/admin/login", json={"password": "test-admin-password"})
        created_service = client.post("/api/v1/services", json=service_payload)
        assert created_service.status_code == 201
        service_id = created_service.json()["id"]
        hidden_service = client.patch(
            f"/api/v1/services/{service_id}",
            json={"is_active": False},
        )
        assert hidden_service.status_code == 200
        assert all(service["id"] != service_id for service in client.get("/api/v1/services").json())
        admin_services = client.get("/api/v1/services?include_inactive=true")
        assert admin_services.status_code == 200
        assert any(
            service["id"] == service_id and not service["is_active"]
            for service in admin_services.json()
        )
        visible_service = client.patch(
            f"/api/v1/services/{service_id}",
            json={"is_active": True},
        )
        assert visible_service.status_code == 200
        assert visible_service.json()["title_en"] == "Test service"

        profile = client.get("/api/v1/admin/profile")
        assert profile.status_code == 200
        updated_profile = client.put(
            "/api/v1/admin/profile",
            json={"display_name": "  A  ", "avatar_path": None},
        )
        assert updated_profile.status_code == 422
        updated_profile = client.put(
            "/api/v1/admin/profile",
            json={"display_name": "  Admin Test  ", "avatar_path": None},
        )
        assert updated_profile.status_code == 200
        assert updated_profile.json()["display_name"] == "Admin Test"
        image_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
        upload = client.post(
            "/api/v1/admin/media/profile",
            files={"file": ("profile.png", image_bytes, "image/png")},
        )
        assert upload.status_code == 200
        assert upload.json()["path"].startswith("/uploads/profiles/")
        with (
            patch.object(settings, "MEDIA_STORAGE", "supabase"),
            patch.object(settings, "SUPABASE_URL", "https://project.supabase.co"),
            patch.object(settings, "SUPABASE_SERVICE_ROLE_KEY", "fake-service-role-key"),
            patch.object(settings, "SUPABASE_STORAGE_BUCKET", "omega-media"),
            patch("backend.app.api.endpoints.media.requests.post") as storage_upload,
        ):
            storage_upload.return_value.raise_for_status.return_value = None
            remote_upload = client.post(
                "/api/v1/admin/media/profile",
                files={"file": ("profile.png", image_bytes, "image/png")},
            )
        assert remote_upload.status_code == 200
        remote_path = remote_upload.json()["path"]
        assert remote_path.startswith(
            "https://project.supabase.co/storage/v1/object/public/omega-media/profiles/"
        )
        upload_call = storage_upload.call_args
        assert upload_call.kwargs["headers"]["Authorization"] == "Bearer fake-service-role-key"
        print("  Admin profile and image upload: OK")
        print("  Admin login: OK")

        product_payload = {
            "slug": "admin-test-product",
            "name": "Bidhaa ya majaribio",
            "category": "Ngozi",
            "price": "TZS 10,000",
            "price_value": 10000,
            "description": "Bidhaa ya kujaribu usimamizi wa admin.",
            "image": "/products/test.jpg",
        }
        client.post("/api/v1/admin/logout")
        res_forbidden = client.post("/api/v1/products", json=product_payload)
        assert res_forbidden.status_code == 401
        res_public_inactive = client.get("/api/v1/products?include_inactive=true")
        assert res_public_inactive.status_code == 401
        client.post(
            "/api/v1/admin/login",
            json={"password": "test-admin-password"}
        )
        res_created = client.post("/api/v1/products", json=product_payload)
        assert res_created.status_code == 201
        created_slug = res_created.json()["slug"]
        assert created_slug == "bidhaa-ya-majaribio"
        res_duplicate = client.post("/api/v1/products", json=product_payload)
        assert res_duplicate.status_code == 201
        assert res_duplicate.json()["slug"] == "bidhaa-ya-majaribio-2"
        res_updated = client.put(
            f"/api/v1/products/{created_slug}",
            json={"name": "Bidhaa iliyorekebishwa"}
        )
        assert res_updated.status_code == 200
        assert res_updated.json()["name"] == "Bidhaa iliyorekebishwa"
        updated_slug = res_updated.json()["slug"]
        assert updated_slug == "bidhaa-iliyorekebishwa"
        res_discounted = client.put(
            f"/api/v1/products/{updated_slug}",
            json={"discount_percent": 25},
        )
        assert res_discounted.status_code == 200
        assert res_discounted.json()["discount_percent"] == 25
        discount_order_payload = {
            "name": "Neema Test",
            "phone": "+255712345678",
            "address": "Mbeya mjini, Tanzania",
            "items": [
                {
                    "slug": updated_slug,
                    "name": "Bidhaa iliyorekebishwa",
                    "priceValue": 10000,
                    "quantity": 1,
                }
            ],
            "subtotal": 10000,
            "deliveryFee": 0,
            "total": 10000,
        }
        with patch("backend.app.core.email.send_email", return_value=True):
            discounted_order = client.post("/api/v1/orders", json=discount_order_payload)
        assert discounted_order.status_code == 200
        discounted_item = discounted_order.json()["items"][0]
        assert discounted_item["priceValue"] == 7500
        assert discounted_item["originalPriceValue"] == 10000
        assert discounted_item["discountPercent"] == 25
        assert discounted_order.json()["subtotal"] == 7500
        res_deactivated = client.put(
            f"/api/v1/products/{updated_slug}",
            json={"is_active": False}
        )
        assert res_deactivated.status_code == 200
        assert client.get(f"/api/v1/products/{updated_slug}").status_code == 404
        assert client.get(
            "/api/v1/products?include_inactive=true"
        ).status_code == 200
        res_deleted = client.delete(f"/api/v1/products/{updated_slug}")
        assert res_deleted.status_code == 204
        assert client.delete(f"/api/v1/products/{updated_slug}").status_code == 404
        assert client.delete("/api/v1/products/bidhaa-ya-majaribio-2").status_code == 204
        print("  Admin product create, edit, hide, delete: OK")

        print("Testing admin sales metrics...")
        res_metrics = client.get("/api/v1/orders/metrics")
        assert res_metrics.status_code == 200
        metrics = res_metrics.json()
        assert metrics["total_orders"] >= 1
        assert metrics["total_revenue"] >= 71000.0
        assert metrics["revenue_by_day"]
        assert metrics["top_products"]
        print(f"  Sales metrics: OK (Total Orders: {metrics['total_orders']}, Total Revenue: TZS {metrics['total_revenue']:,.0f})")

        print("\n" + "=" * 50)
        print("ALL FASTAPI BACKEND TESTS PASSED SUCCESSFULLY! (100% OK)")
        print("=" * 50)


if __name__ == "__main__":
    run_all_tests()
