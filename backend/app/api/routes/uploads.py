import csv
import io
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_organization
from app.core.database import get_db, SessionLocal
from app.models.organization import Organization
from app.models.uploaded_file import UploadedFile
from app.models.review import Review
from app.models.complaint import Complaint
from app.services.review_analyzer import review_analyzer

router = APIRouter()


def _find_field(row: dict, candidates: set, default: str = "") -> str:
    for k, v in row.items():
        if k and k.strip().lower().replace(" ", "_").replace(".", "_") in candidates:
            return str(v).strip() if v is not None else default
    return default


def _parse_rating(val: str, fallback: int = 5) -> int:
    if not val:
        return fallback
    try:
        r = int(float(val))
        return max(1, min(5, r))
    except (ValueError, TypeError):
        return fallback


def _parse_date(date_str: str) -> datetime | None:
    if not date_str:
        return None
    s = date_str.strip()
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        pass
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d", "%b %d, %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            pass
    return None


TEXT_KEYS = {"review_text", "review", "text", "body", "content", "comments", "comment", "feedback", "review_body", "description"}
RATING_KEYS = {"rating", "score", "stars", "star_rating", "overall", "user_rating"}
TITLE_KEYS = {"review_title", "title", "summary", "heading", "subject"}
DATE_KEYS = {"review_date", "date", "created_at", "timestamp", "time", "review_time"}
PRODUCT_KEYS = {"product_name", "product", "item_name", "item"}


def process_csv_upload(upload_id: int, org_id: int, file_content: bytes):
    db = SessionLocal()
    try:
        upload = db.query(UploadedFile).filter(UploadedFile.id == upload_id).first()
        if not upload:
            return

        upload.status = "processing"
        db.commit()

        decoded_content = file_content.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(decoded_content))
        
        valid_rows = 0
        invalid_rows = 0
        
        for row in reader:
            try:
                review_text = _find_field(row, TEXT_KEYS)
                if not review_text:
                    invalid_rows += 1
                    continue
                    
                rating = _parse_rating(_find_field(row, RATING_KEYS))
                review_title = _find_field(row, TITLE_KEYS)
                review_date = _parse_date(_find_field(row, DATE_KEYS))
                        
                # ML Analysis
                analysis = review_analyzer.analyze(review_text, fallback_rating=rating)
                sentiment = analysis["sentiment"]
                confidence = analysis["confidence"]
                
                if sentiment == "Negative":
                    priority = "High"
                elif sentiment == "Neutral":
                    priority = "Medium"
                else:
                    priority = "Low"
                    
                review = Review(
                    organization_id=org_id,
                    product_id=None,
                    customer_name="Anonymous",
                    rating=rating,
                    review_title=review_title,
                    review_text=review_text,
                    review_date=review_date,
                    sentiment=sentiment,
                    sentiment_confidence=confidence,
                    priority=priority,
                    status="Open" if priority in ["High", "Medium"] else "Closed"
                )
                db.add(review)
                db.flush() # get review.id
                
                if priority in ["High", "Medium"]:
                    complaint = Complaint(
                        organization_id=org_id,
                        review_id=review.id,
                        category="Product Quality",
                        priority=priority,
                        status="Open"
                    )
                    db.add(complaint)
                
                valid_rows += 1
                
                # Commit in chunks of 500 to save memory
                if valid_rows % 500 == 0:
                    db.commit()
                    
            except Exception as e:
                logging.error(f"Error parsing row: {e}")
                invalid_rows += 1

        db.commit()
        
        # Update upload status
        upload.total_rows = valid_rows + invalid_rows
        upload.valid_rows = valid_rows
        upload.invalid_rows = invalid_rows
        upload.status = "completed"
        db.commit()
        
    except Exception as e:
        logging.error(f"Failed to process CSV {upload_id}: {e}")
        upload = db.query(UploadedFile).filter(UploadedFile.id == upload_id).first()
        if upload:
            upload.status = "failed"
            db.commit()
    finally:
        db.close()


@router.post("/reviews")
async def upload_reviews(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    org: Organization = Depends(get_current_organization)
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are allowed")

    file_content = await file.read()

    uploaded = UploadedFile(
        organization_id=org.id,
        filename=file.filename,
        total_rows=0,
        valid_rows=0,
        invalid_rows=0,
        status="uploaded",
    )
    db.add(uploaded)
    db.commit()
    db.refresh(uploaded)
    
    # Queue the background processing
    background_tasks.add_task(process_csv_upload, uploaded.id, org.id, file_content)
    
    return {"success": True, "upload_id": uploaded.id, "message": "CSV uploaded and queued for ML processing."}


@router.get("")
def list_uploads(db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    uploads = db.query(UploadedFile).filter(UploadedFile.organization_id == org.id).order_by(UploadedFile.created_at.desc()).all()
    return {"items": uploads}


@router.get("/{upload_id}")
def get_upload(upload_id: int, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    upload = db.query(UploadedFile).filter(UploadedFile.id == upload_id, UploadedFile.organization_id == org.id).first()
    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")
    return upload
