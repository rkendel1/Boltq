# Dockerfile for Magoc Workflow Extensions
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Install the package
RUN pip install -e .

# Expose the port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["uvicorn", "magoc_workflow_extensions.api:app", "--host", "0.0.0.0", "--port", "8000"]
