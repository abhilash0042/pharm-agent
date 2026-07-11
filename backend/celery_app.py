from celery import Celery
from dotenv import load_dotenv
import os


load_dotenv()

celery_app = Celery(
    "pharm_agent",
    broker="redis://127.0.0.1:6380/0",
    backend="redis://127.0.0.1:6380/1",
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