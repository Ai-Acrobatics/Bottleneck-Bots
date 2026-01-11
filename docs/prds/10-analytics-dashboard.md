# PRD-010: Analytics Dashboard

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/analytics.ts`, `client/src/pages/dashboard/analytics.tsx`

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

The Analytics Dashboard feature provides comprehensive real-time execution statistics, performance metrics, cost analysis, and usage insights for Bottleneck-Bots users. This feature enables users to monitor their automation workflows, track success and failure rates, analyze costs, and identify performance bottlenecks across all scheduled browser tasks.

### 1.1 Feature Summary

- **Real-Time Execution Statistics**: Live monitoring of task executions with success/failure rates, durations, and status breakdowns
- **Performance Metrics**: Detailed task-level performance tracking with duration analysis (average, median, min, max)
- **Usage Statistics**: Executions per time period with configurable grouping (hourly, daily, weekly, monthly)
- **Cost Analysis**: Browser session cost tracking with duration-based billing calculations
- **Performance Trends**: Time-series visualization of key metrics over customizable periods
- **WebSocket Statistics**: Real-time connection monitoring and health status
- **Cache Statistics**: Performance and health metrics for the caching layer
- **Intelligent Caching**: 5-minute TTL caching for frequently accessed analytics data

### 1.2 Target Users

- **Agency Owners**: High-level overview of automation ROI and cost efficiency
- **Operations Managers**: Monitor team productivity and identify optimization opportunities
- **Automation Engineers**: Debug failed tasks and optimize workflow performance
- **Finance Teams**: Track and forecast automation costs
- **DevOps Engineers**: Monitor system health and identify infrastructure issues

### 1.3 Key Capabilities

| Capability | Description |
|------------|-------------|
| Execution Overview | Aggregate statistics across all tasks with success rates |
| Task Deep-Dive | Individual task performance analysis with execution history |
| Usage Trending | Time-series analysis of execution volumes and patterns |
| Cost Forecasting | Projected costs based on historical usage patterns |
| Real-Time Updates | Live dashboard updates via SSE/WebSocket integration |
| Export & Reporting | Downloadable analytics reports in various formats |

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Lack of Visibility**: Users cannot see how their automation tasks are performing across the system
2. **Reactive Troubleshooting**: Without metrics, users only discover problems when tasks fail
3. **Cost Blindspots**: No visibility into browser session costs or API usage leading to unexpected bills
4. **Optimization Difficulty**: Without performance data, users cannot identify which tasks need optimization
5. **Manual Tracking**: Users resort to spreadsheets or manual logs to track automation performance
6. **No Historical Context**: When investigating issues, there's no historical data for comparison

### 2.2 User Pain Points

| User Type | Pain Point |
|-----------|------------|
| Agency Owner | "I have no idea if my automation investment is paying off" |
| Operations Manager | "I can't tell which automations are causing the most failures" |
| Automation Engineer | "When a task fails, I have to guess what went wrong" |
| Finance Team | "I get surprised by monthly costs with no way to predict or budget" |
| DevOps | "I can't proactively identify performance degradation" |

### 2.3 Business Impact

| Problem | Impact | Estimated Cost |
|---------|--------|----------------|
| Undetected failures | Lost productivity, delayed actions | 20+ hours/month wasted |
| Cost overruns | Unexpected charges, budget issues | 30% budget variance |
| Performance degradation | Slow automation, missed SLAs | Customer churn risk |
| Manual tracking | Admin overhead, human error | 10+ hours/week |
| No forecasting | Unable to plan capacity/budget | Planning delays |

### 2.4 Competitive Analysis

| Competitor | Analytics Features | Gap Analysis |
|------------|-------------------|--------------|
| Zapier | Basic task history, limited metrics | No real-time, limited cost tracking |
| Make.com | Execution logs, simple charts | No performance trending |
| UiPath | Comprehensive enterprise analytics | Overkill for SMB, expensive |
| n8n | Open-source, minimal built-in | No analytics dashboard |

**Opportunity**: Provide enterprise-grade analytics with SMB-friendly simplicity.

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Description | Priority | Success Criteria |
|---------|-------------|----------|------------------|
| **G1** | Provide real-time visibility into all task executions | P0 | Dashboard loads within 2 seconds |
| **G2** | Enable cost tracking and forecasting | P0 | <5% variance in cost predictions |
| **G3** | Surface performance optimization opportunities | P1 | Identify 80% of slow tasks automatically |
| **G4** | Reduce time to diagnose failures | P1 | Reduce MTTR by 50% |
| **G5** | Support data-driven capacity planning | P2 | 90% accurate usage forecasts |

### 3.2 Success Metrics (KPIs)

#### Dashboard Engagement Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Daily Active Users (DAU) on Analytics | >= 60% of total users | Unique analytics page views / Total users |
| Average Session Duration | >= 3 minutes | Time on analytics pages |
| Dashboard Load Time | < 2 seconds (P95) | Performance monitoring |
| Feature Adoption Rate | >= 70% | Users accessing analytics within 7 days |

#### Operational Improvement Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Mean Time to Detection (MTTD) | < 5 minutes | Time from failure to alert |
| Mean Time to Resolution (MTTR) | 50% reduction | Issue creation to resolution |
| Cost Forecast Accuracy | >= 95% | Predicted vs actual monthly costs |
| Performance Issue Detection | >= 80% auto-detected | Tasks flagged as slow / Total slow tasks |

#### Technical Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API Response Time (P95) | < 500ms | Server-side latency monitoring |
| Cache Hit Rate | >= 80% | Cache hits / Total requests |
| Data Freshness | < 30 seconds | Time lag for real-time data |
| Query Performance | < 200ms (P95) | Database query duration |

#### Business Impact Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Cost Savings Identified | >= $100/month per agency | User-reported savings |
| Support Ticket Reduction | 30% decrease | Analytics-related tickets |
| User Satisfaction (CSAT) | >= 4.5/5 | In-app surveys |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: View Execution Overview

**As an** agency owner
**I want to** see a summary of all task executions at a glance
**So that** I can quickly assess the health of my automation workflows

**Acceptance Criteria:**
- Dashboard shows total executions for selected time period
- Success/failure/timeout counts are displayed prominently
- Success rate percentage is calculated and shown
- Average execution duration is displayed
- Data refreshes automatically or on demand

#### US-002: Analyze Task Performance

**As an** automation engineer
**I want to** drill down into individual task performance metrics
**So that** I can identify which tasks need optimization

**Acceptance Criteria:**
- Task selection dropdown or search functionality
- Execution history shows last 100 executions
- Duration metrics include average, median, min, max
- Current status shows: isActive, lastRun, lastRunStatus, nextRun
- Consecutive failure count is visible for error-prone tasks

#### US-003: View Usage Trends

**As an** operations manager
**I want to** see execution volumes over time
**So that** I can plan capacity and identify usage patterns

**Acceptance Criteria:**
- Time period selector: day, week, month, quarter, year, all
- Group by selector: hour, day, week, month
- Line chart visualization of execution counts over time
- Success vs failure breakdown per time period
- Total and average duration per period

#### US-004: Track Browser Session Costs

**As a** finance manager
**I want to** understand browser session costs
**So that** I can budget accurately for automation expenses

**Acceptance Criteria:**
- Total cost for selected time period in USD
- Cost per execution calculation
- Cost breakdown by session time vs base session cost
- Estimated vs actual cost comparison
- Cost trending over time

#### US-005: Monitor Performance Trends

**As a** DevOps engineer
**I want to** see performance trends over time
**So that** I can proactively identify degradation

**Acceptance Criteria:**
- Daily performance data points
- Metrics include: duration, success_rate, execution_count
- Visual indicators for performance anomalies
- Ability to filter by specific task or all tasks
- Comparison to historical baseline

### 4.2 Advanced User Stories

#### US-006: Real-Time Execution Monitoring

**As an** operations manager
**I want to** see live execution status
**So that** I can respond immediately to issues

**Acceptance Criteria:**
- Running tasks count updated in real-time
- SSE events trigger dashboard updates
- New executions appear without page refresh
- Status transitions (running -> success/failed) are animated
- Timestamp of last update is visible

#### US-007: Cache Performance Monitoring

**As a** DevOps engineer
**I want to** monitor cache health and performance
**So that** I can ensure optimal system performance

**Acceptance Criteria:**
- Cache availability status (healthy/unhealthy)
- Response latency metrics
- Reconnection attempt count
- Health check results displayed
- Alert when cache is unavailable

#### US-008: WebSocket Connection Status

**As a** developer
**I want to** see WebSocket connection statistics
**So that** I can ensure real-time features are working

**Acceptance Criteria:**
- Total connection count visible
- Active connection count displayed
- User-specific connection status
- Connection health indicator
- Room/channel statistics if applicable

#### US-009: Period Comparison Analytics

**As an** agency owner
**I want to** compare current period performance to previous periods
**So that** I can track improvement or degradation

**Acceptance Criteria:**
- Side-by-side period comparison
- Percentage change calculations
- Improvement/decline indicators (arrows, colors)
- Configurable comparison periods
- Export comparison reports

#### US-010: Task Failure Analysis

**As an** automation engineer
**I want to** analyze failure patterns
**So that** I can address root causes

**Acceptance Criteria:**
- Failure breakdown by error type
- Most common failure reasons listed
- Failed task execution details accessible
- Error message text searchable
- Timeline of failure occurrences

### 4.3 Administrative User Stories

#### US-011: Export Analytics Data

**As an** agency owner
**I want to** export analytics data
**So that** I can create custom reports or share with stakeholders

**Acceptance Criteria:**
- Export to CSV format
- Export to PDF format
- Date range selection for export
- Metric selection for export
- Scheduled automated exports (future)

#### US-012: Configure Dashboard Preferences

**As a** user
**I want to** customize my analytics dashboard
**So that** I see the metrics most relevant to my role

**Acceptance Criteria:**
- Default time period preference
- Widget arrangement customization
- Favorite metrics pinning
- Dashboard theme (light/dark)
- Default refresh interval

---

## 5. Functional Requirements

### 5.1 Execution Statistics

#### FR-001: Get Execution Stats

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Accept time period parameter: day, week, month, quarter, year, all | P0 |
| FR-001.2 | Support optional taskId filter for task-specific stats | P0 |
| FR-001.3 | Return total execution count for period | P0 |
| FR-001.4 | Return success, failed, timeout, running counts | P0 |
| FR-001.5 | Calculate and return success rate percentage (1 decimal precision) | P0 |
| FR-001.6 | Calculate and return failure rate percentage | P0 |
| FR-001.7 | Compute weighted average duration across all statuses | P0 |
| FR-001.8 | Return formatted duration (e.g., "45s") | P1 |
| FR-001.9 | Include date range (start, end) in response | P0 |
| FR-001.10 | Cache results with 5-minute TTL | P0 |
| FR-001.11 | Include fromCache boolean to indicate cache hit | P1 |

#### FR-002: Task-Specific Metrics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Verify task ownership before returning data | P0 |
| FR-002.2 | Return execution stats: total, success, failed, successRate | P0 |
| FR-002.3 | Return duration stats: average, median, min, max | P0 |
| FR-002.4 | Return current status: isActive, status, lastRun, lastRunStatus, nextRun | P0 |
| FR-002.5 | Return isRunning status from cron registry | P0 |
| FR-002.6 | Return consecutiveFailures count | P0 |
| FR-002.7 | Return last 10 executions with full details | P0 |
| FR-002.8 | Include progress (stepsCompleted/stepsTotal) for each execution | P1 |
| FR-002.9 | Support period filtering (day, week, month, quarter, year, all) | P0 |
| FR-002.10 | Cache results with 5-minute TTL | P0 |

### 5.2 Usage Statistics

#### FR-003: Usage Statistics by Period

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Accept period parameter: day, week, month, quarter, year, all | P0 |
| FR-003.2 | Accept groupBy parameter: hour, day, week, month | P0 |
| FR-003.3 | Use DATE_TRUNC for time period grouping | P0 |
| FR-003.4 | Return array of data points with totalExecutions per period | P0 |
| FR-003.5 | Return successCount and failedCount per period | P0 |
| FR-003.6 | Return average duration per period | P0 |
| FR-003.7 | Return summary totals: totalExecutions, totalSuccess, totalFailed | P0 |
| FR-003.8 | Order results chronologically | P0 |
| FR-003.9 | Cache results with 5-minute TTL | P0 |

### 5.3 Cost Analysis

#### FR-004: Browser Session Cost Analysis

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Accept period parameter for date range filtering | P0 |
| FR-004.2 | Calculate total execution count for period | P0 |
| FR-004.3 | Calculate total duration in milliseconds | P0 |
| FR-004.4 | Convert duration to minutes for cost calculation | P0 |
| FR-004.5 | Use configurable cost-per-minute rate ($0.005 placeholder) | P0 |
| FR-004.6 | Use configurable minimum cost per session ($0.01 placeholder) | P0 |
| FR-004.7 | Return estimated total cost in USD | P0 |
| FR-004.8 | Return cost per execution calculation | P0 |
| FR-004.9 | Return cost breakdown: sessionCosts, durationCosts | P0 |
| FR-004.10 | Include notes array explaining cost estimation methodology | P1 |
| FR-004.11 | Only count successful executions for cost calculations | P0 |
| FR-004.12 | Cache results with 5-minute TTL | P0 |

### 5.4 Performance Trends

#### FR-005: Performance Trend Analysis

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Accept optional taskId filter | P0 |
| FR-005.2 | Accept period parameter: day, week, month, quarter, year, all | P0 |
| FR-005.3 | Accept metrics array: duration, success_rate, execution_count | P1 |
| FR-005.4 | Return daily data points within selected period | P0 |
| FR-005.5 | Return executionCount per day | P0 |
| FR-005.6 | Return successCount and successRate per day | P0 |
| FR-005.7 | Return avgDuration, minDuration, maxDuration per day | P0 |
| FR-005.8 | Order results chronologically by date | P0 |
| FR-005.9 | Cache results with 5-minute TTL | P0 |

### 5.5 System Statistics

#### FR-006: WebSocket Statistics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Return isEnabled boolean | P0 |
| FR-006.2 | Return total connection count | P0 |
| FR-006.3 | Return active connection count | P0 |
| FR-006.4 | Return user-specific connection count | P1 |
| FR-006.5 | Return room/channel statistics | P2 |

#### FR-007: Cache Statistics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Return cache availability status | P0 |
| FR-007.2 | Return reconnect attempt count | P0 |
| FR-007.3 | Return cache health check result | P0 |
| FR-007.4 | Return latency metrics | P1 |
| FR-007.5 | Return error message if unhealthy | P0 |

### 5.6 Data Filtering and Query

#### FR-008: Date Range Calculation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | day: Current date minus 1 day | P0 |
| FR-008.2 | week: Current date minus 7 days | P0 |
| FR-008.3 | month: Current date minus 1 month | P0 |
| FR-008.4 | quarter: Current date minus 3 months | P0 |
| FR-008.5 | year: Current date minus 1 year | P0 |
| FR-008.6 | all: From January 1, 2020 to current date | P0 |

#### FR-009: Data Access Control

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | All endpoints require authentication (protectedProcedure) | P0 |
| FR-009.2 | Filter data by ctx.user.id | P0 |
| FR-009.3 | Verify task ownership before returning task-specific data | P0 |
| FR-009.4 | Return "Task not found or unauthorized" for invalid task access | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Dashboard initial load time | < 2 seconds | P0 |
| NFR-002 | API response time (P95) | < 500ms | P0 |
| NFR-003 | Database query time (P95) | < 200ms | P0 |
| NFR-004 | Cache hit response time | < 50ms | P0 |
| NFR-005 | Real-time update latency | < 1 second | P1 |
| NFR-006 | Chart rendering time | < 500ms | P1 |
| NFR-007 | Maximum data points per chart | 365 days | P1 |
| NFR-008 | Concurrent dashboard users | 500+ | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-009 | Handle execution history growth | 10M+ records | P0 |
| NFR-010 | Support multiple time zones | Global | P1 |
| NFR-011 | Horizontal scaling capability | Auto-scale | P1 |
| NFR-012 | Database connection pooling | 50 per instance | P0 |
| NFR-013 | Cache cluster support | Multi-node | P2 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-014 | Analytics service availability | 99.9% | P0 |
| NFR-015 | Data accuracy | 100% | P0 |
| NFR-016 | Cache failure fallback | Graceful degradation | P0 |
| NFR-017 | Database failure handling | Query retry (3x) | P0 |
| NFR-018 | Data retention | 1 year minimum | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-019 | All endpoints require authentication | P0 |
| NFR-020 | User data isolation (multi-tenant) | P0 |
| NFR-021 | SQL injection prevention (parameterized queries) | P0 |
| NFR-022 | Rate limiting (100 requests/minute/user) | P0 |
| NFR-023 | Audit logging for data access | P1 |
| NFR-024 | Cache key isolation by user ID | P0 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-025 | Structured logging for all analytics queries | P0 |
| NFR-026 | Performance metrics collection | P0 |
| NFR-027 | Error tracking with request context | P0 |
| NFR-028 | Cache hit/miss metrics | P1 |
| NFR-029 | Query performance histograms | P1 |

### 6.6 Accessibility Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-030 | WCAG 2.1 AA compliance | P1 |
| NFR-031 | Keyboard navigation support | P1 |
| NFR-032 | Screen reader compatibility | P1 |
| NFR-033 | Color contrast ratios (4.5:1 minimum) | P1 |
| NFR-034 | Chart data available as tables | P2 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Analytics Dashboard Client                          │
│  (React/Next.js with TanStack Query + Recharts/Chart.js)                     │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ tRPC / HTTP
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Analytics API Layer                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                      analyticsRouter (tRPC)                             │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────────┐   │  │
│  │  │getExecution │ │getTaskMetrics│ │getUsageStats│ │getCostAnalysis │   │  │
│  │  │   Stats     │ │             │ │             │ │                │   │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────────┘   │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │  │
│  │  │getPerformance   │ │getWebSocketStats│ │getCacheStats            │  │  │
│  │  │   Trends        │ │                 │ │                         │  │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│   Cache Layer     │      │     Database      │      │ WebSocket Service │
│   (Redis/Memory)  │      │   (PostgreSQL)    │      │                   │
│                   │      │                   │      │ - Connection stats│
│ - 5 min TTL       │      │ - scheduledBrowser│      │ - Health status   │
│ - User-scoped keys│      │   Tasks           │      │                   │
│ - Cache service   │      │ - scheduledTask   │      │                   │
│                   │      │   Executions      │      │                   │
│                   │      │ - cronJobRegistry │      │                   │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

### 7.2 Component Details

#### 7.2.1 Analytics Router (`analytics.ts`)

Primary API interface for analytics data.

**Key Components:**

| Endpoint | Purpose | Cache Key Pattern |
|----------|---------|-------------------|
| `getExecutionStats` | Aggregate execution statistics | `exec_stats_{period}_{taskId}_{userId}` |
| `getTaskMetrics` | Task-specific performance metrics | `task_metrics_{taskId}_{period}` |
| `getUsageStats` | Time-series usage data | `usage_stats_{period}_{groupBy}_{userId}` |
| `getCostAnalysis` | Browser session cost breakdown | `cost_analysis_{period}_{userId}` |
| `getPerformanceTrends` | Performance trend time series | `perf_trends_{taskId}_{period}_{userId}` |
| `getWebSocketStats` | Real-time connection statistics | N/A (no cache) |
| `getCacheStats` | Cache health and performance | N/A (no cache) |

**Input Validation (Zod Schemas):**

```typescript
// Time period validation
const TimePeriod = z.enum(["day", "week", "month", "quarter", "year", "all"]);

// Execution stats input
const ExecutionStatsInput = z.object({
  period: TimePeriod.default("week"),
  taskId: z.number().optional(),
});

// Task metrics input
const TaskMetricsInput = z.object({
  taskId: z.number(),
  period: TimePeriod.default("week"),
});

// Usage stats input
const UsageStatsInput = z.object({
  period: TimePeriod.default("month"),
  groupBy: z.enum(["hour", "day", "week", "month"]).default("day"),
});

// Performance trends input
const PerformanceTrendsInput = z.object({
  taskId: z.number().optional(),
  period: TimePeriod.default("month"),
  metrics: z.array(z.enum(["duration", "success_rate", "execution_count"]))
    .default(["duration", "success_rate", "execution_count"]),
});
```

#### 7.2.2 Cache Layer

**Caching Strategy:**

| Cache Key | TTL | Invalidation Trigger |
|-----------|-----|---------------------|
| Execution stats | 5 min | New execution completion |
| Task metrics | 5 min | Task execution or config change |
| Usage stats | 5 min | Time-based expiration |
| Cost analysis | 5 min | Time-based expiration |
| Performance trends | 5 min | Time-based expiration |

**Cache Key Format:**
```
{metric_type}_{period}_{optional_filters}_{userId}
```

**Cache Service Integration:**
```typescript
// Check cache
const cached = await cacheService.get<StatsType>(cacheKey);
if (cached) {
  return { ...cached, fromCache: true };
}

// Compute and cache
const stats = await computeStats();
await cacheService.set(cacheKey, stats, CACHE_TTL.MEDIUM); // 5 min
return { ...stats, fromCache: false };
```

#### 7.2.3 Database Schema

**Tables Used:**

```sql
-- Primary analytics data source
scheduled_browser_tasks:
  - userId (INT, FK) -- User ownership
  - status (VARCHAR) -- active, paused, failed, etc.
  - lastRun (TIMESTAMP)
  - lastRunStatus (VARCHAR)
  - nextRun (TIMESTAMP)
  - executionCount (INT)
  - successCount (INT)
  - failureCount (INT)
  - averageDuration (INT)

scheduled_task_executions:
  - taskId (INT, FK) -- Parent task
  - status (VARCHAR) -- queued, running, success, failed, timeout, cancelled
  - triggerType (VARCHAR) -- scheduled, manual, retry
  - attemptNumber (INT)
  - startedAt (TIMESTAMP)
  - completedAt (TIMESTAMP)
  - duration (INT, ms)
  - error (TEXT)
  - metadata (JSONB) -- stepsCompleted, stepsTotal

cron_job_registry:
  - taskId (INT, FK, UNIQUE)
  - isRunning (BOOLEAN)
  - metadata (JSONB) -- consecutiveFailures
```

#### 7.2.4 Query Patterns

**Execution Statistics Query:**
```sql
SELECT
  status,
  COUNT(*) as count,
  AVG(duration) as avgDuration
FROM scheduled_task_executions
INNER JOIN scheduled_browser_tasks ON taskId = id
WHERE userId = $userId
  AND startedAt >= $startDate
  AND startedAt <= $endDate
GROUP BY status;
```

**Usage Statistics Query:**
```sql
SELECT
  DATE_TRUNC('day', startedAt) as period,
  COUNT(*) as totalExecutions,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successCount,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failedCount,
  AVG(duration) as avgDuration
FROM scheduled_task_executions
INNER JOIN scheduled_browser_tasks ON taskId = id
WHERE userId = $userId
  AND startedAt >= $startDate
  AND startedAt <= $endDate
GROUP BY DATE_TRUNC('day', startedAt)
ORDER BY period;
```

### 7.3 Data Flow

```
1. User requests analytics data
                    ▼
2. tRPC validates input (Zod schema)
                    ▼
3. Check cache for existing data
        ┌───────────┴───────────┐
        ▼ (cache hit)           ▼ (cache miss)
4a. Return cached data    4b. Query database
                                    ▼
                          5. Aggregate results
                                    ▼
                          6. Cache computed data
                                    ▼
                          7. Return fresh data
```

### 7.4 Client Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Analytics Dashboard Page                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Time Period Selector                      │   │
│  │  [Day] [Week] [Month] [Quarter] [Year] [All Time]            │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Total       │ │ Success     │ │ Failed      │ │ Avg         │   │
│  │ Executions  │ │ Rate        │ │ Count       │ │ Duration    │   │
│  │             │ │             │ │             │ │             │   │
│  │   1,234     │ │   94.5%     │ │     68      │ │    45s      │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                  Execution Trend Chart                        │ │
│  │  ▲                                                            │ │
│  │  │     ╭─────╮                ╭───╮                           │ │
│  │  │  ╭──╯     ╰──╮         ╭──╯   ╰───╮                       │ │
│  │  │──╯           ╰─────────╯          ╰───                    │ │
│  │  └──────────────────────────────────────────────────────────▶│ │
│  │    Mon   Tue   Wed   Thu   Fri   Sat   Sun                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐   │
│  │      Cost Breakdown          │ │     Top Tasks by Volume    │   │
│  │                              │ │                            │   │
│  │  Session: $12.50             │ │  1. Daily Report    (245)  │   │
│  │  Duration: $8.75             │ │  2. CRM Sync       (189)   │   │
│  │  ───────────────             │ │  3. Lead Import    (156)   │   │
│  │  Total: $21.25               │ │  4. Email Blast    (98)    │   │
│  └─────────────────────────────┘ └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                   Recent Executions Table                     │ │
│  │ ┌─────┬───────────┬─────────┬──────────┬──────────┬────────┐ │ │
│  │ │Task │ Status    │ Started │ Duration │ Trigger  │Progress│ │ │
│  │ ├─────┼───────────┼─────────┼──────────┼──────────┼────────┤ │ │
│  │ │ ... │ Success ✓ │ 2m ago  │ 32s      │Scheduled │ 5/5    │ │ │
│  │ │ ... │ Failed ✗  │ 5m ago  │ 18s      │ Manual   │ 3/5    │ │ │
│  │ │ ... │ Running ◐ │ Now     │ -        │Scheduled │ 2/5    │ │ │
│  │ └─────┴───────────┴─────────┴──────────┴──────────┴────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Cache Service | `server/services/cache.service.ts` | Redis/memory caching |
| WebSocket Service | `server/services/websocket.service.ts` | Real-time stats |
| Scheduled Tasks Schema | `drizzle/schema-scheduled-tasks.ts` | Data models |
| Cost Tracking Service | `server/services/costTracking.service.ts` | Cost calculations |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| drizzle-orm | ^0.30.x | Database queries |
| zod | ^3.x | Input validation |
| @trpc/server | ^11.x | API framework |
| redis | ^4.x | Caching (optional) |
| recharts | ^2.x | Chart visualization |
| @tanstack/react-query | ^5.x | Data fetching |

### 8.3 Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `scheduled_browser_tasks` | Task definitions | userId, status, execution stats |
| `scheduled_task_executions` | Execution history | taskId, status, duration, timestamps |
| `cron_job_registry` | Active job tracking | taskId, isRunning, metadata |

### 8.4 Environment Variables

```bash
# Cache Configuration
REDIS_URL=              # Redis connection (optional)
CACHE_TTL_MEDIUM=300    # 5 minute TTL (default)

# Cost Configuration
BROWSERBASE_COST_PER_MINUTE=0.005   # Placeholder
BROWSERBASE_MIN_SESSION_COST=0.01   # Placeholder

# Database
DATABASE_URL=           # PostgreSQL connection string
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Predictive analytics | ML infrastructure needed | v2.0 |
| Custom dashboard layouts | Complexity | v1.5 |
| Multi-tenant aggregation | Enterprise feature | v2.0 |
| Real-time alerting | Separate feature | PRD-011 |
| PDF report generation | Third-party integration | v1.5 |
| API cost tracking integration | Requires cost router merge | v1.5 |
| Anomaly detection | ML models required | v2.0 |
| Custom date range picker | UI complexity | v1.5 |
| White-label dashboards | Enterprise feature | v2.0 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Historical data limit | Max 1 year of detailed data | Aggregated summaries for older data |
| Real-time granularity | 1 second minimum | Batched updates for performance |
| Chart data points | Max 365 points | Automatic aggregation for longer periods |
| Concurrent exports | 1 per user | Queue system for multiple exports |

### 9.3 Integration Exclusions

| Integration | Reason | Alternative |
|-------------|--------|-------------|
| External BI tools | Scope creep | API export endpoints |
| Slack notifications | Separate feature | Webhooks PRD |
| Mobile app | Platform not supported | Responsive web |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database performance degradation | Medium | High | Query optimization, indexing, partitioning |
| Cache invalidation issues | Low | Medium | Conservative TTL, manual invalidation option |
| Large data volume handling | Medium | High | Pagination, lazy loading, data aggregation |
| Real-time update failures | Low | Medium | Fallback to polling, graceful degradation |
| Chart rendering performance | Low | Medium | Virtual scrolling, data point limits |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Inaccurate cost estimates | Medium | High | Clear disclaimers, integration with billing |
| User confusion with metrics | Medium | Medium | Tooltips, documentation, onboarding |
| Low adoption rate | Medium | Medium | Feature discovery, dashboard defaults |
| Metric misinterpretation | Low | Medium | Clear labels, explanatory text |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data leakage between users | Low | Critical | Strict userId filtering on all queries |
| SQL injection | Low | Critical | Parameterized queries, Drizzle ORM |
| Cache poisoning | Low | High | User-scoped cache keys |
| Unauthorized data access | Low | High | Authentication required on all endpoints |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| High database load | Medium | Medium | Query caching, read replicas |
| Cache failures | Low | Low | Graceful degradation to direct queries |
| Monitoring blind spots | Medium | Medium | Comprehensive logging, alerting |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Analytics API (Weeks 1-2)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M1.1 | Execution stats endpoint with caching | Week 1 |
| M1.2 | Task-specific metrics endpoint | Week 1 |
| M1.3 | Usage statistics endpoint | Week 2 |
| M1.4 | Cost analysis endpoint | Week 2 |

**Exit Criteria:**
- [ ] All endpoints return correct data
- [ ] Caching works with 5-minute TTL
- [ ] User data isolation verified
- [ ] API response times < 500ms

### 11.2 Phase 2: Performance & System Stats (Weeks 3-4)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M2.1 | Performance trends endpoint | Week 3 |
| M2.2 | WebSocket statistics endpoint | Week 3 |
| M2.3 | Cache statistics endpoint | Week 4 |
| M2.4 | Query optimization & indexing | Week 4 |

**Exit Criteria:**
- [ ] Performance trends show daily data
- [ ] System health endpoints operational
- [ ] Database queries optimized
- [ ] All endpoints under 200ms

### 11.3 Phase 3: Dashboard UI (Weeks 5-8)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M3.1 | Dashboard layout and navigation | Week 5 |
| M3.2 | KPI cards and summary widgets | Week 6 |
| M3.3 | Chart components (trends, breakdowns) | Week 7 |
| M3.4 | Execution history table with pagination | Week 8 |

**Exit Criteria:**
- [ ] Dashboard loads in < 2 seconds
- [ ] All widgets render correctly
- [ ] Charts are interactive
- [ ] Responsive design works on tablet

### 11.4 Phase 4: Advanced Features (Weeks 9-10)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M4.1 | Task drill-down view | Week 9 |
| M4.2 | Period comparison feature | Week 9 |
| M4.3 | CSV export functionality | Week 10 |
| M4.4 | Dashboard preferences | Week 10 |

**Exit Criteria:**
- [ ] Users can analyze individual tasks
- [ ] Period comparison shows % change
- [ ] Export generates valid CSV
- [ ] Preferences persist across sessions

### 11.5 Phase 5: Testing & Polish (Weeks 11-12)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M5.1 | Unit tests (>80% coverage) | Week 11 |
| M5.2 | Integration tests | Week 11 |
| M5.3 | Performance testing | Week 12 |
| M5.4 | Documentation and launch prep | Week 12 |

**Exit Criteria:**
- [ ] Test coverage >= 80%
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Execution Statistics

- [ ] Dashboard shows total executions for selected period
- [ ] Success, failure, timeout, and running counts are accurate
- [ ] Success rate is calculated correctly to 1 decimal place
- [ ] Average duration is weighted correctly across statuses
- [ ] Data refreshes when period selector changes
- [ ] Cache indicator shows when data is from cache

#### AC-002: Task Performance Metrics

- [ ] Task selector allows searching/selecting specific tasks
- [ ] Performance metrics show average, median, min, max duration
- [ ] Current status accurately reflects task state
- [ ] Recent executions table shows last 10 with all details
- [ ] Progress indicator shows steps completed/total
- [ ] Unauthorized task access returns appropriate error

#### AC-003: Usage Statistics

- [ ] Time period grouping works: hour, day, week, month
- [ ] Line chart renders with correct data points
- [ ] Hover shows detailed values for each point
- [ ] Summary totals match sum of data points
- [ ] Empty periods show zero values (not gaps)

#### AC-004: Cost Analysis

- [ ] Total cost displays in USD with 2 decimal places
- [ ] Cost per execution is calculated correctly
- [ ] Cost breakdown shows session vs duration costs
- [ ] Notes explain estimation methodology
- [ ] Cost trends align with execution volume

#### AC-005: Performance Trends

- [ ] Daily data points render for selected period
- [ ] Multiple metrics can be displayed simultaneously
- [ ] Task filter narrows data to specific task
- [ ] Trend direction is visually indicated
- [ ] Export includes all displayed data

### 12.2 Technical Acceptance

- [ ] API response time P95 < 500ms
- [ ] Cache hit rate >= 80% after warm-up
- [ ] No N+1 query patterns
- [ ] All queries use proper indexes
- [ ] User ID filtering on all data access
- [ ] Error responses include actionable messages

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests pass for all endpoints
- [ ] No critical security vulnerabilities (OWASP Top 10)
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Performance budget met (LCP < 2.5s)

### 12.4 User Experience Acceptance

- [ ] Dashboard is intuitive without training
- [ ] All metrics have tooltips/explanations
- [ ] Loading states are clear and non-blocking
- [ ] Error states provide recovery options
- [ ] Mobile/tablet views are usable

---

## Appendix A: API Reference

### A.1 Analytics Router Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `analytics.getExecutionStats` | query | `ExecutionStatsInput` | `ExecutionStatsResult` |
| `analytics.getTaskMetrics` | query | `TaskMetricsInput` | `TaskMetricsResult` |
| `analytics.getUsageStats` | query | `UsageStatsInput` | `UsageStatsResult` |
| `analytics.getCostAnalysis` | query | `CostAnalysisInput` | `CostAnalysisResult` |
| `analytics.getPerformanceTrends` | query | `PerformanceTrendsInput` | `PerformanceTrendsResult` |
| `analytics.getWebSocketStats` | query | None | `WebSocketStatsResult` |
| `analytics.getCacheStats` | query | None | `CacheStatsResult` |

### A.2 Response Schemas

```typescript
// Execution Stats Response
interface ExecutionStatsResult {
  period: TimePeriod;
  dateRange: { start: Date; end: Date };
  totalExecutions: number;
  successCount: number;
  failedCount: number;
  timeoutCount: number;
  runningCount: number;
  successRate: number;
  failureRate: number;
  averageDuration: number;
  averageDurationFormatted: string;
  fromCache: boolean;
}

// Task Metrics Response
interface TaskMetricsResult {
  taskId: number;
  taskName: string;
  period: TimePeriod;
  dateRange: { start: Date; end: Date };
  execution: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
  duration: {
    average: number;
    median: number;
    min: number;
    max: number;
    unit: string;
  };
  currentStatus: {
    isActive: boolean;
    status: string;
    lastRun: Date | null;
    lastRunStatus: string | null;
    nextRun: Date | null;
    isRunning: boolean;
    consecutiveFailures: number;
  };
  recentExecutions: RecentExecution[];
  fromCache: boolean;
}

// Usage Stats Response
interface UsageStatsResult {
  period: TimePeriod;
  groupBy: GroupByOption;
  dateRange: { start: Date; end: Date };
  data: UsageDataPoint[];
  summary: {
    totalExecutions: number;
    totalSuccess: number;
    totalFailed: number;
  };
  fromCache: boolean;
}

// Cost Analysis Response
interface CostAnalysisResult {
  period: TimePeriod;
  dateRange: { start: Date; end: Date };
  executions: {
    total: number;
    totalDurationMs: number;
    totalDurationMinutes: number;
    avgDurationMs: number;
  };
  cost: {
    estimatedTotal: number;
    currency: string;
    costPerExecution: number;
    costPerMinute: number;
    notes: string[];
  };
  breakdown: {
    sessionCosts: number;
    durationCosts: number;
  };
  fromCache: boolean;
}

// Performance Trends Response
interface PerformanceTrendsResult {
  period: TimePeriod;
  dateRange: { start: Date; end: Date };
  metrics: string[];
  data: TrendDataPoint[];
  fromCache: boolean;
}
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Execution** | A single run of a scheduled browser task |
| **Success Rate** | Percentage of executions completed successfully |
| **Duration** | Time taken to complete an execution (in milliseconds) |
| **TTL** | Time To Live - cache expiration duration |
| **Task** | A scheduled browser automation workflow |
| **Trigger Type** | How an execution was started: scheduled, manual, or retry |
| **Cache Hit** | When requested data is found in cache |
| **Cache Miss** | When data must be computed (not in cache) |

---

## Appendix C: Wireframes

### C.1 Main Dashboard View

```
┌────────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                    [Week ▼] [Refresh ↻]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  1,234   │  │  94.5%   │  │    68    │  │   45s    │      │
│  │  Total   │  │ Success  │  │  Failed  │  │ Avg Time │      │
│  │ +12% ↑   │  │ +2.1% ↑  │  │ -15% ↓   │  │ -5s ↓    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Execution Trends                        │  │
│  │  [Chart: Line graph with success/failure over time]      │  │
│  │                                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────┐ ┌────────────────────────────┐   │
│  │     Cost Breakdown     │ │     Status Distribution     │   │
│  │  [Pie chart: costs]    │ │  [Bar chart: statuses]     │   │
│  └────────────────────────┘ └────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 Recent Executions                        │  │
│  │  ┌──────┬────────┬──────────┬──────────┬─────────────┐  │  │
│  │  │ Task │ Status │ Duration │ Trigger  │ Time        │  │  │
│  │  ├──────┼────────┼──────────┼──────────┼─────────────┤  │  │
│  │  │ ...  │  ✓     │ 32s      │ schedule │ 2 min ago   │  │  │
│  │  │ ...  │  ✗     │ 18s      │ manual   │ 5 min ago   │  │  │
│  │  └──────┴────────┴──────────┴──────────┴─────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### C.2 Task Detail View

```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                            │
│                                                                │
│ Task: Daily Report Generation                                  │
│ Status: ● Active    Next Run: Jan 12, 2026 06:00 AM           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Performance Summary (Last 30 Days)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   245    │  │  96.3%   │  │   9      │  │   38s    │      │
│  │ Runs     │  │ Success  │  │ Failures │  │ Avg Time │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                │
│  Duration Analysis                                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Average: 38s  │  Median: 35s  │  Min: 22s  │  Max: 89s│   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │       ▲ You are here                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Execution History                                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ # │ Started      │ Duration │ Status │ Trigger │ Steps │   │
│  │───┼──────────────┼──────────┼────────┼─────────┼───────│   │
│  │ 1 │ Jan 11 06:00 │ 35s      │ ✓      │ Sched   │ 5/5   │   │
│  │ 2 │ Jan 10 06:00 │ 42s      │ ✓      │ Sched   │ 5/5   │   │
│  │ 3 │ Jan 9 06:01  │ 89s      │ ✗      │ Sched   │ 3/5   │   │
│  │   │ Error: Timeout waiting for element                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Design, Finance
