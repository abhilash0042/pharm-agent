FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for psycopg2, matplotlib, and reportlab
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy the backend source code INTO a 'backend' package directory
# This preserves the 'backend.*' module namespace used throughout the codebase
COPY backend /app/backend/

# Expose API port
EXPOSE 8000

# Default command runs the API via gunicorn for production stability
CMD ["gunicorn", "backend.master_agent.api.main:app", \
     "-w", "2", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--graceful-timeout", "30"]
