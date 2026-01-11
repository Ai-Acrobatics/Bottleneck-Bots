# PRD: Scheduled Tasks & Automation

## Overview
The Scheduled Tasks & Automation system provides cron-based task scheduling and execution management within Bottleneck-Bots. It enables users to schedule browser automations, workflow executions, and other system tasks to run at specific times or intervals, with comprehensive execution history, logging, and status monitoring.

## Problem Statement
Automation value increases when tasks can run without manual intervention:
- Users need automations to run at specific times (daily reports, weekly cleanups)
- Recurring tasks require reliable scheduling without human triggers
- Failed executions need visibility and retry mechanisms
- Multiple scheduled tasks need coordination to avoid conflicts
- Historical execution data is essential for debugging and optimization
- Resource management requires understanding task patterns

## Goals & Objectives

### Primary Goals
- Enable flexible cron-based scheduling for any automation
- Execute browser automations and workflows on schedule
- Maintain comprehensive execution history and logs
- Provide real-time task status monitoring
- Ensure reliable execution with retry and failure handling

### Success Metrics
- Schedule accuracy: >99.9% (within 1 minute of scheduled time)
- Execution success rate: >95%
- Failed task detection: <1 minute
- Log retention: 90 days minimum
- Concurrent scheduled tasks: 100+ per account

## User Stories

### Operations Manager
- As an operations manager, I want to schedule daily data extraction tasks so that reports are ready each morning
- As an operations manager, I want to see which scheduled tasks failed so that I can investigate and fix issues

### Automation Developer
- As an automation developer, I want to run browser automations on a schedule so that they execute without my intervention
- As an automation developer, I want detailed logs for each execution so that I can debug failures

### Agency Owner
- As an agency owner, I want to schedule client automations at optimal times so that they don't conflict with each other
- As an agency owner, I want execution history reports so that I can demonstrate value to clients

### System Administrator
- As a system administrator, I want to monitor system-wide task execution so that I can plan capacity
- As a system administrator, I want to pause all scheduled tasks during maintenance windows

## Functional Requirements

### Must Have (P0)

1. **Cron-Based Scheduling**
   - Standard cron expression support (minute, hour, day, month, weekday)
   - Human-readable schedule builder
   - Common presets (hourly, daily, weekly, monthly)
   - Timezone configuration
   - Next run time preview
   - Schedule validation
   - Multiple schedules per task

2. **Task Types**
   - **Browser Automation Tasks**
     - Execute saved browser sessions
     - Run AI agent workflows
     - Parameter injection at runtime
   - **Workflow Execution**
     - Trigger workflow engine workflows
     - Pass scheduled variables
     - Chain multiple workflows
   - **System Tasks**
     - Data cleanup jobs
     - Report generation
     - Sync operations
     - Backup tasks

3. **Execution Engine**
   - Queue-based execution
   - Concurrency limits
   - Priority scheduling
   - Timeout enforcement
   - Resource allocation
   - Worker distribution
   - Graceful shutdown handling

4. **Execution History**
   - Complete execution log
   - Start and end timestamps
   - Duration tracking
   - Status (success, failed, timeout, cancelled)
   - Error messages and stack traces
   - Output/result storage
   - Execution cost tracking
   - Filterable history view

5. **Task Status Monitoring**
   - Real-time status dashboard
   - Active task display
   - Queue depth visualization
   - Failed task highlighting
   - Execution timeline
   - Resource utilization graphs
   - Alert configuration

6. **Retry & Error Handling**
   - Configurable retry policies
   - Exponential backoff support
   - Maximum retry limits
   - Retry delay configuration
   - Dead letter queue
   - Manual retry trigger
   - Failure notifications

### Should Have (P1)

1. **Task Dependencies**
   - Task chaining (run B after A)
   - Dependency graphs
   - Failure propagation rules
   - Parallel execution groups
   - Wait conditions

2. **Execution Windows**
   - Allowed execution timeframes
   - Blackout periods
   - Business hours only option
   - Holiday calendars
   - Overlap prevention

3. **Resource Management**
   - CPU/memory allocation
   - Browser session limits
   - API rate limit awareness
   - Cost budgets
   - Quota enforcement

4. **Advanced Scheduling**
   - Event-driven scheduling
   - Dynamic schedule modification
   - Conditional execution
   - Schedule versioning
   - A/B schedule testing

### Nice to Have (P2)

1. **Predictive Features**
   - Execution time prediction
   - Failure probability scoring
   - Optimal schedule suggestions
   - Resource requirement forecasting
   - Anomaly detection

2. **Visual Scheduling**
   - Calendar view of schedules
   - Drag-and-drop rescheduling
   - Conflict visualization
   - Gantt chart view
   - Timeline export

3. **Integration Features**
   - Webhook on completion
   - Slack/Teams notifications
   - Email reports
   - API for external triggers
   - Calendar sync (Google, Outlook)

## Non-Functional Requirements

### Performance
- Schedule trigger accuracy: <1 minute
- Queue processing latency: <5 seconds
- Log write latency: <100ms
- Dashboard refresh: Real-time (WebSocket)
- History query: <1 second
- Concurrent executions: 100+ per account

### Security
- Task execution isolation
- Credential encryption
- Audit logging for changes
- Access control by task
- Execution environment sandboxing
- Secret injection at runtime

### Scalability
- 10,000+ scheduled tasks per account
- Distributed scheduler cluster
- Horizontal worker scaling
- Multi-region execution
- Queue sharding

### Reliability
- 99.99% scheduler uptime
- No missed schedules during failover
- Execution state recovery
- Log durability (S3 backup)
- Idempotent execution support

## Technical Requirements

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Scheduler UI  │────▶│  Scheduler API   │────▶│  PostgreSQL     │
│   (React)       │◀────│  (Next.js)       │◀────│  (Tasks/History)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Cron Service    │
                        │  (node-cron)     │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Job Queue       │
                        │  (BullMQ)        │
                        └──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Browser   │   │  Workflow  │   │  System    │
       │  Worker    │   │  Worker    │   │  Worker    │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              ▼                ▼                ▼
       ┌────────────────────────────────────────────┐
       │            Execution Logger               │
       │  - Real-time logs                         │
       │  - Metrics collection                     │
       │  - Status updates                         │
       └────────────────────────────────────────────┘
                               │
                               ▼
                        ┌────────────┐
                        │   Redis    │
                        │ (State/PubSub)│
                        └────────────┘
```

### Dependencies
- **Scheduling**
  - node-cron (cron parsing and scheduling)
  - cronstrue (human-readable descriptions)
  - luxon (timezone handling)

- **Execution**
  - BullMQ (job queue)
  - Redis (state management)
  - Worker threads (isolation)

- **Logging**
  - Winston (structured logging)
  - S3 (log archival)
  - Elasticsearch (log search, optional)

### API Specifications

#### Create Scheduled Task
```typescript
POST /api/scheduler/tasks
Request:
{
  name: string;
  description?: string;
  type: 'browser_automation' | 'workflow' | 'system';
  target: {
    automationId?: string;
    workflowId?: string;
    systemTask?: string;
  };
  schedule: {
    cron: string; // e.g., "0 9 * * 1-5"
    timezone: string; // e.g., "America/New_York"
  };
  parameters?: Record<string, any>;
  settings: {
    timeout: number; // minutes
    retryPolicy: {
      maxRetries: number;
      initialDelay: number;
      backoffMultiplier: number;
    };
    notifications: {
      onSuccess: boolean;
      onFailure: boolean;
      channels: string[];
    };
    concurrencyLimit?: number;
    priority?: 'low' | 'normal' | 'high' | 'critical';
  };
  enabled: boolean;
}
Response:
{
  taskId: string;
  name: string;
  nextRun: string;
  status: 'active' | 'paused';
  createdAt: string;
}
```

#### Get Task Details
```typescript
GET /api/scheduler/tasks/{taskId}
Response:
{
  id: string;
  name: string;
  description?: string;
  type: string;
  target: TaskTarget;
  schedule: {
    cron: string;
    cronDescription: string; // human readable
    timezone: string;
    nextRuns: string[]; // next 5 scheduled runs
  };
  parameters: Record<string, any>;
  settings: TaskSettings;
  status: 'active' | 'paused' | 'disabled';
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDuration: number;
    lastRun?: {
      executionId: string;
      startedAt: string;
      status: string;
      duration: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}
```

#### Trigger Manual Execution
```typescript
POST /api/scheduler/tasks/{taskId}/run
Request:
{
  parameters?: Record<string, any>; // override parameters
  priority?: 'low' | 'normal' | 'high' | 'critical';
}
Response:
{
  executionId: string;
  taskId: string;
  status: 'queued';
  queuePosition: number;
  estimatedStart: string;
}
```

#### Get Execution History
```typescript
GET /api/scheduler/tasks/{taskId}/executions
Query:
{
  status?: 'success' | 'failed' | 'running' | 'cancelled';
  dateRange?: { start: string; end: string };
  limit?: number;
  offset?: number;
}
Response:
{
  executions: {
    id: string;
    taskId: string;
    status: 'queued' | 'running' | 'success' | 'failed' | 'timeout' | 'cancelled';
    trigger: 'scheduled' | 'manual' | 'retry';
    scheduledAt?: string;
    startedAt: string;
    completedAt?: string;
    duration?: number;
    retryCount: number;
    error?: {
      message: string;
      code: string;
      stack?: string;
    };
    output?: any;
    cost?: {
      compute: number;
      api: number;
      total: number;
    };
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

#### Get Execution Logs
```typescript
GET /api/scheduler/executions/{executionId}/logs
Query:
{
  level?: 'debug' | 'info' | 'warn' | 'error';
  limit?: number;
  after?: string; // cursor for streaming
}
Response:
{
  executionId: string;
  logs: {
    timestamp: string;
    level: string;
    message: string;
    metadata?: Record<string, any>;
  }[];
  hasMore: boolean;
  cursor?: string;
}
```

#### Bulk Task Operations
```typescript
POST /api/scheduler/tasks/bulk
Request:
{
  action: 'pause' | 'resume' | 'delete';
  taskIds: string[];
}
Response:
{
  success: string[];
  failed: {
    taskId: string;
    error: string;
  }[];
}
```

#### Get Scheduler Dashboard
```typescript
GET /api/scheduler/dashboard
Response:
{
  overview: {
    activeTasks: number;
    pausedTasks: number;
    runningExecutions: number;
    queuedExecutions: number;
    todayExecutions: number;
    todaySuccessRate: number;
  };
  recentExecutions: Execution[];
  upcomingRuns: {
    taskId: string;
    taskName: string;
    scheduledAt: string;
  }[];
  failedTasks: {
    taskId: string;
    taskName: string;
    lastFailure: string;
    consecutiveFailures: number;
  }[];
  resourceUsage: {
    cpuUtilization: number;
    memoryUtilization: number;
    activeWorkers: number;
    queueDepth: number;
  };
}
```

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Schedule Accuracy | >99.9% | Scheduled vs actual start time |
| Execution Success Rate | >95% | Successful / Total executions |
| Failed Task Detection | <1 min | Alert latency monitoring |
| Log Retention | 90 days | Storage policy audit |
| Concurrent Tasks | 100+/acct | Load testing |
| Queue Latency | <5s | Queue metrics |
| Dashboard Uptime | 99.9% | Availability monitoring |

## Dependencies

### Internal Dependencies
- Browser Automation System (for browser tasks)
- Workflow Engine (for workflow tasks)
- Notification Service (for alerts)
- Storage Service (for logs)
- Authentication System (for access control)

### External Dependencies
- Redis (BullMQ backend)
- S3 (log archival)
- Time synchronization (NTP)

### Blocking Dependencies
- BullMQ infrastructure
- Worker auto-scaling setup
- Log storage configuration

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Missed scheduled runs | High | Low | Distributed scheduler, health checks, failover |
| Cascading failures | High | Medium | Circuit breakers, task isolation, rate limiting |
| Resource exhaustion | High | Medium | Concurrency limits, queue depth monitoring, auto-scaling |
| Log storage costs | Medium | High | Compression, tiered storage, retention policies |
| Timezone handling bugs | Medium | Medium | Standardized UTC storage, extensive timezone testing |
| Worker crashes | Medium | Medium | Graceful shutdown, job recovery, health monitoring |
| Queue backup | High | Medium | Queue depth alerts, auto-scaling, priority queuing |

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Core Scheduler | 3 weeks | Cron engine, task CRUD, basic execution |
| Phase 2: Execution Engine | 3 weeks | BullMQ workers, retry logic, timeouts |
| Phase 3: Logging | 2 weeks | Structured logs, history, search |
| Phase 4: Monitoring | 2 weeks | Dashboard, alerts, real-time status |
| Phase 5: Advanced Features | 2 weeks | Dependencies, windows, priorities |
| Phase 6: Integration | 2 weeks | Browser/workflow connections |
| Phase 7: Testing | 2 weeks | Load testing, reliability testing |

## Open Questions
1. Should we support sub-minute scheduling (every 30 seconds)?
2. What is the maximum log retention period we should offer?
3. Should tasks have individual resource quotas or share a pool?
4. How do we handle DST transitions for scheduled tasks?
5. Should we support multi-region task execution?
