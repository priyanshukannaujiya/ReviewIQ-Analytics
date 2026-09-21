from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_organization
from app.core.database import get_db
from app.models.complaint import Complaint
from app.models.complaint_status_history import ComplaintStatusHistory
from app.models.organization import Organization

router = APIRouter()


@router.get("")
def list_complaints(db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    complaints = db.query(Complaint).filter(Complaint.organization_id == org.id).order_by(Complaint.created_at.desc()).all()
    return {"items": [
        {
            "id": item.id,
            "category": item.category,
            "priority": item.priority,
            "status": item.status,
            "assigned_to": item.assigned_to,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }
        for item in complaints
    ]}


@router.get("/{complaint_id}")
def get_complaint(complaint_id: int, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.organization_id == org.id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    return complaint


@router.put("/{complaint_id}")
def update_complaint(complaint_id: int, payload: dict, db: Session = Depends(get_db), org: Organization = Depends(get_current_organization)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.organization_id == org.id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    old_status = complaint.status
    if "status" in payload:
        complaint.status = payload["status"]
    if "priority" in payload:
        complaint.priority = payload["priority"]
    if "assigned_to" in payload:
        complaint.assigned_to = payload["assigned_to"]

    if old_status != complaint.status:
        db.add(ComplaintStatusHistory(complaint_id=complaint.id, old_status=old_status, new_status=complaint.status, changed_by="system"))

    db.commit()
    return {"success": True, "message": "Complaint updated"}
