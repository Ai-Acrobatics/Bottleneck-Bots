# Webhook Logging System

A comprehensive webhook delivery logging and retry system with automatic retry mechanisms, detailed analytics, and full audit trail.

## Features

- **Complete Delivery Logging**: Every webhook delivery attempt is logged with full request/response details
- **Automatic Retry**: Failed webhooks are automatically retried with exponential backoff
- **Detailed Analytics**: Success rates, response times, and error tracking
- **Filtering & Search**: Query logs by webhook, event, status, and date range
- **Manual Retry**: Ability to manually retry failed webhooks from the UI
- **Performance Metrics**: Average and median response times tracked

## Architecture

### Database Schema

**Table: `webhook_logs`**

Located in: `/drizzle/schema-webhooks.ts`

```typescript
{
  id: uuid (primary key),
  webhookId: text (references webhook from userPreferences),
  userId: integer (references users),

  // Event details
  event: varchar(100),

  // Request details
  url: text,
  method: varchar(10),
  requestHeaders: jsonb,
  requestBody: jsonb,

  // Response details
  responseStatus: integer,
  responseBody: text,
  responseTime: integer, // milliseconds

  // Status tracking
  status: varchar(50), // pending, success, failed, retrying, permanently_failed
  attempts: integer,
  nextRetryAt: timestamp,

  // Error tracking
  error: text,
  errorCode: varchar(100),

  // Timestamps
  createdAt: timestamp,
  completedAt: timestamp
}
```

**Indexes**:
- `webhook_id` - Fast lookup by webhook
- `user_id` - Filter by user
- `status` - Query by delivery status
- `event` - Filter by event type
- `created_at` - Date range queries
- `next_retry_at` - Find webhooks due for retry
- Composite indexes for common query patterns

### Service Layer

**File: `/server/services/webhook.service.ts`**

Core functions:

#### `sendWebhook(params)`

Sends a webhook with full logging support.

```typescript
const log = await sendWebhook({
  webhookId: "webhook-uuid",
  userId: 123,
  event: "quiz.completed",
  payload: { quizId: 456, score: 85 },
  webhookUrl: "https://example.com/webhook",
  webhookSecret: "whsec_...", // Optional for HMAC signing
});
```

**Returns**: WebhookLog entry with delivery status

**Features**:
- Automatic HMAC SHA256 signature generation
- 30-second timeout
- Full request/response logging
- Automatic retry scheduling on failure

#### `retryFailedWebhooks()`

Processes all failed webhooks due for retry.

```typescript
const results = await retryFailedWebhooks();
// {
//   processed: 15,
//   succeeded: 10,
//   failed: 3,
//   permanentlyFailed: 2
// }
```

**Retry Schedule** (Exponential Backoff):
1. Attempt 1: Immediate
2. Attempt 2: 1 minute later
3. Attempt 3: 5 minutes later
4. Attempt 4: 15 minutes later
5. Attempt 5: 1 hour later
6. Attempt 6: 4 hours later
7. **After 6 attempts**: Marked as `permanently_failed`

#### `retryWebhook(logId, userId)`

Manually retry a specific failed webhook.

```typescript
const log = await retryWebhook("log-uuid", 123);
// Returns updated log entry with new attempt
```

#### `getWebhookLogs(params)`

Query webhook logs with filtering and pagination.

```typescript
const { logs, total } = await getWebhookLogs({
  userId: 123,
  webhookId: "webhook-uuid", // Optional
  event: "quiz.completed", // Optional
  status: "failed", // Optional
  startDate: new Date("2025-01-01"), // Optional
  endDate: new Date("2025-12-31"), // Optional
  limit: 50,
  offset: 0,
});
```

#### `getWebhookStats(params)`

Get comprehensive statistics for webhooks.

```typescript
const stats = await getWebhookStats({
  userId: 123,
  webhookId: "webhook-uuid", // Optional
  startDate: new Date("2025-01-01"), // Optional
  endDate: new Date("2025-12-31"), // Optional
});

// Returns:
// {
//   totalDeliveries: 1000,
//   successfulDeliveries: 950,
//   failedDeliveries: 30,
//   permanentlyFailedDeliveries: 20,
//   successRate: 95.0, // percentage
//   averageResponseTime: 245, // ms
//   medianResponseTime: 180, // ms
//   eventBreakdown: {
//     "quiz.completed": 500,
//     "workflow.executed": 300,
//     "task.completed": 200
//   },
//   statusBreakdown: {
//     "success": 950,
//     "failed": 30,
//     "permanently_failed": 20
//   },
//   recentErrors: [
//     { error: "ECONNREFUSED", count: 15 },
//     { error: "TIMEOUT", count: 10 }
//   ]
// }
```

### API Endpoints

**File: `/server/api/routers/settings.ts`**

All endpoints are protected and require authentication.

#### `getWebhookLogs`

**Type**: Query
**Input**:
```typescript
{
  webhookId?: string; // UUID
  event?: string;
  status?: "pending" | "success" | "failed" | "retrying" | "permanently_failed";
  startDate?: string; // ISO 8601 datetime
  endDate?: string; // ISO 8601 datetime
  limit?: number; // 1-100, default: 50
  offset?: number; // default: 0
}
```

**Returns**:
```typescript
{
  logs: WebhookLog[];
  total: number;
  limit: number;
  offset: number;
}
```

#### `getWebhookStats`

**Type**: Query
**Input**:
```typescript
{
  webhookId?: string; // UUID
  startDate?: string; // ISO 8601 datetime
  endDate?: string; // ISO 8601 datetime
}
```

**Returns**: Statistics object (see `getWebhookStats` service above)

#### `retryWebhook`

**Type**: Mutation
**Input**:
```typescript
{
  logId: string; // UUID of webhook log entry
}
```

**Returns**:
```typescript
{
  success: boolean;
  status: string;
  message: string;
  log: WebhookLog;
}
```

#### `testWebhook` (Updated)

**Type**: Mutation
**Input**:
```typescript
{
  id: string; // UUID of webhook
}
```

**Returns**:
```typescript
{
  success: boolean;
  statusCode: number;
  message: string;
  responseBody: string | null;
  logId: string; // UUID of created log entry
}
```

**Now includes logging**: Test webhook deliveries are logged and can be viewed in webhook logs.

### Background Worker

**File: `/server/workers/webhookRetryWorker.ts`**

Automatic retry worker that runs every minute to process failed webhooks.

**Usage**:

```typescript
import { startWebhookRetryWorker, stopWebhookRetryWorker } from "./workers/webhookRetryWorker";

// Start worker (runs every 1 minute by default)
const interval = startWebhookRetryWorker();

// Or customize interval (e.g., every 30 seconds)
const interval = startWebhookRetryWorker(30000);

// Stop worker when needed
stopWebhookRetryWorker(interval);
```

**Standalone Mode**:
```bash
# Run as standalone process
ts-node server/workers/webhookRetryWorker.ts
```

**Features**:
- Processes webhooks in batches (100 at a time)
- Respects retry schedule and max attempts
- Detailed logging of retry results
- Graceful shutdown on SIGINT/SIGTERM

## Usage Examples

### 1. Send Webhook from Your Code

```typescript
import { sendWebhook } from "./services/webhook.service";

// In your quiz completion handler
async function onQuizCompleted(quizId: number, userId: number, score: number) {
  // Get user's webhook configuration
  const webhook = await getUserWebhook(userId, "quiz.completed");

  if (webhook && webhook.isActive) {
    // Send webhook with logging
    const log = await sendWebhook({
      webhookId: webhook.id,
      userId: userId,
      event: "quiz.completed",
      payload: {
        quizId,
        score,
        timestamp: new Date().toISOString(),
      },
      webhookUrl: webhook.url,
      webhookSecret: webhook.secret,
    });

    console.log(`Webhook sent: ${log.status}, Response time: ${log.responseTime}ms`);
  }
}
```

### 2. Query Webhook Logs

```typescript
// Frontend: Using tRPC
const { data } = trpc.settings.getWebhookLogs.useQuery({
  webhookId: "webhook-uuid",
  status: "failed",
  limit: 20,
});

console.log(`Total failed deliveries: ${data.total}`);
data.logs.forEach(log => {
  console.log(`${log.event}: ${log.error} (${log.attempts} attempts)`);
});
```

### 3. View Webhook Statistics

```typescript
// Frontend: Using tRPC
const { data: stats } = trpc.settings.getWebhookStats.useQuery({
  webhookId: "webhook-uuid",
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
});

console.log(`Success rate: ${stats.successRate}%`);
console.log(`Average response time: ${stats.averageResponseTime}ms`);
console.log(`Total deliveries: ${stats.totalDeliveries}`);
```

### 4. Manually Retry Failed Webhook

```typescript
// Frontend: Using tRPC
const retryMutation = trpc.settings.retryWebhook.useMutation();

async function handleRetry(logId: string) {
  const result = await retryMutation.mutateAsync({ logId });

  if (result.success) {
    console.log("Webhook delivered successfully on retry!");
  } else {
    console.log(`Retry failed: ${result.message}`);
  }
}
```

### 5. Monitor Webhook Health

```typescript
// Backend: Monitoring script
async function checkWebhookHealth(webhookId: string, userId: number) {
  const stats = await getWebhookStats({
    userId,
    webhookId,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  });

  if (stats.successRate < 90) {
    console.warn(`⚠️ Webhook health alert: Success rate is ${stats.successRate}%`);

    // Check top errors
    stats.recentErrors.forEach(({ error, count }) => {
      console.log(`  - ${error}: ${count} occurrences`);
    });
  }

  if (stats.averageResponseTime > 5000) {
    console.warn(`⚠️ Performance alert: Average response time is ${stats.averageResponseTime}ms`);
  }
}
```

## Integration Checklist

- [x] Database schema created in `drizzle/schema-webhooks.ts`
- [x] Schema exported from `drizzle/schema.ts`
- [x] Service layer implemented in `server/services/webhook.service.ts`
- [x] API endpoints added to `server/api/routers/settings.ts`
- [x] Background worker created in `server/workers/webhookRetryWorker.ts`
- [x] Test webhook endpoint updated to use logging
- [ ] **TODO**: Run database migration to create `webhook_logs` table
- [ ] **TODO**: Start webhook retry worker in production
- [ ] **TODO**: Add webhook logs UI to frontend
- [ ] **TODO**: Add webhook statistics dashboard to frontend

## Database Migration

To create the `webhook_logs` table, run:

```bash
npm run db:generate
npm run db:migrate
```

## Starting the Retry Worker

Add to your application startup code:

```typescript
// server/index.ts or wherever you initialize workers
import { startWebhookRetryWorker } from "./workers/webhookRetryWorker";

// Start the webhook retry worker
const webhookRetryInterval = startWebhookRetryWorker();

// Cleanup on shutdown
process.on("SIGTERM", () => {
  stopWebhookRetryWorker(webhookRetryInterval);
});
```

## Performance Considerations

1. **Indexes**: All common query patterns have optimized indexes
2. **Batch Processing**: Retry worker processes max 100 webhooks per run
3. **Timeouts**: 30-second timeout prevents hanging requests
4. **Pagination**: All log queries support limit/offset pagination
5. **Retention**: Consider implementing log retention policy (e.g., delete logs older than 90 days)

## Security

1. **HMAC Signing**: Webhooks are signed with SHA256 HMAC when secret is provided
2. **User Isolation**: All queries filter by userId to prevent data leakage
3. **Sensitive Data**: Webhook secrets are stored encrypted in `userPreferences`
4. **Rate Limiting**: Consider adding rate limits to prevent webhook abuse

## Monitoring Recommendations

1. Set up alerts for:
   - Success rate drops below 90%
   - Average response time exceeds 5 seconds
   - Permanently failed webhooks exceed threshold
   - Retry queue backing up

2. Track metrics:
   - Daily webhook delivery volume
   - Success/failure rates by event type
   - Response time percentiles (p50, p95, p99)
   - Error type distribution

## Future Enhancements

- [ ] Webhook delivery batching for high-volume events
- [ ] Custom retry schedules per webhook
- [ ] Webhook delivery notifications (email on permanent failure)
- [ ] Export webhook logs to CSV/JSON
- [ ] Webhook delivery SLA tracking
- [ ] Circuit breaker pattern for consistently failing webhooks
- [ ] Webhook signature verification endpoint
- [ ] Real-time webhook delivery status via WebSocket
