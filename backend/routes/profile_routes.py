import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import DBUser, DBEmployeeProfile
from auth import get_current_user_jwt

router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)


@router.get("")
def get_profile(current_user: dict = Depends(get_current_user_jwt), db: Session = Depends(get_db)):
    email = current_user.get("sub")
    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(DBEmployeeProfile).filter(DBEmployeeProfile.user_id == db_user.id).first()
    if not profile:
        # Create a default profile if none exists
        profile = DBEmployeeProfile(
            id=uuid.uuid4().hex,
            user_id=db_user.id,
            skills="",
            experience="",
            certifications="",
            career_interests="",
            department="General",
            designation="Employee",
            resume_text="",
            resume_name=""
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "id": profile.id,
        "skills": profile.skills,
        "experience": profile.experience,
        "certifications": profile.certifications,
        "career_interests": profile.career_interests,
        "department": profile.department or "General",
        "designation": profile.designation or "Employee",
        "resume_name": profile.resume_name
    }


@router.put("")
def update_profile(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt),
    db: Session = Depends(get_db)
):
    email = current_user.get("sub")
    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(DBEmployeeProfile).filter(DBEmployeeProfile.user_id == db_user.id).first()
    if not profile:
        profile = DBEmployeeProfile(
            id=uuid.uuid4().hex,
            user_id=db_user.id,
            skills=data.get("skills", ""),
            experience=data.get("experience", ""),
            certifications=data.get("certifications", ""),
            career_interests=data.get("career_interests", ""),
            department=data.get("department", "General"),
            designation=data.get("designation", "Employee"),
            resume_text="",
            resume_name=""
        )
        db.add(profile)
    else:
        profile.skills = data.get("skills", profile.skills)
        profile.experience = data.get("experience", profile.experience)
        profile.certifications = data.get("certifications", profile.certifications)
        profile.career_interests = data.get("career_interests", profile.career_interests)
        profile.department = data.get("department", profile.department or "General")
        profile.designation = data.get("designation", profile.designation or "Employee")

    db.commit()
    return {"message": "Employee profile updated"}


@router.put("/user")
def update_user_details(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt),
    db: Session = Depends(get_db)
):
    email = current_user.get("sub")
    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    name = data.get("name")
    if name:
        db_user.name = name
        db.commit()
        
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role
    }


@router.get("/all")
def get_all_profiles(current_user: dict = Depends(get_current_user_jwt), db: Session = Depends(get_db)):
    if current_user.get("role") != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    users = db.query(DBUser).filter(DBUser.role == "employee").all()
    response_data = []
    
    for u in users:
        profile = u.profile
        response_data.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "skills": profile.skills if profile else "",
            "experience": profile.experience if profile else "",
            "certifications": profile.certifications if profile else "",
            "career_interests": profile.career_interests if profile else "",
            "department": profile.department if (profile and profile.department) else "General",
            "designation": profile.designation if (profile and profile.designation) else "Employee"
        })
        
    return response_data