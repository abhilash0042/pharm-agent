from fastapi import Request, HTTPException, status
from dotenv import load_dotenv
import os


load_dotenv()

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise RuntimeError("Missing required environment variable: API_KEY")

WORKER_TOKEN = os.getenv("WORKER_TOKEN")
if not WORKER_TOKEN:
    raise RuntimeError("Missing required environment variable: WORKER_TOKEN")

async def verify_api_key(request: Request):
    """
    For user-facing endpoints:
        - /api/research
        - /api/research/{job_id}/status

    Requires header: X-API-Key: <API_KEY>
    """
    key = request.headers.get("X-API-Key")
    if key != API_KEY:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
async def verify_worker_token(request: Request):
    """
    For internal worker callbacks:
        - /internal/task/{task_id}/complete
    
    Requires header: X-Worker-Token: <WORKER_TOKEN>
    """

    token = request.headers.get("X-Worker-Token")
    if token != WORKER_TOKEN:
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail="Invalid worker token"
        )