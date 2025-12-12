# Task Execution System

This document describes the comprehensive task execution system that powers the agency automation platform.

## Overview

The Task Execution Service handles the execution of various task types created through webhooks, manual creation, or scheduled automation. Tasks are stored in the database and executed based on their type, configuration, and scheduling requirements.

## Architecture

### Core Components

1. **Task Execution Service** (`server/services/taskExecution.service.ts`)
   - Main execution orchestrator
   - Handles task lifecycle management
   - Routes tasks to appropriate handlers
   - Manages execution history and error handling

2. **Agency Tasks Router** (`server/api/routers/agencyTasks.ts`)
   - TRPC API endpoints for task management
   - Task creation, listing, updating, and deletion
   - Human review workflow (approve/reject)
   - Manual task execution trigger

3. **Database Schema** (`drizzle/schema-webhooks.ts`)
   - `agency_tasks`: Main task storage
   - `task_executions`: Execution history and logs
   - `outbound_messages`: Notification and response queue

## Supported Task Types

### 1. Browser Automation (`browser_automation`)

Executes browser-based automation using Browserbase and Stagehand.

**Configuration Example:**
```json
{
  "automationSteps": [
    {
      "type": "navigate",
      "config": { "url": "https://example.com" }
    },
    {
      "type": "click",
      "config": { "selector": "#submit-button" }
    },
    {
      "type": "extract",
      "config": { "instruction": "Extract the page title and main content" }
    }
  ]
}
```

**Supported Actions:**
- `navigate`: Navigate to URL
- `click`: Click element by selector or AI instruction
- `type`: Fill input fields
- `extract`: Extract data using AI
- `wait`: Wait for specified duration
- `screenshot`: Capture screenshot

### 2. API Call (`api_call`)

Makes HTTP requests to external APIs with authentication support.

**Configuration Example:**
```json
{
  "apiEndpoint": "https://api.example.com/v1/resource",
  "apiMethod": "POST",
  "apiPayload": {
    "key": "value"
  },
  "authType": "bearer",
  "bearerToken": "your-token-here",
  "customHeaders": {
    "X-Custom-Header": "value"
  },
  "timeout": 30000
}
```

**Authentication Types:**
- `bearer`: Bearer token authentication
- `api_key`: Custom API key header
- `basic`: HTTP Basic authentication
- `none`: No authentication

### 3. GoHighLevel Action (`ghl_action`)

Integrates with GoHighLevel CRM API.

**Configuration Example:**
```json
{
  "ghlAction": "add_contact",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "customFields": {
    "company": "Acme Inc"
  }
}
```

**Supported Actions:**
- `add_contact`: Create new contact
- `update_contact`: Update existing contact
- `send_sms`: Send SMS to contact
- `create_opportunity`: Create sales opportunity
- `add_tag`: Add tags to contact

**Environment Variables:**
```bash
GHL_API_KEY=your-gohighlevel-api-key
GHL_LOCATION_ID=your-default-location-id
```

### 4. Notification (`notification`)

Sends notifications through configured webhooks.

**Configuration Example:**
```json
{
  "recipient": "owner"
}
```

Notifications are queued in the `outbound_messages` table for delivery.

### 5. Reminder (`reminder`)

Schedules reminder notifications for future delivery.

**Configuration Example:**
```json
{
  "reminderTime": "2024-12-15T10:00:00Z",
  "reminderMessage": "Follow up with client about proposal",
  "recipient": "owner"
}
```

### 6. Data Extraction (`data_extraction`)

Extracts data from web pages using browser automation.

**Configuration Example:**
```json
{
  "automationSteps": [
    {
      "type": "navigate",
      "config": { "url": "https://example.com/data" }
    },
    {
      "type": "extract",
      "config": {
        "instruction": "Extract all product names and prices from the page"
      }
    }
  ]
}
```

### 7. Report Generation (`report_generation`)

Generates analytics and activity reports.

**Configuration Example:**
```json
{
  "reportType": "task_summary",
  "startDate": "2024-11-01T00:00:00Z",
  "endDate": "2024-11-30T23:59:59Z",
  "sendNotification": true
}
```

**Report Types:**
- `task_summary`: Summary of tasks by status and type
- `execution_stats`: Execution success rates and performance
- `webhook_activity`: Inbound message statistics

## Task Lifecycle

### 1. Task Creation

Tasks can be created through:
- **Webhook messages**: Automatically parsed and converted to tasks
- **Manual creation**: Using the TRPC API
- **Scheduled automation**: Recurring task creation

### 2. Task Status Flow

```
pending → queued → in_progress → completed
                              → failed
                              → waiting_input
                  → cancelled
                  → deferred
```

### 3. Execution Triggers

- **Automatic**: Executes immediately when created (if conditions met)
- **Manual**: Triggered by user via API
- **Scheduled**: Executes at specified `scheduledFor` time
- **Post-approval**: Executes after human review approval

### 4. Human Review Workflow

Tasks requiring human review:
1. Created with `requiresHumanReview: true`
2. Stays in `pending` status until reviewed
3. Admin can approve or reject via API
4. Approved tasks execute automatically (if not scheduled)

## Execution Features

### Error Handling & Retries

- Failed tasks increment `errorCount`
- Automatic retry up to `maxRetries` (default: 3)
- Last error stored in `lastError` field
- After max retries, status becomes `failed`

### Execution History

Each execution attempt creates a record in `task_executions`:
- Execution status and duration
- Browser session info (for automation tasks)
- Step-by-step results
- Error details and stack traces
- Screenshots (if applicable)

### Notifications

Tasks can send notifications on:
- **Completion**: `notifyOnComplete: true`
- **Failure**: `notifyOnFailure: true`

Notifications are sent through the originating webhook channel.

### Logging

Comprehensive logging with prefixed messages:
```
[TaskExecution] Starting execution for task 123, triggered by: manual
[TaskExecution] Task 123 (api_call): Call external API
[TaskExecution] Executing task 123 of type: api_call
[TaskExecution] Task 123 execution completed in 1234ms. Success: true
```

## API Usage Examples

### Create and Execute a Task

```typescript
// Create API call task
const task = await trpc.agencyTasks.create.mutate({
  title: "Fetch user data from external API",
  taskType: "api_call",
  priority: "high",
  urgency: "urgent",
  executionType: "automatic",
  assignedToBot: true,
  requiresHumanReview: false,
  executionConfig: {
    apiEndpoint: "https://api.example.com/users",
    apiMethod: "GET",
    authType: "bearer",
    bearerToken: process.env.API_TOKEN
  }
});

// Task will execute automatically
```

### Manual Task Execution

```typescript
// Execute existing task manually
const result = await trpc.agencyTasks.execute.mutate({
  id: taskId
});

// Returns: { success: true, taskId, message: "Task execution started" }
```

### Human Review Workflow

```typescript
// Approve task
await trpc.agencyTasks.approve.mutate({
  id: taskId,
  notes: "Verified configuration, approved for execution"
});

// Reject task
await trpc.agencyTasks.reject.mutate({
  id: taskId,
  reason: "Invalid API endpoint configuration"
});
```

### Get Task Execution History

```typescript
const executions = await trpc.agencyTasks.getExecutions.query({
  taskId: 123,
  limit: 10
});

// Returns array of execution records with:
// - status, duration, output
// - browser session info
// - error details
// - screenshots
```

## Database Queries

### Update Task Status

```typescript
await db
  .update(agencyTasks)
  .set({
    status: "completed",
    completedAt: new Date(),
    result: executionOutput,
    updatedAt: new Date()
  })
  .where(eq(agencyTasks.id, taskId));
```

### Store Execution Result

```typescript
await db
  .update(taskExecutions)
  .set({
    status: "success",
    output: result.output,
    duration: durationMs,
    completedAt: new Date()
  })
  .where(eq(taskExecutions.id, executionId));
```

### Track Execution History

```typescript
const executions = await db
  .select()
  .from(taskExecutions)
  .where(eq(taskExecutions.taskId, taskId))
  .orderBy(desc(taskExecutions.startedAt));
```

## Scheduled Task Processing

The task execution service includes a batch processor for scheduled tasks:

```typescript
const result = await taskExecutionService.processPendingTasks();
// Returns: { processed: 5, success: 4, failed: 1 }
```

This can be called by a cron job or scheduler service to process:
- Tasks with `scheduledFor` <= current time
- Tasks in `pending` or `queued` status
- Tasks assigned to bot without human review requirement

## Configuration Validation

Tasks are validated before execution:
- Required config fields based on task type
- URL format validation for API endpoints
- Authentication credentials presence
- Browser action structure validation

Validation errors prevent execution and return immediately:
```json
{
  "success": false,
  "error": "API call requires apiEndpoint"
}
```

## Best Practices

1. **Always provide executionConfig** for task types that require it
2. **Use human review** for sensitive operations (data deletion, external charges)
3. **Set appropriate timeouts** for API calls and browser automation
4. **Monitor execution history** to identify failing tasks
5. **Use scheduled execution** for tasks that should run at specific times
6. **Tag tasks** for easier filtering and organization
7. **Set realistic deadlines** to track overdue tasks

## Security Considerations

1. **API keys and tokens** should be stored in environment variables
2. **Webhook authentication** should be enabled for production
3. **Human review** required for tasks with financial impact
4. **Rate limiting** on task creation and execution
5. **Input validation** on all task configurations
6. **Audit logging** of all task executions and status changes

## Future Enhancements

- Task dependencies and workflows
- Parallel execution for independent tasks
- Advanced scheduling (recurring tasks, cron expressions)
- Task templates for common operations
- Execution analytics and insights
- Integration with more external services
- Custom task handlers via plugins
