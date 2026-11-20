from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import is_authenticated_admin, require_admin
from backend.app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from backend.app.services.product_service import (
    get_products as service_get_products,
    get_product_by_slug as service_get_product_by_slug,
    create_product as service_create_product,
    update_product as service_update_product,
    delete_product as service_delete_product,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductOut])
def list_products(
    request: Request,
    category: Optional[str] = Query(None, description="Filter products by category (Uso, Midomo, Ngozi, Nywele, etc.)"),
    search: Optional[str] = Query(None, description="Search products by title or description"),
    include_inactive: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all available products with optional category and keyword search filters."""
    if include_inactive and not is_authenticated_admin(request):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hujaidhinishwa kama admin. Tafadhali ingia kwanza."
        )
    return service_get_products(
        db=db,
        category=category,
        search=search,
        skip=skip,
        limit=limit,
        include_inactive=include_inactive,
    )


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


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def remove_product(
    slug: str,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin endpoint to permanently remove a cosmetic product."""
    if not service_delete_product(db=db, slug=slug):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bidhaa haikupatikana."
        )
