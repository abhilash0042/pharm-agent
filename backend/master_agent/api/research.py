import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, ORJSONResponse
import uuid6
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from .auth import verify_api_key
from backend.database import SessionLocal
from backend.master_agent.models.job import Job
from backend.common.schemas.api_requests import ResearchRequest


from backend.master_agent.orchestration.conductor import run_research_workflow


router = APIRouter()

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.post("/api/research", dependencies=[Depends(verify_api_key)])
async def create_research_job(
    request: ResearchRequest,
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Creating job for {request.molecule}...")
        job = Job(
            id=uuid6.uuid7(),
            prompt_original=request.prompt,
            prompt_normalized=request.prompt,
            molecule=request.molecule,
            status="queued"
        )

        db.add(job)
        db.commit()
        db.refresh(job)

        # Trigger workflow
        logger.info(f"Triggering workflow for {job.id}")
        run_research_workflow.delay(str(job.id), request.molecule)

        return {"job_id": str(job.id)}
    except Exception as e:
        logger.exception(f"Failed to create research job: {e}")
        return ORJSONResponse(
            status_code=500,
            content={"error": "Failed to create research job. Please try again."}
        )

@router.get("/api/research/{job_id}/status", dependencies=[Depends(verify_api_key)])
async def get_research_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(404, "Job not found")
    return {
        "job_id": str(job.id),
        "status": job.status,
        "canonical_result": job.canonical_result,
        "created_at": job.created_at
    }

@router.get("/api/jobs", dependencies=[Depends(verify_api_key)])
async def get_all_jobs(db: Session = Depends(get_db)):
    # Fetch all jobs, ordered by creation time descending
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    
    return [
        {
            "job_id": str(j.id),
            "molecule": j.molecule,
            "status": j.status,
            "created_at": j.created_at
        }
        for j in jobs
    ]

from fastapi.responses import StreamingResponse
from backend.common.storage.minio_client import minio_client

@router.get("/api/research/{job_id}/download/{file_type}")
async def download_artifact(job_id: str, file_type: str, api_key: str | None = None, request: Request = None):
    # Support auth via query param (?api_key=) for browser direct downloads,
    # or via X-API-Key header for programmatic access
    from .auth import API_KEY
    header_key = request.headers.get("X-API-Key") if request else None
    if api_key != API_KEY and header_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    if file_type not in ["pdf", "ppt"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Use 'pdf' or 'ppt'.")

    # mapped filename convention from report/worker.py
    object_name = f"{job_id}_report.pdf" if file_type == "pdf" else f"{job_id}_slides.pptx"
    content_type = "application/pdf" if file_type == "pdf" else "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    
    try:
        # Proxy stream from MinIO
        data_stream = minio_client.get_object("artifacts", object_name)
        return StreamingResponse(
            data_stream,
            media_type=content_type,
            headers={"Content-Disposition": f'attachment; filename="{object_name}"'}
        )
    except Exception as e:
        print(f"Download error: {e}")
        raise HTTPException(status_code=404, detail="Artifact not found. Research might still be processing.")