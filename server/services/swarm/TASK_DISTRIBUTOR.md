# GHL Task Distributor Service

## Overview

The Task Distributor Service is an enhanced intelligent task assignment and load balancing system specifically optimized for GoHighLevel (GHL) automation workflows. It handles browser session management, task batching, retry mechanisms, and result consolidation.

## Key Features

### 1. GHL-Specific Task Routing
- **Operation Type Awareness**: Understands 20+ GHL operation types (contacts, opportunities, workflows, etc.)
- **Urgency-Based Prioritization**: Automatic priority assignment based on operation type
  - Level 1 (Critical): Conversation sends, workflow triggers, calendar bookings
  - Level 2 (High): Contact/opportunity creation, pipeline updates
  - Level 3 (Normal): Updates, task creation, notes
  - Level 4 (Low): Campaign operations, tags
  - Level 5 (Background): Bulk operations, reports, exports

### 2. Browser Session Management
- **Session Affinity**: Same client tasks routed to same browser session
- **Load Balancing**: Distributes tasks across available sessions
- **Health Monitoring**: Tracks session health and avoids unhealthy sessions
- **Capacity Management**: Respects max concurrent tasks per session
- **Auto-Cleanup**: Removes stale sessions after timeout period (default: 5 minutes)

### 3. Task Batching
- **Automatic Batching**: Groups related operations for efficiency
- **Batch Window**: Collects tasks for 2 seconds before processing
- **Size Limits**: Processes batch when max size reached (default: 10 tasks)
- **Result Consolidation**: Aggregates results from batched tasks

### 4. Retry Mechanism
- **Exponential Backoff**: Delays between retries increase exponentially
  - Retry 1: 1 second
  - Retry 2: 2 seconds
  - Retry 3: 4 seconds
- **Max Attempts**: Default 3 retries before permanent failure
- **Smart Retry**: Failed tasks re-queued with high priority
- **Session Health Impact**: Failed tasks reduce session health score

### 5. Distribution Strategies

#### Session-Aware (Default - GHL Optimized)
- Prioritizes agents with healthy browser sessions
- Considers session capacity and workload
- Balances across sessions to prevent overload

#### Capability-Based
- Scores agents by capability match
- Considers health, success rate, availability

#### Least-Loaded
- Selects agent with lowest current workload

#### Round-Robin
- Simple rotation through available agents

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Task Distributor                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐      ┌──────────────┐                  │
│  │  Task Queue   │─────▶│  Batcher     │                  │
│  │  (Priority)   │      │  (2s window) │                  │
│  └───────────────┘      └──────────────┘                  │
│         │                      │                            │
│         ▼                      ▼                            │
│  ┌─────────────────────────────────────┐                  │
│  │     Distribution Strategy            │                  │
│  │  (Session-Aware / Capability-Based)  │                  │
│  └─────────────────────────────────────┘                  │
│         │                                                   │
│         ▼                                                   │
│  ┌───────────────────────────────────────────────┐        │
│  │         Session Affinity Manager              │        │
│  │  ┌─────────────┐  ┌─────────────┐            │        │
│  │  │  Session 1  │  │  Session 2  │  ...       │        │
│  │  │  Agent A    │  │  Agent B    │            │        │
│  │  │  Client X   │  │  Client Y   │            │        │
│  │  └─────────────┘  └─────────────┘            │        │
│  └───────────────────────────────────────────────┘        │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                  │
│  │       Result Consolidator            │                  │
│  │   (Batch Results / Retry Logic)      │                  │
│  └─────────────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Initialization

```typescript
import { TaskDistributor } from './taskDistributor.service';

// Initialize with session-aware strategy (recommended for GHL)
const distributor = new TaskDistributor('session-aware');

// Listen to events
distributor.on('task:queued', (data) => console.log('Task queued:', data));
distributor.on('task:assigned', (data) => console.log('Task assigned:', data));
distributor.on('task:completed', (data) => console.log('Task completed:', data));
distributor.on('task:retry_scheduled', (data) => console.log('Retry scheduled:', data));
```

### Queue a GHL Task

```typescript
const task: TaskDefinition = {
  id: { id: 'task_001', swarmId: 'swarm_123', sequence: 1, priority: 2 },
  type: 'custom',
  name: 'Create Contact',
  description: 'Create new contact in GHL',
  priority: 'high',
  status: 'created',
  requirements: {
    capabilities: ['ghl-automation'],
    tools: ['browserbase'],
    permissions: ['write'],
  },
  constraints: {
    dependencies: [],
    maxRetries: 3,
    timeoutAfter: 30000,
  },
  input: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  createdAt: new Date(),
  updatedAt: new Date(),
  attempts: 0,
  maxRetries: 3,
};

// Queue with GHL operation type and client ID for session affinity
await distributor.queueTask(task, 'contact_create', 'client_acme_001');
```

### Register Browser Sessions

```typescript
// Register session with client affinity
distributor.registerBrowserSession(
  'bb_session_12345',  // Session ID from Browserbase
  'agent_001',          // Agent ID
  'client_acme_001'     // Client ID for affinity
);
```

### Distribute Tasks to Agents

```typescript
const agents: AgentState[] = [/* your available agents */];
const assignedCount = await distributor.distributeTasks(agents);
console.log(`Assigned ${assignedCount} tasks`);
```

### Complete a Task

```typescript
const result = {
  taskId: task.id,
  status: 'completed',
  output: { contactId: 'contact_123', success: true },
  executionTime: 3500,
  resourcesUsed: { cpu: 0.2, memory: 128, disk: 0 },
  quality: 0.95,
};

await distributor.completeTask('task_001', result);
```

### Handle Task Failure

```typescript
// Automatically triggers retry with exponential backoff
await distributor.failTask('task_001', task, 'Network timeout');
```

### Monitor Queue Status

```typescript
const status = distributor.getQueueStatus();
console.log(status);
// {
//   queueLength: 15,
//   activeAssignments: 8,
//   activeBatches: 2,
//   activeSessions: 3,
//   failedTasksAwaitingRetry: 1,
//   tasksByPriority: { critical: 2, high: 5, normal: 8, low: 0, background: 0 },
//   tasksByGHLOperation: { contact_create: 3, tag_add: 5, workflow_trigger: 2 },
//   sessionHealth: { healthy: 2, degraded: 1, unhealthy: 0 }
// }
```

### Get Batch Results

```typescript
const batchResults = distributor.getBatchResults('batch_12345');
if (batchResults) {
  console.log(`Success: ${batchResults.successCount}, Failed: ${batchResults.failureCount}`);
  console.log('Consolidated output:', batchResults.consolidatedOutput);
}
```

## GHL Operation Types

| Operation | Urgency | Duration (ms) | Session Required | Batchable |
|-----------|---------|---------------|------------------|-----------|
| conversation_send | 1 (Critical) | 5000 | Yes | No |
| workflow_trigger | 1 (Critical) | 3000 | Yes | No |
| calendar_booking | 1 (Critical) | 8000 | Yes | No |
| contact_create | 2 (High) | 4000 | Yes | Yes |
| opportunity_create | 2 (High) | 5000 | Yes | Yes |
| pipeline_update | 2 (High) | 3000 | Yes | No |
| contact_update | 3 (Normal) | 3000 | Yes | Yes |
| opportunity_update | 3 (Normal) | 4000 | Yes | Yes |
| task_create | 3 (Normal) | 2000 | Yes | Yes |
| note_create | 3 (Normal) | 2000 | Yes | Yes |
| custom_field_update | 3 (Normal) | 2500 | Yes | Yes |
| campaign_add | 4 (Low) | 3000 | Yes | Yes |
| campaign_remove | 4 (Low) | 3000 | Yes | Yes |
| tag_add | 4 (Low) | 1500 | Yes | Yes |
| tag_remove | 4 (Low) | 1500 | Yes | Yes |
| conversation_read | 4 (Low) | 2000 | Yes | No |
| contact_delete | 5 (Background) | 3000 | Yes | Yes |
| bulk_operation | 5 (Background) | 30000 | Yes | No |
| report_generate | 5 (Background) | 15000 | Yes | No |
| data_export | 5 (Background) | 20000 | Yes | No |
| integration_sync | 5 (Background) | 10000 | No | No |

## Events

### Task Events
- `task:queued` - Task added to queue
- `task:batched` - Task added to batch
- `task:assigned` - Task assigned to agent
- `task:completed` - Task completed successfully
- `task:failed` - Task permanently failed
- `task:retry_scheduled` - Task scheduled for retry
- `task:retrying` - Task being retried

### Batch Events
- `batch:processed` - Batch processed and tasks queued
- `batch:result_consolidated` - Batch result consolidated

### Session Events
- `session:registered` - Browser session registered
- `session:released` - Browser session released
- `session:cleaned` - Stale session cleaned up

## Configuration

```typescript
class TaskDistributor {
  // Retry configuration
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly BASE_RETRY_DELAY = 1000; // 1 second
  private readonly MAX_RETRY_DELAY = 32000; // 32 seconds

  // Batching configuration
  private readonly BATCH_WINDOW_MS = 2000; // 2 seconds
  private readonly MAX_BATCH_SIZE = 10;

  // Session configuration
  private readonly SESSION_AFFINITY_TIMEOUT = 300000; // 5 minutes
}
```

## Best Practices

### 1. Session Affinity
- Always provide `clientId` for tasks that should maintain session state
- This ensures consistency and reduces session creation overhead

### 2. Task Batching
- Group similar operations from the same client
- Use batchable operations (tags, updates) to improve throughput

### 3. Error Handling
- Monitor `task:failed` events for permanent failures
- Implement dead-letter queue for tasks that exceed retry limits

### 4. Session Management
- Register sessions immediately after creation
- Monitor `sessionHealth` metrics
- Clean up sessions regularly using `cleanupStaleSessions()`

### 5. Performance Monitoring
- Check `getQueueStatus()` regularly
- Monitor batch consolidation results
- Track session utilization and health

## Integration with Swarm Coordinator

```typescript
import { SwarmCoordinator } from './coordinator.service';
import { TaskDistributor } from './taskDistributor.service';

// In coordinator.service.ts
class SwarmCoordinator {
  private taskDistributor: TaskDistributor;

  constructor() {
    this.taskDistributor = new TaskDistributor('session-aware');
  }

  async executeTask(task: TaskDefinition, ghlOperationType: GHLOperationType, clientId: string) {
    // Queue task with GHL metadata
    await this.taskDistributor.queueTask(task, ghlOperationType, clientId);

    // Distribute to available agents
    const agents = Array.from(this.agents.values());
    await this.taskDistributor.distributeTasks(agents);
  }
}
```

## Troubleshooting

### Tasks Not Being Assigned
- Check if agents are available (`AgentState.status === 'idle' or 'busy'`)
- Verify agent capabilities match task requirements
- Check if agents have workload capacity (`workload < 0.9`)

### High Retry Rate
- Check session health metrics
- Verify browser session stability
- Review error messages in `task:failed` events

### Sessions Not Being Reused
- Ensure `clientId` is provided consistently
- Check session affinity timeout hasn't expired
- Verify session health is above threshold (0.5)

### Batches Not Processing
- Check batch window timeout (default 2 seconds)
- Verify operations are batchable
- Ensure clientId is consistent for batch grouping

## Performance Metrics

Monitor these key metrics:
- **Queue Length**: Should stay low under normal load
- **Active Assignments**: Should match agent capacity
- **Session Health**: Healthy > 70%, Degraded 30-70%, Unhealthy < 30%
- **Batch Efficiency**: Success rate of batched operations
- **Retry Rate**: Should be < 10% of total tasks

## Future Enhancements

- [ ] Priority lane for time-sensitive operations
- [ ] Adaptive batch sizing based on operation type
- [ ] Machine learning for optimal task routing
- [ ] Circuit breaker for failing sessions
- [ ] Distributed task queue support
- [ ] Real-time dashboard for monitoring
