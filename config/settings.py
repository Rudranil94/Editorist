import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
DEBUG = os.getenv('FLASK_ENV', 'production') == 'development'

# Database settings
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/editorist')

# Video processing settings
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB
ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

# Redis settings
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

# API settings
API_PREFIX = '/api/v1'
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# Storage settings
STORAGE_TYPE = os.getenv('STORAGE_TYPE', 'local')  # 'local' or 's3'
S3_BUCKET = os.getenv('S3_BUCKET')
S3_REGION = os.getenv('S3_REGION')
S3_ACCESS_KEY = os.getenv('S3_ACCESS_KEY')
S3_SECRET_KEY = os.getenv('S3_SECRET_KEY') 