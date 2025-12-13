# Task Distributor Quick Reference

## Initialization

```typescript
import { TaskDistributor } from './taskDistributor.service';

const distributor = new TaskDistributor('session-aware');
```

## Queue a Task

```typescript
// Simple queue
await distributor.queueTask(task);

// With GHL routing
await distributor.queueTask(task, 'contact_create', 'client_id');
```

## Register Browser Session

```typescript
distributor.registerBrowserSession(sessionId, agentId, clientId);
```

## Distribute Tasks

```typescript
const count = await distributor.distributeTasks(agents);
```

## Complete Task

```typescript
await distributor.completeTask(taskId, result);
```

## Handle Failure

```typescript
await distributor.failTask(taskId, task, error);
// Automatically retries with exponential backoff
```

## Monitor Status

```typescript
const status = distributor.getQueueStatus();
// {
//   queueLength, activeAssignments, activeBatches,
//   activeSessions, failedTasksAwaitingRetry,
//   tasksByPriority, tasksByGHLOperation, sessionHealth
// }
```

## Get Batch Results

```typescript
const results = distributor.getBatchResults(batchId);
```

## GHL Operation Types

| Type | Urgency | Batch |
|------|---------|-------|
| `conversation_send` | 1 (Critical) | No |
| `workflow_trigger` | 1 (Critical) | No |
| `contact_create` | 2 (High) | Yes |
| `contact_update` | 3 (Normal) | Yes |
| `tag_add` | 4 (Low) | Yes |
| `bulk_operation` | 5 (Background) | No |

## Events

```typescript
distributor.on('task:queued', (data) => {});
distributor.on('task:assigned', (data) => {});
distributor.on('task:completed', (data) => {});
distributor.on('task:retry_scheduled', (data) => {});
distributor.on('batch:processed', (data) => {});
distributor.on('session:registered', (data) => {});
```

## Configuration

```typescript
MAX_RETRY_ATTEMPTS = 3
BASE_RETRY_DELAY = 1000      // 1s
MAX_RETRY_DELAY = 32000      // 32s
BATCH_WINDOW_MS = 2000       // 2s
MAX_BATCH_SIZE = 10
SESSION_AFFINITY_TIMEOUT = 300000  // 5min
```

## Distribution Strategies

- `'session-aware'` - GHL optimized (default)
- `'capability-based'` - Skill matching
- `'least-loaded'` - Lowest workload
- `'round-robin'` - Simple rotation

## Key Features

✅ Session affinity - same client → same session
✅ Automatic batching - related ops grouped
✅ Exponential backoff - smart retries
✅ Result consolidation - batch results merged
✅ Health tracking - session monitoring
✅ Load balancing - optimal distribution
