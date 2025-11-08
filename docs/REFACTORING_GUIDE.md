# Refactoring Guide: Delegating to Magoc Backend

## Overview

This guide provides step-by-step instructions for refactoring the current implementation to properly leverage the Magoc Python backend for API spec evaluation and workflow generation.

## Current Problem

Currently, AI-powered workflow generation logic is implemented directly in Next.js API routes, bypassing the specialized Magoc backend. This creates:

- **600+ lines** of duplicate AI logic in Next.js
- **4 separate OpenAI integrations** that could be unified
- **Complex prompt engineering** scattered across multiple files
- **Underutilized Python backend** designed specifically for this work

## Step 1: Identify What Needs to Change

### Files Currently Doing Too Much (Next.js)

1. `/app/api/workflows/generate-from-nl/route.ts` (187 lines)
   - Currently: Makes direct OpenAI calls for workflow generation
   - Should: Proxy to Magoc backend

2. `/app/api/workflows/suggest-flows/route.ts` (169 lines)
   - Currently: Uses OpenAI to analyze API and suggest workflows
   - Should: Proxy to Magoc backend

3. `/app/api/workflows/learn-pattern/route.ts` (161 lines)
   - Currently: Uses OpenAI to learn patterns from workflows
   - Should: Proxy to Magoc backend

4. `/app/api/workflows/auto-build-flows/route.ts` (190 lines)
   - Currently: Uses OpenAI to auto-build workflows
   - Should: Proxy to Magoc backend

### Files That Need Enhancement (Backend Service)

1. `/lib/services/backendService.ts`
   - Currently: Has method stubs that don't actually call Magoc
   - Should: Actually delegate to Magoc backend

## Step 2: Create New Magoc Backend Endpoints

### 2.1 Setup Magoc Backend Extensions

Create a new file in the Magoc repository: `extensions/boltq_workflows.py`

```python
"""
Boltq Workflow Generation Extensions for Magoc
Provides API spec evaluation and workflow generation capabilities
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from openai import OpenAI
import json

# Pydantic models for type safety
class APIEndpoint(BaseModel):
    id: str
    method: str
    path: str
    summary: Optional[str] = None
    description: Optional[str] = None
    parameters: Optional[List[Dict[str, Any]]] = None

class WorkflowStep(BaseModel):
    id: str
    endpoint_id: str
    order: int
    reasoning: str
    parameters: Dict[str, Any] = {}
    conditional_logic: Optional[Dict[str, Any]] = None

class Workflow(BaseModel):
    name: str
    description: str
    steps: List[WorkflowStep]
    spec_id: str

class WorkflowGenerationRequest(BaseModel):
    description: str
    spec_id: str
    endpoints: List[APIEndpoint]
    context: Optional[Dict[str, Any]] = None

class WorkflowGenerationResponse(BaseModel):
    workflow: Workflow
    explanation: str
    ai_reasoning: List[Dict[str, str]]

# OpenAI client (configured via environment variable)
client = OpenAI()

def generate_workflow_from_nl(request: WorkflowGenerationRequest) -> WorkflowGenerationResponse:
    """
    Generate a workflow from natural language description
    This is the core AI-powered workflow generation capability
    """
    
    # Build system prompt for workflow generation
    system_prompt = """You are an API workflow expert. Given a natural language description 
    of a desired flow or outcome, analyze which API endpoints should be used and in what order.

    Your task is to:
    1. Understand the user's intent from their natural language description
    2. Select the most relevant endpoints from the available list
    3. Determine the optimal order to call these endpoints
    4. Provide parameter mappings and dependencies between steps

    Return your response as a JSON object with this structure:
    {
      "workflowName": "A clear name for this workflow",
      "workflowDescription": "A brief description of what this workflow does",
      "selectedEndpoints": [
        {
          "endpointId": "the endpoint ID",
          "order": 0,
          "reasoning": "why this endpoint was chosen and placed at this position",
          "parameters": {"paramName": "description of what value should be provided"},
          "dependsOn": ["list of previous step IDs this depends on"]
        }
      ],
      "explanation": "A detailed explanation of the workflow logic and data flow"
    }"""
    
    # Format endpoints for the prompt
    endpoints_list = "\n\n---\n\n".join([
        f"ID: {ep.id}\n"
        f"Method: {ep.method}\n"
        f"Path: {ep.path}\n"
        f"Summary: {ep.summary or 'N/A'}\n"
        f"Description: {ep.description or 'N/A'}\n"
        f"Parameters: {', '.join([f\"{p.get('name')} ({p.get('in')}, {'required' if p.get('required') else 'optional'})\" for p in (ep.parameters or [])]) or 'None'}"
        for ep in request.endpoints
    ])
    
    user_prompt = f"""User's desired flow/outcome:
"{request.description}"

Available API endpoints:
{endpoints_list}

Analyze this and create an optimal workflow."""
    
    # Call OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=4096,
        response_format={"type": "json_object"}
    )
    
    # Parse AI response
    ai_response = json.loads(response.choices[0].message.content)
    
    # Transform to our workflow structure
    steps = [
        WorkflowStep(
            id=f"step-{ep['order']}",
            endpoint_id=ep['endpointId'],
            order=ep['order'],
            reasoning=ep['reasoning'],
            parameters=ep.get('parameters', {}),
            conditional_logic={
                "condition": f"depends on {', '.join(ep.get('dependsOn', []))}"
            } if ep.get('dependsOn') else None
        )
        for ep in ai_response['selectedEndpoints']
    ]
    
    workflow = Workflow(
        name=ai_response['workflowName'],
        description=ai_response['workflowDescription'],
        steps=steps,
        spec_id=request.spec_id
    )
    
    return WorkflowGenerationResponse(
        workflow=workflow,
        explanation=ai_response['explanation'],
        ai_reasoning=[
            {"endpoint_id": ep['endpointId'], "reasoning": ep['reasoning']}
            for ep in ai_response['selectedEndpoints']
        ]
    )

def suggest_workflows(spec_id: str, endpoints: List[APIEndpoint]) -> Dict[str, Any]:
    """
    Analyze an API and suggest common workflows
    """
    
    system_prompt = """You are an API workflow expert. Given a list of API endpoints, 
    analyze them and suggest practical, useful workflows that can be created.

    Your task is to:
    1. Understand what the API does based on its endpoints
    2. Identify common use cases and workflows that users might want to create
    3. Suggest 5-8 diverse workflows covering different complexity levels and use cases
    4. For each workflow, specify which endpoints would be used and in what general order

    Return your response as a JSON object with this structure:
    {
      "suggestedFlows": [
        {
          "id": "unique-flow-id",
          "name": "Clear, concise workflow name",
          "description": "One sentence description of what this workflow does",
          "useCase": "Detailed explanation of when and why a user would use this workflow",
          "endpoints": ["endpoint-id-1", "endpoint-id-2"],
          "category": "CRUD|Integration|Analytics|Notification|Automation|Data Processing",
          "complexity": "simple|moderate|complex"
        }
      ],
      "apiSummary": "A brief summary of what this API is designed to do based on the endpoints"
    }

    Guidelines:
    - Suggest workflows that are practical and commonly needed
    - Include a mix of simple (2-3 steps), moderate (4-5 steps), and complex (6+ steps) workflows
    - Focus on real-world use cases
    - Make sure the workflow names are action-oriented and clear
    - Only suggest workflows where the endpoints actually exist in the provided list"""
    
    endpoints_list = "\n\n---\n\n".join([
        f"ID: {ep.id}\n"
        f"Method: {ep.method}\n"
        f"Path: {ep.path}\n"
        f"Summary: {ep.summary or 'N/A'}\n"
        f"Description: {ep.description or 'N/A'}\n"
        f"Parameters: {', '.join([f\"{p.get('name')} ({p.get('in')}, {'required' if p.get('required') else 'optional'})\" for p in (ep.parameters or [])]) or 'None'}"
        for ep in endpoints
    ])
    
    user_prompt = f"""Available API endpoints:
{endpoints_list}

Analyze this API and suggest practical workflows that users might want to create."""
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=4096,
        response_format={"type": "json_object"}
    )
    
    suggestions = json.loads(response.choices[0].message.content)
    
    return {
        "suggested_flows": suggestions['suggestedFlows'],
        "api_summary": suggestions.get('apiSummary', 'API analysis complete'),
        "spec_id": spec_id
    }

# FastAPI endpoints
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/api/workflows/generate-from-nl")
async def generate_workflow_endpoint(request: WorkflowGenerationRequest):
    """
    Generate a workflow from natural language description
    """
    try:
        result = generate_workflow_from_nl(request)
        return {
            "success": True,
            "data": result.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflows/suggest-flows")
async def suggest_workflows_endpoint(spec_id: str, endpoints: List[APIEndpoint]):
    """
    Suggest workflows based on API analysis
    """
    try:
        result = suggest_workflows(spec_id, endpoints)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Similar endpoints for learn-pattern and auto-build-flows...
```

### 2.2 Configure Magoc to Load Extensions

Update Magoc configuration to include the new workflow endpoints:

```bash
# In your Magoc setup
uvx automagik-tools@latest serve \
  --tool genie \
  --transport sse \
  --port 8000 \
  --extensions boltq_workflows
```

## Step 3: Refactor Next.js API Routes

### 3.1 Refactor generate-from-nl/route.ts

**Before** (187 lines):
```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: API_KEY });
// ... 150+ lines of prompt engineering and OpenAI integration
```

**After** (30 lines):
```typescript
import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

/**
 * POST /api/workflows/generate-from-nl
 * Generate a workflow from natural language description
 * Delegates to Magoc Python backend for AI processing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, endpoints, specId } = body;

    // Validate required fields
    if (!description || !endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: description and endpoints array",
        },
        { status: 400 }
      );
    }

    // Delegate to Magoc backend
    const result = await backendService.generateWorkflowFromNL(
      description,
      endpoints,
      specId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating workflow from NL:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### 3.2 Refactor suggest-flows/route.ts

**Before** (169 lines):
```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: API_KEY });
// ... 130+ lines of OpenAI integration
```

**After** (25 lines):
```typescript
import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoints, specId } = body;

    if (!endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        { success: false, error: "Missing required field: endpoints array" },
        { status: 400 }
      );
    }

    // Delegate to Magoc backend
    const result = await backendService.suggestWorkflows(specId, endpoints);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error suggesting flows:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### 3.3 Similar refactoring for learn-pattern and auto-build-flows

Same pattern: remove OpenAI integration, delegate to backend service.

## Step 4: Update backendService.ts

The current `backendService.ts` has method stubs that don't actually delegate. Fix this:

```typescript
// Add these methods to the BackendService class

/**
 * Generate a workflow from natural language description
 * Delegates to Magoc Python backend
 */
async generateWorkflowFromNL(
  description: string,
  endpoints: APIEndpoint[],
  specId: string
): Promise<BackendResponse<{
  workflow: Partial<APIWorkflow>;
  explanation: string;
  aiReasoning: Array<{ endpointId: string; reasoning: string }>;
}>> {
  try {
    const response = await this.client.post('/api/workflows/generate-from-nl', {
      description,
      spec_id: specId,
      endpoints: endpoints.map(ep => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        summary: ep.summary,
        description: ep.description,
        parameters: ep.parameters
      })),
      context: {
        // Can include user preferences, history, etc.
      }
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}

/**
 * Suggest workflows based on API analysis
 * Delegates to Magoc Python backend
 */
async suggestWorkflows(
  specId: string,
  endpoints: APIEndpoint[]
): Promise<BackendResponse<{
  suggestedFlows: Array<any>;
  apiSummary: string;
  specId: string;
}>> {
  try {
    const response = await this.client.post('/api/workflows/suggest-flows', {
      spec_id: specId,
      endpoints: endpoints.map(ep => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        summary: ep.summary,
        description: ep.description,
        parameters: ep.parameters
      }))
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}

/**
 * Learn patterns from a reference workflow
 * Delegates to Magoc Python backend
 */
async learnWorkflowPattern(
  workflow: APIWorkflow,
  endpoints: APIEndpoint[]
): Promise<BackendResponse<{
  patterns: any;
  confidence: number;
}>> {
  try {
    const response = await this.client.post('/api/workflows/learn-pattern', {
      workflow: {
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps
      },
      endpoints: endpoints.map(ep => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        summary: ep.summary,
        description: ep.description,
        parameters: ep.parameters
      }))
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}

/**
 * Auto-build workflows from suggestions
 * Delegates to Magoc Python backend
 */
async autoBuildWorkflows(
  suggestedFlows: any[],
  learnedPatterns: any,
  endpoints: APIEndpoint[],
  specId: string
): Promise<BackendResponse<{
  workflows: Array<any>;
  patternsApplied: string;
}>> {
  try {
    const response = await this.client.post('/api/workflows/auto-build', {
      suggested_flows: suggestedFlows,
      learned_patterns: learnedPatterns,
      spec_id: specId,
      endpoints: endpoints.map(ep => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        summary: ep.summary,
        description: ep.description,
        parameters: ep.parameters
      }))
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}
```

## Step 5: Remove OpenAI Dependency from Next.js

### 5.1 Update package.json

The OpenAI package is no longer needed in the Next.js app (it's only in Magoc backend now):

```bash
npm uninstall openai
```

### 5.2 Remove OpenAI API Key from Next.js Environment

Update `.env.example`:

```bash
# Remove this line:
# OPENAI_API_KEY=<your openai api key>

# OpenAI API key is now managed in Magoc backend only
# Configure it in your Magoc backend's environment
```

## Step 6: Update Documentation

### 6.1 Update MAGOC_INTEGRATION.md

Add section explaining the proper delegation:

```markdown
## Architecture: Proper Backend Delegation

The Boltq application properly delegates AI-powered operations to the Magoc Python backend:

### What Magoc Backend Handles:
- OpenAPI spec parsing and validation
- Natural language to workflow generation
- Workflow pattern learning
- Auto-building workflows
- API endpoint testing
- All OpenAI integration

### What Next.js Handles:
- User interface and routing
- User authentication
- Request validation and sanitization
- Response formatting
- Data persistence in Convex

### Why This Architecture?
- **Separation of Concerns**: AI logic in specialized Python backend
- **Maintainability**: Single source of truth for workflow generation
- **Scalability**: Backend can be scaled independently
- **Security**: OpenAI API key only in backend
- **Leverage Expertise**: Magoc is purpose-built for API evaluation
```

### 6.2 Create Migration Guide

Create `/docs/MIGRATION_GUIDE.md`:

```markdown
# Migration Guide: OpenAI to Magoc Backend

If you have existing code that uses the old pattern (OpenAI in Next.js), 
here's how to migrate:

## Old Pattern (Don't Use)
```typescript
// Direct OpenAI integration in Next.js
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const response = await openai.chat.completions.create({...});
```

## New Pattern (Use This)
```typescript
// Delegate to Magoc backend
import backendService from "@/lib/services/backendService";
const result = await backendService.generateWorkflowFromNL(...);
```

## Benefits
- Less code in Next.js
- Better separation of concerns
- Leverage Magoc's specialized capabilities
- Single point of configuration
```

## Step 7: Testing the Refactored Code

### 7.1 Start Magoc Backend

```bash
# Start Magoc with workflow extensions
uvx automagik-tools@latest serve \
  --tool genie \
  --transport sse \
  --port 8000 \
  --extensions boltq_workflows

# Set OpenAI API key for Magoc
export OPENAI_API_KEY=your-key-here
```

### 7.2 Start Next.js App

```bash
# Update .env to point to Magoc
NEXT_PUBLIC_MAGOC_BACKEND_URL=http://localhost:8000

# Start Next.js
npm run dev
```

### 7.3 Test Workflow Generation

```bash
# Test the endpoint
curl -X POST http://localhost:3000/api/workflows/generate-from-nl \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a user and send welcome email",
    "endpoints": [...],
    "specId": "test-spec"
  }'
```

## Step 8: Rollout Strategy

### Phase 1: Feature Flag (Week 1)
- Add feature flag to switch between old/new implementation
- Deploy to staging environment
- Internal testing

### Phase 2: Canary Deployment (Week 2)
- Enable for 10% of users
- Monitor error rates and performance
- Collect feedback

### Phase 3: Full Rollout (Week 3)
- Enable for all users
- Remove old OpenAI integration code
- Update all documentation

### Phase 4: Cleanup (Week 4)
- Remove feature flags
- Remove unused dependencies
- Archive old code

## Success Metrics

Track these metrics to ensure successful refactoring:

- [ ] Response time: Should be similar or better (< 5 seconds)
- [ ] Error rate: Should decrease (better error handling)
- [ ] Code lines: Should reduce by ~600 lines in Next.js
- [ ] Dependencies: OpenAI package removed from Next.js
- [ ] API calls: All workflow generation goes through Magoc
- [ ] User satisfaction: No decrease in workflow quality

## Troubleshooting

### Magoc backend not responding
```bash
# Check if Magoc is running
curl http://localhost:8000/health

# Check logs
tail -f magoc.log
```

### Workflow generation fails
```bash
# Check OpenAI API key in Magoc environment
echo $OPENAI_API_KEY

# Test Magoc endpoint directly
curl -X POST http://localhost:8000/api/workflows/generate-from-nl \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Next.js proxy errors
```bash
# Check Next.js environment
echo $NEXT_PUBLIC_MAGOC_BACKEND_URL

# Verify backendService.ts configuration
# Check network connectivity between services
```

## Conclusion

This refactoring properly delegates API spec evaluation and workflow generation to the Magoc Python backend, where it belongs. The result is:

- **Cleaner Next.js codebase** (600+ lines removed)
- **Single source of truth** for AI logic
- **Better maintainability** and testability
- **Proper separation of concerns**
- **Full utilization** of Magoc's capabilities

The Magoc backend is now doing what it was designed to do: process OpenAPI specs and generate intelligent workflows using AI.
