from fastapi import APIRouter, Body
from ai_service import simulate_career_paths_sync

router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


@router.post("/generate")
def generate_recommendations(profile: dict = Body(...)):
    result = simulate_career_paths_sync(profile)
    return result