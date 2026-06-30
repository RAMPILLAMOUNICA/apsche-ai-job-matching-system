import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.models import DBUser
from auth import hash_password, verify_password, create_access_token, get_current_user_jwt

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: dict = Body(...), db: Session = Depends(get_db)):
    email = user.get("email")
    name = user.get("name")
    password = user.get("password")
    role = user.get("role", "employee")

    if not email or not password or not name:
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Missing email, name, or password"
      )

    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    new_user = DBUser(
        id=uuid.uuid4().hex,
        name=name,
        email=email,
        hashed_password=hash_password(password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Registration successful"}


@router.post("/login")
def login(user: dict = Body(...), db: Session = Depends(get_db)):
    email = user.get("email")
    password = user.get("password")

    if not email or not password:
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Missing email or password"
      )

    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user_jwt), db: Session = Depends(get_db)):
    email = current_user.get("sub")
    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role
    }


@router.put("/password")
def change_password(
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
        
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing password fields"
        )
        
    if not verify_password(current_password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )
        
    db_user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.delete("/delete/{email}")
def delete_account(
    email: str,
    current_user: dict = Depends(get_current_user_jwt),
    db: Session = Depends(get_db)
):
    if current_user.get("sub") != email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own account."
        )
        
    db_user = db.query(DBUser).filter(DBUser.email == email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    profile = db_user.profile
    if profile:
        db.delete(profile)
        
    db.delete(db_user)
    db.commit()
    return {"message": "Account deleted successfully"}