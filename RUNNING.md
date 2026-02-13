# How to Run Pharm-Agent

This guide details the steps to run the Pharm-Agent application, including Docker infrastructure, Backend, Celery, and Frontend.

## Prerequisites
- **Docker Desktop** (must be running)
- **Python 3.10+**
- **Node.js 18+**

## 1. Infrastructure (Docker)
Start the required services (Redis, PostgreSQL, MinIO) using Docker Compose.

```bash
# In the root directory (c:\Users\Shiva\pharm-agent)
docker-compose up -d
```

## 2. Backend (FastAPI)
The backend requires a Python virtual environment.

### Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Run migrations
python -m alembic -c alembic.ini upgrade head
```

### Run FastAPI Server
```bash
# In the root directory (c:\Users\Shiva\pharm-agent)
backend\venv\Scripts\python -m uvicorn backend.master_agent.api.main:app --reload --host 127.0.0.1 --port 8000
```

## 3. Celery Worker (Task Queue)
The Celery worker processes background research tasks. It must be running for research to start.

```bash
# In the root directory (c:\Users\Shiva\pharm-agent)
# Note: Use '-P solo' or '-P threads' on Windows to avoid issues
backend\venv\Scripts\python -m celery -A backend.celery_app worker --loglevel=info -P solo
```

## 4. Frontend (React)
The frontend is a Vite + React application.

### Setup
```bash
cd frontend/react-app
npm install
```

### Run Development Server
```bash
# In frontend/react-app directory
npm run dev
```

## Troubleshooting
- **Research Won't Start**:
  - Ensure the **Celery Worker** is running.
  - Check the **FastAPI** console for errors.
  - Verify **Docker** containers are up (`docker ps`).
- **Windows Issues**:
  - If Celery fails, ensure you are using `-P solo` or `-P threads`.
  - If `orjson` fails to install, ensure you have the Visual Studio C++ Build Tools or use a pre-built wheel.
