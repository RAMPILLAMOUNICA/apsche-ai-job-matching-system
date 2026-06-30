import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import DBInternalJob
from auth import get_current_user_jwt
from ai_service import calculate_job_match_sync

router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs"]
)


@router.get("")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(DBInternalJob).all()
    return jobs


@router.post("")
def create_job(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR can post vacancies."
        )

    job_id = uuid.uuid4().hex
    new_job = DBInternalJob(
        id=job_id,
        title=data.get("title"),
        department=data.get("department"),
        location=data.get("location", "Remote"),
        salary_range=data.get("salary_range"),
        description=data.get("description"),
        requirements=data.get("requirements", ""),
        skills_needed=data.get("skills_needed", ""),
        posted_date=data.get("posted_date", ""),
        experience_level=data.get("experience_level"),
        employment_type=data.get("employment_type")
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"message": "Job created", "id": job_id}


@router.delete("/{job_id}")
def delete_job(
    job_id: str,
    current_user: dict = Depends(get_current_user_jwt),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR can delete vacancies."
        )

    job = db.query(DBInternalJob).filter(DBInternalJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    db.delete(job)
    db.commit()
    return {"message": f"Job {job_id} deleted"}


@router.post("/match")
def match_job(data: dict = Body(...)):
    employee_profile = data.get("employee_profile", {})
    job = data.get("job", {})
    
    result = calculate_job_match_sync(
        employee_profile,
        job
    )
    return result