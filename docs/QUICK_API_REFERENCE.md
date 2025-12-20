# GHL Agency AI - Quick API Reference

**Quick lookup for common API operations**

## Authentication

```bash
# API Key format
Authorization: Bearer ghl_your_api_key_here
```

## Health Check

```bash
curl https://api.ghl-agency.ai/api/v1/health
```

## Tasks

### List Tasks
```bash
curl -H "Authorization: Bearer ghl_key" \
  "https://api.ghl-agency.ai/api/v1/tasks?page=1&limit=20"
```

### Create Task
```bash
curl -X POST https://api.ghl-agency.ai/api/v1/tasks \
  -H "Authorization: Bearer ghl_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Task",
    "automationType": "observe",
    "automationConfig": {"url": "https://example.com"},
    "scheduleType": "daily",
    "cronExpression": "0 9 * * *"
  }'
```

### Get Task
```bash
curl -H "Authorization: Bearer ghl_key" \
  https://api.ghl-agency.ai/api/v1/tasks/123
```

### Update Task
```bash
curl -X PUT https://api.ghl-agency.ai/api/v1/tasks/123 \
  -H "Authorization: Bearer ghl_key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Delete Task
```bash
curl -X DELETE https://api.ghl-agency.ai/api/v1/tasks/123 \
  -H "Authorization: Bearer ghl_key"
```

### Execute Task
```bash
curl -X POST https://api.ghl-agency.ai/api/v1/tasks/123/execute \
  -H "Authorization: Bearer ghl_key"
```

## Executions

### List Executions
```bash
curl -H "Authorization: Bearer ghl_key" \
  "https://api.ghl-agency.ai/api/v1/executions?page=1&limit=20"
```

### Get Execution
```bash
curl -H "Authorization: Bearer ghl_key" \
  https://api.ghl-agency.ai/api/v1/executions/456
```

### Get Execution Logs
```bash
curl -H "Authorization: Bearer ghl_key" \
  https://api.ghl-agency.ai/api/v1/executions/456/logs
```

### Get Execution Output
```bash
curl -H "Authorization: Bearer ghl_key" \
  https://api.ghl-agency.ai/api/v1/executions/456/output
```

## Templates

### List Templates
```bash
curl -H "Authorization: Bearer ghl_key" \
  "https://api.ghl-agency.ai/api/v1/templates?page=1&limit=20"
```

### Get Template
```bash
curl -H "Authorization: Bearer ghl_key" \
  https://api.ghl-agency.ai/api/v1/templates/1
```

### Use Template
```bash
curl -X POST https://api.ghl-agency.ai/api/v1/templates/1/use \
  -H "Authorization: Bearer ghl_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Task from Template",
    "scheduleType": "daily",
    "cronExpression": "0 9 * * *"
  }'
```

## JavaScript Quick Client

```javascript
class GHL {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.base = 'https://api.ghl-agency.ai/api/v1';
  }

  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${this.base}${endpoint}`, options);
    return res.json();
  }

  // Tasks
  listTasks() { return this.request('GET', '/tasks'); }
  createTask(data) { return this.request('POST', '/tasks', data); }
  getTask(id) { return this.request('GET', `/tasks/${id}`); }
  updateTask(id, data) { return this.request('PUT', `/tasks/${id}`, data); }
  deleteTask(id) { return this.request('DELETE', `/tasks/${id}`); }
  executeTask(id) { return this.request('POST', `/tasks/${id}/execute`); }

  // Executions
  listExecutions() { return this.request('GET', '/executions'); }
  getExecution(id) { return this.request('GET', `/executions/${id}`); }
  getExecutionLogs(id) { return this.request('GET', `/executions/${id}/logs`); }
  getExecutionOutput(id) { return this.request('GET', `/executions/${id}/output`); }

  // Templates
  listTemplates() { return this.request('GET', '/templates'); }
  getTemplate(id) { return this.request('GET', `/templates/${id}`); }
  useTemplate(id, data) { return this.request('POST', `/templates/${id}/use`, data); }
}

// Usage
const client = new GHL('ghl_your_key');
const tasks = await client.listTasks();
```

## Python Quick Client

```python
import requests

class GHL:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base = 'https://api.ghl-agency.ai/api/v1'
        self.headers = {'Authorization': f'Bearer {api_key}'}

    def request(self, method, endpoint, **kwargs):
        kwargs.setdefault('headers', {}).update(self.headers)
        return requests.request(method, f'{self.base}{endpoint}', **kwargs).json()

    # Tasks
    def list_tasks(self): return self.request('GET', '/tasks')
    def create_task(self, data): return self.request('POST', '/tasks', json=data)
    def get_task(self, id): return self.request('GET', f'/tasks/{id}')
    def update_task(self, id, data): return self.request('PUT', f'/tasks/{id}', json=data)
    def delete_task(self, id): return self.request('DELETE', f'/tasks/{id}')
    def execute_task(self, id): return self.request('POST', f'/tasks/{id}/execute')

    # Executions
    def list_executions(self): return self.request('GET', '/executions')
    def get_execution(self, id): return self.request('GET', f'/executions/{id}')
    def get_execution_logs(self, id): return self.request('GET', f'/executions/{id}/logs')
    def get_execution_output(self, id): return self.request('GET', f'/executions/{id}/output')

# Usage
client = GHL('ghl_your_key')
tasks = client.list_tasks()
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 202 | Accepted (async) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |

## Error Response Format

```json
{
  "error": "Error Type",
  "message": "Description",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-19T12:00:00Z"
}
```

## Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-19T12:01:00Z
```

## Task Automation Types

- `chat` - AI conversation
- `observe` - Monitor page
- `extract` - Extract data
- `workflow` - Run workflow
- `custom` - Custom automation

## Task Schedule Types

- `daily` - Every day
- `weekly` - Every week
- `monthly` - Every month
- `cron` - Custom cron
- `once` - One time

## Task Status Values

- `active` - Running
- `paused` - Paused
- `failed` - Failed
- `completed` - Done
- `archived` - Archived

## Execution Status Values

- `queued` - Waiting
- `running` - Executing
- `success` - Completed
- `failed` - Failed
- `timeout` - Timed out
- `cancelled` - Cancelled

## API Key Scopes

- `*` - Full access
- `tasks:read` - Read tasks
- `tasks:write` - Create/update
- `tasks:execute` - Execute tasks
- `executions:read` - Read executions
- `templates:read` - Browse templates

## Common Task Configuration

```json
{
  "name": "Task name",
  "automationType": "observe",
  "automationConfig": {
    "url": "https://example.com",
    "instruction": "What to do"
  },
  "scheduleType": "daily",
  "cronExpression": "0 9 * * *",
  "timezone": "America/New_York",
  "retryOnFailure": true,
  "maxRetries": 3
}
```

## Common Cron Expressions

| Expression | Meaning |
|-----------|---------|
| `0 9 * * *` | Every day at 9 AM |
| `0 * * * *` | Every hour |
| `*/5 * * * *` | Every 5 minutes |
| `0 0 * * 0` | Every Sunday at midnight |
| `0 0 1 * *` | First day of month |

## API Documentation

- **Full Guide:** `/docs/API_DEVELOPER_GUIDE.md`
- **Auth Guide:** `/docs/AUTHENTICATION_GUIDE.md`
- **Swagger UI:** `https://api.ghl-agency.ai/api/docs`
- **OpenAPI Spec:** `https://api.ghl-agency.ai/api/v1/openapi.json`

---

**Version:** 1.0.0 | **Last Updated:** 2025-01-19
