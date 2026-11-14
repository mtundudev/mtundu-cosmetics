import datetime
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    name: str = Field(..., min_length=2, description="Customer reviewer name")
    rating: int = Field(..., ge=1, le=5, description="Star rating from 1 to 5")
    message: str = Field(..., min_length=5, description="Review message text")


class ReviewUpdate(BaseModel):
    approved: bool


class ReviewOut(BaseModel):
    id: int
    name: str
    rating: int
    message: str
    approved: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
