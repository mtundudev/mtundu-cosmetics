from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.models.product import Product
from backend.app.schemas.product import ProductCreate, ProductUpdate


def get_products(db: Session, category: Optional[str] = None, search: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Product]:
    query = db.query(Product).filter(Product.is_active == True)

    if category:
        query = query.filter(Product.category.ilike(f"%{category.strip()}%"))

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_filter),
                Product.description.ilike(search_filter),
                Product.category.ilike(search_filter)
            )
        )

    return query.offset(skip).limit(limit).all()


def get_product_by_slug(db: Session, slug: str) -> Optional[Product]:
    return db.query(Product).filter(Product.slug == slug, Product.is_active == True).first()


def create_product(db: Session, product_in: ProductCreate) -> Product:
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, slug: str, product_in: ProductUpdate) -> Optional[Product]:
    db_product = db.query(Product).filter(Product.slug == slug).first()
    if not db_product:
        return None
    for field, value in product_in.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product
