from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import require_admin, is_authenticated_admin
from backend.app.schemas.review import ReviewCreate, ReviewOut, ReviewUpdate
from backend.app.services.review_service import (
    create_review as service_create_review,
    get_approved_reviews as service_get_approved_reviews,
    get_all_reviews as service_get_all_reviews,
    update_review_approval as service_update_review_approval,
    delete_review as service_delete_review
)

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=List[ReviewOut])
def list_reviews(
    request: Request,
    skip: int = 0,
    limit: int = 50,
    all_reviews: bool = False,
    db: Session = Depends(get_db)
):
    """
    List reviews.
    By default returns only approved reviews for public customers.
    If all_reviews=True and authenticated as admin, returns all reviews.
    """
    if all_reviews and is_authenticated_admin(request):
        return service_get_all_reviews(db=db, skip=skip, limit=limit)
    return service_get_approved_reviews(db=db, skip=skip, limit=limit)


@router.post("", status_code=status.HTTP_200_OK)
def submit_review(review_in: ReviewCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Submit customer review.
    Stored with approved=False pending admin moderation.
    """
    try:
        service_create_review(db=db, review_in=review_in)
        return {
            "ok": True,
            "message": "Asante kwa maoni yako! Yatatokea hapa baada ya kupitiwa na timu yetu."
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Imeshindikana kutuma maoni: {str(exc)}"
        )


@router.patch("/{review_id}/approve", response_model=ReviewOut)
def approve_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin moderation endpoint to approve or unapprove a review."""
    updated = service_update_review_approval(db=db, review_id=review_id, approved=payload.approved)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maoni hayakupatikana.")
    return updated


@router.delete("/{review_id}")
def delete_review_endpoint(
    review_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin)
):
    """Admin endpoint to delete inappropriate review."""
    deleted = service_delete_review(db=db, review_id=review_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maoni hayakupatikana.")
    return {"ok": True, "message": "Maoni yamefutwa."}
