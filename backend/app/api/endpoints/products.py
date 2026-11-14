from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import require_admin
from backend.app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from backend.app.services.product_service import (
    get_products as service_get_products,
    get_product_by_slug as service_get_product_by_slug,
    create_product as service_create_product,
    update_product as service_update_product
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = Query(None, description="Filter products by category (Uso, Midomo, Ngozi, Nywele, etc.)"),
    search: Optional[str] = Query(None, description="Search products by title or description"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all available products with optional category and keyword search filters."""
    return service_get_products(db=db, category=category, search=search, skip=skip, limit=limit)


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Fetch single product details by slug."""
    product = service_get_product_by_slug(db=db, slug=slug)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bidhaa haikupatikana."
        )
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def add_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin endpoint to add a new cosmetic product."""
    existing = service_get_product_by_slug(db=db, slug=product_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bidhaa yenye slug hii tayari ipo."
        )
    return service_create_product(db=db, product_in=product_in)


@router.put("/{slug}", response_model=ProductOut)
def modify_product(
    slug: str,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin endpoint to update product details."""
    updated = service_update_product(db=db, slug=slug, product_in=product_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bidhaa haikupatikana."
        )
    return updated
