import redis
import json
import uuid
from typing import Dict, Optional, List
from datetime import datetime
from app.core.config import settings

class JobQueue:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        self.processing_queue = "video_processing_queue"
        self.job_status_prefix = "job_status:"
        self.job_progress_prefix = "job_progress:"
        self.job_result_prefix = "job_result:"
        self.job_timeout = 3600  # 1 hour timeout
    
    def create_job(self, video_path: str, params: Dict) -> str:
        """Create a new video processing job."""
        job_id = str(uuid.uuid4())
        job_data = {
            "id": job_id,
            "video_path": video_path,
            "params": params,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "progress": 0,
            "current_stage": "initializing"
        }
        
        # Store job data
        self.redis_client.setex(
            f"{self.job_status_prefix}{job_id}",
            self.job_timeout,
            json.dumps(job_data)
        )
        
        # Add to processing queue
        self.redis_client.rpush(self.processing_queue, job_id)
        
        return job_id
    
    def get_job_status(self, job_id: str) -> Optional[Dict]:
        """Get the current status of a job."""
        job_data = self.redis_client.get(f"{self.job_status_prefix}{job_id}")
        if job_data:
            return json.loads(job_data)
        return None
    
    def update_job_progress(self, job_id: str, progress: float, stage: str, details: Optional[Dict] = None):
        """Update the progress of a job."""
        job_data = self.get_job_status(job_id)
        if job_data:
            job_data["progress"] = progress
            job_data["current_stage"] = stage
            if details:
                job_data["details"] = details
            
            self.redis_client.setex(
                f"{self.job_status_prefix}{job_id}",
                self.job_timeout,
                json.dumps(job_data)
            )
    
    def complete_job(self, job_id: str, result: Dict):
        """Mark a job as completed and store its result."""
        job_data = self.get_job_status(job_id)
        if job_data:
            job_data["status"] = "completed"
            job_data["completed_at"] = datetime.utcnow().isoformat()
            job_data["progress"] = 100
            
            # Store final status
            self.redis_client.setex(
                f"{self.job_status_prefix}{job_id}",
                self.job_timeout,
                json.dumps(job_data)
            )
            
            # Store result
            self.redis_client.setex(
                f"{self.job_result_prefix}{job_id}",
                self.job_timeout,
                json.dumps(result)
            )
    
    def fail_job(self, job_id: str, error: str):
        """Mark a job as failed."""
        job_data = self.get_job_status(job_id)
        if job_data:
            job_data["status"] = "failed"
            job_data["error"] = error
            job_data["completed_at"] = datetime.utcnow().isoformat()
            
            self.redis_client.setex(
                f"{self.job_status_prefix}{job_id}",
                self.job_timeout,
                json.dumps(job_data)
            )
    
    def get_job_result(self, job_id: str) -> Optional[Dict]:
        """Get the result of a completed job."""
        result = self.redis_client.get(f"{self.job_result_prefix}{job_id}")
        if result:
            return json.loads(result)
        return None
    
    def get_next_job(self) -> Optional[str]:
        """Get the next job ID from the queue."""
        return self.redis_client.lpop(self.processing_queue)
    
    def get_active_jobs(self) -> List[Dict]:
        """Get all active jobs (pending or processing)."""
        active_jobs = []
        for key in self.redis_client.keys(f"{self.job_status_prefix}*"):
            job_data = self.redis_client.get(key)
            if job_data:
                job = json.loads(job_data)
                if job["status"] in ["pending", "processing"]:
                    active_jobs.append(job)
        return active_jobs
    
    def cleanup_old_jobs(self, max_age_hours: int = 24):
        """Clean up old completed or failed jobs."""
        now = datetime.utcnow()
        for key in self.redis_client.keys(f"{self.job_status_prefix}*"):
            job_data = self.redis_client.get(key)
            if job_data:
                job = json.loads(job_data)
                if job["status"] in ["completed", "failed"]:
                    completed_at = datetime.fromisoformat(job["completed_at"])
                    age = (now - completed_at).total_seconds() / 3600
                    if age > max_age_hours:
                        job_id = job["id"]
                        self.redis_client.delete(f"{self.job_status_prefix}{job_id}")
                        self.redis_client.delete(f"{self.job_result_prefix}{job_id}") 