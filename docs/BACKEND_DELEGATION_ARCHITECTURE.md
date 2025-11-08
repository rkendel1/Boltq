# Backend Delegation Architecture

## Executive Summary

This document outlines the proper architecture for leveraging the Magoc Python backend (automagik-tools) for API spec evaluation and workflow generation, rather than implementing these capabilities in the Next.js layer.

## Problem Statement

The Boltq application has a **powerful Python backend (Magoc/automagik-tools)** specifically designed for:
- OpenAPI specification parsing and analysis
- Dynamic MCP tool generation from API specs
- AI-powered workflow orchestration
- API endpoint evaluation and testing

However, recent implementation has placed AI evaluation logic directly in Next.js API routes, bypassing this specialized backend. This creates:
- **Code duplication**: AI prompts and logic exist in both layers
- **Underutilization**: Magoc's genie orchestrator capabilities are unused
- **Maintenance burden**: AI logic scattered across multiple Next.js routes
- **Missed opportunity**: Not leveraging Magoc's domain expertise in API evaluation

## Architectural Principles

### What Belongs in the Python Backend (Magoc)

✅ **OpenAPI Spec Processing**
- Parsing and validation of OpenAPI/Swagger specifications
- Endpoint extraction and metadata analysis
- Parameter type inference and validation
- API schema understanding

✅ **AI-Powered Evaluation**
- Natural language to workflow generation
- Endpoint selection and ordering
- Parameter mapping and dependencies
- Workflow pattern learning
- Flow suggestions based on API analysis

✅ **API Testing & Execution**
- Endpoint testing with actual API calls
- Response validation
- Error handling and retry logic
- Authentication flow management

✅ **MCP Tool Orchestration**
- Converting OpenAPI specs to MCP tools
- Tool composition and chaining
- Memory persistence for learned patterns
- Multi-tool coordination (genie orchestrator)

### What Belongs in Next.js/Convex

✅ **User Interface & State**
- React components and UI logic
- Client-side state management
- User session handling
- Real-time UI updates

✅ **Data Persistence**
- Storing workflows in Convex database
- User preferences and settings
- Conversation history
- Component generation history

✅ **Request Routing**
- Thin API route handlers that proxy to Python backend
- Request validation and sanitization
- Authentication token handling
- Response formatting for frontend

✅ **Business Logic**
- User permissions and access control
- Workspace management
- Team collaboration features
- Usage analytics and tracking

## Current vs. Proposed Architecture

### Current Architecture (Problematic)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                            │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ generate-from- │  │ suggest-flows  │  │ auto-build-flows │  │
│  │      nl        │  │                │  │                  │  │
│  │  [OpenAI GPT]  │  │  [OpenAI GPT]  │  │  [OpenAI GPT]    │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │ learn-pattern  │  │ openapi/parse  │                         │
│  │  [OpenAI GPT]  │  │                │                         │
│  └────────────────┘  └────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Magoc Backend  │
                    │  (Underused)   │
                    └────────────────┘

Issues:
❌ AI logic duplicated in multiple Next.js routes
❌ Magoc backend only used for basic spec upload
❌ OpenAI API keys managed in Next.js
❌ Complex prompts maintained in TypeScript files
❌ No leverage of Magoc's genie orchestrator
```

### Proposed Architecture (Correct)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                            │
│                      (Thin Proxies)                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Proxy to:     │  │  Proxy to:     │  │  Proxy to:       │  │
│  │  /workflows/   │  │  /workflows/   │  │  /workflows/     │  │
│  │  generate      │  │  suggest       │  │  auto-build      │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│                                                                  │
│  • Validate requests                                             │
│  • Handle auth tokens                                            │
│  • Forward to Magoc                                              │
│  • Format responses                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Magoc Python Backend                          │
│                   (automagik-tools MCP)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Genie Orchestrator                       │   │
│  │  • Coordinate multiple MCP tools                          │   │
│  │  • Memory for learned patterns                            │   │
│  │  • Context-aware AI routing                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────┴──────────────────────────────┐   │
│  │                                                           │   │
│  ▼                          ▼                               ▼   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  OpenAPI Spec    │  │  Workflow Gen    │  │  API Testing │  │
│  │   Processor      │  │   (AI-powered)   │  │   Engine     │  │
│  │                  │  │                  │  │              │  │
│  │ • Parse specs    │  │ • NL to workflow │  │ • Execute    │  │
│  │ • Extract        │  │ • Suggest flows  │  │ • Validate   │  │
│  │   endpoints      │  │ • Learn patterns │  │ • Report     │  │
│  │ • Validate       │  │ • Auto-build     │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MCP Tool Layer                         │   │
│  │  • Dynamic tool generation from OpenAPI specs             │   │
│  │  • Tool composition and chaining                          │   │
│  │  • Parameter type inference                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Benefits:
✅ Single source of truth for API evaluation logic
✅ Magoc's specialized capabilities fully utilized
✅ Simpler Next.js codebase (thin proxies only)
✅ Easier to maintain and test
✅ Leverage genie orchestrator for complex workflows
```

## Implementation Plan

### Phase 1: Magoc Backend Endpoints

Create new endpoints in the Magoc backend (Python):

#### 1. `/api/workflows/generate-from-nl`
**Purpose**: Generate workflow from natural language description

**Input**:
```json
{
  "description": "Create user, send email, add to group",
  "spec_id": "github-api-v3",
  "endpoints": [...],
  "context": {
    "previous_workflows": [],
    "user_preferences": {}
  }
}
```

**Processing**:
- Use Magoc's genie orchestrator to analyze the spec
- Leverage MCP tools generated from the OpenAPI spec
- Use AI to understand natural language intent
- Apply learned patterns from memory
- Generate optimal workflow structure

**Output**:
```json
{
  "workflow": {
    "name": "User Onboarding Flow",
    "description": "...",
    "steps": [...]
  },
  "explanation": "...",
  "reasoning": [...]
}
```

#### 2. `/api/workflows/suggest-flows`
**Purpose**: Analyze API and suggest common workflows

**Input**:
```json
{
  "spec_id": "github-api-v3",
  "endpoints": [...],
  "api_domain": "version-control"
}
```

**Processing**:
- Analyze API patterns using Magoc's spec processor
- Identify common CRUD operations
- Detect workflow patterns (create-update-delete chains)
- Use AI to categorize and prioritize suggestions

**Output**:
```json
{
  "suggestions": [
    {
      "id": "flow-1",
      "name": "Repository Setup",
      "category": "setup",
      "complexity": "simple",
      "endpoints": [...]
    }
  ],
  "api_summary": "..."
}
```

#### 3. `/api/workflows/learn-pattern`
**Purpose**: Learn patterns from reference workflow

**Input**:
```json
{
  "workflow": {...},
  "endpoints": [...]
}
```

**Processing**:
- Extract workflow structure patterns
- Identify parameter mapping strategies
- Store in Magoc's memory system
- Use for future workflow generation

**Output**:
```json
{
  "patterns": {
    "structure": {...},
    "parameters": {...},
    "interactions": {...}
  },
  "confidence": 0.95
}
```

#### 4. `/api/workflows/auto-build`
**Purpose**: Auto-build workflows using learned patterns

**Input**:
```json
{
  "suggested_flows": [...],
  "learned_patterns": {...},
  "spec_id": "..."
}
```

**Processing**:
- Apply learned patterns to suggestions
- Use genie orchestrator to coordinate tool usage
- Generate complete workflows
- Validate against spec

**Output**:
```json
{
  "workflows": [
    {
      "flow_id": "...",
      "workflow": {...},
      "applied_patterns": [...]
    }
  ]
}
```

### Phase 2: Update Next.js API Routes

Transform existing Next.js routes into thin proxies:

#### Before (generate-from-nl/route.ts):
```typescript
// 187 lines of OpenAI integration code
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: API_KEY });
// ... complex prompt engineering
// ... JSON parsing and validation
```

#### After (generate-from-nl/route.ts):
```typescript
// 20 lines of proxy code
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Validate and sanitize input
  const { description, endpoints, specId } = validateRequest(body);
  
  // Forward to Magoc backend
  const result = await backendService.generateWorkflowFromNL(
    description,
    endpoints,
    specId
  );
  
  return NextResponse.json(result);
}
```

### Phase 3: Update backendService.ts

Enhance the backend service to handle the new endpoints:

```typescript
class BackendService {
  // Existing methods stay the same
  
  // Enhanced method with proper implementation
  async generateWorkflowFromNL(
    description: string,
    endpoints: APIEndpoint[],
    specId: string
  ): Promise<BackendResponse<WorkflowResult>> {
    try {
      const response = await this.client.post('/api/workflows/generate-from-nl', {
        description,
        spec_id: specId,
        endpoints: this.formatEndpointsForBackend(endpoints),
        context: {
          user_preferences: this.getUserPreferences(),
          previous_workflows: this.getRecentWorkflows()
        }
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  async suggestWorkflows(
    specId: string,
    endpoints: APIEndpoint[]
  ): Promise<BackendResponse<SuggestedFlows>> {
    // Similar implementation
  }
  
  async learnWorkflowPattern(
    workflow: APIWorkflow,
    endpoints: APIEndpoint[]
  ): Promise<BackendResponse<LearnedPatterns>> {
    // Similar implementation
  }
  
  async autoBuildWorkflows(
    suggestions: SuggestedFlow[],
    patterns: LearnedPatterns,
    specId: string
  ): Promise<BackendResponse<BuiltWorkflows>> {
    // Similar implementation
  }
}
```

### Phase 4: Remove Redundant Code

Delete or simplify the following in Next.js:

1. **Remove direct OpenAI integration** from workflow API routes
2. **Remove complex prompt templates** (move to Magoc backend)
3. **Remove AI parsing logic** (handled by Magoc)
4. **Simplify error handling** (standardize on backend responses)

Lines of code reduction:
- `generate-from-nl/route.ts`: 187 → ~30 lines
- `suggest-flows/route.ts`: 169 → ~25 lines
- `learn-pattern/route.ts`: 161 → ~25 lines
- `auto-build-flows/route.ts`: 190 → ~30 lines

**Total reduction**: ~600+ lines of complex AI logic moved to specialized backend

### Phase 5: Update Documentation

1. Update `MAGOC_INTEGRATION.md` to reflect proper usage
2. Add `BACKEND_API_SPEC.md` documenting Magoc endpoints
3. Update `README.md` architecture section
4. Add migration guide for existing users

## Benefits of This Architecture

### 1. Separation of Concerns
- **Next.js**: UI, routing, user management
- **Magoc**: API evaluation, AI workflows, spec processing

### 2. Maintainability
- AI prompts and logic in one place (Python)
- Easier to test and debug
- Single source of truth for workflow generation

### 3. Scalability
- Magoc can be scaled independently
- Multiple Next.js instances can share one Magoc backend
- Memory and pattern learning persists across sessions

### 4. Leverage Expertise
- Magoc is purpose-built for API evaluation
- Genie orchestrator designed for tool coordination
- MCP protocol native support

### 5. Cost Efficiency
- Single OpenAI API key management
- Better caching and rate limiting
- Shared memory across users

### 6. Extensibility
- Easy to add new workflow types
- Can integrate additional MCP servers
- Support for more API spec formats

## Migration Strategy

### For Existing Users

1. **Backward Compatibility**: Keep old endpoints during transition
2. **Gradual Rollout**: Feature flag to switch between old/new
3. **Data Migration**: Export existing workflows, import to new system
4. **Testing**: Parallel testing of both systems

### For New Features

- All new AI-powered features go through Magoc backend
- No new OpenAI integration in Next.js
- Leverage Magoc's genie orchestrator for complex operations

## Security Considerations

### API Key Management
- OpenAI API key stays in Magoc backend only
- Next.js never sees the OpenAI key
- User API keys (for their APIs) encrypted in transit

### Input Validation
- Next.js validates and sanitizes user input
- Magoc validates spec structure and content
- Rate limiting at both layers

### Access Control
- Next.js handles user authentication
- Magoc validates requests via shared secret/JWT
- User permissions enforced at Next.js layer

## Monitoring and Observability

### Metrics to Track

1. **Backend Usage**
   - Workflow generation requests/sec
   - Average processing time
   - Error rates by endpoint

2. **AI Performance**
   - Workflow quality scores
   - User acceptance rate
   - Pattern learning effectiveness

3. **System Health**
   - Magoc backend availability
   - OpenAI API latency
   - Memory usage

### Logging

- Structured logging in both layers
- Request tracing across boundaries
- AI decision reasoning captured

## Testing Strategy

### Unit Tests
- Magoc backend: Test each endpoint independently
- Next.js: Test proxy logic and validation

### Integration Tests
- End-to-end workflow generation
- Error handling and retries
- Rate limiting and auth

### AI Quality Tests
- Workflow correctness verification
- Endpoint selection accuracy
- Parameter mapping validation

## Rollout Plan

1. **Week 1-2**: Implement Magoc backend endpoints
2. **Week 3**: Update backendService.ts
3. **Week 4**: Convert Next.js routes to proxies
4. **Week 5**: Testing and bug fixes
5. **Week 6**: Documentation and migration guides
6. **Week 7**: Gradual rollout with feature flags
7. **Week 8**: Full deployment and monitoring

## Success Criteria

✅ All AI workflow generation goes through Magoc backend
✅ Next.js routes are thin proxies (<50 lines each)
✅ No OpenAI API key in Next.js environment
✅ Genie orchestrator actively used for complex workflows
✅ Response times < 5 seconds for workflow generation
✅ Zero regression in existing functionality
✅ Documentation complete and accurate

## Conclusion

This architecture properly leverages the strengths of each system:
- **Magoc**: Purpose-built API evaluation and AI-powered workflow generation
- **Next.js**: User interface, routing, and data persistence

By delegating AI operations to the specialized Python backend, we achieve:
- Cleaner codebase
- Better maintainability
- Improved scalability
- Proper separation of concerns
- Full utilization of Magoc's capabilities

This is the correct architectural pattern for the Boltq application.
