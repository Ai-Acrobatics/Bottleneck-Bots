# PRD-030: Costs Tracking

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/costs.ts`, `server/services/costTracking.service.ts`, `drizzle/schema-costs.ts`

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

The Costs Tracking feature provides comprehensive cost monitoring, analytics, and budget management for all billable operations within Bottleneck-Bots. This system tracks costs across multiple providers including Claude API (Anthropic), Gemini API (Google), Browserbase sessions, and cloud storage (S3/R2/GCS), enabling users to understand their spending patterns, set budgets, receive alerts, and optimize their automation costs.

### 1.1 Feature Summary

- **API Token Usage Tracking**: Real-time tracking of Claude and Gemini API token consumption with per-model cost calculations
- **Browser Session Cost Tracking**: Duration-based cost tracking for Browserbase sessions including recordings and screenshots
- **Storage Cost Tracking**: Per-operation cost tracking for S3, R2, and GCS storage operations
- **Per-Execution Cost Breakdown**: Detailed cost attribution to specific task executions
- **Daily/Weekly/Monthly Reporting**: Aggregated cost summaries with trend analysis
- **Budget Management**: Configurable spending limits with alert thresholds
- **Cost Optimization Recommendations**: AI-driven insights to reduce costs (planned)
- **Multi-Provider Analytics**: Unified view of costs across all integrated providers

### 1.2 Target Users

- **Agency Owners**: Monitor overall automation costs and ROI across all operations
- **Finance Managers**: Budget planning, cost forecasting, and expense tracking
- **Operations Managers**: Optimize workflow costs and identify inefficiencies
- **DevOps Engineers**: Monitor infrastructure costs and resource utilization
- **Individual Users**: Track personal usage and manage subscription limits

### 1.3 Key Capabilities

| Capability | Description |
|------------|-------------|
| Real-Time Cost Tracking | Track costs as API calls and sessions occur |
| Token-Level Granularity | Input/output/cache token breakdown per API call |
| Multi-Model Support | Distinct pricing for Claude Opus, Sonnet, Gemini Pro/Flash models |
| Session Cost Attribution | Link browser session costs to specific task executions |
| Budget Enforcement | Optional auto-stop when budget limits are reached |
| Cost Trending | Historical cost analysis with time-series visualization |
| Export & Reporting | Downloadable cost reports for accounting |

### 1.4 Current Pricing Models Supported

| Provider | Cost Model | Rate (as of 2025) |
|----------|------------|-------------------|
| Claude Opus 4.5 | Per 1M tokens | $3 input / $15 output |
| Claude Sonnet 4.5 | Per 1M tokens | $3 input / $15 output |
| Gemini 2.0 Flash | Per 1M tokens | $0.10 input / $0.40 output |
| Gemini 1.5 Pro | Per 1M tokens | $1.25 input / $5.00 output |
| Browserbase | Per minute | ~$0.01/minute |
| S3 Storage | Per GB/month + operations | $0.023/GB + $0.005/1K PUTs |
| Cloudflare R2 | Per GB/month + operations | $0.015/GB (free egress) |

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Cost Opacity**: Users have no visibility into how much their automations cost per execution
2. **Budget Overruns**: Unexpected API costs due to verbose prompts or long browser sessions
3. **No Attribution**: Unable to identify which tasks or workflows consume the most resources
4. **Manual Tracking**: Users resort to checking provider dashboards separately
5. **No Forecasting**: Cannot predict monthly costs based on usage patterns
6. **Cache Optimization Blindspot**: No visibility into cache token utilization for cost savings

### 2.2 User Pain Points

| User Type | Pain Point |
|-----------|------------|
| Agency Owner | "I received a $500 API bill and don't know which client's tasks caused it" |
| Finance Manager | "I can't budget for automation costs because they're unpredictable" |
| Operations Manager | "I want to optimize our most expensive workflows but don't know which ones" |
| Developer | "I don't know if my prompts are cost-efficient or wasting tokens" |
| User | "I exceeded my monthly limit without any warning" |

### 2.3 Business Impact

| Problem | Impact | Estimated Cost |
|---------|--------|----------------|
| Untracked API costs | Budget overruns | 40% variance in monthly bills |
| Inefficient prompts | Wasted tokens | 15-30% unnecessary spend |
| Long browser sessions | Excessive session charges | 20% overspend |
| No cache optimization | Missing savings | 90% potential savings lost |
| Manual reconciliation | Admin overhead | 5+ hours/month |

### 2.4 Competitive Analysis

| Competitor | Cost Tracking Features | Gap Analysis |
|------------|----------------------|--------------|
| OpenAI Dashboard | Basic token usage, no attribution | No per-task breakdown |
| Browserbase Console | Session-level costs only | No integration with API costs |
| AWS Cost Explorer | Infrastructure costs only | No AI-specific metrics |
| LangSmith | Prompt-level tracking | Separate from browser costs |

**Opportunity**: Provide unified cost tracking across all AI and browser automation services with per-execution attribution.

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Description | Priority | Success Criteria |
|---------|-------------|----------|------------------|
| **G1** | Provide real-time cost visibility across all providers | P0 | Costs updated within 5 seconds of API call |
| **G2** | Enable per-execution cost attribution | P0 | 100% of costs attributable to specific tasks |
| **G3** | Support budget management and alerts | P0 | Alert within 1 minute of threshold breach |
| **G4** | Reduce unexpected cost overruns | P1 | 50% reduction in budget variance |
| **G5** | Enable cost optimization insights | P1 | Identify top 20% cost drivers automatically |

### 3.2 Success Metrics (KPIs)

#### Cost Visibility Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Cost Attribution Rate | >= 99% | Costs linked to execution / Total costs |
| Data Freshness | < 5 seconds | Time from API call to dashboard update |
| Dashboard Load Time | < 2 seconds (P95) | Performance monitoring |
| Cost Accuracy | >= 99.5% | Tracked costs vs provider invoices |

#### Budget Management Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Alert Delivery Time | < 1 minute | Time from threshold breach to alert |
| Budget Adoption Rate | >= 60% | Users with budgets / Total users |
| Budget Accuracy | >= 95% | Predicted vs actual monthly costs |
| Overrun Prevention | 50% reduction | Users exceeding budgets before/after |

#### Optimization Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Cache Hit Rate Visibility | 100% | Sessions showing cache metrics |
| Cost per Execution Trend | 10% reduction | Average cost over 3 months |
| Optimization Adoption | >= 40% | Users implementing recommendations |

#### Business Impact Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| User Satisfaction (CSAT) | >= 4.5/5 | In-app surveys |
| Support Tickets (cost-related) | 30% reduction | Ticket categorization |
| Revenue Predictability | >= 90% | Forecasted vs actual usage revenue |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: View Cost Overview

**As an** agency owner
**I want to** see a summary of all costs for a time period
**So that** I can understand my total automation spending

**Acceptance Criteria:**
- Dashboard shows total costs for selected period (day/week/month/quarter/year)
- Costs are broken down by provider (Claude, Gemini, Browserbase, Storage)
- Date range selector allows flexible period selection
- Budget status is displayed if configured
- Data refreshes automatically or on demand

#### US-002: Analyze Token Usage

**As a** developer
**I want to** see detailed token usage statistics
**So that** I can optimize my prompts for cost efficiency

**Acceptance Criteria:**
- Total input, output, cache creation, and cache read tokens displayed
- Token counts broken down by model (Opus, Sonnet, Gemini variants)
- Token counts broken down by prompt type (system, task, observation)
- Average tokens per API call calculated
- Cache hit ratio visible for optimization insights

#### US-003: Track Browser Session Costs

**As an** operations manager
**I want to** see costs for browser automation sessions
**So that** I can optimize session duration and usage

**Acceptance Criteria:**
- Total sessions and duration for period displayed
- Cost breakdown: base session, recording, screenshots
- Status breakdown: completed, failed, timeout
- Recent sessions list with individual costs
- Average session duration and cost metrics

#### US-004: View Storage Costs

**As a** DevOps engineer
**I want to** track storage operation costs
**So that** I can optimize file handling in automations

**Acceptance Criteria:**
- Total operations count and data volume
- Cost breakdown by provider (S3, R2, GCS)
- Cost breakdown by operation type (upload, download, delete)
- Recent operations with size and cost
- Storage efficiency metrics

#### US-005: Configure Budget Limits

**As a** finance manager
**I want to** set spending limits with alerts
**So that** I can prevent cost overruns

**Acceptance Criteria:**
- Configure daily, weekly, and monthly budget limits
- Set alert threshold percentage (e.g., 80%)
- Option to auto-stop executions when limit reached
- Current spend vs budget displayed
- Remaining budget calculated

### 4.2 Advanced User Stories

#### US-006: Execution-Level Cost Breakdown

**As an** automation engineer
**I want to** see costs for a specific task execution
**So that** I can identify expensive operations

**Acceptance Criteria:**
- All API calls for execution with token counts
- Browser session linked to execution with duration
- Storage operations linked to execution
- Total execution cost calculated
- Comparison to average execution cost

#### US-007: Cost Trends Analysis

**As an** agency owner
**I want to** see cost trends over time
**So that** I can forecast future spending

**Acceptance Criteria:**
- Time-series chart of costs by day/week/month
- Trend lines for each cost category
- Compare current period to previous period
- Identify anomalies and spikes
- Export data for external analysis

#### US-008: Gemini Token Tracking

**As a** developer
**I want to** track Gemini API usage separately
**So that** I can compare costs between AI providers

**Acceptance Criteria:**
- Gemini token counts separate from Claude
- Breakdown by Gemini model (Flash, Pro, etc.)
- Cost comparison between providers
- Efficiency metrics per provider

#### US-009: Daily Cost Summaries

**As a** finance manager
**I want to** see daily aggregated cost reports
**So that** I can reconcile with billing statements

**Acceptance Criteria:**
- Daily summary with all cost categories
- Model-level cost breakdown
- Provider-level cost breakdown
- Exportable for accounting purposes

#### US-010: Budget Alert Notifications

**As a** user
**I want to** receive alerts when approaching budget limits
**So that** I can take action before exceeding them

**Acceptance Criteria:**
- Alert when reaching threshold (e.g., 80%)
- Alert when exceeding limit
- Notification via email and in-app
- Daily summary of budget status
- Historical alert log

### 4.3 Administrative User Stories

#### US-011: View Organization-Wide Costs

**As an** admin
**I want to** see costs across all users
**So that** I can manage platform-wide spending

**Acceptance Criteria:**
- Aggregate costs across all users
- Top users by cost ranking
- Cost trends at organization level
- Budget compliance dashboard

#### US-012: Cost Allocation by Client

**As an** agency owner
**I want to** attribute costs to specific clients
**So that** I can bill clients accurately

**Acceptance Criteria:**
- Costs linked to sub-accounts/clients
- Client-specific cost reports
- Export for client billing
- Margin calculation per client

---

## 5. Functional Requirements

### 5.1 Cost Overview

#### FR-001: Get Cost Overview

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Accept period parameter (day, week, month, quarter, year, all) | P0 |
| FR-001.2 | Calculate date range from period selection | P0 |
| FR-001.3 | Return total costs aggregated across all providers | P0 |
| FR-001.4 | Return breakdown by provider (Claude, Gemini, Browserbase, Storage) | P0 |
| FR-001.5 | Include current budget status if configured | P0 |
| FR-001.6 | Return cost analytics with trend data | P1 |
| FR-001.7 | Support user-scoped data only (multi-tenant isolation) | P0 |

### 5.2 Token Usage Statistics

#### FR-002: Claude API Token Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Track input tokens per API call | P0 |
| FR-002.2 | Track output tokens per API call | P0 |
| FR-002.3 | Track cache creation tokens (prompt caching) | P0 |
| FR-002.4 | Track cache read tokens (cache hits) | P0 |
| FR-002.5 | Calculate total tokens per call | P0 |
| FR-002.6 | Calculate costs using model-specific pricing | P0 |
| FR-002.7 | Support filtering by execution ID | P1 |
| FR-002.8 | Aggregate by model (Opus, Sonnet) | P0 |
| FR-002.9 | Aggregate by prompt type (system, task, observation) | P1 |
| FR-002.10 | Calculate average tokens per call | P0 |

#### FR-003: Gemini API Token Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Track input tokens per Gemini API call | P0 |
| FR-003.2 | Track output tokens per Gemini API call | P0 |
| FR-003.3 | Calculate costs using Gemini-specific pricing | P0 |
| FR-003.4 | Aggregate by model (Flash, Pro, etc.) | P0 |
| FR-003.5 | Aggregate by prompt type | P1 |
| FR-003.6 | Support higher precision for lower-cost Gemini models | P0 |

### 5.3 Browser Session Costs

#### FR-004: Browserbase Cost Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Track session duration in milliseconds and minutes | P0 |
| FR-004.2 | Calculate base session cost ($0.01/minute default) | P0 |
| FR-004.3 | Track recording costs as additional charge | P0 |
| FR-004.4 | Track screenshot count and costs | P0 |
| FR-004.5 | Aggregate by session status (active, completed, failed, timeout) | P0 |
| FR-004.6 | Return recent sessions list with details | P0 |
| FR-004.7 | Link sessions to task executions | P0 |
| FR-004.8 | Calculate average session duration and cost | P0 |

### 5.4 Storage Costs

#### FR-005: Storage Operation Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Track storage operations (upload, download, delete, list) | P0 |
| FR-005.2 | Support multiple providers (S3, R2, GCS) | P0 |
| FR-005.3 | Track operation size in bytes and MB | P0 |
| FR-005.4 | Calculate request costs per operation | P0 |
| FR-005.5 | Calculate egress/transfer costs for downloads | P0 |
| FR-005.6 | Aggregate by provider | P0 |
| FR-005.7 | Aggregate by operation type | P0 |
| FR-005.8 | Return recent operations list | P0 |

### 5.5 Budget Management

#### FR-006: Budget Configuration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Allow setting daily budget limit (USD) | P0 |
| FR-006.2 | Allow setting weekly budget limit (USD) | P0 |
| FR-006.3 | Allow setting monthly budget limit (USD) | P0 |
| FR-006.4 | Configure alert threshold percentage (1-100%) | P0 |
| FR-006.5 | Option to auto-stop executions when limit reached | P1 |
| FR-006.6 | Track current spend against each limit | P0 |
| FR-006.7 | Calculate remaining budget | P0 |
| FR-006.8 | Reset period tracking at period boundaries | P0 |

#### FR-007: Budget Status

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Return current daily/weekly/monthly spend | P0 |
| FR-007.2 | Return remaining budget for each period | P0 |
| FR-007.3 | Indicate if over budget | P0 |
| FR-007.4 | Indicate if should alert (threshold reached) | P0 |
| FR-007.5 | Track last alert sent timestamp | P1 |

### 5.6 Cost Analytics

#### FR-008: Daily Summaries

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Aggregate daily costs automatically | P0 |
| FR-008.2 | Include Claude API stats (calls, tokens, cost) | P0 |
| FR-008.3 | Include Gemini API stats (calls, tokens, cost) | P0 |
| FR-008.4 | Include Browserbase stats (sessions, minutes, cost) | P0 |
| FR-008.5 | Include Storage stats (operations, MB, cost) | P0 |
| FR-008.6 | Include cost breakdown by model | P0 |
| FR-008.7 | Include cost breakdown by provider | P0 |
| FR-008.8 | Return summaries for specified period | P0 |

#### FR-009: Cost Trends

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Return time-series cost data | P0 |
| FR-009.2 | Support grouping by day, week, or month | P0 |
| FR-009.3 | Include breakdown by cost category | P0 |
| FR-009.4 | Include operation counts per period | P0 |
| FR-009.5 | Include token totals per period | P0 |

#### FR-010: Execution Costs

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Return all costs for a specific execution ID | P0 |
| FR-010.2 | Include all Claude API calls with details | P0 |
| FR-010.3 | Include all Gemini API calls with details | P0 |
| FR-010.4 | Include linked browser session with details | P0 |
| FR-010.5 | Include all storage operations with details | P0 |
| FR-010.6 | Calculate total execution cost | P0 |
| FR-010.7 | Verify user ownership of execution | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Cost overview load time | < 2 seconds | P0 |
| NFR-002 | Token usage stats query time | < 500ms | P0 |
| NFR-003 | Daily summary aggregation | < 5 seconds | P0 |
| NFR-004 | Real-time cost tracking latency | < 5 seconds | P0 |
| NFR-005 | Budget check latency | < 100ms | P0 |
| NFR-006 | Trends query with 1 year data | < 3 seconds | P1 |
| NFR-007 | Execution cost breakdown | < 500ms | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | API call records per user | 10M+ records | P0 |
| NFR-009 | Browser session records per user | 1M+ records | P0 |
| NFR-010 | Daily summary retention | 2 years | P1 |
| NFR-011 | Concurrent cost queries | 500+ users | P1 |
| NFR-012 | Database index efficiency | < 100ms query plan | P0 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-013 | Cost tracking service availability | 99.9% | P0 |
| NFR-014 | Data accuracy vs provider invoices | >= 99.5% | P0 |
| NFR-015 | Budget enforcement reliability | 100% | P0 |
| NFR-016 | Cost attribution completeness | >= 99% | P0 |
| NFR-017 | Data durability | 99.999% | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-018 | All endpoints require authentication | P0 |
| NFR-019 | User data isolation (multi-tenant) | P0 |
| NFR-020 | Cost data encryption at rest | P0 |
| NFR-021 | Audit logging for budget changes | P1 |
| NFR-022 | Rate limiting on cost endpoints | P0 |
| NFR-023 | SQL injection prevention | P0 |

### 6.5 Compliance Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-024 | Cost data retention policy compliance | P1 |
| NFR-025 | GDPR data export capability | P1 |
| NFR-026 | SOC 2 audit trail requirements | P2 |
| NFR-027 | Financial data accuracy standards | P1 |

### 6.6 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-028 | Structured logging for all cost operations | P0 |
| NFR-029 | Metrics collection for cost tracking | P0 |
| NFR-030 | Alert on cost tracking failures | P0 |
| NFR-031 | Dashboard for service health | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+-----------------------------------------------------------------------+
|                        Costs Tracking Dashboard                        |
|  (React/Next.js with TanStack Query + Recharts)                       |
+----------------------------------+------------------------------------+
                                   | tRPC / HTTP
                                   v
+-----------------------------------------------------------------------+
|                         Costs API Layer                                |
|  +----------------------------------------------------------------+   |
|  |                     costsRouter (tRPC)                          |   |
|  |  +-------------+ +----------------+ +------------------+        |   |
|  |  |getOverview  | |getTokenUsage   | |getBrowserbase    |        |   |
|  |  |             | |Stats           | |Costs             |        |   |
|  |  +-------------+ +----------------+ +------------------+        |   |
|  |  +-------------+ +----------------+ +------------------+        |   |
|  |  |getGemini    | |getStorage      | |getDailySummaries |        |   |
|  |  |TokenUsage   | |Costs           | |                  |        |   |
|  |  +-------------+ +----------------+ +------------------+        |   |
|  |  +-------------+ +----------------+ +------------------+        |   |
|  |  |getBudget    | |setBudget       | |getCostTrends     |        |   |
|  |  +-------------+ +----------------+ +------------------+        |   |
|  |  +------------------+                                           |   |
|  |  |getExecutionCosts |                                           |   |
|  |  +------------------+                                           |   |
|  +----------------------------------------------------------------+   |
+----------------------------------+------------------------------------+
                                   |
          +------------------------+------------------------+
          v                        v                        v
+------------------+    +--------------------+    +--------------------+
| Cost Tracking    |    | Database           |    | Alert Service      |
| Service          |    | (PostgreSQL)       |    |                    |
|                  |    |                    |    |                    |
| - calculateCost  |    | - api_token_usage  |    | - Budget alerts    |
| - trackApiCall   |    | - gemini_token_    |    | - Threshold        |
| - trackSession   |    |   usage            |    |   notifications    |
| - trackStorage   |    | - browserbase_     |    |                    |
| - updateSummary  |    |   costs            |    |                    |
| - checkBudget    |    | - storage_costs    |    |                    |
|                  |    | - daily_cost_      |    |                    |
|                  |    |   summaries        |    |                    |
|                  |    | - cost_budgets     |    |                    |
+------------------+    +--------------------+    +--------------------+
          ^                        ^
          |                        |
+------------------+    +--------------------+
| Provider APIs    |    | Task Execution     |
|                  |    | System             |
| - Anthropic      |    |                    |
| - Google Gemini  |    | - Execution IDs    |
| - Browserbase    |    | - Task attribution |
| - AWS S3         |    |                    |
| - Cloudflare R2  |    |                    |
+------------------+    +--------------------+
```

### 7.2 Component Details

#### 7.2.1 Costs Router (`costs.ts`)

Primary API interface for cost tracking endpoints.

**Key Endpoints:**

| Endpoint | Method | Purpose | Input Schema |
|----------|--------|---------|--------------|
| `getOverview` | query | Cost overview with analytics | `{ period: TimePeriod }` |
| `getTokenUsageStats` | query | Claude API token statistics | `{ period, executionId? }` |
| `getGeminiTokenUsageStats` | query | Gemini API token statistics | `{ period, executionId? }` |
| `getBrowserbaseCosts` | query | Browser session costs | `{ period, executionId? }` |
| `getStorageCosts` | query | Storage operation costs | `{ period, executionId?, provider? }` |
| `getDailySummaries` | query | Daily aggregated costs | `{ period }` |
| `getBudget` | query | Current budget status | None |
| `setBudget` | mutation | Configure budget limits | Budget settings |
| `getCostTrends` | query | Cost trends over time | `{ period, groupBy }` |
| `getExecutionCosts` | query | Per-execution cost breakdown | `{ executionId }` |

**Input Validation (Zod Schemas):**

```typescript
// Time period enum
const TimePeriod = z.enum(["day", "week", "month", "quarter", "year", "all"]);

// Budget configuration
const BudgetInput = z.object({
  dailyBudget: z.number().optional(),
  weeklyBudget: z.number().optional(),
  monthlyBudget: z.number().optional(),
  alertThreshold: z.number().min(1).max(100).default(80),
  autoStopOnLimit: z.boolean().default(false),
});

// Cost trends input
const CostTrendsInput = z.object({
  period: TimePeriod.default("month"),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});
```

#### 7.2.2 Cost Tracking Service (`costTracking.service.ts`)

Core business logic for cost calculations and tracking.

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `calculateCost(model, tokens)` | Calculate cost from token usage |
| `calculateGeminiCost(model, tokens)` | Calculate Gemini-specific costs |
| `calculateStorageCost(provider, operation, size)` | Calculate storage costs |
| `extractTokenUsage(response)` | Extract tokens from API response |
| `trackApiCall(params)` | Record Claude API call |
| `trackGeminiCall(params)` | Record Gemini API call |
| `trackBrowserbaseSession(params)` | Record browser session |
| `trackStorageOperation(params)` | Record storage operation |
| `updateDailySummary(userId, date)` | Aggregate daily costs |
| `getBudgetStatus(userId)` | Get current budget status |
| `checkBudgetLimits(userId)` | Check and update budget tracking |
| `getCostAnalytics(params)` | Get comprehensive analytics |

**Pricing Constants:**

```typescript
export const CLAUDE_PRICING = {
  "claude-opus-4-5-20251101": {
    input: 3.0,      // $3 per 1M input tokens
    output: 15.0,    // $15 per 1M output tokens
    cacheCreation: 3.75,
    cacheRead: 0.30,
  },
  // ... other models
};

export const GEMINI_PRICING = {
  "gemini-2.0-flash": {
    input: 0.10,   // $0.10 per 1M input tokens
    output: 0.40,  // $0.40 per 1M output tokens
  },
  // ... other models
};

export const BROWSERBASE_PRICING = {
  sessionCostPerMinute: 0.01,
  recordingCost: 0.005,
  screenshotCost: 0.001,
};

export const STORAGE_PRICING = {
  s3: {
    storagePerGbMonth: 0.023,
    putRequest: 0.000005,
    getRequest: 0.0000004,
    egressPerGb: 0.09,
  },
  r2: {
    storagePerGbMonth: 0.015,
    putRequest: 0.0000045,
    getRequest: 0.00000036,
    egressPerGb: 0.0,  // Free egress
  },
};
```

#### 7.2.3 Database Schema (`schema-costs.ts`)

**Tables:**

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `api_token_usage` | Claude API call tracking | userId, executionId, model, tokens, cost |
| `gemini_token_usage` | Gemini API call tracking | userId, executionId, model, tokens, cost |
| `browserbase_costs` | Browser session costs | userId, sessionId, duration, cost, status |
| `storage_costs` | Storage operation costs | userId, provider, bucket, size, cost |
| `daily_cost_summaries` | Aggregated daily costs | userId, date, costs by category |
| `cost_budgets` | User budget configuration | userId, limits, current spend, thresholds |

**Indexes:**

```sql
-- Optimized queries by user and time
CREATE INDEX api_token_usage_user_created_idx
  ON api_token_usage (userId, createdAt);

CREATE INDEX browserbase_costs_user_created_idx
  ON browserbase_costs (userId, createdAt);

CREATE INDEX daily_cost_summaries_user_date_idx
  ON daily_cost_summaries (userId, date);
```

### 7.3 Data Flow

```
1. API Call Made (Claude/Gemini)
         |
         v
2. Response Received with Usage Data
         |
         v
3. CostTrackingService.trackApiCall()
         |
    +----+----+
    |         |
    v         v
4. Insert    5. Update Daily Summary
   Token        |
   Usage        v
              6. Check Budget Limits
                  |
            +-----+-----+
            |           |
            v           v
        7a. Update   7b. Send Alert
            Budget      (if threshold
            Status       reached)
```

### 7.4 Client Architecture

```
+-------------------------------------------------------------------------+
| Costs Dashboard Page                                                     |
+---------+---------------------------------------------------------------+
|         |                                                                |
| Sidebar |  +------------------------------------------------------------+|
|         |  |                Cost Overview Cards                         ||
| - Period|  | +--------+ +--------+ +--------+ +--------+ +--------+     ||
| - Export|  | | Total  | | Claude | | Gemini | |Browser | |Storage |     ||
| - Budget|  | | $142.50| | $98.20 | | $12.30 | | $28.00 | | $4.00  |     ||
|         |  | +--------+ +--------+ +--------+ +--------+ +--------+     ||
|         |  +------------------------------------------------------------+|
|         |                                                                |
|         |  +------------------------------------------------------------+|
|         |  |                 Cost Trends Chart                          ||
|         |  |  $50 |      ___                                            ||
|         |  |      |   __/   \___    ___                                 ||
|         |  |  $25 |  /           \__/   \                               ||
|         |  |      | /                    \___                           ||
|         |  |   $0 +------------------------------->                     ||
|         |  |       Mon  Tue  Wed  Thu  Fri  Sat  Sun                    ||
|         |  +------------------------------------------------------------+|
|         |                                                                |
|         |  +---------------------------+ +------------------------------+|
|         |  |    Cost by Model           | |    Budget Status            ||
|         |  | +------------------------+ | | Daily:   $45.20 / $100.00   ||
|         |  | | [|||||||   ] Opus 68%  | | | [========  ] 45%            ||
|         |  | | [||||      ] Sonnet 28%| | | Weekly:  $245.50 / $500.00  ||
|         |  | | [|         ] Gemini 4% | | | [=====    ] 49%             ||
|         |  | +------------------------+ | | Monthly: $892.30 / $2000.00 ||
|         |  +---------------------------+ | [====      ] 45%             ||
|         |                                +------------------------------+|
|         |                                                                |
|         |  +------------------------------------------------------------+|
|         |  |              Recent Operations Table                       ||
|         |  | +------+----------+--------+--------+-------+---------+    ||
|         |  | | Type | Provider | Model  | Tokens | Cost  | Time    |    ||
|         |  | +------+----------+--------+--------+-------+---------+    ||
|         |  | | API  | Claude   | Opus   | 12,450 | $0.052| 2m ago  |    ||
|         |  | | API  | Gemini   | Flash  | 8,320  | $0.004| 5m ago  |    ||
|         |  | | Brwsr| BB       | --     | 3.2min | $0.032| 8m ago  |    ||
|         |  | +------+----------+--------+--------+-------+---------+    ||
|         |  +------------------------------------------------------------+|
+---------+---------------------------------------------------------------+
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Task Executions | `drizzle/schema-webhooks.ts` | Execution ID references |
| Users | `drizzle/schema.ts` | User references |
| Alert Service | `server/services/alerts.service.ts` | Budget alert notifications |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| drizzle-orm | ^0.30.x | Database ORM |
| zod | ^3.x | Input validation |
| @trpc/server | ^11.x | API framework |
| @anthropic-ai/sdk | ^0.35.x | Claude API response types |
| recharts | ^2.x | Cost visualization charts |
| @tanstack/react-query | ^5.x | Data fetching |

### 8.3 Provider Dependencies

| Provider | Integration Point | Data Collected |
|----------|-------------------|----------------|
| Anthropic Claude API | Response usage object | Token counts |
| Google Gemini API | Response usage metadata | Token counts |
| Browserbase | Session events | Duration, status |
| AWS S3 | SDK response metadata | Size, operation type |
| Cloudflare R2 | SDK response metadata | Size, operation type |

### 8.4 Database Tables

| Table | Purpose | Foreign Keys |
|-------|---------|--------------|
| `api_token_usage` | Claude API tracking | userId, executionId |
| `gemini_token_usage` | Gemini API tracking | userId, executionId |
| `browserbase_costs` | Browser session tracking | userId, executionId |
| `storage_costs` | Storage operation tracking | userId, executionId |
| `daily_cost_summaries` | Aggregated summaries | userId |
| `cost_budgets` | User budgets | userId (unique) |

### 8.5 Environment Variables

```bash
# Pricing Configuration (optional overrides)
CLAUDE_OPUS_INPUT_COST=3.0
CLAUDE_OPUS_OUTPUT_COST=15.0
GEMINI_FLASH_INPUT_COST=0.10
GEMINI_FLASH_OUTPUT_COST=0.40
BROWSERBASE_COST_PER_MINUTE=0.01

# Database
DATABASE_URL=postgresql://...

# Alert Configuration
BUDGET_ALERT_EMAIL_ENABLED=true
BUDGET_ALERT_SLACK_ENABLED=false
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Cost prediction/forecasting | ML infrastructure needed | v2.0 |
| Automatic cost optimization | Complex optimization logic | v2.0 |
| Real-time streaming costs | WebSocket infrastructure | v1.5 |
| Multi-currency support | Complexity | v2.0 |
| Invoice generation | Third-party integration | v2.0 |
| Client billing automation | Business logic complexity | v2.0 |
| Cost anomaly detection | ML models required | v2.0 |
| Historical pricing support | Pricing version tracking | v1.5 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Token count precision | Based on provider response | Accept provider-reported counts |
| Real-time accuracy | 5-second delay possible | Use summaries for reconciliation |
| Cache token tracking | Provider-dependent | Fallback to 0 if not reported |
| Storage monthly costs | Approximated from operations | Calculate from aggregated size |

### 9.3 Integration Exclusions

| Integration | Reason | Alternative |
|-------------|--------|-------------|
| Stripe billing sync | Separate billing system | Manual export |
| QuickBooks integration | Third-party complexity | CSV export |
| Slack cost alerts | Separate notification system | Email alerts |
| Cost API webhooks | Infrastructure scope | Polling endpoints |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Pricing changes break calculations | Medium | High | Centralized pricing config, version tracking |
| High volume causes query slowness | Medium | Medium | Database indexing, partitioning by date |
| Token count discrepancies | Low | Medium | Reconciliation reports, provider invoice comparison |
| Budget race conditions | Low | High | Database transactions, optimistic locking |
| Daily summary aggregation fails | Low | Medium | Retry mechanism, manual recalculation endpoint |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cost data inaccuracy | Low | High | Validation against provider invoices |
| Users dispute costs | Medium | Medium | Detailed audit trail, execution linking |
| Budget alerts not delivered | Low | High | Alert delivery confirmation, retry logic |
| Pricing updates lag | Medium | Low | Regular pricing review process |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cost data leakage between users | Low | Critical | Strict userId filtering, multi-tenant isolation |
| Budget manipulation | Low | High | Server-side validation, audit logging |
| SQL injection in queries | Low | Critical | Parameterized queries via Drizzle ORM |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Storage growth unmanageable | Medium | Medium | Data retention policies, archival strategy |
| Provider API changes | Medium | Medium | Abstraction layer, version compatibility |
| Cost service downtime | Low | High | Async tracking, queue-based processing |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Cost Tracking (Weeks 1-3)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M1.1 | Database schema for cost tables | Week 1 |
| M1.2 | Claude API token tracking | Week 1 |
| M1.3 | Cost calculation service | Week 2 |
| M1.4 | Browserbase session tracking | Week 2 |
| M1.5 | Basic cost overview endpoint | Week 3 |

**Exit Criteria:**
- [ ] All cost tables created with indexes
- [ ] Token usage tracked for all Claude API calls
- [ ] Browser sessions tracked with duration and cost
- [ ] Overview endpoint returns accurate totals

### 11.2 Phase 2: Extended Tracking (Weeks 4-5)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M2.1 | Gemini API token tracking | Week 4 |
| M2.2 | Storage operation tracking | Week 4 |
| M2.3 | Per-execution cost breakdown | Week 5 |
| M2.4 | Token usage statistics endpoints | Week 5 |

**Exit Criteria:**
- [ ] Gemini costs tracked with provider-specific pricing
- [ ] Storage operations tracked across S3/R2/GCS
- [ ] Execution costs link all related operations
- [ ] Statistics endpoints return accurate breakdowns

### 11.3 Phase 3: Budget Management (Weeks 6-7)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M3.1 | Budget configuration endpoint | Week 6 |
| M3.2 | Budget status tracking | Week 6 |
| M3.3 | Alert threshold checking | Week 7 |
| M3.4 | Auto-stop enforcement | Week 7 |

**Exit Criteria:**
- [ ] Users can set daily/weekly/monthly budgets
- [ ] Current spend tracked against limits
- [ ] Alerts triggered at threshold
- [ ] Auto-stop prevents over-budget executions

### 11.4 Phase 4: Analytics & Reporting (Weeks 8-10)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M4.1 | Daily summary aggregation | Week 8 |
| M4.2 | Cost trends endpoint | Week 8 |
| M4.3 | Cost breakdown by model/provider | Week 9 |
| M4.4 | Export functionality | Week 10 |

**Exit Criteria:**
- [ ] Daily summaries generated automatically
- [ ] Trends show time-series cost data
- [ ] Breakdowns enable optimization insights
- [ ] Data exportable for accounting

### 11.5 Phase 5: Dashboard & Polish (Weeks 11-12)

| Milestone | Deliverables | Target |
|-----------|--------------|--------|
| M5.1 | Cost dashboard UI | Week 11 |
| M5.2 | Charts and visualizations | Week 11 |
| M5.3 | Unit and integration tests | Week 12 |
| M5.4 | Documentation and launch | Week 12 |

**Exit Criteria:**
- [ ] Dashboard displays all cost metrics
- [ ] Charts render trends and breakdowns
- [ ] Test coverage >= 80%
- [ ] Documentation complete

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Cost Overview

- [ ] Overview shows total costs for selected period
- [ ] Costs broken down by provider (Claude, Gemini, Browserbase, Storage)
- [ ] Date range calculated correctly for each period
- [ ] Budget status included when configured
- [ ] Data refreshes accurately on period change

#### AC-002: Token Usage Statistics

- [ ] Input/output/cache token counts accurate
- [ ] Token breakdown by model correct
- [ ] Token breakdown by prompt type correct
- [ ] Average tokens per call calculated
- [ ] Filtering by execution ID works

#### AC-003: Browser Session Costs

- [ ] Session duration tracked in ms and minutes
- [ ] Base cost calculated correctly
- [ ] Recording and screenshot costs added
- [ ] Status breakdown accurate
- [ ] Recent sessions list populated

#### AC-004: Storage Costs

- [ ] Operations tracked by type
- [ ] Size tracked in bytes and MB
- [ ] Provider-specific costs calculated
- [ ] Egress costs included for downloads
- [ ] Recent operations list populated

#### AC-005: Budget Management

- [ ] Daily/weekly/monthly limits configurable
- [ ] Alert threshold configurable (1-100%)
- [ ] Current spend tracked accurately
- [ ] Remaining budget calculated
- [ ] Auto-stop enforced when enabled

#### AC-006: Daily Summaries

- [ ] Summaries generated for each day with activity
- [ ] All cost categories included
- [ ] Model-level breakdown accurate
- [ ] Provider-level breakdown accurate
- [ ] Historical summaries retrievable

#### AC-007: Cost Trends

- [ ] Time-series data returned for period
- [ ] Grouping by day/week/month works
- [ ] Breakdown by category included
- [ ] Operation counts included
- [ ] Token totals included

#### AC-008: Execution Costs

- [ ] All API calls for execution returned
- [ ] Browser session linked correctly
- [ ] Storage operations linked correctly
- [ ] Total cost calculated accurately
- [ ] User ownership verified

### 12.2 Technical Acceptance

- [ ] API response time P95 < 500ms for all endpoints
- [ ] Database queries use indexes efficiently
- [ ] User data isolation verified (multi-tenant)
- [ ] Cost calculations match provider pricing
- [ ] Error handling for missing data graceful

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests for all endpoints
- [ ] No critical security vulnerabilities
- [ ] Cost calculation accuracy >= 99.5%
- [ ] Documentation complete

### 12.4 User Experience Acceptance

- [ ] Dashboard loads in < 2 seconds
- [ ] All metrics have tooltips/explanations
- [ ] Loading states are clear
- [ ] Error states provide actionable messages
- [ ] Period selector intuitive to use

---

## Appendix A: API Reference

### A.1 Costs Router Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `costs.getOverview` | query | `{ period }` | Overview with analytics and budget |
| `costs.getTokenUsageStats` | query | `{ period, executionId? }` | Claude token statistics |
| `costs.getGeminiTokenUsageStats` | query | `{ period, executionId? }` | Gemini token statistics |
| `costs.getBrowserbaseCosts` | query | `{ period, executionId? }` | Browser session costs |
| `costs.getStorageCosts` | query | `{ period, executionId?, provider? }` | Storage operation costs |
| `costs.getDailySummaries` | query | `{ period }` | Daily aggregated summaries |
| `costs.getBudget` | query | None | Current budget status |
| `costs.setBudget` | mutation | Budget configuration | Updated budget status |
| `costs.getCostTrends` | query | `{ period, groupBy }` | Time-series cost data |
| `costs.getExecutionCosts` | query | `{ executionId }` | Per-execution breakdown |

### A.2 Response Schemas

```typescript
// Cost Overview Response
interface CostOverviewResult {
  period: TimePeriod;
  dateRange: { start: Date; end: Date };
  analytics: {
    totalCost: number;
    apiCost: number;
    geminiCost: number;
    browserbaseCost: number;
    storageCost: number;
    totalApiCalls: number;
    totalGeminiCalls: number;
    totalSessions: number;
    totalStorageOperations: number;
    totalTokens: number;
    totalGeminiTokens: number;
    averageCostPerExecution: number;
    costByDay: Array<{ date: Date; cost: number }>;
    costByModel: Record<string, number>;
    costByProvider: Record<string, number>;
  };
  budget: BudgetStatus | null;
}

// Token Usage Stats Response
interface TokenUsageStatsResult {
  period: TimePeriod;
  dateRange: { start: Date; end: Date };
  overall: {
    totalCalls: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCacheCreationTokens: number;
    totalCacheReadTokens: number;
    totalTokens: number;
    totalCost: number;
    avgInputTokens: number;
    avgOutputTokens: number;
    avgCostPerCall: number;
  };
  byModel: Array<{
    model: string;
    callCount: number;
    totalTokens: number;
    totalCost: number;
  }>;
  byPromptType: Array<{
    promptType: string;
    callCount: number;
    totalCost: number;
  }>;
}

// Budget Status Response
interface BudgetStatus {
  hasBudget: boolean;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  dailySpend: number;
  weeklySpend: number;
  monthlySpend: number;
  dailyRemaining?: number;
  weeklyRemaining?: number;
  monthlyRemaining?: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
}

// Execution Costs Response
interface ExecutionCostsResult {
  executionId: number;
  totalCost: number;
  apiCost: number;
  geminiCost: number;
  browserbaseCost: number;
  storageCost: number;
  apiCalls: Array<ApiCallDetail>;
  geminiCalls: Array<GeminiCallDetail>;
  browserbaseSession: BrowserSessionDetail | null;
  storageOperations: Array<StorageOperationDetail>;
}
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Token** | Basic unit of text for LLM processing (~4 characters) |
| **Input Tokens** | Tokens in the prompt sent to the model |
| **Output Tokens** | Tokens in the model's response |
| **Cache Creation Tokens** | Tokens stored in prompt cache |
| **Cache Read Tokens** | Tokens retrieved from cache (90% discount) |
| **Session Duration** | Time a browser session is active |
| **Egress** | Data transferred out of cloud storage |
| **Budget Threshold** | Percentage of budget that triggers alerts |
| **Auto-Stop** | Feature to halt executions when budget exceeded |

---

## Appendix C: Cost Calculation Examples

### C.1 Claude API Cost Example

```
Model: claude-opus-4-5-20251101
Input tokens: 5,000
Output tokens: 1,500
Cache creation: 2,000
Cache read: 3,000

Calculations:
- Input cost:  (5,000 / 1,000,000) * $3.00 = $0.0150
- Output cost: (1,500 / 1,000,000) * $15.00 = $0.0225
- Cache creation: (2,000 / 1,000,000) * $3.75 = $0.0075
- Cache read: (3,000 / 1,000,000) * $0.30 = $0.0009

Total: $0.0459
```

### C.2 Browser Session Cost Example

```
Duration: 8.5 minutes
Recording: Yes
Screenshots: 12

Calculations:
- Base session: 8.5 * $0.01 = $0.085
- Recording: $0.005
- Screenshots: 12 * $0.001 = $0.012

Total: $0.102
```

### C.3 Storage Cost Example

```
Provider: S3
Operation: Download
Size: 150 MB

Calculations:
- Size in GB: 150 / 1024 = 0.1465 GB
- GET request: $0.0000004
- Egress: 0.1465 * $0.09 = $0.0132

Total: $0.0132
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Finance, Operations
