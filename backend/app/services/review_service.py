from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.review import Review
from backend.app.schemas.review import ReviewCreate
from backend.app.core.email import send_review_email


def create_review(db: Session, review_in: ReviewCreate) -> Review:
    db_review = Review(
        name=review_in.name.strip(),
        rating=review_in.rating,
        message=review_in.message.strip(),
        approved=False
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    # Attempt sending alert email to admin
    try:
        send_review_email(
            name=db_review.name,
            rating=db_review.rating,
            message=db_review.message
        )
    except Exception as exc:
        print(f"[Review Email Error] {exc}")

    return db_review


def get_approved_reviews(db: Session, skip: int = 0, limit: int = 50) -> List[Review]:
    return (
        db.query(Review)
        .filter(Review.approved == True)
        .order_by(desc(Review.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_reviews(db: Session, skip: int = 0, limit: int = 100) -> List[Review]:
    return (
        db.query(Review)
        .order_by(desc(Review.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_review_approval(db: Session, review_id: int, approved: bool) -> Optional[Review]:
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return None
    review.approved = approved
    db.commit()
    db.refresh(review)
    return review


def delete_review(db: Session, review_id: int) -> bool:
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return False
    db.delete(review)
    db.commit()
    return True
