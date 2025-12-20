# GHL Agency AI - API Developer Guide

**Complete guide for developers integrating with the GHL Agency AI API**

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Core API Concepts](#core-api-concepts)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Common Workflows](#common-workflows)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)
8. [Rate Limiting & Quotas](#rate-limiting--quotas)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Active GHL Agency AI account
- Basic understanding of REST APIs and HTTP
- API key with appropriate scopes
- Familiarity with JSON

### Quick Start (5 minutes)

#### Step 1: Create an API Key

Use the dashboard to create an API key or use the tRPC endpoint:

```typescript
const result = await trpc.apiKeys.create.mutate({
  name: "My Integration",
  description: "For external integrations",
  scopes: ["tasks:read", "tasks:write", "tasks:execute"],
  rateLimitPerMinute: 100,
});

console.log(result.key.apiKey); // ghl_xxxxxxxxxxxx
```

#### Step 2: Make Your First API Call

```bash
# Using curl
curl -X GET https://api.ghl-agency.ai/api/v1/health \
  -H "Authorization: Bearer ghl_your_api_key_here"
```

```javascript
// Using JavaScript/Node.js
const response = await fetch('https://api.ghl-agency.ai/api/v1/health', {
  headers: {
    'Authorization': 'Bearer ghl_your_api_key_here',
  },
});

const data = await response.json();
console.log(data); // { status: 'healthy', version: '1.0.0', ... }
```

```python
# Using Python
import requests

headers = {
    'Authorization': 'Bearer ghl_your_api_key_here',
}

response = requests.get('https://api.ghl-agency.ai/api/v1/health', headers=headers)
print(response.json())
```

#### Step 3: List Your Tasks

```bash
curl -X GET https://api.ghl-agency.ai/api/v1/tasks \
  -H "Authorization: Bearer ghl_your_api_key_here"
```

---

## Authentication

### API Key Format

All API keys follow this format:

```
ghl_<32-character-random-string>
```

Example:
```
ghl_e7a2f5c9b1d8e3g6h2j4k9l0m5n8p2r5
```

### Bearer Token Authentication

Include your API key in every request using the `Authorization` header:

```http
Authorization: Bearer ghl_your_api_key_here
```

### Authentication Examples

**cURL:**
```bash
curl -X GET https://api.ghl-agency.ai/api/v1/tasks \
  -H "Authorization: Bearer ghl_your_api_key_here"
```

**JavaScript/Fetch:**
```javascript
const headers = {
  'Authorization': 'Bearer ghl_your_api_key_here',
  'Content-Type': 'application/json',
};

const response = await fetch('https://api.ghl-agency.ai/api/v1/tasks', {
  headers,
});
```

**Node.js/Axios:**
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.ghl-agency.ai/api/v1',
  headers: {
    'Authorization': 'Bearer ghl_your_api_key_here',
  },
});

const response = await client.get('/tasks');
```

**Python/Requests:**
```python
import requests

headers = {
    'Authorization': 'Bearer ghl_your_api_key_here',
}

response = requests.get('https://api.ghl-agency.ai/api/v1/tasks', headers=headers)
```

**Go:**
```go
package main

import (
  "net/http"
)

func main() {
  req, _ := http.NewRequest("GET", "https://api.ghl-agency.ai/api/v1/tasks", nil)
  req.Header.Add("Authorization", "Bearer ghl_your_api_key_here")

  client := &http.Client{}
  resp, _ := client.Do(req)
}
```

### API Key Management Best Practices

1. **Never commit keys to version control**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment variables**
   ```bash
   # .env
   GHL_API_KEY=ghl_your_api_key_here
   ```

3. **Load from environment**
   ```javascript
   const apiKey = process.env.GHL_API_KEY;
   ```

4. **Rotate keys periodically**
   - Create new key
   - Update applications
   - Revoke old key
   - Recommended: Every 90 days

5. **Use minimal scopes**
   - Only grant necessary permissions
   - Create separate keys for different purposes
   - Example: One key for reading, one for writing

6. **Monitor API key usage**
   - Review usage logs regularly
   - Set up alerts for unusual activity
   - Archive unused keys

---

## Core API Concepts

### Resources

The GHL Agency AI API manages the following core resources:

#### Tasks
Automated workflows that run on a schedule or manually triggered.

**Properties:**
- `id`: Unique identifier
- `name`: Task name
- `description`: Task description
- `automationType`: Type of automation (chat, observe, extract, workflow, custom)
- `automationConfig`: Configuration object with task-specific settings
- `scheduleType`: Schedule (daily, weekly, monthly, cron, once)
- `status`: Current status (active, paused, failed, completed, archived)

#### Executions
Individual runs of a task.

**Properties:**
- `id`: Unique identifier
- `taskId`: Associated task ID
- `status`: Execution status (queued, running, success, failed, timeout, cancelled)
- `output`: Execution results
- `error`: Error message if failed
- `duration`: Execution time in milliseconds

#### Templates
Pre-built workflow templates for common use cases.

**Properties:**
- `id`: Unique identifier
- `name`: Template name
- `description`: Template description
- `category`: Template category (browser-automation, data-extraction, monitoring, etc.)
- `config`: Template configuration

### Request/Response Format

#### Request Structure

```http
POST /api/v1/tasks HTTP/1.1
Authorization: Bearer ghl_your_api_key_here
Content-Type: application/json

{
  "name": "My Task",
  "automationType": "observe",
  "automationConfig": {
    "url": "https://example.com",
    "instruction": "Check if the page loads"
  },
  "scheduleType": "daily",
  "cronExpression": "0 9 * * *"
}
```

#### Response Structure

```json
{
  "data": {
    "id": 123,
    "name": "My Task",
    "automationType": "observe",
    "status": "active",
    "createdAt": "2025-01-19T12:00:00Z"
  },
  "message": "Task created successfully"
}
```

#### Error Response Structure

```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "code": "BAD_REQUEST",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ],
  "timestamp": "2025-01-19T12:00:00Z",
  "path": "/api/v1/tasks",
  "requestId": "req_1234567890"
}
```

### HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 202 | Accepted | Async operation queued |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid/missing API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Temporarily unavailable |

---

## API Endpoints Reference

### Health & Info

#### Get API Health
```
GET /health
```

Check API availability and version.

**No authentication required**

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-19T12:00:00Z"
}
```

#### Get API Info
```
GET /
```

Get API information and endpoint details.

**Response:**
```json
{
  "name": "GHL Agency AI API",
  "version": "1.0.0",
  "description": "Production-ready REST API for browser automation",
  "documentation": "/api/docs",
  "endpoints": {...},
  "authentication": {...},
  "rateLimit": {...}
}
```

### Tasks Management

#### List Tasks
```
GET /api/v1/tasks
```

List all tasks for the authenticated user.

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `status` (string) - Filter by status: active, paused, failed, completed, archived
- `automationType` (string) - Filter by type: chat, observe, extract, workflow, custom

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Daily Monitor",
      "automationType": "observe",
      "status": "active",
      "nextRun": "2025-01-20T09:00:00Z",
      "lastRun": "2025-01-19T09:00:00Z",
      "lastRunStatus": "success",
      "executionCount": 45,
      "successCount": 44,
      "failureCount": 1,
      "createdAt": "2025-01-10T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Create Task
```
POST /api/v1/tasks
Content-Type: application/json
```

Create a new task.

**Request Body:**
```json
{
  "name": "Daily Website Monitor",
  "description": "Check website status every day",
  "automationType": "observe",
  "automationConfig": {
    "url": "https://example.com",
    "instruction": "Check if the homepage loads successfully"
  },
  "scheduleType": "daily",
  "cronExpression": "0 9 * * *",
  "timezone": "America/New_York",
  "retryOnFailure": true,
  "maxRetries": 3,
  "notifyOnSuccess": false,
  "notifyOnFailure": true
}
```

**Response:** (201 Created)
```json
{
  "data": {
    "id": 123,
    "name": "Daily Website Monitor",
    "automationType": "observe",
    "status": "active",
    "nextRun": "2025-01-20T09:00:00Z",
    "createdAt": "2025-01-19T12:00:00Z"
  },
  "message": "Task created successfully"
}
```

#### Get Task Details
```
GET /api/v1/tasks/{id}
```

Get details of a specific task.

**Path Parameters:**
- `id` (integer, required) - Task ID

**Response:**
```json
{
  "data": {
    "id": 123,
    "name": "Daily Website Monitor",
    "description": "Check website status every day",
    "automationType": "observe",
    "automationConfig": {...},
    "scheduleType": "daily",
    "cronExpression": "0 9 * * *",
    "timezone": "America/New_York",
    "status": "active",
    "nextRun": "2025-01-20T09:00:00Z",
    "lastRun": "2025-01-19T09:00:00Z",
    "lastRunStatus": "success",
    "executionCount": 45,
    "successCount": 44,
    "failureCount": 1,
    "createdAt": "2025-01-10T12:00:00Z",
    "updatedAt": "2025-01-19T12:00:00Z"
  }
}
```

#### Update Task
```
PUT /api/v1/tasks/{id}
Content-Type: application/json
```

Update a task.

**Path Parameters:**
- `id` (integer, required) - Task ID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Task Name",
  "description": "Updated description",
  "automationType": "extract",
  "automationConfig": {...},
  "scheduleType": "weekly",
  "cronExpression": "0 9 * * 1"
}
```

**Response:**
```json
{
  "data": {
    "id": 123,
    "name": "Updated Task Name",
    "updatedAt": "2025-01-19T13:00:00Z"
  },
  "message": "Task updated successfully"
}
```

#### Delete Task
```
DELETE /api/v1/tasks/{id}
```

Archive a task (soft delete).

**Path Parameters:**
- `id` (integer, required) - Task ID

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

#### Execute Task
```
POST /api/v1/tasks/{id}/execute
```

Trigger immediate execution of a task.

**Path Parameters:**
- `id` (integer, required) - Task ID

**Response:** (202 Accepted)
```json
{
  "data": {
    "id": 456,
    "taskId": 123,
    "status": "queued",
    "triggerType": "manual",
    "createdAt": "2025-01-19T13:05:00Z"
  },
  "message": "Task execution queued"
}
```

#### List Task Executions
```
GET /api/v1/tasks/{id}/executions
```

Get execution history for a specific task.

**Path Parameters:**
- `id` (integer, required) - Task ID

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `status` (string) - Filter: queued, running, success, failed, timeout, cancelled

**Response:**
```json
{
  "data": [
    {
      "id": 456,
      "taskId": 123,
      "status": "success",
      "triggerType": "scheduled",
      "attemptNumber": 1,
      "startedAt": "2025-01-19T09:00:00Z",
      "completedAt": "2025-01-19T09:05:30Z",
      "duration": 330000,
      "output": {...},
      "createdAt": "2025-01-19T09:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### Executions Management

#### List All Executions
```
GET /api/v1/executions
```

Get all executions for the authenticated user.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `status` (string) - Filter by status
- `taskId` (integer) - Filter by task ID

**Response:** Similar to task executions

#### Get Execution Details
```
GET /api/v1/executions/{id}
```

Get detailed information about a specific execution.

**Path Parameters:**
- `id` (integer, required) - Execution ID

**Response:**
```json
{
  "data": {
    "id": 456,
    "taskId": 123,
    "sessionId": 789,
    "status": "success",
    "triggerType": "scheduled",
    "attemptNumber": 1,
    "startedAt": "2025-01-19T09:00:00Z",
    "completedAt": "2025-01-19T09:05:30Z",
    "duration": 330000,
    "output": {
      "extractedData": [...],
      "pageTitle": "...",
      "screenCapture": "..."
    },
    "screenshots": ["https://..."],
    "recordingUrl": "https://...",
    "createdAt": "2025-01-19T09:00:00Z"
  }
}
```

#### Get Execution Logs
```
GET /api/v1/executions/{id}/logs
```

Get logs from an execution.

**Path Parameters:**
- `id` (integer, required) - Execution ID

**Response:**
```json
{
  "data": {
    "executionId": 456,
    "taskId": 123,
    "logs": [
      {
        "timestamp": "2025-01-19T09:00:00Z",
        "level": "info",
        "message": "Started execution",
        "context": {...}
      },
      {
        "timestamp": "2025-01-19T09:00:05Z",
        "level": "debug",
        "message": "Loading page",
        "context": {"url": "https://example.com"}
      }
    ],
    "screenshots": ["https://..."],
    "recordingUrl": "https://..."
  }
}
```

#### Get Execution Output
```
GET /api/v1/executions/{id}/output
```

Get results/output from an execution.

**Path Parameters:**
- `id` (integer, required) - Execution ID

**Response:**
```json
{
  "data": {
    "executionId": 456,
    "taskId": 123,
    "status": "success",
    "output": {
      "extractedData": [...],
      "pageMetrics": {...}
    },
    "error": null,
    "startedAt": "2025-01-19T09:00:00Z",
    "completedAt": "2025-01-19T09:05:30Z",
    "duration": 330000
  }
}
```

### Templates

#### List Templates
```
GET /api/v1/templates
```

Get all available workflow templates.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `category` (string) - Filter by category
- `search` (string) - Search by name or description

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Website Monitor",
      "description": "Monitor a website for changes",
      "category": "monitoring",
      "config": {...},
      "createdAt": "2025-01-10T12:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### Get Template Details
```
GET /api/v1/templates/{id}
```

Get details of a specific template.

**Path Parameters:**
- `id` (integer, required) - Template ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Website Monitor",
    "description": "Monitor a website for changes",
    "category": "monitoring",
    "config": {
      "automationType": "observe",
      "requiredInputs": ["url"],
      "defaultConfig": {...}
    },
    "createdAt": "2025-01-10T12:00:00Z"
  }
}
```

#### Use Template
```
POST /api/v1/templates/{id}/use
Content-Type: application/json
```

Create a new task from a template.

**Path Parameters:**
- `id` (integer, required) - Template ID

**Request Body:**
```json
{
  "name": "My Custom Monitor",
  "description": "Monitor my website",
  "scheduleType": "daily",
  "cronExpression": "0 9 * * *",
  "timezone": "UTC",
  "customInputs": {
    "url": "https://mysite.com"
  }
}
```

**Response:** (201 Created)
```json
{
  "data": {
    "id": 124,
    "name": "My Custom Monitor",
    "automationType": "observe",
    "status": "active",
    "createdAt": "2025-01-19T12:00:00Z"
  },
  "message": "Task created from template"
}
```

#### Get Template Categories
```
GET /api/v1/templates/meta/categories
```

Get list of available template categories.

**Response:**
```json
{
  "data": [
    {
      "id": "monitoring",
      "name": "Monitoring",
      "description": "Monitor websites and services",
      "count": 12
    },
    {
      "id": "data-extraction",
      "name": "Data Extraction",
      "description": "Extract structured data",
      "count": 8
    }
  ]
}
```

---

## Common Workflows

### Workflow 1: Simple Task Execution

**Goal:** Create a task and execute it immediately.

```javascript
const apiKey = process.env.GHL_API_KEY;
const baseUrl = 'https://api.ghl-agency.ai/api/v1';

async function simpleTaskExecution() {
  try {
    // Step 1: Create task
    const createRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'One-time check',
        automationType: 'observe',
        automationConfig: {
          url: 'https://example.com',
          instruction: 'Check if the page loads successfully',
        },
        scheduleType: 'once',
        cronExpression: '0 0 * * *',
      }),
    });

    const taskData = await createRes.json();
    const taskId = taskData.data.id;
    console.log(`Task created with ID: ${taskId}`);

    // Step 2: Execute task
    const execRes = await fetch(`${baseUrl}/tasks/${taskId}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const execData = await execRes.json();
    const executionId = execData.data.id;
    console.log(`Execution started with ID: ${executionId}`);

    // Step 3: Poll for completion
    let status = 'queued';
    while (['queued', 'running'].includes(status)) {
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds

      const statusRes = await fetch(`${baseUrl}/executions/${executionId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const statusData = await statusRes.json();
      status = statusData.data.status;
      console.log(`Current status: ${status}`);
    }

    // Step 4: Get results
    const resultRes = await fetch(`${baseUrl}/executions/${executionId}/output`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const result = await resultRes.json();
    console.log('Execution result:', result.data.output);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleTaskExecution();
```

### Workflow 2: Scheduled Data Extraction

**Goal:** Set up a recurring task to extract data daily.

```python
import requests
import time
import json
from datetime import datetime

class GHLClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.ghl-agency.ai/api/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        }

    def create_task(self, config):
        """Create a new task"""
        response = requests.post(
            f'{self.base_url}/tasks',
            json=config,
            headers=self.headers
        )
        return response.json()

    def execute_task(self, task_id):
        """Execute a task immediately"""
        response = requests.post(
            f'{self.base_url}/tasks/{task_id}/execute',
            headers=self.headers
        )
        return response.json()

    def get_execution_output(self, execution_id):
        """Get execution results"""
        response = requests.get(
            f'{self.base_url}/executions/{execution_id}/output',
            headers=self.headers
        )
        return response.json()

# Usage
client = GHLClient(api_key='ghl_your_key_here')

# Create daily data extraction task
task_config = {
    'name': 'Daily Product Scraper',
    'description': 'Extract product data every day at 9 AM',
    'automationType': 'extract',
    'automationConfig': {
        'url': 'https://shop.example.com/products',
        'instruction': 'Extract product name, price, and description for all items',
    },
    'scheduleType': 'daily',
    'cronExpression': '0 9 * * *',  # 9 AM daily
    'timezone': 'America/New_York',
    'retryOnFailure': True,
    'maxRetries': 3,
}

result = client.create_task(task_config)
task_id = result['data']['id']
print(f'Created task {task_id}')

# Execute immediately for testing
exec_result = client.execute_task(task_id)
execution_id = exec_result['data']['id']

# Wait for completion and get results
time.sleep(10)  # Wait a bit before checking
output_result = client.get_execution_output(execution_id)
print(f'Extracted data: {json.dumps(output_result["data"]["output"], indent=2)}')
```

### Workflow 3: Monitoring with Error Notifications

**Goal:** Monitor a service and get notified on failures.

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.ghl-agency.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
  },
});

async function setupMonitoring() {
  // Create monitoring task
  const taskResponse = await client.post('/tasks', {
    name: 'API Uptime Monitor',
    description: 'Monitor API health every 5 minutes',
    automationType: 'observe',
    automationConfig: {
      url: 'https://api.myservice.com/health',
      instruction: 'Check if API returns 200 status code with healthy response',
    },
    scheduleType: 'cron',
    cronExpression: '*/5 * * * *', // Every 5 minutes
    timezone: 'UTC',
    notifyOnFailure: true,
    notifyOnSuccess: false,
  });

  const taskId = taskResponse.data.data.id;
  console.log(`Monitoring task created: ${taskId}`);

  // Function to check recent executions
  async function checkRecentExecutions() {
    const listResponse = await client.get(
      `/tasks/${taskId}/executions?limit=10`
    );

    const executions = listResponse.data.data;
    const failedExecutions = executions.filter(e => e.status === 'failed');

    if (failedExecutions.length > 0) {
      console.error(`⚠️  API is down! ${failedExecutions.length} failed checks`);

      // Get failure details
      for (const execution of failedExecutions) {
        const logs = await client.get(`/executions/${execution.id}/logs`);
        console.error(
          `Failure details: ${JSON.stringify(logs.data.data.logs, null, 2)}`
        );
      }

      // In a real app, you'd send notifications here
      // sendSlackAlert(`API is down!`);
    } else {
      console.log('✅ API is healthy');
    }
  }

  // Check every minute
  setInterval(checkRecentExecutions, 60000);
}

setupMonitoring();
```

---

## Code Examples

### JavaScript/Node.js Client

```javascript
class GHLAPIClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://api.ghl-agency.ai/api/v1';
  }

  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }

    return await response.json();
  }

  // Task methods
  async listTasks(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request('GET', `/tasks?${params}`);
  }

  async createTask(config) {
    return this.request('POST', '/tasks', config);
  }

  async getTask(taskId) {
    return this.request('GET', `/tasks/${taskId}`);
  }

  async updateTask(taskId, updates) {
    return this.request('PUT', `/tasks/${taskId}`, updates);
  }

  async deleteTask(taskId) {
    return this.request('DELETE', `/tasks/${taskId}`);
  }

  async executeTask(taskId) {
    return this.request('POST', `/tasks/${taskId}/execute`);
  }

  async getTaskExecutions(taskId, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request('GET', `/tasks/${taskId}/executions?${params}`);
  }

  // Execution methods
  async listExecutions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request('GET', `/executions?${params}`);
  }

  async getExecution(executionId) {
    return this.request('GET', `/executions/${executionId}`);
  }

  async getExecutionLogs(executionId) {
    return this.request('GET', `/executions/${executionId}/logs`);
  }

  async getExecutionOutput(executionId) {
    return this.request('GET', `/executions/${executionId}/output`);
  }

  // Template methods
  async listTemplates(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request('GET', `/templates?${params}`);
  }

  async getTemplate(templateId) {
    return this.request('GET', `/templates/${templateId}`);
  }

  async useTemplate(templateId, config) {
    return this.request('POST', `/templates/${templateId}/use`, config);
  }
}

// Usage
const client = new GHLAPIClient('ghl_your_api_key_here');

// List tasks
const tasks = await client.listTasks({ status: 'active', limit: 50 });
console.log(tasks);

// Create task
const newTask = await client.createTask({
  name: 'My First Task',
  automationType: 'observe',
  automationConfig: {
    url: 'https://example.com',
  },
  scheduleType: 'daily',
  cronExpression: '0 9 * * *',
});

// Execute task
const execution = await client.executeTask(newTask.data.id);
```

### Python Client

```python
import requests
from typing import Dict, Any, Optional
from urllib.parse import urlencode

class GHLAPIClient:
    def __init__(self, api_key: str, base_url: str = 'https://api.ghl-agency.ai/api/v1'):
        self.api_key = api_key
        self.base_url = base_url

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request with authentication"""
        headers = kwargs.pop('headers', {})
        headers['Authorization'] = f'Bearer {self.api_key}'
        headers['Content-Type'] = 'application/json'

        url = f'{self.base_url}{endpoint}'
        response = requests.request(method, url, headers=headers, **kwargs)

        if not response.ok:
            error_data = response.json()
            raise Exception(f"API Error ({response.status_code}): {error_data.get('message')}")

        return response.json()

    # Task operations
    def list_tasks(self, status: Optional[str] = None, limit: int = 20, page: int = 1) -> Dict:
        params = {'limit': limit, 'page': page}
        if status:
            params['status'] = status
        return self._request('GET', f'/tasks?{urlencode(params)}')

    def create_task(self, config: Dict[str, Any]) -> Dict:
        return self._request('POST', '/tasks', json=config)

    def get_task(self, task_id: int) -> Dict:
        return self._request('GET', f'/tasks/{task_id}')

    def update_task(self, task_id: int, updates: Dict) -> Dict:
        return self._request('PUT', f'/tasks/{task_id}', json=updates)

    def delete_task(self, task_id: int) -> Dict:
        return self._request('DELETE', f'/tasks/{task_id}')

    def execute_task(self, task_id: int) -> Dict:
        return self._request('POST', f'/tasks/{task_id}/execute')

    # Execution operations
    def get_execution(self, execution_id: int) -> Dict:
        return self._request('GET', f'/executions/{execution_id}')

    def get_execution_logs(self, execution_id: int) -> Dict:
        return self._request('GET', f'/executions/{execution_id}/logs')

    def get_execution_output(self, execution_id: int) -> Dict:
        return self._request('GET', f'/executions/{execution_id}/output')

# Usage
client = GHLAPIClient('ghl_your_api_key_here')

# List active tasks
tasks = client.list_tasks(status='active')
print(f"Found {len(tasks['data'])} active tasks")

# Create and execute a task
task = client.create_task({
    'name': 'Python Test Task',
    'automationType': 'extract',
    'automationConfig': {
        'url': 'https://example.com',
        'instruction': 'Extract all links',
    },
    'scheduleType': 'once',
    'cronExpression': '0 0 * * *',
})

execution = client.execute_task(task['data']['id'])
print(f"Execution started: {execution['data']['id']}")
```

### Go Client

```go
package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "io"
  "net/http"
  "net/url"
)

type GHLClient struct {
  apiKey  string
  baseURL string
  client  *http.Client
}

type TaskRequest struct {
  Name               string                 `json:"name"`
  Description        string                 `json:"description,omitempty"`
  AutomationType     string                 `json:"automationType"`
  AutomationConfig   map[string]interface{} `json:"automationConfig"`
  ScheduleType       string                 `json:"scheduleType"`
  CronExpression     string                 `json:"cronExpression"`
  Timezone           string                 `json:"timezone,omitempty"`
  RetryOnFailure     bool                   `json:"retryOnFailure,omitempty"`
  NotifyOnFailure    bool                   `json:"notifyOnFailure,omitempty"`
}

type APIResponse struct {
  Data    map[string]interface{} `json:"data"`
  Message string                 `json:"message,omitempty"`
}

func NewGHLClient(apiKey string) *GHLClient {
  return &GHLClient{
    apiKey:  apiKey,
    baseURL: "https://api.ghl-agency.ai/api/v1",
    client:  &http.Client{},
  }
}

func (c *GHLClient) doRequest(method, endpoint string, body interface{}) (*APIResponse, error) {
  var reqBody io.Reader
  if body != nil {
    jsonBody, err := json.Marshal(body)
    if err != nil {
      return nil, err
    }
    reqBody = bytes.NewReader(jsonBody)
  }

  req, err := http.NewRequest(method, c.baseURL+endpoint, reqBody)
  if err != nil {
    return nil, err
  }

  req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))
  req.Header.Set("Content-Type", "application/json")

  resp, err := c.client.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  var apiResp APIResponse
  if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
    return nil, err
  }

  return &apiResp, nil
}

func (c *GHLClient) CreateTask(task TaskRequest) (map[string]interface{}, error) {
  resp, err := c.doRequest("POST", "/tasks", task)
  if err != nil {
    return nil, err
  }
  return resp.Data, nil
}

func (c *GHLClient) ListTasks(status string, limit int, page int) (*APIResponse, error) {
  params := url.Values{}
  if status != "" {
    params.Add("status", status)
  }
  params.Add("limit", fmt.Sprintf("%d", limit))
  params.Add("page", fmt.Sprintf("%d", page))

  endpoint := fmt.Sprintf("/tasks?%s", params.Encode())
  return c.doRequest("GET", endpoint, nil)
}

func (c *GHLClient) ExecuteTask(taskID int) (map[string]interface{}, error) {
  endpoint := fmt.Sprintf("/tasks/%d/execute", taskID)
  resp, err := c.doRequest("POST", endpoint, nil)
  if err != nil {
    return nil, err
  }
  return resp.Data, nil
}

// Usage
func main() {
  client := NewGHLClient("ghl_your_api_key_here")

  // Create task
  task := TaskRequest{
    Name:           "Go Test Task",
    AutomationType: "observe",
    AutomationConfig: map[string]interface{}{
      "url":         "https://example.com",
      "instruction": "Check page loads",
    },
    ScheduleType:   "daily",
    CronExpression: "0 9 * * *",
  }

  data, err := client.CreateTask(task)
  if err != nil {
    fmt.Printf("Error creating task: %v\n", err)
    return
  }

  fmt.Printf("Task created: %v\n", data)
}
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized - Invalid API Key

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired API key",
  "code": "INVALID_API_KEY",
  "timestamp": "2025-01-19T12:00:00Z",
  "path": "/api/v1/tasks"
}
```

**Solution:**
- Check API key is correct
- Ensure it hasn't been revoked
- Generate a new key if needed

#### 400 Bad Request - Invalid Parameters

```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "automationConfig.url",
      "message": "URL must be valid"
    },
    {
      "field": "cronExpression",
      "message": "Invalid cron expression"
    }
  ],
  "timestamp": "2025-01-19T12:00:00Z"
}
```

**Solution:**
- Verify all required fields are provided
- Check field formats match specifications
- Use valid cron expressions

#### 404 Not Found - Resource Doesn't Exist

```json
{
  "error": "Not Found",
  "message": "Task with ID 999 not found",
  "code": "RESOURCE_NOT_FOUND",
  "timestamp": "2025-01-19T12:00:00Z",
  "path": "/api/v1/tasks/999"
}
```

**Solution:**
- Verify the resource ID is correct
- Check resource hasn't been deleted
- Ensure you have access to the resource

#### 429 Too Many Requests - Rate Limited

```json
{
  "error": "Too Many Requests",
  "message": "Per-minute rate limit exceeded",
  "code": "RATE_LIMIT_MINUTE_EXCEEDED",
  "timestamp": "2025-01-19T12:00:00Z",
  "path": "/api/v1/tasks"
}
```

**Solution:**
- Wait before making more requests
- Check X-RateLimit-Reset header for when limit resets
- Reduce request frequency
- Upgrade API key plan for higher limits

### Error Handling Best Practices

#### Exponential Backoff Retry

```javascript
async function requestWithRetry(
  fetchFn,
  maxRetries = 3,
  initialDelay = 1000
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      // Only retry on specific errors
      if (![429, 503, 500].includes(error.status)) throw error;

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const response = await requestWithRetry(() =>
  fetch('https://api.ghl-agency.ai/api/v1/tasks', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  })
);
```

#### Handling Rate Limits

```javascript
async function makeRateLimitAwareRequest(url, options = {}) {
  const response = await fetch(url, options);

  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  console.log(`Requests remaining: ${remaining}`);
  console.log(`Rate limit resets at: ${reset}`);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || reset;
    throw new Error(`Rate limited. Retry after ${retryAfter}`);
  }

  return response;
}
```

---

## Rate Limiting & Quotas

### Default Rate Limits

Every API key has default rate limits:

| Limit | Default | Upgrade Available |
|-------|---------|-------------------|
| Per Minute | 100 requests | Yes |
| Per Hour | 1,000 requests | Yes |
| Per Day | 10,000 requests | Yes |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-19T12:01:00Z
```

### Checking Remaining Quota

```javascript
async function checkRateLimit(apiKey) {
  const response = await fetch('https://api.ghl-agency.ai/api/v1/tasks', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = new Date(response.headers.get('X-RateLimit-Reset'));

  console.log(`Rate Limit: ${remaining}/${limit}`);
  console.log(`Resets at: ${reset.toLocaleTimeString()}`);

  if (remaining < 10) {
    console.warn('⚠️ Low API quota remaining!');
  }
}
```

---

## Best Practices

### 1. API Key Security

**DO:**
```javascript
// ✅ Load from environment
const apiKey = process.env.GHL_API_KEY;

// ✅ Use only when needed
async function fetchWithAuth() {
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
}
```

**DON'T:**
```javascript
// ❌ Don't hardcode keys
const apiKey = 'ghl_abc123...';

// ❌ Don't log keys
console.log('API Key:', apiKey);

// ❌ Don't commit to version control
// .env file accidentally committed
```

### 2. Request Optimization

**Batch Operations:**
```javascript
// ❌ Don't make multiple requests
for (const id of taskIds) {
  await fetch(`/api/v1/tasks/${id}`);
}

// ✅ Do use pagination
const tasks = await fetch('/api/v1/tasks?limit=100&page=1');
```

**Use Pagination:**
```javascript
async function getAllTasks() {
  const allTasks = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `/api/v1/tasks?page=${page}&limit=100`
    );
    const data = await response.json();

    allTasks.push(...data.data);
    hasMore = page < data.pagination.pages;
    page++;
  }

  return allTasks;
}
```

### 3. Error Handling

**Always Handle Errors:**
```javascript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }

  return await response.json();
} catch (error) {
  logger.error('API request failed:', error);
  // Handle error appropriately
}
```

### 4. Polling for Async Operations

**Intelligent Polling:**
```javascript
async function waitForExecution(executionId, options = {}) {
  const maxWaitTime = options.maxWaitTime || 300000; // 5 minutes
  const pollInterval = options.pollInterval || 5000; // 5 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const response = await fetch(`/api/v1/executions/${executionId}`);
    const data = await response.json();
    const status = data.data.status;

    if (['success', 'failed', 'timeout', 'cancelled'].includes(status)) {
      return data.data;
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Execution timeout');
}
```

### 5. Monitoring & Logging

**Log Important Events:**
```javascript
const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data),
};

async function executeWithLogging(taskId) {
  logger.info('Executing task', { taskId });

  try {
    const result = await client.executeTask(taskId);
    logger.info('Task execution started', { executionId: result.id });
    return result;
  } catch (error) {
    logger.error('Task execution failed', { taskId, error: error.message });
    throw error;
  }
}
```

---

## Troubleshooting

### Issue: "Invalid API Key"

**Symptoms:**
- 401 Unauthorized responses
- "Invalid or expired API key" message

**Solutions:**
1. Verify API key format (should start with `ghl_`)
2. Check API key is in Authorization header
3. Ensure it's using Bearer token format
4. Generate a new key if it was revoked

```bash
# Test API key
curl -H "Authorization: Bearer ghl_your_key_here" \
  https://api.ghl-agency.ai/api/v1/health
```

### Issue: "Rate Limit Exceeded"

**Symptoms:**
- 429 Too Many Requests responses
- Frequent request rejections

**Solutions:**
1. Implement exponential backoff retry
2. Reduce request frequency
3. Upgrade API key plan
4. Batch requests using pagination
5. Cache responses when possible

```javascript
// Implement queue with rate limiting
class RateLimitedQueue {
  constructor(apiKey, requestsPerSecond = 2) {
    this.apiKey = apiKey;
    this.requestsPerSecond = requestsPerSecond;
    this.queue = [];
    this.processing = false;
  }

  async add(request) {
    this.queue.push(request);
    this.process();
  }

  async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      await request();
      await new Promise(r =>
        setTimeout(r, 1000 / this.requestsPerSecond)
      );
    }

    this.processing = false;
  }
}
```

### Issue: "Task Not Found"

**Symptoms:**
- 404 Not Found response
- "Resource not found" message

**Solutions:**
1. Verify task ID is correct
2. Check task hasn't been deleted
3. Confirm you have access to the task
4. Use list endpoint to find correct task ID

```javascript
// Find task by name
async function findTaskByName(name) {
  const response = await fetch('/api/v1/tasks?limit=100');
  const data = await response.json();
  return data.data.find(task => task.name === name);
}
```

### Issue: "Validation Failed"

**Symptoms:**
- 422 Unprocessable Entity responses
- Validation error details in response

**Solutions:**
1. Review validation error messages
2. Check all required fields are provided
3. Verify field formats (URLs, cron expressions, etc.)
4. Use correct enum values

```javascript
// Validate before sending
function validateTaskConfig(config) {
  const errors = [];

  if (!config.name) errors.push('name is required');
  if (!config.automationType) errors.push('automationType is required');
  if (!config.automationConfig?.url) errors.push('automationConfig.url is required');
  if (!config.scheduleType) errors.push('scheduleType is required');

  const validAutomationTypes = ['chat', 'observe', 'extract', 'workflow', 'custom'];
  if (!validAutomationTypes.includes(config.automationType)) {
    errors.push(`automationType must be one of: ${validAutomationTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## Additional Resources

- **API Documentation**: `/api/docs` (Swagger UI)
- **OpenAPI Spec**: `/api/v1/openapi.json`
- **GitHub Issues**: Report bugs or request features
- **Support Email**: support@ghl-agency.ai
- **Change Log**: Track API updates and changes

---

**Last Updated:** 2025-01-19
**API Version:** 1.0.0
