from sqlalchemy.orm import Session
from backend.app.db.base import Base
from backend.app.db.session import engine, SessionLocal
from backend.app.models.product import Product
from backend.app.models.review import Review
from backend.app.models.admin_profile import AdminProfile
from backend.app.models.service import StoreService
from sqlalchemy import inspect, text

INITIAL_REVIEWS = [
    {
        "name": "Amina J.",
        "rating": 5,
        "message": "Bidhaa za Omega Cosmetics zimebadilisha kabisa jinsi ngozi yangu inavyoonekana. Huduma yao ni ya haraka na ya uaminifu mkubwa.",
        "approved": True
    },
    {
        "name": "Zainab R.",
        "rating": 5,
        "message": "Naagiza bidhaa za saluni yangu kutoka Omega Cosmetics kila mwezi. Ubora wa bidhaa haujawahi kunikatisha tamaa hata mara moja.",
        "approved": True
    },
    {
        "name": "Grace M.",
        "rating": 5,
        "message": "Walinisaidia kuchagua rangi sahihi ya foundation mara ya kwanza. Sasa siwezi kununua bidhaa za vipodozi mahali pengine popote.",
        "approved": True
    }
]

INITIAL_SERVICES = [
    {
        "title": "Ushauri wa Urembo",
        "description": "Tunakusaidia kuchagua bidhaa zinazoendana na aina ya ngozi yako, rangi na mahitaji yako binafsi.",
        "title_en": "Beauty Consultation",
        "description_en": "We help you choose products that suit your skin type, complexion and personal needs.",
    },
    {
        "title": "Mapambo kwa Matukio",
        "description": "Huduma ya mapambo ya uso kwa harusi, sherehe na vipindi vya picha na wataalamu wetu wa vipodozi.",
        "title_en": "Event Makeup",
        "description_en": "Professional makeup for weddings, celebrations and photo sessions.",
    },
    {
        "title": "Uwekaji Rangi ya Ngozi (Skin Matching)",
        "description": "Tunalinganisha rangi sahihi ya foundation na concealer kabla ya kununua ili kuepuka makosa.",
        "title_en": "Skin Matching",
        "description_en": "We match the right foundation and concealer shades before you buy.",
    },
    {
        "title": "Uwasilishaji wa Haraka",
        "description": "Agiza mtandaoni na tutakufikishia bidhaa zako popote ulipo Tanzania.",
        "title_en": "Fast Delivery",
        "description_en": "Order online and have your products delivered across Tanzania.",
    },
]


def init_db(db: Session = None) -> None:
    """Create tables and seed only default reviews and services."""
    Base.metadata.create_all(bind=engine)
    product_columns = {column["name"] for column in inspect(engine).get_columns("products")}
    if "discount_percent" not in product_columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE products ADD COLUMN discount_percent INTEGER NOT NULL DEFAULT 0")
            )
    order_columns = {column["name"] for column in inspect(engine).get_columns("orders")}
    order_migrations = {
        "customer_email": "VARCHAR(254)",
        "payment_status": "VARCHAR(30) NOT NULL DEFAULT 'unpaid'",
        "payment_method": "VARCHAR(30) NOT NULL DEFAULT 'manual'",
        "payment_gateway_order_id": "VARCHAR(100)",
        "payment_gateway_url": "VARCHAR(1000)",
        "payment_provider_ref": "VARCHAR(100)",
        "payment_access_token_hash": "VARCHAR(64)",
    }
    with engine.begin() as connection:
        for column_name, column_definition in order_migrations.items():
            if column_name not in order_columns:
                connection.execute(
                    text(f"ALTER TABLE orders ADD COLUMN {column_name} {column_definition}")
                )

    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        db.query(Product).filter(
            Product.slug == "luxury-perfume",
            Product.name == "Perfume ya Kifahari ya Mtundu",
        ).update(
            {Product.name: "Perfume ya Kifahari ya Omega"},
            synchronize_session=False,
        )
        legacy_reviews = {
            "Bidhaa za Mtundu Cosmetics zimebadilisha kabisa jinsi ngozi yangu inavyoonekana. Huduma yao ni ya haraka na ya uaminifu mkubwa.":
                "Bidhaa za Omega Cosmetics zimebadilisha kabisa jinsi ngozi yangu inavyoonekana. Huduma yao ni ya haraka na ya uaminifu mkubwa.",
            "Naagiza bidhaa za saluni yangu kutoka Mtundu Cosmetics kila mwezi. Ubora wa bidhaa haujawahi kunikatisha tamaa hata mara moja.":
                "Naagiza bidhaa za saluni yangu kutoka Omega Cosmetics kila mwezi. Ubora wa bidhaa haujawahi kunikatisha tamaa hata mara moja.",
        }
        for old_message, new_message in legacy_reviews.items():
            db.query(Review).filter(Review.message == old_message).update(
                {Review.message: new_message},
                synchronize_session=False,
            )
        db.commit()

        # Seed initial reviews if empty
        if db.query(Review).count() == 0:
            for r in INITIAL_REVIEWS:
                review = Review(**r)
                db.add(review)
            db.commit()

        if db.query(StoreService).count() == 0:
            for service in INITIAL_SERVICES:
                db.add(StoreService(**service))
            db.commit()
    finally:
        if close_session:
            db.close()
