# ──────────────────────────────────────────────────────────────
# NeuroStack Backend — Production Dockerfile
# FastAPI + Uvicorn + Celery (shared image, different CMD)
# ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

# Prevent Python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies required by asyncpg and bcrypt
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir "celery[redis]" redis eventlet httpx

# Copy application code
COPY . .

# Set PYTHONPATH so imports like `app.main` resolve correctly
ENV PYTHONPATH=/app

EXPOSE 8000

# Default: run the FastAPI server
# Override CMD in docker-compose for Celery worker
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
