import asyncio
from typing import Dict, Optional
from app.core.job_queue import JobQueue
from app.core.video_processor import VideoProcessor
from app.core.config import settings

class VideoWorker:
    def __init__(self):
        self.job_queue = JobQueue()
        self.video_processor = VideoProcessor()
        self.is_running = False
    
    async def start(self):
        """Start the worker process."""
        self.is_running = True
        while self.is_running:
            try:
                # Get next job
                job_id = self.job_queue.get_next_job()
                if job_id:
                    await self.process_job(job_id)
                else:
                    # No jobs, wait before checking again
                    await asyncio.sleep(1)
            except Exception as e:
                print(f"Error in worker: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    async def stop(self):
        """Stop the worker process."""
        self.is_running = False
    
    async def process_job(self, job_id: str):
        """Process a single video job."""
        try:
            # Get job details
            job_data = self.job_queue.get_job_status(job_id)
            if not job_data:
                return
            
            # Update status to processing
            self.job_queue.update_job_progress(job_id, 0, "processing")
            
            # Load video
            self.job_queue.update_job_progress(job_id, 10, "loading_video")
            if not self.video_processor.load_video(job_data["video_path"]):
                raise Exception("Failed to load video")
            
            # Detect scenes
            self.job_queue.update_job_progress(job_id, 30, "detecting_scenes")
            scenes = self.video_processor.detect_scenes()
            
            # Optimize scenes if requested
            if job_data["params"].get("optimize_scenes", True):
                self.job_queue.update_job_progress(job_id, 40, "optimizing_scenes")
                scenes = self.video_processor.optimize_scenes(
                    job_data["params"].get("min_quality_threshold", 0.6),
                    job_data["params"].get("min_importance_threshold", 0.4)
                )
            
            # Analyze content if requested
            content_analysis = []
            if job_data["params"].get("analyze_content", True):
                self.job_queue.update_job_progress(job_id, 50, "analyzing_content")
                content_analysis = self.video_processor.analyze_scene_content()
            
            # Apply color grading
            self.job_queue.update_job_progress(job_id, 60, "applying_color_grading")
            if not self.video_processor.apply_color_grading(
                job_data["params"].get("style", "cinematic"),
                job_data["params"].get("strength", 0.5)
            ):
                raise Exception("Failed to apply color grading")
            
            # Add transitions
            if scenes:
                self.job_queue.update_job_progress(job_id, 70, "adding_transitions")
                if not self.video_processor.add_transitions(
                    job_data["params"].get("transitions", "fade")
                ):
                    raise Exception("Failed to add transitions")
            
            # Export video
            self.job_queue.update_job_progress(job_id, 80, "exporting_video")
            output_path = str(Path(job_data["video_path"]).with_suffix('.processed.mp4'))
            if not self.video_processor.export_video(output_path):
                raise Exception("Failed to export video")
            
            # Cleanup
            self.video_processor.cleanup()
            
            # Prepare result
            result = {
                "message": "Video processed successfully",
                "output_path": output_path,
                "scenes": scenes,
                "content_analysis": content_analysis
            }
            
            # Add motion and continuity analysis if requested
            if job_data["params"].get("analyze_motion", True):
                result["scene_motion_data"] = self.video_processor.scene_motion_data
            if job_data["params"].get("analyze_continuity", True):
                result["scene_continuities"] = self.video_processor.scene_continuities
            
            # Mark job as completed
            self.job_queue.complete_job(job_id, result)
            
        except Exception as e:
            self.video_processor.cleanup()
            self.job_queue.fail_job(job_id, str(e))
            raise 