import os
import sys

# Ensure project root is in path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.init_db import init_db

# Initialize database
init_db()

def run_all_tests():
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

        print("Testing products listing...")
        res = client.get("/api/v1/products")
        assert res.status_code == 200
        products = res.json()
        assert len(products) > 0
        print(f"  Products: OK ({len(products)} products found)")

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
        res = client.post("/api/v1/contact", json=contact_payload)
        assert res.status_code == 200
        assert res.json()["ok"] is True
        print("  Contact: OK")

        print("Testing reviews endpoint...")
        res = client.get("/api/v1/reviews")
        assert res.status_code == 200
        reviews = res.json()
        print(f"  Reviews: OK ({len(reviews)} approved reviews)")

        print("Testing customer order creation...")
        order_payload = {
            "name": "Fatma Said",
            "phone": "+255768999888",
            "address": "Mwanjerwa Sokoni, Mbeya",
            "items": [
                {
                    "slug": "foundation-glow",
                    "name": "Foundation ya Glow",
                    "priceValue": 28000.0,
                    "quantity": 2
                },
                {
                    "slug": "lipstick-matte-luxury",
                    "name": "Lipstick ya Matte ya Kifahari",
                    "priceValue": 15000.0,
                    "quantity": 1
                }
            ],
            "subtotal": 71000.0,
            "deliveryFee": 0.0,
            "total": 71000.0
        }
        res = client.post("/api/v1/orders", json=order_payload)
        assert res.status_code == 200
        res_data = res.json()
        assert res_data["ok"] is True
        order_ref = res_data["orderRef"]
        assert order_ref.startswith("MC-")
        print(f"  Order creation: OK (Ref: {order_ref})")

        print("Testing order retrieval by ref...")
        res = client.get(f"/api/v1/orders/{order_ref}")
        assert res.status_code == 200
        order_data = res.json()
        assert order_data["customer_name"] == "Fatma Said"
        assert order_data["total"] == 71000.0
        print("  Order retrieval: OK")

        print("Testing admin authentication...")
        res_bad = client.post("/api/v1/admin/login", json={"password": "wrong"})
        assert res_bad.status_code == 401

        res_good = client.post("/api/v1/admin/login", json={"password": "admin123"})
        assert res_good.status_code == 200
        assert res_good.json()["ok"] is True
        print("  Admin login: OK")

        print("Testing admin sales metrics...")
        res_metrics = client.get("/api/v1/orders/metrics")
        assert res_metrics.status_code == 200
        metrics = res_metrics.json()
        assert metrics["total_orders"] >= 1
        assert metrics["total_revenue"] >= 71000.0
        print(f"  Sales metrics: OK (Total Orders: {metrics['total_orders']}, Total Revenue: TZS {metrics['total_revenue']:,.0f})")

        print("\n" + "=" * 50)
        print("ALL FASTAPI BACKEND TESTS PASSED SUCCESSFULLY! (100% OK)")
        print("=" * 50)


if __name__ == "__main__":
    run_all_tests()
