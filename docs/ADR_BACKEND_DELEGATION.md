# Architectural Decision Record: Delegate API Spec Evaluation to Python Backend

## Status
**RECOMMENDED** - This represents the proper architecture for the Boltq application

## Context

The Boltq application has two distinct layers:
1. **Next.js/Convex Frontend**: User interface, routing, data persistence
2. **Magoc Python Backend**: API spec evaluation, MCP tool orchestration (https://github.com/rkendel1/Magoc)

The Magoc backend is based on `automagik-tools`, a specialized MCP (Model Context Protocol) toolkit designed to transform any API into an intelligent agent. It features:
- Dynamic tool generation from OpenAPI specifications
- Genie orchestrator for multi-tool coordination
- Built-in memory for pattern learning
- Native AI integration for API evaluation

However, recent implementation has placed significant AI-powered functionality directly in the Next.js layer, specifically:
- Natural language to workflow generation
- API analysis and workflow suggestions
- Workflow pattern learning
- Auto-building workflows

This creates several problems:
1. **Duplication**: AI logic exists in both layers
2. **Maintenance Burden**: Multiple OpenAI integrations to manage
3. **Architectural Misalignment**: Next.js doing work the backend is designed for
4. **Missed Capabilities**: Not leveraging Magoc's genie orchestrator and MCP features

## Decision

**We will delegate all API spec evaluation and AI-powered workflow generation to the Magoc Python backend.**

Specifically:

### Python Backend (Magoc) Responsibilities:
✅ OpenAPI specification parsing and validation
✅ API endpoint extraction and analysis  
✅ Natural language to workflow generation (AI)
✅ Workflow pattern learning (AI)
✅ Auto-building workflows (AI)
✅ Workflow suggestions (AI)
✅ API endpoint testing and execution
✅ MCP tool generation and orchestration
✅ OpenAI API key management
✅ Memory persistence for learned patterns

### Next.js/Convex Responsibilities:
✅ User interface and UI state management
✅ Request routing and validation
✅ User authentication and authorization
✅ Workflow persistence (Convex database)
✅ User preferences and settings
✅ Real-time updates and subscriptions
✅ Team collaboration features
✅ Thin proxy layer to backend

## Consequences

### Positive

1. **Proper Separation of Concerns**
   - Each layer does what it's designed for
   - Clear boundaries between frontend and backend

2. **Code Reduction**
   - ~600+ lines of AI logic removed from Next.js
   - 4 complex API routes simplified to thin proxies
   - Single OpenAI integration point

3. **Better Maintainability**
   - AI prompts and logic in one place (Python)
   - Easier to test and debug
   - Single source of truth

4. **Leverage Expertise**
   - Magoc is purpose-built for API evaluation
   - Full utilization of genie orchestrator
   - Native MCP protocol support

5. **Improved Scalability**
   - Backend can be scaled independently
   - Memory and patterns shared across users
   - Better resource utilization

6. **Cost Efficiency**
   - Single OpenAI API key management
   - Better caching opportunities
   - Shared computation across requests

### Negative

1. **Network Latency**
   - Additional network hop to Python backend
   - Mitigation: Co-locate services, use HTTP/2

2. **Deployment Complexity**
   - Need to deploy and maintain Python backend
   - Mitigation: Docker containers, clear documentation

3. **Migration Effort**
   - Existing code needs refactoring
   - Mitigation: Gradual rollout with feature flags

4. **Testing Complexity**
   - Integration tests across services
   - Mitigation: Comprehensive test suite, mocking

## Implementation Plan

### Phase 1: Backend Development (2 weeks)
- Create Magoc extensions for workflow generation
- Implement FastAPI endpoints for workflow operations
- Add comprehensive error handling and logging
- Write unit tests for Python backend

### Phase 2: Frontend Refactoring (1 week)
- Simplify Next.js API routes to thin proxies
- Update backendService.ts to properly delegate
- Remove OpenAI dependency from Next.js
- Update environment configuration

### Phase 3: Testing (1 week)
- Integration testing across layers
- Performance testing
- Error handling verification
- Security review

### Phase 4: Documentation (3 days)
- Update architecture documentation
- Create migration guide
- Update API documentation
- Add troubleshooting guides

### Phase 5: Gradual Rollout (2 weeks)
- Feature flag implementation
- Canary deployment (10% users)
- Monitor metrics and errors
- Full rollout
- Cleanup old code

**Total Timeline: ~6 weeks**

## Alternatives Considered

### Alternative 1: Keep AI Logic in Next.js
**Decision**: ❌ Rejected

**Pros**:
- No refactoring needed
- Simpler deployment (single service)
- No network latency

**Cons**:
- Architectural misalignment
- Duplicate code across layers
- Not leveraging Magoc's capabilities
- Higher maintenance burden
- Scalability issues

### Alternative 2: Hybrid Approach (Some in Next.js, Some in Magoc)
**Decision**: ❌ Rejected

**Pros**:
- Gradual migration possible
- Flexibility in placement

**Cons**:
- Unclear boundaries
- Confusion about where logic belongs
- Still duplicates some code
- Harder to maintain long-term

### Alternative 3: Full Delegation (Chosen)
**Decision**: ✅ **ACCEPTED**

**Pros**:
- Clear separation of concerns
- Leverages Magoc's purpose-built capabilities
- Single source of truth for AI logic
- Better scalability
- Easier maintenance
- Proper architectural alignment

**Cons**:
- Requires refactoring effort
- Deployment complexity
- Network latency (minimal)

## Validation

### Success Criteria

1. **Code Quality**
   - [ ] Next.js API routes reduced to < 50 lines each
   - [ ] OpenAI dependency removed from Next.js package.json
   - [ ] All AI operations go through Magoc backend
   - [ ] No OpenAI API key in Next.js environment

2. **Performance**
   - [ ] Workflow generation response time < 5 seconds
   - [ ] Error rate decreases or stays same
   - [ ] 99.9% uptime for Magoc backend

3. **Functionality**
   - [ ] All existing features work correctly
   - [ ] No regression in workflow quality
   - [ ] Pattern learning persists across sessions

4. **Documentation**
   - [ ] Architecture diagrams updated
   - [ ] API documentation complete
   - [ ] Migration guide available
   - [ ] Troubleshooting guide provided

### Monitoring

Track these metrics post-deployment:

- **Response Times**: P50, P95, P99 for workflow generation
- **Error Rates**: By endpoint and error type
- **User Satisfaction**: Workflow quality ratings
- **Backend Health**: CPU, memory, request queue
- **AI Performance**: Token usage, cost per request

### Rollback Plan

If issues arise during rollout:

1. **Feature Flag**: Immediately switch back to old implementation
2. **Database**: No schema changes, so no data migration needed
3. **Code**: Keep old code until full validation complete
4. **Monitoring**: Alert on increased errors or latency

## References

- [Magoc Repository](https://github.com/rkendel1/Magoc)
- [automagik-tools](https://github.com/namastexlabs/automagik-tools)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [BACKEND_DELEGATION_ARCHITECTURE.md](./BACKEND_DELEGATION_ARCHITECTURE.md)
- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)

## Decision Makers

- **Architecture**: Evaluated by engineering team
- **Recommendation**: Strongly recommended
- **Priority**: High - addresses core architectural concern

## Review Schedule

- **Initial Review**: Before implementation begins
- **Mid-Implementation**: After Phase 2 complete
- **Post-Deployment**: 2 weeks after full rollout
- **Long-term**: Quarterly review of architecture

## Notes

This decision aligns with the original intent of the Magoc backend as stated in the issue:

> "We have a very strong api spec AI evaluation tool in our backend that we should leverage. It's an automagik-genie that is python and very capable."

The Magoc backend (automagik-tools) is specifically designed for this work. By delegating properly, we:
- Respect the original architectural vision
- Leverage specialized capabilities
- Simplify the Next.js codebase
- Improve maintainability and scalability

## Last Updated

Document created: 2025-11-08
Status: RECOMMENDED
Next Review: Before implementation begins
