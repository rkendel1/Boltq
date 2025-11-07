# New Features Guide

This guide demonstrates the newly implemented features for the OpenAPI Workflow Builder.

## 1. Workflow Execution UI

The Workflow Execution UI provides a visual interface for testing and running workflows with real-time status updates.

### Features:
- **Real-time Status**: See each step's progress as it executes
- **Duration Tracking**: Monitor how long each step takes
- **Result Visualization**: View JSON output from each step
- **Error Handling**: Clear error messages if a step fails
- **Step Details**: Expandable view for detailed results

### How to Use:
1. Create or select a workflow
2. Click the "Execute" button in the main workspace
3. Watch as each step executes sequentially
4. Expand steps to view detailed results or errors
5. Re-run the workflow as needed

### Visual Indicators:
- ⏰ **Clock Icon**: Step is pending
- 🔵 **Spinning Loader**: Step is currently running
- ✅ **Green Check**: Step completed successfully
- ❌ **Red X**: Step failed with error

---

## 2. Parameter Mapping UI

The Parameter Mapping UI allows you to visually connect outputs from one step to inputs of another step.

### Features:
- **Visual Flow Builder**: See all workflow steps
- **Parameter Connections**: Link outputs to inputs with arrows
- **Conditional Logic**: Add conditions to control flow
- **Drag-and-Drop** (conceptual): Easy parameter mapping

### How to Use:
1. Select a workflow
2. Click "Parameter Map" button
3. Select a "From Step" and specify output parameter
4. Select a "To Step" and specify input parameter
5. Add conditional logic if needed
6. Save mappings to update workflow

### Example Mapping:
```
Step 1: POST /auth/login
  Output: token

    ↓ (mapped to)

Step 2: GET /users/me
  Input: authToken
```

---

## 3. Workflow Templates Library

Pre-built workflow templates for common API patterns.

### Available Templates:

#### 🔐 User Authentication Flow
- Login → Token Validation → Profile Fetch
- **Uses**: 1,523 times
- **Rating**: 4.8/5

#### 💳 Payment Checkout Flow
- Cart Validation → Payment Intent → Order Creation
- **Uses**: 2,341 times
- **Rating**: 4.9/5

#### 👤 User CRUD Operations
- List Users → Create User → Update User
- **Uses**: 892 times
- **Rating**: 4.6/5

#### 🔄 Data Synchronization
- Fetch Source → Validate → Sync Destination
- **Uses**: 1,156 times
- **Rating**: 4.7/5

#### 📬 Multi-Channel Notification
- Email → SMS notifications
- **Uses**: 2,789 times
- **Rating**: 4.5/5

#### 📊 Report Generation & Export
- Fetch Analytics → Generate Report → Email Report
- **Uses**: 645 times
- **Rating**: 4.4/5

### How to Use:
1. Click "Templates" button in workspace
2. Search or filter by category
3. Click a template to select it
4. Template auto-populates a new workflow
5. Customize the workflow as needed

---

## 4. Dynamic Flow Generator

AI-powered form generation for creating workflows based on predefined patterns.

### Supported Flow Types:

#### 🔐 Authentication Flow
- Success URL
- JWT Secret
- QR Code enabled (toggle)

#### 💳 Payment Flow
- Card Title
- Price
- Features (array)
- Button Text & Link
- Badge
- Featured (toggle)

#### 🤖 Chatbot Flow
- Welcome Message
- Initial Questions (multi-line)

#### 🔄 Data Sync Flow
- Source Endpoint
- Destination Endpoint
- Sync Interval
- Validate Data (toggle)

#### 📬 Notification Flow
- Channels (array)
- Template ID
- Priority (select: low/normal/high/urgent)

### How to Use:
1. Click "Dynamic Flow" button
2. Select a flow type
3. Fill in the form fields
4. View JSON preview at bottom
5. Click "Generate Flow" to create

### JSON Output Example:
```json
{
  "name": "My Auth Flow",
  "app_id": "app_12345",
  "component_type": "qr_auth",
  "success_url_a": "https://example.com/success",
  "jwt_secret": "my-secret-key",
  "qr_code_enabled": true
}
```

---

## 5. YAML Support

Automatic YAML to JSON conversion for OpenAPI specifications.

### Features:
- **Auto-Detection**: Automatically detects file format
- **YAML Parsing**: Converts YAML to JSON internally
- **Validation**: Ensures valid OpenAPI specification
- **Support for**: OpenAPI 3.x and Swagger 2.0

### How to Use:
1. Upload a `.yaml` or `.yml` file
2. System automatically detects format
3. Converts to JSON for processing
4. Works seamlessly with all features

### Supported Formats:
```yaml
# YAML format
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
```

or

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "My API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "List users"
      }
    }
  }
}
```

---

## 6. Enhanced Workspace

The main workspace now includes quick action buttons for all features.

### Action Buttons:

📋 **Templates** - Browse pre-built workflow templates
✨ **Dynamic Flow** - Generate workflows with AI-powered forms
🔀 **Parameter Map** - Connect parameters between steps
▶️ **Execute** - Run workflow with real-time status

### Workflow:
1. **Upload** OpenAPI spec (JSON or YAML)
2. **Browse** available endpoints
3. **Create** workflow (manually or from template)
4. **Map** parameters between steps
5. **Execute** and monitor in real-time
6. **Refine** based on results

---

## Tips and Best Practices

### For Workflow Execution:
- Start with simple 2-3 step workflows
- Test each step independently first
- Use parameter mapping for dynamic data flow
- Monitor execution times to optimize performance

### For Parameter Mapping:
- Use descriptive parameter names
- Test connections with sample data
- Add conditional logic for error handling
- Document complex mappings

### For Templates:
- Start with a template closest to your need
- Customize step parameters for your API
- Save successful workflows as new templates
- Share templates with your team

### For Dynamic Flows:
- Choose the right flow type for your use case
- Fill all required fields (marked with *)
- Use the JSON preview to verify structure
- Test generated flows before production use

### For YAML Support:
- Validate YAML syntax before uploading
- Ensure proper indentation
- Include all required OpenAPI fields
- Use YAML for better readability

---

## Keyboard Shortcuts

(Future enhancement - to be implemented)

- `Ctrl/Cmd + E` - Execute current workflow
- `Ctrl/Cmd + M` - Open parameter mapping
- `Ctrl/Cmd + T` - Open templates library
- `Ctrl/Cmd + N` - Create new workflow
- `Ctrl/Cmd + S` - Save workflow

---

## Troubleshooting

### Workflow Execution Issues:
- **Problem**: Step fails immediately
- **Solution**: Check parameter values and endpoint availability

- **Problem**: Timeout errors
- **Solution**: Increase timeout in backend service or optimize API calls

### Parameter Mapping Issues:
- **Problem**: Data not flowing between steps
- **Solution**: Verify parameter names match exactly (case-sensitive)

- **Problem**: Conditional logic not working
- **Solution**: Test condition expressions with sample data

### Template Issues:
- **Problem**: Template doesn't fit my API
- **Solution**: Use as starting point and customize steps

### YAML Issues:
- **Problem**: YAML parsing errors
- **Solution**: Validate YAML syntax using online validator

---

## Future Enhancements

Coming soon:
- **Workflow Versioning**: Track changes to workflows over time
- **Collaborative Editing**: Share workflows with team members
- **Workflow Marketplace**: Community-contributed templates
- **Visual Flow Diagram**: Graph view of workflow execution
- **Performance Analytics**: Track workflow execution metrics
- **Webhook Integration**: Trigger workflows from external events

---

For more information, see the [Integration Guide](MAGOC_INTEGRATION.md) and [Integration Summary](INTEGRATION_SUMMARY.md).
