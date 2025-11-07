# Natural Language Flow Builder - Usage Guide

## Quick Start

This guide demonstrates how to use the Natural Language Flow Builder feature to create API workflows using plain English descriptions.

## Step-by-Step Tutorial

### Step 1: Upload Your OpenAPI Specification

1. Navigate to the `/openapi-builder` page
2. Click on "Upload API Specification" or provide an OpenAPI spec URL
3. Wait for the specification to be processed

### Step 2: Access the Natural Language Flow Builder

Once your API specification is loaded:

1. Look for the "Natural Language" button in the action buttons section
2. The button will have a purple/blue gradient and a magic wand icon
3. Click the button to open the Natural Language Flow Builder modal

### Step 3: Describe Your Desired Flow

In the modal that appears:

1. **Enter your description**: In the large text area, describe what you want to achieve in plain English
2. **Use example prompts**: Click on any of the example prompts to populate the text area with pre-written examples
3. **Be specific**: The more detailed your description, the better the AI can understand your intent

#### Example Descriptions:

**Simple User Creation Flow:**
```
Create a new user account, send them a welcome email, and add them to the default group
```

**Data Processing Flow:**
```
Get all pending orders, validate inventory for each, and send shipping notifications
```

**Analytics Flow:**
```
Retrieve user data, calculate their lifetime value, and update their customer tier
```

**Multi-Step Integration:**
```
Upload a file, process it through the validation endpoint, store the results, and send a completion notification
```

### Step 4: Generate the Workflow

1. Click the **"Generate Workflow"** button
2. Wait for the AI to analyze your description and the available endpoints
3. The AI will:
   - Select the most relevant endpoints
   - Determine the optimal order to call them
   - Identify dependencies between steps
   - Provide reasoning for each selection

### Step 5: Review the Generated Workflow

The results will show:

1. **Workflow Details**:
   - Auto-generated workflow name
   - Description of what the workflow does
   
2. **Workflow Steps**:
   - Each endpoint in the sequence
   - HTTP method and path
   - Step number and order
   - AI reasoning for why each endpoint was chosen

3. **AI Explanation**:
   - Overall explanation of the workflow logic
   - How data flows between steps
   - Dependencies and conditional logic

### Step 6: Use the Workflow

1. Review the generated workflow to ensure it matches your intent
2. Click **"Use This Workflow"** to add it to your workspace
3. The workflow is now ready to be:
   - Executed immediately
   - Further customized with parameter mapping
   - Saved for later use

## Advanced Features

### Conditional Logic

The AI can understand complex flows with conditional logic:

```
If the user's account is verified, send a premium welcome email, 
otherwise send a standard welcome email and request verification
```

### Parameter Dependencies

The AI automatically detects when one step's output should be used as another step's input:

```
Create a user and use their ID to create a profile, 
then use both IDs to send a welcome notification
```

### Error Handling Workflows

Describe error handling scenarios:

```
Try to process the payment, if it fails, log the error and 
send a failure notification to the user
```

## Tips for Best Results

1. **Be Specific**: Include details about what data you're working with
2. **Use Sequential Language**: Words like "then", "after", "once" help the AI understand order
3. **Mention Dependencies**: Explicitly state when one action depends on another
4. **Include Business Logic**: Describe the "why" not just the "what"
5. **Test Incrementally**: Start with simple flows and add complexity

## Common Use Cases

### 1. User Onboarding
```
Register a new user, create their profile with default settings, 
send a welcome email, and subscribe them to the newsletter
```

### 2. Order Fulfillment
```
Create an order, validate payment, update inventory, 
generate shipping label, and send order confirmation
```

### 3. Data Synchronization
```
Fetch data from the source system, transform it to match our schema, 
validate the data, and upload to the destination
```

### 4. Reporting Workflow
```
Gather user activity data, aggregate statistics, generate a report, 
and email it to administrators
```

### 5. Content Management
```
Upload media files, process and optimize them, generate thumbnails, 
update the content database, and invalidate the cache
```

## Troubleshooting

### "No endpoints match your description"

**Problem**: The AI couldn't find relevant endpoints for your description.

**Solutions**:
- Make your description more specific
- Use terminology that matches your API's endpoint names
- Try breaking complex flows into simpler parts
- Check that your OpenAPI spec was uploaded correctly

### "Generated workflow doesn't match expectations"

**Problem**: The AI selected the wrong endpoints or wrong order.

**Solutions**:
- Provide more context in your description
- Be explicit about the order of operations
- Mention specific endpoint names if you know them
- Use the Parameter Mapping UI to refine the workflow after generation

### "API key not configured" error

**Problem**: OpenAI API key is missing.

**Solutions**:
- Ensure `OPENAI_API_KEY` is set in your `.env` file
- Restart the development server after adding the key
- Verify the key is valid and has sufficient credits

## Example Workflows

### Example 1: E-Commerce Checkout

**Input:**
```
When a customer checks out, validate their cart, process payment, 
create the order record, send order confirmation email, and 
update inventory quantities
```

**Generated Workflow:**
1. POST /cart/validate - Validate cart items
2. POST /payments/process - Process payment
3. POST /orders - Create order record
4. POST /emails/send - Send confirmation
5. PUT /inventory/bulk-update - Update stock levels

### Example 2: Customer Support Ticket

**Input:**
```
Create a support ticket from the user's message, assign it to 
the appropriate team based on category, send acknowledgment to user, 
and create a task in the project management system
```

**Generated Workflow:**
1. POST /tickets - Create support ticket
2. POST /tickets/{id}/assign - Assign to team
3. POST /notifications/email - Send acknowledgment
4. POST /integrations/pm/tasks - Create PM task

### Example 3: Content Publication

**Input:**
```
Draft article goes through approval process, then gets published 
to the website, shared on social media, and subscribers are notified
```

**Generated Workflow:**
1. PUT /articles/{id}/status - Submit for approval
2. GET /articles/{id}/approval-status - Check approval
3. POST /articles/{id}/publish - Publish to website
4. POST /social/share - Share on social media
5. POST /notifications/subscribers - Notify subscribers

## Integration with Other Features

The Natural Language Flow Builder works seamlessly with:

- **Parameter Mapping UI**: Refine how data flows between steps
- **Workflow Execution UI**: Test and run your generated workflows
- **Template Library**: Save generated workflows as templates
- **Dynamic Flow Generator**: Combine with form-based flow generation

## Best Practices

1. **Start Simple**: Begin with 2-3 step workflows before building complex ones
2. **Iterate**: Generate a workflow, test it, then refine your description
3. **Document Intent**: The AI's explanations can serve as workflow documentation
4. **Combine Approaches**: Use natural language for initial generation, then refine with other tools
5. **Version Control**: Save different versions as you refine your workflow descriptions

## API Reference

For developers who want to integrate this feature programmatically, see the [Natural Language Flow API documentation](./NATURAL_LANGUAGE_FLOW.md#api-endpoint).

## Feedback and Improvements

This feature learns from the patterns in your API specification. The more descriptive your OpenAPI spec (with good summaries and descriptions), the better the AI can understand and suggest workflows.

If you find that certain types of flows aren't being generated correctly, consider:
- Improving endpoint descriptions in your OpenAPI spec
- Using more specific terminology in your descriptions
- Providing examples of expected input/output in your descriptions
