import os
from fastapi import FastAPI
import uvicorn
from database.database import engine
from models.models import Base
from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.resume_routes import router as resume_router
from routes.job_routes import router as job_router
from routes.recommendation_routes import router as recommendation_router
from routes.ai_routes import router as ai_router
from routes.application_routes import router as application_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Internal Job Mobility Assistant")
allowed_origins = [origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(job_router)
app.include_router(recommendation_router)
app.include_router(ai_router)
app.include_router(application_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Backend is running successfully"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)