from datetime import datetime

from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    product_name: str | None = None
    product_id: str | None = None
    rating: int = Field(..., ge=1, le=5)
    review_title: str | None = None
    review_text: str = Field(..., min_length=10)
    review_date: datetime | None = None


class ReviewCreate(ReviewBase):
    pass


class ReviewAnalyzeRequest(ReviewBase):
    pass


class ReviewOut(ReviewBase):
    id: int
    sentiment: str | None = None
    sentiment_confidence: float | None = None
    complaint_category: str | None = None
    category_confidence: float | None = None
    priority: str | None = None
    status: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
