import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional, Dict
from moviepy.editor import VideoFileClip, concatenate_videoclips
from app.models.scene_analyzer import SceneAnalyzer
from app.models.style_transfer import StyleTransfer
from app.core.config import settings

class VideoProcessor:
    def __init__(self):
        self.current_video: Optional[VideoFileClip] = None
        self.scenes: List[Tuple[float, float]] = []
        self.scene_analyzer = SceneAnalyzer()
        self.style_transfer = StyleTransfer()
        self.frame_buffer: List[np.ndarray] = []
        self.scene_qualities: List[Dict] = []
        self.scene_importances: List[float] = []
        self.scene_continuities: List[Dict] = []
        self.scene_motion_data: List[List[Dict]] = []
        
    def load_video(self, video_path: str) -> bool:
        """Load a video file for processing."""
        try:
            self.current_video = VideoFileClip(video_path)
            return True
        except Exception as e:
            print(f"Error loading video: {e}")
            return False
    
    def detect_scenes(self, threshold: float = 30.0) -> List[Tuple[float, float]]:
        """Detect scene changes using AI-based analysis."""
        if not self.current_video:
            return []
            
        # Extract frames for analysis
        frames = []
        frame_count = 0
        for frame in self.current_video.iter_frames():
            if frame_count % 30 == 0:  # Sample every second (assuming 30fps)
                frames.append(frame)
            frame_count += 1
        
        # Use AI to detect scenes
        scenes = self.scene_analyzer.detect_scenes(frames, threshold)
        
        # Convert frame indices to timestamps
        self.scenes = [(start/30, end/30) for start, end in scenes]
        
        # Analyze scenes
        self.scene_qualities = []
        self.scene_importances = []
        self.scene_continuities = []
        self.scene_motion_data = []
        
        for start_time, end_time in self.scenes:
            # Get frames for this scene
            scene_frames = []
            for frame in self.current_video.subclip(start_time, end_time).iter_frames():
                scene_frames.append(frame)
            
            if scene_frames:
                # Analyze quality
                quality = self.scene_analyzer.analyze_scene_quality(scene_frames[0])
                self.scene_qualities.append(quality)
                
                # Track motion with object tracking
                motion_data = self.scene_analyzer.track_motion(scene_frames)
                self.scene_motion_data.append(motion_data)
                
                # Calculate importance
                importance = self.scene_analyzer.calculate_scene_importance(scene_frames[0], motion_data)
                self.scene_importances.append(importance)
                
                # Analyze continuity
                continuity = self.scene_analyzer.analyze_scene_continuity(scene_frames)
                self.scene_continuities.append(continuity)
        
        return self.scenes
    
    def apply_color_grading(self, style: str = "cinematic", strength: float = 0.5) -> bool:
        """Apply AI-powered style transfer to the video."""
        if not self.current_video:
            return False
            
        try:
            def process_frame(frame):
                # Apply style transfer to each frame
                return self.style_transfer.apply_style(frame, style, strength)
            
            # Process the video
            self.current_video = self.current_video.fl_image(process_frame)
            return True
        except Exception as e:
            print(f"Error applying color grading: {e}")
            return False
    
    def analyze_scene_content(self) -> List[Dict]:
        """Analyze the content of each scene."""
        if not self.scenes:
            return []
            
        scene_analyses = []
        for start_time, end_time in self.scenes:
            # Extract frames for this scene
            scene_frames = []
            for frame in self.current_video.subclip(start_time, end_time).iter_frames():
                scene_frames.append(frame)
            
            # Analyze the scene
            if scene_frames:
                analysis = self.scene_analyzer.analyze_scene_content(scene_frames[0])
                scene_analyses.append({
                    "start_time": start_time,
                    "end_time": end_time,
                    "analysis": analysis
                })
        
        return scene_analyses
    
    def get_keyframes(self, num_keyframes: int = 5) -> List[float]:
        """Get the timestamps of key frames in the video."""
        if not self.current_video:
            return []
            
        # Extract frames for analysis
        frames = []
        frame_count = 0
        for frame in self.current_video.iter_frames():
            if frame_count % 30 == 0:  # Sample every second
                frames.append(frame)
            frame_count += 1
        
        # Get keyframe indices
        keyframe_indices = self.scene_analyzer.get_keyframes(frames, num_keyframes)
        
        # Convert to timestamps
        return [idx/30 for idx in keyframe_indices]
    
    def add_transitions(self, transition_type: str = "fade") -> bool:
        """Add transitions between scenes."""
        if not self.scenes:
            return False
            
        try:
            # Create clips for each scene
            scene_clips = []
            for start_time, end_time in self.scenes:
                scene_clip = self.current_video.subclip(start_time, end_time)
                scene_clips.append(scene_clip)
            
            # Add transitions between clips
            if transition_type == "fade":
                final_clip = concatenate_videoclips(scene_clips, method="compose")
                self.current_video = final_clip
            return True
        except Exception as e:
            print(f"Error adding transitions: {e}")
            return False
    
    def optimize_scenes(self, min_quality_threshold: float = 0.6, min_importance_threshold: float = 0.4) -> List[Tuple[float, float]]:
        """Optimize scene selection based on quality, importance, and motion analysis."""
        if not self.scenes or not self.scene_qualities or not self.scene_importances:
            return self.scenes
            
        optimized_scenes = []
        for i, (start_time, end_time) in enumerate(self.scenes):
            quality = self.scene_qualities[i]
            importance = self.scene_importances[i]
            continuity = self.scene_continuities[i]
            motion_data = self.scene_motion_data[i]
            
            # Calculate overall quality score
            quality_score = (
                quality["sharpness"] * 0.3 +
                (1 - quality["noise_level"]/255) * 0.2 +
                quality["dynamic_range"]/255 * 0.3 +
                (1 - abs(quality["exposure"] - 0.5) * 2) * 0.2
            )
            
            # Calculate motion score
            if motion_data:
                motion_score = (
                    np.mean([m["magnitude"] for m in motion_data]) * 0.4 +  # Motion complexity
                    np.mean([m["direction"] for m in motion_data]) * 0.3 +  # Motion smoothness
                    np.mean([m["variance"] for m in motion_data]) * 0.3     # Object interaction
                )
            else:
                motion_score = 0.0
            
            # Calculate final score combining quality, importance, continuity, and motion
            final_score = (
                quality_score * 0.3 +
                importance * 0.3 +
                continuity["continuity_score"] * 0.2 +
                motion_score * 0.2
            )
            
            # Check if scene meets thresholds
            if (final_score >= min_quality_threshold and 
                importance >= min_importance_threshold and
                continuity["object_continuity"] >= 0.5):  # Ensure object continuity
                optimized_scenes.append((start_time, end_time))
        
        self.scenes = optimized_scenes
        return optimized_scenes
    
    def export_video(self, output_path: str, format: str = "mp4") -> bool:
        """Export the processed video."""
        if not self.current_video:
            return False
            
        try:
            self.current_video.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile="temp-audio.m4a",
                remove_temp=True
            )
            return True
        except Exception as e:
            print(f"Error exporting video: {e}")
            return False
    
    def cleanup(self):
        """Clean up resources."""
        if self.current_video:
            self.current_video.close()
            self.current_video = None
        self.scenes = []
        self.frame_buffer = []
        self.scene_qualities = []
        self.scene_importances = []
        self.scene_continuities = []
        self.scene_motion_data = [] 