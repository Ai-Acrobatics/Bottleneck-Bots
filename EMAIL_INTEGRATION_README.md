# Email Integration for Gmail and Outlook OAuth

This document provides a comprehensive guide to the email integration implementation, including setup, usage, and API reference.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Background Jobs](#background-jobs)
- [Environment Variables](#environment-variables)
- [Usage Examples](#usage-examples)

## Overview

The email integration provides a complete solution for connecting Gmail and Outlook accounts via OAuth 2.0, syncing emails, analyzing sentiment with AI, and generating draft responses automatically.

## Features

### OAuth Authentication
- Gmail OAuth 2.0 with refresh token support
- Outlook OAuth 2.0 with refresh token support
- Secure state management for CSRF protection
- Encrypted token storage in database

### Email Operations
- Background email synchronization
- Pagination support for large mailboxes
- Duplicate detection
- Thread-based organization

### AI-Powered Features
- **Sentiment Analysis**: Automatically analyzes email sentiment (positive, negative, neutral, mixed)
- **Importance Detection**: Classifies emails as high, medium, or low importance
- **Category Detection**: Automatically categorizes emails (sales, support, marketing, etc.)
- **Response Detection**: Identifies emails that require a response
- **Draft Generation**: AI-powered draft responses with customizable tone

### Email Management
- List synced emails with filtering (unread, sentiment, importance)
- Pagination support
- Draft approval workflow
- Email sending via provider APIs
- Customizable drafts before sending

## Architecture

```
┌─────────────────┐
│   Client App    │
└────────┬────────┘
         │
         │ tRPC API Calls
         │
┌────────▼────────┐
│  Email Router   │ (/server/api/routers/email.ts)
└────────┬────────┘
         │
         ├──────────────────────┬─────────────────────┐
         │                      │                     │
┌────────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│  Email Service  │   │  OAuth State    │   │  Queue System  │
│                 │   │    Service      │   │    (BullMQ)    │
└────────┬────────┘   └─────────────────┘   └────────┬───────┘
         │                                            │
         │                                            │
┌────────▼────────────────────────────────────────────▼───────┐
│                     Email Worker                            │
│  - Syncs emails from provider                               │
│  - Analyzes sentiment with AI                               │
│  - Generates drafts for important emails                    │
└─────────────────────────────────────────────────────────────┘
         │
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

## Setup

### 1. Install Required Dependencies

```bash
npm install googleapis google-auth-library @microsoft/microsoft-graph-client @anthropic-ai/sdk openai
```

### 2. Configure Gmail OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/oauth/gmail/callback` (development)
   - `https://yourdomain.com/api/oauth/gmail/callback` (production)
4. Enable Gmail API for your project
5. Add credentials to `.env`:

```env
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:3000/api/oauth/gmail/callback
```

### 3. Configure Outlook OAuth

1. Go to [Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps)
2. Create a new App Registration
3. Add redirect URIs under "Authentication":
   - `http://localhost:3000/api/oauth/outlook/callback` (development)
   - `https://yourdomain.com/api/oauth/outlook/callback` (production)
4. Under "API permissions", add:
   - Microsoft Graph: Mail.Read
   - Microsoft Graph: Mail.Send
   - Microsoft Graph: Mail.ReadWrite
   - Microsoft Graph: User.Read
5. Create a client secret under "Certificates & secrets"
6. Add credentials to `.env`:

```env
OUTLOOK_CLIENT_ID=your_outlook_client_id_here
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret_here
OUTLOOK_REDIRECT_URI=http://localhost:3000/api/oauth/outlook/callback
```

### 4. Generate Encryption Key

Generate a secure encryption key for token storage:

```bash
openssl rand -hex 32
```

Add to `.env`:

```env
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here
```

### 5. Configure AI Providers

Add at least one AI provider API key to enable sentiment analysis and draft generation:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here
```

### 6. Run Database Migrations

```bash
npm run db:push
```

### 7. Start Workers

The email worker processes background jobs for email syncing and draft generation:

```bash
# Development
npm run dev:workers

# Production
npm run workers
```

## API Endpoints

All endpoints are available under the `email` namespace in the tRPC router.

### OAuth Endpoints

#### `email.getAuthUrl`
Generate OAuth authorization URL for Gmail or Outlook.

**Input:**
```typescript
{
  provider: "gmail" | "outlook"
}
```

**Output:**
```typescript
{
  authUrl: string;
  state: string;
}
```

**Usage:**
```typescript
const { authUrl } = await trpc.email.getAuthUrl.mutate({
  provider: "gmail"
});
// Redirect user to authUrl
```

#### `email.handleCallback`
Handle OAuth callback and store connection.

**Input:**
```typescript
{
  provider: "gmail" | "outlook";
  code: string;
  state: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  connection: {
    id: number;
    provider: string;
    email: string;
    isActive: boolean;
  };
}
```

#### `email.listConnections`
List all connected email accounts for the user.

**Output:**
```typescript
{
  connections: Array<{
    id: number;
    provider: string;
    email: string;
    isActive: boolean;
    lastSyncedAt: Date | null;
    createdAt: Date;
  }>;
}
```

#### `email.disconnectAccount`
Disconnect an email account.

**Input:**
```typescript
{
  connectionId: number;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

### Email Operations

#### `email.syncEmails`
Trigger email sync (queues background job).

**Input:**
```typescript
{
  connectionId: number;
}
```

**Output:**
```typescript
{
  success: boolean;
  jobId: string;
}
```

#### `email.getEmails`
List synced emails with pagination and filters.

**Input:**
```typescript
{
  connectionId?: number;
  limit?: number;        // 1-100, default: 20
  offset?: number;       // default: 0
  unreadOnly?: boolean;
  sentiment?: "positive" | "negative" | "neutral" | "mixed";
  requiresResponse?: boolean;
}
```

**Output:**
```typescript
{
  emails: Array<SyncedEmail>;
  total: number;
  limit: number;
  offset: number;
}
```

#### `email.getDrafts`
Get AI-generated drafts.

**Input:**
```typescript
{
  status?: "pending" | "approved" | "sent" | "discarded";
  limit?: number;   // 1-100, default: 20
  offset?: number;  // default: 0
}
```

**Output:**
```typescript
{
  drafts: Array<{
    draft: EmailDraft;
    email: SyncedEmail;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

#### `email.sendDraft`
Send an approved draft.

**Input:**
```typescript
{
  draftId: number;
  customizations?: {
    subject?: string;
    body?: string;
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  messageId: string;
}
```

#### `email.deleteDraft`
Discard a draft.

**Input:**
```typescript
{
  draftId: number;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

### AI Features

#### `email.generateDraft`
Generate AI draft for an email.

**Input:**
```typescript
{
  emailId: number;
  tone?: "professional" | "casual" | "friendly";
  model?: "gpt-4" | "gpt-4-turbo" | "claude-3-opus" | "claude-3-sonnet";
  context?: string;
}
```

**Output:**
```typescript
{
  draft: EmailDraft;
}
```

#### `email.analyzeSentiment`
Analyze email sentiment with AI.

**Input:**
```typescript
{
  emailId: number;
}
```

**Output:**
```typescript
{
  sentiment: {
    sentiment: "positive" | "negative" | "neutral" | "mixed";
    score: number;        // -100 to 100
    importance: "high" | "medium" | "low";
    requiresResponse: boolean;
    category?: string;
  };
}
```

#### `email.getStatus`
Get email monitoring status and stats.

**Output:**
```typescript
{
  isConnected: boolean;
  connectedAccounts: number;
  stats: {
    unreadCount: number;
    draftsGenerated: number;
    emailsSent: number;
  };
  lastSync: Date | null;
}
```

## Database Schema

### `email_connections`
Stores OAuth tokens and metadata for connected email accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | Foreign key to users |
| provider | varchar(20) | "gmail" or "outlook" |
| email | varchar(320) | Email address |
| accessToken | text | Encrypted access token |
| refreshToken | text | Encrypted refresh token |
| expiresAt | timestamp | Token expiration |
| scope | text | OAuth scopes |
| metadata | jsonb | Provider-specific data |
| isActive | boolean | Connection status |
| lastSyncedAt | timestamp | Last sync time |
| syncCursor | text | Sync pagination cursor |
| createdAt | timestamp | Created timestamp |
| updatedAt | timestamp | Updated timestamp |

### `synced_emails`
Stores emails fetched from connected accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | Foreign key to users |
| connectionId | integer | Foreign key to email_connections |
| messageId | text | Provider's message ID (unique) |
| threadId | text | Provider's thread ID |
| subject | text | Email subject |
| from | jsonb | Sender information |
| to | jsonb | Recipients |
| cc | jsonb | CC recipients |
| bcc | jsonb | BCC recipients |
| replyTo | jsonb | Reply-to addresses |
| date | timestamp | Email send date |
| body | text | Email body content |
| bodyType | varchar(10) | "html" or "text" |
| snippet | text | Short preview |
| labels | jsonb | Email labels/categories |
| isRead | boolean | Read status |
| isStarred | boolean | Starred status |
| hasAttachments | boolean | Has attachments |
| attachments | jsonb | Attachment metadata |
| headers | jsonb | Email headers |
| rawData | jsonb | Raw provider response |
| sentiment | varchar(20) | AI-detected sentiment |
| sentimentScore | integer | -100 to 100 |
| importance | varchar(20) | AI-detected importance |
| category | varchar(50) | AI-detected category |
| requiresResponse | boolean | AI-detected response need |
| createdAt | timestamp | Created timestamp |
| updatedAt | timestamp | Updated timestamp |

### `email_drafts`
Stores AI-generated draft responses.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | Foreign key to users |
| emailId | integer | Foreign key to synced_emails |
| connectionId | integer | Foreign key to email_connections |
| subject | text | Draft subject |
| body | text | Draft body |
| bodyType | varchar(10) | "html" or "text" |
| tone | varchar(20) | Draft tone |
| status | varchar(20) | "pending", "approved", "sent", "discarded" |
| model | varchar(50) | AI model used |
| generatedAt | timestamp | Generation timestamp |
| sentAt | timestamp | Send timestamp |
| providerId | text | Provider message ID after sending |
| metadata | jsonb | Generation parameters |
| createdAt | timestamp | Created timestamp |
| updatedAt | timestamp | Updated timestamp |

### `email_sync_history`
Tracks email sync job execution.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | Foreign key to users |
| connectionId | integer | Foreign key to email_connections |
| jobId | text | BullMQ job ID |
| status | varchar(20) | "pending", "running", "completed", "failed" |
| emailsFetched | integer | Emails fetched count |
| emailsProcessed | integer | Emails processed count |
| draftsGenerated | integer | Drafts generated count |
| error | text | Error message if failed |
| startedAt | timestamp | Start timestamp |
| completedAt | timestamp | Completion timestamp |
| duration | integer | Duration in milliseconds |
| metadata | jsonb | Sync details |
| createdAt | timestamp | Created timestamp |
| updatedAt | timestamp | Updated timestamp |

## Background Jobs

### Email Sync Job
Fetches emails from Gmail/Outlook and processes them.

**Process:**
1. Validates email connection
2. Refreshes access token if expired
3. Fetches emails from provider (max 50 per sync)
4. For each email:
   - Checks for duplicates
   - Analyzes sentiment with AI
   - Stores in database
   - Auto-generates draft if high importance + requires response
5. Updates sync cursor for pagination
6. Records sync history

**Triggering:**
- Automatically on OAuth connection
- Manual via `email.syncEmails` endpoint
- Scheduled (can be configured with cron)

### Email Draft Job
Generates AI-powered draft responses.

**Process:**
1. Fetches email thread
2. Builds context from conversation history
3. Generates draft with AI (tone-aware)
4. Stores draft in database

**Triggering:**
- Automatically during sync for important emails
- Manual via `email.generateDraft` endpoint

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| GMAIL_CLIENT_ID | Yes* | Gmail OAuth client ID |
| GMAIL_CLIENT_SECRET | Yes* | Gmail OAuth client secret |
| GMAIL_REDIRECT_URI | No | Gmail OAuth redirect (defaults to APP_URL/api/oauth/gmail/callback) |
| OUTLOOK_CLIENT_ID | Yes* | Outlook OAuth client ID |
| OUTLOOK_CLIENT_SECRET | Yes* | Outlook OAuth client secret |
| OUTLOOK_REDIRECT_URI | No | Outlook OAuth redirect (defaults to APP_URL/api/oauth/outlook/callback) |
| ENCRYPTION_KEY | Yes | 64-char hex key for token encryption |
| ANTHROPIC_API_KEY | Yes** | Anthropic API key for Claude |
| OPENAI_API_KEY | Yes** | OpenAI API key for GPT |
| APP_URL | Yes | Application base URL |
| REDIS_URL | Yes | Redis connection for queue |

\* At least one provider (Gmail or Outlook) required
\*\* At least one AI provider required

## Usage Examples

### Complete OAuth Flow

```typescript
// 1. Initiate OAuth
const { authUrl } = await trpc.email.getAuthUrl.mutate({
  provider: "gmail"
});
window.location.href = authUrl;

// 2. Handle callback (in your callback route)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

const result = await trpc.email.handleCallback.mutate({
  provider: "gmail",
  code,
  state
});

// Connection established!
console.log('Connected:', result.connection.email);
```

### Sync and Monitor Emails

```typescript
// Trigger sync
const { jobId } = await trpc.email.syncEmails.mutate({
  connectionId: 1
});

// Get status
const status = await trpc.email.getStatus.query();
console.log('Unread emails:', status.stats.unreadCount);
console.log('Pending drafts:', status.stats.draftsGenerated);

// List unread emails requiring response
const { emails } = await trpc.email.getEmails.query({
  unreadOnly: true,
  requiresResponse: true,
  limit: 10
});

emails.forEach(email => {
  console.log(`${email.subject} - Sentiment: ${email.sentiment}`);
});
```

### Work with AI Drafts

```typescript
// Get pending drafts
const { drafts } = await trpc.email.getDrafts.query({
  status: "pending"
});

// Review a draft
const draft = drafts[0];
console.log('Subject:', draft.draft.subject);
console.log('Body:', draft.draft.body);
console.log('Original email:', draft.email.subject);

// Send with customizations
await trpc.email.sendDraft.mutate({
  draftId: draft.draft.id,
  customizations: {
    body: draft.draft.body + "\n\nBest regards,\nYour Name"
  }
});

// Or discard
await trpc.email.deleteDraft.mutate({
  draftId: draft.draft.id
});
```

### Generate Custom Draft

```typescript
// Generate a casual reply
const { draft } = await trpc.email.generateDraft.mutate({
  emailId: 123,
  tone: "friendly",
  model: "claude-3-opus",
  context: "The customer is a long-time partner who values personal relationships."
});

console.log('Generated draft:', draft.body);
```

### Analyze Email Sentiment

```typescript
const { sentiment } = await trpc.email.analyzeSentiment.mutate({
  emailId: 123
});

console.log('Sentiment:', sentiment.sentiment);
console.log('Score:', sentiment.score);
console.log('Importance:', sentiment.importance);
console.log('Requires response:', sentiment.requiresResponse);
console.log('Category:', sentiment.category);
```

## Security Considerations

1. **Token Encryption**: All OAuth tokens are encrypted using AES-256-GCM before storage
2. **State Parameter**: CSRF protection via cryptographically secure state parameters
3. **Token Refresh**: Automatic token refresh before expiration
4. **Scope Limitation**: Only request necessary OAuth scopes
5. **Environment Variables**: Keep all credentials in environment variables, never commit to git

## Troubleshooting

### OAuth Errors

**"Invalid state parameter"**
- State expired (10 minute TTL)
- CSRF attack detected
- Solution: Restart OAuth flow

**"Failed to obtain tokens"**
- Invalid client credentials
- Redirect URI mismatch
- Solution: Verify OAuth app configuration

### Sync Errors

**"Email connection not found"**
- Connection was deleted or deactivated
- Solution: Re-authenticate

**"Token expired"**
- Automatic refresh failed
- Solution: Re-authenticate

### AI Errors

**"No AI client configured"**
- Missing ANTHROPIC_API_KEY or OPENAI_API_KEY
- Solution: Add at least one AI provider key

## Next Steps

- Set up scheduled syncs with cron jobs
- Implement email notifications for important messages
- Add custom AI prompts for different email categories
- Build frontend UI for email management
- Add support for additional email providers (Yahoo, etc.)
