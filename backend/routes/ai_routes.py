from fastapi import APIRouter
from ai_service import check_ai_status_sync

router = APIRouter(
    prefix="/api",
    tags=["AI"]
)


@router.get("/ai-status")
def ai_status():
    return check_ai_status_sync()