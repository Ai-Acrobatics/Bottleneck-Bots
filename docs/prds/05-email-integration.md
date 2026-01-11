# PRD-05: Email Integration

**Document Version:** 1.0
**Last Updated:** January 11, 2026
**Status:** In Development
**Priority:** High
**Owner:** Engineering Team

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

### 1.1 Purpose

The Email Integration feature enables Bottleneck-Bots users to connect their Gmail and Outlook email accounts, synchronize emails in the background, leverage AI for sentiment analysis and automated draft generation, and send/schedule emails directly through the platform. This feature transforms email management from a manual, time-consuming task into an AI-assisted, automated workflow.

### 1.2 Feature Summary

| Capability | Description |
|------------|-------------|
| **OAuth 2.0 Authentication** | Secure connection to Gmail and Outlook via industry-standard OAuth 2.0 |
| **Background Email Synchronization** | Automated periodic sync of emails using BullMQ worker queues |
| **AI-Powered Sentiment Analysis** | Automatic classification of email sentiment, importance, and response requirements |
| **Intelligent Draft Generation** | AI-generated email responses with customizable tone and context |
| **Email Sending** | Direct email sending via provider APIs with reply threading |
| **Email Scheduling** | Schedule emails for future delivery |
| **2FA Code Extraction** | Automated extraction of 2FA codes from Gmail for authentication workflows |

### 1.3 Target Users

- **Agency Owners**: Managing client communications at scale
- **Marketing Teams**: Automating outreach and follow-up emails
- **Customer Success**: Prioritizing and responding to client inquiries
- **Sales Representatives**: Streamlining prospect communication
- **Operations Teams**: Processing automated emails and extracting actionable data

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Email Overload**: Users spend 2-4 hours daily managing emails manually
2. **Delayed Responses**: Critical emails get buried, leading to missed opportunities
3. **Context Switching**: Constantly switching between email clients and productivity tools
4. **Inconsistent Communication**: No standardized response templates or tone guidelines
5. **Manual Prioritization**: No automated way to identify urgent vs. routine emails
6. **Platform Fragmentation**: Managing multiple email accounts across different providers
7. **2FA Bottlenecks**: Manual 2FA code retrieval slows down automated workflows

### 2.2 Impact

- **Lost Revenue**: Delayed responses to sales inquiries result in 35-50% lower conversion rates
- **Customer Churn**: Slow support responses increase churn by up to 15%
- **Productivity Loss**: Email management consumes 28% of the average knowledge worker's day
- **Automation Blocks**: 2FA requirements interrupt automated browser-based workflows

### 2.3 Opportunity

By integrating email management with AI capabilities, Bottleneck-Bots can:
- Reduce email processing time by 60-80%
- Ensure high-priority emails receive immediate attention
- Maintain consistent, professional communication quality
- Enable fully automated workflows including 2FA handling

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description |
|------|-------------|
| **G1** | Enable secure OAuth 2.0 email account connection for Gmail and Outlook |
| **G2** | Automate email synchronization with AI-powered analysis |
| **G3** | Reduce manual email response time by 70% through AI draft generation |
| **G4** | Provide actionable email insights through sentiment and importance scoring |
| **G5** | Support end-to-end email workflows including sending and scheduling |

### 3.2 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Email Account Connections** | 80% of active users connect at least 1 account | Database tracking |
| **Average Response Time** | Reduce from 4hrs to <1hr for high-priority emails | Time delta tracking |
| **Draft Acceptance Rate** | >65% of AI drafts sent with minimal edits | Draft status tracking |
| **Sentiment Accuracy** | >85% accuracy on sentiment classification | User feedback/corrections |
| **Sync Reliability** | >99.5% successful sync rate | Job monitoring |
| **User Satisfaction** | NPS >50 for email features | User surveys |

### 3.3 Key Performance Indicators (KPIs)

1. **Daily Active Email Users (DAEU)**: Users interacting with email features daily
2. **Emails Processed per Day**: Total emails synced and analyzed
3. **Drafts Generated per User**: Average AI drafts created per user per week
4. **Send Rate**: Percentage of generated drafts that are sent
5. **Error Rate**: Percentage of failed syncs or API errors

---

## 4. User Stories

### 4.1 Account Connection

| ID | User Story | Priority |
|----|------------|----------|
| **US-01** | As a user, I want to connect my Gmail account using OAuth so that I can sync my emails securely | P0 |
| **US-02** | As a user, I want to connect my Outlook account using OAuth so that I can manage work emails | P0 |
| **US-03** | As a user, I want to view all my connected email accounts in one place | P0 |
| **US-04** | As a user, I want to disconnect an email account when I no longer need it | P0 |
| **US-05** | As a user, I want my tokens refreshed automatically so I stay connected without re-authenticating | P0 |

### 4.2 Email Synchronization

| ID | User Story | Priority |
|----|------------|----------|
| **US-06** | As a user, I want my emails to sync automatically in the background | P0 |
| **US-07** | As a user, I want to manually trigger an email sync when needed | P1 |
| **US-08** | As a user, I want to see when my emails were last synced | P1 |
| **US-09** | As a user, I want to filter synced emails by read/unread status | P1 |
| **US-10** | As a user, I want to view sync history and status for troubleshooting | P2 |

### 4.3 AI Sentiment Analysis

| ID | User Story | Priority |
|----|------------|----------|
| **US-11** | As a user, I want emails automatically analyzed for sentiment (positive/negative/neutral) | P0 |
| **US-12** | As a user, I want to see which emails require a response based on AI analysis | P0 |
| **US-13** | As a user, I want emails categorized by type (sales, support, marketing, etc.) | P1 |
| **US-14** | As a user, I want to filter emails by importance level (high/medium/low) | P1 |
| **US-15** | As a user, I want to correct AI sentiment classifications to improve accuracy | P2 |

### 4.4 Draft Generation

| ID | User Story | Priority |
|----|------------|----------|
| **US-16** | As a user, I want AI to automatically generate draft responses for high-priority emails | P0 |
| **US-17** | As a user, I want to manually request an AI draft for any email | P0 |
| **US-18** | As a user, I want to choose the tone (professional/casual/friendly) for generated drafts | P1 |
| **US-19** | As a user, I want to provide additional context to improve draft quality | P1 |
| **US-20** | As a user, I want to choose between different AI models (GPT-4, Claude) for generation | P2 |

### 4.5 Email Sending

| ID | User Story | Priority |
|----|------------|----------|
| **US-21** | As a user, I want to send approved drafts directly through the platform | P0 |
| **US-22** | As a user, I want to edit drafts before sending them | P0 |
| **US-23** | As a user, I want sent emails to maintain the reply thread context | P1 |
| **US-24** | As a user, I want to discard drafts I don't want to send | P1 |
| **US-25** | As a user, I want to track which drafts have been sent | P1 |

### 4.6 Email Scheduling

| ID | User Story | Priority |
|----|------------|----------|
| **US-26** | As a user, I want to schedule emails for future delivery | P1 |
| **US-27** | As a user, I want to cancel scheduled emails before they are sent | P1 |
| **US-28** | As a user, I want to view all my scheduled emails | P2 |

### 4.7 2FA Code Extraction

| ID | User Story | Priority |
|----|------------|----------|
| **US-29** | As a user, I want the system to automatically extract 2FA codes from my Gmail | P1 |
| **US-30** | As a user, I want extracted 2FA codes to be used in browser automation workflows | P1 |
| **US-31** | As a user, I want to configure which senders' 2FA codes should be extracted | P2 |

---

## 5. Functional Requirements

### 5.1 OAuth Authentication

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-01** | Gmail OAuth 2.0 | Support Gmail OAuth with required scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`, `userinfo.email`, `userinfo.profile` | P0 |
| **FR-02** | Outlook OAuth 2.0 | Support Outlook OAuth with required scopes: `offline_access`, `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`, `User.Read` | P0 |
| **FR-03** | State Parameter Validation | Generate and validate cryptographic state parameters to prevent CSRF attacks | P0 |
| **FR-04** | Token Encryption | Encrypt access and refresh tokens at rest using AES-256-GCM | P0 |
| **FR-05** | Automatic Token Refresh | Automatically refresh expired tokens using refresh tokens | P0 |
| **FR-06** | Multiple Account Support | Allow users to connect multiple email accounts per provider | P1 |
| **FR-07** | Scope Verification | Validate granted scopes match required scopes | P1 |

### 5.2 Email Synchronization

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-08** | Initial Sync | Sync last 50 emails on account connection | P0 |
| **FR-09** | Incremental Sync | Use sync cursors/tokens for incremental updates | P0 |
| **FR-10** | Background Processing | Process sync jobs via BullMQ workers | P0 |
| **FR-11** | Duplicate Prevention | Prevent duplicate email storage using message IDs | P0 |
| **FR-12** | Rate Limiting | Implement provider-specific rate limiting (10 jobs/second) | P0 |
| **FR-13** | Manual Sync Trigger | Allow users to manually trigger email sync | P1 |
| **FR-14** | Sync Status Tracking | Track and display sync progress and history | P1 |
| **FR-15** | Concurrent Processing | Support up to 5 concurrent sync jobs per worker | P1 |

### 5.3 AI Sentiment Analysis

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-16** | Sentiment Classification | Classify emails as positive, negative, neutral, or mixed | P0 |
| **FR-17** | Sentiment Scoring | Assign sentiment scores from -100 (very negative) to 100 (very positive) | P0 |
| **FR-18** | Importance Detection | Classify importance as high, medium, or low | P0 |
| **FR-19** | Response Requirement | Detect if email requires a response | P0 |
| **FR-20** | Category Classification | Classify emails into categories (sales, support, marketing, internal, personal) | P1 |
| **FR-21** | Multi-Model Support | Support both Anthropic Claude and OpenAI GPT models | P1 |
| **FR-22** | Circuit Breaker | Implement circuit breaker for AI service resilience | P1 |

### 5.4 Draft Generation

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-23** | Auto-Draft Generation | Automatically generate drafts for high-importance emails requiring response | P0 |
| **FR-24** | Manual Draft Generation | Allow users to request drafts for any email | P0 |
| **FR-25** | Tone Selection | Support professional, casual, and friendly tones | P1 |
| **FR-26** | Context Injection | Allow additional context to be provided for draft generation | P1 |
| **FR-27** | Model Selection | Allow users to choose between GPT-4 and Claude models | P2 |
| **FR-28** | HTML Formatting | Generate properly formatted HTML email bodies | P1 |
| **FR-29** | Subject Line Generation | Generate appropriate reply subject lines | P1 |

### 5.5 Email Sending

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-30** | Send via Gmail API | Send emails through Gmail API with proper MIME formatting | P0 |
| **FR-31** | Send via Outlook API | Send emails through Microsoft Graph API | P0 |
| **FR-32** | Draft Editing | Allow editing of subject and body before sending | P0 |
| **FR-33** | Thread Preservation | Maintain thread context when replying | P1 |
| **FR-34** | Draft Discarding | Allow users to discard/delete drafts | P1 |
| **FR-35** | Sent Status Tracking | Update draft status to "sent" with provider message ID | P1 |

### 5.6 Email Scheduling (Future)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-36** | Schedule Email | Allow scheduling emails for future delivery | P1 |
| **FR-37** | Cancel Scheduled | Allow cancellation of scheduled emails | P1 |
| **FR-38** | View Scheduled | Display list of scheduled emails | P2 |

### 5.7 2FA Code Extraction (Future)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| **FR-39** | Pattern Recognition | Extract 2FA codes using regex patterns | P1 |
| **FR-40** | Real-time Monitoring | Monitor inbox for new 2FA emails in near real-time | P1 |
| **FR-41** | Automation Integration | Provide 2FA codes to browser automation workflows | P1 |

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

### 6.2 Reliability

| Req ID | Requirement | Target | Description |
|--------|-------------|--------|-------------|
| **NFR-06** | Sync Success Rate | > 99.5% | Percentage of successful sync jobs |
| **NFR-07** | API Availability | > 99.9% | Email router uptime |
| **NFR-08** | Retry Logic | 3 attempts | Number of retry attempts with exponential backoff |
| **NFR-09** | Circuit Breaker | 50% threshold | Open circuit after 50% failure rate |
| **NFR-10** | Job Recovery | Automatic | Resume failed jobs on worker restart |

### 6.3 Security

| Req ID | Requirement | Description |
|--------|-------------|-------------|
| **NFR-11** | Token Encryption | AES-256-GCM encryption for all OAuth tokens |
| **NFR-12** | State Validation | Cryptographically secure state parameters |
| **NFR-13** | CSRF Protection | Validate OAuth state to prevent CSRF attacks |
| **NFR-14** | Token Expiry Handling | Automatic refresh before expiration |
| **NFR-15** | Minimal Scope | Request only necessary OAuth scopes |
| **NFR-16** | Secure Transmission | All API calls over HTTPS/TLS 1.3 |
| **NFR-17** | Key Management | Encryption keys stored in environment variables |

### 6.4 Scalability

| Req ID | Requirement | Target | Description |
|--------|-------------|--------|-------------|
| **NFR-18** | Concurrent Users | 10,000 | Maximum concurrent connected accounts |
| **NFR-19** | Emails per Account | 100,000 | Maximum synced emails per account |
| **NFR-20** | Worker Scaling | Horizontal | Support horizontal worker scaling |
| **NFR-21** | Database Partitioning | By userId | Partition large tables by user ID |

### 6.5 Compliance

| Req ID | Requirement | Description |
|--------|-------------|-------------|
| **NFR-22** | GDPR Compliance | Support data deletion and export requests |
| **NFR-23** | OAuth Best Practices | Follow Google and Microsoft OAuth guidelines |
| **NFR-24** | Data Retention | Configurable email retention period |
| **NFR-25** | Audit Logging | Log all email access and modifications |

---

## 7. Technical Architecture

### 7.1 System Components

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
                    |                   |
                    v                   v
            +---------------+   +---------------+
            |   PostgreSQL  |   |   BullMQ      |
            |   (Drizzle)   |   |   Workers     |
            +---------------+   +---------------+
                                       |
                                       v
                               +---------------+
                               |     Redis     |
                               |   Queue/Cache |
                               +---------------+
```

### 7.2 Database Schema

#### 7.2.1 email_connections Table

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

#### 7.2.2 synced_emails Table

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

#### 7.2.3 email_drafts Table

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

#### 7.2.4 email_sync_history Table

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

### 7.3 API Endpoints

#### 7.3.1 OAuth Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `email.getAuthUrl` | POST | Generate OAuth authorization URL |
| `email.handleCallback` | POST | Exchange auth code for tokens |
| `email.listConnections` | GET | List user's connected accounts |
| `email.disconnectAccount` | POST | Disconnect an email account |

#### 7.3.2 Email Operations Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `email.syncEmails` | POST | Trigger email sync job |
| `email.getEmails` | GET | Get synced emails with filters |
| `email.getStatus` | GET | Get email monitoring status/stats |

#### 7.3.3 Draft Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `email.generateDraft` | POST | Generate AI draft for an email |
| `email.getDrafts` | GET | Get user's drafts with filters |
| `email.sendDraft` | POST | Send an approved draft |
| `email.deleteDraft` | POST | Discard a draft |

#### 7.3.4 AI Analysis Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `email.analyzeSentiment` | POST | Analyze email sentiment |

### 7.4 Background Workers

#### 7.4.1 Email Worker (emailWorker.ts)

| Job Type | Description |
|----------|-------------|
| EMAIL_SYNC | Sync emails from provider, analyze sentiment, auto-generate drafts |
| EMAIL_DRAFT | Generate draft response for a specific thread |

**Worker Configuration:**
- Concurrency: 5 jobs
- Rate Limit: 10 jobs/second
- Queue: "email"

### 7.5 Service Layer

#### 7.5.1 Email Service (email.service.ts)

| Method | Description |
|--------|-------------|
| `getAuthUrl()` | Generate OAuth authorization URL |
| `handleCallback()` | Exchange auth code for tokens |
| `refreshToken()` | Refresh expired access token |
| `fetchEmails()` | Fetch emails from provider |
| `sendEmail()` | Send email via provider |
| `analyzeSentiment()` | Analyze email sentiment via AI |
| `generateDraft()` | Generate draft via AI |

#### 7.5.2 Encryption

- **Algorithm**: AES-256-GCM
- **IV**: Random 16-byte IV per encryption
- **Format**: `{iv}:{authTag}:{encrypted}`
- **Key**: 64-character hex key from environment

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Description | Status |
|------------|-------------|--------|
| User Authentication | User sessions and JWT handling | Completed |
| Database (Drizzle + PostgreSQL) | Data persistence layer | Completed |
| Redis | Job queue and caching | Completed |
| BullMQ Workers | Background job processing | Completed |
| tRPC Router | API layer | Completed |
| Logger Service | Structured logging | Completed |
| Retry/Circuit Breaker | Resilience patterns | Completed |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `googleapis` | ^140.0.0 | Gmail API client |
| `google-auth-library` | ^9.0.0 | Google OAuth |
| `@microsoft/microsoft-graph-client` | ^3.0.0 | Outlook/Graph API |
| `@anthropic-ai/sdk` | ^0.20.0 | Claude AI integration |
| `openai` | ^4.0.0 | GPT AI integration |
| `bullmq` | ^5.0.0 | Job queue processing |

### 8.3 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GMAIL_CLIENT_ID` | Google OAuth client ID | Yes (for Gmail) |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret | Yes (for Gmail) |
| `GMAIL_REDIRECT_URI` | Gmail OAuth callback URL | Yes (for Gmail) |
| `OUTLOOK_CLIENT_ID` | Microsoft OAuth client ID | Yes (for Outlook) |
| `OUTLOOK_CLIENT_SECRET` | Microsoft OAuth client secret | Yes (for Outlook) |
| `OUTLOOK_REDIRECT_URI` | Outlook OAuth callback URL | Yes (for Outlook) |
| `ENCRYPTION_KEY` | 64-char hex encryption key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes (for Claude) |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `APP_URL` | Application base URL | Yes |

---

## 9. Out of Scope

### 9.1 Current Release (v1.0)

The following features are explicitly excluded from the initial release:

| Feature | Reason | Future Release |
|---------|--------|----------------|
| **Calendar Integration** | Separate feature scope | v2.0 |
| **Attachment Handling** | Complexity and storage requirements | v1.1 |
| **Email Templates Library** | Separate PRD required | v1.1 |
| **Multi-language Support** | Requires additional AI prompting | v1.2 |
| **Email Analytics Dashboard** | Separate analytics PRD | v1.2 |
| **Mobile Push Notifications** | Requires mobile infrastructure | v2.0 |
| **Email Forwarding Rules** | Provider-specific complexity | v1.2 |
| **IMAP/SMTP Support** | OAuth-only in initial release | v2.0 |
| **Shared Inbox** | Multi-user collaboration | v2.0 |
| **Email Signatures Management** | Template management scope | v1.1 |

### 9.2 Explicit Exclusions

1. **Third-party Email Clients**: Only Gmail and Outlook OAuth supported
2. **On-premise Email Servers**: No Exchange Server or custom IMAP support
3. **Email Archive/Export**: No bulk email export functionality
4. **Spam Filtering**: Rely on provider's spam filtering
5. **Email Aliases**: Single email address per connection

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **API Rate Limiting** | High | Medium | Implement rate limiting, backoff strategies, and queue throttling |
| **Token Expiration Failures** | Medium | High | Automatic refresh before expiry, graceful degradation, user notification |
| **AI Service Outages** | Low | High | Circuit breaker pattern, fallback to alternative provider, queue for retry |
| **Provider API Changes** | Medium | High | Abstract provider interfaces, version pinning, monitoring |
| **Encryption Key Compromise** | Low | Critical | Key rotation mechanism, HSM consideration, access audit |

### 10.2 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **OAuth Token Theft** | Low | Critical | Encryption at rest, TLS in transit, secure storage |
| **CSRF in OAuth Flow** | Medium | High | State parameter validation, short expiry |
| **Email Data Breach** | Low | Critical | Encryption, access controls, audit logging |
| **Privilege Escalation** | Low | High | Scope validation, user isolation |

### 10.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low Adoption** | Medium | High | User onboarding, value demonstration, gradual rollout |
| **Privacy Concerns** | Medium | Medium | Clear privacy policy, opt-in consent, data minimization |
| **Provider Policy Changes** | Low | High | Compliance monitoring, multiple provider support |
| **AI Response Quality** | Medium | Medium | Human review workflow, feedback loop, model tuning |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Worker Failures** | Medium | Medium | Job retry logic, dead-letter queues, monitoring |
| **Database Performance** | Low | High | Indexing, partitioning, connection pooling |
| **Cost Overruns (AI)** | Medium | Medium | Usage monitoring, caching, model selection |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Foundation (Weeks 1-2)

**Objective**: Core OAuth and sync infrastructure

| Milestone | Deliverables | Duration |
|-----------|--------------|----------|
| **M1.1** | Gmail OAuth 2.0 implementation | 3 days |
| **M1.2** | Outlook OAuth 2.0 implementation | 3 days |
| **M1.3** | Database schema and migrations | 2 days |
| **M1.4** | Token encryption service | 1 day |
| **M1.5** | BullMQ worker setup | 2 days |
| **M1.6** | Initial email sync implementation | 3 days |

**Exit Criteria**:
- [ ] Users can connect Gmail accounts
- [ ] Users can connect Outlook accounts
- [ ] Emails sync to database successfully
- [ ] Tokens are encrypted at rest

### 11.2 Phase 2: AI Integration (Weeks 3-4)

**Objective**: Sentiment analysis and draft generation

| Milestone | Deliverables | Duration |
|-----------|--------------|----------|
| **M2.1** | Anthropic Claude integration | 2 days |
| **M2.2** | OpenAI GPT integration | 2 days |
| **M2.3** | Sentiment analysis implementation | 3 days |
| **M2.4** | Draft generation implementation | 3 days |
| **M2.5** | Auto-draft for high-priority emails | 2 days |
| **M2.6** | Circuit breaker and retry logic | 2 days |

**Exit Criteria**:
- [ ] Emails analyzed for sentiment on sync
- [ ] Users can generate drafts manually
- [ ] High-priority emails get auto-drafts
- [ ] AI failures handled gracefully

### 11.3 Phase 3: Email Operations (Weeks 5-6)

**Objective**: Complete email workflow

| Milestone | Deliverables | Duration |
|-----------|--------------|----------|
| **M3.1** | Gmail send implementation | 2 days |
| **M3.2** | Outlook send implementation | 2 days |
| **M3.3** | Draft editing and approval | 2 days |
| **M3.4** | Thread/reply handling | 2 days |
| **M3.5** | Email status UI | 3 days |
| **M3.6** | Integration testing | 3 days |

**Exit Criteria**:
- [ ] Users can send drafts via both providers
- [ ] Reply threading works correctly
- [ ] Draft lifecycle is complete
- [ ] All E2E tests passing

### 11.4 Phase 4: Polish & Launch (Weeks 7-8)

**Objective**: Production readiness

| Milestone | Deliverables | Duration |
|-----------|--------------|----------|
| **M4.1** | Performance optimization | 3 days |
| **M4.2** | Security audit | 2 days |
| **M4.3** | Documentation | 2 days |
| **M4.4** | Load testing | 2 days |
| **M4.5** | Beta testing | 3 days |
| **M4.6** | Production deployment | 2 days |

**Exit Criteria**:
- [ ] Performance targets met
- [ ] Security vulnerabilities addressed
- [ ] User documentation complete
- [ ] Production monitoring in place

### 11.5 Timeline Summary

```
Week 1-2:  [=== Phase 1: Foundation ===]
Week 3-4:  [=== Phase 2: AI Integration ===]
Week 5-6:  [=== Phase 3: Email Operations ===]
Week 7-8:  [=== Phase 4: Polish & Launch ===]
```

**Total Duration**: 8 weeks
**Buffer**: 1 week built into each phase

---

## 12. Acceptance Criteria

### 12.1 OAuth Authentication

- [ ] **AC-01**: User can initiate Gmail OAuth flow and grant permissions
- [ ] **AC-02**: User can initiate Outlook OAuth flow and grant permissions
- [ ] **AC-03**: OAuth callback correctly exchanges code for tokens
- [ ] **AC-04**: Tokens are encrypted before database storage
- [ ] **AC-05**: State parameter is validated to prevent CSRF
- [ ] **AC-06**: Token refresh occurs automatically before expiration
- [ ] **AC-07**: User can view all connected email accounts
- [ ] **AC-08**: User can disconnect an email account

### 12.2 Email Synchronization

- [ ] **AC-09**: Initial sync fetches last 50 emails on connection
- [ ] **AC-10**: Incremental sync uses cursor for efficiency
- [ ] **AC-11**: Sync jobs process in background via BullMQ
- [ ] **AC-12**: Duplicate emails are not created
- [ ] **AC-13**: Sync status is visible to users
- [ ] **AC-14**: Failed syncs are retried with exponential backoff
- [ ] **AC-15**: User can manually trigger email sync

### 12.3 AI Sentiment Analysis

- [ ] **AC-16**: All synced emails receive sentiment classification
- [ ] **AC-17**: Sentiment includes score, importance, and category
- [ ] **AC-18**: "Requires response" is correctly identified
- [ ] **AC-19**: AI errors do not block email sync
- [ ] **AC-20**: Users can filter emails by sentiment/importance

### 12.4 Draft Generation

- [ ] **AC-21**: Users can generate drafts for any email
- [ ] **AC-22**: High-priority requiring-response emails get auto-drafts
- [ ] **AC-23**: Users can select tone (professional/casual/friendly)
- [ ] **AC-24**: Users can provide additional context
- [ ] **AC-25**: Generated drafts are saved with pending status
- [ ] **AC-26**: Drafts include appropriate reply subject lines

### 12.5 Email Sending

- [ ] **AC-27**: Users can edit draft subject before sending
- [ ] **AC-28**: Users can edit draft body before sending
- [ ] **AC-29**: Sent emails appear in provider's sent folder
- [ ] **AC-30**: Reply threading is maintained
- [ ] **AC-31**: Draft status updates to "sent" with provider ID
- [ ] **AC-32**: Users can discard unwanted drafts

### 12.6 Performance & Reliability

- [ ] **AC-33**: Email sync completes within 30 seconds for 50 emails
- [ ] **AC-34**: Draft generation completes within 10 seconds
- [ ] **AC-35**: API endpoints respond within 500ms (P95)
- [ ] **AC-36**: Sync success rate exceeds 99.5%
- [ ] **AC-37**: System handles 10,000 concurrent connections

### 12.7 Security

- [ ] **AC-38**: All tokens encrypted with AES-256-GCM
- [ ] **AC-39**: HTTPS/TLS 1.3 for all external calls
- [ ] **AC-40**: OAuth state prevents CSRF attacks
- [ ] **AC-41**: User data properly isolated by userId
- [ ] **AC-42**: Audit logs capture email access events

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **OAuth 2.0** | Industry-standard authorization framework |
| **BullMQ** | Redis-based queue for Node.js background jobs |
| **Sentiment Analysis** | AI-powered classification of emotional tone |
| **Circuit Breaker** | Pattern to prevent cascading failures |
| **tRPC** | End-to-end typesafe API framework |
| **Drizzle** | TypeScript ORM for SQL databases |

---

## Appendix B: Related Documents

| Document | Description |
|----------|-------------|
| AUTHENTICATION_GUIDE.md | OAuth implementation details |
| API_DEVELOPER_GUIDE.md | API usage documentation |
| TRPC_ENDPOINTS_REFERENCE.md | Endpoint specifications |
| DATABASE_SCHEMA.md | Database design documentation |
| REDIS_CACHE_USAGE.md | Redis caching strategies |

---

## Appendix C: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Engineering Team | Initial PRD creation |

---

**Document Status**: Ready for Review
**Next Review Date**: 2026-01-18
**Approvers**: Product Manager, Engineering Lead, Security Lead
