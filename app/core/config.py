from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Editorist"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # File paths
    UPLOAD_DIR: Path = Path("uploads")
    OUTPUT_DIR: Path = Path("outputs")
    
    # Video processing settings
    MAX_VIDEO_SIZE: int = 500 * 1024 * 1024  # 500MB
    ALLOWED_VIDEO_TYPES: list = ["video/mp4", "video/quicktime", "video/x-msvideo"]
    DEFAULT_VIDEO_QUALITY: str = "high"
    
    # Scene detection settings
    SCENE_DETECTION_THRESHOLD: float = 30.0
    MIN_SCENE_DURATION: float = 1.0  # seconds
    
    # Color grading presets
    COLOR_GRADING_PRESETS: dict = {
        "cinematic": {
            "contrast": 1.1,
            "saturation": 1.2,
            "brightness": 1.05
        },
        "vibrant": {
            "contrast": 1.2,
            "saturation": 1.4,
            "brightness": 1.1
        },
        "muted": {
            "contrast": 1.05,
            "saturation": 0.9,
            "brightness": 1.0
        }
    }
    
    # Export settings
    EXPORT_FORMATS: dict = {
        "youtube": {
            "resolution": "1920x1080",
            "fps": 30,
            "bitrate": "8000k"
        },
        "instagram": {
            "resolution": "1080x1920",
            "fps": 30,
            "bitrate": "4000k"
        },
        "tiktok": {
            "resolution": "1080x1920",
            "fps": 30,
            "bitrate": "4000k"
        }
    }
    
    # AI model settings
    USE_GPU: bool = True
    MODEL_CACHE_DIR: Optional[Path] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings object
settings = Settings()

# Create necessary directories
settings.UPLOAD_DIR.mkdir(exist_ok=True)
settings.OUTPUT_DIR.mkdir(exist_ok=True)
if settings.MODEL_CACHE_DIR:
    settings.MODEL_CACHE_DIR.mkdir(exist_ok=True) 