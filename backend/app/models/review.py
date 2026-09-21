from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    review_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    review_text: Mapped[str] = mapped_column(String, nullable=False)
    review_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sentiment: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sentiment_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    complaint_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    priority: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Open", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
