from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict
import shutil
from pathlib import Path
from app.core.video_processor import VideoProcessor
from app.core.job_queue import JobQueue
from app.core.config import settings

router = APIRouter()
job_queue = JobQueue()

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload a video file for processing."""
    if not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    try:
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create processing job
        job_id = job_queue.create_job(str(file_path), {})
        
        return JSONResponse({
            "message": "Video uploaded successfully",
            "filename": file.filename,
            "job_id": job_id,
            "status": "pending"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process")
async def process_video(
    video_path: str,
    style: Optional[str] = Query("cinematic", description="Style to apply (cinematic, vibrant, muted)"),
    strength: Optional[float] = Query(0.5, ge=0.0, le=1.0, description="Strength of the style effect"),
    transitions: Optional[str] = Query("fade", description="Type of transition between scenes"),
    detect_scenes: Optional[bool] = Query(True, description="Whether to detect scenes automatically"),
    analyze_content: Optional[bool] = Query(True, description="Whether to analyze scene content"),
    optimize_scenes: Optional[bool] = Query(True, description="Whether to optimize scene selection based on quality"),
    min_quality_threshold: Optional[float] = Query(0.6, ge=0.0, le=1.0, description="Minimum quality threshold for scene selection"),
    min_importance_threshold: Optional[float] = Query(0.4, ge=0.0, le=1.0, description="Minimum importance threshold for scene selection"),
    analyze_motion: Optional[bool] = Query(True, description="Whether to analyze motion between frames"),
    analyze_continuity: Optional[bool] = Query(True, description="Whether to analyze scene continuity"),
    min_object_continuity: Optional[float] = Query(0.5, ge=0.0, le=1.0, description="Minimum object continuity threshold for scene selection")
):
    """Process a video with specified parameters."""
    try:
        # Create processing parameters
        params = {
            "style": style,
            "strength": strength,
            "transitions": transitions,
            "detect_scenes": detect_scenes,
            "analyze_content": analyze_content,
            "optimize_scenes": optimize_scenes,
            "min_quality_threshold": min_quality_threshold,
            "min_importance_threshold": min_importance_threshold,
            "analyze_motion": analyze_motion,
            "analyze_continuity": analyze_continuity,
            "min_object_continuity": min_object_continuity
        }
        
        # Create job
        job_id = job_queue.create_job(video_path, params)
        
        return JSONResponse({
            "message": "Video processing job created",
            "job_id": job_id,
            "status": "pending"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """Get the status of a video processing job."""
    job_status = job_queue.get_job_status(job_id)
    if not job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # If job is completed, include the result
    if job_status["status"] == "completed":
        result = job_queue.get_job_result(job_id)
        if result:
            job_status["result"] = result
    
    return job_status

@router.get("/jobs/active")
async def get_active_jobs():
    """Get all active video processing jobs."""
    return job_queue.get_active_jobs()

@router.get("/analyze")
async def analyze_video(
    video_path: str,
    detect_scenes: Optional[bool] = Query(True, description="Whether to detect scenes"),
    analyze_content: Optional[bool] = Query(True, description="Whether to analyze content"),
    analyze_quality: Optional[bool] = Query(True, description="Whether to analyze scene quality"),
    analyze_motion: Optional[bool] = Query(True, description="Whether to analyze motion between frames"),
    analyze_continuity: Optional[bool] = Query(True, description="Whether to analyze scene continuity"),
    num_keyframes: Optional[int] = Query(5, ge=1, le=20, description="Number of keyframes to extract")
) -> Dict:
    """Analyze a video without processing it."""
    try:
        # Create analysis parameters
        params = {
            "detect_scenes": detect_scenes,
            "analyze_content": analyze_content,
            "analyze_quality": analyze_quality,
            "analyze_motion": analyze_motion,
            "analyze_continuity": analyze_continuity,
            "num_keyframes": num_keyframes,
            "analysis_only": True  # Flag to indicate this is an analysis-only job
        }
        
        # Create job
        job_id = job_queue.create_job(video_path, params)
        
        return {
            "message": "Video analysis job created",
            "job_id": job_id,
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 