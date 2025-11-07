# API Opportunity Discovery Feature

## Overview

The API Opportunity Discovery feature uses AI to analyze OpenAPI specifications and identify potential new capabilities, missing features, and optimization opportunities. This helps API developers discover:

- **What's missing**: CRUD operations that should exist but don't
- **What could be combined**: Composite endpoints that leverage existing operations
- **What could be optimized**: Batch operations, caching, rate limiting
- **What's almost there**: Quick wins with low effort and high impact

## How It Works

### 1. AI-Powered Analysis

The feature uses GPT-4 to analyze your OpenAPI specification comprehensively. The AI examines:

- All endpoint definitions (paths, methods, parameters)
- Request/response schemas
- Data relationships and patterns
- Common API design patterns
- Industry best practices

### 2. Categorization

Opportunities are categorized into 12 types:

| Category | Description | Example |
|----------|-------------|---------|
| **Missing CRUD** | Incomplete CRUD operations | GET exists but no POST/PUT/DELETE |
| **Composite Endpoint** | Combine multiple operations | Single endpoint for multi-step workflow |
| **Batch Operation** | Process multiple items at once | Bulk create/update/delete |
| **Filtering/Search** | Enhanced query capabilities | Advanced filtering, full-text search |
| **Pagination** | Better data navigation | Cursor-based pagination, page limits |
| **Related Endpoints** | Link related resources | Nested resources, relationship endpoints |
| **Authentication** | Security improvements | OAuth2, API keys, JWT |
| **Rate Limiting** | Throttling and quotas | Per-user limits, tiered access |
| **Caching** | Performance optimization | Cache headers, ETags |
| **Webhooks** | Event notifications | Real-time updates, callbacks |
| **Versioning** | API evolution | Version headers, URL versioning |
| **Documentation** | Improved API docs | Better descriptions, examples |

### 3. Effort & Impact Assessment

Each opportunity is rated:

**Effort Levels:**
- 🟢 **Low**: Can be implemented in hours or a day
- 🟡 **Medium**: Requires several days or a week
- 🔴 **High**: Significant project (weeks or more)

**Impact Levels:**
- 📊 **Low**: Nice-to-have improvement
- 📈 **Medium**: Noticeable enhancement
- 🚀 **High**: Game-changing feature

### 4. Quick Wins Identification

The system automatically identifies **Quick Wins** - opportunities that are:
- ✅ Low effort to implement
- ✅ High impact on value
- ✅ Immediate return on investment

## Using the Feature

### Step 1: Upload OpenAPI Spec

Navigate to the OpenAPI Workflow Builder and upload your specification:

```
Options:
1. From URL: https://api.example.com/openapi.json
2. From File: Upload JSON or YAML file
```

### Step 2: Open Opportunity Discovery

Click the **"Opportunities"** button in the action panel (yellow lightbulb icon).

### Step 3: Start Analysis

Click **"Start Analysis"** to begin the AI-powered analysis. This typically takes 10-30 seconds depending on API size.

### Step 4: Review Results

The analysis shows:

**Summary Dashboard:**
- Total opportunities found
- Number of quick wins
- Total API endpoints
- API version

**Opportunity List:**
- Expandable cards for each opportunity
- Category badges (color-coded)
- Effort and impact ratings
- Quick win highlighting (green background)

### Step 5: Explore Opportunities

Click any opportunity to expand and see:

1. **Rationale**: Why this is valuable
2. **Affected Endpoints**: Which parts of your API this relates to
3. **Implementation Approach**: How to build it
4. **Example**: Code or usage example (if applicable)
5. **Dependencies**: Prerequisites or related features

### Step 6: Filter and Prioritize

Use the filters to focus on specific areas:

```
Filter by Category: All Categories, Missing CRUD, Batch Operation, etc.
Filter by Effort: All Effort Levels, Low Effort, Medium Effort, High Effort
```

**Pro Tip**: Start with "Low Effort" filter to find quick wins!

## Example Analysis

### Input: GitHub API Subset

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Repository API",
    "version": "1.0.0"
  },
  "paths": {
    "/repos/{owner}/{repo}": {
      "get": {
        "summary": "Get repository"
      }
    },
    "/repos/{owner}/{repo}/issues": {
      "get": {
        "summary": "List issues"
      }
    }
  }
}
```

### Output: Identified Opportunities

**Quick Win Example:**

```
📍 Missing CRUD Operations
🟢 Effort: Low | 🚀 Impact: High

Missing POST, PUT, DELETE operations for repositories. Users can only 
view repositories but cannot create, update, or delete them through 
the API.

Affected Endpoints:
- GET /repos/{owner}/{repo}

Implementation:
Add POST /repos to create repositories, PUT /repos/{owner}/{repo} to 
update, and DELETE /repos/{owner}/{repo} to remove.

Example:
POST /repos
{
  "name": "my-new-repo",
  "description": "Repository created via API",
  "private": false
}
```

**Composite Endpoint Example:**

```
📍 Composite Endpoint
🟡 Effort: Medium | 🚀 Impact: High

Create a composite endpoint that creates a repository and initializes 
it with issues in a single operation.

Affected Endpoints:
- GET /repos/{owner}/{repo}
- GET /repos/{owner}/{repo}/issues

Implementation:
POST /repos/initialize
{
  "repo": { "name": "...", "description": "..." },
  "issues": [{ "title": "...", "body": "..." }]
}

This reduces API calls and ensures atomic operations.
```

## Best Practices

### 1. Start with Quick Wins
Focus on opportunities marked as low effort and high impact. These provide immediate value with minimal investment.

### 2. Prioritize by Business Value
Not all high-impact opportunities are equal. Consider:
- User demand
- Competitive advantages
- Technical debt reduction
- Developer experience improvements

### 3. Consider Dependencies
Some opportunities build on others. For example:
- Authentication might be needed before rate limiting
- Basic CRUD before batch operations
- Webhooks might require event logging

### 4. Re-analyze Periodically
As your API evolves, run the analysis again to:
- Find new opportunities
- Validate implemented features
- Identify emerging patterns

### 5. Share with Team
Export or discuss findings with:
- Product managers (for roadmap planning)
- Developers (for implementation estimates)
- API consumers (for feedback on priorities)

## Technical Details

### API Endpoint

```
POST /api/openapi/analyze-opportunities
Content-Type: application/json

{
  "spec": { /* OpenAPI specification object */ }
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "apiName": "Repository API",
    "apiVersion": "1.0.0",
    "totalEndpoints": 2,
    "analyzedAt": 1704067200000,
    "opportunities": [...],
    "summary": {
      "totalOpportunities": 8,
      "byCategory": { "missing_crud": 3, ... },
      "byEffort": { "low": 2, "medium": 4, "high": 2 },
      "byImpact": { "low": 1, "medium": 3, "high": 4 },
      "quickWins": [...]
    }
  }
}
```

### AI Model

- **Model**: GPT-4 (gpt-4o)
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 8192
- **Response Format**: JSON

### Component Architecture

```
OpportunityDiscovery (Main Component)
├── Summary Dashboard (Cards)
├── Filters (Category, Effort)
└── Opportunity List
    └── OpportunityCard (Expandable)
        ├── Header (Title, Badges)
        ├── Description
        └── Details (Rationale, Endpoints, Implementation)
```

## Limitations

1. **API Key Required**: Requires valid OpenAI API key in environment
2. **Analysis Time**: Large APIs (100+ endpoints) may take longer
3. **AI Suggestions**: Review suggestions critically - AI may not understand domain-specific constraints
4. **Internet Required**: Backend must reach OpenAI API

## Troubleshooting

### "Failed to analyze API opportunities"

**Possible causes:**
- Missing or invalid OpenAI API key
- Network issues connecting to OpenAI
- OpenAPI spec is malformed

**Solutions:**
1. Verify `OPENAI_API_KEY` in `.env`
2. Check internet connectivity
3. Validate OpenAPI spec with [Swagger Editor](https://editor.swagger.io/)

### Analysis returns no opportunities

**Possible causes:**
- Very complete, well-designed API
- API is too small (1-2 endpoints)

**Solutions:**
- Try with a larger API
- Check if spec includes all endpoint details (parameters, schemas)

### Opportunities seem generic

**Possible causes:**
- Spec lacks detailed descriptions
- Missing schema definitions

**Solutions:**
- Add detailed descriptions to endpoints
- Include full schema definitions in components
- Provide operation summaries and tags

## Future Enhancements

Planned improvements:

- [ ] Export opportunities to CSV/PDF
- [ ] Integration with project management tools
- [ ] Opportunity ranking based on custom criteria
- [ ] Implementation cost estimation
- [ ] Code generation for selected opportunities
- [ ] Collaboration features (comments, voting)
- [ ] Historical tracking of implemented opportunities
- [ ] API comparison (analyze multiple APIs together)

## Feedback

Found a bug or have a suggestion? [Open an issue](https://github.com/rkendel1/Boltq/issues) on GitHub!

---

**Happy API building!** 🚀
