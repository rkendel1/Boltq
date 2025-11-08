# Magoc Workflow Extensions

Python backend for AI-powered API workflow generation. This package provides the backend services that power the Boltq application's workflow generation capabilities.

## Features

- **Natural Language to Workflow**: Convert plain English descriptions into executable API workflows
- **Flow Suggestions**: Analyze APIs and suggest practical workflows automatically  
- **Pattern Learning**: Learn from reference workflows to improve future generations
- **Auto-Building**: Automatically construct complete workflows from suggestions and patterns

## Architecture

This backend is designed to work with the [Boltq](https://github.com/rkendel1/Boltq) Next.js frontend and integrates with the [Magoc](https://github.com/rkendel1/Magoc) API evaluation toolkit.

### Services

- `WorkflowGenerator`: Generates workflows from natural language descriptions
- `FlowSuggester`: Suggests workflows based on API endpoint analysis
- `PatternLearner`: Extracts reusable patterns from reference workflows
- `AutoBuilder`: Constructs complete workflows using learned patterns

## Installation

### For Development

```bash
# Clone the repository
git clone https://github.com/rkendel1/Boltq.git
cd Boltq/magoc-backend

# Install in development mode
pip install -e .
```

### For Production

```bash
pip install -r requirements.txt
```

## Configuration

Set the required environment variable:

```bash
export OPENAI_API_KEY=your-openai-api-key
```

## Running the Server

### Development

```bash
# Using uvicorn directly
uvicorn magoc_workflow_extensions.api:app --reload --port 8000

# Or using Python
python -m magoc_workflow_extensions.api
```

### Production

```bash
uvicorn magoc_workflow_extensions.api:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### POST `/api/workflows/generate-from-nl`

Generate a workflow from a natural language description.

**Request:**
```json
{
  "description": "Create a user and send welcome email",
  "endpoints": [...],
  "specId": "api-spec-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflow": {...},
    "explanation": "...",
    "aiReasoning": [...]
  }
}
```

### POST `/api/workflows/suggest-flows`

Suggest workflows based on API analysis.

**Request:**
```json
{
  "endpoints": [...],
  "specId": "api-spec-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestedFlows": [...],
    "apiSummary": "...",
    "specId": "..."
  }
}
```

### POST `/api/workflows/learn-pattern`

Learn patterns from a reference workflow.

**Request:**
```json
{
  "referenceWorkflow": {...},
  "referenceEndpoints": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patterns": {...},
    "confidence": 0.95
  }
}
```

### POST `/api/workflows/auto-build-flows`

Auto-build workflows using learned patterns.

**Request:**
```json
{
  "suggestedFlows": [...],
  "learnedPatterns": {...},
  "endpoints": [...],
  "specId": "api-spec-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflows": [...]
  }
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "magoc-workflow-extensions"
}
```

## Integration with Next.js Frontend

The Next.js frontend should configure the backend URL:

```bash
# .env
NEXT_PUBLIC_MAGOC_BACKEND_URL=http://localhost:8000
```

The frontend's API routes act as thin proxies to this backend, handling authentication and request validation before forwarding to these endpoints.

## Docker Deployment

### Build

```bash
docker build -t magoc-workflow-extensions .
```

### Run

```bash
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your-key \
  magoc-workflow-extensions
```

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

## Integration with Magoc

This backend is designed to be drag-and-dropped into the [Magoc repository](https://github.com/rkendel1/Magoc) for seamless integration with the MCP toolkit.

Simply copy the `magoc-backend` directory into your Magoc installation and follow the setup instructions above.

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **OpenAI**: AI model integration for workflow generation
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server implementation

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please ensure that:

1. Code follows Python PEP 8 style guidelines
2. All services have proper error handling
3. API endpoints return consistent response formats
4. Changes are tested before submission

## Support

For issues and questions:
- GitHub Issues: https://github.com/rkendel1/Boltq/issues
- Documentation: See `/docs` in the main repository

## Changelog

### Version 1.0.0 (2025-11-08)
- Initial release
- Workflow generation from natural language
- Flow suggestion based on API analysis
- Pattern learning from reference workflows
- Auto-building workflows with learned patterns
