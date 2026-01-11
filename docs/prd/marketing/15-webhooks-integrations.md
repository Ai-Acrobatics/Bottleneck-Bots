# PRD: Webhooks & Integrations

## Overview
A comprehensive webhooks and integrations platform that enables Bottleneck-Bots users to connect their automation workflows with external systems. The system supports user-managed webhook endpoints, bidirectional message handling, bot-to-bot conversations, and detailed integration logging for troubleshooting and analytics.

## Problem Statement
Modern automation requires seamless connectivity with external systems:
- Users need to trigger workflows from external events (CRMs, forms, e-commerce)
- Workflow results must be sent to external systems (Slack, databases, APIs)
- Complex scenarios require bot-to-bot communication
- Debugging integration issues requires detailed logging
- Enterprise users need secure, reliable integration infrastructure

## Goals & Objectives
- **Primary Goals**
  - Enable users to create and manage webhook endpoints
  - Support both inbound (trigger) and outbound (action) webhooks
  - Facilitate bot-to-bot conversations for complex workflows
  - Provide comprehensive logging for debugging and compliance

- **Success Metrics**
  - 99.9% webhook delivery success rate
  - < 500ms webhook processing latency
  - 90% of active users utilize at least one integration
  - < 10 minute mean time to debug integration issues

## User Stories
- As a **user**, I want to create webhook URLs so that external systems can trigger my workflows
- As a **developer**, I want to send workflow results to my API so that I can process them further
- As a **power user**, I want bots to communicate with each other so that I can build complex automations
- As a **debugger**, I want detailed logs so that I can troubleshoot integration failures
- As an **admin**, I want to manage all integrations so that I can ensure security and compliance
- As an **enterprise user**, I want IP whitelisting so that only authorized systems can connect

## Functional Requirements

### Must Have (P0)
- **User Webhook Management**
  - Create unique webhook URLs per workflow
  - Webhook authentication (API key, HMAC, OAuth)
  - IP whitelisting for enhanced security
  - Enable/disable webhooks without deletion
  - Webhook URL regeneration for security rotation

- **Inbound Message Handling**
  - Parse JSON, form-data, and URL-encoded payloads
  - Payload validation against schemas
  - Transform incoming data to workflow format
  - Rate limiting per webhook
  - Queue management for high-volume webhooks

- **Outbound Message Handling**
  - HTTP requests (GET, POST, PUT, DELETE)
  - Configurable headers and authentication
  - Response handling and variable extraction
  - Retry logic with exponential backoff
  - Timeout configuration

- **Bot Conversations**
  - Direct bot-to-bot message passing
  - Conversation context sharing
  - Handoff protocols between bots
  - Conversation history tracking
  - Error handling and fallback routes

- **Integration Logging**
  - Request/response logging
  - Payload capture (with PII masking)
  - Timing and performance metrics
  - Error categorization
  - Log retention policies
  - Search and filter capabilities

### Should Have (P1)
- Pre-built integrations (Zapier, Make, n8n)
- OAuth 2.0 client for third-party APIs
- GraphQL endpoint support
- Webhook signature verification
- Automatic retry dashboard
- Webhook testing sandbox

### Nice to Have (P2)
- Native Slack/Teams integrations
- Salesforce connector
- HubSpot connector
- Custom integration marketplace
- Webhook templates library
- Real-time webhook monitoring dashboard

## Non-Functional Requirements

### Performance
- Webhook processing < 500ms (p95)
- Outbound request timeout: configurable up to 30s
- Support 10,000 webhook invocations per minute per org
- Log search results < 2 seconds

### Security
- TLS 1.2+ for all webhook communication
- Webhook secrets stored encrypted
- Request signing for outbound webhooks
- PII detection and masking in logs
- Audit trail for webhook configuration changes

### Reliability
- At-least-once delivery guarantee
- Dead letter queue for failed deliveries
- Automatic failover for outbound requests
- 99.9% availability for webhook endpoints

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                 Webhooks & Integration Service                  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Inbound    │  │   Outbound   │  │   Bot                │  │
│  │   Gateway    │  │   Dispatcher │  │   Router             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Payload    │  │   Auth       │  │   Integration        │  │
│  │   Processor  │  │   Manager    │  │   Logger             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  Message Queue (BullMQ)  │  Rate Limiter  │  Circuit Breaker  │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **BullMQ**: Message queue for webhook processing
- **Redis**: Rate limiting and caching
- **PostgreSQL**: Webhook configuration and logs
- **TimescaleDB**: Time-series log data
- **Axios/Got**: HTTP client for outbound requests

### APIs
- `POST /webhooks` - Create webhook endpoint
- `GET /webhooks` - List webhooks
- `GET /webhooks/{id}` - Get webhook details
- `PUT /webhooks/{id}` - Update webhook
- `DELETE /webhooks/{id}` - Delete webhook
- `POST /webhooks/{id}/regenerate` - Regenerate webhook URL
- `POST /webhooks/{id}/test` - Test webhook
- `GET /webhooks/{id}/logs` - Get webhook logs
- `POST /integrations/outbound` - Send outbound request
- `GET /integrations/logs` - Search integration logs
- `POST /bots/{id}/message` - Send bot message
- `GET /bots/{id}/conversations` - Get bot conversations

### Webhook URL Format
```
https://hooks.bottleneck-bots.io/{org_slug}/{webhook_id}
https://hooks.bottleneck-bots.io/{org_slug}/{webhook_id}?key={api_key}
```

### Database Schema
```sql
-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  workflow_id UUID REFERENCES workflows(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  url_slug VARCHAR(50) UNIQUE NOT NULL,
  secret_key VARCHAR(255) NOT NULL, -- for HMAC verification
  api_key VARCHAR(255), -- optional API key auth
  auth_type VARCHAR(20) DEFAULT 'none', -- none, api_key, hmac, oauth
  ip_whitelist INET[],
  allowed_methods VARCHAR(10)[] DEFAULT ARRAY['POST'],
  payload_schema JSONB, -- JSON Schema for validation
  transform_template JSONB, -- Handlebars/JSONata template
  rate_limit INTEGER DEFAULT 100, -- requests per minute
  is_active BOOLEAN DEFAULT TRUE,
  last_invocation_at TIMESTAMP,
  invocation_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Invocations
CREATE TABLE webhook_invocations (
  id UUID DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  request_id VARCHAR(100) UNIQUE,
  source_ip INET,
  method VARCHAR(10) NOT NULL,
  headers JSONB,
  payload JSONB,
  payload_size INTEGER,
  validation_result JSONB,
  processing_status VARCHAR(20) NOT NULL, -- pending, processing, completed, failed
  workflow_execution_id UUID,
  response_code INTEGER,
  response_body JSONB,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('webhook_invocations', 'created_at');

-- Outbound Requests
CREATE TABLE outbound_requests (
  id UUID DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  workflow_execution_id UUID,
  step_id VARCHAR(100),
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  headers JSONB,
  request_body JSONB,
  auth_type VARCHAR(20), -- none, basic, bearer, oauth
  timeout_ms INTEGER DEFAULT 30000,
  response_code INTEGER,
  response_headers JSONB,
  response_body JSONB,
  response_size INTEGER,
  duration_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  status VARCHAR(20) NOT NULL, -- pending, success, failed, timeout
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('outbound_requests', 'created_at');

-- Bot Conversations
CREATE TABLE bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  initiator_bot_id UUID REFERENCES workflows(id),
  responder_bot_id UUID REFERENCES workflows(id),
  conversation_status VARCHAR(20) DEFAULT 'active', -- active, completed, failed
  context JSONB DEFAULT '{}', -- shared context between bots
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  message_count INTEGER DEFAULT 0
);

-- Bot Messages
CREATE TABLE bot_messages (
  id UUID DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES bot_conversations(id),
  sender_bot_id UUID NOT NULL,
  message_type VARCHAR(30) NOT NULL, -- request, response, handoff, error
  payload JSONB NOT NULL,
  processing_time_ms INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('bot_messages', 'created_at');

-- Integration Connections (OAuth)
CREATE TABLE integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50) NOT NULL, -- google, salesforce, hubspot, etc.
  account_id VARCHAR(255),
  account_name VARCHAR(255),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,
  scopes TEXT[],
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, provider, account_id)
);

-- Integration Logs
CREATE TABLE integration_logs (
  id UUID DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  integration_type VARCHAR(30) NOT NULL, -- webhook_inbound, webhook_outbound, bot_message, oauth
  reference_id UUID NOT NULL, -- webhook_id, conversation_id, connection_id
  log_level VARCHAR(10) NOT NULL, -- debug, info, warning, error
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('integration_logs', 'created_at');
```

### Webhook Payload Transformation
```yaml
# Example transform template (JSONata)
transform:
  template: |
    {
      "lead_name": payload.contact.name,
      "email": payload.contact.email,
      "source": "webhook:" & webhookName,
      "timestamp": $now()
    }

# Example Handlebars template
transform:
  engine: handlebars
  template: |
    {
      "lead_name": "{{payload.contact.name}}",
      "email": "{{payload.contact.email}}",
      "source": "webhook:{{webhookName}}",
      "timestamp": "{{timestamp}}"
    }
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Webhook Delivery Rate | > 99.9% | Delivery logs |
| Processing Latency (p95) | < 500ms | Timing metrics |
| Integration Adoption | > 90% of active users | Product analytics |
| Mean Time to Debug | < 10 minutes | Support tickets |
| Bot Conversation Success | > 95% | Conversation logs |
| Outbound Request Success | > 98% | Request logs |

## Dependencies
- Secure webhook URL routing infrastructure
- Message queue for async processing
- Secret management for credentials
- Log storage with retention policies
- Rate limiting infrastructure

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Webhook abuse | High - Service degradation | Rate limiting, IP whitelisting, abuse detection |
| Credential exposure | Critical - Security breach | Encryption at rest, audit logging, secret rotation |
| Third-party API downtime | Medium - Failed workflows | Retry logic, circuit breakers, fallback handling |
| Log data volume | Medium - Storage costs | Retention policies, compression, tiered storage |
| Bot conversation loops | Medium - Resource exhaustion | Max message limits, loop detection, circuit breakers |
| Payload size attacks | Medium - Service degradation | Size limits, payload validation, streaming for large payloads |
