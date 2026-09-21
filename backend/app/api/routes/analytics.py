from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_organization
from app.core.database import get_db
from app.models.organization import Organization
from app.models.review import Review
from app.models.complaint import Complaint

router = APIRouter()


@router.get("/overview")
def get_overview(db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    reviews = db.query(Review).filter(Review.organization_id == org.id).all()
    complaints = db.query(Complaint).filter(Complaint.organization_id == org.id).all()
    
    total_reviews = len(reviews)
    positive = sum(1 for r in reviews if r.sentiment == "Positive")
    negative = sum(1 for r in reviews if r.sentiment == "Negative")
    open_complaints = sum(1 for c in complaints if c.status == "Open")
    high_priority_complaints = sum(1 for c in complaints if c.status == "Open" and c.priority == "High")
    
    return {
        "total_reviews": total_reviews,
        "positive_reviews": positive,
        "negative_reviews": negative,
        "open_complaints": open_complaints,
        "high_priority_complaints": high_priority_complaints,
    }


@router.get("/sentiment")
def get_sentiment(db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    reviews = db.query(Review).filter(Review.organization_id == org.id).all()
    positive = sum(1 for r in reviews if r.sentiment == "Positive")
    neutral = sum(1 for r in reviews if r.sentiment == "Neutral")
    negative = sum(1 for r in reviews if r.sentiment == "Negative")
    
    # Return formatted for Recharts
    return [
        {"name": "Positive", "value": positive, "fill": "#10b981"},
        {"name": "Neutral", "value": neutral, "fill": "#f59e0b"},
        {"name": "Negative", "value": negative, "fill": "#ef4444"},
    ]


@router.get("/trends")
def get_trends(db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    reviews = db.query(Review).filter(Review.organization_id == org.id, Review.review_date.isnot(None)).all()
    trend = []
    now = datetime.utcnow().date()
    for i in range(7):
        target_date = now - timedelta(days=6 - i)
        count = sum(1 for r in reviews if r.review_date and r.review_date.date() == target_date)
        trend.append({
            "date": target_date.strftime("%b %d"), 
            "reviews": count
        })
    return trend


@router.get("/products")
def get_products(db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    return {"items": []}
