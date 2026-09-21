from sqlalchemy import String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Aspect(Base):
    __tablename__ = "aspects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    review_id: Mapped[int] = mapped_column(ForeignKey("reviews.id"), nullable=False, index=True)
    aspect_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sentiment: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
