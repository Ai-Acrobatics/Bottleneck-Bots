# Workflow Execution Engine

This document describes the Workflow Execution Engine implementation for running automated browser workflows.

## Overview

The Workflow Execution Engine provides a robust system for executing multi-step browser automation workflows using Browserbase and Stagehand. It supports various step types, variable substitution, error handling, and execution tracking.

## Architecture

### Core Components

1. **workflowExecution.service.ts** - Main execution service with step handlers
2. **workflows.ts** - TRPC API endpoints for workflow management
3. **Database Tables** - Already defined in `drizzle/schema.ts`:
   - `automation_workflows` - Workflow definitions
   - `workflow_executions` - Execution tracking
   - `browser_sessions` - Browser session metadata
   - `extracted_data` - Data extracted during execution

### Key Features

- **Step-by-step execution** with progress tracking
- **Variable substitution** using `{{variableName}}` syntax
- **Error handling** with `continueOnError` support
- **Browser session management** with automatic cleanup
- **Data extraction** with predefined schemas (contactInfo, productInfo)
- **Execution cancellation** for running workflows
- **Comprehensive logging** of step results

## Step Types

### 1. Navigate Step
Navigate browser to a URL.

```typescript
{
  type: "navigate",
  order: 0,
  config: {
    url: "https://example.com",
    continueOnError: false
  }
}
```

### 2. Act Step
Perform an action on the page using natural language.

```typescript
{
  type: "act",
  order: 1,
  config: {
    instruction: "Click the login button",
    continueOnError: false
  }
}
```

### 3. Observe Step
Get available actions from the current page.

```typescript
{
  type: "observe",
  order: 2,
  config: {
    observeInstruction: "What can I do on this page?",
    continueOnError: false
  }
}
```

### 4. Extract Step
Extract structured data from the page.

```typescript
{
  type: "extract",
  order: 3,
  config: {
    extractInstruction: "Extract contact information from this page",
    schemaType: "contactInfo", // or "productInfo" or "custom"
    saveAs: "extractedContacts", // Optional: save to variable
    continueOnError: false
  }
}
```

**Supported schemas:**
- `contactInfo`: email, phone, address, name, company
- `productInfo`: name, price, description, availability, sku, rating
- `custom`: Free-form extraction

### 5. Wait Step
Wait for a specific time or element to appear.

```typescript
// Wait for time
{
  type: "wait",
  order: 4,
  config: {
    waitMs: 3000,
    continueOnError: false
  }
}

// Wait for element
{
  type: "wait",
  order: 4,
  config: {
    selector: ".modal-dialog",
    waitMs: 10000, // Max wait time
    continueOnError: false
  }
}
```

### 6. Condition Step
Evaluate a condition to control workflow flow.

```typescript
{
  type: "condition",
  order: 5,
  config: {
    condition: "{{hasResults}}", // Check variable existence
    continueOnError: false
  }
}
```

### 7. Loop Step
Iterate over an array of items.

```typescript
{
  type: "loop",
  order: 6,
  config: {
    items: ["item1", "item2", "item3"], // or {{variableName}}
    continueOnError: false
  }
}
```

**Loop variables:**
- `{{__loopItem}}` - Current item
- `{{__loopIndex}}` - Current index

### 8. API Call Step
Make HTTP requests to external APIs.

```typescript
{
  type: "apiCall",
  order: 7,
  config: {
    url: "https://api.example.com/data",
    method: "POST",
    headers: {
      "Authorization": "Bearer {{apiToken}}",
      "Content-Type": "application/json"
    },
    body: {
      "query": "{{searchTerm}}"
    },
    saveAs: "apiResponse", // Save response to variable
    continueOnError: false
  }
}
```

### 9. Notification Step
Send notifications (logged to console in current implementation).

```typescript
{
  type: "notification",
  order: 8,
  config: {
    message: "Workflow completed successfully!",
    type: "success", // info, success, warning, error
    continueOnError: false
  }
}
```

## Variable Substitution

Variables can be used throughout workflow steps using `{{variableName}}` syntax:

```typescript
// Input variables
const variables = {
  searchTerm: "example",
  apiToken: "abc123"
};

// Use in steps
{
  type: "navigate",
  config: {
    url: "https://example.com/search?q={{searchTerm}}"
  }
}
```

Variables can be set by:
1. Initial execution input
2. Step results using `saveAs` config
3. Extracted data
4. API call responses

## API Endpoints

### Execute Workflow

Start a workflow execution.

```typescript
// TRPC mutation
await trpc.workflows.execute.mutate({
  workflowId: 123,
  variables: {
    searchTerm: "example",
    maxResults: 10
  },
  geolocation: {
    city: "San Francisco",
    state: "CA",
    country: "US"
  }
});

// Response
{
  success: true,
  executionId: 456,
  workflowId: 123,
  status: "completed",
  stepResults: [...],
  output: {
    extractedData: [...],
    finalVariables: {...}
  }
}
```

### Get Executions

List execution history for a workflow.

```typescript
await trpc.workflows.getExecutions.query({
  workflowId: 123,
  status: "completed", // optional filter
  limit: 20,
  offset: 0
});
```

### Get Execution

Get detailed status of a specific execution.

```typescript
await trpc.workflows.getExecution.query({
  executionId: 456
});

// Response
{
  executionId: 456,
  workflowId: 123,
  status: "completed",
  startedAt: Date,
  completedAt: Date,
  currentStep: 5,
  stepResults: [...],
  output: {...},
  error: null
}
```

### Cancel Execution

Cancel a running workflow execution.

```typescript
await trpc.workflows.cancelExecution.mutate({
  executionId: 456
});
```

## Error Handling

### Step-Level Error Handling

Each step can have `continueOnError` set to true to continue execution even if the step fails:

```typescript
{
  type: "extract",
  config: {
    extractInstruction: "Extract optional data",
    continueOnError: true // Continue even if extraction fails
  }
}
```

### Execution-Level Error Handling

- Failed steps are logged in `stepResults`
- Execution status is updated to `"failed"`
- Browser sessions are automatically cleaned up
- Error details are stored in the execution record

## Database Schema

The required tables are already defined in `drizzle/schema.ts`:

### workflow_executions

```typescript
{
  id: number,
  workflowId: number,
  sessionId: number,
  userId: number,
  status: "pending" | "running" | "completed" | "failed" | "cancelled",
  input: Record<string, any>,
  output: Record<string, any>,
  error: string,
  startedAt: Date,
  completedAt: Date,
  duration: number,
  stepResults: Array<StepResult>,
  createdAt: Date,
  updatedAt: Date
}
```

### browser_sessions

```typescript
{
  id: number,
  userId: number,
  sessionId: string, // Browserbase session ID
  status: "active" | "completed" | "failed" | "cancelled",
  url: string,
  projectId: string,
  debugUrl: string,
  recordingUrl: string,
  metadata: Record<string, any>,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### extracted_data

```typescript
{
  id: number,
  sessionId: number,
  executionId: number,
  userId: number,
  url: string,
  dataType: string,
  selector: string,
  data: Record<string, any>,
  metadata: Record<string, any>,
  tags: string[],
  createdAt: Date
}
```

## Usage Examples

### Example 1: Web Scraping Workflow

```typescript
const workflow = {
  name: "Scrape Product Information",
  description: "Extract product details from an e-commerce site",
  steps: [
    {
      type: "navigate",
      order: 0,
      config: {
        url: "{{productUrl}}"
      }
    },
    {
      type: "wait",
      order: 1,
      config: {
        selector: ".product-details",
        waitMs: 5000
      }
    },
    {
      type: "extract",
      order: 2,
      config: {
        extractInstruction: "Extract product information",
        schemaType: "productInfo",
        saveAs: "productData"
      }
    },
    {
      type: "notification",
      order: 3,
      config: {
        message: "Product scraped: {{productData.name}}",
        type: "success"
      }
    }
  ]
};

// Execute
await executeWorkflow({
  workflowId: workflow.id,
  userId: currentUser.id,
  variables: {
    productUrl: "https://example.com/products/123"
  }
});
```

### Example 2: Lead Generation with API Integration

```typescript
const workflow = {
  name: "Lead Generation and CRM Sync",
  steps: [
    {
      type: "navigate",
      order: 0,
      config: { url: "{{targetUrl}}" }
    },
    {
      type: "extract",
      order: 1,
      config: {
        extractInstruction: "Extract all contact information",
        schemaType: "contactInfo",
        saveAs: "contacts"
      }
    },
    {
      type: "apiCall",
      order: 2,
      config: {
        url: "{{crmApiUrl}}/contacts",
        method: "POST",
        headers: {
          "Authorization": "Bearer {{crmToken}}"
        },
        body: "{{contacts}}",
        saveAs: "crmResponse"
      }
    },
    {
      type: "notification",
      order: 3,
      config: {
        message: "Added {{contacts.length}} contacts to CRM",
        type: "success"
      }
    }
  ]
};
```

### Example 3: Conditional Workflow

```typescript
const workflow = {
  name: "Conditional Processing",
  steps: [
    {
      type: "navigate",
      order: 0,
      config: { url: "{{url}}" }
    },
    {
      type: "extract",
      order: 1,
      config: {
        extractInstruction: "Check if product is in stock",
        saveAs: "availability"
      }
    },
    {
      type: "condition",
      order: 2,
      config: {
        condition: "{{availability.inStock}}"
      }
    },
    {
      type: "act",
      order: 3,
      config: {
        instruction: "Add product to cart",
        continueOnError: true // Continue if already in cart
      }
    },
    {
      type: "notification",
      order: 4,
      config: {
        message: "Product added to cart",
        type: "success"
      }
    }
  ]
};
```

## Performance Considerations

1. **Browser Session Reuse**: Consider implementing session pooling for frequently executed workflows
2. **Caching**: Workflow definitions are cached for 5 minutes using the cache service
3. **Timeouts**: Configure appropriate timeouts for each step (default 60s for waits)
4. **Parallel Execution**: Current implementation runs steps sequentially; consider parallelization for independent steps

## Future Enhancements

1. **Subworkflows**: Call other workflows as steps
2. **Branching**: Support if/else logic based on conditions
3. **Parallel Steps**: Execute multiple steps concurrently
4. **Retry Logic**: Automatic retry for failed steps
5. **Webhooks**: Trigger workflows via webhooks
6. **Scheduled Execution**: Cron-based workflow triggers
7. **Real-time Updates**: WebSocket support for live execution updates
8. **Step Templates**: Reusable step configurations
9. **Visual Builder**: Drag-and-drop workflow designer
10. **Advanced Notifications**: Email, SMS, Slack integration

## Testing

To test the workflow execution engine:

```typescript
// Create a simple test workflow
const testWorkflow = await trpc.workflows.create.mutate({
  name: "Test Workflow",
  steps: [
    {
      type: "navigate",
      order: 0,
      config: { url: "https://example.com" }
    },
    {
      type: "extract",
      order: 1,
      config: {
        extractInstruction: "Extract the page title"
      }
    }
  ]
});

// Execute it
const execution = await trpc.workflows.execute.mutate({
  workflowId: testWorkflow.id
});

// Check results
console.log(execution.stepResults);
```

## Troubleshooting

### Common Issues

1. **Browser session timeout**: Increase timeout in Browserbase config
2. **Step fails silently**: Check stepResults for error details
3. **Variable not substituted**: Ensure variable exists in context
4. **Extraction returns empty**: Verify page content and instruction clarity

### Debugging

Enable verbose logging in Stagehand:

```typescript
const stagehand = new Stagehand({
  verbose: 2, // 0=off, 1=basic, 2=detailed
  // ...other config
});
```

View live browser session:
- Check `debugUrl` in browser_sessions table
- Access Browserbase dashboard for session recording

## Security Considerations

1. **API Keys**: Store securely in environment variables
2. **User Isolation**: Workflows only accessible by owner
3. **Rate Limiting**: Implement rate limits on execution endpoints
4. **Input Validation**: All inputs validated with Zod schemas
5. **Session Cleanup**: Automatic cleanup prevents resource leaks

## Support

For issues or questions:
1. Check execution logs in `workflow_executions` table
2. Review step results for error details
3. Verify workflow configuration matches schema
4. Test individual steps in isolation
