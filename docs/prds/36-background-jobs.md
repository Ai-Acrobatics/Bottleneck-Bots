# PRD-036: Background Jobs System

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/_core/queue.ts`, `server/workers/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Dependencies](#8-dependencies)
9. [Out of Scope](#9-out-of-scope)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Milestones & Timeline](#11-milestones--timeline)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Overview

The Background Jobs System provides a robust, scalable infrastructure for executing asynchronous tasks across the Bottleneck Bots platform. Built on BullMQ with Redis as the message broker, this system handles email synchronization, AI-powered draft generation, voice call orchestration, lead enrichment, workflow execution, memory cleanup, and webhook retry operations with enterprise-grade reliability.

### 1.1 Feature Summary

- **BullMQ Job Queue System**: Enterprise-grade job processing with Redis persistence
- **Email Sync Jobs**: Automated synchronization with Gmail and Outlook providers
- **Email Draft Jobs**: AI-powered email response generation using Claude
- **Voice Call Jobs**: Outbound call management via Vapi integration
- **Lead Enrichment Jobs**: Batch processing of lead data via Appify
- **Workflow Execution Jobs**: Browser automation workflow processing via Browserbase
- **Memory Cleanup Jobs**: Automated memory and pattern consolidation
- **Webhook Retry Jobs**: Failed webhook redelivery with exponential backoff
- **Scheduled Task Execution**: Cron-based job scheduling support
- **Retry with Exponential Backoff**: Configurable retry strategies per queue
- **Job Status Tracking**: Real-time progress monitoring and completion tracking
- **Graceful Shutdown**: Clean worker termination and job preservation

### 1.2 Target Users

- **System Administrators**: Managing worker processes and monitoring queue health
- **DevOps Engineers**: Deploying and scaling worker infrastructure
- **Backend Developers**: Integrating new job types and processors
- **Platform Users (Indirect)**: Benefiting from reliable async processing of their requests
- **Agency Managers**: Monitoring job execution and system reliability

### 1.3 Current Implementation

The Background Jobs system is implemented across the following files:

| File | Purpose |
|------|---------|
| `server/_core/queue.ts` | Queue configuration, job types, connection management |
| `server/workers/index.ts` | Worker entry point and process management |
| `server/workers/emailWorker.ts` | Email sync and draft job processing |
| `server/workers/voiceWorker.ts` | Voice call job processing via Vapi |
| `server/workers/enrichmentWorker.ts` | Lead enrichment batch processing |
| `server/workers/workflowWorker.ts` | Browser automation workflow execution |
| `server/workers/memoryCleanup.worker.ts` | Memory and pattern cleanup jobs |
| `server/workers/webhookRetryWorker.ts` | Failed webhook retry processing |
| `server/workers/utils.ts` | Shared utilities and Redis connection |

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Synchronous Processing Bottlenecks**: Long-running operations like email sync and voice calls block API responses, degrading user experience
2. **Unreliable Execution**: Without proper retry mechanisms, transient failures result in lost work and incomplete operations
3. **No Visibility**: Lack of centralized job monitoring means failures go unnoticed until users report missing data
4. **Resource Contention**: CPU-intensive tasks compete with API request handling, causing latency spikes
5. **Memory Leaks**: Long-running agent sessions accumulate stale data without automated cleanup
6. **Webhook Delivery Failures**: Network issues cause permanent webhook loss without retry mechanisms
7. **Scaling Limitations**: Single-process architecture limits horizontal scaling of background work

### 2.2 User Pain Points

- "My email sync takes too long and times out the request"
- "When voice calls fail, I don't know if they'll be retried automatically"
- "Bulk lead enrichment jobs freeze the UI while processing"
- "I can't see what jobs are running or queued in the system"
- "When workflows fail mid-execution, there's no way to retry them"
- "Webhook deliveries silently fail with no retry attempts"
- "Memory usage grows unbounded over long sessions"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Synchronous blocking | 40% API timeout rate for long-running operations |
| No retry logic | 15% permanent job failures from transient errors |
| Resource contention | 2-3x latency increase during peak processing |
| No job visibility | 4-8 hour average detection time for stuck jobs |
| Webhook failures | 10% lost webhook events, broken integrations |
| Memory accumulation | System restarts required every 48 hours |
| Single-process limits | Cannot scale beyond 1 node for background work |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Provide reliable async job execution with 99.9% delivery guarantee | P0 |
| **G2** | Implement intelligent retry with exponential backoff for all job types | P0 |
| **G3** | Enable horizontal scaling of worker processes across multiple nodes | P0 |
| **G4** | Provide real-time job status tracking and progress monitoring | P1 |
| **G5** | Automate memory cleanup and pattern consolidation | P1 |
| **G6** | Support graceful shutdown with job preservation during deployments | P1 |
| **G7** | Enable priority-based job scheduling for critical operations | P2 |

### 3.2 Success Metrics (KPIs)

#### Job Execution Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Job Delivery Rate | >= 99.9% | Jobs completed or retried / Jobs submitted |
| First-Attempt Success Rate | >= 85% | Jobs succeeding on first attempt |
| Retry Recovery Rate | >= 75% | Failed jobs recovered via retry |
| Job Processing Latency | < 5 seconds | Time from queue to processing start |
| P95 Email Sync Duration | < 120 seconds | 95th percentile email sync time |
| P95 Voice Call Setup | < 10 seconds | 95th percentile call initiation time |

#### Queue Health Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Queue Depth (waiting) | < 100 jobs | Average jobs waiting per queue |
| Active Job Count | <= concurrency limit | Jobs being processed |
| Failed Job Rate | < 1% after retries | Permanently failed / Total jobs |
| Job Throughput | >= 100 jobs/minute | Jobs completed per minute |
| Queue Latency | < 30 seconds | Wait time before processing starts |

#### Worker Health Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Worker Availability | >= 99.9% | Worker uptime percentage |
| Graceful Shutdown Time | < 60 seconds | Time to complete shutdown |
| Memory Usage per Worker | < 512 MB | Peak memory consumption |
| CPU Usage per Worker | < 80% | Average CPU utilization |

#### Reliability Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Mean Time Between Failures | >= 7 days | Average uptime between crashes |
| Mean Time to Recovery | < 5 minutes | Time to restore after failure |
| Data Loss Rate | 0% | Jobs lost due to system failure |
| Webhook Retry Success | >= 90% | Failed webhooks eventually delivered |

---

## 4. User Stories

### 4.1 Email Processing Stories

#### US-001: Background Email Synchronization
**As a** user with connected email accounts
**I want my** emails to sync in the background
**So that** I can continue using the application while sync completes

**Acceptance Criteria:**
- Email sync jobs are queued immediately upon trigger
- User receives confirmation that sync has started
- Progress updates are available via SSE or polling
- Completion notification is sent when sync finishes
- Failures trigger up to 3 retry attempts with exponential backoff
- Sync history is recorded in `emailSyncHistory` table

#### US-002: AI Draft Generation in Background
**As a** user viewing an email thread
**I want** AI draft generation to happen asynchronously
**So that** I can continue browsing while the draft is created

**Acceptance Criteria:**
- Draft generation jobs are queued with thread context
- User can continue navigating without blocking
- Draft appears automatically when generation completes
- Failed generation attempts retry up to 3 times
- Draft quality and tone settings are preserved across retries

### 4.2 Voice Call Stories

#### US-003: Asynchronous Voice Call Initiation
**As a** user initiating an AI voice call
**I want** the call to be processed in the background
**So that** I don't have to wait for the full call duration

**Acceptance Criteria:**
- Voice call job is queued with phone number and script
- Call is initiated via Vapi within 10 seconds
- Call status is polled and updated in real-time
- Call outcome, transcript, and recording are stored on completion
- Campaign statistics are updated automatically
- Failed calls retry up to 2 times with 5-second initial delay

#### US-004: Campaign Call Progress Tracking
**As a** campaign manager
**I want** to see call progress across my campaign
**So that** I can monitor effectiveness and intervene if needed

**Acceptance Criteria:**
- Individual call statuses update in real-time
- Campaign aggregate statistics update after each call
- Failed call reasons are recorded for analysis
- Call recordings and transcripts are accessible post-completion

### 4.3 Enrichment Stories

#### US-005: Bulk Lead Enrichment
**As a** sales manager importing leads
**I want** leads to be enriched in the background
**So that** I can import large batches without timeouts

**Acceptance Criteria:**
- Lead enrichment jobs accept batches of any size
- Processing occurs in configurable batch sizes (default: 5)
- Progress updates show percentage complete
- Rate limiting prevents API throttling
- Failed individual enrichments are logged but don't fail the batch
- Final summary shows success/failure counts

### 4.4 Workflow Execution Stories

#### US-006: Background Workflow Execution
**As a** user triggering a browser automation workflow
**I want** workflows to execute asynchronously
**So that** I can queue multiple workflows without blocking

**Acceptance Criteria:**
- Workflow execution jobs are queued with full context
- Browser session is provisioned and managed by worker
- Step-by-step progress is tracked and reported
- Execution results are stored with full history
- Failed workflows can be manually retried
- Resource-intensive workflows respect concurrency limits

### 4.5 System Maintenance Stories

#### US-007: Automatic Memory Cleanup
**As a** system administrator
**I want** memory and patterns to be cleaned up automatically
**So that** the system maintains optimal performance

**Acceptance Criteria:**
- Memory cleanup jobs run on configurable schedule
- Expired entries are automatically removed
- Low-performance patterns are consolidated
- Cleanup results are logged for monitoring
- No user-facing impact during cleanup

#### US-008: Webhook Delivery Retry
**As a** webhook consumer
**I want** failed webhooks to be automatically retried
**So that** I don't miss important events due to transient failures

**Acceptance Criteria:**
- Failed webhooks are queued for retry
- Retry uses exponential backoff strategy
- Maximum retry attempts are configurable (default: 5)
- Permanently failed webhooks are marked and logged
- Retry history is available for debugging

### 4.6 Operations Stories

#### US-009: Queue Monitoring Dashboard
**As a** system administrator
**I want** to view queue statistics in real-time
**So that** I can monitor system health and identify bottlenecks

**Acceptance Criteria:**
- Dashboard shows all queue names and statistics
- Waiting, active, completed, failed counts are visible
- Queue can be paused/resumed from dashboard
- Failed jobs can be retried or deleted
- Historical metrics are available for trending

#### US-010: Graceful Worker Shutdown
**As a** DevOps engineer deploying updates
**I want** workers to shut down gracefully
**So that** in-progress jobs complete without data loss

**Acceptance Criteria:**
- SIGTERM/SIGINT triggers graceful shutdown
- Active jobs complete before worker exits
- Queued jobs remain in Redis for other workers
- Shutdown completes within 60 seconds
- Stuck jobs are logged for manual intervention

---

## 5. Functional Requirements

### 5.1 Queue Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | Support 6 distinct job queues (email, voice, seo, ads, enrichment, workflow) | P0 | Implemented |
| FR-002 | Parse Redis connection from URL or individual environment variables | P0 | Implemented |
| FR-003 | Support both `redis://` and `rediss://` (TLS) protocols | P0 | Implemented |
| FR-004 | Gracefully handle missing Redis configuration | P1 | Implemented |
| FR-005 | Provide typed job data interfaces for all job types | P0 | Implemented |
| FR-006 | Support job priority levels (1-10) | P1 | Implemented |
| FR-007 | Support delayed job execution | P1 | Implemented |
| FR-008 | Enable job deduplication via `jobId` | P1 | Implemented |

### 5.2 Job Types

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-010 | EMAIL_SYNC: Sync emails from Gmail/Outlook with pagination | P0 | Implemented |
| FR-011 | EMAIL_DRAFT: Generate AI email responses with context | P0 | Implemented |
| FR-012 | VOICE_CALL: Initiate and monitor Vapi voice calls | P0 | Implemented |
| FR-013 | SEO_AUDIT: Perform website SEO analysis | P1 | Defined |
| FR-014 | KEYWORD_ANALYSIS: Analyze keyword performance | P1 | Defined |
| FR-015 | AD_ANALYSIS: Analyze advertising platform performance | P1 | Defined |
| FR-016 | AD_AUTOMATION: Execute advertising automation tasks | P2 | Defined |
| FR-017 | LEAD_ENRICHMENT: Enrich lead data via external APIs | P0 | Implemented |
| FR-018 | WORKFLOW_EXECUTION: Execute browser automation workflows | P0 | Implemented |
| FR-019 | MEMORY_CLEANUP: Clean expired memory entries | P1 | Implemented |
| FR-020 | MEMORY_CONSOLIDATION: Consolidate agent patterns | P1 | Implemented |

### 5.3 Retry Configuration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-030 | Default email queue: 3 attempts, 2s initial backoff | P0 | Implemented |
| FR-031 | Default voice queue: 2 attempts, 5s initial backoff | P0 | Implemented |
| FR-032 | Default SEO queue: 3 attempts, 10s initial backoff | P1 | Implemented |
| FR-033 | Default enrichment queue: 3 attempts, 5s initial backoff | P0 | Implemented |
| FR-034 | Default workflow queue: 3 attempts, 2s initial backoff | P0 | Implemented |
| FR-035 | Support exponential backoff strategy for all queues | P0 | Implemented |
| FR-036 | Configurable `removeOnComplete` with age and count limits | P1 | Implemented |
| FR-037 | Configurable `removeOnFail` with age limits | P1 | Implemented |

### 5.4 Worker Configuration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-040 | Email worker concurrency: 5 jobs, 10/second rate limit | P0 | Implemented |
| FR-041 | Voice worker concurrency: 3 jobs, 5/second rate limit | P0 | Implemented |
| FR-042 | Enrichment worker concurrency: 2 jobs, 10/second rate limit | P0 | Implemented |
| FR-043 | Workflow worker concurrency: 3 jobs, 10/second rate limit | P0 | Implemented |
| FR-044 | Memory cleanup worker concurrency: 2 jobs, 5/minute rate limit | P1 | Implemented |
| FR-045 | Support configurable concurrency per worker | P1 | Implemented |
| FR-046 | Support per-worker rate limiting | P1 | Implemented |

### 5.5 Job Status and Progress

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-050 | Track job progress as percentage (0-100) | P0 | Implemented |
| FR-051 | Update progress at meaningful milestones | P0 | Implemented |
| FR-052 | Log job start, progress, completion, and failure | P0 | Implemented |
| FR-053 | Return structured result data on completion | P0 | Implemented |
| FR-054 | Store job execution metadata for debugging | P1 | Implemented |
| FR-055 | Track sync history in database (email jobs) | P1 | Implemented |
| FR-056 | Track campaign statistics (voice jobs) | P1 | Implemented |

### 5.6 Queue Statistics

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-060 | `getQueueStats`: waiting, active, completed, failed, delayed counts | P0 | Implemented |
| FR-061 | `getAllQueueStats`: aggregate stats for all queues | P0 | Implemented |
| FR-062 | Report queue paused status | P1 | Implemented |
| FR-063 | Return availability flag when Redis not configured | P1 | Implemented |

### 5.7 Shutdown and Cleanup

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-070 | Handle SIGTERM for graceful shutdown | P0 | Implemented |
| FR-071 | Handle SIGINT for graceful shutdown | P0 | Implemented |
| FR-072 | Close all workers before shutdown | P0 | Implemented |
| FR-073 | Close queue connections on shutdown | P0 | Implemented |
| FR-074 | Close queue event listeners on shutdown | P1 | Implemented |
| FR-075 | Handle uncaught exceptions with shutdown | P0 | Implemented |
| FR-076 | Handle unhandled rejections with shutdown | P0 | Implemented |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Job enqueue latency | < 50ms |
| NFR-002 | Job dequeue latency | < 100ms |
| NFR-003 | Worker startup time | < 5 seconds |
| NFR-004 | Queue stats query time | < 100ms |
| NFR-005 | Progress update latency | < 200ms |
| NFR-006 | Graceful shutdown time | < 60 seconds |

### 6.2 Scalability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-010 | Concurrent workers per queue | Up to 10 |
| NFR-011 | Total jobs per queue | Up to 1M pending |
| NFR-012 | Job throughput per worker | >= 100/minute |
| NFR-013 | Horizontal scaling | Linear with worker count |
| NFR-014 | Redis memory per queue | < 1GB |

### 6.3 Reliability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-020 | Job persistence | Survive worker restart |
| NFR-021 | At-least-once delivery | 100% of jobs |
| NFR-022 | Job deduplication | By jobId when specified |
| NFR-023 | Worker recovery time | < 30 seconds |
| NFR-024 | Redis failover support | Via Upstash or Sentinel |

### 6.4 Security Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-030 | Redis connection encryption | TLS for production |
| NFR-031 | Redis authentication | Username/password required |
| NFR-032 | Job data isolation | Per-user access control |
| NFR-033 | Sensitive data handling | No PII in logs |
| NFR-034 | Token refresh security | Encrypted storage |

### 6.5 Observability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-040 | Structured logging | JSON format for production |
| NFR-041 | Job lifecycle logging | Start, progress, complete, fail |
| NFR-042 | Error logging | Full stack traces |
| NFR-043 | Metrics export | Prometheus-compatible |
| NFR-044 | Distributed tracing | Job ID correlation |

---

## 7. Technical Architecture

### 7.1 System Architecture Diagram

```
+------------------+     +------------------+     +------------------+
|   API Server     |     |   Redis Queue    |     |   Worker Pool    |
|  (Express/tRPC)  |---->|    (BullMQ)      |<----|   (BullMQ)       |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|  Job Producers   |     |  Queue Types:    |     |  Job Processors  |
|  - Email Sync    |     |  - email         |     |  - emailWorker   |
|  - Voice Call    |     |  - voice         |     |  - voiceWorker   |
|  - Enrichment    |     |  - seo           |     |  - enrichWorker  |
|  - Workflow      |     |  - ads           |     |  - workflowWorker|
+------------------+     |  - enrichment    |     |  - memoryWorker  |
                         |  - workflow      |     +------------------+
                         +------------------+              |
                                                          v
                                            +------------------+
                                            |  External APIs   |
                                            |  - Gmail/Outlook |
                                            |  - Vapi          |
                                            |  - Appify        |
                                            |  - Browserbase   |
                                            +------------------+
```

### 7.2 Queue Configuration

```typescript
// Queue definitions with type-safe configuration
const queueConfigs = {
  email: {
    name: 'email',
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 24 * 3600, count: 1000 },
      removeOnFail: { age: 7 * 24 * 3600 }
    }
  },
  voice: {
    name: 'voice',
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { age: 24 * 3600, count: 1000 },
      removeOnFail: { age: 7 * 24 * 3600 }
    }
  },
  enrichment: {
    name: 'enrichment',
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { age: 24 * 3600, count: 1000 },
      removeOnFail: { age: 7 * 24 * 3600 }
    }
  },
  workflow: {
    name: 'workflow',
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 24 * 3600, count: 1000 },
      removeOnFail: { age: 7 * 24 * 3600 }
    }
  }
};
```

### 7.3 Worker Architecture

```typescript
// Worker initialization pattern
export function createEmailWorker() {
  const worker = new Worker(
    'email',
    async (job) => {
      switch (job.name) {
        case JobType.EMAIL_SYNC:
          return await processEmailSync(job);
        case JobType.EMAIL_DRAFT:
          return await processEmailDraft(job);
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
      limiter: { max: 10, duration: 1000 }
    }
  );
  return worker;
}
```

### 7.4 Job Data Flow

```
1. Producer calls addJob() or helper function
2. Job serialized and pushed to Redis queue
3. Worker picks up job (FIFO or by priority)
4. Worker processor executes job logic
5. Job updates progress via job.updateProgress()
6. On success: result stored, job moved to completed
7. On failure: retry scheduled or moved to failed
8. Queue events fire for monitoring/SSE
```

### 7.5 Error Handling Strategy

```typescript
// Retry with exponential backoff
// Attempt 1: immediate
// Attempt 2: 2s * 2^1 = 4s delay
// Attempt 3: 2s * 2^2 = 8s delay

// Error categorization
const retryableErrors = [
  'ECONNRESET',
  'ETIMEDOUT',
  'Rate limit exceeded',
  'Service temporarily unavailable'
];

const permanentErrors = [
  'Authentication failed',
  'Resource not found',
  'Invalid configuration'
];
```

### 7.6 Database Integration

```typescript
// Email sync history tracking
await db.insert(emailSyncHistory).values({
  userId: parseInt(userId),
  connectionId: conn.id,
  jobId: job.id,
  status: 'running',
  startedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

// Voice call campaign statistics
await db.update(ai_call_campaigns).set({
  callsMade: sql`${ai_call_campaigns.callsMade} + 1`,
  callsSuccessful: sql`${ai_call_campaigns.callsSuccessful} + 1`,
  totalDuration: sql`${ai_call_campaigns.totalDuration} + ${duration}`,
  updatedAt: new Date()
}).where(eq(ai_call_campaigns.id, campaignId));
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Purpose | Required |
|------------|---------|----------|
| `server/db.ts` | Database connection for job data | Yes |
| `server/services/email.service.ts` | Email API integration | For email jobs |
| `server/services/vapi.service.ts` | Vapi voice call integration | For voice jobs |
| `server/services/appify.service.ts` | Lead enrichment API | For enrichment jobs |
| `server/services/workflowExecution.service.ts` | Workflow execution | For workflow jobs |
| `server/services/memory/` | Memory management | For cleanup jobs |
| `server/services/webhook.service.ts` | Webhook delivery | For retry jobs |
| `drizzle/schema.ts` | Database schema definitions | Yes |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `bullmq` | ^5.66.0 | Job queue management |
| `ioredis` | ^5.8.2 | Redis client |
| Redis (service) | 6.x+ | Message broker |
| Upstash Redis (optional) | - | Managed Redis for production |
| Gmail API | v1 | Email synchronization |
| Microsoft Graph API | v1 | Outlook synchronization |
| Vapi API | v1 | Voice call orchestration |
| Appify API | v1 | Lead enrichment |
| Browserbase | v2 | Browser automation |

### 8.3 Environment Variables

```bash
# Redis Configuration
REDIS_URL=rediss://default:password@host:6379

# Alternative individual variables
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret
REDIS_USERNAME=default
REDIS_TLS=true

# Worker Configuration
START_WORKERS=true  # Enable workers in dev mode
NODE_ENV=production
```

---

## 9. Out of Scope

### 9.1 Not Included in Initial Release

| Item | Reason |
|------|--------|
| Web-based queue monitoring UI | Use Bull Board or similar external tool |
| Multi-region queue distribution | Single-region deployment initially |
| Job result caching | Results stored in database per job type |
| Custom retry strategies per job | Use queue-level defaults |
| Job scheduling (cron) integration | Separate scheduled tasks system |
| Real-time WebSocket job updates | SSE-based updates preferred |

### 9.2 Future Considerations

- **Dead Letter Queue (DLQ)**: Separate queue for permanently failed jobs
- **Job Prioritization UI**: User-facing priority controls
- **Job Dependencies**: DAG-based job orchestration
- **Multi-tenant Queue Isolation**: Separate queues per tenant
- **Job Templates**: Reusable job configurations
- **Batch Job Operations**: Bulk retry, cancel, delete

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Redis unavailable | Low | Critical | Upstash with automatic failover; graceful degradation |
| Worker process crash | Medium | High | Process manager (PM2); auto-restart; job persistence |
| Job queue overflow | Low | High | Rate limiting; queue depth monitoring; alerts |
| Memory leak in worker | Medium | Medium | Regular restarts; memory monitoring; leak detection |
| Long-running job timeout | Medium | Medium | Configurable timeouts; job segmentation |

### 10.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Deployment causes job loss | Low | High | Graceful shutdown; rolling deployments |
| External API rate limits | High | Medium | Per-queue rate limiting; backoff |
| Database connection exhaustion | Medium | High | Connection pooling; query optimization |
| Duplicate job execution | Low | Medium | Job ID deduplication; idempotent processors |
| Monitoring blind spots | Medium | Medium | Comprehensive logging; metrics export |

### 10.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Email sync delays impact UX | Medium | Medium | Priority queue for manual triggers |
| Voice call failures affect campaigns | Low | High | 2-attempt retry; detailed failure logging |
| Enrichment costs exceed budget | Low | Medium | Batch processing; rate limiting |
| Webhook delivery SLA breach | Medium | Medium | Retry with exponential backoff |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Infrastructure (Completed)

**Duration:** 2 weeks

| Milestone | Deliverables | Status |
|-----------|--------------|--------|
| M1.1 | BullMQ queue configuration | Complete |
| M1.2 | Redis connection management | Complete |
| M1.3 | Worker entry point and lifecycle | Complete |
| M1.4 | Graceful shutdown handling | Complete |
| M1.5 | Queue statistics API | Complete |

### 11.2 Phase 2: Email Processing (Completed)

**Duration:** 2 weeks

| Milestone | Deliverables | Status |
|-----------|--------------|--------|
| M2.1 | Email sync job processor | Complete |
| M2.2 | Token refresh handling | Complete |
| M2.3 | AI draft generation processor | Complete |
| M2.4 | Sync history tracking | Complete |
| M2.5 | Auto-draft for high-importance emails | Complete |

### 11.3 Phase 3: Voice & Enrichment (Completed)

**Duration:** 2 weeks

| Milestone | Deliverables | Status |
|-----------|--------------|--------|
| M3.1 | Voice call job processor | Complete |
| M3.2 | Call status polling and updates | Complete |
| M3.3 | Campaign statistics integration | Complete |
| M3.4 | Lead enrichment batch processor | Complete |
| M3.5 | Rate limiting and progress tracking | Complete |

### 11.4 Phase 4: Workflow & Maintenance (Completed)

**Duration:** 2 weeks

| Milestone | Deliverables | Status |
|-----------|--------------|--------|
| M4.1 | Workflow execution processor | Complete |
| M4.2 | Browser session management | Complete |
| M4.3 | Memory cleanup worker | Complete |
| M4.4 | Webhook retry worker | Complete |
| M4.5 | Error handling and logging | Complete |

### 11.5 Phase 5: Enhancement (Planned)

**Duration:** 3 weeks

| Milestone | Deliverables | Status |
|-----------|--------------|--------|
| M5.1 | SEO audit job processor | Planned |
| M5.2 | Ad analysis job processor | Planned |
| M5.3 | Job dashboard integration | Planned |
| M5.4 | Metrics and alerting | Planned |
| M5.5 | Performance optimization | Planned |

---

## 12. Acceptance Criteria

### 12.1 Functional Acceptance

#### AC-001: Queue Configuration
- [ ] All 6 queues (email, voice, seo, ads, enrichment, workflow) are created
- [ ] Redis connection parses from `REDIS_URL` or individual env vars
- [ ] TLS connections work with `rediss://` protocol
- [ ] Queues gracefully handle Redis unavailability
- [ ] Queue statistics API returns accurate counts

#### AC-002: Email Jobs
- [ ] EMAIL_SYNC jobs sync emails from Gmail and Outlook
- [ ] Token refresh occurs automatically when expired
- [ ] Progress updates at 5%, 10%, 20%, 40%, 95%, 100%
- [ ] Sync history is recorded with job ID reference
- [ ] EMAIL_DRAFT jobs generate AI responses with context
- [ ] High-importance emails auto-generate drafts

#### AC-003: Voice Jobs
- [ ] VOICE_CALL jobs initiate calls via Vapi
- [ ] Call status polling runs until completion or timeout (10 min)
- [ ] Call outcomes (completed, failed, no_answer) are tracked
- [ ] Transcripts and recordings are stored
- [ ] Campaign statistics update after each call

#### AC-004: Enrichment Jobs
- [ ] LEAD_ENRICHMENT jobs process leads in batches
- [ ] Rate limiting prevents API throttling
- [ ] Individual failures don't fail entire batch
- [ ] Progress updates reflect batch completion
- [ ] Final summary includes success/failure counts

#### AC-005: Workflow Jobs
- [ ] WORKFLOW_EXECUTION jobs execute browser workflows
- [ ] Step results are tracked individually
- [ ] Execution ID is returned for history lookup
- [ ] Browser sessions are properly cleaned up
- [ ] Concurrency respects resource limits

#### AC-006: Maintenance Jobs
- [ ] Memory cleanup runs on schedule
- [ ] Expired entries are removed
- [ ] Low-performance patterns are consolidated
- [ ] Webhook retry processes failed webhooks
- [ ] Exponential backoff is applied to retries

### 12.2 Reliability Acceptance

#### AC-010: Retry Behavior
- [ ] Failed jobs retry with configured attempts
- [ ] Exponential backoff delays increase correctly
- [ ] Permanently failed jobs are marked appropriately
- [ ] Retry history is preserved for debugging

#### AC-011: Graceful Shutdown
- [ ] SIGTERM triggers graceful shutdown
- [ ] SIGINT triggers graceful shutdown
- [ ] Active jobs complete before exit
- [ ] Workers close within 60 seconds
- [ ] Queue connections close cleanly

#### AC-012: Error Handling
- [ ] Uncaught exceptions trigger shutdown
- [ ] Unhandled rejections trigger shutdown
- [ ] Errors are logged with full context
- [ ] Database updates reflect failure state

### 12.3 Performance Acceptance

#### AC-020: Throughput
- [ ] Email worker processes 100+ jobs/minute
- [ ] Voice worker handles 3 concurrent calls
- [ ] Enrichment worker respects API rate limits
- [ ] Workflow worker manages 3 concurrent browser sessions

#### AC-021: Latency
- [ ] Job enqueue completes in < 50ms
- [ ] Job processing starts within < 5s of enqueue
- [ ] Progress updates reflect within < 200ms
- [ ] Queue stats query completes in < 100ms

### 12.4 Operations Acceptance

#### AC-030: Monitoring
- [ ] All workers log job lifecycle events
- [ ] Queue depths are queryable via API
- [ ] Failed jobs are identifiable and debuggable
- [ ] Worker status is visible in logs

#### AC-031: Deployment
- [ ] Workers can be deployed separately from API
- [ ] Rolling deployments preserve job integrity
- [ ] Environment configuration is straightforward
- [ ] Worker scaling is horizontal

---

## Appendix A: Job Type Reference

### A.1 JobType Enum

```typescript
export enum JobType {
  EMAIL_SYNC = 'email_sync',
  EMAIL_DRAFT = 'email_draft',
  VOICE_CALL = 'voice_call',
  SEO_AUDIT = 'seo_audit',
  KEYWORD_ANALYSIS = 'keyword_analysis',
  AD_ANALYSIS = 'ad_analysis',
  AD_AUTOMATION = 'ad_automation',
  LEAD_ENRICHMENT = 'lead_enrichment',
  WORKFLOW_EXECUTION = 'workflow_execution'
}
```

### A.2 Job Data Interfaces

```typescript
interface EmailSyncJobData {
  userId: string;
  accountId: string;
  emailProvider: 'gmail' | 'outlook';
  syncSince?: Date;
}

interface EmailDraftJobData {
  userId: string;
  threadId: string;
  context: string;
  tone?: 'professional' | 'casual' | 'friendly';
}

interface VoiceCallJobData {
  userId: string;
  callId: string;
  phoneNumber: string;
  assistantId?: string;
  metadata?: Record<string, any>;
}

interface LeadEnrichmentJobData {
  userId: string;
  leads: Array<{
    id: string;
    email?: string;
    phone?: string;
    company?: string;
  }>;
  batchSize?: number;
}

interface WorkflowExecutionJobData {
  userId: string;
  workflowId: string;
  triggerId?: string;
  context?: Record<string, any>;
}

interface MemoryCleanupJobData {
  type: 'memory_cleanup';
  options?: {
    cleanupExpired?: boolean;
    cleanupLowPerformance?: boolean;
    minSuccessRate?: number;
    minUsageCount?: number;
  };
}

interface MemoryConsolidationJobData {
  type: 'memory_consolidation';
  options?: {
    sessionId?: string;
    agentId?: string;
    threshold?: number;
  };
}
```

---

## Appendix B: API Reference

### B.1 Job Submission Functions

```typescript
// Generic job submission
async function addJob<T extends JobData>(
  queueName: 'email' | 'voice' | 'seo' | 'ads' | 'enrichment' | 'workflow',
  jobType: JobType,
  data: T,
  options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
    jobId?: string;
  }
): Promise<Job | null>

// Typed helper functions
async function addEmailSyncJob(data: EmailSyncJobData, options?): Promise<Job | null>
async function addEmailDraftJob(data: EmailDraftJobData, options?): Promise<Job | null>
async function addVoiceCallJob(data: VoiceCallJobData, options?): Promise<Job | null>
async function addLeadEnrichmentJob(data: LeadEnrichmentJobData, options?): Promise<Job | null>
async function addWorkflowExecutionJob(data: WorkflowExecutionJobData, options?): Promise<Job | null>
```

### B.2 Queue Statistics Functions

```typescript
// Single queue stats
async function getQueueStats(
  queueName: 'email' | 'voice' | 'seo' | 'ads' | 'enrichment' | 'workflow'
): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  available: boolean;
}>

// All queue stats
async function getAllQueueStats(): Promise<{
  email: QueueStats;
  voice: QueueStats;
  seo: QueueStats;
  ads: QueueStats;
  enrichment: QueueStats;
  workflow: QueueStats;
}>
```

### B.3 Lifecycle Functions

```typescript
async function shutdownQueues(): Promise<void>
async function shutdownQueueEvents(): Promise<void>
```

---

## Appendix C: Deployment Guide

### C.1 Worker Deployment

```bash
# Development with workers
npm run dev:workers

# Production worker process
NODE_ENV=production tsx server/workers/index.ts

# Alternative: npm script
npm run workers
```

### C.2 Docker Deployment

```dockerfile
# Worker Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

CMD ["node", "dist/workers/index.js"]
```

### C.3 Process Manager (PM2)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'bottleneck-workers',
      script: 'dist/workers/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M'
    }
  ]
};
```

---

## Appendix D: Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-11 | Initial PRD creation |

---

*Generated: January 11, 2026*
*Document Owner: Development Team*
*Next Review: February 2026*
