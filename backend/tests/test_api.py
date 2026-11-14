import os
import sys

# Ensure project root is in path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Mtundu Cosmetics" in data["brand"]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_products():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert len(products) > 0
    # Verify product properties
    first = products[0]
    assert "slug" in first
    assert "name" in first
    assert "price" in first
    assert "image" in first


def test_filter_products():
    response = client.get("/api/v1/products?category=Uso")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    for p in products:
        assert "Uso" in p["category"]


def test_contact_submission():
    payload = {
        "name": "Maria Test",
        "email": "maria@example.com",
        "phone": "+255712345678",
        "message": "Habari, naulizia bei ya jumla ya sabuni na lotion."
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_reviews_flow():
    # Public list of approved reviews
    res_list = client.get("/api/v1/reviews")
    assert res_list.status_code == 200
    reviews = res_list.json()
    assert isinstance(reviews, list)

    # Post new review
    new_rev = {
        "name": "Hassan M.",
        "rating": 5,
        "message": "Nimepata huduma nzuri sana na bidhaa ni asilia kabisa."
    }
    res_post = client.post("/api/v1/reviews", json=new_rev)
    assert res_post.status_code == 200
    assert res_post.json()["ok"] is True


def test_order_creation_and_retrieval():
    order_data = {
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
    response = client.post("/api/v1/orders", json=order_data)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["ok"] is True
    assert "orderRef" in res_json
    order_ref = res_json["orderRef"]
    assert order_ref.startswith("MC-")

    # Fetch order by ref
    get_res = client.get(f"/api/v1/orders/{order_ref}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["customer_name"] == "Fatma Said"
    assert fetched["total"] == 71000.0
    assert len(fetched["items"]) == 2


def test_admin_auth_and_metrics():
    # Login with wrong password
    bad_login = client.post("/api/v1/admin/login", json={"password": "wrongpassword"})
    assert bad_login.status_code == 401

    # Login with correct password
    login_res = client.post("/api/v1/admin/login", json={"password": "admin123"})
    assert login_res.status_code == 200
    assert login_res.json()["ok"] is True

    # Retrieve sales metrics using the session cookie set by login
    metrics_res = client.get("/api/v1/orders/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert "total_orders" in metrics
    assert "total_revenue" in metrics
    assert metrics["total_orders"] >= 1


if __name__ == "__main__":
    print("Running automated backend tests...")
    test_root()
    test_health()
    test_list_products()
    test_filter_products()
    test_contact_submission()
    test_reviews_flow()
    test_order_creation_and_retrieval()
    test_admin_auth_and_metrics()
    print("ALL TESTS PASSED SUCCESSFULLY! (100% OK)")
