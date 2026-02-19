<#
.SYNOPSIS
    Starts the Pharm-Agent development environment.
    Runs Docker containers, Backend API, Celery Worker, and Frontend React App.

.DESCRIPTION
    This script automates the startup of the Pharm-Agent development stack.
    It performs the following:
    1. Runs 'docker-compose up -d' for infrastructure.
    2. Opens a new PowerShell window for the Backend API (Uvicorn).
    3. Opens a new PowerShell window for the Celery Worker.
    4. Opens a new PowerShell window for the Frontend (npm run dev).
#>

$ErrorActionPreference = "Stop"

Write-Host "Starting Pharm-Agent Development Environment..." -ForegroundColor Cyan

# Ensure we are in the script's directory
$Root = $PSScriptRoot
Set-Location $Root

# 1. Start Infrastructure (Docker)
Write-Host "1. Starting Docker Infrastructure..."
try {
    docker-compose up -d
} catch {
    Write-Host "Error starting Docker Compose. Ensure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

# Define path to Python executable in venv
$VenvPython = Join-Path $Root "backend\venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "Error: Virtual environment python not found at: $VenvPython" -ForegroundColor Red
    Write-Host "Please ensure you have set up the backend environment in 'backend\venv'."
    exit 1
}

# 2. Start Backend API
Write-Host "2. Starting Backend API..."
$BackendCmd = "& '$VenvPython' -m uvicorn backend.master_agent.api.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$host.ui.RawUI.WindowTitle = 'Pharm-Agent Backend'; $BackendCmd }"

# 3. Start Celery Worker
Write-Host "3. Starting Celery Worker..."
$WorkerCmd = "& '$VenvPython' -m celery -A backend.celery_app worker --loglevel=info -P solo"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$host.ui.RawUI.WindowTitle = 'Pharm-Agent Worker'; $WorkerCmd }"

# 4. Start Frontend
Write-Host "4. Starting Frontend..."
$FrontendDir = Join-Path $Root "frontend\react-app"
if (Test-Path $FrontendDir) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { `$host.ui.RawUI.WindowTitle = 'Pharm-Agent Frontend'; Set-Location '$FrontendDir'; npm run dev }"
} else {
    Write-Host "Warning: Frontend directory not found at $FrontendDir" -ForegroundColor Yellow
}

Write-Host "All services launched!" -ForegroundColor Green
Write-Host "Check the new PowerShell windows for logs." -ForegroundColor Gray
