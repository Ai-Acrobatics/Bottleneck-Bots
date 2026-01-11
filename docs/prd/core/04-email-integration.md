# PRD: Email Integration System

## Overview
The Email Integration System provides comprehensive email connectivity for Bottleneck-Bots, enabling users to connect their email accounts, sync messages, send automated emails, and extract critical information like 2FA codes. It supports multiple providers through OAuth 2.0 and SMTP/IMAP protocols, with built-in template management for consistent messaging.

## Problem Statement
Modern automation workflows often require email interaction:
- Monitoring inboxes for triggers (order confirmations, verification codes)
- Sending automated responses or notifications
- Extracting 2FA/verification codes for automated logins
- Managing email-based workflows across multiple accounts
- Maintaining conversation context for follow-ups

Current solutions require complex integrations and lack the intelligent extraction capabilities needed for full automation.

## Goals & Objectives

### Primary Goals
- Support Gmail, Outlook, and SMTP/IMAP email providers
- Implement secure OAuth 2.0 authentication flows
- Provide real-time email synchronization
- Enable intelligent 2FA code extraction
- Offer template management with variable substitution

### Success Metrics
- OAuth connection success rate: >98%
- Email sync latency: <30 seconds
- 2FA code extraction accuracy: >99%
- Template delivery rate: >99%
- User email account connections: 2+ per user average

## User Stories

### Agency Owner
- As an agency owner, I want to connect multiple email accounts so that I can automate communication across all my business emails
- As an agency owner, I want to use email templates for consistent client communication so that my messaging stays on-brand

### Automation Developer
- As an automation developer, I want to extract 2FA codes from emails automatically so that my browser automations can complete login flows
- As an automation developer, I want to trigger workflows when specific emails arrive so that I can automate email-based processes

### End User
- As an end user, I want to sync my email history so that AI agents have context for my communications
- As an end user, I want to send emails through the platform so that I can keep all my automation in one place

## Functional Requirements

### Must Have (P0)

1. **Multi-Provider OAuth 2.0**
   - Gmail OAuth with Google Cloud Console
   - Microsoft Outlook OAuth with Azure AD
   - Secure token storage and refresh
   - Scope-limited permissions (minimal access)
   - Account disconnection and cleanup
   - Token expiration handling

2. **SMTP/IMAP Support**
   - Custom SMTP server configuration
   - IMAP folder synchronization
   - SSL/TLS encryption options
   - Authentication method selection
   - Connection health monitoring
   - Provider presets (Yahoo, Zoho, etc.)

3. **Email Synchronization**
   - Initial full sync with pagination
   - Incremental sync for new messages
   - Conversation threading
   - Attachment handling (link-only)
   - Folder/label synchronization
   - Search indexing for quick retrieval

4. **Template Management**
   - Rich text template editor
   - Variable placeholders: `{{firstName}}`, `{{companyName}}`
   - Conditional content blocks
   - Template categorization and tagging
   - Template versioning
   - Preview with sample data

5. **2FA Code Extraction**
   - Pattern matching for common 2FA formats
   - Provider-specific extraction rules
   - Real-time inbox monitoring
   - Code expiration tracking
   - Multi-format support (6-digit, alphanumeric)
   - Waiting with timeout for code arrival

6. **Email Sending**
   - Send via connected account
   - HTML and plain text support
   - Attachment support (up to 25MB)
   - Reply and forward functionality
   - Scheduled sending
   - Read receipt tracking

### Should Have (P1)

1. **Conversation History**
   - Full thread visualization
   - Reply context preservation
   - Participant tracking
   - Conversation search
   - Export conversation

2. **Email Automation Rules**
   - Inbox filters and triggers
   - Auto-reply configuration
   - Email forwarding rules
   - Label/folder auto-assignment
   - Priority scoring

3. **Analytics & Tracking**
   - Open rate tracking (pixel)
   - Click tracking for links
   - Bounce handling
   - Engagement analytics
   - Deliverability reporting

### Nice to Have (P2)

1. **AI-Powered Features**
   - Email summarization
   - Suggested replies
   - Sentiment analysis
   - Priority prediction
   - Smart categorization

2. **Advanced Templating**
   - Dynamic content from APIs
   - A/B testing for templates
   - Personalization at scale
   - Multi-language templates
   - Template performance analytics

## Non-Functional Requirements

### Performance
- OAuth flow completion: <10 seconds
- Email send latency: <3 seconds
- Sync interval: 30 seconds minimum
- 2FA extraction: <5 seconds
- Template render: <500ms
- Search response: <1 second

### Security
- OAuth tokens encrypted at rest (AES-256)
- SMTP passwords hashed (Argon2)
- TLS 1.3 for all connections
- No email content stored permanently
- PII masking in logs
- GDPR data portability support
- SOC 2 compliance

### Scalability
- 10,000+ connected accounts
- 1M+ emails synced per day
- Rate limiting per provider
- Queue-based sync processing
- Horizontal worker scaling

### Reliability
- 99.9% sync availability
- Retry logic for transient failures
- Provider failover (SMTP backup)
- Sync state recovery
- Duplicate detection

## Technical Requirements

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Email UI      │────▶│  Email API       │────▶│  PostgreSQL     │
│   (React)       │◀────│  (Next.js)       │◀────│  (Accounts/Msg) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │   Gmail    │   │  Outlook   │   │   IMAP     │
       │   API      │   │  Graph API │   │  Protocol  │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              ▼                ▼                ▼
       ┌──────────────────────────────────────────────┐
       │              Sync Worker (BullMQ)            │
       │  - Incremental sync                          │
       │  - 2FA extraction                            │
       │  - Webhook triggers                          │
       └──────────────────────────────────────────────┘
                               │
                               ▼
                        ┌────────────┐
                        │   Redis    │
                        │ (Cache/PubSub)│
                        └────────────┘
```

### Dependencies
- **Email Protocols**
  - googleapis (Gmail API)
  - @microsoft/microsoft-graph-client (Outlook)
  - nodemailer (SMTP sending)
  - imapflow (IMAP sync)

- **Authentication**
  - passport-google-oauth20
  - passport-azure-ad
  - jwt for session tokens

- **Processing**
  - BullMQ (sync jobs)
  - cheerio (HTML parsing)
  - Redis (caching, pub/sub)

### API Specifications

#### Connect Email Account
```typescript
POST /api/email/accounts/connect
Request:
{
  provider: 'gmail' | 'outlook' | 'smtp';
  config: OAuthConfig | SMTPConfig;
}
Response:
{
  accountId: string;
  email: string;
  provider: string;
  status: 'connected' | 'syncing';
  syncProgress?: number;
}
```

#### OAuth Callback
```typescript
GET /api/email/oauth/callback
Query:
{
  code: string;
  state: string; // encrypted: accountId, userId, provider
}
Response:
  Redirect to dashboard with success/error status
```

#### Sync Emails
```typescript
POST /api/email/accounts/{accountId}/sync
Request:
{
  options?: {
    fullSync: boolean;
    folder?: string;
    since?: string; // ISO date
    limit?: number;
  };
}
Response:
{
  jobId: string;
  status: 'queued';
  estimatedEmails?: number;
}
```

#### Send Email
```typescript
POST /api/email/send
Request:
{
  accountId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: {
    html?: string;
    text?: string;
  };
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: Attachment[];
  replyToMessageId?: string;
  scheduledAt?: string;
}
Response:
{
  messageId: string;
  status: 'sent' | 'scheduled';
  sentAt?: string;
  scheduledAt?: string;
}
```

#### Extract 2FA Code
```typescript
POST /api/email/extract-2fa
Request:
{
  accountId: string;
  options: {
    senderPattern?: string; // e.g., "*@google.com"
    subjectPattern?: string; // e.g., "*verification*"
    timeout: number; // seconds to wait
    codePattern?: string; // regex for code format
  };
}
Response:
{
  found: boolean;
  code?: string;
  email?: {
    from: string;
    subject: string;
    receivedAt: string;
  };
  expiresAt?: string;
}
```

#### Manage Templates
```typescript
POST /api/email/templates
Request:
{
  name: string;
  category?: string;
  subject: string;
  body: {
    html: string;
    text?: string;
  };
  variables: VariableDefinition[];
  settings?: {
    trackOpens: boolean;
    trackClicks: boolean;
  };
}
Response:
{
  templateId: string;
  name: string;
  variables: string[];
  createdAt: string;
}
```

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| OAuth Connection Rate | >98% | Successful connections / attempts |
| Email Sync Latency | <30s | Time from email received to synced |
| 2FA Extraction Accuracy | >99% | Correct extractions / total extractions |
| Template Delivery Rate | >99% | Delivered / sent |
| Avg Accounts per User | 2+ | Total accounts / active users |
| Sync Reliability | 99.9% | Successful syncs / scheduled syncs |
| Email Send Success | >99.5% | Sent / attempted |

## Dependencies

### Internal Dependencies
- Authentication system (user sessions)
- Encryption service (token storage)
- Notification system (sync alerts)
- Workflow engine (email triggers)

### External Dependencies
- Google Cloud Console project
- Microsoft Azure AD app registration
- Email provider availability
- DNS for SPF/DKIM (sending)

### Blocking Dependencies
- OAuth app approval from Google/Microsoft
- Domain verification for sending
- Security review completion

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OAuth token revocation | High | Medium | Token monitoring, graceful re-auth flow |
| Gmail API rate limits | Medium | High | Request batching, quota monitoring, backoff |
| 2FA code format changes | Medium | Medium | Pattern library, user-configurable patterns |
| Email provider outages | High | Low | Multi-provider fallback, status monitoring |
| Spam classification of sent emails | Medium | Medium | SPF/DKIM/DMARC setup, reputation monitoring |
| Data privacy violations | Critical | Low | Encryption, minimal data retention, audit logs |
| IMAP connection drops | Medium | Medium | Connection pooling, auto-reconnect, health checks |

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: OAuth Integration | 3 weeks | Gmail + Outlook OAuth flows |
| Phase 2: SMTP/IMAP | 2 weeks | Custom email server support |
| Phase 3: Email Sync | 3 weeks | Incremental sync, threading, search |
| Phase 4: 2FA Extraction | 2 weeks | Code extraction engine |
| Phase 5: Templates | 2 weeks | Template editor, variable system |
| Phase 6: Email Sending | 2 weeks | Send, reply, forward, attachments |
| Phase 7: Testing | 2 weeks | Provider testing, security audit |

## Open Questions
1. Should we support alias/shared mailbox connections?
2. What is the maximum email history we should sync (time-based or count-based)?
3. How do we handle rate limits for high-volume sending?
4. Should we implement our own SMTP relay for better deliverability?
5. How do we handle email accounts with 2FA enabled (app passwords)?
