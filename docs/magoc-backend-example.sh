# Example Magoc Backend Configuration

# This file demonstrates how to configure the Magoc backend for local development
# Copy this to a shell script and run it to start the backend with proper configuration

#!/bin/bash

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key-here"  # Required for AI processing
export MAGOC_PORT=8000

# Option 1: Run with uvx (no installation required)
echo "Starting Magoc backend with uvx..."
uvx automagik-tools@latest serve \
  --tool genie \
  --transport sse \
  --port $MAGOC_PORT

# Option 2: Run with pip (if installed globally)
# pip install automagik-tools
# automagik-tools serve --tool genie --transport sse --port $MAGOC_PORT

# The backend will be available at:
# http://localhost:8000

# Health check endpoint:
# http://localhost:8000/health

# For SSE transport (recommended for team sharing):
# http://localhost:8000/sse
