# PRD: Alerts & Notifications

## Overview
A comprehensive alerting and notification system for Bottleneck-Bots that enables users to create custom alert rules, receive real-time in-app notifications, and integrate with external channels (email, webhooks, SMS). The system provides proactive monitoring for workflow health, usage limits, and system events.

## Problem Statement
Users need timely awareness of important events and anomalies:
- Workflow failures require immediate attention
- Approaching subscription limits can cause service interruptions
- System status changes affect operational planning
- Different users have different notification preferences
- Integration with external tools (Slack, PagerDuty) is essential for enterprise users

## Goals & Objectives
- **Primary Goals**
  - Enable customizable alert rules for all system events
  - Deliver notifications through multiple channels
  - Provide granular control over notification preferences
  - Ensure reliable, timely delivery of critical alerts

- **Success Metrics**
  - 99.9% alert delivery success rate
  - < 30 second alert latency for critical events
  - 80% of users configure at least one alert rule
  - < 5% notification fatigue rate

## User Stories
- As a **workflow owner**, I want alerts when my workflows fail so that I can fix issues quickly
- As an **admin**, I want usage alerts so that I can prevent service interruptions
- As a **user**, I want to choose how I receive notifications so that I'm not overwhelmed
- As a **team**, I want to send alerts to our Slack channel so that everyone stays informed
- As an **on-call engineer**, I want webhook alerts to PagerDuty so that I can respond immediately
- As a **manager**, I want daily digest emails so that I can stay informed without constant interruptions

## Functional Requirements

### Must Have (P0)
- **Alert Rule Creation**
  - Event-based triggers (workflow failure, completion, error)
  - Threshold-based triggers (usage %, cost limits, execution time)
  - Schedule-based triggers (daily summaries, weekly reports)
  - Condition combinators (AND, OR, NOT)
  - Custom alert severity levels (critical, warning, info)

- **In-App Notifications**
  - Real-time notification feed
  - Notification center with history
  - Read/unread status tracking
  - Notification grouping by type
  - Click-through to relevant context

- **Email Notifications**
  - Configurable email templates
  - Immediate and digest modes
  - HTML and plain text formats
  - Unsubscribe functionality
  - Delivery tracking

- **Webhook Notifications**
  - Custom webhook endpoints
  - Configurable payload format (JSON)
  - Retry logic with exponential backoff
  - Secret-based authentication
  - Delivery logging and debugging

- **Subscription Usage Alerts**
  - Credit balance thresholds
  - Execution limit warnings
  - API rate limit approaching
  - Storage quota alerts
  - Auto-generated, non-dismissable

### Should Have (P1)
- Slack integration (direct and channel)
- Microsoft Teams integration
- SMS notifications for critical alerts
- Alert escalation rules
- Quiet hours / Do Not Disturb
- Alert templates for common scenarios

### Nice to Have (P2)
- PagerDuty integration
- Discord integration
- Mobile push notifications
- Voice call alerts for critical issues
- AI-powered alert suggestions
- Alert correlation and deduplication

## Non-Functional Requirements

### Performance
- Alert processing latency < 1 second
- Notification delivery < 30 seconds (critical)
- Support for 10,000+ concurrent alert evaluations
- Email delivery within 2 minutes

### Reliability
- 99.9% uptime for alert processing
- At-least-once delivery guarantee
- Graceful degradation under load
- Circuit breaker for external services

### Scalability
- Horizontal scaling for alert processing
- Webhook delivery queue for high volume
- Efficient notification batching

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                    Alert & Notification Service                 │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Event     │  │    Rule      │  │   Alert              │  │
│  │   Ingestion  │  │   Evaluator  │  │   Generator          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Delivery   │  │   Channel    │  │   Preference         │  │
│  │   Router     │  │   Adapters   │  │   Manager            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│    Event Bus (Redis)   │   Message Queue   │   Delivery Log    │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **Redis**: Event bus and real-time notifications
- **PostgreSQL**: Alert rules and notification history
- **Message Queue**: Delivery queue (Bull/BullMQ)
- **SendGrid/Resend**: Email delivery
- **Twilio**: SMS delivery (optional)
- **WebSocket Server**: Real-time in-app notifications

### APIs
- `POST /alerts/rules` - Create alert rule
- `GET /alerts/rules` - List alert rules
- `PUT /alerts/rules/{id}` - Update alert rule
- `DELETE /alerts/rules/{id}` - Delete alert rule
- `POST /alerts/rules/{id}/test` - Test alert rule
- `GET /notifications` - Get notification feed
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/{id}` - Delete notification
- `GET /preferences` - Get notification preferences
- `PUT /preferences` - Update preferences
- `POST /webhooks` - Register webhook endpoint
- `GET /webhooks` - List webhooks
- `GET /webhooks/{id}/logs` - Get webhook delivery logs

### Database Schema
```sql
-- Alert Rules
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rule_type VARCHAR(30) NOT NULL, -- event, threshold, schedule
  conditions JSONB NOT NULL,
  -- Event: {event_type, filters: {}}
  -- Threshold: {metric, operator, value, duration}
  -- Schedule: {cron_expression, timezone}
  severity VARCHAR(20) DEFAULT 'warning', -- critical, warning, info
  channels JSONB NOT NULL, -- [{type: 'email', config: {}}, ...]
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP,
  trigger_count INTEGER DEFAULT 0,
  cooldown_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert History
CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES alert_rules(id),
  organization_id UUID NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  context JSONB, -- related entities, metrics, etc.
  status VARCHAR(20) DEFAULT 'active', -- active, acknowledged, resolved
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID,
  alert_id UUID REFERENCES alert_history(id),
  notification_type VARCHAR(30) NOT NULL, -- alert, system, info
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  email_digest VARCHAR(20) DEFAULT 'immediate', -- immediate, hourly, daily
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone VARCHAR(50),
  severity_filters JSONB DEFAULT '{"critical": true, "warning": true, "info": true}',
  category_filters JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Endpoints
CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255), -- for HMAC signing
  headers JSONB DEFAULT '{}',
  events JSONB NOT NULL, -- list of event types to send
  is_active BOOLEAN DEFAULT TRUE,
  last_delivery_at TIMESTAMP,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Delivery Log
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhook_endpoints(id),
  alert_id UUID REFERENCES alert_history(id),
  request_payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  status VARCHAR(20) NOT NULL, -- pending, success, failed, retrying
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Delivery Log
CREATE TABLE email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id),
  user_id UUID REFERENCES users(id),
  to_address VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template_id VARCHAR(50),
  provider_message_id VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- pending, sent, delivered, bounced, failed
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Event Types
```yaml
events:
  workflow:
    - workflow.created
    - workflow.updated
    - workflow.deleted
    - workflow.execution.started
    - workflow.execution.completed
    - workflow.execution.failed
    - workflow.execution.timeout

  subscription:
    - subscription.usage.threshold
    - subscription.credits.low
    - subscription.credits.exhausted
    - subscription.approaching_limit
    - subscription.upgraded
    - subscription.downgraded

  system:
    - system.maintenance.scheduled
    - system.incident.started
    - system.incident.resolved
    - api.rate_limit.approaching
    - api.rate_limit.exceeded

  team:
    - team.member.added
    - team.member.removed
    - team.role.changed
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Alert Delivery Rate | > 99.9% | Delivery logs |
| Alert Latency (Critical) | < 30 seconds | End-to-end timing |
| Email Open Rate | > 30% | Email provider analytics |
| Webhook Success Rate | > 99% | Delivery logs |
| User Alert Adoption | > 80% | Product analytics |
| False Positive Rate | < 5% | User feedback |

## Dependencies
- Event bus for system events
- Email service provider (SendGrid/Resend)
- SMS provider (Twilio) - optional
- WebSocket infrastructure
- Background job processor
- Monitoring and observability

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Notification spam | High - User disengagement | Rate limiting, intelligent grouping, cooldown periods |
| Delivery failures | High - Missed critical alerts | Retry logic, fallback channels, delivery monitoring |
| Alert fatigue | Medium - Ignored alerts | Customizable thresholds, severity levels, quiet hours |
| Webhook security | Medium - Data exposure | HMAC signing, HTTPS only, secret rotation |
| Email deliverability | Medium - Missed notifications | Proper SPF/DKIM, reputation monitoring, dedicated IPs |
| Real-time scaling | Medium - Delayed alerts | Horizontal scaling, message queue buffering |
