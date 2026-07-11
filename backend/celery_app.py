from celery import Celery
from dotenv import load_dotenv
import os


load_dotenv()

# Read Redis URL from environment; fall back to local Docker for dev
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6380/0")
# Use a separate DB index for the result backend
REDIS_BACKEND = REDIS_URL.rstrip("/0123456789") + "/1" if REDIS_URL else "redis://127.0.0.1:6380/1"

celery_app = Celery(
    "pharm_agent",
    broker=REDIS_URL,
    backend=REDIS_BACKEND,
    include=[
        "backend.master_agent.orchestration.conductor",
        "backend.workers.clinical_trials.worker",
        "backend.workers.report.worker",
        "backend.workers.patent_worker.worker",
        "backend.workers.market_worker.worker"
    ]
)

# queue routing
celery_app.conf.update(
    # task_routes={
    #     "workers.clinical_trials.worker.*": {"queue": "clinical_trials"},
    #     "workers.report.worker.*": {"queue": "report"},
    #     "orchestration.conductor.*": {"queue": "orchestrator"},
    # },
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)