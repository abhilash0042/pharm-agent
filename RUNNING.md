# Run Pharm-Agent

The easiest way to start the development environment is to run the automated script:

```powershell
.\start_dev.bat
```

This will open separate terminal windows for:
1. Docker Infrastructure
2. Backend API
3. Celery Worker (Solo pool)
4. Frontend (React App)

---

## Manual Startup

If you prefer to run services manually, follow these steps:

### Terminal 1 (Infra)
```powershell
docker-compose up -d
```

### Terminal 2 (Backend)
```powershell
.\backend\venv\Scripts\activate
python -m uvicorn backend.master_agent.api.main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 3 (Worker)
```powershell
.\backend\venv\Scripts\activate
python -m celery -A backend.celery_app worker --loglevel=info -P solo
```

### Terminal 4 (Frontend)
```powershell
cd frontend/react-app
npm run dev
```
