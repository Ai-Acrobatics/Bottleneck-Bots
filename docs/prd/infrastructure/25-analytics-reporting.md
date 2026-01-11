# PRD: Analytics & Reporting

## Overview
A comprehensive analytics and reporting system providing execution statistics, workflow performance metrics, user activity tracking, cost analytics, and time-series visualization. This system enables data-driven decision making for users to optimize their automations and for administrators to monitor platform health.

## Problem Statement
Users lack visibility into how their workflows perform over time, what actions consume the most resources, and where bottlenecks exist. Without analytics, users cannot optimize their automations, predict costs, or demonstrate ROI. Administrators need platform-wide metrics to identify trends, capacity plan, and ensure system health.

## Goals & Objectives
- **Primary Goals**
  - Provide real-time and historical workflow performance metrics
  - Enable cost tracking and prediction at user and workflow level
  - Deliver actionable insights for workflow optimization
  - Support data export for custom analysis

- **Success Metrics**
  - Dashboard load time < 2 seconds
  - Data freshness < 5 minutes for aggregated metrics
  - Query response < 1 second for 30-day reports
  - 99.9% analytics availability

## User Stories
- As a user, I want to see how many times my workflows executed so that I can track automation activity
- As a user, I want to identify slow workflow steps so that I can optimize performance
- As a manager, I want to see team activity metrics so that I can measure productivity
- As a user, I want to track API credit usage so that I can manage costs
- As an admin, I want to see platform-wide usage trends so that I can plan capacity

## Functional Requirements

### Must Have (P0)
- **Execution Statistics**
  - Total executions (hourly/daily/weekly/monthly)
  - Success/failure rates
  - Average execution duration
  - Execution breakdown by workflow
  - Execution breakdown by trigger type
  - Error categorization and frequency

- **Workflow Performance**
  - Individual workflow metrics
  - Step-by-step execution timing
  - Bottleneck identification
  - Comparison across workflow versions
  - Performance trends over time
  - Slowest workflows ranking

- **User Activity Tracking**
  - Login frequency and patterns
  - Feature usage statistics
  - Active time tracking
  - Action audit trails
  - Session analytics
  - User engagement scores

- **Cost Analytics**
  - API credit consumption tracking
  - Cost per workflow execution
  - Cost trends over time
  - Cost breakdown by action type
  - Projected costs (next 30 days)
  - Budget alerts and thresholds

- **Time-Series Visualization**
  - Interactive line/area charts
  - Customizable date ranges
  - Granularity selection (minute/hour/day)
  - Multi-metric overlay
  - Comparison periods
  - Export chart data

### Should Have (P1)
- **Dashboard Builder**
  - Custom dashboard creation
  - Widget library (charts, tables, metrics)
  - Drag-and-drop layout
  - Dashboard sharing
  - Scheduled dashboard emails
  - Dashboard templates

- **Report Generation**
  - Scheduled reports (daily/weekly/monthly)
  - PDF/CSV export
  - Report templates
  - Custom report builder
  - Email delivery
  - Report history

- **Alerts & Notifications**
  - Threshold-based alerts
  - Anomaly detection
  - Performance degradation alerts
  - Cost spike notifications
  - Alert routing (email, Slack, webhook)

- **Cohort Analysis**
  - User segmentation
  - Workflow cohorts
  - Retention analysis
  - Funnel analysis

### Nice to Have (P2)
- **Advanced Analytics**
  - Predictive analytics (ML-based)
  - Workflow recommendations
  - Optimization suggestions
  - A/B test analysis

- **Embedded Analytics**
  - Embeddable dashboards
  - White-label reports
  - API for custom integrations
  - Real-time data streaming

## Non-Functional Requirements

### Performance
- Dashboard render < 2 seconds
- Query response < 1 second (30-day range)
- Real-time metrics < 5 second delay
- Support 10,000+ concurrent dashboard users

### Security
- Role-based analytics access
- Data anonymization options
- Audit logging for data access
- Encrypted data in transit and at rest

### Scalability
- Handle 1B+ events per day
- 90-day hot storage, 2-year archive
- Auto-scaling for query workloads
- Efficient data aggregation pipelines

### Reliability
- 99.9% analytics availability
- Data backfill for missed events
- Graceful degradation
- No data loss guarantee

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Analytics Frontend                        │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐ │
│  │ Dashboards  │ │   Reports   │ │    Visualizations     │ │
│  └─────────────┘ └─────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Analytics API                            │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐ │
│  │   Query     │ │   Report    │ │       Alert           │ │
│  │   Engine    │ │   Service   │ │      Service          │ │
│  └─────────────┘ └─────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Data Processing Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐ │
│  │   Stream    │ │    Batch    │ │    Aggregation        │ │
│  │  Processor  │ │  Processor  │ │      Engine           │ │
│  └─────────────┘ └─────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Data Storage                            │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐ │
│  │ ClickHouse  │ │    Redis    │ │      S3 (Archive)     │ │
│  │ (Analytics) │ │  (Real-time)│ │                       │ │
│  └─────────────┘ └─────────────┘ └───────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- ClickHouse or TimescaleDB for time-series data
- Redis for real-time metrics caching
- Apache Kafka for event streaming
- S3 for data archival
- Recharts/D3.js for visualizations

### APIs
```typescript
// Execution Statistics
GET /api/v1/analytics/executions
  ?from=&to=&granularity=&groupBy=
GET /api/v1/analytics/executions/summary
GET /api/v1/analytics/executions/errors

// Workflow Performance
GET /api/v1/analytics/workflows/:id/performance
GET /api/v1/analytics/workflows/:id/steps
GET /api/v1/analytics/workflows/comparison
GET /api/v1/analytics/workflows/rankings

// User Activity
GET /api/v1/analytics/activity
GET /api/v1/analytics/activity/users/:id
GET /api/v1/analytics/activity/engagement

// Cost Analytics
GET /api/v1/analytics/costs
GET /api/v1/analytics/costs/breakdown
GET /api/v1/analytics/costs/forecast
PUT /api/v1/analytics/costs/budgets

// Dashboards
GET    /api/v1/analytics/dashboards
POST   /api/v1/analytics/dashboards
PUT    /api/v1/analytics/dashboards/:id
DELETE /api/v1/analytics/dashboards/:id

// Reports
GET    /api/v1/analytics/reports
POST   /api/v1/analytics/reports
GET    /api/v1/analytics/reports/:id/download
```

### Data Models
```typescript
interface ExecutionEvent {
  id: string;
  timestamp: Date;
  workflowId: string;
  workflowVersion: number;
  userId: string;
  triggerId: string;
  triggerType: string;
  status: 'started' | 'completed' | 'failed';
  duration: number; // ms
  stepCount: number;
  errorType: string | null;
  errorMessage: string | null;
  metadata: Record<string, any>;
}

interface StepExecution {
  id: string;
  executionId: string;
  stepId: string;
  stepType: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'completed' | 'failed' | 'skipped';
  inputSize: number;
  outputSize: number;
  creditsUsed: number;
}

interface CostRecord {
  id: string;
  timestamp: Date;
  userId: string;
  workflowId: string;
  executionId: string;
  actionType: string;
  credits: number;
  dollarAmount: number;
  metadata: Record<string, any>;
}

interface UserActivity {
  id: string;
  userId: string;
  timestamp: Date;
  sessionId: string;
  action: string;
  resource: string;
  resourceId: string;
  duration: number;
  metadata: Record<string, any>;
}

interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  isPublic: boolean;
  refreshInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardWidget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'metric' | 'table' | 'heatmap';
  title: string;
  query: WidgetQuery;
  visualization: VisualizationConfig;
  position: { x: number; y: number; w: number; h: number };
}
```

### Aggregation Pipelines
```sql
-- Hourly execution aggregation
INSERT INTO executions_hourly
SELECT
  toStartOfHour(timestamp) as hour,
  workflow_id,
  user_id,
  count() as total_executions,
  countIf(status = 'completed') as successful,
  countIf(status = 'failed') as failed,
  avg(duration) as avg_duration,
  quantile(0.95)(duration) as p95_duration,
  sum(credits_used) as total_credits
FROM execution_events
WHERE timestamp >= now() - INTERVAL 1 HOUR
GROUP BY hour, workflow_id, user_id;

-- Daily cost rollup
INSERT INTO costs_daily
SELECT
  toDate(timestamp) as date,
  user_id,
  sum(credits) as total_credits,
  sum(dollar_amount) as total_cost,
  groupArray(DISTINCT action_type) as action_types
FROM cost_records
WHERE timestamp >= today() - 1
GROUP BY date, user_id;
```

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load Time | < 2 sec | Time to interactive for analytics dashboard |
| Query Response Time | < 1 sec | 30-day range query execution |
| Data Freshness | < 5 min | Lag between event and analytics availability |
| Analytics Uptime | 99.9% | Availability of analytics services |
| Report Generation | < 30 sec | Time to generate standard reports |
| User Engagement | 60%+ | Users accessing analytics weekly |

## Dependencies
- Event tracking infrastructure
- Data warehouse infrastructure
- Visualization library
- PDF generation service
- Email delivery service

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Data volume overwhelming storage | High - Increased costs | Aggressive aggregation, data retention policies |
| Query performance degradation | Medium - Poor UX | Query caching, materialized views, query optimization |
| Real-time data lag | Medium - Stale metrics | Stream processing, cache invalidation |
| Inaccurate cost tracking | High - Billing issues | Event validation, reconciliation jobs |
| Dashboard load time regression | Medium - User abandonment | Performance monitoring, lazy loading |
| Data privacy concerns | High - Compliance risk | Data anonymization, access controls |
