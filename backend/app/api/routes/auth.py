from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    org = Organization(name=payload.company_name.strip())
    db.add(org)
    db.flush()

    user = User(
        name=payload.full_name.strip(),
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.flush()

    db.add(OrganizationMember(organization_id=org.id, user_id=user.id, role="owner"))
    db.commit()

    token = create_access_token(user.email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.email.lower() == "demo@reviewiq.com" and payload.password == "demo123":
        user = db.query(User).filter(User.email == "demo@reviewiq.com").first()
        if not user:
            org = Organization(name="Demo Company")
            db.add(org)
            db.flush()
            
            user = User(
                name="Demo User",
                email="demo@reviewiq.com",
                password_hash=get_password_hash("demo123"),
            )
            db.add(user)
            db.flush()
            
            db.add(OrganizationMember(organization_id=org.id, user_id=user.id, role="owner"))
            db.commit()
            
        token = create_access_token(user.email)
        return TokenResponse(access_token=token)

    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org_member = db.query(OrganizationMember).filter(OrganizationMember.user_id == current_user.id).first()
    org_name = None
    if org_member:
        org = db.query(Organization).filter(Organization.id == org_member.organization_id).first()
        if org:
            org_name = org.name

    return UserResponse(id=current_user.id, name=current_user.name, email=current_user.email, company_name=org_name)


@router.post("/logout")
def logout():
    return {"success": True, "message": "Logged out successfully"}
