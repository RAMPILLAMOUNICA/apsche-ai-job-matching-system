import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import DBApplication, DBUser, DBInternalJob
from auth import get_current_user_jwt

router = APIRouter(
    prefix="/api/applications",
    tags=["Applications"]
)


@router.get("")
def list_applications(current_user: dict = Depends(get_current_user_jwt), db: Session = Depends(get_db)):
    if current_user.get("role") != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR can view applications."
        )

    apps = db.query(DBApplication).all()
    result = []
    
    for a in apps:
        user = db.query(DBUser).filter(DBUser.id == a.user_id).first()
        job = db.query(DBInternalJob).filter(DBInternalJob.id == a.job_id).first()
        result.append({
            "id": a.id,
            "name": user.name if user else "Unknown Candidate",
            "email": user.email if user else "N/A",
            "jobTitle": job.title if job else "Unknown Role",
            "status": a.status,
            "applied_at": a.applied_at.isoformat() if a.applied_at else ""
        })
        
    return result


@router.post("")
def create_application(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt),
    db: Session = Depends(get_db)
):
    email = current_user.get("sub")
    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    job_id = data.get("job_id")
    if not job_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing job_id"
        )

    # Check if already applied
    existing = db.query(DBApplication).filter(
        DBApplication.user_id == db_user.id,
        DBApplication.job_id == job_id
    ).first()
    
    if existing:
        return {"message": "Already applied", "id": existing.id}

    app_id = uuid.uuid4().hex
    new_app = DBApplication(
        id=app_id,
        user_id=db_user.id,
        job_id=job_id,
        status="Applied"
    )
    
    db.add(new_app)
    db.commit()
    return {"message": "Application submitted", "id": app_id}


@router.put("/{app_id}")
def update_application_status(
    app_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR can update application status."
        )

    app = db.query(DBApplication).filter(DBApplication.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    status_val = data.get("status")
    if not status_val:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing status value"
        )

    app.status = status_val
    db.commit()
    return {"message": "Application status updated"}
