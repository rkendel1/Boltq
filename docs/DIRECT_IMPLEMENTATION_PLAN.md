# Implementation Roadmap: Direct Migration to Magoc Backend

## New Requirements Acknowledged

✅ **No backward compatibility needed**
✅ **No existing users or flows to preserve**
✅ **No data migration required**
✅ **No feature flags needed**

**Result**: We can implement a clean, direct migration without complexity.

## Simplified Implementation Plan

### Timeline: 3 Weeks (Down from 6 weeks)

| Phase | Duration | Activities |
|-------|----------|-----------|
| 1. Build Magoc Extensions | 1 week | Create workflow services in Python |
| 2. Refactor Next.js Routes | 3 days | Simplify to thin proxies |
| 3. Testing | 4 days | Integration and E2E tests |
| **Total** | **3 weeks** | **Direct implementation** |

No gradual rollout, no A/B testing, no feature flags, no data migration.

## Phase 1: Build Magoc Extensions (1 Week)

### Directory Structure

```
magoc-extensions/
├── setup.py
├── requirements.txt
├── magoc_workflow_extensions/
│   ├── __init__.py
│   ├── api.py              # FastAPI routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── workflow_generator.py
│   │   ├── flow_suggester.py
│   │   ├── pattern_learner.py
│   │   └── auto_builder.py
│   └── models/
│       ├── __init__.py
│       └── schemas.py      # Pydantic models
```

### Day 1-2: Core Services

**File: `magoc_workflow_extensions/services/workflow_generator.py`**

```python
"""
Workflow Generator Service
Handles natural language to workflow conversion
"""
from openai import OpenAI
from typing import List, Dict, Any

class WorkflowGenerator:
    def __init__(self):
        self.client = OpenAI()
    
    def generate_from_nl(
        self, 
        description: str, 
        endpoints: List[Dict[str, Any]], 
        spec_id: str
    ) -> Dict[str, Any]:
        """
        Generate workflow from natural language description
        Direct port of Next.js logic to Python
        """
        # Build the exact same prompt as Next.js version
        system_prompt = """You are an API workflow expert. Given a natural language description of a desired flow or outcome, analyze which API endpoints should be used and in what order.

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
      "parameters": {
        "paramName": "description of what value should be provided"
      },
      "dependsOn": ["list of previous step IDs this depends on"]
    }
  ],
  "explanation": "A detailed explanation of the workflow logic and data flow"
}"""

        # Format endpoints
        endpoints_list = "\n\n---\n\n".join([
            f"ID: {ep['id']}\n"
            f"Method: {ep['method']}\n"
            f"Path: {ep['path']}\n"
            f"Summary: {ep.get('summary', 'N/A')}\n"
            f"Description: {ep.get('description', 'N/A')}\n"
            f"Parameters: {self._format_parameters(ep.get('parameters', []))}"
            for ep in endpoints
        ])
        
        user_prompt = f"""User's desired flow/outcome:
"{description}"

Available API endpoints:
{endpoints_list}

Analyze this and create an optimal workflow."""

        # Call OpenAI with same parameters as Next.js
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4096,
            response_format={"type": "json_object"}
        )
        
        # Parse and transform response
        import json
        workflow_data = json.loads(response.choices[0].message.content)
        
        # Transform to expected format
        steps = [
            {
                "id": f"step-{ep['order']}",
                "endpointId": ep['endpointId'],
                "order": ep['order'],
                "reasoning": ep['reasoning'],
                "parameters": ep.get('parameters', {}),
                "conditionalLogic": {
                    "condition": f"depends on {', '.join(ep['dependsOn'])}"
                } if ep.get('dependsOn') else None
            }
            for ep in workflow_data['selectedEndpoints']
        ]
        
        return {
            "workflow": {
                "name": workflow_data['workflowName'],
                "description": workflow_data['workflowDescription'],
                "steps": steps,
                "specId": spec_id
            },
            "explanation": workflow_data['explanation'],
            "aiReasoning": [
                {
                    "endpointId": ep['endpointId'],
                    "reasoning": ep['reasoning']
                }
                for ep in workflow_data['selectedEndpoints']
            ]
        }
    
    def _format_parameters(self, params: List[Dict]) -> str:
        if not params:
            return "None"
        return ", ".join([
            f"{p['name']} ({p.get('in', 'query')}, {'required' if p.get('required') else 'optional'})"
            for p in params
        ])
```

**File: `magoc_workflow_extensions/services/flow_suggester.py`**

```python
"""
Flow Suggester Service
Analyzes APIs and suggests common workflows
"""
from openai import OpenAI
import json

class FlowSuggester:
    def __init__(self):
        self.client = OpenAI()
    
    def suggest_flows(self, endpoints: list, spec_id: str) -> dict:
        """Direct port of suggest-flows logic"""
        
        system_prompt = """You are an API workflow expert. Given a list of API endpoints, analyze them and suggest practical, useful workflows that can be created.

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
}"""

        # Format endpoints same as Next.js
        endpoints_list = self._format_endpoints(endpoints)
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Available API endpoints:\n{endpoints_list}\n\nAnalyze this API and suggest practical workflows."}
            ],
            temperature=0.7,
            max_tokens=4096,
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        
        return {
            "suggestedFlows": data['suggestedFlows'],
            "apiSummary": data.get('apiSummary', 'API analysis complete'),
            "specId": spec_id
        }
    
    def _format_endpoints(self, endpoints):
        return "\n\n---\n\n".join([
            f"ID: {ep['id']}\nMethod: {ep['method']}\nPath: {ep['path']}\n"
            f"Summary: {ep.get('summary', 'N/A')}\nDescription: {ep.get('description', 'N/A')}"
            for ep in endpoints
        ])
```

**Similar services for `pattern_learner.py` and `auto_builder.py`**

### Day 3-4: FastAPI Routes

**File: `magoc_workflow_extensions/api.py`**

```python
"""
FastAPI routes for workflow operations
Drop-in replacement for Next.js API routes
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from .services.workflow_generator import WorkflowGenerator
from .services.flow_suggester import FlowSuggester
from .services.pattern_learner import PatternLearner
from .services.auto_builder import AutoBuilder

app = FastAPI(title="Magoc Workflow Extensions")

# CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure as needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
workflow_gen = WorkflowGenerator()
flow_suggester = FlowSuggester()
pattern_learner = PatternLearner()
auto_builder = AutoBuilder()

# Request models
class GenerateWorkflowRequest(BaseModel):
    description: str
    endpoints: List[Dict[str, Any]]
    specId: str

class SuggestFlowsRequest(BaseModel):
    endpoints: List[Dict[str, Any]]
    specId: str

class LearnPatternRequest(BaseModel):
    referenceWorkflow: Dict[str, Any]
    referenceEndpoints: List[Dict[str, Any]]

class AutoBuildRequest(BaseModel):
    suggestedFlows: List[Dict[str, Any]]
    learnedPatterns: Dict[str, Any]
    endpoints: List[Dict[str, Any]]
    specId: str

# Routes
@app.post("/api/workflows/generate-from-nl")
async def generate_workflow(request: GenerateWorkflowRequest):
    """Generate workflow from natural language"""
    try:
        result = workflow_gen.generate_from_nl(
            request.description,
            request.endpoints,
            request.specId
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflows/suggest-flows")
async def suggest_flows(request: SuggestFlowsRequest):
    """Suggest workflows based on API analysis"""
    try:
        result = flow_suggester.suggest_flows(
            request.endpoints,
            request.specId
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflows/learn-pattern")
async def learn_pattern(request: LearnPatternRequest):
    """Learn patterns from reference workflow"""
    try:
        result = pattern_learner.learn(
            request.referenceWorkflow,
            request.referenceEndpoints
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflows/auto-build-flows")
async def auto_build(request: AutoBuildRequest):
    """Auto-build workflows using learned patterns"""
    try:
        result = auto_builder.build(
            request.suggestedFlows,
            request.learnedPatterns,
            request.endpoints,
            request.specId
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "magoc-workflow-extensions"}
```

### Day 5: Package Setup

**File: `setup.py`**

```python
from setuptools import setup, find_packages

setup(
    name="magoc-workflow-extensions",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.100.0",
        "uvicorn>=0.23.0",
        "openai>=1.0.0",
        "pydantic>=2.0.0",
        "python-dotenv>=1.0.0",
    ],
    entry_points={
        'console_scripts': [
            'magoc-workflows=magoc_workflow_extensions.api:main',
        ],
    },
)
```

**File: `requirements.txt`**

```
fastapi>=0.100.0
uvicorn>=0.23.0
openai>=1.0.0
pydantic>=2.0.0
python-dotenv>=1.0.0
```

## Phase 2: Refactor Next.js Routes (3 Days)

### Day 1: Simplify All Routes

**Complete refactored routes:**

**File: `/app/api/workflows/generate-from-nl/route.ts`** (Was 187 lines, now 30)

```typescript
import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, endpoints, specId } = body;

    if (!description || !endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await backendService.generateWorkflowFromNL(
      description,
      endpoints,
      specId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating workflow:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**File: `/app/api/workflows/suggest-flows/route.ts`** (Was 169 lines, now 25)

```typescript
import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoints, specId } = body;

    if (!endpoints || !Array.isArray(endpoints)) {
      return NextResponse.json(
        { success: false, error: "Missing required field: endpoints" },
        { status: 400 }
      );
    }

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

**File: `/app/api/workflows/learn-pattern/route.ts`** (Was 161 lines, now 25)

```typescript
import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceWorkflow, referenceEndpoints } = body;

    if (!referenceWorkflow || !referenceEndpoints) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await backendService.learnWorkflowPattern(
      referenceWorkflow,
      referenceEndpoints
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error learning pattern:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**File: `/app/api/workflows/auto-build-flows/route.ts`** (Was 190 lines, now 30)

```typescript
import { NextRequest, NextResponse } from "next/server";
import backendService from "@/lib/services/backendService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suggestedFlows, learnedPatterns, endpoints, specId } = body;

    if (!suggestedFlows || !learnedPatterns || !endpoints) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await backendService.autoBuildWorkflows(
      suggestedFlows,
      learnedPatterns,
      endpoints,
      specId
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error auto-building flows:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### Day 2: Update Backend Service

**File: `/lib/services/backendService.ts`** (Update existing methods)

```typescript
// Update the generateWorkflowFromNL method (already exists but needs to actually call backend)
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
      endpoints,
      specId
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}

// Add new methods
async suggestWorkflows(
  specId: string,
  endpoints: APIEndpoint[]
): Promise<BackendResponse<any>> {
  try {
    const response = await this.client.post('/api/workflows/suggest-flows', {
      endpoints,
      specId
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}

async learnWorkflowPattern(
  workflow: any,
  endpoints: APIEndpoint[]
): Promise<BackendResponse<any>> {
  try {
    const response = await this.client.post('/api/workflows/learn-pattern', {
      referenceWorkflow: workflow,
      referenceEndpoints: endpoints
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}

async autoBuildWorkflows(
  suggestedFlows: any[],
  learnedPatterns: any,
  endpoints: APIEndpoint[],
  specId: string
): Promise<BackendResponse<any>> {
  try {
    const response = await this.client.post('/api/workflows/auto-build-flows', {
      suggestedFlows,
      learnedPatterns,
      endpoints,
      specId
    });
    return response.data;
  } catch (error) {
    return this.handleError(error);
  }
}
```

### Day 3: Remove OpenAI Dependency

```bash
# Uninstall OpenAI package from Next.js
npm uninstall openai

# Update package.json is automatic
```

**Update `.env.example`:**

```bash
# Remove this line:
# OPENAI_API_KEY=<your openai api key>

# Keep only:
NEXT_PUBLIC_MAGOC_BACKEND_URL=http://localhost:8000
```

## Phase 3: Testing (4 Days)

### Day 1-2: Integration Tests

```python
# tests/test_workflow_generation.py
import pytest
from magoc_workflow_extensions.services.workflow_generator import WorkflowGenerator

def test_generate_workflow():
    """Test workflow generation"""
    gen = WorkflowGenerator()
    
    endpoints = [
        {"id": "post_users", "method": "POST", "path": "/users"},
        {"id": "post_emails", "method": "POST", "path": "/emails"}
    ]
    
    result = gen.generate_from_nl(
        "Create a user and send welcome email",
        endpoints,
        "test-spec"
    )
    
    assert result['workflow']['name']
    assert len(result['workflow']['steps']) > 0
    assert result['explanation']
```

### Day 3-4: End-to-End Tests

```bash
# Start Magoc extensions
uvicorn magoc_workflow_extensions.api:app --port 8000

# Start Next.js
npm run dev

# Run E2E tests
npm run test:e2e
```

## Deployment

### Development Setup

```bash
# 1. Install and run Magoc extensions
cd magoc-extensions
pip install -e .
uvicorn magoc_workflow_extensions.api:app --reload --port 8000

# 2. Configure Next.js
echo "NEXT_PUBLIC_MAGOC_BACKEND_URL=http://localhost:8000" > .env

# 3. Start Next.js
npm run dev
```

### Production Setup

```bash
# 1. Deploy Magoc extensions
docker build -t magoc-extensions .
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  magoc-extensions

# 2. Deploy Next.js
vercel deploy --env NEXT_PUBLIC_MAGOC_BACKEND_URL=https://magoc.yourdomain.com
```

## Summary: Clean 3-Week Implementation

| Week | What Gets Done |
|------|---------------|
| Week 1 | Build complete Magoc extensions (Python) |
| Week 2 | Refactor Next.js routes (Days 1-3), Test (Days 4-5) |
| Week 3 | Final testing, deployment, documentation |

**No complexity**:
- ❌ No feature flags
- ❌ No backward compatibility
- ❌ No data migration
- ❌ No gradual rollout
- ❌ No A/B testing

**Just**:
- ✅ Build extensions
- ✅ Refactor routes
- ✅ Test
- ✅ Deploy

**Result**: Clean, simple, direct migration in 3 weeks.
