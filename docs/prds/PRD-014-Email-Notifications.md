# PRD-014: Email & Notifications Feature

**Document Version:** 1.0
**Last Updated:** January 11, 2026
**Status:** In Development
**Priority:** High
**Owner:** Engineering Team
**Feature Location:** `server/services/email.service.ts`, `server/api/routers/email.ts`, `server/_core/notification.ts`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories & Personas](#4-user-stories--personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [API Specifications](#8-api-specifications)
9. [Data Models](#9-data-models)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Dependencies & Integrations](#11-dependencies--integrations)
12. [Release Criteria](#12-release-criteria)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Future Considerations](#14-future-considerations)

---

## 1. Executive Summary

### 1.1 Purpose

The Email & Notifications feature provides a comprehensive multi-channel communication system for Bottleneck-Bots, enabling users to manage email accounts, automate 2FA code extraction, send multi-channel notifications, and integrate voice capabilities. This unified communication hub transforms fragmented messaging workflows into a streamlined, AI-assisted automation platform.

### 1.2 Feature Overview

| Component | Description | File Location |
|-----------|-------------|---------------|
| **Email Service** | SMTP-based email with OAuth2 authentication, template rendering, and AI-powered sentiment analysis | `server/services/email.service.ts` (30KB) |
| **Email Agent Panel** | Gmail 2FA code extraction UI with real-time monitoring and draft management | `client/src/components/EmailAgentPanel.tsx` |
| **Notification System** | Multi-channel alerts supporting email, in-app, and SMS channels | `server/_core/notification.ts` |
| **Email Router** | tRPC router for email operations with external system routing (Twilio) | `server/api/routers/email.ts` |
| **Email Campaigns** | Launch email sequences with tracking, analytics, and A/B testing | Planned enhancement |
| **Voice Transcription** | Convert audio to text using Whisper API | `server/_core/voiceTranscription.ts` |
| **Vapi Integration** | AI voice calling platform integration for automated phone outreach | `server/services/vapi.service.ts` |
| **Microsoft 365** | Microsoft Graph API integration for Outlook email support | Integrated in email service |
| **2FA Extractor Workflow** | n8n workflow for automated 2FA code extraction | `n8n-workflows/2-email-2fa-extractor.json` |

### 1.3 Target Users

| User Type | Primary Use Case |
|-----------|------------------|
| **Agency Owners** | Centralized client communication management at scale |
| **Marketing Teams** | Automated email campaigns with tracking and analytics |
| **Sales Representatives** | Lead follow-up automation with AI-drafted responses |
| **Customer Success** | Priority inbox management with sentiment-based routing |
| **Operations Teams** | 2FA extraction for automated browser workflows |
| **DevOps Engineers** | Multi-channel alerting for system notifications |

### 1.4 Key Capabilities

- **OAuth 2.0 Authentication**: Secure Gmail and Outlook account connections
- **AI-Powered Sentiment Analysis**: Automatic classification and prioritization
- **Intelligent Draft Generation**: Context-aware response suggestions
- **2FA Code Extraction**: Real-time extraction for browser automation
- **Multi-Channel Notifications**: Email, in-app, SMS, and voice alerts
- **Background Sync**: BullMQ-powered email synchronization
- **Voice Integration**: AI phone calls via Vapi.ai with transcription

---

## 2. Problem Statement

### 2.1 Current Challenges

| Challenge | Impact | Severity |
|-----------|--------|----------|
| **Email Overload** | Users spend 2-4 hours daily managing emails manually | High |
| **Delayed Responses** | Critical emails buried, leading to missed opportunities | Critical |
| **Context Switching** | Constant switching between email clients and productivity tools | Medium |
| **Inconsistent Communication** | No standardized response templates or tone guidelines | Medium |
| **Manual Prioritization** | No automated way to identify urgent vs. routine emails | High |
| **Platform Fragmentation** | Managing multiple email accounts across providers | High |
| **2FA Bottlenecks** | Manual 2FA code retrieval interrupts automated workflows | Critical |
| **Notification Silos** | Alerts scattered across multiple channels without unified management | Medium |
| **Voice Communication Gap** | No integrated voice calling for follow-ups | Medium |

### 2.2 Business Impact

| Problem | Quantified Impact |
|---------|-------------------|
| **Lost Revenue** | Delayed sales inquiry responses result in 35-50% lower conversion rates |
| **Customer Churn** | Slow support responses increase churn by up to 15% |
| **Productivity Loss** | Email management consumes 28% of the average knowledge worker's day |
| **Automation Blocks** | 2FA requirements interrupt 40% of automated browser-based workflows |
| **Missed Opportunities** | 23% of urgent emails are addressed >24 hours after receipt |

### 2.3 Opportunity

By integrating email management with AI capabilities and multi-channel notifications:

- **60-80% reduction** in email processing time
- **3x faster** response to high-priority communications
- **Consistent, professional** communication quality via AI drafts
- **Fully automated workflows** including 2FA handling
- **Unified notification hub** across email, SMS, voice, and in-app

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| ID | Goal | Description | Priority |
|----|------|-------------|----------|
| **G1** | Multi-Provider Email Integration | Enable secure OAuth 2.0 connection for Gmail and Outlook | P0 |
| **G2** | AI-Powered Email Processing | Automate sentiment analysis, importance scoring, and draft generation | P0 |
| **G3** | 2FA Automation | Extract and route 2FA codes to browser automation workflows | P0 |
| **G4** | Multi-Channel Notifications | Unified alerting across email, in-app, SMS, and voice | P1 |
| **G5** | Email Campaign Management | Support bulk email sequences with tracking and analytics | P1 |
| **G6** | Voice Communication Integration | AI-powered phone calls with transcription | P2 |

### 3.2 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Email Account Connections** | 80% of active users connect at least 1 account | Database tracking |
| **Average Response Time** | Reduce from 4hrs to <1hr for high-priority emails | Time delta tracking |
| **Draft Acceptance Rate** | >65% of AI drafts sent with minimal edits | Draft status tracking |
| **Sentiment Accuracy** | >85% accuracy on sentiment classification | User feedback/corrections |
| **Sync Reliability** | >99.5% successful sync rate | Job monitoring |
| **2FA Extraction Success** | >95% successful code extraction | Workflow logging |
| **Notification Delivery Rate** | >99% across all channels | Delivery tracking |
| **User Satisfaction** | NPS >50 for email features | User surveys |

### 3.3 Key Performance Indicators (KPIs)

| KPI | Target | Timeline |
|-----|--------|----------|
| **Daily Active Email Users (DAEU)** | 5,000+ | 3 months |
| **Emails Processed per Day** | 100,000+ | 3 months |
| **Drafts Generated per User** | 15+ per week | 3 months |
| **Draft Send Rate** | >60% | 3 months |
| **2FA Extractions per Day** | 10,000+ | 3 months |
| **Notification Volume** | 500,000+/month | 6 months |

---

## 4. User Stories & Personas

### 4.1 Personas

#### Persona 1: Marketing Manager (Maria)

| Attribute | Value |
|-----------|-------|
| **Role** | Marketing Manager at digital agency |
| **Primary Goals** | Launch email campaigns, track engagement, optimize messaging |
| **Pain Points** | Manual campaign management, inconsistent follow-ups |
| **Technical Proficiency** | Intermediate |

#### Persona 2: Operations Lead (Oscar)

| Attribute | Value |
|-----------|-------|
| **Role** | Operations Lead managing automated workflows |
| **Primary Goals** | Ensure 2FA codes reach automation workflows, minimize interruptions |
| **Pain Points** | Manual 2FA retrieval, workflow failures due to auth issues |
| **Technical Proficiency** | Advanced |

#### Persona 3: Sales Representative (Sarah)

| Attribute | Value |
|-----------|-------|
| **Role** | Sales rep managing 100+ prospects |
| **Primary Goals** | Quick response to inquiries, personalized follow-ups |
| **Pain Points** | Inbox overload, missed hot leads, repetitive responses |
| **Technical Proficiency** | Basic |

#### Persona 4: DevOps Engineer (David)

| Attribute | Value |
|-----------|-------|
| **Role** | DevOps engineer maintaining production systems |
| **Primary Goals** | Real-time alerting, incident notification across channels |
| **Pain Points** | Alert fatigue, missed critical notifications |
| **Technical Proficiency** | Expert |

### 4.2 User Stories

#### 4.2.1 Email Account Management

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-01** | As Maria, I want to connect my Gmail account using OAuth so that I can sync my emails securely | P0 | OAuth flow completes, tokens encrypted, initial sync triggered |
| **US-02** | As Oscar, I want to connect my Outlook/Microsoft 365 account so that I can manage work emails | P0 | Microsoft Graph OAuth completes, proper scopes granted |
| **US-03** | As Sarah, I want to view all my connected email accounts in one place | P0 | Account list shows provider, email, connection status, last sync |
| **US-04** | As Maria, I want to disconnect an email account when I no longer need it | P0 | Soft delete preserves data, tokens revoked, sync stops |
| **US-05** | As Oscar, I want my tokens refreshed automatically so I stay connected without re-authenticating | P0 | Token refresh occurs before expiration, no user intervention |

#### 4.2.2 Email Synchronization & Management

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-06** | As Sarah, I want my emails to sync automatically in the background | P0 | BullMQ job runs periodically, incremental sync uses cursors |
| **US-07** | As Maria, I want to manually trigger an email sync when needed | P1 | Manual sync button queues immediate job |
| **US-08** | As Oscar, I want to see when my emails were last synced | P1 | Last sync timestamp visible per account |
| **US-09** | As Sarah, I want to filter synced emails by read/unread status | P1 | Filter UI works, query performance <500ms |
| **US-10** | As David, I want to view sync history and status for troubleshooting | P2 | Sync history table shows status, errors, timing |

#### 4.2.3 AI Sentiment Analysis & Categorization

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-11** | As Sarah, I want emails automatically analyzed for sentiment | P0 | AI assigns positive/negative/neutral/mixed classification |
| **US-12** | As Maria, I want to see which emails require a response based on AI analysis | P0 | `requiresResponse` flag set, filterable in UI |
| **US-13** | As Sarah, I want emails categorized by type (sales, support, marketing) | P1 | Category field populated, filtering available |
| **US-14** | As Maria, I want to filter emails by importance level | P1 | High/medium/low importance filter works |
| **US-15** | As Oscar, I want to correct AI classifications to improve accuracy | P2 | Feedback mechanism updates classification |

#### 4.2.4 AI Draft Generation

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-16** | As Sarah, I want AI to automatically generate draft responses for high-priority emails | P0 | Auto-draft on high importance + requires response |
| **US-17** | As Maria, I want to manually request an AI draft for any email | P0 | Generate draft button available per email |
| **US-18** | As Sarah, I want to choose the tone for generated drafts | P1 | Professional/casual/friendly options |
| **US-19** | As Maria, I want to provide additional context to improve draft quality | P1 | Context field included in generation |
| **US-20** | As Oscar, I want to choose between different AI models | P2 | GPT-4/Claude model selection |

#### 4.2.5 Email Sending & Scheduling

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-21** | As Sarah, I want to send approved drafts directly through the platform | P0 | Send via Gmail/Outlook API, status updates |
| **US-22** | As Maria, I want to edit drafts before sending them | P0 | Inline editing of subject and body |
| **US-23** | As Sarah, I want sent emails to maintain the reply thread context | P1 | Thread ID preserved, appears in conversation |
| **US-24** | As Maria, I want to discard drafts I don't want to send | P1 | Discard button updates status |
| **US-25** | As Oscar, I want to track which drafts have been sent | P1 | Sent status with timestamp visible |
| **US-26** | As Maria, I want to schedule emails for future delivery | P1 | Schedule picker, BullMQ delayed job |
| **US-27** | As Sarah, I want to cancel scheduled emails before they are sent | P1 | Cancel removes job from queue |

#### 4.2.6 2FA Code Extraction

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-28** | As Oscar, I want the system to automatically extract 2FA codes from my Gmail | P0 | Regex extraction from email body/subject |
| **US-29** | As Oscar, I want extracted 2FA codes to be used in browser automation workflows | P0 | Code available via API within 30 seconds |
| **US-30** | As David, I want to configure which senders' 2FA codes should be extracted | P1 | Sender allowlist configuration |
| **US-31** | As Oscar, I want 2FA codes to expire after use or timeout | P1 | 5-minute TTL on extracted codes |

#### 4.2.7 Multi-Channel Notifications

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-32** | As David, I want to receive in-app notifications for critical events | P0 | Real-time toast notifications |
| **US-33** | As Oscar, I want email notifications for workflow completions | P1 | SMTP email sent with template |
| **US-34** | As David, I want SMS alerts for system emergencies | P1 | Twilio SMS delivery |
| **US-35** | As Maria, I want to configure notification preferences per channel | P1 | User preferences stored |
| **US-36** | As Oscar, I want notification history for audit purposes | P2 | Notification log queryable |

#### 4.2.8 Voice Integration

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| **US-37** | As Sarah, I want AI to make phone calls to leads on my behalf | P1 | Vapi call initiated with script |
| **US-38** | As Maria, I want call recordings and transcripts available | P1 | Recording URL + transcript stored |
| **US-39** | As Oscar, I want voice transcription for audio files | P2 | Whisper transcription <16MB files |

---

## 5. Functional Requirements

### 5.1 OAuth Authentication

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-01** | Gmail OAuth 2.0 | Support Gmail OAuth with scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`, `userinfo.email`, `userinfo.profile` | P0 |
| **FR-02** | Outlook OAuth 2.0 | Support Microsoft Graph OAuth with scopes: `offline_access`, `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`, `User.Read` | P0 |
| **FR-03** | State Parameter Validation | Generate and validate cryptographic state parameters to prevent CSRF attacks | P0 |
| **FR-04** | Token Encryption | Encrypt access and refresh tokens at rest using AES-256-GCM | P0 |
| **FR-05** | Automatic Token Refresh | Automatically refresh expired tokens using refresh tokens before expiration | P0 |
| **FR-06** | Multiple Account Support | Allow users to connect multiple email accounts per provider | P1 |
| **FR-07** | Scope Verification | Validate granted scopes match required scopes | P1 |
| **FR-08** | Token Revocation | Support token revocation on account disconnect | P1 |

### 5.2 Email Synchronization

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-09** | Initial Sync | Sync last 50 emails on account connection | P0 |
| **FR-10** | Incremental Sync | Use sync cursors/tokens for incremental updates | P0 |
| **FR-11** | Background Processing | Process sync jobs via BullMQ workers | P0 |
| **FR-12** | Duplicate Prevention | Prevent duplicate email storage using message IDs | P0 |
| **FR-13** | Rate Limiting | Implement provider-specific rate limiting (10 jobs/second) | P0 |
| **FR-14** | Manual Sync Trigger | Allow users to manually trigger email sync | P1 |
| **FR-15** | Sync Status Tracking | Track and display sync progress and history | P1 |
| **FR-16** | Concurrent Processing | Support up to 5 concurrent sync jobs per worker | P1 |
| **FR-17** | Configurable Sync Depth | Allow configuring number of emails to sync | P2 |

### 5.3 AI Sentiment Analysis

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-18** | Sentiment Classification | Classify emails as positive, negative, neutral, or mixed | P0 |
| **FR-19** | Sentiment Scoring | Assign sentiment scores from -100 (very negative) to 100 (very positive) | P0 |
| **FR-20** | Importance Detection | Classify importance as high, medium, or low | P0 |
| **FR-21** | Response Requirement | Detect if email requires a response | P0 |
| **FR-22** | Category Classification | Classify emails into categories (sales, support, marketing, internal, personal) | P1 |
| **FR-23** | Multi-Model Support | Support both Anthropic Claude and OpenAI GPT models | P1 |
| **FR-24** | Circuit Breaker | Implement circuit breaker for AI service resilience | P1 |
| **FR-25** | Batch Analysis | Analyze multiple emails in batch for efficiency | P2 |

### 5.4 Draft Generation

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-26** | Auto-Draft Generation | Automatically generate drafts for high-importance emails requiring response | P0 |
| **FR-27** | Manual Draft Generation | Allow users to request drafts for any email | P0 |
| **FR-28** | Tone Selection | Support professional, casual, and friendly tones | P1 |
| **FR-29** | Context Injection | Allow additional context to be provided for draft generation | P1 |
| **FR-30** | Model Selection | Allow users to choose between GPT-4, GPT-4-turbo, Claude-3-opus, Claude-3-sonnet | P2 |
| **FR-31** | HTML Formatting | Generate properly formatted HTML email bodies | P1 |
| **FR-32** | Subject Line Generation | Generate appropriate reply subject lines | P1 |
| **FR-33** | Signature Placeholder | Include professional signature placeholder in drafts | P2 |

### 5.5 Email Sending

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-34** | Send via Gmail API | Send emails through Gmail API with proper MIME formatting | P0 |
| **FR-35** | Send via Microsoft Graph | Send emails through Microsoft Graph API | P0 |
| **FR-36** | Draft Editing | Allow editing of subject and body before sending | P0 |
| **FR-37** | Thread Preservation | Maintain thread context when replying | P1 |
| **FR-38** | Draft Discarding | Allow users to discard/delete drafts | P1 |
| **FR-39** | Sent Status Tracking | Update draft status to "sent" with provider message ID | P1 |
| **FR-40** | CC/BCC Support | Support carbon copy and blind carbon copy recipients | P2 |

### 5.6 Email Scheduling

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-41** | Schedule Email | Allow scheduling emails for future delivery via BullMQ delayed jobs | P1 |
| **FR-42** | Cancel Scheduled | Allow cancellation of scheduled emails before send time | P1 |
| **FR-43** | View Scheduled | Display list of scheduled emails with send times | P2 |
| **FR-44** | Timezone Support | Support user timezone for scheduling | P2 |

### 5.7 2FA Code Extraction

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-45** | Pattern Recognition | Extract 6-digit 2FA codes using regex patterns | P0 |
| **FR-46** | Real-time Monitoring | Monitor inbox for new 2FA emails every 30 seconds (n8n workflow) | P0 |
| **FR-47** | Automation Integration | Provide 2FA codes to browser automation workflows via API | P0 |
| **FR-48** | Sender Filtering | Filter 2FA extraction to specific senders (e.g., noreply@gohighlevel.com) | P1 |
| **FR-49** | Code Expiration | Auto-expire extracted codes after 5 minutes | P1 |
| **FR-50** | Code Status Tracking | Track pending, completed, and expired 2FA requests | P1 |

### 5.8 Multi-Channel Notifications

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-51** | In-App Notifications | Send real-time notifications via WebSocket/SSE | P0 |
| **FR-52** | Email Notifications | Send templated email notifications via SMTP | P1 |
| **FR-53** | SMS Notifications | Send SMS notifications via Twilio integration | P1 |
| **FR-54** | Voice Notifications | Trigger AI voice calls for urgent notifications | P2 |
| **FR-55** | Notification Preferences | Allow users to configure channel preferences per event type | P1 |
| **FR-56** | Notification Templates | Support customizable notification templates | P2 |
| **FR-57** | Delivery Confirmation | Track notification delivery status per channel | P1 |
| **FR-58** | Rate Limiting | Prevent notification spam with rate limits | P1 |

### 5.9 Voice Transcription

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-59** | Audio Transcription | Transcribe audio files up to 16MB using Whisper API | P1 |
| **FR-60** | Language Detection | Automatically detect audio language | P1 |
| **FR-61** | Segment Timestamps | Provide word/segment-level timestamps | P2 |
| **FR-62** | Multi-Format Support | Support webm, mp3, wav, ogg, m4a audio formats | P1 |
| **FR-63** | Custom Prompts | Allow custom prompts for domain-specific transcription | P2 |

### 5.10 Vapi Voice Integration

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-64** | Outbound Calls | Create AI-powered outbound phone calls via Vapi API | P1 |
| **FR-65** | Call Status Tracking | Poll and track call status (pending, calling, answered, completed) | P1 |
| **FR-66** | Recording Retrieval | Retrieve and store call recording URLs | P1 |
| **FR-67** | Transcript Retrieval | Retrieve and store call transcripts | P1 |
| **FR-68** | Voice Configuration | Configure voice type (male/female/neutral), speed, language | P2 |
| **FR-69** | Call Termination | Support manual call termination via API | P2 |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Req ID | Requirement | Target | Description |
|--------|-------------|--------|-------------|
| **NFR-01** | Sync Latency | < 30 seconds | Time from sync trigger to job completion for 50 emails |
| **NFR-02** | Draft Generation Time | < 10 seconds | Time to generate AI draft response |
| **NFR-03** | Send Latency | < 5 seconds | Time from send request to provider confirmation |
| **NFR-04** | API Response Time | < 500ms | P95 response time for email router endpoints |
| **NFR-05** | Worker Throughput | > 1000 emails/hour | Maximum emails processed per hour per worker |
| **NFR-06** | 2FA Extraction Latency | < 30 seconds | Time from email receipt to code availability |
| **NFR-07** | Notification Delivery | < 2 seconds | In-app notification delivery time |
| **NFR-08** | Transcription Speed | < 1x real-time | Audio transcription processing speed |

### 6.2 Reliability

| Req ID | Requirement | Target | Description |
|--------|-------------|--------|-------------|
| **NFR-09** | Sync Success Rate | > 99.5% | Percentage of successful sync jobs |
| **NFR-10** | API Availability | > 99.9% | Email router uptime |
| **NFR-11** | Retry Logic | 3 attempts | Number of retry attempts with exponential backoff |
| **NFR-12** | Circuit Breaker | 50% threshold | Open circuit after 50% failure rate |
| **NFR-13** | Job Recovery | Automatic | Resume failed jobs on worker restart |
| **NFR-14** | Notification Delivery | > 99% | Cross-channel notification delivery rate |
| **NFR-15** | Data Durability | 99.99% | No data loss for synced emails |

### 6.3 Security

| Req ID | Requirement | Description |
|--------|-------------|-------------|
| **NFR-16** | Token Encryption | AES-256-GCM encryption for all OAuth tokens |
| **NFR-17** | State Validation | Cryptographically secure state parameters (CSRF protection) |
| **NFR-18** | Minimal Scope | Request only necessary OAuth scopes |
| **NFR-19** | Secure Transmission | All API calls over HTTPS/TLS 1.3 |
| **NFR-20** | Key Management | Encryption keys stored in environment variables |
| **NFR-21** | Data Isolation | User data isolated by userId in all queries |
| **NFR-22** | Audit Logging | Log all email access and modifications |
| **NFR-23** | Input Validation | Zod schema validation on all inputs |

### 6.4 Scalability

| Req ID | Requirement | Target | Description |
|--------|-------------|--------|-------------|
| **NFR-24** | Concurrent Users | 10,000 | Maximum concurrent connected accounts |
| **NFR-25** | Emails per Account | 100,000 | Maximum synced emails per account |
| **NFR-26** | Worker Scaling | Horizontal | Support horizontal worker scaling |
| **NFR-27** | Database Partitioning | By userId | Partition large tables by user ID |
| **NFR-28** | Queue Capacity | 100,000 jobs | Maximum pending jobs in queue |

### 6.5 Compliance

| Req ID | Requirement | Description |
|--------|-------------|-------------|
| **NFR-29** | GDPR Compliance | Support data deletion and export requests |
| **NFR-30** | OAuth Best Practices | Follow Google and Microsoft OAuth guidelines |
| **NFR-31** | Data Retention | Configurable email retention period |
| **NFR-32** | CAN-SPAM Compliance | Include unsubscribe mechanism in campaigns |
| **NFR-33** | TCPA Compliance | Voice calling compliance with consent tracking |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+-------------------+     +-------------------+     +-------------------+
|   Frontend (UI)   |     |   API Gateway     |     |   Email Router    |
|   React/Next.js   | --> |   tRPC Server     | --> |   (email.ts)      |
+-------------------+     +-------------------+     +-------------------+
                                                            |
                    +---------------------------------------+
                    |                   |                   |
                    v                   v                   v
            +---------------+   +---------------+   +---------------+
            | OAuth Service |   | Email Service |   | AI Service    |
            | (email-auth)  |   | (email.svc)   |   | (Claude/GPT)  |
            +---------------+   +---------------+   +---------------+
                    |                   |                   |
                    v                   v                   v
            +---------------+   +---------------+   +---------------+
            |   PostgreSQL  |   |   BullMQ      |   | Notification  |
            |   (Drizzle)   |   |   Workers     |   | Service       |
            +---------------+   +---------------+   +---------------+
                                       |                   |
                    +------------------+-------------------+
                    |                  |                   |
                    v                  v                   v
            +---------------+   +---------------+   +---------------+
            |     Redis     |   |   Vapi.ai     |   |   Twilio      |
            |   Queue/Cache |   |   Voice API   |   |   SMS API     |
            +---------------+   +---------------+   +---------------+
                    |
                    v
            +---------------+
            |   n8n         |
            | 2FA Workflow  |
            +---------------+
```

### 7.2 Component Details

#### 7.2.1 Email Service (`email.service.ts`)

Primary service handling OAuth flows, email operations, and AI integration.

**Key Methods:**
- `getAuthUrl(provider, state)`: Generate OAuth authorization URL
- `handleCallback(provider, code)`: Exchange auth code for tokens
- `refreshToken(provider, refreshToken)`: Refresh expired access token
- `fetchEmails(provider, accessToken, options)`: Fetch emails from provider
- `sendEmail(provider, accessToken, email)`: Send email via provider
- `analyzeSentiment(emailContent)`: Analyze email sentiment via AI
- `generateDraft(emailContent, options)`: Generate draft via AI

**Encryption:**
- **Algorithm**: AES-256-GCM
- **IV**: Random 16-byte IV per encryption
- **Format**: `{iv}:{authTag}:{encrypted}`
- **Key**: 64-character hex key from `ENCRYPTION_KEY` environment variable

#### 7.2.2 Email Router (`email.ts`)

tRPC router exposing email operations via API.

**Endpoints:**

| Endpoint | Type | Description |
|----------|------|-------------|
| `email.getAuthUrl` | Mutation | Generate OAuth authorization URL |
| `email.handleCallback` | Mutation | Exchange auth code for tokens |
| `email.listConnections` | Query | List user's connected accounts |
| `email.disconnectAccount` | Mutation | Disconnect an email account |
| `email.syncEmails` | Mutation | Trigger email sync job |
| `email.getEmails` | Query | Get synced emails with filters |
| `email.getDrafts` | Query | Get user's drafts with filters |
| `email.generateDraft` | Mutation | Generate AI draft for an email |
| `email.sendDraft` | Mutation | Send an approved draft |
| `email.deleteDraft` | Mutation | Discard a draft |
| `email.analyzeSentiment` | Mutation | Analyze email sentiment |
| `email.getStatus` | Query | Get email monitoring status/stats |

#### 7.2.3 Notification Service (`notification.ts`)

Handles multi-channel notification dispatch.

**Method:**
- `notifyOwner(payload)`: Dispatch notification through Manus Notification Service

**Payload Limits:**
- Title: 1,200 characters max
- Content: 20,000 characters max

#### 7.2.4 Voice Transcription (`voiceTranscription.ts`)

Audio-to-text conversion using Whisper API.

**Method:**
- `transcribeAudio(options)`: Transcribe audio file from URL

**Supported Formats:**
- webm, mp3, wav, ogg, m4a
- Maximum file size: 16MB

**Response:**
- Full transcript text
- Detected language
- Segment-level timestamps
- Confidence scores

#### 7.2.5 Vapi Service (`vapi.service.ts`)

AI voice calling platform integration.

**Methods:**
- `createCall(phoneNumber, script, settings)`: Initiate AI phone call
- `getCallStatus(vapiCallId)`: Get current call status
- `getTranscript(vapiCallId)`: Get call transcript
- `endCall(vapiCallId)`: Terminate ongoing call
- `listCalls(limit, offset)`: List all calls
- `updateCall(vapiCallId, updates)`: Update call settings mid-call

**Resilience:**
- Circuit breaker pattern
- Exponential backoff retry
- E.164 phone number validation

#### 7.2.6 n8n 2FA Workflow (`2-email-2fa-extractor.json`)

Automated workflow for 2FA code extraction.

**Workflow Steps:**
1. **Schedule Trigger**: Runs every 30 seconds
2. **Get Pending Requests**: Query `pending_2fa_requests` table
3. **Search Gmail**: Query Gmail API for verification emails
4. **Extract Codes**: Regex extraction of 6-digit codes
5. **Update Request**: Mark request as completed with code

**Database Integration:**
- Table: `pending_2fa_requests`
- Status: pending -> completed
- TTL: 5 minutes

### 7.3 Background Workers

#### 7.3.1 Email Worker

| Job Type | Description | Concurrency |
|----------|-------------|-------------|
| EMAIL_SYNC | Sync emails from provider, analyze sentiment, auto-generate drafts | 5 jobs |
| EMAIL_DRAFT | Generate draft response for a specific thread | 3 jobs |

**Worker Configuration:**
- Queue: "email"
- Rate Limit: 10 jobs/second
- Retry: 3 attempts with exponential backoff
- Timeout: 5 minutes

#### 7.3.2 Voice Worker

| Job Type | Description | Concurrency |
|----------|-------------|-------------|
| VOICE_CALL | Process outbound AI phone calls | 3 jobs |

**Worker Configuration:**
- Queue: "voice"
- Rate Limit: 5 jobs/second
- Retry: 2 attempts with exponential backoff
- Timeout: 15 minutes

---

## 8. API Specifications

### 8.1 Email Router API

#### 8.1.1 getAuthUrl

```typescript
// Request
input: {
  provider: "gmail" | "outlook"
}

// Response
{
  authUrl: string;
  state: string;
}
```

#### 8.1.2 handleCallback

```typescript
// Request
input: {
  provider: "gmail" | "outlook";
  code: string;
  state: string;
}

// Response
{
  success: boolean;
  connection: {
    id: number;
    provider: string;
    email: string;
    isActive: boolean;
  }
}
```

#### 8.1.3 getEmails

```typescript
// Request
input: {
  connectionId?: number;
  limit?: number;        // default: 20, max: 100
  offset?: number;       // default: 0
  unreadOnly?: boolean;
  sentiment?: "positive" | "negative" | "neutral" | "mixed";
  requiresResponse?: boolean;
}

// Response
{
  emails: SyncedEmail[];
  total: number;
  limit: number;
  offset: number;
}
```

#### 8.1.4 generateDraft

```typescript
// Request
input: {
  emailId: number;
  tone?: "professional" | "casual" | "friendly";
  model?: "gpt-4" | "gpt-4-turbo" | "claude-3-opus" | "claude-3-sonnet";
  context?: string;
}

// Response
{
  draft: EmailDraft;
}
```

#### 8.1.5 sendDraft

```typescript
// Request
input: {
  draftId: number;
  customizations?: {
    subject?: string;
    body?: string;
  }
}

// Response
{
  success: boolean;
  messageId: string;
}
```

### 8.2 Notification API

#### 8.2.1 notifyOwner

```typescript
// Request
payload: {
  title: string;   // max 1,200 chars
  content: string; // max 20,000 chars
}

// Response
boolean // true if accepted, false if delivery failed
```

### 8.3 Voice API

#### 8.3.1 createCall (Vapi Service)

```typescript
// Request
phoneNumber: string; // E.164 format
script: string;
settings?: {
  voice?: "male" | "female" | "neutral";
  speed?: number;         // 0.5 to 2.0
  language?: string;      // e.g., "en-US"
  model?: string;         // e.g., "gpt-4"
  temperature?: number;   // 0 to 1
  maxDuration?: number;   // seconds
  recordCall?: boolean;
  transcribeCall?: boolean;
  detectVoicemail?: boolean;
}

// Response
{
  callId: string;
  status: string;
  message?: string;
}
```

### 8.4 Transcription API

#### 8.4.1 transcribeAudio

```typescript
// Request
options: {
  audioUrl: string;     // URL to audio file
  language?: string;    // ISO language code
  prompt?: string;      // Custom prompt
}

// Response (Success)
{
  task: "transcribe";
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
}

// Response (Error)
{
  error: string;
  code: "FILE_TOO_LARGE" | "INVALID_FORMAT" | "TRANSCRIPTION_FAILED" | "UPLOAD_FAILED" | "SERVICE_ERROR";
  details?: string;
}
```

---

## 9. Data Models

### 9.1 email_connections Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| provider | VARCHAR(20) | "gmail" or "outlook" |
| email | VARCHAR(320) | Connected email address |
| accessToken | TEXT | Encrypted OAuth access token |
| refreshToken | TEXT | Encrypted OAuth refresh token |
| expiresAt | TIMESTAMP | Token expiration timestamp |
| scope | TEXT | Granted OAuth scopes |
| metadata | JSONB | Provider-specific metadata |
| isActive | BOOLEAN | Active connection status |
| lastSyncedAt | TIMESTAMP | Last sync timestamp |
| syncCursor | TEXT | Provider sync cursor |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### 9.2 synced_emails Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| connectionId | INTEGER | Reference to email_connections |
| messageId | TEXT (UNIQUE) | Provider's message ID |
| threadId | TEXT | Provider's thread ID |
| subject | TEXT | Email subject |
| from | JSONB | Sender address object |
| to | JSONB | Recipient addresses array |
| cc | JSONB | CC addresses array |
| bcc | JSONB | BCC addresses array |
| replyTo | JSONB | Reply-to addresses |
| date | TIMESTAMP | Email send date |
| body | TEXT | Email body content |
| bodyType | VARCHAR(10) | "html" or "text" |
| snippet | TEXT | Email preview snippet |
| labels | JSONB | Provider labels/categories |
| isRead | BOOLEAN | Read status |
| isStarred | BOOLEAN | Starred status |
| hasAttachments | BOOLEAN | Has attachments flag |
| attachments | JSONB | Attachment metadata |
| headers | JSONB | Email headers |
| rawData | JSONB | Complete provider response |
| sentiment | VARCHAR(20) | AI sentiment classification |
| sentimentScore | INTEGER | Sentiment score (-100 to 100) |
| importance | VARCHAR(20) | AI importance level |
| category | VARCHAR(50) | AI category classification |
| requiresResponse | BOOLEAN | AI response requirement |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### 9.3 email_drafts Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| emailId | INTEGER | Reference to synced_emails |
| connectionId | INTEGER | Reference to email_connections |
| subject | TEXT | Draft subject |
| body | TEXT | Draft body content |
| bodyType | VARCHAR(10) | "html" or "text" |
| tone | VARCHAR(20) | Generation tone |
| status | VARCHAR(20) | pending/approved/sent/discarded |
| model | VARCHAR(50) | AI model used |
| generatedAt | TIMESTAMP | Generation timestamp |
| sentAt | TIMESTAMP | Send timestamp |
| providerId | TEXT | Provider message ID after send |
| metadata | JSONB | Generation metadata |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### 9.4 email_sync_history Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| connectionId | INTEGER | Reference to email_connections |
| jobId | TEXT | BullMQ job ID |
| status | VARCHAR(20) | pending/running/completed/failed |
| emailsFetched | INTEGER | Number of emails fetched |
| emailsProcessed | INTEGER | Number of emails processed |
| draftsGenerated | INTEGER | Number of drafts generated |
| error | TEXT | Error message if failed |
| startedAt | TIMESTAMP | Job start time |
| completedAt | TIMESTAMP | Job completion time |
| duration | INTEGER | Duration in milliseconds |
| metadata | JSONB | Additional job details |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### 9.5 pending_2fa_requests Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| status | VARCHAR(20) | pending/completed/expired |
| code | VARCHAR(10) | Extracted 2FA code |
| sender | VARCHAR(320) | Expected sender email |
| created_at | TIMESTAMP | Request creation time |
| completed_at | TIMESTAMP | Code extraction time |
| expires_at | TIMESTAMP | Request expiration (5 min) |

### 9.6 notification_log Table (Proposed)

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| channel | VARCHAR(20) | email/in-app/sms/voice |
| title | TEXT | Notification title |
| content | TEXT | Notification content |
| status | VARCHAR(20) | pending/delivered/failed |
| deliveredAt | TIMESTAMP | Delivery timestamp |
| error | TEXT | Error message if failed |
| metadata | JSONB | Channel-specific data |
| createdAt | TIMESTAMP | Record creation time |

---

## 10. UI/UX Requirements

### 10.1 Email Agent Panel

**Location:** `client/src/components/EmailAgentPanel.tsx`

#### 10.1.1 Connection State

| State | UI Display |
|-------|------------|
| **Not Connected** | Large CTA button "Connect Gmail / Outlook", OAuth benefits list |
| **Connected (Idle)** | Account info, "Start Monitoring" button |
| **Connected (Active)** | Real-time monitoring status, activity feed |

#### 10.1.2 Inbox Analytics Widget

| Metric | Display |
|--------|---------|
| Unread | Count with teal badge |
| Drafted | Count with emerald badge |
| Needs Review | Count with amber badge |
| Reply Rate | Percentage |

#### 10.1.3 Agent Settings

| Setting | Default | UI Control |
|---------|---------|------------|
| Auto-Draft Responses | ON | Toggle switch |
| Auto-Send (High Confidence) | OFF | Toggle switch |
| Tone Matching | ON | Toggle switch |

#### 10.1.4 Draft Cards

Each draft card displays:
- Status badge (DRAFT, SENT, NEEDS_REVIEW)
- Timestamp
- Subject line
- Recipient (To:)
- Preview text (monospace font)
- Sentiment indicator
- AI Confidence percentage (for NEEDS_REVIEW)

**Actions:**
- Approve & Send (green button)
- Discard (red button)
- Edit (on hover)

### 10.2 Notification Preferences UI (Proposed)

| Section | Options |
|---------|---------|
| **Email Notifications** | Sync complete, Draft ready, Weekly digest |
| **In-App Notifications** | All events, Critical only, None |
| **SMS Alerts** | Phone number, Enable/disable, Critical only |
| **Voice Alerts** | Phone number, Emergency only |

### 10.3 2FA Status Dashboard (Proposed)

| Component | Purpose |
|-----------|---------|
| **Pending Requests** | List of awaiting 2FA requests with countdown |
| **Recent Extractions** | History of extracted codes with timestamps |
| **Sender Configuration** | Allowlist of 2FA sender addresses |
| **Stats** | Success rate, average extraction time |

### 10.4 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All interactive elements focusable |
| **Screen Reader** | ARIA labels on status badges and buttons |
| **Color Contrast** | WCAG AA compliance for all text |
| **Focus Indicators** | Visible focus rings on interactive elements |

---

## 11. Dependencies & Integrations

### 11.1 Internal Dependencies

| Dependency | Description | Status |
|------------|-------------|--------|
| User Authentication | User sessions and JWT handling | Completed |
| Database (Drizzle + PostgreSQL) | Data persistence layer | Completed |
| Redis | Job queue and caching | Completed |
| BullMQ Workers | Background job processing | Completed |
| tRPC Router | API layer | Completed |
| Logger Service (Pino) | Structured logging | Completed |
| Retry/Circuit Breaker | Resilience patterns | Completed |
| Credit System | Usage billing for voice calls | Completed |

### 11.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `googleapis` | ^140.0.0 | Gmail API client |
| `google-auth-library` | ^9.0.0 | Google OAuth |
| `@microsoft/microsoft-graph-client` | ^3.0.0 | Outlook/Graph API |
| `@anthropic-ai/sdk` | ^0.20.0 | Claude AI integration |
| `openai` | ^4.0.0 | GPT AI integration |
| `bullmq` | ^5.0.0 | Job queue processing |
| `ioredis` | ^5.0.0 | Redis client |
| `zod` | ^3.0.0 | Schema validation |
| `drizzle-orm` | ^0.30.0 | Database ORM |

### 11.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| Google OAuth | Gmail authentication | Yes (for Gmail) |
| Microsoft Azure AD | Outlook authentication | Yes (for Outlook) |
| Anthropic API | Claude AI models | Yes (one AI required) |
| OpenAI API | GPT AI models | Optional |
| Vapi.ai | AI voice calling | Optional |
| Twilio | SMS notifications | Optional |
| Manus Notification Service | Internal notifications | Yes |
| Whisper API (Forge) | Voice transcription | Optional |
| n8n | Workflow automation | Optional (2FA) |

### 11.4 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GMAIL_CLIENT_ID` | Google OAuth client ID | Yes (for Gmail) |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret | Yes (for Gmail) |
| `GMAIL_REDIRECT_URI` | Gmail OAuth callback URL | Yes (for Gmail) |
| `OUTLOOK_CLIENT_ID` | Microsoft OAuth client ID | Yes (for Outlook) |
| `OUTLOOK_CLIENT_SECRET` | Microsoft OAuth client secret | Yes (for Outlook) |
| `OUTLOOK_REDIRECT_URI` | Outlook OAuth callback URL | Yes (for Outlook) |
| `ENCRYPTION_KEY` | 64-char hex encryption key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | Conditional |
| `OPENAI_API_KEY` | OpenAI API key | Conditional |
| `VAPI_API_KEY` | Vapi.ai API key | Optional |
| `VAPI_API_URL` | Vapi API base URL | Optional |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Optional |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Optional |
| `TWILIO_PHONE_NUMBER` | Twilio sender number | Optional |
| `BUILT_IN_FORGE_API_URL` | Whisper API URL | Optional |
| `BUILT_IN_FORGE_API_KEY` | Whisper API key | Optional |
| `APP_URL` | Application base URL | Yes |

---

## 12. Release Criteria

### 12.1 Phase 1: Core Email Integration (MVP)

**Target:** Week 1-4

| Criterion | Acceptance Test |
|-----------|-----------------|
| Gmail OAuth | User can connect Gmail account, tokens encrypted |
| Outlook OAuth | User can connect Outlook account, tokens encrypted |
| Account Management | User can view and disconnect accounts |
| Initial Sync | 50 emails synced on connection |
| Incremental Sync | Subsequent syncs use cursors, no duplicates |
| Background Jobs | BullMQ worker processes sync jobs |
| Basic UI | Email Agent Panel displays connection status |

**Exit Criteria:**
- [ ] 99.5% sync success rate
- [ ] <30 second sync latency
- [ ] All OAuth tokens encrypted at rest
- [ ] Unit tests >80% coverage

### 12.2 Phase 2: AI Features

**Target:** Week 5-8

| Criterion | Acceptance Test |
|-----------|-----------------|
| Sentiment Analysis | All synced emails classified with sentiment |
| Importance Scoring | High/medium/low importance assigned |
| Draft Generation | AI drafts generated for high-priority emails |
| Tone Selection | Professional/casual/friendly tones work |
| Multi-Model Support | Both Claude and GPT models functional |
| Circuit Breaker | AI failures handled gracefully |

**Exit Criteria:**
- [ ] >85% sentiment accuracy (manual validation)
- [ ] <10 second draft generation
- [ ] >65% draft acceptance rate
- [ ] Fallback to alternate AI provider works

### 12.3 Phase 3: Email Operations

**Target:** Week 9-12

| Criterion | Acceptance Test |
|-----------|-----------------|
| Draft Editing | Subject and body editable before send |
| Send via Gmail | Email sent, appears in sent folder |
| Send via Outlook | Email sent, appears in sent folder |
| Thread Preservation | Replies maintain thread context |
| Draft Status Tracking | Status updates to "sent" with provider ID |
| Draft Discarding | Discard updates status, prevents send |

**Exit Criteria:**
- [ ] <5 second send latency
- [ ] 100% thread preservation accuracy
- [ ] All draft lifecycle states functional
- [ ] E2E tests passing

### 12.4 Phase 4: 2FA Automation

**Target:** Week 13-14

| Criterion | Acceptance Test |
|-----------|-----------------|
| n8n Workflow | 2FA extractor workflow deployed |
| Pattern Recognition | 6-digit codes extracted accurately |
| Real-time Monitoring | New emails checked every 30 seconds |
| API Integration | Codes available via API within 30 seconds |
| Code Expiration | Codes expire after 5 minutes |

**Exit Criteria:**
- [ ] >95% extraction success rate
- [ ] <30 second extraction latency
- [ ] Integration with browser automation verified

### 12.5 Phase 5: Multi-Channel Notifications

**Target:** Week 15-18

| Criterion | Acceptance Test |
|-----------|-----------------|
| In-App Notifications | Real-time notifications delivered |
| Email Notifications | SMTP emails sent with templates |
| SMS Notifications | Twilio SMS delivered |
| Notification Preferences | User preferences respected |
| Delivery Tracking | Status tracked per notification |

**Exit Criteria:**
- [ ] >99% delivery rate across channels
- [ ] <2 second in-app notification latency
- [ ] Preferences UI functional

### 12.6 Phase 6: Voice Integration

**Target:** Week 19-22

| Criterion | Acceptance Test |
|-----------|-----------------|
| Vapi Integration | Outbound calls initiated |
| Call Status Tracking | Status polling works |
| Recording Retrieval | Recording URLs stored |
| Transcript Retrieval | Transcripts stored |
| Voice Transcription | Audio files transcribed |

**Exit Criteria:**
- [ ] >95% call completion rate
- [ ] Recordings available within 5 minutes
- [ ] Transcription accuracy >95%

### 12.7 Security Checklist

- [ ] All tokens encrypted with AES-256-GCM
- [ ] HTTPS/TLS 1.3 for all external calls
- [ ] OAuth state prevents CSRF attacks
- [ ] User data properly isolated by userId
- [ ] Audit logs capture email access events
- [ ] No sensitive data in logs
- [ ] Penetration testing completed

### 12.8 Performance Validation

- [ ] API endpoints respond within 500ms (P95)
- [ ] Sync completes within 30 seconds for 50 emails
- [ ] Draft generation completes within 10 seconds
- [ ] System handles 10,000 concurrent connections
- [ ] Load testing at 2x expected peak traffic

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **API Rate Limiting** | High | Medium | Implement rate limiting, backoff strategies, queue throttling |
| **Token Expiration Failures** | Medium | High | Automatic refresh before expiry, graceful degradation, user notification |
| **AI Service Outages** | Low | High | Circuit breaker pattern, fallback to alternate provider, queue for retry |
| **Provider API Changes** | Medium | High | Abstract provider interfaces, version pinning, monitoring |
| **Encryption Key Compromise** | Low | Critical | Key rotation mechanism, HSM consideration, access audit |
| **2FA Timing Issues** | Medium | Medium | Increase poll frequency, code TTL optimization |
| **Email Parsing Failures** | Medium | Medium | Robust regex patterns, fallback extraction methods |

### 13.2 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **OAuth Token Theft** | Low | Critical | Encryption at rest, TLS in transit, secure storage |
| **CSRF in OAuth Flow** | Medium | High | State parameter validation, short expiry |
| **Email Data Breach** | Low | Critical | Encryption, access controls, audit logging |
| **Privilege Escalation** | Low | High | Scope validation, user isolation |
| **2FA Code Interception** | Low | Critical | Short TTL, secure API access, audit logging |

### 13.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low Adoption** | Medium | High | User onboarding, value demonstration, gradual rollout |
| **Privacy Concerns** | Medium | Medium | Clear privacy policy, opt-in consent, data minimization |
| **Provider Policy Changes** | Low | High | Compliance monitoring, multiple provider support |
| **AI Response Quality** | Medium | Medium | Human review workflow, feedback loop, model tuning |
| **Notification Fatigue** | Medium | Low | Smart notification grouping, user preferences |

### 13.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Worker Failures** | Medium | Medium | Job retry logic, dead-letter queues, monitoring |
| **Database Performance** | Low | High | Indexing, partitioning, connection pooling |
| **Cost Overruns (AI)** | Medium | Medium | Usage monitoring, caching, model selection |
| **n8n Workflow Failures** | Medium | Medium | Health monitoring, alerting, manual fallback |
| **Twilio/Vapi Outages** | Low | Medium | Fallback channels, queue delayed delivery |

### 13.5 Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **GDPR Non-Compliance** | Low | Critical | Data deletion capability, export features, consent tracking |
| **CAN-SPAM Violations** | Medium | Medium | Unsubscribe mechanisms, sender identification |
| **TCPA Violations (Voice)** | Medium | High | Consent tracking, voicemail detection, DNC list |

---

## 14. Future Considerations

### 14.1 Near-Term Enhancements (v1.1 - v1.5)

| Feature | Description | Timeline |
|---------|-------------|----------|
| **Email Templates Library** | Pre-built response templates with customization | v1.1 |
| **Attachment Handling** | Upload, download, and process email attachments | v1.1 |
| **Email Scheduling UI** | Visual scheduler for delayed email sending | v1.2 |
| **Notification History** | Searchable log of all sent notifications | v1.2 |
| **Multi-Language AI** | Draft generation in multiple languages | v1.3 |
| **Email Analytics Dashboard** | Charts and metrics for email performance | v1.3 |
| **A/B Testing for Drafts** | Test different response styles | v1.4 |
| **Webhook Notifications** | HTTP callbacks for external integrations | v1.4 |
| **Advanced Filtering** | Complex email search queries | v1.5 |

### 14.2 Long-Term Roadmap (v2.0+)

| Feature | Description | Timeline |
|---------|-------------|----------|
| **Calendar Integration** | Sync calendar events, smart meeting scheduling | v2.0 |
| **Shared Inbox** | Team collaboration on email management | v2.0 |
| **IMAP/SMTP Support** | Support for custom email servers | v2.0 |
| **Mobile Push Notifications** | Native mobile app notifications | v2.0 |
| **Email Forwarding Rules** | Automated email routing based on rules | v2.1 |
| **CRM Integrations** | Salesforce, HubSpot, Pipedrive sync | v2.1 |
| **Inbound Voice Calls** | Receive and route incoming calls | v2.2 |
| **Custom Voice Cloning** | Brand-specific AI voices | v2.2 |
| **Natural Language Query** | "Show me urgent emails from last week" | v3.0 |
| **Predictive Analytics** | ML-based email response predictions | v3.0 |

### 14.3 Technical Debt Considerations

| Item | Description | Priority |
|------|-------------|----------|
| **Service Decomposition** | Split email.service.ts into smaller modules | Medium |
| **Test Coverage** | Increase E2E test coverage to >90% | High |
| **Performance Optimization** | Batch AI calls, optimize database queries | Medium |
| **Documentation** | Complete API documentation with examples | High |
| **Monitoring Enhancement** | Add detailed metrics and dashboards | Medium |

### 14.4 Integration Opportunities

| Integration | Value Proposition |
|-------------|-------------------|
| **Slack** | Team notification channel |
| **Microsoft Teams** | Enterprise collaboration |
| **Zapier** | No-code automation connections |
| **WhatsApp Business** | Multi-channel messaging |
| **Intercom** | Customer support integration |
| **Zendesk** | Ticketing system sync |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **OAuth 2.0** | Industry-standard authorization framework for secure API access |
| **BullMQ** | Redis-based queue for Node.js background jobs |
| **Sentiment Analysis** | AI-powered classification of emotional tone in text |
| **Circuit Breaker** | Design pattern to prevent cascading failures |
| **2FA** | Two-Factor Authentication requiring a secondary verification code |
| **tRPC** | End-to-end typesafe API framework for TypeScript |
| **Drizzle** | TypeScript ORM for SQL databases |
| **Vapi.ai** | AI-powered voice calling platform |
| **Whisper** | OpenAI's speech-to-text transcription model |
| **n8n** | Open-source workflow automation platform |
| **Microsoft Graph** | Microsoft's unified API for Office 365 services |

---

## Appendix B: Related Documents

| Document | Description |
|----------|-------------|
| PRD-05: Email Integration | Original email integration PRD |
| PRD-06: Voice Agent | Voice calling feature PRD |
| AUTHENTICATION_GUIDE.md | OAuth implementation details |
| API_DEVELOPER_GUIDE.md | API usage documentation |
| TRPC_ENDPOINTS_REFERENCE.md | Endpoint specifications |
| DATABASE_SCHEMA.md | Database design documentation |
| REDIS_CACHE_USAGE.md | Redis caching strategies |

---

## Appendix C: API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `EMAIL_CONNECTION_NOT_FOUND` | 404 | Email connection does not exist |
| `EMAIL_CONNECTION_INACTIVE` | 400 | Email connection is disabled |
| `EMAIL_NOT_FOUND` | 404 | Synced email does not exist |
| `DRAFT_NOT_FOUND` | 404 | Email draft does not exist |
| `DRAFT_ALREADY_SENT` | 400 | Draft has already been sent |
| `INVALID_STATE` | 400 | OAuth state parameter invalid or expired |
| `PROVIDER_MISMATCH` | 400 | OAuth provider doesn't match request |
| `TOKEN_REFRESH_FAILED` | 500 | Failed to refresh OAuth token |
| `AI_SERVICE_ERROR` | 500 | AI service unavailable or failed |
| `ENCRYPTION_ERROR` | 500 | Encryption key not configured |
| `TRANSCRIPTION_FAILED` | 500 | Voice transcription failed |
| `INVALID_PHONE_NUMBER` | 400 | Phone number format invalid |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits for operation |

---

## Appendix D: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Engineering Team | Initial comprehensive PRD creation |

---

**Document Status**: Ready for Review
**Next Review Date**: 2026-01-18
**Approvers**: Product Manager, Engineering Lead, Security Lead
