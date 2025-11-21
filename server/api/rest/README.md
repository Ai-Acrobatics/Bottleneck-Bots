# GHL Agency AI - REST API

Production-ready public REST API for browser automation and workflow management.

## Features

- **API Key Authentication** - Secure Bearer token authentication
- **Rate Limiting** - Per-key rate limits (100 req/min default)
- **Request Logging** - Complete audit trail in database
- **Error Handling** - Consistent error responses with proper HTTP codes
- **OpenAPI Documentation** - Full OpenAPI 3.0 specification
- **Swagger UI** - Interactive API documentation
- **CORS Support** - Cross-origin requests enabled
- **Scoped Permissions** - Granular access control per API key

## Quick Start

### 1. Create an API Key

Use the TRPC endpoint to create an API key:

```typescript
const result = await trpc.apiKeys.create.mutate({
  name: "My API Key",
  description: "For external integrations",
  scopes: ["tasks:read", "tasks:write", "tasks:execute"],
  rateLimitPerMinute: 100,
});

// Save this key - you won't see it again!
console.log(result.key.apiKey); // ghl_...
```

### 2. Make API Requests

```bash
curl -X GET https://api.ghl-agency.ai/api/v1/tasks \
  -H "Authorization: Bearer ghl_your_api_key_here"
```

```javascript
const response = await fetch('https://api.ghl-agency.ai/api/v1/tasks', {
  headers: {
    'Authorization': 'Bearer ghl_your_api_key_here',
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

## Authentication

All API requests require an API key in the `Authorization` header:

```
Authorization: Bearer ghl_your_api_key_here
```

## Endpoints

### Tasks

- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/:id` - Get task details
- `PUT /api/v1/tasks/:id` - Update a task
- `DELETE /api/v1/tasks/:id` - Delete (archive) a task
- `POST /api/v1/tasks/:id/execute` - Trigger task execution
- `GET /api/v1/tasks/:id/executions` - Get execution history

### Executions

- `GET /api/v1/executions` - List all executions
- `GET /api/v1/executions/:id` - Get execution details
- `GET /api/v1/executions/:id/logs` - Get execution logs
- `GET /api/v1/executions/:id/output` - Get execution output

### Templates

- `GET /api/v1/templates` - List available templates
- `GET /api/v1/templates/:id` - Get template details
- `POST /api/v1/templates/:id/use` - Create task from template
- `GET /api/v1/templates/meta/categories` - Get template categories

## Rate Limiting

Rate limits are enforced per API key:

- **Per Minute**: 100 requests (default)
- **Per Hour**: 1,000 requests (default)
- **Per Day**: 10,000 requests (default)

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-19T12:01:00Z
```

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Too Many Requests",
  "message": "Per-minute rate limit exceeded",
  "code": "RATE_LIMIT_MINUTE_EXCEEDED",
  "limit": 100,
  "window": "1 minute"
}
```

## Scopes

API keys can have the following scopes:

- `*` - Full access to all endpoints
- `tasks:read` - Read tasks
- `tasks:write` - Create and update tasks
- `tasks:execute` - Trigger task execution
- `executions:read` - Read execution history and logs
- `templates:read` - Browse and use templates

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-19T12:00:00Z",
  "path": "/api/v1/tasks",
  "requestId": "req_1234567890"
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `202 Accepted` - Request accepted (async operation)
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid API key
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

## Pagination

List endpoints support pagination via query parameters:

```
GET /api/v1/tasks?page=2&limit=50
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

## Examples

### Create a Task

```bash
curl -X POST https://api.ghl-agency.ai/api/v1/tasks \
  -H "Authorization: Bearer ghl_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Website Monitor",
    "description": "Check website status every day",
    "automationType": "observe",
    "automationConfig": {
      "url": "https://example.com",
      "instruction": "Check if the homepage loads successfully"
    },
    "scheduleType": "daily",
    "cronExpression": "0 9 * * *",
    "timezone": "America/New_York"
  }'
```

### Execute a Task

```bash
curl -X POST https://api.ghl-agency.ai/api/v1/tasks/123/execute \
  -H "Authorization: Bearer ghl_your_api_key_here"
```

### Get Execution Logs

```bash
curl -X GET https://api.ghl-agency.ai/api/v1/executions/456/logs \
  -H "Authorization: Bearer ghl_your_api_key_here"
```

### Use a Template

```bash
curl -X POST https://api.ghl-agency.ai/api/v1/templates/789/use \
  -H "Authorization: Bearer ghl_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Task from Template",
    "scheduleType": "once",
    "customInputs": {
      "targetUrl": "https://mysite.com"
    }
  }'
```

## API Documentation

Interactive API documentation is available at:

- **Swagger UI**: `/api/docs`
- **OpenAPI Spec**: `/api/v1/openapi.json`

## TypeScript SDK

A TypeScript SDK is available for easy integration:

```typescript
import { GhlApiClient } from '@/sdk/typescript';

const client = new GhlApiClient({
  apiKey: 'ghl_your_api_key_here',
  baseUrl: 'https://api.ghl-agency.ai/api/v1',
});

// List tasks
const tasks = await client.tasks.list({ page: 1, limit: 20 });

// Create task
const task = await client.tasks.create({
  name: 'My Task',
  automationType: 'workflow',
  // ...
});

// Execute task
const execution = await client.tasks.execute(task.data.id);

// Get execution details
const details = await client.executions.get(execution.data.id);
```

## Security Best Practices

1. **Keep API keys secret** - Never commit keys to version control
2. **Use environment variables** - Store keys in `.env` files
3. **Rotate keys regularly** - Create new keys and revoke old ones periodically
4. **Use minimal scopes** - Grant only necessary permissions
5. **Set expiration dates** - Use temporary keys when possible
6. **Monitor usage** - Review API key usage statistics regularly
7. **Use HTTPS** - Always use HTTPS in production

## Architecture

```
server/api/rest/
├── index.ts                  # Main REST API server
├── openapi.yaml             # OpenAPI 3.0 specification
├── middleware/
│   ├── authMiddleware.ts    # API key authentication
│   ├── rateLimitMiddleware.ts # Rate limiting
│   ├── errorMiddleware.ts   # Error handling
│   └── loggingMiddleware.ts # Request logging
└── routes/
    ├── tasks.ts             # Task endpoints
    ├── executions.ts        # Execution endpoints
    └── templates.ts         # Template endpoints
```

## Database Schema

The REST API uses the following tables:

- `api_keys` - API key storage (hashed)
- `api_request_logs` - Request logging and analytics
- `scheduled_browser_tasks` - Task definitions
- `scheduled_task_executions` - Execution history

## Development

### Running Locally

```bash
# Start the REST API server
npm run dev

# API will be available at:
# http://localhost:3001/api/v1
```

### Testing

```bash
# Test API endpoints
curl http://localhost:3001/api/v1/health

# Test with API key
curl http://localhost:3001/api/v1/tasks \
  -H "Authorization: Bearer ghl_test_key_here"
```

## Support

For issues or questions:

- **Documentation**: `/api/docs`
- **Email**: support@ghl-agency.ai
- **GitHub Issues**: Create an issue in the repository

## License

MIT
