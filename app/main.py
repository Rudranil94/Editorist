from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.video_router import router as video_router
from app.core.worker import VideoWorker
import asyncio
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title="Editorist",
    description="AI-powered video editing tool for content creators",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(video_router, prefix="/api/v1/videos", tags=["videos"])

# Create worker instance
worker = VideoWorker()

@app.on_event("startup")
async def startup_event():
    """Start the video processing worker."""
    asyncio.create_task(worker.start())

@app.on_event("shutdown")
async def shutdown_event():
    """Stop the video processing worker."""
    await worker.stop()

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Editorist API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    } 