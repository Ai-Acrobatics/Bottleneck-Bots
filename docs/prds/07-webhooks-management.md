# PRD-07: Webhooks Management System

**Product Requirements Document**

| Field | Value |
|-------|-------|
| **Document ID** | PRD-07 |
| **Feature Name** | Webhooks Management System |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Engineering Team |
| **Created** | 2026-01-11 |
| **Last Updated** | 2026-01-11 |
| **Priority** | High |
| **Target Release** | v2.0 |

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

The Webhooks Management System enables Bottleneck-Bots users to configure multi-channel communication endpoints (SMS, Email, Custom Webhooks) for receiving inbound messages, routing them to AI-powered bot conversations, and triggering outbound webhook notifications. This feature serves as the communication backbone for the Agency Task Board, allowing agency owners to interact with their AI assistant through their preferred communication channels.

### 1.2 Background

Agency owners need flexible ways to communicate with their Bottleneck-Bot AI assistant. Traditional interfaces require logging into a dashboard, but real productivity demands meeting users where they are - in SMS conversations, email threads, or integrated automation platforms like Zapier, Make, and n8n.

The current implementation (`server/api/routers/webhooks.ts`) provides foundational CRUD operations for webhook management. This PRD expands upon that foundation to deliver a complete, production-ready webhooks management system.

### 1.3 Key Capabilities

- **Multi-Channel Support**: SMS (Twilio), Email (SMTP/Provider), Custom Webhooks
- **Inbound Message Routing**: Receive, parse, and route messages to bot conversations
- **Bot Conversation Management**: Maintain context-aware AI conversations per channel
- **Outbound Webhook Triggers**: Send notifications and responses to external systems
- **Rate Limiting**: Per-minute and per-hour limits to prevent abuse
- **Authentication Types**: Bearer tokens, API keys, HMAC signature verification
- **Channel-Specific Configuration**: Tailored settings for each channel type

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Pain Point | Impact | Affected Users |
|------------|--------|----------------|
| **Limited Communication Options** | Users can only interact via dashboard UI | All agency owners |
| **No SMS/Email Integration** | Cannot receive tasks via mobile-friendly channels | Field teams, busy executives |
| **Manual Task Entry** | Every task requires manual dashboard input | All users |
| **No Automation Triggers** | Cannot integrate with existing automation stacks | Power users, developers |
| **Lack of Bidirectional Communication** | Bot cannot proactively notify users | All users |

### 2.2 User Needs

1. **Agency Owners** need to send tasks to their AI assistant via SMS while on-the-go
2. **Team Members** need to receive task completion notifications in their preferred channel
3. **Developers** need to integrate Bottleneck-Bots with their automation workflows (Zapier, Make, n8n)
4. **Operations Managers** need to forward specific emails to the AI for processing

### 2.3 Business Drivers

- **Increased Engagement**: SMS/Email access increases daily active usage by 40-60%
- **Reduced Friction**: Lower barrier to task creation improves adoption
- **Integration Stickiness**: Webhook integrations increase retention through ecosystem lock-in
- **Premium Feature**: Multi-channel access differentiates paid tiers

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Target |
|------|-------------|--------|
| **G1** | Enable multi-channel inbound message reception | 3 channel types supported |
| **G2** | Implement reliable outbound webhook delivery | 99.5% delivery success rate |
| **G3** | Provide secure authentication mechanisms | 3 auth types (Bearer, API Key, HMAC) |
| **G4** | Maintain high throughput with rate limiting | 30 msg/min, 200 msg/hour default |
| **G5** | Achieve seamless bot conversation integration | <500ms message-to-response latency |

### 3.2 Success Metrics

#### 3.2.1 Quantitative Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **Webhook Uptime** | N/A | 99.9% | Infrastructure monitoring |
| **Message Processing Latency** | N/A | <200ms p95 | Application metrics |
| **Delivery Success Rate** | N/A | >99.5% | Webhook log analysis |
| **User Adoption Rate** | 0% | 40% of active users | Analytics |
| **Tasks Created via Webhooks** | 0 | 25% of all tasks | Database queries |

#### 3.2.2 Qualitative Metrics

- User satisfaction with channel configuration experience
- Developer satisfaction with webhook integration documentation
- Reduction in support tickets related to task creation

### 3.3 Key Performance Indicators (KPIs)

1. **Daily Active Webhooks**: Number of webhooks receiving/sending messages daily
2. **Message Throughput**: Total messages processed per day
3. **Conversation Depth**: Average messages per bot conversation
4. **Error Rate**: Percentage of failed webhook deliveries
5. **Mean Time to Resolution**: Average time from inbound message to task creation

---

## 4. User Stories

### 4.1 Webhook Configuration Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-01 | Agency Owner | As an agency owner, I want to create up to 3 webhook channels so that I can receive messages from multiple sources | P0 |
| US-02 | Agency Owner | As an agency owner, I want to configure SMS webhooks with Twilio credentials so that I can receive text messages | P0 |
| US-03 | Agency Owner | As an agency owner, I want to configure email webhooks so that I can forward emails to my AI assistant | P0 |
| US-04 | Developer | As a developer, I want to configure custom webhooks with authentication so that I can integrate with Zapier/Make/n8n | P0 |
| US-05 | Agency Owner | As an agency owner, I want to set one channel as primary so that notifications are sent to my preferred channel | P1 |
| US-06 | Agency Owner | As an agency owner, I want to verify my webhook channels to ensure they work correctly | P1 |

### 4.2 Inbound Message Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-07 | Agency Owner | As an agency owner, I want to send an SMS to create a task so that I can work hands-free | P0 |
| US-08 | Agency Owner | As an agency owner, I want my emails to be parsed and converted to tasks so that I can forward client requests | P0 |
| US-09 | Developer | As a developer, I want to POST to a webhook endpoint to create tasks programmatically | P0 |
| US-10 | Agency Owner | As an agency owner, I want to see message history for each channel so that I can audit communications | P1 |
| US-11 | Team Member | As a team member, I want threaded conversations so that context is preserved across messages | P1 |

### 4.3 Outbound Webhook Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-12 | Agency Owner | As an agency owner, I want to receive SMS notifications when tasks complete so that I stay informed | P0 |
| US-13 | Developer | As a developer, I want task events to trigger outbound webhooks so that I can update external systems | P0 |
| US-14 | Agency Owner | As an agency owner, I want to test my webhook configuration before going live | P1 |
| US-15 | Developer | As a developer, I want HMAC-signed webhooks so that I can verify payload authenticity | P1 |
| US-16 | Agency Owner | As an agency owner, I want retry logic for failed deliveries so that I do not miss notifications | P1 |

### 4.4 Bot Conversation Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-17 | Agency Owner | As an agency owner, I want conversational AI responses so that interacting with the bot feels natural | P0 |
| US-18 | Agency Owner | As an agency owner, I want the bot to remember context within a conversation | P0 |
| US-19 | Agency Owner | As an agency owner, I want to pause/resume conversations so that I can manage multiple threads | P2 |
| US-20 | Agency Owner | As an agency owner, I want to configure AI personality per channel (professional/friendly/concise) | P2 |

---

## 5. Functional Requirements

### 5.1 Webhook Channel Management

#### FR-01: Channel Creation
- **Description**: Users can create up to 3 webhook channels per account
- **Input**: Channel type (SMS/Email/Custom), channel name, provider configuration
- **Output**: Created webhook with unique token and URL
- **Business Rules**:
  - Maximum 3 webhooks per user
  - First webhook automatically becomes primary
  - HMAC secret key auto-generated (64 hex characters)
  - Webhook URL format: `/api/webhooks/inbound/{webhookToken}`

#### FR-02: Channel Types

| Channel Type | Provider Config | Outbound Config |
|--------------|-----------------|-----------------|
| **SMS** | `twilioAccountSid`, `twilioAuthToken`, `twilioPhoneNumber`, `twilioMessagingServiceSid` | Same as provider |
| **Email** | `inboundEmailAddress`, `forwardingEnabled`, `emailProvider` | `smtpHost`, `smtpPort`, `smtpUser`, `smtpPassword`, `fromAddress`, `replyToAddress` |
| **Custom Webhook** | `authType` (none/bearer/api_key/hmac), `authToken`, `authHeader`, `hmacSecret` | `outboundWebhookUrl`, `outboundHeaders`, `outboundMethod` (POST/PUT) |

#### FR-03: Channel Operations
- **List**: Retrieve all active webhooks (with optional inactive filter)
- **Get**: Retrieve single webhook by ID (masks sensitive config)
- **Update**: Modify channel settings, provider config, rate limits
- **Delete**: Soft-delete (set inactive), auto-promote next primary
- **Verify**: Validate channel with verification code
- **Regenerate Token**: Generate new webhook token/URL
- **Regenerate Secret**: Generate new HMAC signing key
- **Test**: Send test payload to outbound webhook

#### FR-04: Rate Limiting
- **Per-Minute Limit**: Configurable 1-100 requests (default: 30)
- **Per-Hour Limit**: Configurable 1-1000 requests (default: 200)
- **Enforcement**: Reject requests exceeding limits with 429 status
- **Headers**: Return `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 5.2 Inbound Message Processing

#### FR-05: Message Reception
- **Endpoint**: `POST /api/webhooks/inbound/{webhookToken}`
- **Validation**: Verify webhook token, check rate limits, validate auth
- **Response**: 200 OK (accepted), 401 (unauthorized), 429 (rate limited)

#### FR-06: Message Parsing

| Message Type | Parsing Logic |
|--------------|---------------|
| **Text** | Extract plain text content, detect intent (task/question/update) |
| **Image** | Store URL reference, extract text via OCR if enabled |
| **Audio** | Transcribe via speech-to-text, extract text |
| **Structured** | Parse JSON payload, map to task fields |

#### FR-07: Content Analysis
- **Intent Detection**: Classify as task, question, update, confirmation
- **Entity Extraction**: Dates, names, project references, priorities
- **Urgency Detection**: Low, medium, high, critical based on keywords
- **Attachment Handling**: Store references, link to messages

#### FR-08: Message Routing
- **Conversation Matching**: Find or create conversation by sender identifier
- **Context Injection**: Provide conversation history to AI
- **Task Creation**: Auto-create tasks when intent is detected
- **Confirmation Flow**: Optional confirmation before task creation

### 5.3 Bot Conversation Management

#### FR-09: Conversation Lifecycle

| Status | Description | Transitions |
|--------|-------------|-------------|
| **Active** | Ongoing conversation | Pause, Resolve, Archive |
| **Paused** | Temporarily suspended | Resume, Archive |
| **Resolved** | Completed successfully | Reopen, Archive |
| **Archived** | Historical record | None |

#### FR-10: Context Management
- **Context Summary**: AI-generated summary of conversation (updated per message)
- **Context Memory**: Key facts (user name, preferences, recent tasks, ongoing projects)
- **Message History**: Last N messages for context window
- **Cross-Channel Context**: Unified context across all user channels

#### FR-11: AI Configuration
- **Personality Profiles**: Professional, Friendly, Concise
- **Auto-Create Tasks**: Toggle for automatic task creation
- **Require Confirmation**: Request user approval before actions
- **Language Preference**: Response language setting

### 5.4 Outbound Webhook Delivery

#### FR-12: Trigger Events

| Event | Payload | Triggered By |
|-------|---------|--------------|
| `message.received` | Message content, sender info | Inbound message |
| `task.created` | Task details, source message | Task creation |
| `task.completed` | Task result, execution summary | Task completion |
| `task.failed` | Error details, retry info | Task failure |
| `conversation.updated` | Conversation summary | Context change |

#### FR-13: Delivery Mechanism
- **Method**: POST or PUT (configurable)
- **Headers**: Custom headers + authentication headers
- **Payload**: JSON with event type, data, timestamp, signature
- **Timeout**: 30 seconds per attempt

#### FR-14: Authentication Options

| Auth Type | Implementation |
|-----------|----------------|
| **None** | No authentication header |
| **Bearer** | `Authorization: Bearer {token}` |
| **API Key** | Custom header with API key (default: `X-API-Key`) |
| **HMAC** | `X-Webhook-Signature: sha256={hash}` |

#### FR-15: Retry Logic
- **Attempts**: Up to 5 retries
- **Backoff**: Exponential (1s, 2s, 4s, 8s, 16s)
- **Failure Conditions**: 5xx errors, timeouts, connection failures
- **Success Conditions**: 2xx responses
- **Dead Letter**: Log permanently failed deliveries

### 5.5 Message History & Analytics

#### FR-16: Message Logging
- **Inbound Log**: Store all received messages with parsed content
- **Outbound Log**: Store all sent responses with delivery status
- **Execution Log**: Link messages to task executions

#### FR-17: Analytics
- **Message Volume**: Total received/sent per channel
- **Response Time**: Average message-to-response latency
- **Task Conversion**: Percentage of messages creating tasks
- **Error Rate**: Failed deliveries, parsing errors

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-01**: Message ingestion latency | <100ms p95 | APM metrics |
| **NFR-02**: Message processing throughput | 1000 msg/min per instance | Load testing |
| **NFR-03**: Outbound delivery latency | <500ms p95 | Delivery logs |
| **NFR-04**: Webhook response time | <200ms for ack | Endpoint monitoring |
| **NFR-05**: Database query performance | <50ms p95 | Query profiling |

### 6.2 Scalability

| Requirement | Target | Approach |
|-------------|--------|----------|
| **NFR-06**: Horizontal scaling | Auto-scale to 10 instances | Kubernetes HPA |
| **NFR-07**: Message queue depth | Handle 10K queued messages | Redis/SQS queue |
| **NFR-08**: Concurrent connections | 1000 concurrent webhooks | Connection pooling |
| **NFR-09**: Database connections | Pool size 20-100 | Drizzle pool config |

### 6.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **NFR-10**: Webhook uptime | 99.9% | Multi-AZ deployment |
| **NFR-11**: Message durability | No message loss | Persistent queue |
| **NFR-12**: Delivery guarantee | At-least-once | Retry with idempotency |
| **NFR-13**: Failover recovery | <30 seconds | Health checks, auto-restart |

### 6.4 Security

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-14**: Credential encryption | Encrypt provider configs at rest | AES-256 encryption |
| **NFR-15**: Token rotation | Support token regeneration | Endpoint provided |
| **NFR-16**: HMAC validation | Verify inbound webhook signatures | SHA-256 HMAC |
| **NFR-17**: Rate limiting bypass protection | Prevent DDoS via rate limits | IP-based + token-based limits |
| **NFR-18**: Input sanitization | Prevent injection attacks | Zod validation, parameterized queries |
| **NFR-19**: Audit logging | Log all webhook operations | Webhook logs table |

### 6.5 Compliance

| Requirement | Description |
|-------------|-------------|
| **NFR-20**: GDPR compliance | Support data deletion requests for messages |
| **NFR-21**: SOC 2 requirements | Audit logs, access controls, encryption |
| **NFR-22**: PCI considerations | No storage of payment data in webhooks |

### 6.6 Observability

| Requirement | Target | Tools |
|-------------|--------|-------|
| **NFR-23**: Structured logging | All webhook operations logged | Winston/Pino |
| **NFR-24**: Metrics collection | Key metrics exported | Prometheus/Datadog |
| **NFR-25**: Distributed tracing | End-to-end trace IDs | OpenTelemetry |
| **NFR-26**: Alerting | <5 min detection time | PagerDuty/Slack |

---

## 7. Technical Architecture

### 7.1 System Components

```
+------------------+     +-------------------+     +------------------+
|  External Source |---->|  Inbound Handler  |---->|  Message Queue   |
|  (SMS/Email/API) |     |  /api/webhooks/*  |     |  (Redis/SQS)     |
+------------------+     +-------------------+     +--------+---------+
                                                           |
                                                           v
+------------------+     +-------------------+     +------------------+
|  Bot Response    |<----|  AI Processor     |<----|  Message Worker  |
|  Engine          |     |  (Claude/GPT)     |     |  (Background)    |
+------------------+     +-------------------+     +------------------+
         |                                                  |
         v                                                  v
+------------------+     +-------------------+     +------------------+
|  Outbound Queue  |---->|  Delivery Worker  |---->|  External Target |
|  (Redis/SQS)     |     |  (Retries/HMAC)   |     |  (User Endpoint) |
+------------------+     +-------------------+     +------------------+
```

### 7.2 Database Schema

#### 7.2.1 Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user_webhooks` | Channel configuration | userId, webhookToken, channelType, providerConfig |
| `inbound_messages` | Received message log | webhookId, senderIdentifier, content, processingStatus |
| `bot_conversations` | Conversation context | userId, webhookId, contextSummary, status |
| `agency_tasks` | Tasks from messages | sourceWebhookId, sourceMessageId, status |
| `outbound_messages` | Sent message log | webhookId, content, deliveryStatus |
| `webhook_logs` | Delivery audit trail | webhookId, event, status, attempts |

#### 7.2.2 Index Strategy

```sql
-- Primary access patterns
CREATE INDEX user_webhooks_user_id_idx ON user_webhooks(userId);
CREATE UNIQUE INDEX user_webhooks_token_idx ON user_webhooks(webhookToken);

-- Inbound message queries
CREATE INDEX inbound_messages_webhook_id_idx ON inbound_messages(webhookId);
CREATE INDEX inbound_messages_conversation_idx ON inbound_messages(conversationId);

-- Outbound delivery tracking
CREATE INDEX outbound_messages_pending_idx ON outbound_messages(deliveryStatus, scheduledFor);
CREATE INDEX webhook_logs_status_retry_idx ON webhook_logs(status, nextRetryAt);
```

### 7.3 API Endpoints

#### 7.3.1 tRPC Router (Protected)

| Procedure | Type | Description |
|-----------|------|-------------|
| `webhooks.create` | Mutation | Create new webhook channel |
| `webhooks.list` | Query | List user's webhooks |
| `webhooks.get` | Query | Get webhook details |
| `webhooks.update` | Mutation | Update webhook settings |
| `webhooks.delete` | Mutation | Soft-delete webhook |
| `webhooks.verify` | Mutation | Verify channel with code |
| `webhooks.regenerateToken` | Mutation | Generate new webhook URL |
| `webhooks.regenerateSecretKey` | Mutation | Generate new HMAC secret |
| `webhooks.getSecretKey` | Query | Retrieve HMAC secret |
| `webhooks.test` | Mutation | Test outbound delivery |
| `webhooks.getMessages` | Query | Get message history |
| `webhooks.getConversations` | Query | Get conversation list |

#### 7.3.2 REST Endpoints (Public)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/inbound/{token}` | POST | Receive inbound messages |
| `/api/webhooks/inbound/{token}/verify` | GET | Verification challenge |
| `/api/v1/webhooks/automation` | POST | Automation trigger (legacy) |
| `/api/v1/webhooks/health` | GET | Health check |

### 7.4 Authentication Flow

```
1. Inbound Request → Validate webhookToken (UUID lookup)
                   → Check auth type from config
                   → If HMAC: verify X-Webhook-Signature header
                   → If Bearer: verify Authorization header
                   → If API Key: verify custom header
                   → Check rate limits (minute/hour)
                   → Accept or reject request

2. Outbound Request → Build payload with event data
                    → Sign with HMAC secret (if configured)
                    → Add auth headers (if configured)
                    → Send request with timeout
                    → Handle response/retry on failure
```

### 7.5 Message Processing Pipeline

```
1. Reception     → Validate, parse, log raw payload
2. Parsing       → Extract content, detect type, identify entities
3. Routing       → Match conversation, inject context
4. AI Processing → Generate response, detect intent
5. Task Creation → Create task if intent detected
6. Response      → Send reply via appropriate channel
7. Logging       → Record all operations for audit
```

### 7.6 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **API Framework** | tRPC + Express | Type-safe APIs, REST compatibility |
| **Database** | PostgreSQL + Drizzle | Relational data, strong typing |
| **Queue** | Redis (BullMQ) | Job processing, rate limiting |
| **AI** | Claude/OpenAI | Conversation intelligence |
| **SMS** | Twilio | Industry standard, reliable |
| **Email** | SendGrid/Postmark | High deliverability |
| **Monitoring** | Datadog/Grafana | Full observability stack |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Component | Impact |
|------------|-----------|--------|
| User Authentication | `schema-auth.ts` | User identity for webhooks |
| Task System | `schema-webhooks.ts` (agencyTasks) | Task creation from messages |
| AI Engine | Claude/OpenAI integration | Conversation processing |
| Memory System | `schema-memory.ts` | Context persistence |
| Notification System | `schema-alerts.ts` | Event notifications |

### 8.2 External Dependencies

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| Twilio SDK | ^5.x | SMS sending/receiving | Medium |
| Nodemailer | ^6.x | Email sending | Low |
| Zod | ^3.x | Input validation | Low |
| nanoid | ^5.x | Verification code generation | Low |
| crypto (Node) | Built-in | HMAC signing | None |

### 8.3 Infrastructure Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| PostgreSQL | Primary data store | None (required) |
| Redis | Queue, rate limiting | In-memory fallback |
| Twilio | SMS channel | Graceful degradation |
| SMTP Server | Email channel | Graceful degradation |

---

## 9. Out of Scope

### 9.1 Explicitly Excluded

| Item | Reason | Future Phase |
|------|--------|--------------|
| WhatsApp Integration | Requires Meta business verification | v3.0 |
| Slack/Discord Channels | Different integration pattern | v2.5 |
| Voice Call Webhooks | Complex transcription requirements | v3.0 |
| File Upload via Webhook | Size limits, security concerns | v2.5 |
| Multi-Tenant Webhooks | Enterprise feature | v3.0 |
| Webhook Marketplace | Third-party integrations | v4.0 |

### 9.2 Deferred Features

| Feature | Priority | Target Release |
|---------|----------|----------------|
| Webhook Templates | P2 | v2.2 |
| Batch Message Processing | P2 | v2.2 |
| Custom AI Personality Training | P3 | v2.5 |
| Webhook Analytics Dashboard | P2 | v2.3 |
| A/B Testing for Responses | P3 | v3.0 |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1**: Twilio rate limits | Medium | High | Implement queuing, request rate limiting |
| **R2**: Message parsing failures | Medium | Medium | Fallback to raw content, manual review queue |
| **R3**: AI response latency | Medium | High | Cache common responses, async processing |
| **R4**: Webhook endpoint abuse | High | High | Rate limiting, IP blocking, auth validation |
| **R5**: Secret key exposure | Low | Critical | Environment variables, secret rotation |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R6**: Low adoption | Medium | High | User onboarding flow, channel setup wizard |
| **R7**: Support burden | Medium | Medium | Self-service docs, troubleshooting guides |
| **R8**: Competitor features | Medium | Medium | Rapid iteration, user feedback loop |

### 10.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R9**: Provider outages | Medium | High | Multi-provider fallback (SMS: Twilio/Vonage) |
| **R10**: Data loss | Low | Critical | Database backups, message queue persistence |
| **R11**: Security breach | Low | Critical | Penetration testing, security audits |

### 10.4 Risk Matrix

```
Impact      Critical |     R5     |     R10, R11
            High     |  R4        |     R1, R3, R6, R9
            Medium   |            |     R2, R7, R8
            Low      |            |
                     +-----------+-----------------
                        Low         Medium
                            Probability
```

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Foundation (Weeks 1-2)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M1.1** | Database schema finalization | Migration scripts, type definitions | Backend |
| **M1.2** | Core CRUD operations | tRPC router complete | Backend |
| **M1.3** | Basic inbound endpoint | POST endpoint, validation | Backend |
| **M1.4** | Unit tests | 80% coverage for core | QA |

### 11.2 Phase 2: Channel Integration (Weeks 3-4)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M2.1** | Twilio SMS integration | Inbound/outbound SMS | Backend |
| **M2.2** | Email channel support | SMTP send, inbound parsing | Backend |
| **M2.3** | Custom webhook auth | Bearer, API Key, HMAC | Backend |
| **M2.4** | Integration tests | End-to-end channel tests | QA |

### 11.3 Phase 3: Bot Conversations (Weeks 5-6)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M3.1** | Conversation management | CRUD, status transitions | Backend |
| **M3.2** | AI integration | Claude/GPT response generation | AI Team |
| **M3.3** | Context management | Memory persistence, summary | Backend |
| **M3.4** | Task creation flow | Message-to-task pipeline | Backend |

### 11.4 Phase 4: Outbound & Reliability (Weeks 7-8)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M4.1** | Outbound webhook delivery | Queue, retry logic | Backend |
| **M4.2** | Rate limiting | Per-minute/hour limits | Backend |
| **M4.3** | Monitoring & logging | Observability stack | DevOps |
| **M4.4** | Performance optimization | Load testing, tuning | Backend |

### 11.5 Phase 5: UI & Launch (Weeks 9-10)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M5.1** | Dashboard UI | Webhook management screens | Frontend |
| **M5.2** | Setup wizard | Guided channel configuration | Frontend |
| **M5.3** | Documentation | API docs, user guides | Tech Writer |
| **M5.4** | Beta launch | Limited user rollout | Product |

### 11.6 Gantt Chart

```
Week:        1    2    3    4    5    6    7    8    9    10
Phase 1:     ████████
Phase 2:               ████████
Phase 3:                         ████████
Phase 4:                                   ████████
Phase 5:                                             ████████
```

---

## 12. Acceptance Criteria

### 12.1 Webhook Channel Management

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-01** | Users can create up to 3 webhook channels | Unit test, E2E test |
| **AC-02** | Each channel type (SMS/Email/Custom) can be configured | Integration test |
| **AC-03** | Webhook tokens are unique UUID format | Database constraint |
| **AC-04** | HMAC secret keys are 64 hex characters | Unit test |
| **AC-05** | Soft delete sets inactive, doesn't remove data | Database verification |
| **AC-06** | Primary channel auto-promotes on deletion | E2E test |

### 12.2 Inbound Message Processing

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-07** | Inbound endpoint accepts POST requests with valid token | API test |
| **AC-08** | Invalid tokens return 404 Not Found | API test |
| **AC-09** | Rate-limited requests return 429 with headers | Load test |
| **AC-10** | HMAC validation rejects invalid signatures | Security test |
| **AC-11** | Messages are logged before processing | Log verification |
| **AC-12** | Parsing extracts intent and entities | Unit test |

### 12.3 Bot Conversations

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-13** | Conversations are matched by sender identifier | E2E test |
| **AC-14** | Context summary is updated after each message | Integration test |
| **AC-15** | AI responses are generated within 2 seconds | Performance test |
| **AC-16** | Task creation includes source message reference | Database verification |
| **AC-17** | Conversation status transitions are logged | Audit log check |

### 12.4 Outbound Webhook Delivery

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-18** | Test webhook sends valid payload | Manual test |
| **AC-19** | HMAC signature is verifiable by recipient | Integration test |
| **AC-20** | Failed deliveries retry with exponential backoff | Queue inspection |
| **AC-21** | Success responses (2xx) mark delivery complete | Log verification |
| **AC-22** | Permanently failed deliveries are logged | Database query |

### 12.5 Security & Performance

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-23** | Provider configs are not returned in API responses | API test |
| **AC-24** | Rate limits enforce per-minute and per-hour caps | Load test |
| **AC-25** | Webhook uptime exceeds 99.9% over 30 days | Monitoring |
| **AC-26** | Message processing latency p95 < 200ms | APM metrics |
| **AC-27** | No SQL injection possible via message content | Security scan |

### 12.6 User Experience

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-28** | Channel setup wizard completes in < 5 minutes | User test |
| **AC-29** | Message history displays last 50 messages | UI test |
| **AC-30** | Webhook test provides clear success/failure feedback | Manual test |
| **AC-31** | Error messages are actionable and clear | UX review |

---

## Appendix A: API Reference

### A.1 Create Webhook Request

```typescript
interface CreateWebhookInput {
  channelType: "sms" | "email" | "custom_webhook";
  channelName: string; // 1-100 chars
  providerConfig?: {
    // SMS
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioPhoneNumber?: string;
    twilioMessagingServiceSid?: string;
    // Email
    inboundEmailAddress?: string;
    forwardingEnabled?: boolean;
    emailProvider?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromAddress?: string;
    replyToAddress?: string;
    // Custom
    authType?: "none" | "bearer" | "api_key" | "hmac";
    authToken?: string;
    authHeader?: string;
    hmacSecret?: string;
    outboundWebhookUrl?: string;
    outboundHeaders?: Record<string, string>;
    outboundMethod?: "POST" | "PUT";
  };
  outboundEnabled?: boolean; // default: true
  outboundConfig?: object;
  isPrimary?: boolean; // default: false
  rateLimitPerMinute?: number; // 1-100, default: 30
  rateLimitPerHour?: number; // 1-1000, default: 200
  tags?: string[];
  metadata?: Record<string, any>;
}
```

### A.2 Inbound Message Payload

```typescript
interface InboundMessagePayload {
  // Required
  content: string;

  // Optional
  senderIdentifier?: string; // Auto-detected if not provided
  senderName?: string;
  messageType?: "text" | "image" | "audio" | "file" | "structured";
  externalMessageId?: string;
  attachments?: Array<{
    type: string;
    url: string;
    name?: string;
  }>;
  metadata?: Record<string, any>;

  // For structured tasks
  taskTitle?: string;
  taskDescription?: string;
  taskPriority?: "low" | "medium" | "high" | "critical";
  taskDeadline?: string; // ISO 8601
}
```

### A.3 Outbound Webhook Payload

```typescript
interface OutboundWebhookPayload {
  event: string; // e.g., "task.created", "message.received"
  timestamp: string; // ISO 8601
  webhookId: number;
  data: {
    // Event-specific data
    [key: string]: any;
  };
  signature?: string; // HMAC-SHA256 if secret configured
}
```

---

## Appendix B: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `WEBHOOK_NOT_FOUND` | 404 | Webhook token does not exist |
| `WEBHOOK_INACTIVE` | 403 | Webhook is deactivated |
| `WEBHOOK_LIMIT_EXCEEDED` | 400 | Maximum 3 webhooks per user |
| `RATE_LIMIT_MINUTE` | 429 | Per-minute rate limit exceeded |
| `RATE_LIMIT_HOUR` | 429 | Per-hour rate limit exceeded |
| `INVALID_SIGNATURE` | 401 | HMAC signature verification failed |
| `INVALID_AUTH` | 401 | Bearer/API key authentication failed |
| `INVALID_PAYLOAD` | 400 | Request body validation failed |
| `VERIFICATION_FAILED` | 400 | Invalid verification code |
| `DELIVERY_FAILED` | 502 | Outbound webhook delivery failed |

---

## Appendix C: Changelog

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
