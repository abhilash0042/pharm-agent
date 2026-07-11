import logging

from backend.celery_app import celery_app
import uuid
import uuid6
from datetime import datetime, UTC
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.master_agent.models.job import Job
from backend.workers.market_worker.worker import run_market_worker
# NEW: Import other workers
from backend.workers.clinical_trials.worker import run_clinical_trials_worker
from backend.workers.patent_worker.worker import run_patent_worker
from backend.workers.report.worker import run_report_worker
from backend.master_agent.synthesis.engine import run_synthesis

from backend.common.schemas.worker_outputs import ClinicalTrialsOutputs, MarketIntelligenceOutputs
from backend.common.schemas.canonical_result import CanonicalResult, PatentOutputs

logger = logging.getLogger(__name__)

def _update_job_status(job_id: uuid.UUID, status: str, result: dict | None = None):
    db: Session = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = status
            if result:
                job.canonical_result = result
            if status == "completed":
                job.completed_at = datetime.now(UTC)
            db.commit()
    finally:
        db.close()

@celery_app.task(name="orchestration.conductor.run_research_workflow")
def run_research_workflow(job_id_str: str, molecule: str):
    """
    The Main Conductor.
    Executes the Prototype Flow: Clinical -> Patent -> Market -> Synthesis -> Report
    """
    logger.info(f"[Conductor] Starting Job {job_id_str} for {molecule}")
    job_uuid = uuid.UUID(job_id_str)
    
    # 1. Update Status
    _update_job_status(job_uuid, "running_clinical_trials")

    try:
        # 2. Run Clinical Trials Worker
        logger.info("[Conductor] Running Clinical Trials Worker...")
        ct_task_id = str(uuid6.uuid7())
        ct_result_raw = run_clinical_trials_worker(
            job_id=job_id_str,
            task_id=ct_task_id,
            params={"molecule": molecule}
        )
        ct_outputs = ClinicalTrialsOutputs.model_validate(ct_result_raw["outputs"])
        logger.info(f"[Conductor] Clinical Trials Found: {len(ct_outputs.trials)}")

        # 3. Run Patent Worker
        _update_job_status(job_uuid, "running_patents")
        logger.info("[Conductor] Running Patent Worker...")
        pat_task_id = str(uuid6.uuid7())
        pat_result_raw = run_patent_worker(
            job_id=job_id_str,
            task_id=pat_task_id,
            params={"molecule": molecule}
        )
        pat_outputs = PatentOutputs.model_validate(pat_result_raw["outputs"])
        logger.info(f"[Conductor] Patents Found: {len(pat_outputs.patents)}")

        # 4. Run Market Intelligence Worker
        _update_job_status(job_uuid, "running_market_intelligence")
        logger.info("[Conductor] Running Market Intelligence Worker...")
        market_task_id = str(uuid6.uuid7())
        market_result_raw = run_market_worker(
            job_id=job_id_str,
            task_id=market_task_id,
            params={"molecule": molecule}
        )
        market_outputs = MarketIntelligenceOutputs.model_validate(market_result_raw["outputs"])

        # 5. Run Synthesis (LLM)
        _update_job_status(job_uuid, "running_synthesis")
        logger.info("[Conductor] Running Synthesis Engine...")
        canonical_result: CanonicalResult = run_synthesis(
            job_id=job_uuid,
            molecule=molecule,
            ct_outputs=ct_outputs,
            pat_outputs=pat_outputs,
            market_outputs=market_outputs
        )
        logger.info(f"[Conductor] Synthesis Complete. Confidence: {canonical_result.confidence_overall}")

        # 6. Save Synthesis Result to DB
        _update_job_status(job_uuid, "generating_report", result=canonical_result.model_dump())

        # 7. Run Report Worker
        logger.info("[Conductor] Generating PDF/PPT artifacts...")
        rep_task_id = str(uuid6.uuid7())
        rep_result_raw = run_report_worker(
            job_id=job_id_str,
            task_id=rep_task_id,
            params={"canonical_result": canonical_result.model_dump()}
        )
        logger.info("[Conductor] Report Generation Complete.")

        # 8. Final Completion
        _update_job_status(job_uuid, "completed")
        logger.info(f"[Conductor] Job {job_id_str} Finished Successfully.")

    except Exception as e:
        logger.exception(f"[Conductor] Job Failed: {e}")
        _update_job_status(job_uuid, "failed")
        raise e

