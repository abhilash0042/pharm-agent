FROM python:3.12-slim

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

# Copy and make the startup script executable
COPY backend/start.sh /app/backend/start.sh
RUN chmod +x /app/backend/start.sh

# Default command runs both Celery and FastAPI
CMD ["/app/backend/start.sh"]
