import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from pathlib import Path
import torch
from app.core.config import settings

class ObjectTracker:
    def __init__(self):
        self.device = torch.device("cuda" if settings.USE_GPU and torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.tracker = cv2.TrackerCSRT_create
        self.active_tracks: Dict[int, cv2.Tracker] = {}
        self.track_history: Dict[int, List[Tuple[float, float]]] = {}
        self.next_track_id = 0
        
    def _load_model(self) -> cv2.dnn.Net:
        """Load YOLO model for object detection."""
        # Load YOLO model
        model_path = Path(settings.MODEL_CACHE_DIR) / "yolov3.weights"
        config_path = Path(settings.MODEL_CACHE_DIR) / "yolov3.cfg"
        
        # Download model if not exists
        if not model_path.exists():
            self._download_yolo_model()
        
        # Load the model
        net = cv2.dnn.readNet(str(model_path), str(config_path))
        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        
        return net
    
    def _download_yolo_model(self):
        """Download YOLO model files."""
        import urllib.request
        import os
        
        # Create model directory if it doesn't exist
        os.makedirs(settings.MODEL_CACHE_DIR, exist_ok=True)
        
        # Download weights and config
        urllib.request.urlretrieve(
            "https://pjreddie.com/media/files/yolov3.weights",
            str(Path(settings.MODEL_CACHE_DIR) / "yolov3.weights")
        )
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg",
            str(Path(settings.MODEL_CACHE_DIR) / "yolov3.cfg")
        )
    
    def detect_objects(self, frame: np.ndarray) -> List[Dict]:
        """Detect objects in a frame using YOLO."""
        height, width = frame.shape[:2]
        
        # Prepare image for YOLO
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
        
        # Run inference
        self.model.setInput(blob)
        layer_names = self.model.getLayerNames()
        output_layers = [layer_names[i - 1] for i in self.model.getUnconnectedOutLayers()]
        outputs = self.model.forward(output_layers)
        
        # Process detections
        detections = []
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                if confidence > 0.5:  # Confidence threshold
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    
                    x = int(center_x - w/2)
                    y = int(center_y - h/2)
                    
                    detections.append({
                        "bbox": (x, y, w, h),
                        "confidence": float(confidence),
                        "class_id": int(class_id)
                    })
        
        return detections
    
    def update_tracks(self, frame: np.ndarray) -> List[Dict]:
        """Update object tracks and return tracking information."""
        # Detect new objects
        detections = self.detect_objects(frame)
        
        # Update existing tracks
        active_tracks = {}
        track_info = []
        
        for track_id, tracker in self.active_tracks.items():
            success, bbox = tracker.update(frame)
            if success:
                active_tracks[track_id] = tracker
                self.track_history[track_id].append((bbox[0] + bbox[2]/2, bbox[1] + bbox[3]/2))
                
                track_info.append({
                    "track_id": track_id,
                    "bbox": bbox,
                    "history": self.track_history[track_id]
                })
        
        # Initialize new tracks
        for detection in detections:
            # Check if detection overlaps with existing tracks
            is_new = True
            for track_id in active_tracks:
                if self._calculate_iou(detection["bbox"], track_info[track_id]["bbox"]) > 0.3:
                    is_new = False
                    break
            
            if is_new:
                tracker = self.tracker()
                tracker.init(frame, detection["bbox"])
                active_tracks[self.next_track_id] = tracker
                self.track_history[self.next_track_id] = [(detection["bbox"][0] + detection["bbox"][2]/2,
                                                          detection["bbox"][1] + detection["bbox"][3]/2)]
                
                track_info.append({
                    "track_id": self.next_track_id,
                    "bbox": detection["bbox"],
                    "history": self.track_history[self.next_track_id]
                })
                self.next_track_id += 1
        
        # Update active tracks
        self.active_tracks = active_tracks
        
        return track_info
    
    def _calculate_iou(self, bbox1: Tuple[float, float, float, float],
                      bbox2: Tuple[float, float, float, float]) -> float:
        """Calculate Intersection over Union between two bounding boxes."""
        x1, y1, w1, h1 = bbox1
        x2, y2, w2, h2 = bbox2
        
        # Calculate intersection
        x_left = max(x1, x2)
        y_top = max(y1, y2)
        x_right = min(x1 + w1, x2 + w2)
        y_bottom = min(y1 + h1, y2 + h2)
        
        if x_right < x_left or y_bottom < y_top:
            return 0.0
        
        intersection_area = (x_right - x_left) * (y_bottom - y_top)
        
        # Calculate union
        bbox1_area = w1 * h1
        bbox2_area = w2 * h2
        union_area = bbox1_area + bbox2_area - intersection_area
        
        return intersection_area / union_area
    
    def analyze_motion_patterns(self, track_info: List[Dict]) -> Dict[str, float]:
        """Analyze motion patterns from track information."""
        if not track_info:
            return {
                "motion_complexity": 0.0,
                "motion_smoothness": 0.0,
                "object_interaction": 0.0
            }
        
        # Calculate motion complexity
        motion_vectors = []
        for track in track_info:
            history = track["history"]
            if len(history) >= 2:
                for i in range(1, len(history)):
                    dx = history[i][0] - history[i-1][0]
                    dy = history[i][1] - history[i-1][1]
                    motion_vectors.append((dx, dy))
        
        if motion_vectors:
            # Calculate motion complexity (variance in motion vectors)
            motion_complexity = np.var([np.sqrt(dx*dx + dy*dy) for dx, dy in motion_vectors])
            
            # Calculate motion smoothness (variance in direction changes)
            directions = [np.arctan2(dy, dx) for dx, dy in motion_vectors]
            direction_changes = np.diff(directions)
            motion_smoothness = 1 / (1 + np.var(direction_changes))
            
            # Calculate object interaction (proximity between objects)
            object_interaction = self._calculate_object_interaction(track_info)
            
            return {
                "motion_complexity": float(motion_complexity),
                "motion_smoothness": float(motion_smoothness),
                "object_interaction": float(object_interaction)
            }
        
        return {
            "motion_complexity": 0.0,
            "motion_smoothness": 0.0,
            "object_interaction": 0.0
        }
    
    def _calculate_object_interaction(self, track_info: List[Dict]) -> float:
        """Calculate the level of interaction between objects."""
        if len(track_info) < 2:
            return 0.0
        
        interactions = []
        for i, track1 in enumerate(track_info):
            for track2 in track_info[i+1:]:
                # Calculate minimum distance between object centers
                min_dist = float('inf')
                for pos1, pos2 in zip(track1["history"], track2["history"]):
                    dist = np.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)
                    min_dist = min(min_dist, dist)
                
                # Convert distance to interaction score (closer = higher interaction)
                interaction = 1 / (1 + min_dist/100)  # Normalize by typical frame size
                interactions.append(interaction)
        
        return float(np.mean(interactions)) if interactions else 0.0 