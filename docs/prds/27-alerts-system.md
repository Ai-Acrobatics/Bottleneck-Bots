# PRD-27: Alerts System

**Product Requirements Document**

| Field | Value |
|-------|-------|
| **Document ID** | PRD-27 |
| **Feature Name** | Alerts System |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Engineering Team |
| **Created** | 2026-01-11 |
| **Last Updated** | 2026-01-11 |
| **Priority** | P0 - Critical |
| **Target Release** | v2.0 |
| **Location** | `server/api/routers/alerts.ts` |

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

### 1.1 Executive Summary

The Alerts System provides a comprehensive, configurable alerting infrastructure for Bottleneck-Bots that enables users to define custom alert triggers, receive multi-channel notifications (email, Slack, webhook), manage alert severity levels, implement notification throttling to prevent alert fatigue, and maintain a complete alert history for compliance and troubleshooting. This system serves as the critical notification backbone for the entire platform, ensuring users are promptly informed of important events, system issues, and automation outcomes.

### 1.2 Background

Agency owners and operations teams rely on timely notifications to maintain oversight of their AI-powered automation workflows. Without a robust alerting system, critical issues go unnoticed, automation failures cascade, and users lose confidence in the platform. The current landscape requires proactive notification rather than reactive monitoring.

The Alerts System (`server/api/routers/alerts.ts`) builds upon the existing notification infrastructure while providing advanced features like configurable triggers, intelligent throttling, and multi-channel delivery to meet enterprise-grade requirements.

### 1.3 Key Capabilities

- **Configurable Alert Triggers**: Define conditions based on metrics, events, thresholds, and patterns
- **Multi-Channel Notifications**: Email, Slack, webhook, and in-app notification delivery
- **Alert Severity Levels**: Critical, warning, info, and debug classifications with routing rules
- **Notification Throttling**: Rate limiting and deduplication to prevent alert fatigue
- **Alert History**: Complete audit trail with search, filter, and analytics capabilities
- **Escalation Policies**: Automatic escalation when alerts go unacknowledged
- **Alert Grouping**: Intelligent correlation of related alerts to reduce noise
- **Maintenance Windows**: Scheduled suppression periods for planned downtime

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Pain Point | Impact | Affected Users |
|------------|--------|----------------|
| **Missed Critical Events** | Automation failures go unnoticed for hours | All agency owners |
| **Alert Fatigue** | Too many notifications cause users to ignore alerts | Operations teams |
| **Single Channel Limitation** | Notifications only via dashboard, missed when away | All users |
| **No Severity Classification** | All alerts treated equally, critical issues buried | Operations teams |
| **Lack of Alert History** | Cannot audit past incidents or identify patterns | Compliance officers, admins |
| **No Throttling** | Repeated failures flood notification channels | All users |
| **No Escalation** | Unacknowledged alerts remain unaddressed | Management, SRE teams |

### 2.2 User Needs

1. **Agency Owners** need to receive immediate notifications when critical workflows fail
2. **Operations Managers** need configurable thresholds to catch issues before they impact clients
3. **On-Call Engineers** need escalation policies that ensure alerts reach the right person
4. **Compliance Officers** need comprehensive alert history for audit requirements
5. **Developers** need webhook integrations to connect alerts to existing incident management tools
6. **Team Leads** need alert grouping to understand incident scope without notification overload

### 2.3 Business Drivers

- **Reduced Downtime**: Early detection reduces mean time to detection (MTTD) by 80%
- **Improved Reliability**: Proactive alerting increases platform trust and retention
- **Enterprise Readiness**: Advanced alerting features required for enterprise sales
- **Compliance Requirements**: Audit trails necessary for SOC 2 and GDPR compliance
- **Cost Reduction**: Automated alerting reduces manual monitoring overhead
- **Customer Satisfaction**: Faster incident resolution improves NPS scores

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Target |
|------|-------------|--------|
| **G1** | Enable configurable alert triggers across all system metrics | 50+ trigger types supported |
| **G2** | Implement reliable multi-channel notification delivery | 99.9% delivery success rate |
| **G3** | Provide intelligent throttling to prevent alert fatigue | 70% reduction in redundant alerts |
| **G4** | Maintain comprehensive alert history for compliance | 90-day retention, full searchability |
| **G5** | Support escalation policies for critical alerts | <15 min escalation time |
| **G6** | Enable real-time alert dashboard and analytics | <1 second dashboard refresh |

### 3.2 Success Metrics

#### 3.2.1 Quantitative Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **Mean Time to Detection** | N/A | <2 minutes | Time from event to alert delivery |
| **Notification Delivery Rate** | N/A | >99.9% | Channel delivery confirmation |
| **False Positive Rate** | N/A | <5% | User feedback, auto-resolution analysis |
| **Alert Acknowledgment Time** | N/A | <5 minutes for critical | Timestamp tracking |
| **Throttling Effectiveness** | N/A | 70% noise reduction | Before/after alert volume comparison |
| **User Adoption** | 0% | 85% of active users | Users with configured alerts |
| **Alert Resolution Rate** | N/A | 95% within SLA | Resolution timestamp analysis |

#### 3.2.2 Qualitative Metrics

- User satisfaction with alert configuration experience
- Developer satisfaction with webhook integration documentation
- Reduction in support tickets related to missed notifications
- Improvement in incident postmortem efficiency

### 3.3 Key Performance Indicators (KPIs)

1. **Active Alert Rules**: Number of configured and enabled alert rules per user
2. **Alert Volume**: Total alerts generated per day by severity
3. **Delivery Latency**: Time from trigger to notification delivery (p50, p95, p99)
4. **Acknowledgment Rate**: Percentage of critical alerts acknowledged within SLA
5. **Escalation Rate**: Percentage of alerts requiring escalation
6. **Channel Preference**: Distribution of notifications across channels
7. **Throttle Effectiveness**: Ratio of suppressed to delivered alerts

---

## 4. User Stories

### 4.1 Alert Configuration Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-01 | Agency Owner | As an agency owner, I want to create custom alert rules based on workflow metrics so that I know when my automations fail | P0 |
| US-02 | Operations Manager | As an operations manager, I want to set threshold-based alerts so that I'm notified when error rates exceed acceptable limits | P0 |
| US-03 | Developer | As a developer, I want to configure pattern-based alerts so that I can detect anomalies in system behavior | P1 |
| US-04 | Agency Owner | As an agency owner, I want to assign severity levels to alerts so that I can prioritize my attention | P0 |
| US-05 | Team Lead | As a team lead, I want to create alert templates so that my team can quickly set up standard monitoring | P2 |
| US-06 | Admin | As an admin, I want to set organization-wide alert policies so that compliance requirements are met | P1 |

### 4.2 Notification Channel Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-07 | Agency Owner | As an agency owner, I want to receive email notifications for alerts so that I'm informed when away from the dashboard | P0 |
| US-08 | Developer | As a developer, I want to receive Slack notifications in my team channel so that alerts are visible to the whole team | P0 |
| US-09 | DevOps Engineer | As a DevOps engineer, I want to configure webhook notifications so that alerts integrate with PagerDuty/Opsgenie | P0 |
| US-10 | Agency Owner | As an agency owner, I want in-app notifications with sound alerts so that I don't miss critical issues | P1 |
| US-11 | Team Member | As a team member, I want to configure my notification preferences per channel so that I receive alerts where I prefer | P1 |
| US-12 | Manager | As a manager, I want to configure channel routing by severity so that critical alerts go to all channels while info alerts only go to email | P1 |

### 4.3 Throttling & Grouping Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-13 | Operations Manager | As an operations manager, I want notification throttling so that I'm not overwhelmed by repeated alerts for the same issue | P0 |
| US-14 | On-Call Engineer | As an on-call engineer, I want alert grouping so that related alerts are consolidated into a single notification | P1 |
| US-15 | Agency Owner | As an agency owner, I want to configure quiet hours so that non-critical alerts don't disturb me at night | P2 |
| US-16 | Admin | As an admin, I want to set maintenance windows so that alerts are suppressed during planned downtime | P1 |
| US-17 | Operations Manager | As an operations manager, I want deduplication rules so that identical alerts don't create multiple notifications | P0 |

### 4.4 Alert History & Analytics Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-18 | Compliance Officer | As a compliance officer, I want complete alert history so that I can audit past incidents | P0 |
| US-19 | Operations Manager | As an operations manager, I want to search and filter alert history so that I can investigate patterns | P1 |
| US-20 | Agency Owner | As an agency owner, I want alert analytics dashboards so that I can understand my system's health trends | P1 |
| US-21 | Admin | As an admin, I want to export alert data so that I can include it in compliance reports | P1 |
| US-22 | Developer | As a developer, I want to view alert correlation data so that I can identify root causes | P2 |

### 4.5 Escalation Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-23 | Team Lead | As a team lead, I want escalation policies so that unacknowledged critical alerts reach backup responders | P0 |
| US-24 | Manager | As a manager, I want to define escalation chains so that alerts follow our incident response process | P1 |
| US-25 | On-Call Engineer | As an on-call engineer, I want to acknowledge alerts so that escalation is stopped | P0 |
| US-26 | Admin | As an admin, I want escalation audit trails so that I can review response times | P1 |

---

## 5. Functional Requirements

### 5.1 Alert Rule Management

#### FR-01: Alert Rule Creation

- **Description**: Users can create alert rules with configurable triggers, conditions, and actions
- **Input**: Rule name, trigger type, conditions, severity, notification channels, metadata
- **Output**: Created alert rule with unique identifier
- **Business Rules**:
  - Maximum 100 alert rules per user (configurable by plan)
  - Rules must have at least one notification channel
  - Severity is required (critical, warning, info, debug)
  - Rules can be enabled/disabled without deletion

#### FR-02: Trigger Types

| Trigger Type | Description | Example |
|--------------|-------------|---------|
| **Threshold** | Numeric value exceeds/falls below limit | Error rate > 5% |
| **Pattern** | Regex or text pattern match | Log contains "FATAL" |
| **Event** | Specific event occurrence | Workflow failed |
| **Absence** | Expected event doesn't occur | No heartbeat in 5 min |
| **Rate Change** | Metric changes by percentage | CPU usage +50% |
| **Composite** | Multiple conditions combined | Error rate > 5% AND response time > 2s |
| **Scheduled** | Time-based checks | Daily at 9 AM check backup status |
| **Anomaly** | ML-detected deviation from baseline | Unusual traffic pattern |

#### FR-03: Alert Rule Operations

| Operation | Description | Access Level |
|-----------|-------------|--------------|
| **Create** | Create new alert rule | User, Admin |
| **Read** | View alert rule details | User, Admin |
| **Update** | Modify rule configuration | User (own rules), Admin |
| **Delete** | Remove alert rule | User (own rules), Admin |
| **Enable/Disable** | Toggle rule active status | User (own rules), Admin |
| **Clone** | Duplicate rule with modifications | User, Admin |
| **Test** | Trigger test alert | User (own rules), Admin |
| **Export** | Export rule configuration | User, Admin |

#### FR-04: Alert Conditions

```typescript
interface AlertCondition {
  field: string;           // Metric or event field to evaluate
  operator: ConditionOperator;
  value: string | number;
  duration?: number;       // Condition must persist for X seconds
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
  window?: number;         // Aggregation window in seconds
}

type ConditionOperator =
  | 'eq' | 'neq'           // Equal, not equal
  | 'gt' | 'gte'           // Greater than, greater or equal
  | 'lt' | 'lte'           // Less than, less or equal
  | 'contains' | 'not_contains'
  | 'matches' | 'not_matches'  // Regex
  | 'in' | 'not_in'        // In list
  | 'exists' | 'not_exists';
```

### 5.2 Notification Channels

#### FR-05: Email Notifications

| Feature | Description | Configuration |
|---------|-------------|---------------|
| **Recipients** | One or more email addresses | Comma-separated or array |
| **Subject Template** | Customizable subject line | Variables: `{{severity}}`, `{{rule_name}}`, `{{message}}` |
| **Body Template** | HTML or plain text body | Full variable support |
| **Attachments** | Include context data | JSON, CSV export options |
| **Reply-To** | Configure reply address | Per-rule configuration |

#### FR-06: Slack Notifications

| Feature | Description | Configuration |
|---------|-------------|---------------|
| **Webhook URL** | Slack incoming webhook | Encrypted storage |
| **Channel Override** | Specify channel in payload | Optional, uses webhook default |
| **Message Template** | Rich Slack message format | Block Kit support |
| **Mention Users** | @user or @channel mentions | User IDs or @here/@channel |
| **Thread Replies** | Group related alerts in threads | Parent message ID tracking |
| **Buttons** | Acknowledge/silence actions | Interactive components |

#### FR-07: Webhook Notifications

| Feature | Description | Configuration |
|---------|-------------|---------------|
| **URL** | Destination endpoint | HTTPS required for production |
| **Method** | HTTP method | POST, PUT supported |
| **Headers** | Custom headers | Key-value pairs, auth headers |
| **Authentication** | Auth mechanism | None, Bearer, API Key, HMAC |
| **Payload Template** | Custom JSON payload | Full variable interpolation |
| **Retry Policy** | Failure handling | Configurable attempts and backoff |
| **Timeout** | Request timeout | 5-60 seconds, default 30s |

#### FR-08: In-App Notifications

| Feature | Description | Configuration |
|---------|-------------|---------------|
| **Toast Notifications** | Real-time pop-ups | Duration, position |
| **Notification Center** | Persistent notification list | Read/unread status |
| **Sound Alerts** | Audio notification | Per-severity sounds |
| **Badge Count** | Unread count indicator | Critical vs total |
| **Desktop Push** | Browser push notifications | Requires permission |

#### FR-09: Channel Configuration

```typescript
interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'in_app' | 'sms' | 'pagerduty';
  name: string;
  enabled: boolean;
  config: ChannelConfig;
  severityFilter?: AlertSeverity[];  // Only send these severities
  throttleConfig?: ThrottleConfig;
  schedule?: NotificationSchedule;   // When channel is active
}

interface ChannelConfig {
  // Email
  recipients?: string[];
  subjectTemplate?: string;
  bodyTemplate?: string;

  // Slack
  webhookUrl?: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;

  // Webhook
  url?: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  authType?: 'none' | 'bearer' | 'api_key' | 'hmac';
  authToken?: string;
  payloadTemplate?: string;

  // PagerDuty
  integrationKey?: string;
  severity?: 'critical' | 'error' | 'warning' | 'info';
}
```

### 5.3 Alert Severity Levels

#### FR-10: Severity Definitions

| Severity | Description | Default Behavior |
|----------|-------------|------------------|
| **Critical** | Immediate action required | All channels, no throttling, auto-escalate |
| **Warning** | Attention needed soon | Email + Slack, standard throttle |
| **Info** | Informational notification | Email only, aggressive throttle |
| **Debug** | Diagnostic data | In-app only, high throttle |

#### FR-11: Severity-Based Routing

```typescript
interface SeverityRouting {
  severity: AlertSeverity;
  channels: string[];           // Channel IDs to notify
  escalationPolicy?: string;    // Escalation policy ID
  throttleMultiplier?: number;  // Adjust throttle for severity
  requireAcknowledgment?: boolean;
  autoResolveAfter?: number;    // Seconds to auto-resolve
}
```

### 5.4 Notification Throttling

#### FR-12: Throttle Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| **Rate Limit** | Max notifications per window | 10 per hour |
| **Window Duration** | Throttle window size | 1 hour |
| **Cooldown Period** | Min time between notifications | 5 minutes |
| **Aggregation** | Combine multiple alerts | Group by rule or source |
| **Reset On Resolve** | Clear throttle when resolved | true |
| **Severity Override** | Critical bypasses throttle | true |

#### FR-13: Deduplication Rules

```typescript
interface DeduplicationConfig {
  enabled: boolean;
  window: number;              // Dedup window in seconds
  fields: string[];            // Fields to match for dedup
  action: 'discard' | 'update' | 'count';
  countThreshold?: number;     // Alert after N duplicates
}
```

#### FR-14: Alert Grouping

| Grouping Strategy | Description | Use Case |
|-------------------|-------------|----------|
| **By Rule** | Group alerts from same rule | Reduce rule-specific noise |
| **By Source** | Group by source system | Aggregate service alerts |
| **By Time** | Group within time window | Batch notifications |
| **By Correlation** | Group by correlation ID | Track related incidents |
| **Smart Grouping** | ML-based correlation | Automatic pattern detection |

### 5.5 Alert History

#### FR-15: History Storage

```typescript
interface AlertHistoryEntry {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  details: Record<string, any>;
  source: AlertSource;

  // Timestamps
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;

  // Users
  acknowledgedBy?: string;
  resolvedBy?: string;

  // Notifications
  notificationsSent: NotificationRecord[];

  // Grouping
  groupId?: string;
  correlationId?: string;
  parentAlertId?: string;
  childAlertCount?: number;

  // Metadata
  tags: string[];
  metadata: Record<string, any>;
}

type AlertStatus = 'firing' | 'acknowledged' | 'resolved' | 'suppressed' | 'expired';
```

#### FR-16: History Operations

| Operation | Description | Parameters |
|-----------|-------------|------------|
| **List** | Paginated alert history | Filters, sorting, pagination |
| **Search** | Full-text search | Query string, date range |
| **Get** | Single alert details | Alert ID |
| **Acknowledge** | Mark alert acknowledged | Alert ID, user, note |
| **Resolve** | Mark alert resolved | Alert ID, user, resolution |
| **Suppress** | Suppress alert | Alert ID, duration, reason |
| **Bulk Update** | Update multiple alerts | Alert IDs, action |
| **Export** | Export history data | Format, filters, date range |

#### FR-17: Retention Policy

| Retention Level | Duration | Data |
|-----------------|----------|------|
| **Full Detail** | 30 days | All alert data |
| **Summary** | 90 days | Aggregated metrics |
| **Archive** | 1 year | Compliance-required fields |
| **Custom** | Configurable | Per-severity retention |

### 5.6 Escalation Policies

#### FR-18: Escalation Configuration

```typescript
interface EscalationPolicy {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;

  steps: EscalationStep[];
  repeatAfter?: number;        // Repeat escalation after X seconds
  maxRepeats?: number;         // Maximum repeat cycles
  stopOnAcknowledge: boolean;
}

interface EscalationStep {
  order: number;
  delaySeconds: number;        // Wait before this step
  channels: string[];          // Notification channels
  users?: string[];            // Specific users to notify
  teams?: string[];            // Teams to notify
  notifyAll: boolean;          // Notify all or first responder
}
```

#### FR-19: Escalation Triggers

| Trigger | Description | Configuration |
|---------|-------------|---------------|
| **No Acknowledgment** | Alert not acknowledged | Timeout in seconds |
| **No Resolution** | Alert not resolved | Timeout in seconds |
| **Severity Upgrade** | Condition worsens | Threshold change |
| **Time-Based** | Business hours exceeded | Schedule configuration |
| **Manual** | User-triggered | Button/API call |

### 5.7 Maintenance Windows

#### FR-20: Maintenance Window Configuration

```typescript
interface MaintenanceWindow {
  id: string;
  name: string;
  description?: string;

  // Schedule
  schedule: {
    type: 'once' | 'recurring';
    startTime: Date;
    endTime: Date;
    timezone: string;
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      daysOfWeek?: number[];
      dayOfMonth?: number;
    };
  };

  // Scope
  scope: {
    allAlerts: boolean;
    ruleIds?: string[];
    severities?: AlertSeverity[];
    sources?: string[];
    tags?: string[];
  };

  // Behavior
  suppressAlerts: boolean;      // Suppress firing
  suppressNotifications: boolean; // Allow firing, suppress notif
  resumeOnEnd: boolean;         // Send suppressed alerts when ended

  // Metadata
  createdBy: string;
  createdAt: Date;
  active: boolean;
}
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-01**: Alert evaluation latency | <100ms p95 | APM metrics |
| **NFR-02**: Notification dispatch latency | <500ms p95 | End-to-end timing |
| **NFR-03**: Alert throughput | 10,000 alerts/min per instance | Load testing |
| **NFR-04**: History query performance | <200ms p95 | Query profiling |
| **NFR-05**: Dashboard refresh rate | <1 second | Client-side metrics |
| **NFR-06**: Webhook delivery timeout | 30 seconds max | Delivery logs |

### 6.2 Scalability

| Requirement | Target | Approach |
|-------------|--------|----------|
| **NFR-07**: Horizontal scaling | Auto-scale to 20 instances | Kubernetes HPA |
| **NFR-08**: Alert queue depth | Handle 100K queued alerts | Redis/SQS queue |
| **NFR-09**: Concurrent evaluations | 1000 concurrent rule checks | Worker pool |
| **NFR-10**: History storage | 100M+ alerts per account | Partitioned tables |
| **NFR-11**: Channel connections | 10K concurrent webhooks | Connection pooling |

### 6.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **NFR-12**: System uptime | 99.99% | Multi-AZ deployment |
| **NFR-13**: Alert durability | No alert loss | Persistent queue, WAL |
| **NFR-14**: Delivery guarantee | At-least-once | Retry with idempotency |
| **NFR-15**: Failover recovery | <10 seconds | Health checks, auto-restart |
| **NFR-16**: Data consistency | Strong for critical alerts | Transaction isolation |

### 6.4 Security

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-17**: Credential encryption | Encrypt channel configs at rest | AES-256-GCM |
| **NFR-18**: Webhook signing | Sign outbound webhooks | HMAC-SHA256 |
| **NFR-19**: Access control | Role-based permissions | RBAC implementation |
| **NFR-20**: Audit logging | Log all alert operations | Immutable audit log |
| **NFR-21**: Input validation | Prevent injection attacks | Zod schemas, sanitization |
| **NFR-22**: Rate limiting | Prevent abuse | Per-user, per-IP limits |

### 6.5 Compliance

| Requirement | Description |
|-------------|-------------|
| **NFR-23**: GDPR compliance | Support data deletion, export |
| **NFR-24**: SOC 2 Type II | Audit logs, access controls, encryption |
| **NFR-25**: Data residency | Regional data storage options |
| **NFR-26**: Retention policies | Configurable, enforceable retention |

### 6.6 Observability

| Requirement | Target | Tools |
|-------------|--------|-------|
| **NFR-27**: Structured logging | All operations logged | Pino/Winston |
| **NFR-28**: Metrics collection | 100+ custom metrics | Prometheus/Datadog |
| **NFR-29**: Distributed tracing | End-to-end trace IDs | OpenTelemetry |
| **NFR-30**: Self-monitoring | Alert on alert system health | Meta-alerting |

---

## 7. Technical Architecture

### 7.1 System Components

```
+------------------+     +-------------------+     +------------------+
|  Event Sources   |---->|  Event Ingestion  |---->|  Message Queue   |
|  (Metrics, Logs, |     |  API Gateway      |     |  (Redis/SQS)     |
|   Webhooks)      |     +-------------------+     +--------+---------+
+------------------+                                        |
                                                            v
+------------------+     +-------------------+     +------------------+
|  Alert Rules     |<----|  Rule Evaluator   |<----|  Event Processor |
|  Database        |     |  (Workers)        |     |  (Background)    |
+------------------+     +-------------------+     +------------------+
                                |
                                v
                    +-----------------------+
                    |  Throttle & Dedup     |
                    |  Engine               |
                    +-----------+-----------+
                                |
                                v
+------------------+     +-------------------+     +------------------+
|  Alert History   |<----|  Alert Manager    |---->|  Notification    |
|  (PostgreSQL)    |     |  (State Machine)  |     |  Dispatcher      |
+------------------+     +-------------------+     +--------+---------+
                                |                          |
                                v                          v
                    +-------------------+     +------------------+
                    |  Escalation       |     |  Channel Adapters|
                    |  Engine           |     |  (Email, Slack,  |
                    +-------------------+     |   Webhook)       |
                                              +------------------+
```

### 7.2 Database Schema

#### 7.2.1 Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `alert_rules` | Alert rule definitions | userId, name, trigger, conditions, severity |
| `alert_instances` | Triggered alert records | ruleId, status, triggeredAt, resolvedAt |
| `notification_channels` | Channel configurations | userId, type, config, enabled |
| `notification_logs` | Delivery audit trail | alertId, channelId, status, sentAt |
| `escalation_policies` | Escalation definitions | name, steps, repeatConfig |
| `maintenance_windows` | Suppression periods | schedule, scope, active |
| `alert_groups` | Grouped alerts | groupKey, alertIds, status |
| `throttle_state` | Throttle tracking | ruleId, channelId, windowStart, count |

#### 7.2.2 Schema Definitions

```typescript
// alert_rules table
interface AlertRuleSchema {
  id: string;                    // UUID primary key
  userId: string;                // Foreign key to users
  name: string;                  // Rule display name
  description?: string;          // Optional description

  // Trigger configuration
  triggerType: TriggerType;
  conditions: AlertCondition[];  // JSONB
  conditionLogic: 'and' | 'or';

  // Alert settings
  severity: AlertSeverity;
  message: string;               // Alert message template
  tags: string[];                // JSONB array

  // Notification settings
  channelIds: string[];          // Foreign keys to notification_channels
  escalationPolicyId?: string;   // Foreign key to escalation_policies

  // Throttling
  throttleConfig: ThrottleConfig; // JSONB

  // State
  enabled: boolean;
  lastTriggeredAt?: Date;
  lastEvaluatedAt?: Date;

  // Metadata
  metadata: Record<string, any>; // JSONB
  createdAt: Date;
  updatedAt: Date;
}

// alert_instances table
interface AlertInstanceSchema {
  id: string;
  ruleId: string;
  userId: string;

  // Alert content
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  details: Record<string, any>;  // JSONB

  // Lifecycle timestamps
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  suppressedAt?: Date;
  expiredAt?: Date;

  // Users
  acknowledgedBy?: string;
  resolvedBy?: string;

  // Resolution
  resolution?: string;
  resolutionType?: 'manual' | 'auto' | 'timeout';

  // Grouping
  groupId?: string;
  correlationId?: string;

  // Indexing
  tags: string[];
  source: string;

  createdAt: Date;
  updatedAt: Date;
}

// notification_channels table
interface NotificationChannelSchema {
  id: string;
  userId: string;

  type: ChannelType;
  name: string;
  enabled: boolean;

  // Encrypted configuration
  config: EncryptedChannelConfig; // JSONB, encrypted

  // Filtering
  severityFilter?: AlertSeverity[];

  // Throttling
  throttleConfig?: ThrottleConfig;

  // Schedule
  schedule?: NotificationSchedule;

  // Statistics
  lastUsedAt?: Date;
  totalSent: number;
  totalFailed: number;

  createdAt: Date;
  updatedAt: Date;
}
```

#### 7.2.3 Index Strategy

```sql
-- Alert rules queries
CREATE INDEX alert_rules_user_id_idx ON alert_rules(userId);
CREATE INDEX alert_rules_enabled_idx ON alert_rules(enabled) WHERE enabled = true;
CREATE INDEX alert_rules_severity_idx ON alert_rules(severity);

-- Alert instances queries (most common access patterns)
CREATE INDEX alert_instances_user_status_idx ON alert_instances(userId, status);
CREATE INDEX alert_instances_rule_triggered_idx ON alert_instances(ruleId, triggeredAt DESC);
CREATE INDEX alert_instances_severity_status_idx ON alert_instances(severity, status);
CREATE INDEX alert_instances_triggered_at_idx ON alert_instances(triggeredAt DESC);
CREATE INDEX alert_instances_group_id_idx ON alert_instances(groupId) WHERE groupId IS NOT NULL;

-- Notification logs for delivery tracking
CREATE INDEX notification_logs_alert_id_idx ON notification_logs(alertId);
CREATE INDEX notification_logs_status_idx ON notification_logs(status, createdAt DESC);
CREATE INDEX notification_logs_channel_id_idx ON notification_logs(channelId, createdAt DESC);

-- Throttle state for rate limiting
CREATE UNIQUE INDEX throttle_state_key_idx ON throttle_state(ruleId, channelId, windowStart);

-- Full-text search on alerts
CREATE INDEX alert_instances_message_search_idx ON alert_instances USING gin(to_tsvector('english', message));
```

### 7.3 API Endpoints

#### 7.3.1 tRPC Router (Protected)

| Procedure | Type | Description |
|-----------|------|-------------|
| `alerts.rules.create` | Mutation | Create new alert rule |
| `alerts.rules.list` | Query | List user's alert rules |
| `alerts.rules.get` | Query | Get rule details |
| `alerts.rules.update` | Mutation | Update rule configuration |
| `alerts.rules.delete` | Mutation | Delete alert rule |
| `alerts.rules.enable` | Mutation | Enable/disable rule |
| `alerts.rules.test` | Mutation | Test alert rule |
| `alerts.rules.clone` | Mutation | Clone existing rule |
| `alerts.channels.create` | Mutation | Create notification channel |
| `alerts.channels.list` | Query | List notification channels |
| `alerts.channels.update` | Mutation | Update channel config |
| `alerts.channels.delete` | Mutation | Delete channel |
| `alerts.channels.test` | Mutation | Test channel delivery |
| `alerts.history.list` | Query | List alert history (paginated) |
| `alerts.history.get` | Query | Get alert details |
| `alerts.history.acknowledge` | Mutation | Acknowledge alert |
| `alerts.history.resolve` | Mutation | Resolve alert |
| `alerts.history.suppress` | Mutation | Suppress alert |
| `alerts.history.bulkAction` | Mutation | Bulk update alerts |
| `alerts.history.search` | Query | Search alerts |
| `alerts.history.export` | Query | Export alert data |
| `alerts.escalation.create` | Mutation | Create escalation policy |
| `alerts.escalation.list` | Query | List escalation policies |
| `alerts.escalation.update` | Mutation | Update policy |
| `alerts.escalation.delete` | Mutation | Delete policy |
| `alerts.maintenance.create` | Mutation | Create maintenance window |
| `alerts.maintenance.list` | Query | List maintenance windows |
| `alerts.maintenance.update` | Mutation | Update window |
| `alerts.maintenance.delete` | Mutation | Delete window |
| `alerts.stats.summary` | Query | Alert statistics summary |
| `alerts.stats.trends` | Query | Alert trend data |

#### 7.3.2 REST Endpoints (Internal)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/alerts/webhook/trigger` | POST | Internal alert trigger endpoint |
| `/api/alerts/health` | GET | Alert system health check |
| `/api/alerts/metrics` | GET | Prometheus metrics endpoint |

#### 7.3.3 WebSocket Events (Real-time)

| Event | Direction | Description |
|-------|-----------|-------------|
| `alert:fired` | Server -> Client | New alert triggered |
| `alert:acknowledged` | Server -> Client | Alert acknowledged |
| `alert:resolved` | Server -> Client | Alert resolved |
| `alert:escalated` | Server -> Client | Alert escalated |
| `alert:suppressed` | Server -> Client | Alert suppressed |

### 7.4 Notification Delivery Pipeline

```
1. Alert Triggered
   ├─> Write to alert_instances table
   ├─> Check maintenance windows
   │   └─> If active: mark suppressed, exit
   ├─> Check throttle state
   │   └─> If throttled: update count, exit
   └─> Continue to dispatch

2. Notification Dispatch
   ├─> Get rule's notification channels
   ├─> For each channel:
   │   ├─> Check channel-level throttle
   │   ├─> Check severity filter
   │   ├─> Check schedule (quiet hours)
   │   ├─> Apply message template
   │   └─> Queue for delivery
   └─> Start escalation timer (if applicable)

3. Channel Delivery (per channel type)
   ├─> Email:
   │   ├─> Render HTML template
   │   ├─> Send via SMTP/API
   │   └─> Log delivery status
   ├─> Slack:
   │   ├─> Build Block Kit message
   │   ├─> POST to webhook URL
   │   └─> Log delivery status
   ├─> Webhook:
   │   ├─> Build JSON payload
   │   ├─> Sign with HMAC (if configured)
   │   ├─> POST to endpoint
   │   ├─> Handle response/retry
   │   └─> Log delivery status
   └─> In-App:
       ├─> Write to notification store
       ├─> Push via WebSocket
       └─> Update badge count

4. Delivery Retry (on failure)
   ├─> Check retry count
   ├─> Calculate backoff delay
   ├─> Re-queue for delivery
   └─> After max retries: log as failed
```

### 7.5 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **API Framework** | tRPC + Express | Type-safe APIs, real-time support |
| **Database** | PostgreSQL + Drizzle | JSONB support, strong indexing |
| **Queue** | Redis (BullMQ) | Job processing, rate limiting, pub/sub |
| **Real-time** | Socket.io | WebSocket + fallback support |
| **Email** | SendGrid/Resend | High deliverability, templates |
| **Slack** | Slack Incoming Webhooks | Native integration, Block Kit |
| **Monitoring** | Datadog/Prometheus | Metrics, tracing, alerting |
| **Search** | PostgreSQL FTS / Elasticsearch | Full-text search on history |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Component | Impact |
|------------|-----------|--------|
| User Authentication | `schema-auth.ts` | User identity for rules/channels |
| Metrics System | `metrics-collector.ts` | Event data for triggers |
| Notification System | `schema-alerts.ts` | Base notification infrastructure |
| WebSocket Service | `socket-server.ts` | Real-time alert delivery |
| Health Monitoring | `health-router.ts` | System metric triggers |
| Workflow Engine | `workflow-executor.ts` | Workflow event triggers |

### 8.2 External Dependencies

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| BullMQ | ^4.x | Job queue for notifications | Low |
| SendGrid | ^7.x | Email delivery | Medium |
| Slack SDK | ^6.x | Slack message formatting | Low |
| Zod | ^3.x | Input validation | Low |
| date-fns-tz | ^2.x | Timezone handling | Low |
| handlebars | ^4.x | Template rendering | Low |
| crypto (Node) | Built-in | HMAC signing | None |

### 8.3 Infrastructure Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| PostgreSQL | Alert storage, history | None (required) |
| Redis | Queue, throttle state, pub/sub | In-memory (degraded) |
| SMTP/SendGrid | Email delivery | Queue for retry |
| Slack API | Slack notifications | Queue for retry |

---

## 9. Out of Scope

### 9.1 Explicitly Excluded

| Item | Reason | Future Phase |
|------|--------|--------------|
| SMS Notifications | Carrier costs, complexity | v2.5 |
| Voice Call Alerts | Twilio voice integration needed | v3.0 |
| AI-Powered Alerting | ML model training required | v3.0 |
| Cross-Tenant Alerting | Enterprise feature | v3.0 |
| Alert Runbooks | Separate documentation system | v2.5 |
| Incident Management | Integrate with external tools | v2.5 |
| Custom Alert Dashboards | Dashboard builder feature | v3.0 |

### 9.2 Deferred Features

| Feature | Priority | Target Release |
|---------|----------|----------------|
| PagerDuty Integration | P1 | v2.2 |
| Opsgenie Integration | P1 | v2.2 |
| Microsoft Teams | P2 | v2.3 |
| Alert Playbooks | P2 | v2.3 |
| Anomaly Detection | P2 | v3.0 |
| Alert Correlation ML | P3 | v3.0 |
| Custom Severity Levels | P3 | v2.5 |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1**: Notification delivery failures | Medium | High | Multi-provider fallback, retry queue |
| **R2**: Rule evaluation performance | Medium | High | Caching, async processing, query optimization |
| **R3**: Alert storm (cascading failures) | Medium | Critical | Circuit breakers, global rate limits |
| **R4**: Throttle state inconsistency | Low | Medium | Redis persistence, state recovery |
| **R5**: Channel credential exposure | Low | Critical | Encryption, secret rotation |
| **R6**: History storage growth | High | Medium | Partitioning, retention policies, archiving |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R7**: Low user adoption | Medium | High | Onboarding wizard, templates, documentation |
| **R8**: Alert fatigue complaints | High | Medium | Intelligent defaults, throttling guidance |
| **R9**: Support burden | Medium | Medium | Self-service tools, troubleshooting guides |
| **R10**: Competitor parity | Medium | Medium | Unique features, rapid iteration |

### 10.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R11**: Channel provider outages | Medium | High | Multi-provider support, graceful degradation |
| **R12**: Database performance | Medium | High | Query optimization, read replicas, caching |
| **R13**: Alert loop (self-alerting) | Low | Medium | Meta-alert detection, circuit breaker |

### 10.4 Risk Matrix

```
Impact      Critical |     R3, R5    |
            High     |  R6           |     R1, R2, R7, R11, R12
            Medium   |               |     R4, R8, R9, R10, R13
            Low      |               |
                     +--------------+-----------------
                        Low            Medium    High
                              Probability
```

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Infrastructure (Weeks 1-2)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M1.1** | Database schema and migrations | Tables, indexes, types | Backend |
| **M1.2** | Alert rule CRUD operations | tRPC router, validation | Backend |
| **M1.3** | Basic notification channels | Email, in-app channels | Backend |
| **M1.4** | Unit tests for core | 80% coverage | QA |

### 11.2 Phase 2: Trigger & Evaluation Engine (Weeks 3-4)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M2.1** | Threshold trigger implementation | Metric evaluation engine | Backend |
| **M2.2** | Event trigger implementation | Event stream processing | Backend |
| **M2.3** | Pattern trigger implementation | Regex/text matching | Backend |
| **M2.4** | Composite conditions | AND/OR logic support | Backend |

### 11.3 Phase 3: Multi-Channel Delivery (Weeks 5-6)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M3.1** | Slack channel integration | Webhook delivery, Block Kit | Backend |
| **M3.2** | Webhook channel integration | Auth, signing, retry | Backend |
| **M3.3** | Template engine | Variable interpolation | Backend |
| **M3.4** | Delivery logging | Audit trail, debugging | Backend |

### 11.4 Phase 4: Throttling & Severity (Weeks 7-8)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M4.1** | Throttle engine | Rate limiting, dedup | Backend |
| **M4.2** | Severity routing | Channel routing by severity | Backend |
| **M4.3** | Alert grouping | Correlation, aggregation | Backend |
| **M4.4** | Performance optimization | Load testing, tuning | Backend |

### 11.5 Phase 5: History & Escalation (Weeks 9-10)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M5.1** | Alert history storage | Full lifecycle tracking | Backend |
| **M5.2** | Search and filtering | Full-text search, filters | Backend |
| **M5.3** | Escalation policies | Multi-step escalation | Backend |
| **M5.4** | Maintenance windows | Suppression periods | Backend |

### 11.6 Phase 6: UI & Launch (Weeks 11-12)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M6.1** | Alert configuration UI | Rule builder, channel setup | Frontend |
| **M6.2** | Alert dashboard | Real-time view, history | Frontend |
| **M6.3** | Documentation | API docs, user guides | Tech Writer |
| **M6.4** | Beta launch | Limited user rollout | Product |

### 11.7 Gantt Chart

```
Week:        1    2    3    4    5    6    7    8    9    10   11   12
Phase 1:     ████████
Phase 2:               ████████
Phase 3:                         ████████
Phase 4:                                   ████████
Phase 5:                                             ████████
Phase 6:                                                       ████████
```

---

## 12. Acceptance Criteria

### 12.1 Alert Rule Management

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-01** | Users can create, update, delete alert rules | E2E test |
| **AC-02** | Maximum 100 rules per user enforced | Unit test |
| **AC-03** | Rules support all 8 trigger types | Integration test |
| **AC-04** | Composite conditions (AND/OR) work correctly | Unit test |
| **AC-05** | Rule enable/disable doesn't delete history | Database verification |
| **AC-06** | Test alert sends notification without creating history | E2E test |

### 12.2 Notification Channels

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-07** | Email notifications delivered within 30 seconds | Performance test |
| **AC-08** | Slack messages appear with correct formatting | Manual test |
| **AC-09** | Webhook payloads include HMAC signature | Integration test |
| **AC-10** | Failed deliveries retry with exponential backoff | Log verification |
| **AC-11** | Channel credentials are encrypted at rest | Security audit |
| **AC-12** | Test channel function validates configuration | E2E test |

### 12.3 Severity Levels

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-13** | Critical alerts bypass throttling | Integration test |
| **AC-14** | Severity-based routing delivers to correct channels | E2E test |
| **AC-15** | Severity displayed correctly in all notification formats | Manual test |
| **AC-16** | Severity filtering on channels works | Integration test |

### 12.4 Notification Throttling

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-17** | Rate limit enforced per configured window | Load test |
| **AC-18** | Deduplication prevents identical notifications | Integration test |
| **AC-19** | Throttle state resets on alert resolution | Unit test |
| **AC-20** | Alert grouping consolidates related alerts | Integration test |
| **AC-21** | Throttled alerts logged for audit | Log verification |

### 12.5 Alert History

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-22** | All alerts stored with complete lifecycle data | Database verification |
| **AC-23** | Search returns relevant results in <200ms | Performance test |
| **AC-24** | Filter by severity, status, date range works | E2E test |
| **AC-25** | Export produces valid CSV/JSON | Manual test |
| **AC-26** | Retention policy deletes old alerts correctly | Integration test |

### 12.6 Escalation

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-27** | Unacknowledged alerts escalate per policy | Integration test |
| **AC-28** | Acknowledgment stops escalation | E2E test |
| **AC-29** | Multi-step escalation follows correct sequence | Integration test |
| **AC-30** | Escalation audit trail complete | Log verification |

### 12.7 Maintenance Windows

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-31** | Alerts suppressed during maintenance window | Integration test |
| **AC-32** | Recurring windows activate correctly | Scheduled test |
| **AC-33** | Suppressed alerts optionally sent after window | Integration test |
| **AC-34** | Window scope filtering works correctly | Integration test |

### 12.8 Performance & Security

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-35** | Alert evaluation latency <100ms p95 | APM metrics |
| **AC-36** | System handles 10K alerts/min per instance | Load test |
| **AC-37** | No SQL injection via user input | Security scan |
| **AC-38** | Rate limiting prevents API abuse | Load test |
| **AC-39** | All API calls require authentication | Security test |
| **AC-40** | Audit log captures all alert operations | Log verification |

---

## Appendix A: API Reference

### A.1 Create Alert Rule Request

```typescript
interface CreateAlertRuleInput {
  name: string;                  // 1-100 characters
  description?: string;          // Optional, max 500 chars

  // Trigger configuration
  triggerType: 'threshold' | 'pattern' | 'event' | 'absence' |
               'rate_change' | 'composite' | 'scheduled' | 'anomaly';

  conditions: Array<{
    field: string;
    operator: ConditionOperator;
    value: string | number;
    duration?: number;           // Seconds
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
    window?: number;             // Seconds
  }>;

  conditionLogic?: 'and' | 'or'; // Default: 'and'

  // Alert settings
  severity: 'critical' | 'warning' | 'info' | 'debug';
  message: string;               // Supports template variables
  tags?: string[];

  // Notification settings
  channelIds: string[];          // At least one required
  escalationPolicyId?: string;

  // Throttling
  throttleConfig?: {
    enabled: boolean;
    rateLimit: number;           // Max notifications
    window: number;              // Window in seconds
    cooldown?: number;           // Min seconds between
  };

  // State
  enabled?: boolean;             // Default: true

  // Metadata
  metadata?: Record<string, any>;
}
```

### A.2 Notification Channel Configuration

```typescript
interface CreateNotificationChannelInput {
  type: 'email' | 'slack' | 'webhook' | 'in_app';
  name: string;                  // 1-50 characters
  enabled?: boolean;             // Default: true

  config: {
    // Email channel
    recipients?: string[];       // Email addresses
    subjectTemplate?: string;
    bodyTemplate?: string;

    // Slack channel
    webhookUrl?: string;         // Incoming webhook URL
    channel?: string;            // Override channel
    username?: string;           // Bot username
    iconEmoji?: string;          // Bot icon

    // Webhook channel
    url?: string;                // Endpoint URL (HTTPS)
    method?: 'POST' | 'PUT';
    headers?: Record<string, string>;
    authType?: 'none' | 'bearer' | 'api_key' | 'hmac';
    authToken?: string;
    authHeader?: string;         // Custom auth header name
    hmacSecret?: string;         // For HMAC signing
    payloadTemplate?: string;    // Custom JSON template

    // In-app channel (no config required)
  };

  severityFilter?: ('critical' | 'warning' | 'info' | 'debug')[];

  throttleConfig?: {
    enabled: boolean;
    rateLimit: number;
    window: number;
  };

  schedule?: {
    enabled: boolean;
    timezone: string;
    quietHours?: {
      start: string;             // HH:mm format
      end: string;
    };
    daysOfWeek?: number[];       // 0-6 (Sunday-Saturday)
  };
}
```

### A.3 Alert History Query

```typescript
interface AlertHistoryQuery {
  // Pagination
  limit?: number;                // Default: 50, max: 100
  offset?: number;
  cursor?: string;

  // Filters
  ruleId?: string;
  ruleIds?: string[];
  status?: AlertStatus | AlertStatus[];
  severity?: AlertSeverity | AlertSeverity[];

  // Date range
  triggeredAfter?: Date;
  triggeredBefore?: Date;
  resolvedAfter?: Date;
  resolvedBefore?: Date;

  // Search
  search?: string;               // Full-text search on message
  tags?: string[];               // Match any tag

  // Sorting
  orderBy?: 'triggeredAt' | 'severity' | 'status';
  orderDirection?: 'asc' | 'desc';

  // Include
  includeNotifications?: boolean;
  includeChildren?: boolean;     // For grouped alerts
}
```

### A.4 Webhook Payload Format

```typescript
interface AlertWebhookPayload {
  event: 'alert.fired' | 'alert.acknowledged' | 'alert.resolved' | 'alert.escalated';
  timestamp: string;             // ISO 8601

  alert: {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: AlertSeverity;
    status: AlertStatus;
    message: string;
    details: Record<string, any>;

    triggeredAt: string;
    acknowledgedAt?: string;
    resolvedAt?: string;

    acknowledgedBy?: string;
    resolvedBy?: string;

    tags: string[];
    source: string;

    groupId?: string;
    correlationId?: string;
  };

  channel: {
    id: string;
    name: string;
  };

  signature?: string;            // HMAC-SHA256 if configured
}
```

---

## Appendix B: Template Variables

### B.1 Available Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{alert.id}}` | Alert instance ID | `alert_abc123` |
| `{{alert.rule_name}}` | Rule display name | `High Error Rate` |
| `{{alert.severity}}` | Alert severity | `critical` |
| `{{alert.status}}` | Alert status | `firing` |
| `{{alert.message}}` | Alert message | `Error rate exceeded 5%` |
| `{{alert.triggered_at}}` | Trigger timestamp | `2026-01-11T10:30:00Z` |
| `{{alert.source}}` | Alert source | `workflow-executor` |
| `{{alert.tags}}` | Comma-separated tags | `production,api` |
| `{{alert.details.*}}` | Any detail field | Dynamic |
| `{{user.name}}` | User display name | `John Doe` |
| `{{user.email}}` | User email | `john@example.com` |
| `{{dashboard_url}}` | Link to alert dashboard | `https://app.bb.io/alerts/abc123` |
| `{{acknowledge_url}}` | Direct acknowledge link | `https://app.bb.io/alerts/abc123/ack` |

### B.2 Example Templates

#### Email Subject
```
[{{alert.severity | upper}}] {{alert.rule_name}}: {{alert.message | truncate:50}}
```

#### Slack Message
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "{{alert.severity | upper}}: {{alert.rule_name}}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "{{alert.message}}"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Triggered at {{alert.triggered_at | date:'MMM D, h:mm A'}}"
        }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Alert"},
          "url": "{{dashboard_url}}"
        },
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "Acknowledge"},
          "url": "{{acknowledge_url}}"
        }
      ]
    }
  ]
}
```

---

## Appendix C: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ALERT_RULE_NOT_FOUND` | 404 | Alert rule does not exist |
| `ALERT_RULE_LIMIT_EXCEEDED` | 400 | Maximum 100 rules per user |
| `ALERT_NOT_FOUND` | 404 | Alert instance not found |
| `CHANNEL_NOT_FOUND` | 404 | Notification channel not found |
| `CHANNEL_LIMIT_EXCEEDED` | 400 | Maximum 20 channels per user |
| `INVALID_TRIGGER_TYPE` | 400 | Unknown trigger type specified |
| `INVALID_CONDITION` | 400 | Condition validation failed |
| `INVALID_CHANNEL_CONFIG` | 400 | Channel configuration invalid |
| `DELIVERY_FAILED` | 502 | Notification delivery failed |
| `THROTTLED` | 429 | Request rate limited |
| `ESCALATION_POLICY_NOT_FOUND` | 404 | Escalation policy not found |
| `MAINTENANCE_WINDOW_CONFLICT` | 409 | Overlapping maintenance window |
| `TEMPLATE_RENDER_ERROR` | 500 | Template variable interpolation failed |

---

## Appendix D: Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Engineering Team | Initial PRD creation |

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Engineering Lead | | | |
| Security Lead | | | |
| QA Lead | | | |
