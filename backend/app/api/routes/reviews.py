from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_organization, get_current_user
from app.core.database import get_db
from app.models.organization import Organization
from app.models.product import Product
from app.models.review import Review
from app.models.complaint import Complaint
from app.schemas.review import ReviewAnalyzeRequest, ReviewCreate, ReviewOut
from app.services.review_analyzer import review_analyzer

router = APIRouter()


@router.post("", response_model=ReviewOut)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    product = db.query(Product).filter(Product.organization_id == org.id, Product.name == payload.product_name).first()
    if not product:
        product = Product(organization_id=org.id, external_product_id=payload.product_id, name=payload.product_name, category="General")
        db.add(product)
        db.flush()

    analysis = review_analyzer.analyze(payload.review_text, fallback_rating=payload.rating)
    sentiment = analysis["sentiment"]
    
    review = Review(
        organization_id=org.id,
        product_id=product.id,
        customer_name="Customer",
        rating=payload.rating,
        review_title=payload.review_title,
        review_text=payload.review_text,
        review_date=payload.review_date or datetime.utcnow(),
        sentiment=sentiment,
        sentiment_confidence=analysis["confidence"],
        complaint_category="Product Quality" if sentiment == "Negative" else "Other",
        category_confidence=0.8,
        priority="High" if sentiment == "Negative" else "Medium",
        status="Open",
    )
    db.add(review)
    db.flush()
    if review.priority in ["High", "Medium"]:
        complaint = Complaint(
            organization_id=org.id,
            review_id=review.id,
            category="Product Quality",
            priority=review.priority,
            status="Open"
        )
        db.add(complaint)
    
    db.commit()
    db.refresh(review)
    return ReviewOut(**review.__dict__)


@router.post("/analyze", response_model=ReviewOut)
def analyze_review(payload: ReviewAnalyzeRequest, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    product = db.query(Product).filter(Product.organization_id == org.id, Product.name == payload.product_name).first()
    if not product:
        product = Product(organization_id=org.id, external_product_id=payload.product_id, name=payload.product_name, category="General")
        db.add(product)
        db.flush()

    rating = payload.rating
    analysis = review_analyzer.analyze(payload.review_text, fallback_rating=rating)
    sentiment = analysis["sentiment"]

    review = Review(
        organization_id=org.id,
        product_id=product.id,
        customer_name="Customer",
        rating=rating,
        review_title=payload.review_title,
        review_text=payload.review_text,
        review_date=payload.review_date or datetime.utcnow(),
        sentiment=sentiment,
        sentiment_confidence=analysis["confidence"],
        complaint_category="Product Quality" if sentiment == "Negative" else "Other",
        category_confidence=0.87,
        priority="High" if sentiment == "Negative" else "Medium",
        status="Open",
    )
    db.add(review)
    db.flush()
    if review.priority in ["High", "Medium"]:
        complaint = Complaint(
            organization_id=org.id,
            review_id=review.id,
            category="Product Quality",
            priority=review.priority,
            status="Open"
        )
        db.add(complaint)
        
    db.commit()
    db.refresh(review)
    return ReviewOut(**review.__dict__)


@router.get("")
def list_reviews(
    skip: int = 0,
    limit: int = 50,
    sentiment: str = None,
    db: Session = Depends(get_db),
    org: Organization = Depends(get_current_organization),
):
    query = db.query(Review).filter(Review.organization_id == org.id)
    if sentiment:
        query = query.filter(Review.sentiment == sentiment)
    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "items": [ReviewOut(**item.__dict__).model_dump() for item in reviews],
    }


@router.get("/{review_id}")
def get_review(review_id: int, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    review = db.query(Review).filter(Review.id == review_id, Review.organization_id == org.id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return ReviewOut(**review.__dict__)


@router.put("/{review_id}")
def update_review(review_id: int, payload: ReviewCreate, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    review = db.query(Review).filter(Review.id == review_id, Review.organization_id == org.id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    review.product_id = None
    review.rating = payload.rating
    review.review_title = payload.review_title
    review.review_text = payload.review_text
    review.review_date = payload.review_date or review.review_date
    db.commit()
    return {"success": True, "message": "Review updated"}


@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    review = db.query(Review).filter(Review.id == review_id, Review.organization_id == org.id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"success": True, "message": "Review deleted"}
