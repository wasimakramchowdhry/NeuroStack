from celery import Celery
import os
import sys

# Add the backend folder to the python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from app.config import settings

# Initialize Celery app with Redis broker
celery_app = Celery(
    "neurostack_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL.replace("/0", "/1") # Use DB 1 for results
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Auto-discover tasks in all installed apps
celery_app.autodiscover_tasks(["app.tasks.translation_tasks"])
