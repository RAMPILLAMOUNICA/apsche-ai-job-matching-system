from fastapi import APIRouter, Body
from ai_service import analyze_resume_sync

router = APIRouter(
    prefix="/api/resume",
    tags=["Resume"]
)


@router.post("/analyze")
def analyze_resume(data: dict = Body(...)):
    resume_text = data.get("resume_text", "")
    result = analyze_resume_sync(resume_text)
    return result