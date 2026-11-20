import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ServiceCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    description: str = Field(..., min_length=5, max_length=2000)
    title_en: str = Field(default="", max_length=120)
    description_en: str = Field(default="", max_length=2000)
    is_active: bool = True


class ServiceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, min_length=5, max_length=2000)
    title_en: Optional[str] = Field(default=None, max_length=120)
    description_en: Optional[str] = Field(default=None, max_length=2000)
    is_active: Optional[bool] = None


class ServiceOut(ServiceCreate):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
