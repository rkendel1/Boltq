# Magoc Backend Integration Guide

This guide explains how to integrate the Magoc (automagik-tools) backend with the Boltq frontend for OpenAPI-based workflow creation.

## Overview

The integration connects:
- **Magoc Backend**: Python-based MCP server that processes OpenAPI specifications
- **Boltq Frontend**: Next.js conversational interface for building API workflows

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│                     │         │                      │         │                 │
│  Boltq Frontend     │────────▶│  Backend Service     │────────▶│  Magoc Backend  │
│  (Next.js)          │         │  (backendService.ts) │         │  (Python MCP)   │
│                     │         │                      │         │                 │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
         │                                                                │
         │                                                                │
         ▼                                                                ▼
┌─────────────────────┐                                      ┌─────────────────┐
│                     │                                      │                 │
│  Convex Backend     │                                      │  OpenAPI Specs  │
│  (Database)         │                                      │  (Dynamic)      │
│                     │                                      │                 │
└─────────────────────┘                                      └─────────────────┘
```

## Setup Instructions

### 1. Start the Magoc Backend

The Magoc backend needs to be running to process OpenAPI specifications. You can run it using:

```bash
# Using uvx (recommended - no installation)
uvx automagik-tools@latest serve --tool genie --transport sse --port 8000

# Or using pip
pip install automagik-tools
automagik-tools serve --tool genie --transport sse --port 8000
```

### 2. Configure Environment Variables

Add the backend URL to your `.env` file:

```bash
# Magoc Backend Integration
NEXT_PUBLIC_MAGOC_BACKEND_URL=http://localhost:8000
MAGOC_API_KEY=your-api-key-if-required
```

### 3. Start the Boltq Frontend

```bash
npm install
npm run dev
```

### 4. Access the OpenAPI Builder

Once logged in, navigate to the "API Builder" link in the header or go directly to:
```
http://localhost:3000/openapi-builder
```

## Using the OpenAPI Builder

### Step 1: Upload an OpenAPI Specification

You can provide an OpenAPI spec in two ways:

1. **From URL**: Enter the URL of a public OpenAPI specification
   ```
   https://api.github.com/openapi.json
   https://petstore3.swagger.io/api/v3/openapi.json
   ```

2. **From File**: Upload a local JSON or YAML file containing your OpenAPI spec

### Step 2: Browse Available Endpoints

Once uploaded, the system will:
- Parse the OpenAPI specification
- Extract all available endpoints
- Display them with their HTTP methods, paths, and descriptions
- Allow you to select endpoints for workflow creation

### Step 3: Create Conversational Workflows

Select the endpoints you want to include in your workflow, then:
1. Give your workflow a name
2. Add a description
3. Write a conversational prompt describing how you want to interact with it
4. Save the workflow

### Step 4: Use Workflows in Chat

The workflows you create can be accessed and executed through the conversational interface in your workspace.

## API Integration Points

### Backend Service Client

The `backendService.ts` provides these methods:

```typescript
// Upload/Parse OpenAPI specs
await backendService.uploadOpenAPISpec(spec);
await backendService.parseOpenAPIFromUrl(url);

// Get endpoint information
await backendService.getAPIEndpoints(specId);
await backendService.getEndpointDetails(specId, endpointId);

// Workflow management
await backendService.createWorkflow(workflow);
await backendService.getWorkflows();
await backendService.executeWorkflow(workflowId, inputs);

// Test endpoints
await backendService.testEndpoint(specId, endpointId, parameters);
```

### Convex Database Schema

The integration stores data in Convex:

**apiSpecs table**:
- `specId`: Unique identifier for the spec
- `name`: API name
- `version`: API version
- `spec`: Full OpenAPI specification object
- `user`: Reference to the user who uploaded it

**apiWorkflows table**:
- `workflowId`: Unique workflow identifier
- `name`: Workflow name
- `description`: What the workflow does
- `steps`: Array of workflow steps with endpoint references
- `user`: Owner of the workflow
- `workspace`: Optional workspace association

## Example: GitHub API Workflow

1. **Upload Spec**:
   ```
   URL: https://api.github.com/openapi.json
   ```

2. **Select Endpoints**:
   - GET /repos/{owner}/{repo}
   - GET /repos/{owner}/{repo}/issues
   - POST /repos/{owner}/{repo}/issues

3. **Create Workflow**:
   ```
   Name: GitHub Issue Manager
   Description: Manage issues for a repository
   Prompt: "Help me view and create issues for my repositories"
   ```

4. **Use in Chat**:
   ```
   You: "Show me issues for my project"
   AI: [Uses GitHub Issue Manager workflow to fetch and display issues]
   ```

## Magoc Backend Features

The Magoc backend (automagik-tools) provides:

- **Dynamic Tool Generation**: Converts OpenAPI specs into MCP tools automatically
- **Multiple Transports**: Supports stdio, SSE, and HTTP
- **AI Processing**: Uses GPT models to create human-friendly tool names
- **Genie Orchestrator**: Can coordinate multiple MCP servers
- **Memory**: Persistent storage for learning user patterns

## Troubleshooting

### Backend Connection Issues

If you can't connect to the Magoc backend:

1. Check that the backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Verify the backend URL in `.env`:
   ```
   NEXT_PUBLIC_MAGOC_BACKEND_URL=http://localhost:8000
   ```

3. Check CORS settings if running on different domains

### OpenAPI Spec Upload Failures

If spec upload fails:

1. Validate your OpenAPI spec using [Swagger Editor](https://editor.swagger.io/)
2. Ensure the spec is in JSON format (YAML support coming soon)
3. Check that the URL is publicly accessible

### Workflow Execution Issues

If workflows don't execute:

1. Verify the Magoc backend is running
2. Check that the workflow steps reference valid endpoints
3. Review browser console for error messages

## Next Steps

- [ ] Add real-time workflow execution status
- [ ] Implement workflow parameter mapping UI
- [ ] Add workflow testing interface
- [ ] Support for YAML OpenAPI specs
- [ ] Workflow templates for common patterns
- [ ] Integration with existing chat prompts

## Resources

- [Magoc Repository](https://github.com/rkendel1/Magoc)
- [automagik-tools Documentation](https://github.com/namastexlabs/automagik-tools)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
