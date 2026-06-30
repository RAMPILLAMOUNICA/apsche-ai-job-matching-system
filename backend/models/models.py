import datetime

from sqlalchemy import (
    Column, String, Integer, Text,
    ForeignKey, Float, DateTime
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class DBUser(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")  # employee / hr

    profile = relationship(
        "DBEmployeeProfile",
        uselist=False,
        back_populates="user"
    )


class DBEmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(
        String,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    skills = Column(Text, default="")
    experience = Column(Text, default="")
    certifications = Column(Text, default="")
    career_interests = Column(Text, default="")
    department = Column(String, default="General")
    designation = Column(String, default="Employee")
    resume_text = Column(Text, nullable=True)
    resume_name = Column(String, nullable=True)

    user = relationship(
        "DBUser",
        back_populates="profile"
    )


class DBInternalJob(Base):
    __tablename__ = "internal_jobs"

    id = Column(String, primary_key=True, index=True)

    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    location = Column(String, nullable=False)
    salary_range = Column(String, nullable=True)

    description = Column(Text, nullable=False)
    requirements = Column(Text, default="")
    skills_needed = Column(Text, default="")

    posted_date = Column(String, nullable=False)

    experience_level = Column(String, nullable=True)
    employment_type = Column(String, nullable=True)


class DBRecommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)

    user_id = Column(String, nullable=False)
    job_id = Column(String, nullable=False)

    match_percentage = Column(Integer, default=0)
    match_explanation = Column(Text, nullable=False)

    skill_gaps = Column(Text, default="")
    recommended_certs = Column(Text, default="")
    learning_roadmap = Column(Text, default="")


class DBResume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, index=True)

    user_id = Column(String, nullable=False)

    skills = Column(Text, default="")
    strengths = Column(Text, default="")
    weaknesses = Column(Text, default="")
    certifications = Column(Text, default="")
    experience_summary = Column(Text, default="")

    uploaded_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )


class DBApplication(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)

    user_id = Column(String, nullable=False)
    job_id = Column(String, nullable=False)

    status = Column(
        String,
        default="Applied"
    )  # Applied, Shortlisted, Interview, Offered, Rejected

    applied_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )