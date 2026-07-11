import uuid
import logging
import time
from datetime import datetime, UTC
from celery import shared_task

from backend.common.schemas.worker_envelope import WorkerEnvelope, WorkerSource
from backend.common.schemas.worker_outputs import MarketIntelligenceOutputs
from backend.common.tools.web_search import search_market_info
from backend.common.llm.inference import llm_structured

# Industry-grade logging setup
logger = logging.getLogger(__name__)

@shared_task(name="workers.market_worker.worker.run")
def run_market_worker(job_id: str, task_id: str, params: dict):
    """
    Market & Competitor Intelligence Worker.
    Refactored for robustness and observability.
    """
    start_time = time.perf_counter()
    job_uuid = uuid.UUID(job_id)
    task_uuid = uuid.UUID(task_id)

    molecule = params.get("molecule")
    if not molecule:
        logger.error(f"Job {job_id} failed: Missing 'molecule' in params")
        raise ValueError("Market Worker requires 'molecule' in params")

    logger.info(f"Starting market analysis for {molecule} (Job: {job_id})")

    try:
        # 1. Search for live data
        search_start = time.perf_counter()
        search_results = search_market_info(molecule)
        search_latency = (time.perf_counter() - search_start) * 1000
        
        # 2. Synthesize with LLM - Chain-of-Thought Prompt
        prompt = (
            f"You are a Senior Pharmaceutical Market Research Analyst.\n"
            f"Analyze the following search context for the molecule '{molecule}' to provide industry-grade market intelligence.\n\n"
            "RESEARCH GUIDELINES:\n"
            "1. QUANTIFY: Extract specific dollar amounts and percentages for market sizes (TAM, SAM, SOM) if available.\n"
            "2. COMPETITION: Identify specific company names and their relative market share or competitive advantage.\n"
            "3. TRENDS: Identity emerging therapeutic trends or regulatory shifts mentioned in the sources.\n"
            "4. CONFIDENCE: Assign a 'confidence_score' between 0.0 and 1.0 to each competitor and finding based on the reliability and cross-referencing of sources.\n\n"
            "CONTEXT DATA:\n"
            f"{search_results}\n\n"
            "TASK: Populate the MarketIntelligenceOutputs schema with granular, verified data."
        )
        
        outputs = llm_structured(
            prompt=prompt,
            schema=MarketIntelligenceOutputs,
            job_id=job_uuid,
            stage="market_analysis"
        )

        total_latency_ms = (time.perf_counter() - start_time) * 1000

        envelope = WorkerEnvelope(
            job_id= job_uuid,
            task_id= task_uuid,
            worker= "market_worker",
            status= "ok",
            confidence= 0.85,
            timestamp= datetime.now(UTC),
            outputs= outputs.model_dump(),
            sources= [
                WorkerSource(
                    type="web_search",
                    title=f"Market Intelligence Search for {molecule}",
                    uri="duckduckgo://search",
                    retrieved_at=datetime.now(UTC),
                    latency_ms=search_latency
                )
            ],
            metadata={
                "total_latency_ms": total_latency_ms,
                "celery_task_id": None
            },
            notes=f"Successfully synthesized market data for {molecule}."
        )

        logger.info(f"Completed market analysis for {molecule} in {total_latency_ms:.2f}ms")
        return envelope.model_dump(mode='json')

    except Exception as e:
        logger.exception(f"Critical error in market_worker for {molecule}: {str(e)}")
        # Return a failure envelope instead of just crashing Celery
        return WorkerEnvelope(
            job_id=job_uuid,
            task_id=task_uuid,
            worker="market_worker",
            status="error",
            confidence=0.0,
            timestamp=datetime.now(UTC),
            outputs={},
            notes=f"Error: {str(e)}"
        ).model_dump(mode='json')
