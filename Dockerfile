# Stage 1: Build the frontend
FROM node:20-alpine as frontend
WORKDIR /frontend

# Copy the entire frontend directory
COPY frontend/ .

# Install dependencies and build
RUN npm install
RUN npm run build

# Stage 2: Build the backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and config
COPY app/ ./app/
COPY config/ ./config/

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs /app/static

# Copy built frontend from frontend stage
COPY --from=frontend /frontend/dist /app/static

# Set environment variables
ENV PYTHONPATH=/app
ENV FLASK_APP=app
ENV FLASK_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:create_app()"] 