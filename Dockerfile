# Use official Python lightweight image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for FAISS/C++)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else (backend + precomputed artifacts + frontend dist)
# Note: frontend/dist should be built locally before Docker build
COPY . .

# Expose port (Cloud Run sets PORT env var)
ENV PORT=8080
EXPOSE $PORT

# Command to run the application using the PORT env var
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT}"]

