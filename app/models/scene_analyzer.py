import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from typing import List, Tuple, Dict
import numpy as np
from PIL import Image
import cv2
from sklearn.cluster import KMeans
from app.core.config import settings
from app.models.object_tracker import ObjectTracker

class SceneAnalyzer:
    def __init__(self):
        self.device = torch.device("cuda" if settings.USE_GPU and torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        self.object_tracker = ObjectTracker()
        
    def _load_model(self) -> nn.Module:
        """Load a pre-trained ResNet model for feature extraction."""
        model = models.resnet50(pretrained=True)
        # Remove the final classification layer
        model = nn.Sequential(*list(model.children())[:-1])
        model.eval()
        return model.to(self.device)
    
    def extract_features(self, frame: np.ndarray) -> np.ndarray:
        """Extract deep features from a frame."""
        # Convert frame to PIL Image
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(frame_rgb)
        
        # Transform and add batch dimension
        input_tensor = self.transform(pil_image).unsqueeze(0).to(self.device)
        
        # Extract features
        with torch.no_grad():
            features = self.model(input_tensor)
        
        # Flatten and convert to numpy
        return features.squeeze().cpu().numpy()
    
    def detect_scenes(self, frames: List[np.ndarray], threshold: float = 0.5) -> List[Tuple[int, int]]:
        """Detect scene changes using deep features."""
        if not frames:
            return []
        
        # Extract features for all frames
        features = [self.extract_features(frame) for frame in frames]
        
        # Calculate cosine similarity between consecutive frames
        scenes = []
        for i in range(len(features) - 1):
            similarity = np.dot(features[i], features[i + 1]) / (
                np.linalg.norm(features[i]) * np.linalg.norm(features[i + 1])
            )
            
            if similarity < threshold:
                scenes.append((i, i + 1))
        
        return scenes
    
    def analyze_scene_content(self, frame: np.ndarray) -> Dict[str, float]:
        """Analyze the content of a scene (e.g., motion, composition, lighting)."""
        # Convert to grayscale for motion analysis
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Calculate basic image statistics
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        # Calculate motion (using Laplacian variance)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        motion = np.var(laplacian)
        
        # Calculate composition score (rule of thirds)
        height, width = gray.shape
        thirds_h = height // 3
        thirds_w = width // 3
        
        # Check if important elements are near third points
        composition_score = 0.0
        for i in range(1, 3):
            for j in range(1, 3):
                region = gray[i*thirds_h:(i+1)*thirds_h, j*thirds_w:(j+1)*thirds_w]
                composition_score += np.mean(region)
        
        composition_score /= 4
        
        # Calculate color statistics
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        saturation = np.mean(hsv[:, :, 1])
        color_variance = np.var(hsv[:, :, 0])  # Hue variance
        
        return {
            "brightness": float(brightness),
            "contrast": float(contrast),
            "motion": float(motion),
            "composition_score": float(composition_score),
            "saturation": float(saturation),
            "color_variance": float(color_variance)
        }
    
    def get_keyframes(self, frames: List[np.ndarray], num_keyframes: int = 5) -> List[int]:
        """Select the most representative keyframes from the video."""
        if not frames:
            return []
        
        # Extract features for all frames
        features = [self.extract_features(frame) for frame in frames]
        
        # Calculate pairwise distances between frames
        distances = np.zeros((len(frames), len(frames)))
        for i in range(len(frames)):
            for j in range(i + 1, len(frames)):
                dist = np.linalg.norm(features[i] - features[j])
                distances[i, j] = dist
                distances[j, i] = dist
        
        # Use k-means clustering to select diverse keyframes
        kmeans = KMeans(n_clusters=min(num_keyframes, len(frames)), random_state=42)
        clusters = kmeans.fit_predict(distances)
        
        # Select frames closest to cluster centers
        keyframes = []
        for i in range(kmeans.n_clusters):
            cluster_frames = np.where(clusters == i)[0]
            center = kmeans.cluster_centers_[i]
            closest_frame = cluster_frames[np.argmin(distances[cluster_frames, center])]
            keyframes.append(closest_frame)
        
        return sorted(keyframes)
    
    def analyze_scene_quality(self, frame: np.ndarray) -> Dict[str, float]:
        """Analyze the technical quality of a scene."""
        # Calculate sharpness using Laplacian variance
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        sharpness = np.var(laplacian)
        
        # Calculate noise level
        noise = np.std(gray)
        
        # Calculate dynamic range
        dynamic_range = np.max(gray) - np.min(gray)
        
        # Calculate exposure (histogram analysis)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist.flatten() / hist.sum()
        exposure = np.sum(hist * np.arange(256)) / 255.0
        
        return {
            "sharpness": float(sharpness),
            "noise_level": float(noise),
            "dynamic_range": float(dynamic_range),
            "exposure": float(exposure)
        }
    
    def track_motion(self, frames: List[np.ndarray]) -> List[Dict[str, float]]:
        """Track motion between consecutive frames using object tracking."""
        if len(frames) < 2:
            return []
        
        motion_data = []
        for frame in frames:
            # Update object tracks
            track_info = self.object_tracker.update_tracks(frame)
            
            # Analyze motion patterns
            motion_patterns = self.object_tracker.analyze_motion_patterns(track_info)
            
            motion_data.append({
                "magnitude": motion_patterns["motion_complexity"],
                "direction": motion_patterns["motion_smoothness"],
                "variance": motion_patterns["object_interaction"],
                "num_objects": len(track_info)
            })
        
        return motion_data
    
    def calculate_scene_importance(self, frame: np.ndarray, motion_data: List[Dict[str, float]] = None) -> float:
        """Calculate the importance score of a scene."""
        # Get content analysis
        content = self.analyze_scene_content(frame)
        
        # Get quality analysis
        quality = self.analyze_scene_quality(frame)
        
        # Calculate base importance score
        importance = (
            content["composition_score"] * 0.2 +
            (content["contrast"] / 255) * 0.15 +
            (quality["sharpness"] / 1000) * 0.15 +
            (quality["dynamic_range"] / 255) * 0.15 +
            (1 - quality["noise_level"] / 255) * 0.1
        )
        
        # Adjust based on motion and object tracking if available
        if motion_data:
            # Calculate average motion metrics
            avg_motion = np.mean([m["magnitude"] for m in motion_data])
            avg_smoothness = np.mean([m["direction"] for m in motion_data])
            avg_interaction = np.mean([m["variance"] for m in motion_data])
            avg_objects = np.mean([m["num_objects"] for m in motion_data])
            
            # Adjust importance based on motion and object presence
            importance = importance * (
                1 + 0.2 * avg_motion +  # Motion complexity
                0.2 * avg_smoothness +  # Motion smoothness
                0.2 * avg_interaction +  # Object interaction
                0.1 * (avg_objects / 10)  # Number of objects (normalized)
            )
        
        return float(np.clip(importance, 0, 1))
    
    def analyze_scene_continuity(self, frames: List[np.ndarray]) -> Dict[str, float]:
        """Analyze the continuity between frames in a scene."""
        if len(frames) < 2:
            return {"continuity_score": 0.0, "motion_consistency": 0.0}
        
        # Track motion with object tracking
        motion_data = self.track_motion(frames)
        
        # Calculate motion consistency
        motion_directions = [m["direction"] for m in motion_data]
        direction_variance = np.var(motion_directions)
        motion_consistency = 1 / (1 + direction_variance)
        
        # Calculate object continuity
        object_counts = [m["num_objects"] for m in motion_data]
        object_continuity = 1 / (1 + np.var(object_counts))
        
        # Calculate overall continuity score
        continuity_score = (
            motion_consistency * 0.4 +
            object_continuity * 0.3 +
            (1 - np.mean([m["variance"] for m in motion_data])) * 0.3
        )
        
        return {
            "continuity_score": float(continuity_score),
            "motion_consistency": float(motion_consistency),
            "object_continuity": float(object_continuity)
        } 