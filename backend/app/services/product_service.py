from typing import List, Optional
import re
import unicodedata
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.models.product import Product
from backend.app.schemas.product import ProductCreate, ProductUpdate


def get_products(
    db: Session,
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
) -> List[Product]:
    query = db.query(Product)
    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))

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


def get_product_by_slug(
    db: Session,
    slug: str,
    include_inactive: bool = False,
) -> Optional[Product]:
    query = db.query(Product).filter(Product.slug == slug)
    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    return query.first()


def slug_from_name(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_name).strip("-")
    return slug or "product"


def unique_product_slug(db: Session, name: str, exclude_id: int | None = None) -> str:
    base_slug = slug_from_name(name)
    candidate = base_slug
    suffix = 2
    while True:
        query = db.query(Product.id).filter(Product.slug == candidate)
        if exclude_id is not None:
            query = query.filter(Product.id != exclude_id)
        if query.first() is None:
            return candidate
        candidate = f"{base_slug}-{suffix}"
        suffix += 1


def create_product(db: Session, product_in: ProductCreate) -> Product:
    product_data = product_in.model_dump(exclude={"slug"})
    product_data["slug"] = unique_product_slug(db, product_in.name)
    db_product = Product(**product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, slug: str, product_in: ProductUpdate) -> Optional[Product]:
    db_product = db.query(Product).filter(Product.slug == slug).first()
    if not db_product:
        return None
    updates = product_in.model_dump(exclude_unset=True)
    new_name = updates.get("name")
    if new_name and new_name.strip() != db_product.name:
        db_product.slug = unique_product_slug(db, new_name, exclude_id=db_product.id)
    for field, value in updates.items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, slug: str) -> bool:
    db_product = db.query(Product).filter(Product.slug == slug).first()
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True
