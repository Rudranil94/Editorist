# Stage 1: Build the frontend
FROM node:20-alpine as frontend

# Set working directory
WORKDIR /build

# Copy package files first
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY frontend/ .

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
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and config
COPY app/ ./app/
COPY config/ ./config/

# Create necessary directories with proper permissions
RUN mkdir -p /app/uploads /app/logs /app/static && \
    chmod -R 755 /app/uploads /app/logs /app/static

# Copy built frontend from frontend stage
COPY --from=frontend /build/dist /app/static

# Set environment variables
ENV PYTHONPATH=/app \
    FLASK_APP=app \
    FLASK_ENV=production \
    PORT=8000 \
    PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run the application with proper logging
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "app:create_app()"] 