#!/bin/sh
# Start Celery worker in the background
celery -A backend.celery_app worker --loglevel=info &

# Start FastAPI via gunicorn in the foreground
exec gunicorn backend.master_agent.api.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000} --timeout 120 --graceful-timeout 30
