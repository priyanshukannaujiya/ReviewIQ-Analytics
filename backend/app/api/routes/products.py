from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_organization
from app.core.database import get_db
from app.models.organization import Organization
from app.models.product import Product
from app.models.review import Review

router = APIRouter()


@router.get("")
def list_products(db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    products = db.query(Product).filter(Product.organization_id == org.id).all()
    items = []
    for product in products:
        reviews = db.query(Review).filter(Review.product_id == product.id).all()
        items.append({
            "id": product.id,
            "name": product.name,
            "total_reviews": len(reviews),
            "average_rating": round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else 0,
            "positive_pct": 0,
            "negative_pct": 0,
        })
    return {"items": items}
