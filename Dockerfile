# Stage 1: Build the frontend
FROM node:20-alpine as frontend

# Set working directory
WORKDIR /build

# Copy the entire frontend directory
COPY frontend .

# Install dependencies
RUN npm ci

# Build the frontend
RUN npm run build

# Stage 2: Build the backend
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    imagemagick \
    wget \
    libopencv-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and config
COPY app/ ./app/
COPY config/ ./config/

# Create necessary directories and download models
RUN mkdir -p /app/uploads /app/logs /app/static /app/models/cache && \
    chmod -R 755 /app/uploads /app/models/cache && \
    wget --no-verbose -O /app/models/cache/yolov3.weights https://pjreddie.com/media/files/yolov3.weights && \
    wget --no-verbose -O /app/models/cache/yolov3.cfg https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg

# Copy built frontend from frontend stage
COPY --from=frontend /build/dist /app/static

# Set environment variables
ENV PYTHONPATH=/app \
    FLASK_APP=app \
    FLASK_ENV=production \
    PORT=8000 \
    PYTHONUNBUFFERED=1 \
    MALLOC_TRIM_THRESHOLD_=100000

# Expose port
EXPOSE 8000

# Run the application with proper logging
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120", "--max-requests", "1000", "--max-requests-jitter", "50", "--access-logfile", "-", "--error-logfile", "-", "app.main:app"]