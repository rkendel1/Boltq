# Natural Language Flow Builder

## Overview

The Natural Language Flow Builder feature allows users to describe their desired workflow or outcome in plain English, and AI will automatically determine which API endpoints to use and in what order to call them.

## How It Works

1. **Upload an OpenAPI Specification**: First, upload your API's OpenAPI/Swagger specification using the API spec uploader
2. **Open Natural Language Flow Builder**: Click on the "Natural Language" button in the OpenAPI Workspace
3. **Describe Your Flow**: Enter a natural language description of what you want to achieve
4. **AI Analysis**: The system uses GPT-4 to analyze your description and:
   - Identify relevant endpoints from the available API
   - Determine the optimal order to call them
   - Suggest parameter mappings and dependencies
   - Provide reasoning for each endpoint selection
5. **Review and Use**: Review the AI-generated workflow and use it in your application

## Example Use Cases

### Example 1: User Onboarding
```
Input: "Create a new user account, send them a welcome email, and add them to the default group"

AI Output:
1. POST /users - Create user account
2. POST /emails/send - Send welcome email (depends on user ID from step 1)
3. POST /groups/{groupId}/members - Add user to group (depends on user ID from step 1)
```

### Example 2: Order Processing
```
Input: "Get all pending orders, validate inventory for each, and send shipping notifications"

AI Output:
1. GET /orders?status=pending - Retrieve pending orders
2. POST /inventory/validate - Check inventory availability (for each order)
3. POST /notifications/shipping - Send shipping notifications (for validated orders)
```

### Example 3: Data Analytics
```
Input: "Retrieve user data, calculate their lifetime value, and update their customer tier"

AI Output:
1. GET /users/{userId} - Get user information
2. GET /orders?userId={userId} - Fetch user's order history
3. POST /analytics/ltv - Calculate lifetime value
4. PUT /users/{userId}/tier - Update customer tier based on LTV
```

## Features

- **Intelligent Endpoint Selection**: AI analyzes available endpoints and selects the most appropriate ones
- **Automatic Ordering**: Determines the correct sequence based on dependencies
- **Parameter Mapping**: Suggests how data should flow between steps
- **Reasoning Explanation**: Provides clear explanations for why each endpoint was chosen
- **Interactive UI**: User-friendly interface with example prompts

## API Endpoint

### POST /api/workflows/generate-from-nl

Generate a workflow from natural language description.

**Request Body:**
```json
{
  "description": "String describing the desired flow or outcome",
  "endpoints": [/* Array of available APIEndpoint objects */],
  "specId": "ID of the OpenAPI specification"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflow": {
      "name": "Generated Workflow Name",
      "description": "What this workflow does",
      "steps": [
        {
          "id": "step-0",
          "endpointId": "endpoint_id",
          "order": 0,
          "reasoning": "Why this endpoint was selected",
          "parameters": {},
          "conditionalLogic": { "condition": "depends on ..." }
        }
      ]
    },
    "explanation": "Detailed explanation of the workflow logic",
    "aiReasoning": [
      {
        "endpointId": "endpoint_id",
        "reasoning": "Why this endpoint was chosen"
      }
    ]
  }
}
```

## Components

### NaturalLanguageFlowBuilder

React component that provides the UI for natural language workflow generation.

**Props:**
- `specId`: String - ID of the OpenAPI specification
- `endpoints`: APIEndpoint[] - Array of available endpoints
- `onWorkflowGenerated?`: Callback function when workflow is generated
- `onClose?`: Callback function to close the modal

**Example Usage:**
```tsx
<NaturalLanguageFlowBuilder
  specId={currentSpecId}
  endpoints={availableEndpoints}
  onWorkflowGenerated={(workflow) => {
    console.log('Generated workflow:', workflow);
  }}
  onClose={() => setShowNLFlowBuilder(false)}
/>
```

## Integration in OpenAPIWorkspace

The Natural Language Flow Builder is integrated into the main OpenAPI Workspace as a prominent button that appears after uploading an API specification:

```tsx
{currentSpecId && availableEndpoints.length > 0 && (
  <button onClick={() => setShowNLFlowBuilder(true)}>
    Natural Language Flow Builder
  </button>
)}
```

## Technical Implementation

### AI Model
- Uses OpenAI GPT-4 for natural language understanding
- Analyzes endpoint metadata (method, path, parameters, descriptions)
- Returns structured JSON with workflow steps

### System Prompt
The AI is given a specialized system prompt that:
- Defines its role as an API workflow expert
- Specifies the JSON output format
- Instructs it to analyze intent, select endpoints, determine order, and map parameters

### Security Considerations
- Input validation on all API requests
- Rate limiting should be applied (recommended)
- OpenAI API key must be configured in environment variables
- No user data is sent to OpenAI except the flow description

## Environment Variables

Required environment variable:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for conditional logic and branching workflows
- [ ] Ability to save and reuse natural language templates
- [ ] Multi-language support beyond English
- [ ] Integration with workflow execution and testing
- [ ] Learning from user feedback to improve suggestions
- [ ] Support for complex parameter transformations
- [ ] Version control for generated workflows

## Troubleshooting

### "Failed to generate workflow"
- Ensure OpenAI API key is properly configured
- Check that the description is clear and specific
- Verify that endpoints are available and properly loaded

### Incorrect endpoint selection
- Provide more specific details in your description
- Include expected inputs/outputs in the description
- Try breaking complex flows into simpler parts

### Missing dependencies
- The AI should automatically detect dependencies
- If not, you can manually edit the workflow after generation
- Use the Parameter Mapping UI to refine dependencies
