# PRD: Cost Tracking & Budgeting

## Overview
A comprehensive cost tracking and budgeting system that monitors API token usage, Browserbase costs, and other operational expenses. The system provides daily cost summaries, budget allocation tools, and proactive alerts to help users manage and optimize their automation spending.

## Problem Statement
Users of Bottleneck-Bots need visibility and control over their operational costs:
- API calls to LLMs (OpenAI, Anthropic, Google) incur token-based charges
- Browserbase sessions consume compute and bandwidth resources
- Without visibility, costs can spiral unexpectedly
- Users need to allocate budgets across workflows and teams
- Finance teams require accurate cost attribution for reporting

## Goals & Objectives
- **Primary Goals**
  - Provide real-time visibility into all automation costs
  - Enable budget setting and allocation at multiple levels
  - Deliver proactive alerts before budget thresholds are exceeded
  - Generate detailed cost reports for financial analysis

- **Success Metrics**
  - 100% of costs tracked and attributed
  - < 1 minute latency for cost data
  - 50% reduction in unexpected overage incidents
  - 90% of users set at least one budget

## User Stories
- As a **workflow owner**, I want to see the cost of each execution so that I can optimize expensive workflows
- As an **admin**, I want to set monthly budgets so that we don't overspend
- As a **finance manager**, I want daily cost summaries so that I can forecast expenses
- As a **team lead**, I want to allocate budgets to my team so that we stay within department limits
- As a **user**, I want alerts when I'm approaching my budget so that I can take action
- As an **executive**, I want cost trends and projections so that I can plan resources

## Functional Requirements

### Must Have (P0)
- **API Token Usage Tracking**
  - Per-request token counting (input/output tokens)
  - Model-specific pricing calculations
  - Provider breakdown (OpenAI, Anthropic, Google, etc.)
  - Caching to reduce duplicate cost calculations

- **Browserbase Cost Monitoring**
  - Session duration tracking
  - Compute resource usage (CPU, memory)
  - Bandwidth consumption
  - Per-action cost attribution

- **Daily Cost Summaries**
  - Automated daily rollup generation
  - Breakdown by: workflow, user, team, cost type
  - Comparison to previous periods
  - Email delivery option

- **Budget Allocation & Alerts**
  - Organization-level budget caps
  - Team/project budget allocation
  - Workflow-specific budgets
  - Threshold alerts (50%, 75%, 90%, 100%)
  - Hard stop option when budget exhausted

### Should Have (P1)
- Hourly cost tracking and alerts
- Cost forecasting based on usage trends
- Anomaly detection for unusual spending
- Cost optimization recommendations
- Export to accounting systems (CSV, API)
- Custom date range reports

### Nice to Have (P2)
- Real-time cost dashboard with live updates
- Cost allocation tags for custom categorization
- Multi-currency cost display
- Cost comparison across workflow versions
- ROI calculation tools

## Non-Functional Requirements

### Performance
- Cost calculation latency < 100ms
- Daily summary generation < 5 minutes
- Dashboard load time < 2 seconds
- Support for 1M+ cost records per organization

### Accuracy
- Cost calculations accurate to 4 decimal places
- Token counting matches provider billing
- No cost attribution gaps or duplicates

### Scalability
- Time-series data retention for 24 months
- Efficient aggregation for large datasets
- Streaming cost updates for real-time display

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                    Cost Tracking Service                        │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Token      │  │ Browserbase  │  │   Cost               │  │
│  │   Counter    │  │   Tracker    │  │   Calculator         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Budget     │  │    Alert     │  │   Report             │  │
│  │   Manager    │  │   Engine     │  │   Generator          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│           TimescaleDB             │           Redis            │
│     (Time-series cost data)       │    (Real-time counters)    │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **TimescaleDB**: Time-series cost storage and aggregation
- **Redis**: Real-time budget counters and caching
- **Provider APIs**: Cost and pricing information
- **Background Workers**: Daily summary generation
- **Notification Service**: Budget alerts

### APIs
- `GET /costs/current` - Current period costs
- `GET /costs/daily` - Daily cost breakdown
- `GET /costs/by-workflow/{id}` - Costs for specific workflow
- `GET /costs/by-team/{id}` - Team cost summary
- `GET /costs/trends` - Cost trends and projections
- `POST /budgets` - Create budget
- `GET /budgets` - List budgets
- `PUT /budgets/{id}` - Update budget
- `DELETE /budgets/{id}` - Remove budget
- `GET /budgets/{id}/usage` - Budget consumption
- `GET /reports/daily` - Daily cost report
- `POST /reports/custom` - Generate custom report

### Database Schema
```sql
-- Cost Records (TimescaleDB hypertable)
CREATE TABLE cost_records (
  id UUID DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  workflow_id UUID,
  execution_id UUID,
  user_id UUID,
  team_id UUID,
  cost_type VARCHAR(30) NOT NULL, -- api_token, browserbase, storage
  provider VARCHAR(30), -- openai, anthropic, google, browserbase
  resource_details JSONB NOT NULL,
  -- For API tokens:
  -- {model, input_tokens, output_tokens, cached_tokens}
  -- For Browserbase:
  -- {session_id, duration_ms, actions_count, bandwidth_mb}
  unit_cost DECIMAL(10,6) NOT NULL,
  quantity DECIMAL(15,4) NOT NULL,
  total_cost DECIMAL(12,6) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, recorded_at)
);
SELECT create_hypertable('cost_records', 'recorded_at');

-- Daily Cost Summaries (materialized for performance)
CREATE TABLE daily_cost_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  summary_date DATE NOT NULL,
  total_cost DECIMAL(12,4) NOT NULL,
  cost_breakdown JSONB NOT NULL,
  -- {by_type: {}, by_provider: {}, by_workflow: {}, by_user: {}}
  record_count INTEGER NOT NULL,
  period_comparison JSONB, -- {previous_day, previous_week, previous_month}
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, summary_date)
);

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  budget_type VARCHAR(20) NOT NULL, -- organization, team, project, workflow
  target_id UUID, -- team_id, project_id, or workflow_id
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  period VARCHAR(20) NOT NULL, -- daily, weekly, monthly
  period_start DATE NOT NULL,
  alert_thresholds JSONB DEFAULT '[50, 75, 90, 100]',
  hard_stop BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget Usage (daily snapshots)
CREATE TABLE budget_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES budgets(id),
  usage_date DATE NOT NULL,
  amount_used DECIMAL(12,4) NOT NULL,
  percentage_used DECIMAL(5,2) NOT NULL,
  alerts_sent JSONB DEFAULT '[]', -- thresholds that triggered alerts
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(budget_id, usage_date)
);

-- Pricing Configuration
CREATE TABLE cost_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(30) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  model_or_tier VARCHAR(100),
  unit VARCHAR(20) NOT NULL, -- token, minute, mb, action
  price_per_unit DECIMAL(12,8) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, resource_type, model_or_tier, effective_from)
);

-- Cost Alerts
CREATE TABLE cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  budget_id UUID REFERENCES budgets(id),
  alert_type VARCHAR(30) NOT NULL, -- threshold, anomaly, forecast
  threshold_value DECIMAL(5,2),
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Pricing Matrix
```yaml
pricing:
  openai:
    gpt-4-turbo:
      input: 0.00001  # per token
      output: 0.00003
    gpt-4o:
      input: 0.000005
      output: 0.000015
    gpt-3.5-turbo:
      input: 0.0000005
      output: 0.0000015

  anthropic:
    claude-3-opus:
      input: 0.000015
      output: 0.000075
    claude-3-sonnet:
      input: 0.000003
      output: 0.000015
    claude-3-haiku:
      input: 0.00000025
      output: 0.00000125

  browserbase:
    session:
      per_minute: 0.02
    bandwidth:
      per_mb: 0.001
    actions:
      per_action: 0.001
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Cost Attribution Accuracy | 100% | Reconciliation vs provider bills |
| Alert Delivery Time | < 1 minute | Monitoring system |
| Budget Adoption Rate | > 90% of orgs | Product analytics |
| Cost Visibility Satisfaction | > 4.5/5 | User surveys |
| Overage Reduction | 50% decrease | Before/after analysis |
| Report Generation Time | < 30 seconds | System metrics |

## Dependencies
- Provider API access for pricing information
- TimescaleDB for time-series storage
- Background job scheduler
- Notification service (email, in-app, webhooks)
- Charting library for visualizations

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Provider pricing changes | Medium - Incorrect costs | Automated pricing sync, version-controlled pricing tables |
| Token counting mismatch | Medium - Billing disputes | Use provider's tiktoken libraries, regular validation |
| High-volume cost processing | Medium - System lag | Stream processing, batch aggregation, horizontal scaling |
| Budget alert fatigue | Low - Ignored alerts | Customizable thresholds, smart grouping, severity levels |
| Currency fluctuation | Low - Reporting variance | Standardize on USD, offer multi-currency display |
| Historical data growth | Medium - Performance degradation | Data retention policies, automatic archival, efficient aggregation |
