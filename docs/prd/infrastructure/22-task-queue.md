# PRD: Async Task Queue System

## Overview
A robust asynchronous task queue system built on BullMQ for managing long-running and resource-intensive operations including email synchronization, voice call processing, PDF generation, lead enrichment, and workflow execution. This system ensures reliable, scalable, and observable background job processing.

## Problem Statement
Many operations in Bottleneck-Bots are time-consuming and cannot be processed synchronously within HTTP request timeouts. Email syncing, voice call transcription, PDF generation, and complex workflow execution require background processing with retry capabilities, priority management, and progress tracking. Without a proper queue system, these operations would timeout, fail silently, or block user-facing operations.

## Goals & Objectives
- **Primary Goals**
  - Provide reliable async processing for all long-running operations
  - Enable job prioritization and scheduling
  - Ensure at-least-once delivery with retry mechanisms
  - Provide real-time job status and progress tracking

- **Success Metrics**
  - 99.99% job completion rate
  - < 100ms job enqueue latency
  - < 30 second average job wait time
  - Zero job loss during system restarts

## User Stories
- As a user, I want to sync my email without waiting so that I can continue working while emails load in the background
- As a user, I want to see progress updates on long-running tasks so that I know the system is working
- As an admin, I want to monitor queue health so that I can identify and resolve bottlenecks
- As a developer, I want failed jobs to automatically retry so that transient failures don't require manual intervention
- As a user, I want scheduled jobs to run at specific times so that I can automate recurring tasks

## Functional Requirements

### Must Have (P0)
- **Queue Management**
  - Create and configure multiple named queues
  - Set queue-specific concurrency limits
  - Configure job retention policies
  - Queue pause/resume functionality

- **Job Types**
  - Email sync jobs (IMAP/SMTP)
  - Voice call processing jobs
  - PDF generation jobs
  - Lead enrichment jobs
  - Workflow execution jobs
  - Webhook delivery jobs
  - Data export jobs

- **Job Lifecycle**
  - Job creation with payload validation
  - Priority-based job scheduling (1-10 scale)
  - Delayed job execution
  - Job cancellation
  - Job progress updates
  - Job completion/failure callbacks

- **Retry & Error Handling**
  - Configurable retry attempts (default: 3)
  - Exponential backoff strategy
  - Dead letter queue for failed jobs
  - Error logging and notification

- **Monitoring & Observability**
  - Real-time queue metrics
  - Job status API endpoints
  - Worker health monitoring
  - Performance dashboards

### Should Have (P1)
- **Scheduling**
  - Cron-based recurring jobs
  - One-time scheduled jobs
  - Job scheduling UI
  - Timezone-aware scheduling

- **Rate Limiting**
  - Per-queue rate limits
  - Per-user rate limits
  - Global rate limiting
  - Rate limit visualization

- **Job Dependencies**
  - Parent-child job relationships
  - Job chaining
  - Parallel job execution
  - Dependency graph visualization

- **Worker Management**
  - Dynamic worker scaling
  - Worker affinity for job types
  - Graceful worker shutdown
  - Worker resource limits

### Nice to Have (P2)
- **Advanced Features**
  - Job deduplication
  - Job batching
  - Result caching
  - Replay failed jobs in bulk

- **Integration**
  - Slack notifications for failures
  - PagerDuty integration
  - Custom webhook notifications

## Non-Functional Requirements

### Performance
- Job enqueue latency < 100ms
- Job pickup latency < 1 second
- Support 10,000+ concurrent jobs
- Process 1,000+ jobs per minute per worker

### Security
- Job payload encryption for sensitive data
- Worker authentication
- Audit logging for job operations
- Tenant isolation in multi-tenant setup

### Scalability
- Horizontal worker scaling
- Redis cluster support
- Partitioned queues for high-volume jobs
- Auto-scaling based on queue depth

### Reliability
- At-least-once delivery guarantee
- Job persistence across restarts
- Automatic worker recovery
- Data center failover support

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      Task Queue System                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Job Producers                     │   │
│  │  (API, Workflows, Webhooks, Cron, Internal Events)  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Queue Manager                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │  Email  │ │  Voice  │ │   PDF   │ │ Workflow│   │   │
│  │  │  Queue  │ │  Queue  │ │  Queue  │ │  Queue  │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │  Lead   │ │ Webhook │ │  Export │ │   DLQ   │   │   │
│  │  │ Enrich  │ │ Delivery│ │  Queue  │ │  Queue  │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Worker Pool                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │Worker 1 │ │Worker 2 │ │Worker 3 │ │Worker N │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Redis (BullMQ Backend)                    │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- BullMQ v4+
- Redis 6+ (with persistence)
- PostgreSQL (job metadata storage)
- Bull Board (monitoring UI)

### APIs
```typescript
// Job creation
POST /api/v1/jobs
{
  "queue": "email-sync",
  "data": { "userId": "...", "accountId": "..." },
  "options": {
    "priority": 5,
    "delay": 0,
    "attempts": 3,
    "backoff": { "type": "exponential", "delay": 1000 }
  }
}

// Job status
GET /api/v1/jobs/:jobId
GET /api/v1/jobs/:jobId/progress

// Queue metrics
GET /api/v1/queues/:queueName/metrics
GET /api/v1/queues/health
```

### Data Models
```typescript
interface Job {
  id: string;
  queue: string;
  name: string;
  data: Record<string, any>;
  opts: JobOptions;
  progress: number;
  attemptsMade: number;
  processedOn?: Date;
  finishedOn?: Date;
  failedReason?: string;
  stacktrace?: string[];
  returnvalue?: any;
}

interface JobOptions {
  priority: number; // 1-10
  delay: number; // ms
  attempts: number;
  backoff: BackoffStrategy;
  timeout: number; // ms
  removeOnComplete: boolean | number;
  removeOnFail: boolean | number;
}

interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  workerCount: number;
}
```

### Queue Configuration
```typescript
const queues = {
  'email-sync': {
    concurrency: 5,
    rateLimit: { max: 100, duration: 60000 },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      timeout: 300000 // 5 minutes
    }
  },
  'voice-processing': {
    concurrency: 3,
    defaultJobOptions: {
      attempts: 2,
      timeout: 600000 // 10 minutes
    }
  },
  'pdf-generation': {
    concurrency: 10,
    defaultJobOptions: {
      attempts: 3,
      timeout: 60000 // 1 minute
    }
  },
  'lead-enrichment': {
    concurrency: 20,
    rateLimit: { max: 1000, duration: 60000 },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 }
    }
  },
  'workflow-execution': {
    concurrency: 50,
    defaultJobOptions: {
      attempts: 3,
      timeout: 1800000 // 30 minutes
    }
  }
};
```

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Job Completion Rate | 99.99% | (Completed / Total) * 100 |
| Enqueue Latency | < 100ms | Time to add job to queue |
| Job Wait Time | < 30s | Time in queue before processing |
| Worker Utilization | 70-90% | Active time / Total time |
| Dead Letter Rate | < 0.01% | Jobs moved to DLQ / Total |
| Job Throughput | 1000+/min | Jobs processed per minute |

## Dependencies
- Redis infrastructure (managed or self-hosted)
- Worker deployment infrastructure (Kubernetes/Docker)
- Monitoring stack (Prometheus/Grafana)
- Alerting system for queue anomalies

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Redis memory exhaustion | Critical - Queue system failure | Memory monitoring, job cleanup policies, Redis cluster |
| Worker process crashes | Medium - Job delays | Automatic worker restart, job recovery mechanism |
| Job payload too large | Medium - Performance degradation | Payload size limits, external storage for large data |
| Poison jobs (always fail) | Medium - Queue blockage | Max retry limits, automatic DLQ routing |
| Rate limit conflicts | Low - Throttled processing | Per-tenant rate limit isolation |
| Long-running jobs timeout | Medium - Lost work | Checkpointing, progress persistence, job resumption |
