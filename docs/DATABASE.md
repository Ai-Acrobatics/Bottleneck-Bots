# Bottleneck Bots Database Schema Documentation

This document provides comprehensive documentation for the Supabase/PostgreSQL database schema used in the Bottleneck Bots platform.

---

## Table of Contents

1. [Overview](#overview)
2. [User & Authentication](#user--authentication)
3. [Browser & Session Management](#browser--session-management)
4. [Workflow & Automation](#workflow--automation)
5. [AI Agent System](#ai-agent-system)
6. [Knowledge & Learning](#knowledge--learning)
7. [Billing & Subscriptions](#billing--subscriptions)
8. [Cost Tracking](#cost-tracking)
9. [Communication & Webhooks](#communication--webhooks)
10. [SEO & Analytics](#seo--analytics)
11. [Meta Ads](#meta-ads)
12. [Lead Management](#lead-management)
13. [Email Integration](#email-integration)
14. [Admin & Security](#admin--security)
15. [Alerts & Notifications](#alerts--notifications)
16. [RAG & Documentation](#rag--documentation)
17. [SOP Management](#sop-management)
18. [Entity Relationship Diagram](#entity-relationship-diagram)

---

## Overview

The database is organized into the following schema files:
- `schema.ts` - Core tables (users, sessions, documents, jobs, integrations)
- `schema-auth.ts` - Authentication tokens and login tracking
- `schema-agent.ts` - AI agent sessions and executions
- `schema-alerts.ts` - Alert rules and notifications
- `schema-admin.ts` - Admin dashboard, audit logs, feature flags
- `schema-costs.ts` - API token usage and cost tracking
- `schema-email.ts` - Email connections and sync
- `schema-knowledge.ts` - Knowledge system (patterns, selectors, feedback)
- `schema-lead-enrichment.ts` - Lead lists and enrichment
- `schema-memory.ts` - User memory and learning patterns
- `schema-meta-ads.ts` - Meta/Facebook ads integration
- `schema-rag.ts` - RAG documentation and embeddings
- `schema-scheduled-tasks.ts` - Scheduled browser automation
- `schema-security.ts` - Credentials and execution control
- `schema-seo.ts` - SEO reports and analytics
- `schema-sop.ts` - Standard Operating Procedures
- `schema-subscriptions.ts` - Subscription tiers and usage
- `schema-webhooks.ts` - Webhook configuration and messaging

---

## User & Authentication

### users
Core user table for authentication and authorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incremented user ID |
| openId | varchar(64) | UNIQUE | Manus OAuth identifier |
| googleId | varchar(64) | UNIQUE | Google OAuth identifier |
| password | text | | Bcrypt-hashed password |
| name | text | | User's display name |
| email | varchar(320) | NOT NULL, UNIQUE | Primary email address |
| loginMethod | varchar(64) | NOT NULL, DEFAULT 'email' | Auth method (email/google/manus) |
| role | varchar(20) | NOT NULL, DEFAULT 'user' | User role |
| onboardingCompleted | boolean | NOT NULL, DEFAULT false | Onboarding status |
| suspendedAt | timestamp | | Account suspension timestamp |
| suspensionReason | text | | Reason for suspension |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Last update timestamp |
| lastSignedIn | timestamp | NOT NULL, DEFAULT now() | Last login timestamp |

**Indexes:**
- `users_email_idx` on (email)
- `users_login_method_idx` on (loginMethod)
- `users_email_login_method_idx` on (email, loginMethod)

---

### sessions
User session management for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | Session identifier |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| expiresAt | timestamp with timezone | NOT NULL | Session expiration |

---

### user_profiles
Business profile data collected during onboarding.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Profile ID |
| userId | integer | NOT NULL, UNIQUE, FK -> users.id | User reference |
| companyName | text | | Business name |
| industry | varchar(100) | | Industry sector |
| monthlyRevenue | varchar(50) | | Revenue range |
| employeeCount | varchar(50) | | Employee count range |
| website | text | | Company website |
| phone | varchar(30) | | Contact phone |
| goals | jsonb | | User goals/pain points |
| currentTools | jsonb | | Current software tools |
| referralSource | varchar(100) | | How they found us |
| ghlApiKey | text | | Encrypted GoHighLevel API key |
| notes | text | | Additional notes |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### password_reset_tokens
Manages password reset flow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Token ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| token | text | NOT NULL, UNIQUE | Hashed reset token |
| expiresAt | timestamp | NOT NULL | Token expiration |
| usedAt | timestamp | | When token was used |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `password_reset_user_id_idx` on (userId)
- `password_reset_token_idx` on (token)
- `password_reset_expires_at_idx` on (expiresAt)

---

### email_verification_tokens
Email verification flow management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Token ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| token | text | NOT NULL, UNIQUE | Hashed verification token |
| expiresAt | timestamp | NOT NULL | Token expiration |
| verifiedAt | timestamp | | When verified |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `email_verification_user_id_idx` on (userId)
- `email_verification_token_idx` on (token)
- `email_verification_expires_at_idx` on (expiresAt)

---

### login_attempts
Security monitoring for login attempts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Attempt ID |
| email | varchar(320) | NOT NULL | Email used |
| ipAddress | varchar(45) | NOT NULL | Client IP (v4 or v6) |
| userAgent | text | | Browser user agent |
| success | boolean | NOT NULL | Login success/failure |
| failureReason | varchar(100) | | Reason for failure |
| attemptedAt | timestamp | NOT NULL, DEFAULT now() | Attempt timestamp |

**Indexes:**
- `login_attempts_email_idx` on (email)
- `login_attempts_ip_idx` on (ipAddress)
- `login_attempts_email_attempted_at_idx` on (email, attemptedAt)
- `login_attempts_attempted_at_idx` on (attemptedAt)

---

## Browser & Session Management

### browser_sessions
Browserbase browser session tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Session ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| sessionId | varchar(128) | NOT NULL, UNIQUE | Browserbase session ID |
| status | varchar(20) | NOT NULL, DEFAULT 'active' | active/completed/failed/expired |
| url | text | | Current/last visited URL |
| projectId | varchar(128) | | Browserbase project ID |
| debugUrl | text | | Live debug URL |
| recordingUrl | text | | Session recording URL |
| metadata | jsonb | | Additional session data |
| expiresAt | timestamp | | Session expiration |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |
| completedAt | timestamp | | Completion timestamp |

---

### user_preferences
User-specific settings and defaults.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Preference ID |
| userId | integer | NOT NULL, UNIQUE, FK -> users.id | User reference |
| defaultBrowserConfig | jsonb | | Default Browserbase config |
| defaultWorkflowSettings | jsonb | | Default automation settings |
| notifications | jsonb | | Notification preferences |
| apiKeys | jsonb | | Encrypted API keys |
| theme | varchar(20) | DEFAULT 'light' | UI theme |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Workflow & Automation

### automation_workflows
Reusable automation workflow definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Workflow ID |
| userId | integer | NOT NULL, FK -> users.id | Owner |
| name | text | NOT NULL | Workflow name |
| description | text | | Description |
| steps | jsonb | NOT NULL | Stagehand automation steps |
| category | varchar(50) | DEFAULT 'custom' | Category |
| isTemplate | boolean | NOT NULL, DEFAULT false | Public template flag |
| tags | jsonb | | Categorization tags |
| version | integer | NOT NULL, DEFAULT 1 | Version number |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| executionCount | integer | NOT NULL, DEFAULT 0 | Times executed |
| lastExecutedAt | timestamp | | Last execution |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### workflow_executions
Tracks individual workflow runs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Execution ID |
| workflowId | integer | NOT NULL, FK -> automation_workflows.id | Workflow reference |
| sessionId | integer | FK -> browser_sessions.id | Browser session |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | pending/running/completed/failed/cancelled |
| input | jsonb | | Input parameters |
| output | jsonb | | Execution results |
| error | text | | Error message |
| startedAt | timestamp | | Start time |
| completedAt | timestamp | | Completion time |
| duration | integer | | Duration in milliseconds |
| stepResults | jsonb | | Results from each step |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### scheduled_browser_tasks
Recurring browser automation tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Task ID |
| userId | integer | NOT NULL, FK -> users.id | Owner |
| name | varchar(255) | NOT NULL | Task name |
| description | text | | Description |
| automationType | varchar(50) | NOT NULL | chat/observe/extract/workflow/custom |
| automationConfig | jsonb | NOT NULL | Browser automation config |
| scheduleType | varchar(50) | NOT NULL | daily/weekly/monthly/cron/once |
| cronExpression | varchar(255) | NOT NULL | Cron expression |
| timezone | varchar(100) | NOT NULL, DEFAULT 'UTC' | Timezone |
| status | varchar(50) | NOT NULL, DEFAULT 'active' | active/paused/failed/completed/archived |
| nextRun | timestamp | | Next scheduled run |
| lastRun | timestamp | | Last run time |
| lastRunStatus | varchar(50) | | success/failed/timeout/cancelled |
| lastRunError | text | | Error message |
| lastRunDuration | integer | | Duration in ms |
| executionCount | integer | NOT NULL, DEFAULT 0 | Total executions |
| successCount | integer | NOT NULL, DEFAULT 0 | Successful runs |
| failureCount | integer | NOT NULL, DEFAULT 0 | Failed runs |
| averageDuration | integer | NOT NULL, DEFAULT 0 | Average duration |
| retryOnFailure | boolean | NOT NULL, DEFAULT true | Retry on failure |
| maxRetries | integer | NOT NULL, DEFAULT 3 | Max retry attempts |
| retryDelay | integer | NOT NULL, DEFAULT 60 | Retry delay (seconds) |
| timeout | integer | NOT NULL, DEFAULT 300 | Timeout (seconds) |
| notifyOnSuccess | boolean | NOT NULL, DEFAULT false | Success notifications |
| notifyOnFailure | boolean | NOT NULL, DEFAULT true | Failure notifications |
| notificationChannels | jsonb | | Notification config |
| keepExecutionHistory | boolean | NOT NULL, DEFAULT true | Keep history |
| maxHistoryRecords | integer | NOT NULL, DEFAULT 100 | Max history records |
| tags | jsonb | | Tags |
| metadata | jsonb | | Additional metadata |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| createdBy | integer | NOT NULL, FK -> users.id | Creator |
| lastModifiedBy | integer | NOT NULL, FK -> users.id | Last modifier |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### scheduled_task_executions
Individual execution records for scheduled tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Execution ID |
| taskId | integer | NOT NULL, FK -> scheduled_browser_tasks.id ON DELETE CASCADE | Task reference |
| status | varchar(50) | NOT NULL, DEFAULT 'queued' | queued/running/success/failed/timeout/cancelled |
| triggerType | varchar(50) | NOT NULL | scheduled/manual/retry |
| attemptNumber | integer | NOT NULL, DEFAULT 1 | Attempt number |
| startedAt | timestamp | | Start time |
| completedAt | timestamp | | End time |
| duration | integer | | Duration in ms |
| output | jsonb | | Execution output |
| error | text | | Error message |
| logs | jsonb | | Execution logs |
| sessionId | varchar(255) | | Browserbase session ID |
| debugUrl | text | | Debug URL |
| recordingUrl | text | | Recording URL |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### cron_job_registry
Tracks registered cron jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Registry ID |
| taskId | integer | NOT NULL, UNIQUE, FK -> scheduled_browser_tasks.id ON DELETE CASCADE | Task reference |
| jobId | varchar(255) | NOT NULL, UNIQUE | Internal cron job ID |
| jobName | varchar(255) | NOT NULL | Job name |
| cronExpression | varchar(255) | NOT NULL | Cron expression |
| timezone | varchar(100) | NOT NULL, DEFAULT 'UTC' | Timezone |
| isRunning | boolean | NOT NULL, DEFAULT false | Running status |
| lastStartedAt | timestamp | | Last start |
| lastCompletedAt | timestamp | | Last completion |
| nextRunAt | timestamp | | Next scheduled run |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

## AI Agent System

### agent_sessions
Persistent agent context and tool history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Session ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| sessionUuid | uuid | NOT NULL, UNIQUE, DEFAULT random() | External UUID |
| status | varchar(50) | NOT NULL, DEFAULT 'idle' | idle/planning/executing/complete/error/paused |
| context | jsonb | | Persistent context |
| thinkingSteps | jsonb | NOT NULL, DEFAULT '[]' | Agent reasoning steps |
| toolHistory | jsonb | NOT NULL, DEFAULT '[]' | Tool execution history |
| plan | jsonb | | Current execution plan |
| currentPhase | varchar(100) | | Current phase/step |
| iterationCount | integer | NOT NULL, DEFAULT 0 | Iterations performed |
| maxIterations | integer | NOT NULL, DEFAULT 100 | Max iterations |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### agent_executions
Individual task executions within agent sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Execution ID |
| sessionId | integer | NOT NULL, FK -> agent_sessions.id | Session reference |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| taskDescription | text | NOT NULL | Original task request |
| status | varchar(50) | NOT NULL, DEFAULT 'pending' | pending/planning/executing/completed/failed/cancelled |
| plan | jsonb | | Execution plan |
| phases | jsonb | NOT NULL, DEFAULT '[]' | Execution phases |
| currentPhaseIndex | integer | NOT NULL, DEFAULT 0 | Current phase |
| thinkingSteps | jsonb | NOT NULL, DEFAULT '[]' | Reasoning log |
| toolExecutions | jsonb | NOT NULL, DEFAULT '[]' | Tool results |
| result | jsonb | | Final result |
| error | text | | Error message |
| iterations | integer | NOT NULL, DEFAULT 0 | Iterations |
| durationMs | integer | | Total duration |
| startedAt | timestamp | | Start time |
| completedAt | timestamp | | Completion time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### tool_executions
Analytics for individual tool calls.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Execution ID |
| executionId | integer | NOT NULL, FK -> agent_executions.id | Agent execution reference |
| toolName | varchar(100) | NOT NULL | Tool name |
| parameters | jsonb | | Input parameters |
| result | jsonb | | Tool output |
| success | boolean | NOT NULL, DEFAULT true | Success status |
| durationMs | integer | | Execution time |
| error | text | | Error message |
| executedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### generated_projects
Webdev projects created by the agent.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Project ID |
| userId | integer | NOT NULL, FK -> users.id | Owner |
| executionId | integer | FK -> agent_executions.id | Creating execution |
| name | varchar(255) | NOT NULL | Project name |
| description | text | | Description |
| techStack | varchar(50) | NOT NULL, DEFAULT 'react' | Tech stack |
| features | jsonb | NOT NULL, DEFAULT '{}' | Features config |
| filesSnapshot | jsonb | | Generated files |
| status | varchar(50) | NOT NULL, DEFAULT 'active' | active/archived/deleted |
| devServerPort | integer | | Dev server port |
| previewUrl | text | | Preview URL |
| deploymentUrl | text | | Production URL |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### knowledge_entries
Agent learning and feedback storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Entry ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| category | varchar(50) | NOT NULL | workflow/brand_voice/preference/process/technical |
| context | text | NOT NULL | Context/scenario |
| content | text | NOT NULL | Knowledge content |
| examples | jsonb | | Example applications |
| confidence | decimal(3,2) | NOT NULL, DEFAULT 1.0 | Confidence score (0-1) |
| usageCount | integer | NOT NULL, DEFAULT 0 | Usage count |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Knowledge & Learning

### action_patterns
Learned automation patterns for tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Pattern ID |
| userId | integer | FK -> users.id | User reference |
| taskType | varchar(255) | NOT NULL | Task type |
| taskName | text | NOT NULL | Task name |
| pageUrl | text | | Page URL |
| steps | jsonb | NOT NULL, DEFAULT [] | Automation steps |
| successCount | integer | NOT NULL, DEFAULT 0 | Success count |
| failureCount | integer | NOT NULL, DEFAULT 0 | Failure count |
| lastExecuted | timestamp | | Last execution |
| metadata | jsonb | DEFAULT {} | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `action_patterns_task_type_idx` on (taskType)
- `action_patterns_user_id_idx` on (userId)

---

### element_selectors
UI element selectors with fallbacks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Selector ID |
| userId | integer | FK -> users.id | User reference |
| pagePath | varchar(500) | NOT NULL | Page path |
| elementName | varchar(255) | NOT NULL | Element name |
| primarySelector | text | NOT NULL | Primary CSS selector |
| fallbackSelectors | jsonb | NOT NULL, DEFAULT [] | Fallback selectors |
| successRate | real | NOT NULL, DEFAULT 1.0 | Success rate |
| totalAttempts | integer | NOT NULL, DEFAULT 0 | Total attempts |
| lastVerified | timestamp | | Last verification |
| screenshotRef | text | | Screenshot reference |
| metadata | jsonb | DEFAULT {} | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `element_selectors_page_path_idx` on (pagePath)
- `element_selectors_element_name_idx` on (elementName)
- `element_selectors_user_id_idx` on (userId)

---

### error_patterns
Error recovery strategies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Pattern ID |
| userId | integer | FK -> users.id | User reference |
| errorType | varchar(255) | NOT NULL | Error type |
| errorMessage | text | | Error message |
| context | text | | Error context |
| recoveryStrategies | jsonb | NOT NULL, DEFAULT [] | Recovery strategies |
| occurrenceCount | integer | NOT NULL, DEFAULT 0 | Occurrences |
| resolvedCount | integer | NOT NULL, DEFAULT 0 | Resolutions |
| lastOccurred | timestamp | | Last occurrence |
| metadata | jsonb | DEFAULT {} | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `error_patterns_error_type_idx` on (errorType)
- `error_patterns_context_idx` on (context)
- `error_patterns_user_id_idx` on (userId)

---

### user_memory
Long-term user preferences and learned patterns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Memory ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| preferences | jsonb | NOT NULL | User preferences |
| taskHistory | jsonb | NOT NULL, DEFAULT [] | Task execution summaries |
| learnedPatterns | jsonb | NOT NULL | Learned patterns |
| userCorrections | jsonb | NOT NULL, DEFAULT [] | User corrections |
| stats | jsonb | NOT NULL | Usage statistics |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |
| lastAccessedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `user_memory_user_id_idx` on (userId)

---

### execution_checkpoints
Checkpoints for resuming failed executions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Checkpoint ID |
| checkpointId | varchar(255) | NOT NULL, UNIQUE | Checkpoint identifier |
| executionId | integer | NOT NULL | Execution reference |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| phaseId | integer | | Current phase ID |
| phaseName | text | | Current phase name |
| stepIndex | integer | NOT NULL, DEFAULT 0 | Step index |
| completedSteps | jsonb | NOT NULL, DEFAULT [] | Completed steps |
| completedPhases | jsonb | NOT NULL, DEFAULT [] | Completed phases |
| partialResults | jsonb | NOT NULL, DEFAULT {} | Intermediate results |
| extractedData | jsonb | NOT NULL, DEFAULT {} | Extracted data |
| sessionState | jsonb | | Browser session state |
| browserContext | jsonb | | Browser context |
| errorInfo | jsonb | | Error context |
| checkpointReason | varchar(100) | | error/manual/auto/phase_complete |
| canResume | boolean | NOT NULL, DEFAULT true | Resume capability |
| resumeCount | integer | NOT NULL, DEFAULT 0 | Resume count |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| expiresAt | timestamp | | Expiration |

**Indexes:**
- `execution_checkpoint_id_idx` on (checkpointId)
- `execution_checkpoint_execution_id_idx` on (executionId)
- `execution_checkpoint_user_id_idx` on (userId)
- `execution_checkpoint_created_at_idx` on (createdAt)
- `execution_checkpoint_expires_at_idx` on (expiresAt)

---

### task_success_patterns
Successful task execution patterns for reuse.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Pattern ID |
| patternId | varchar(255) | NOT NULL, UNIQUE | Pattern identifier |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| taskType | varchar(100) | NOT NULL | Task type |
| taskName | text | | Task name |
| successfulApproach | jsonb | NOT NULL | Working approach |
| selectors | jsonb | DEFAULT {} | CSS selectors |
| workflow | jsonb | DEFAULT [] | Workflow steps |
| contextConditions | jsonb | DEFAULT {} | Applicability conditions |
| requiredState | jsonb | DEFAULT {} | Required state |
| avgExecutionTime | real | | Average execution time |
| successRate | real | NOT NULL, DEFAULT 1.0 | Success rate |
| usageCount | integer | NOT NULL, DEFAULT 1 | Usage count |
| confidence | real | NOT NULL, DEFAULT 0.8 | Confidence score |
| adaptations | jsonb | DEFAULT [] | Adaptations over time |
| reasoningPatternId | varchar(255) | | Linked reasoning pattern |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |
| lastUsedAt | timestamp | | Last usage |

**Indexes:**
- `task_success_user_id_idx` on (userId)
- `task_success_task_type_idx` on (taskType)
- `task_success_success_rate_idx` on (successRate)
- `task_success_confidence_idx` on (confidence)

---

### workflow_patterns
Pre-built and learned workflow patterns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Pattern ID |
| patternId | varchar(255) | NOT NULL, UNIQUE | Pattern identifier |
| name | text | NOT NULL | Pattern name |
| description | text | | Description |
| category | varchar(100) | | Category |
| pattern | jsonb | NOT NULL | Pattern definition |
| variables | jsonb | DEFAULT [] | Required variables |
| conditions | jsonb | DEFAULT {} | Usage conditions |
| userId | integer | FK -> users.id | Owner (null = system) |
| isPublic | boolean | NOT NULL, DEFAULT false | Public visibility |
| isSystemPattern | boolean | NOT NULL, DEFAULT false | System pattern flag |
| usageCount | integer | NOT NULL, DEFAULT 0 | Usage count |
| successRate | real | NOT NULL, DEFAULT 1.0 | Success rate |
| avgExecutionTime | real | | Average execution time |
| tags | jsonb | DEFAULT [] | Tags |
| metadata | jsonb | DEFAULT {} | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |
| lastUsedAt | timestamp | | Last usage |

**Indexes:**
- `workflow_pattern_user_id_idx` on (userId)
- `workflow_pattern_category_idx` on (category)
- `workflow_pattern_public_idx` on (isPublic)
- `workflow_pattern_system_idx` on (isSystemPattern)

---

## Billing & Subscriptions

### subscription_tiers
Available subscription plan definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Tier ID |
| slug | varchar(50) | NOT NULL, UNIQUE | Tier identifier |
| name | varchar(100) | NOT NULL | Display name |
| description | text | | Description |
| monthlyPriceCents | integer | NOT NULL | Monthly price in cents |
| setupFeeCents | integer | NOT NULL, DEFAULT 0 | Setup fee in cents |
| weeklyPremiumPercent | integer | NOT NULL, DEFAULT 15 | Weekly premium (+%) |
| sixMonthDiscountPercent | integer | NOT NULL, DEFAULT 5 | 6-month discount (%) |
| annualDiscountPercent | integer | NOT NULL, DEFAULT 10 | Annual discount (%) |
| maxAgents | integer | NOT NULL | Max agents |
| maxConcurrentAgents | integer | NOT NULL | Max concurrent agents |
| monthlyExecutionLimit | integer | NOT NULL | Monthly execution limit |
| maxExecutionDurationMinutes | integer | NOT NULL, DEFAULT 60 | Max execution duration |
| maxGhlAccounts | integer | | Max GHL accounts (null = unlimited) |
| features | jsonb | NOT NULL, DEFAULT {} | Feature flags |
| allowedStrategies | jsonb | NOT NULL, DEFAULT ["auto"] | Swarm strategies |
| sortOrder | integer | NOT NULL, DEFAULT 0 | Display order |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| isPopular | boolean | NOT NULL, DEFAULT false | Popular badge |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Default Tiers:**
- Starter: $997/mo, 5 agents, 200 executions
- Growth: $1,697/mo, 10 agents, 500 executions
- Professional: $3,197/mo, 25 agents, 1,250 executions
- Enterprise: $4,997/mo, 50 agents, 3,000 executions

---

### user_subscriptions
Active user subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Subscription ID |
| userId | integer | NOT NULL, UNIQUE, FK -> users.id ON DELETE CASCADE | User reference |
| tierId | integer | NOT NULL, FK -> subscription_tiers.id | Tier reference |
| status | varchar(50) | NOT NULL, DEFAULT 'active' | active/past_due/cancelled/paused/trial |
| paymentFrequency | varchar(20) | NOT NULL, DEFAULT 'monthly' | weekly/monthly/six_month/annual |
| currentPeriodStart | timestamp | NOT NULL | Period start |
| currentPeriodEnd | timestamp | NOT NULL | Period end |
| cancelAtPeriodEnd | boolean | NOT NULL, DEFAULT false | Cancel at period end |
| stripeCustomerId | varchar(255) | | Stripe customer ID |
| stripeSubscriptionId | varchar(255) | | Stripe subscription ID |
| executionsUsedThisPeriod | integer | NOT NULL, DEFAULT 0 | Executions used |
| agentsSpawnedThisPeriod | integer | NOT NULL, DEFAULT 0 | Agents spawned |
| additionalAgentSlots | integer | NOT NULL, DEFAULT 0 | Add-on agent slots |
| additionalExecutions | integer | NOT NULL, DEFAULT 0 | Top-off executions |
| trialEndsAt | timestamp | | Trial end date |
| cancelledAt | timestamp | | Cancellation timestamp |
| cancellationReason | text | | Cancellation reason |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### execution_packs
One-time purchasable execution bundles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Pack ID |
| slug | varchar(50) | NOT NULL, UNIQUE | Pack identifier |
| name | varchar(100) | NOT NULL | Pack name |
| description | text | | Description |
| executionCount | integer | | Executions (null = unlimited) |
| validForDays | integer | | Validity period (null = billing period) |
| priceCents | integer | NOT NULL | Price in cents |
| minTierId | integer | FK -> subscription_tiers.id | Minimum tier required |
| maxPerMonth | integer | | Max purchases per month |
| sortOrder | integer | NOT NULL, DEFAULT 0 | Display order |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### user_execution_packs
User purchases of execution top-off packs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Purchase ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| packId | integer | NOT NULL, FK -> execution_packs.id | Pack reference |
| executionsIncluded | integer | | Included executions |
| executionsRemaining | integer | | Remaining executions |
| purchasedAt | timestamp | NOT NULL, DEFAULT now() | Purchase time |
| expiresAt | timestamp | | Expiration |
| pricePaidCents | integer | NOT NULL | Price paid |
| stripePaymentIntentId | varchar(255) | | Stripe payment ID |
| status | varchar(50) | NOT NULL, DEFAULT 'active' | active/depleted/expired |
| metadata | jsonb | | Metadata |

---

### agent_add_ons
Recurring add-ons for additional agent slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Add-on ID |
| slug | varchar(50) | NOT NULL, UNIQUE | Add-on identifier |
| name | varchar(100) | NOT NULL | Add-on name |
| description | text | | Description |
| additionalAgents | integer | NOT NULL | Agent slots added |
| monthlyPriceCents | integer | NOT NULL | Monthly price in cents |
| minTierId | integer | FK -> subscription_tiers.id | Minimum tier |
| maxPerUser | integer | | Max per user |
| sortOrder | integer | NOT NULL, DEFAULT 0 | Display order |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### user_agent_add_ons
User agent add-on subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Subscription ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| addOnId | integer | NOT NULL, FK -> agent_add_ons.id | Add-on reference |
| quantity | integer | NOT NULL, DEFAULT 1 | Quantity |
| status | varchar(50) | NOT NULL, DEFAULT 'active' | active/cancelled |
| stripeSubscriptionItemId | varchar(255) | | Stripe subscription item ID |
| startedAt | timestamp | NOT NULL, DEFAULT now() | Start time |
| cancelledAt | timestamp | | Cancellation time |
| metadata | jsonb | | Metadata |

---

### subscription_usage_records
Monthly usage tracking per billing period.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Record ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| periodStart | timestamp | NOT NULL | Period start |
| periodEnd | timestamp | NOT NULL | Period end |
| tierId | integer | NOT NULL, FK -> subscription_tiers.id | Tier at time |
| executionLimit | integer | NOT NULL | Execution limit |
| agentLimit | integer | NOT NULL | Agent limit |
| executionsUsed | integer | NOT NULL, DEFAULT 0 | Executions used |
| peakConcurrentAgents | integer | NOT NULL, DEFAULT 0 | Peak concurrent |
| additionalExecutionsPurchased | integer | NOT NULL, DEFAULT 0 | Purchased executions |
| additionalExecutionsUsed | integer | NOT NULL, DEFAULT 0 | Used additional |
| overageExecutions | integer | NOT NULL, DEFAULT 0 | Overage executions |
| overageChargedCents | integer | NOT NULL, DEFAULT 0 | Overage charges |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Cost Tracking

### api_token_usage
Claude API token consumption tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Usage ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| executionId | integer | FK -> task_executions.id ON DELETE CASCADE | Execution reference |
| requestId | varchar(255) | | Claude API request ID |
| model | varchar(100) | NOT NULL | Model name |
| inputTokens | integer | NOT NULL, DEFAULT 0 | Input tokens |
| outputTokens | integer | NOT NULL, DEFAULT 0 | Output tokens |
| cacheCreationTokens | integer | NOT NULL, DEFAULT 0 | Cache creation tokens |
| cacheReadTokens | integer | NOT NULL, DEFAULT 0 | Cache read tokens |
| totalTokens | integer | NOT NULL | Total tokens |
| inputCost | decimal(10,4) | NOT NULL | Input cost (USD) |
| outputCost | decimal(10,4) | NOT NULL | Output cost (USD) |
| cacheCost | decimal(10,4) | NOT NULL, DEFAULT 0 | Cache cost (USD) |
| totalCost | decimal(10,4) | NOT NULL | Total cost (USD) |
| promptType | varchar(100) | | system/task/observation/error_recovery |
| toolsUsed | jsonb | | Tools called |
| responseTime | integer | | Response time (ms) |
| stopReason | varchar(50) | | Stop reason |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `api_token_usage_user_id_idx` on (userId)
- `api_token_usage_execution_id_idx` on (executionId)
- `api_token_usage_model_idx` on (model)
- `api_token_usage_created_at_idx` on (createdAt)
- `api_token_usage_user_created_idx` on (userId, createdAt)

---

### gemini_token_usage
Gemini API token consumption tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Usage ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| executionId | integer | FK -> task_executions.id ON DELETE CASCADE | Execution reference |
| requestId | varchar(255) | | Gemini API request ID |
| model | varchar(100) | NOT NULL | Model name |
| inputTokens | integer | NOT NULL, DEFAULT 0 | Input tokens |
| outputTokens | integer | NOT NULL, DEFAULT 0 | Output tokens |
| totalTokens | integer | NOT NULL | Total tokens |
| inputCost | decimal(10,6) | NOT NULL | Input cost (USD) |
| outputCost | decimal(10,6) | NOT NULL | Output cost (USD) |
| totalCost | decimal(10,6) | NOT NULL | Total cost (USD) |
| promptType | varchar(100) | | Prompt type |
| toolsUsed | jsonb | | Tools called |
| responseTime | integer | | Response time (ms) |
| finishReason | varchar(50) | | Finish reason |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `gemini_token_usage_user_id_idx` on (userId)
- `gemini_token_usage_execution_id_idx` on (executionId)
- `gemini_token_usage_model_idx` on (model)
- `gemini_token_usage_created_at_idx` on (createdAt)
- `gemini_token_usage_user_created_idx` on (userId, createdAt)

---

### browserbase_costs
Browserbase session cost tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Cost ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| executionId | integer | FK -> task_executions.id ON DELETE CASCADE | Execution reference |
| sessionId | varchar(255) | NOT NULL, UNIQUE | Browserbase session ID |
| projectId | varchar(255) | | Project ID |
| durationMs | integer | NOT NULL | Duration in ms |
| durationMinutes | decimal(10,2) | NOT NULL | Duration in minutes |
| costPerMinute | decimal(10,4) | NOT NULL, DEFAULT 0.01 | Cost per minute |
| totalCost | decimal(10,4) | NOT NULL | Total cost (USD) |
| debugUrl | varchar(500) | | Debug URL |
| recordingUrl | varchar(500) | | Recording URL |
| hasRecording | boolean | NOT NULL, DEFAULT false | Has recording |
| recordingCost | decimal(10,4) | NOT NULL, DEFAULT 0 | Recording cost |
| screenshotCount | integer | NOT NULL, DEFAULT 0 | Screenshot count |
| screenshotCost | decimal(10,4) | NOT NULL, DEFAULT 0 | Screenshot cost |
| status | varchar(50) | NOT NULL | active/completed/failed/timeout |
| startedAt | timestamp | NOT NULL | Start time |
| completedAt | timestamp | | Completion time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `browserbase_costs_user_id_idx` on (userId)
- `browserbase_costs_execution_id_idx` on (executionId)
- `browserbase_costs_session_id_idx` on (sessionId)
- `browserbase_costs_status_idx` on (status)
- `browserbase_costs_created_at_idx` on (createdAt)
- `browserbase_costs_user_created_idx` on (userId, createdAt)

---

### storage_costs
S3/R2 storage operation cost tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Cost ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| executionId | integer | FK -> task_executions.id ON DELETE CASCADE | Execution reference |
| operationId | varchar(255) | | Operation ID |
| provider | varchar(50) | NOT NULL | s3/r2/gcs |
| bucket | varchar(255) | NOT NULL | Bucket name |
| operationType | varchar(50) | NOT NULL | upload/download/delete/list |
| objectKey | varchar(1000) | | S3 object key |
| sizeBytes | integer | NOT NULL, DEFAULT 0 | Size in bytes |
| sizeMb | decimal(10,4) | NOT NULL, DEFAULT 0 | Size in MB |
| storageCostPerGb | decimal(10,6) | NOT NULL, DEFAULT 0.023 | Storage cost/GB |
| transferCostPerGb | decimal(10,6) | NOT NULL, DEFAULT 0.09 | Transfer cost/GB |
| requestCost | decimal(10,8) | NOT NULL, DEFAULT 0 | Request cost |
| totalCost | decimal(10,6) | NOT NULL | Total cost |
| contentType | varchar(255) | | Content type |
| status | varchar(50) | NOT NULL | success/failed/pending |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `storage_costs_user_id_idx` on (userId)
- `storage_costs_execution_id_idx` on (executionId)
- `storage_costs_provider_idx` on (provider)
- `storage_costs_operation_type_idx` on (operationType)
- `storage_costs_created_at_idx` on (createdAt)
- `storage_costs_user_created_idx` on (userId, createdAt)

---

### daily_cost_summaries
Aggregated daily cost data per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Summary ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| date | timestamp | NOT NULL | Summary date |
| totalApiCalls | integer | NOT NULL, DEFAULT 0 | API calls |
| totalInputTokens | integer | NOT NULL, DEFAULT 0 | Input tokens |
| totalOutputTokens | integer | NOT NULL, DEFAULT 0 | Output tokens |
| totalCacheTokens | integer | NOT NULL, DEFAULT 0 | Cache tokens |
| apiCostUsd | decimal(10,4) | NOT NULL, DEFAULT 0 | API cost |
| totalGeminiCalls | integer | NOT NULL, DEFAULT 0 | Gemini calls |
| totalGeminiInputTokens | integer | NOT NULL, DEFAULT 0 | Gemini input tokens |
| totalGeminiOutputTokens | integer | NOT NULL, DEFAULT 0 | Gemini output tokens |
| geminiCostUsd | decimal(10,6) | NOT NULL, DEFAULT 0 | Gemini cost |
| totalSessions | integer | NOT NULL, DEFAULT 0 | Browser sessions |
| totalSessionMinutes | decimal(10,2) | NOT NULL, DEFAULT 0 | Session minutes |
| browserbaseCostUsd | decimal(10,4) | NOT NULL, DEFAULT 0 | Browserbase cost |
| totalStorageOperations | integer | NOT NULL, DEFAULT 0 | Storage operations |
| totalStorageMb | decimal(10,4) | NOT NULL, DEFAULT 0 | Storage MB |
| storageCostUsd | decimal(10,6) | NOT NULL, DEFAULT 0 | Storage cost |
| totalCostUsd | decimal(10,4) | NOT NULL | Total cost |
| costByModel | jsonb | | Cost breakdown by model |
| costByProvider | jsonb | | Cost breakdown by provider |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `daily_cost_summaries_user_id_idx` on (userId)
- `daily_cost_summaries_date_idx` on (date)
- `daily_cost_summaries_user_date_idx` on (userId, date)

---

### cost_budgets
User spending limits and alerts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Budget ID |
| userId | integer | NOT NULL, UNIQUE, FK -> users.id ON DELETE CASCADE | User reference |
| dailyBudget | decimal(10,2) | | Daily budget (USD) |
| weeklyBudget | decimal(10,2) | | Weekly budget (USD) |
| monthlyBudget | decimal(10,2) | | Monthly budget (USD) |
| alertThreshold | integer | NOT NULL, DEFAULT 80 | Alert threshold (%) |
| currentDailySpend | decimal(10,4) | NOT NULL, DEFAULT 0 | Daily spend |
| currentWeeklySpend | decimal(10,4) | NOT NULL, DEFAULT 0 | Weekly spend |
| currentMonthlySpend | decimal(10,4) | NOT NULL, DEFAULT 0 | Monthly spend |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| autoStopOnLimit | boolean | NOT NULL, DEFAULT false | Stop on limit |
| lastAlertSent | timestamp | | Last alert time |
| alertsSentToday | integer | NOT NULL, DEFAULT 0 | Daily alerts sent |
| dailyPeriodStart | timestamp | NOT NULL, DEFAULT now() | Daily period start |
| weeklyPeriodStart | timestamp | NOT NULL, DEFAULT now() | Weekly period start |
| monthlyPeriodStart | timestamp | NOT NULL, DEFAULT now() | Monthly period start |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `cost_budgets_user_id_idx` on (userId)
- `cost_budgets_is_active_idx` on (isActive)

---

## Communication & Webhooks

### user_webhooks
User-configurable webhook endpoints for communication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Webhook ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| webhookToken | uuid | NOT NULL, UNIQUE, DEFAULT random() | Unique token |
| webhookUrl | text | | Generated URL |
| channelType | varchar(50) | NOT NULL | sms/email/custom_webhook |
| channelName | varchar(100) | NOT NULL | Friendly name |
| channelOrder | integer | NOT NULL, DEFAULT 1 | Order (1-3) |
| providerConfig | jsonb | | Provider configuration |
| outboundEnabled | boolean | NOT NULL, DEFAULT true | Outbound enabled |
| outboundConfig | jsonb | | Outbound configuration |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| isPrimary | boolean | NOT NULL, DEFAULT false | Primary channel |
| isVerified | boolean | NOT NULL, DEFAULT false | Verified status |
| verifiedAt | timestamp | | Verification time |
| verificationCode | varchar(10) | | Verification code |
| verificationCodeExpiresAt | timestamp | | Code expiry |
| tokenExpiresAt | timestamp | | Token expiry |
| tokenRotationRequired | boolean | NOT NULL, DEFAULT false | Rotation required |
| secretKey | varchar(64) | | HMAC signing key |
| rateLimitPerMinute | integer | NOT NULL, DEFAULT 30 | Rate limit/minute |
| rateLimitPerHour | integer | NOT NULL, DEFAULT 200 | Rate limit/hour |
| totalMessagesReceived | integer | NOT NULL, DEFAULT 0 | Messages received |
| totalMessagesSent | integer | NOT NULL, DEFAULT 0 | Messages sent |
| lastMessageAt | timestamp | | Last message time |
| metadata | jsonb | | Metadata |
| tags | jsonb | | Tags |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `user_webhooks_user_id_idx` on (userId)
- `user_webhooks_token_idx` on (webhookToken) UNIQUE
- `user_webhooks_channel_type_idx` on (channelType)
- `user_webhooks_is_active_idx` on (isActive)
- `user_webhooks_user_channel_idx` on (userId, channelType)

---

### inbound_messages
Messages received through webhooks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Message ID |
| webhookId | integer | NOT NULL, FK -> user_webhooks.id ON DELETE CASCADE | Webhook reference |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| externalMessageId | varchar(255) | | Provider message ID |
| senderIdentifier | varchar(255) | NOT NULL | Sender ID |
| senderName | varchar(255) | | Sender name |
| messageType | varchar(50) | NOT NULL | text/image/audio/file/structured |
| content | text | NOT NULL | Raw content |
| contentParsed | jsonb | | Parsed content |
| hasAttachments | boolean | NOT NULL, DEFAULT false | Has attachments |
| attachments | jsonb | | Attachment references |
| processingStatus | varchar(50) | NOT NULL, DEFAULT 'received' | Processing status |
| processingError | text | | Processing error |
| taskId | integer | | Created task reference |
| conversationId | integer | | Conversation reference |
| isPartOfThread | boolean | NOT NULL, DEFAULT false | Thread indicator |
| parentMessageId | integer | FK -> inbound_messages.id | Parent message |
| rawPayload | jsonb | | Original payload |
| providerMetadata | jsonb | | Provider metadata |
| receivedAt | timestamp | NOT NULL, DEFAULT now() | Receipt time |
| processedAt | timestamp | | Processing time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `inbound_messages_webhook_id_idx` on (webhookId)
- `inbound_messages_user_id_idx` on (userId)
- `inbound_messages_sender_idx` on (senderIdentifier)
- `inbound_messages_status_idx` on (processingStatus)
- `inbound_messages_conversation_idx` on (conversationId)
- `inbound_messages_received_at_idx` on (receivedAt)
- `inbound_messages_user_webhook_idx` on (userId, webhookId)

---

### bot_conversations
Bot conversation context tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Conversation ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| webhookId | integer | FK -> user_webhooks.id ON DELETE SET NULL | Webhook reference |
| conversationUuid | uuid | NOT NULL, UNIQUE, DEFAULT random() | External UUID |
| participantIdentifier | varchar(255) | NOT NULL | Participant ID |
| status | varchar(50) | NOT NULL, DEFAULT 'active' | active/paused/resolved/archived |
| topic | varchar(255) | | Main topic |
| contextSummary | text | | AI-generated summary |
| contextMemory | jsonb | | Key facts |
| aiPersonality | varchar(50) | DEFAULT 'professional' | AI personality |
| autoCreateTasks | boolean | NOT NULL, DEFAULT true | Auto-create tasks |
| requireConfirmation | boolean | NOT NULL, DEFAULT false | Require confirmation |
| messageCount | integer | NOT NULL, DEFAULT 0 | Message count |
| tasksCreated | integer | NOT NULL, DEFAULT 0 | Tasks created |
| lastMessageAt | timestamp | | Last message |
| startedAt | timestamp | NOT NULL, DEFAULT now() | Start time |
| resolvedAt | timestamp | | Resolution time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `bot_conversations_user_id_idx` on (userId)
- `bot_conversations_webhook_id_idx` on (webhookId)
- `bot_conversations_uuid_idx` on (conversationUuid) UNIQUE
- `bot_conversations_participant_idx` on (participantIdentifier)
- `bot_conversations_status_idx` on (status)
- `bot_conversations_user_participant_idx` on (userId, participantIdentifier)

---

### agency_tasks
Task board for bot execution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Task ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| taskUuid | uuid | NOT NULL, UNIQUE, DEFAULT random() | External UUID |
| sourceType | varchar(50) | NOT NULL | Source type |
| sourceWebhookId | integer | FK -> user_webhooks.id ON DELETE SET NULL | Source webhook |
| sourceMessageId | integer | FK -> inbound_messages.id ON DELETE SET NULL | Source message |
| conversationId | integer | FK -> bot_conversations.id ON DELETE SET NULL | Conversation |
| title | varchar(500) | NOT NULL | Task title |
| description | text | | Description |
| originalMessage | text | | Original message |
| category | varchar(100) | DEFAULT 'general' | Category |
| taskType | varchar(100) | NOT NULL | Task type |
| priority | varchar(20) | NOT NULL, DEFAULT 'medium' | low/medium/high/critical |
| urgency | varchar(20) | NOT NULL, DEFAULT 'normal' | Urgency level |
| status | varchar(50) | NOT NULL, DEFAULT 'pending' | Task status |
| statusReason | text | | Status reason |
| assignedToBot | boolean | NOT NULL, DEFAULT true | Bot assignment |
| requiresHumanReview | boolean | NOT NULL, DEFAULT false | Human review required |
| humanReviewedBy | integer | FK -> users.id ON DELETE SET NULL | Reviewer |
| humanReviewedAt | timestamp | | Review time |
| executionType | varchar(50) | DEFAULT 'automatic' | Execution type |
| executionConfig | jsonb | | Execution configuration |
| scheduledFor | timestamp | | Scheduled time |
| deadline | timestamp | | Deadline |
| dependsOn | jsonb | | Dependencies |
| blockedBy | integer | FK -> agency_tasks.id ON DELETE SET NULL | Blocking task |
| result | jsonb | | Execution result |
| resultSummary | text | | Result summary |
| lastError | text | | Last error |
| errorCount | integer | NOT NULL, DEFAULT 0 | Error count |
| maxRetries | integer | NOT NULL, DEFAULT 3 | Max retries |
| notifyOnComplete | boolean | NOT NULL, DEFAULT true | Complete notification |
| notifyOnFailure | boolean | NOT NULL, DEFAULT true | Failure notification |
| notificationsSent | jsonb | | Notifications log |
| tags | jsonb | | Tags |
| metadata | jsonb | | Metadata |
| queuedAt | timestamp | | Queue time |
| startedAt | timestamp | | Start time |
| completedAt | timestamp | | Completion time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `agency_tasks_user_id_idx` on (userId)
- `agency_tasks_uuid_idx` on (taskUuid) UNIQUE
- `agency_tasks_status_idx` on (status)
- `agency_tasks_priority_idx` on (priority)
- `agency_tasks_task_type_idx` on (taskType)
- `agency_tasks_scheduled_for_idx` on (scheduledFor)
- `agency_tasks_conversation_id_idx` on (conversationId)
- `agency_tasks_user_status_idx` on (userId, status)
- `agency_tasks_pending_bot_idx` on (status, assignedToBot, scheduledFor)

---

### task_executions
Task execution history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Execution ID |
| taskId | integer | NOT NULL, FK -> agency_tasks.id ON DELETE CASCADE | Task reference |
| executionUuid | uuid | NOT NULL, UNIQUE, DEFAULT random() | External UUID |
| attemptNumber | integer | NOT NULL, DEFAULT 1 | Attempt number |
| status | varchar(50) | NOT NULL, DEFAULT 'started' | Execution status |
| triggeredBy | varchar(50) | NOT NULL | Trigger type |
| triggeredByUserId | integer | FK -> users.id ON DELETE SET NULL | Trigger user |
| browserSessionId | varchar(255) | | Browserbase session |
| debugUrl | text | | Debug URL |
| recordingUrl | text | | Recording URL |
| stepsTotal | integer | NOT NULL, DEFAULT 0 | Total steps |
| stepsCompleted | integer | NOT NULL, DEFAULT 0 | Completed steps |
| currentStep | varchar(255) | | Current step |
| stepResults | jsonb | | Step results |
| output | jsonb | | Execution output |
| logs | jsonb | | Execution logs |
| screenshots | jsonb | | Screenshots |
| error | text | | Error message |
| errorCode | varchar(100) | | Error code |
| errorStack | text | | Error stack |
| duration | integer | | Duration (ms) |
| resourceUsage | jsonb | | Resource usage |
| startedAt | timestamp | NOT NULL, DEFAULT now() | Start time |
| completedAt | timestamp | | Completion time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `task_executions_task_id_idx` on (taskId)
- `task_executions_uuid_idx` on (executionUuid) UNIQUE
- `task_executions_status_idx` on (status)
- `task_executions_started_at_idx` on (startedAt)
- `task_executions_browser_session_idx` on (browserSessionId)

---

### outbound_messages
Messages sent by the bot.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Message ID |
| webhookId | integer | NOT NULL, FK -> user_webhooks.id ON DELETE CASCADE | Webhook reference |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| inboundMessageId | integer | FK -> inbound_messages.id ON DELETE SET NULL | Reply to |
| taskId | integer | FK -> agency_tasks.id ON DELETE SET NULL | Related task |
| conversationId | integer | FK -> bot_conversations.id ON DELETE SET NULL | Conversation |
| messageType | varchar(50) | NOT NULL | Message type |
| content | text | NOT NULL | Message content |
| recipientIdentifier | varchar(255) | NOT NULL | Recipient ID |
| recipientName | varchar(255) | | Recipient name |
| deliveryStatus | varchar(50) | NOT NULL, DEFAULT 'pending' | Delivery status |
| deliveryError | text | | Delivery error |
| externalMessageId | varchar(255) | | Provider message ID |
| providerResponse | jsonb | | Provider response |
| scheduledFor | timestamp | | Scheduled time |
| sentAt | timestamp | | Send time |
| deliveredAt | timestamp | | Delivery time |
| readAt | timestamp | | Read time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Indexes:**
- `outbound_messages_webhook_id_idx` on (webhookId)
- `outbound_messages_user_id_idx` on (userId)
- `outbound_messages_task_id_idx` on (taskId)
- `outbound_messages_conversation_id_idx` on (conversationId)
- `outbound_messages_delivery_status_idx` on (deliveryStatus)
- `outbound_messages_scheduled_for_idx` on (scheduledFor)
- `outbound_messages_pending_idx` on (deliveryStatus, scheduledFor)

---

### webhook_logs
Webhook delivery logging with retry tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT random() | Log ID |
| webhookId | text | NOT NULL | Webhook ID |
| userId | integer | NOT NULL, FK -> users.id ON DELETE CASCADE | User reference |
| event | varchar(100) | NOT NULL | Event type |
| url | text | NOT NULL | Webhook URL |
| method | varchar(10) | NOT NULL, DEFAULT 'POST' | HTTP method |
| requestHeaders | jsonb | | Request headers |
| requestBody | jsonb | | Request body |
| responseStatus | integer | | Response status code |
| responseBody | text | | Response body |
| responseTime | integer | | Response time (ms) |
| status | varchar(50) | NOT NULL | Delivery status |
| attempts | integer | NOT NULL, DEFAULT 1 | Attempt count |
| nextRetryAt | timestamp | | Next retry time |
| error | text | | Error message |
| errorCode | varchar(100) | | Error code |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| completedAt | timestamp | | Completion time |

**Indexes:**
- `webhook_logs_webhook_id_idx` on (webhookId)
- `webhook_logs_user_id_idx` on (userId)
- `webhook_logs_status_idx` on (status)
- `webhook_logs_event_idx` on (event)
- `webhook_logs_created_at_idx` on (createdAt)
- `webhook_logs_next_retry_at_idx` on (nextRetryAt)
- `webhook_logs_user_webhook_idx` on (userId, webhookId)
- `webhook_logs_status_retry_idx` on (status, nextRetryAt)
- `webhook_logs_user_status_idx` on (userId, status)

---

## SEO & Analytics

### seo_reports
SEO audit reports and analyses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Report ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| url | text | NOT NULL | Analyzed URL |
| title | text | | Page title |
| score | integer | NOT NULL | SEO score (0-100) |
| status | varchar(20) | NOT NULL, DEFAULT 'completed' | Report status |
| metaDescription | text | | Meta description |
| metaKeywords | text | | Meta keywords |
| headings | jsonb | | Heading structure |
| images | jsonb | | Image analysis |
| links | jsonb | | Link analysis |
| performance | jsonb | | Performance metrics |
| technicalSEO | jsonb | | Technical SEO data |
| contentAnalysis | jsonb | | Content analysis |
| aiInsights | text | | AI-generated insights |
| recommendations | jsonb | | Recommendations array |
| pdfUrl | text | | PDF report URL |
| reportType | varchar(20) | DEFAULT 'full' | Report type |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### keyword_research
Keyword research data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Research ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| topic | text | NOT NULL | Research topic |
| keyword | text | NOT NULL | Keyword |
| searchVolume | integer | DEFAULT 0 | Monthly search volume |
| difficulty | integer | DEFAULT 50 | Difficulty (0-100) |
| cpc | integer | DEFAULT 0 | CPC in cents |
| trend | varchar(10) | DEFAULT 'stable' | up/down/stable |
| relatedKeywords | jsonb | | Related keywords |
| source | varchar(50) | DEFAULT 'ai' | Data source |
| metadata | jsonb | | Additional data |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### keyword_rankings
Keyword ranking tracking over time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Ranking ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| url | text | NOT NULL | Monitored URL |
| keyword | text | NOT NULL | Keyword |
| position | integer | | Ranking position |
| previousPosition | integer | | Previous position |
| change | integer | DEFAULT 0 | Position change |
| searchEngine | varchar(20) | DEFAULT 'google' | Search engine |
| location | varchar(100) | DEFAULT 'United States' | Location |
| pageTitle | text | | Page title |
| pageUrl | text | | Actual ranking URL |
| snippet | text | | SERP snippet |
| checkedAt | timestamp | NOT NULL, DEFAULT now() | Check time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### backlinks
Backlink tracking data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Backlink ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| targetUrl | text | NOT NULL | Target URL |
| sourceUrl | text | NOT NULL | Source URL |
| sourceDomain | text | NOT NULL | Source domain |
| anchorText | text | | Anchor text |
| isDoFollow | boolean | DEFAULT true | DoFollow status |
| isActive | boolean | DEFAULT true | Active status |
| domainRating | integer | DEFAULT 0 | Domain rating (0-100) |
| domainAuthority | integer | DEFAULT 0 | Domain authority (0-100) |
| pageAuthority | integer | DEFAULT 0 | Page authority (0-100) |
| isToxic | boolean | DEFAULT false | Toxic link flag |
| firstSeen | timestamp | NOT NULL, DEFAULT now() | First seen |
| lastSeen | timestamp | NOT NULL, DEFAULT now() | Last seen |
| lastChecked | timestamp | NOT NULL, DEFAULT now() | Last checked |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### heatmap_sessions
Heatmap tracking sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Session ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| url | text | NOT NULL | Tracked URL |
| trackingId | varchar(100) | NOT NULL, UNIQUE | Tracking ID |
| totalClicks | integer | DEFAULT 0 | Total clicks |
| totalSessions | integer | DEFAULT 0 | Total sessions |
| averageScrollDepth | integer | DEFAULT 0 | Avg scroll depth (%) |
| bounceRate | integer | DEFAULT 0 | Bounce rate (%) |
| averageTimeOnPage | integer | DEFAULT 0 | Avg time (seconds) |
| isActive | boolean | DEFAULT true | Active status |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### heatmap_events
Individual heatmap events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Event ID |
| sessionId | integer | NOT NULL, FK -> heatmap_sessions.id | Session reference |
| eventType | varchar(20) | NOT NULL | click/scroll |
| x | integer | | X coordinate |
| y | integer | | Y coordinate |
| element | text | | Element selector |
| scrollDepth | integer | | Scroll depth (px) |
| scrollPercentage | integer | | Scroll percentage |
| visitorId | varchar(100) | | Anonymous visitor ID |
| userAgent | text | | User agent |
| ipAddress | varchar(45) | | IP address |
| timestamp | timestamp | NOT NULL, DEFAULT now() | Event time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Meta Ads

### ad_analyses
GPT-4 Vision analysis of ad screenshots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Analysis ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| adId | varchar(128) | | Meta ad ID |
| screenshotUrl | text | NOT NULL | Screenshot URL |
| impressions | integer | | Impressions |
| clicks | integer | | Clicks |
| ctr | decimal(5,2) | | Click-through rate |
| cpc | decimal(10,2) | | Cost per click |
| spend | decimal(10,2) | | Total spend |
| conversions | integer | | Conversions |
| roas | decimal(10,2) | | Return on ad spend |
| insights | jsonb | | AI insights |
| suggestions | jsonb | | Improvement suggestions |
| sentiment | varchar(20) | | Sentiment |
| confidence | decimal(3,2) | | Confidence (0-1) |
| rawAnalysis | jsonb | | Full GPT-4 response |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### ad_recommendations
AI-generated ad improvement recommendations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Recommendation ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| analysisId | integer | FK -> ad_analyses.id | Analysis reference |
| adId | varchar(128) | | Meta ad ID |
| type | varchar(50) | NOT NULL | copy/targeting/budget/creative/schedule |
| priority | varchar(20) | NOT NULL | high/medium/low |
| title | text | NOT NULL | Title |
| description | text | NOT NULL | Description |
| expectedImpact | text | | Expected impact |
| actionable | varchar(10) | NOT NULL, DEFAULT 'true' | Actionable flag |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Status |
| appliedAt | timestamp | | Application time |
| appliedBy | integer | FK -> users.id | Applier |
| resultMetrics | jsonb | | Result metrics |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### meta_ad_accounts
Cached Meta ad account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Account ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| accountId | varchar(128) | NOT NULL, UNIQUE | Meta account ID |
| accountName | text | NOT NULL | Account name |
| accountStatus | varchar(50) | | Account status |
| currency | varchar(10) | | Currency |
| metadata | jsonb | | Metadata |
| lastSyncedAt | timestamp | | Last sync |
| isActive | varchar(10) | NOT NULL, DEFAULT 'true' | Active status |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### meta_campaigns
Cached campaign information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Campaign ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| accountId | integer | NOT NULL, FK -> meta_ad_accounts.id | Account reference |
| campaignId | varchar(128) | NOT NULL, UNIQUE | Meta campaign ID |
| campaignName | text | NOT NULL | Campaign name |
| status | varchar(50) | | Status |
| objective | varchar(100) | | Objective |
| dailyBudget | decimal(10,2) | | Daily budget |
| lifetimeBudget | decimal(10,2) | | Lifetime budget |
| metadata | jsonb | | Metadata |
| lastSyncedAt | timestamp | | Last sync |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### meta_ad_sets
Cached ad set information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Ad set ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| campaignId | integer | NOT NULL, FK -> meta_campaigns.id | Campaign reference |
| adSetId | varchar(128) | NOT NULL, UNIQUE | Meta ad set ID |
| adSetName | text | NOT NULL | Ad set name |
| status | varchar(50) | | Status |
| dailyBudget | decimal(10,2) | | Daily budget |
| lifetimeBudget | decimal(10,2) | | Lifetime budget |
| targetingDescription | text | | Targeting description |
| targeting | jsonb | | Full targeting config |
| metadata | jsonb | | Metadata |
| lastSyncedAt | timestamp | | Last sync |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### meta_ads
Cached individual ad information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Ad ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| adSetId | integer | NOT NULL, FK -> meta_ad_sets.id | Ad set reference |
| adId | varchar(128) | NOT NULL, UNIQUE | Meta ad ID |
| adName | text | NOT NULL | Ad name |
| status | varchar(50) | | Status |
| headline | text | | Headline |
| primaryText | text | | Primary text |
| description | text | | Description |
| imageUrl | text | | Image URL |
| videoUrl | text | | Video URL |
| callToAction | varchar(50) | | CTA |
| creative | jsonb | | Creative config |
| latestMetrics | jsonb | | Latest metrics |
| lastSyncedAt | timestamp | | Last sync |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Lead Management

### user_credits
User credit balances for different credit types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Credit ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| creditType | varchar(50) | NOT NULL | enrichment/calling/scraping |
| balance | integer | NOT NULL, DEFAULT 0 | Current balance |
| totalPurchased | integer | NOT NULL, DEFAULT 0 | Total purchased |
| totalUsed | integer | NOT NULL, DEFAULT 0 | Total used |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### credit_packages
Available credit packages for purchase.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Package ID |
| name | varchar(200) | NOT NULL | Package name |
| description | text | | Description |
| creditAmount | integer | NOT NULL | Credits included |
| price | integer | NOT NULL | Price in cents |
| creditType | varchar(50) | NOT NULL | Credit type |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| sortOrder | integer | NOT NULL, DEFAULT 0 | Display order |
| metadata | jsonb | | Metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### lead_lists
Uploaded lead list containers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | List ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| name | varchar(500) | NOT NULL | List name |
| description | text | | Description |
| fileName | varchar(500) | | Original filename |
| fileSize | integer | | File size in bytes |
| status | varchar(50) | NOT NULL, DEFAULT 'uploading' | Processing status |
| totalLeads | integer | NOT NULL, DEFAULT 0 | Total leads |
| enrichedLeads | integer | NOT NULL, DEFAULT 0 | Enriched count |
| failedLeads | integer | NOT NULL, DEFAULT 0 | Failed count |
| costInCredits | integer | NOT NULL, DEFAULT 0 | Credit cost |
| metadata | jsonb | | Metadata |
| uploadedAt | timestamp | NOT NULL, DEFAULT now() | Upload time |
| processingStartedAt | timestamp | | Processing start |
| processedAt | timestamp | | Processing end |

---

### leads
Individual lead records with enrichment data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Lead ID |
| listId | integer | NOT NULL, FK -> lead_lists.id ON DELETE CASCADE | List reference |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| rawData | jsonb | NOT NULL | Original CSV data |
| enrichedData | jsonb | | Enriched data |
| enrichmentStatus | varchar(50) | NOT NULL, DEFAULT 'pending' | Status |
| creditsUsed | integer | NOT NULL, DEFAULT 0 | Credits used |
| error | text | | Error message |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |
| enrichedAt | timestamp | | Enrichment time |

---

### ai_call_campaigns
AI-powered phone call campaigns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Campaign ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| listId | integer | FK -> lead_lists.id | Lead list |
| name | varchar(500) | NOT NULL | Campaign name |
| description | text | | Description |
| script | text | NOT NULL | Call script |
| status | varchar(50) | NOT NULL, DEFAULT 'draft' | Campaign status |
| callsMade | integer | NOT NULL, DEFAULT 0 | Calls made |
| callsSuccessful | integer | NOT NULL, DEFAULT 0 | Successful calls |
| callsFailed | integer | NOT NULL, DEFAULT 0 | Failed calls |
| callsAnswered | integer | NOT NULL, DEFAULT 0 | Answered calls |
| totalDuration | integer | NOT NULL, DEFAULT 0 | Total duration (s) |
| costInCredits | integer | NOT NULL, DEFAULT 0 | Credit cost |
| settings | jsonb | | Voice/language settings |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |
| startedAt | timestamp | | Start time |
| completedAt | timestamp | | Completion time |

---

### ai_calls
Individual AI call records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Call ID |
| campaignId | integer | NOT NULL, FK -> ai_call_campaigns.id ON DELETE CASCADE | Campaign |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| leadId | integer | FK -> leads.id | Lead reference |
| phoneNumber | varchar(20) | NOT NULL | Phone number |
| status | varchar(50) | NOT NULL, DEFAULT 'pending' | Call status |
| outcome | varchar(50) | | Call outcome |
| vapiCallId | varchar(255) | | Vapi.ai call ID |
| duration | integer | | Duration (seconds) |
| recordingUrl | text | | Recording URL |
| transcript | text | | Call transcript |
| analysis | jsonb | | AI analysis |
| notes | text | | User notes |
| creditsUsed | integer | NOT NULL, DEFAULT 1 | Credits used |
| error | text | | Error message |
| calledAt | timestamp | NOT NULL, DEFAULT now() | Call time |
| answeredAt | timestamp | | Answer time |
| completedAt | timestamp | | Completion time |

---

## Email Integration

### email_connections
OAuth connections for email accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Connection ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| provider | varchar(20) | NOT NULL | gmail/outlook |
| email | varchar(320) | NOT NULL | Email address |
| accessToken | text | NOT NULL | Encrypted access token |
| refreshToken | text | NOT NULL | Encrypted refresh token |
| expiresAt | timestamp | NOT NULL | Token expiration |
| scope | text | NOT NULL | OAuth scopes |
| metadata | jsonb | | Provider metadata |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| lastSyncedAt | timestamp | | Last sync |
| syncCursor | text | | Sync cursor |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### synced_emails
Fetched emails from connected accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Email ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| connectionId | integer | NOT NULL, FK -> email_connections.id | Connection |
| messageId | text | NOT NULL, UNIQUE | Provider message ID |
| threadId | text | | Thread ID |
| subject | text | | Subject |
| from | jsonb | NOT NULL | Sender info |
| to | jsonb | NOT NULL | Recipients |
| cc | jsonb | | CC recipients |
| bcc | jsonb | | BCC recipients |
| replyTo | jsonb | | Reply-to addresses |
| date | timestamp | NOT NULL | Email date |
| body | text | | Email body |
| bodyType | varchar(10) | | html/text |
| snippet | text | | Preview snippet |
| labels | jsonb | | Labels |
| isRead | boolean | NOT NULL, DEFAULT false | Read status |
| isStarred | boolean | NOT NULL, DEFAULT false | Starred status |
| hasAttachments | boolean | NOT NULL, DEFAULT false | Has attachments |
| attachments | jsonb | | Attachment metadata |
| headers | jsonb | | Email headers |
| rawData | jsonb | | Raw provider response |
| sentiment | varchar(20) | | AI sentiment |
| sentimentScore | integer | | Sentiment score |
| importance | varchar(20) | | AI importance |
| category | varchar(50) | | AI category |
| requiresResponse | boolean | | Response needed |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### email_drafts
AI-generated email draft responses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Draft ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| emailId | integer | NOT NULL, FK -> synced_emails.id | Email reference |
| connectionId | integer | NOT NULL, FK -> email_connections.id | Connection |
| subject | text | NOT NULL | Subject |
| body | text | NOT NULL | Draft body |
| bodyType | varchar(10) | NOT NULL, DEFAULT 'html' | html/text |
| tone | varchar(20) | | Tone |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Draft status |
| model | varchar(50) | | AI model used |
| generatedAt | timestamp | NOT NULL, DEFAULT now() | Generation time |
| sentAt | timestamp | | Send time |
| providerId | text | | Provider message ID |
| metadata | jsonb | | Generation params |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Admin & Security

### audit_logs
Tracks admin actions for compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Log ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| action | varchar(100) | NOT NULL | Action type |
| entityType | varchar(100) | NOT NULL | Entity type |
| entityId | varchar(100) | | Entity ID |
| oldValues | jsonb | | Previous state |
| newValues | jsonb | | New state |
| ipAddress | varchar(45) | | IP address |
| userAgent | text | | User agent |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### feature_flags
Feature toggle system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Flag ID |
| name | varchar(100) | NOT NULL, UNIQUE | Feature name |
| description | text | | Description |
| enabled | boolean | NOT NULL, DEFAULT false | Global switch |
| rolloutPercentage | integer | NOT NULL, DEFAULT 0 | Rollout % |
| userWhitelist | jsonb | | Whitelisted users |
| metadata | jsonb | | Configuration |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### system_config
Runtime configuration values.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Config ID |
| key | varchar(100) | NOT NULL, UNIQUE | Config key |
| value | jsonb | NOT NULL | Config value |
| description | text | | Description |
| updatedBy | integer | FK -> users.id | Last updater |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### credentials
Encrypted credential vault.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Credential ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| name | text | NOT NULL | Credential name |
| service | varchar(100) | NOT NULL | Service identifier |
| type | varchar(50) | NOT NULL | Credential type |
| encryptedData | text | NOT NULL | Encrypted data |
| iv | text | NOT NULL | AES-GCM IV |
| authTag | text | NOT NULL | AES-GCM auth tag |
| metadata | jsonb | | Non-sensitive metadata |
| lastUsedAt | timestamp | | Last usage |
| useCount | integer | NOT NULL, DEFAULT 0 | Usage count |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| deletedAt | timestamp | | Soft delete |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### execution_controls
Pause/resume/cancel state for executions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Control ID |
| executionId | integer | NOT NULL, UNIQUE | Execution reference |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| controlState | varchar(20) | NOT NULL | running/paused/cancelled/awaiting_approval |
| stateReason | text | | State reason |
| injectedInstruction | text | | Mid-execution instruction |
| injectedAt | timestamp | | Injection time |
| checkpointData | jsonb | | Agent state for resume |
| lastStateChange | timestamp | NOT NULL, DEFAULT now() | State change time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### action_approvals
High-risk action approval queue.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Approval ID |
| executionId | integer | NOT NULL | Execution reference |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| actionType | varchar(100) | NOT NULL | Action type |
| actionDescription | text | NOT NULL | Description |
| actionParams | jsonb | NOT NULL | Parameters |
| riskLevel | varchar(20) | NOT NULL | low/medium/high/critical |
| riskFactors | jsonb | | Risk indicators |
| screenshotUrl | text | | Screenshot |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Status |
| approvedAt | timestamp | | Approval time |
| rejectedAt | timestamp | | Rejection time |
| rejectionReason | text | | Rejection reason |
| expiresAt | timestamp | NOT NULL | Timeout |
| timeoutAction | varchar(20) | NOT NULL, DEFAULT 'reject' | Timeout behavior |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### browser_contexts
Multi-tenant browser context isolation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Context ID |
| clientId | integer | NOT NULL | Client identifier |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| contextId | varchar(128) | NOT NULL, UNIQUE | Browserbase context ID |
| isolationLevel | varchar(20) | NOT NULL, DEFAULT 'strict' | Isolation level |
| encryptedStorage | text | | Encrypted storage |
| storageIv | text | | Storage IV |
| storageAuthTag | text | | Storage auth tag |
| metadata | jsonb | | Metadata |
| activeSessionCount | integer | NOT NULL, DEFAULT 0 | Active sessions |
| lastUsedAt | timestamp | | Last usage |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| expiresAt | timestamp | | Expiration |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### security_audit_log
Audit log for sensitive operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Log ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| action | varchar(100) | NOT NULL | Action type |
| resourceType | varchar(50) | NOT NULL | Resource type |
| resourceId | integer | | Resource ID |
| details | jsonb | | Action details |
| ipAddress | varchar(45) | | IP address |
| userAgent | text | | User agent |
| success | boolean | NOT NULL | Success status |
| errorMessage | text | | Error message |
| timestamp | timestamp | NOT NULL, DEFAULT now() | |

---

### security_events
Security monitoring and threat detection.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Event ID |
| userId | integer | FK -> users.id | User reference |
| eventType | varchar(50) | NOT NULL | Event type |
| severity | varchar(20) | NOT NULL, DEFAULT 'low' | Severity level |
| description | text | NOT NULL | Description |
| metadata | jsonb | | Event data |
| ipAddress | varchar(45) | | IP address |
| userAgent | text | | User agent |
| geoLocation | jsonb | | Geolocation |
| resolved | boolean | NOT NULL, DEFAULT false | Resolution status |
| resolvedBy | integer | FK -> users.id | Resolver |
| resolvedAt | timestamp | | Resolution time |
| notes | text | | Resolution notes |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Alerts & Notifications

### alert_rules
Alert condition definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Rule ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| name | varchar(255) | NOT NULL | Rule name |
| description | text | | Description |
| ruleType | varchar(50) | NOT NULL | Rule type |
| targetType | varchar(50) | NOT NULL, DEFAULT 'all_tasks' | Target type |
| targetTaskIds | jsonb | | Specific task IDs |
| targetTags | jsonb | | Target tags |
| conditions | jsonb | NOT NULL | Rule conditions |
| notificationChannels | jsonb | NOT NULL | Notification config |
| cooldownMinutes | integer | NOT NULL, DEFAULT 5 | Cooldown period |
| aggregationEnabled | boolean | NOT NULL, DEFAULT true | Aggregation enabled |
| maxAlertsPerHour | integer | NOT NULL, DEFAULT 12 | Max alerts/hour |
| severity | varchar(20) | NOT NULL, DEFAULT 'medium' | Severity |
| priority | integer | NOT NULL, DEFAULT 5 | Priority |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| isPaused | boolean | NOT NULL, DEFAULT false | Paused status |
| lastAlertSentAt | timestamp | | Last alert time |
| alertsThisHour | integer | NOT NULL, DEFAULT 0 | Hourly alert count |
| hourlyResetAt | timestamp | | Hourly reset time |
| createdBy | integer | NOT NULL, FK -> users.id | Creator |
| lastModifiedBy | integer | NOT NULL, FK -> users.id | Last modifier |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### alert_history
Triggered alert records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | History ID |
| ruleId | integer | NOT NULL, FK -> alert_rules.id ON DELETE CASCADE | Rule reference |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| taskId | integer | | Task reference |
| executionId | integer | | Execution reference |
| alertType | varchar(50) | NOT NULL | Alert type |
| severity | varchar(20) | NOT NULL | Severity |
| title | varchar(500) | NOT NULL | Title |
| message | text | NOT NULL | Message |
| details | jsonb | | Additional context |
| channels | jsonb | NOT NULL | Sent channels |
| deliveryStatus | jsonb | | Status per channel |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Alert status |
| triggeredAt | timestamp | NOT NULL, DEFAULT now() | Trigger time |
| acknowledgedAt | timestamp | | Acknowledgment time |
| acknowledgedBy | integer | FK -> users.id | Acknowledger |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

### in_app_notifications
User notifications displayed in UI.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Notification ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| alertHistoryId | integer | FK -> alert_history.id ON DELETE CASCADE | Alert reference |
| title | varchar(255) | NOT NULL | Title |
| message | text | NOT NULL | Message |
| type | varchar(20) | NOT NULL, DEFAULT 'info' | info/warning/error/success |
| priority | integer | NOT NULL, DEFAULT 5 | Priority |
| isRead | boolean | NOT NULL, DEFAULT false | Read status |
| isDismissed | boolean | NOT NULL, DEFAULT false | Dismissed status |
| metadata | jsonb | | Metadata |
| actionUrl | text | | Action URL |
| actionLabel | varchar(100) | | Action label |
| readAt | timestamp | | Read time |
| dismissedAt | timestamp | | Dismissal time |
| expiresAt | timestamp | | Expiration |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### alert_delivery_queue
Pending alert deliveries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Queue ID |
| alertHistoryId | integer | NOT NULL, FK -> alert_history.id ON DELETE CASCADE | Alert reference |
| channel | varchar(50) | NOT NULL | Delivery channel |
| destination | text | NOT NULL | Destination address |
| payload | jsonb | NOT NULL | Notification payload |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Delivery status |
| attempts | integer | NOT NULL, DEFAULT 0 | Attempt count |
| maxAttempts | integer | NOT NULL, DEFAULT 3 | Max attempts |
| lastAttemptAt | timestamp | | Last attempt |
| error | text | | Error message |
| priority | integer | NOT NULL, DEFAULT 5 | Priority |
| scheduledFor | timestamp | | Scheduled time |
| sentAt | timestamp | | Send time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

## RAG & Documentation

### documentation_sources
Top-level documentation documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Source ID |
| userId | integer | FK -> users.id | Uploader |
| platform | varchar(50) | NOT NULL | Platform name |
| category | varchar(50) | NOT NULL | Category |
| title | text | NOT NULL | Document title |
| sourceUrl | text | | Original URL |
| sourceType | varchar(50) | | Document type |
| version | varchar(50) | | Version |
| content | text | NOT NULL | Full content |
| contentHash | varchar(64) | | Deduplication hash |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| metadata | jsonb | | Metadata |
| tags | jsonb | | Tags |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### documentation_chunks
Chunked documents for retrieval.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Chunk ID |
| sourceId | integer | NOT NULL, FK -> documentation_sources.id ON DELETE CASCADE | Source reference |
| chunkIndex | integer | NOT NULL | Order in source |
| content | text | NOT NULL | Chunk text |
| tokenCount | integer | NOT NULL | Token count |
| metadata | jsonb | | Chunk metadata |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

Note: Embedding vector column should be added via raw SQL when pgvector extension is enabled.

---

### platform_keywords
Keywords for platform detection.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Keyword ID |
| platform | varchar(50) | NOT NULL | Platform name |
| keyword | varchar(255) | NOT NULL | Keyword |
| weight | integer | NOT NULL, DEFAULT 1 | Importance weight |
| category | varchar(50) | | Keyword category |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

## SOP Management

### sop_categories
SOP organizational categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Category ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| name | varchar(100) | NOT NULL | Category name |
| description | text | | Description |
| icon | varchar(50) | | Lucide icon name |
| color | varchar(20) | | Color |
| sortOrder | integer | NOT NULL, DEFAULT 0 | Display order |
| isActive | boolean | NOT NULL, DEFAULT true | Active status |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### sop_documents
Main SOP definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | SOP ID |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| categoryId | integer | FK -> sop_categories.id | Category |
| title | varchar(255) | NOT NULL | SOP title |
| description | text | | Description |
| objective | text | | Objective |
| version | integer | NOT NULL, DEFAULT 1 | Version |
| status | varchar(30) | NOT NULL, DEFAULT 'draft' | Status |
| applicableTo | jsonb | | Applicable scenarios |
| prerequisites | jsonb | | Prerequisites |
| triggers | jsonb | | Trigger events |
| estimatedDuration | integer | | Duration (minutes) |
| priority | varchar(20) | DEFAULT 'medium' | Priority |
| tags | jsonb | | Tags |
| aiEnabled | boolean | NOT NULL, DEFAULT true | AI execution enabled |
| humanApprovalRequired | boolean | NOT NULL, DEFAULT false | Human approval |
| automationLevel | varchar(20) | DEFAULT 'semi' | Automation level |
| metadata | jsonb | | Metadata |
| lastExecutedAt | timestamp | | Last execution |
| executionCount | integer | NOT NULL, DEFAULT 0 | Execution count |
| successRate | decimal(5,2) | | Success rate |
| publishedAt | timestamp | | Publication time |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### sop_steps
Individual SOP steps.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Step ID |
| sopId | integer | NOT NULL, FK -> sop_documents.id ON DELETE CASCADE | SOP reference |
| stepNumber | integer | NOT NULL | Step order |
| title | varchar(255) | NOT NULL | Step title |
| instructions | text | NOT NULL | Instructions |
| actionType | varchar(30) | NOT NULL, DEFAULT 'manual' | Action type |
| actionConfig | jsonb | | Action configuration |
| conditions | jsonb | | Conditions |
| alternatives | jsonb | | Alternative actions |
| expectedOutcome | text | | Expected outcome |
| validationCriteria | jsonb | | Success criteria |
| errorHandling | jsonb | | Error handling |
| resources | jsonb | | Resources needed |
| examples | jsonb | | Examples |
| tips | text | | Tips |
| estimatedDuration | integer | | Duration (minutes) |
| timeout | integer | | Timeout (seconds) |
| dependsOn | jsonb | | Step dependencies |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

---

### sop_executions
SOP execution tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Execution ID |
| sopId | integer | NOT NULL, FK -> sop_documents.id | SOP reference |
| userId | integer | NOT NULL, FK -> users.id | User reference |
| executorType | varchar(20) | NOT NULL | human/ai_agent/hybrid |
| agentSessionId | integer | | Agent session |
| status | varchar(20) | NOT NULL, DEFAULT 'in_progress' | Status |
| currentStepIndex | integer | NOT NULL, DEFAULT 0 | Current step |
| stepResults | jsonb | NOT NULL, DEFAULT '[]' | Step results |
| context | jsonb | | Input context |
| result | jsonb | | Final result |
| feedback | text | | User feedback |
| rating | integer | | Rating (1-5) |
| issues | jsonb | | Issues encountered |
| startedAt | timestamp | NOT NULL, DEFAULT now() | Start time |
| completedAt | timestamp | | Completion time |
| durationMs | integer | | Duration (ms) |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

---

## Entity Relationship Diagram

```
                                    +------------------+
                                    |      users       |
                                    +------------------+
                                    | id (PK)          |
                                    | email            |
                                    | password         |
                                    | role             |
                                    +--------+---------+
                                             |
         +-----------------------------------+-----------------------------------+
         |               |               |               |               |       |
         v               v               v               v               v       v
+----------------+ +-------------+ +----------------+ +---------------+ +-------+-------+
| user_profiles  | |  sessions   | | user_webhooks  | |user_subscript | |  api_keys     |
+----------------+ +-------------+ +----------------+ +---------------+ +---------------+
| userId (FK)    | | userId (FK) | | userId (FK)    | | userId (FK)   | | userId (FK)   |
+----------------+ +-------------+ +-------+--------+ +------+--------+ +-------+-------+
                                           |                  |                 |
                   +-----------------------+                  |                 v
                   |                       |                  |         +---------------+
                   v                       v                  |         |api_request_logs|
          +----------------+    +------------------+          |         +---------------+
          |inbound_messages|    | bot_conversations|          |
          +----------------+    +------------------+          v
          | webhookId (FK) |    | userId (FK)      |  +------------------+
          | userId (FK)    |    | webhookId (FK)   |  |subscription_tiers|
          +-------+--------+    +--------+---------+  +------------------+
                  |                      |
                  +----------+-----------+
                             |
                             v
                    +---------------+
                    | agency_tasks  |
                    +---------------+
                    | userId (FK)   |
                    +-------+-------+
                            |
                            v
                   +----------------+
                   |task_executions |
                   +----------------+
                   | taskId (FK)    |
                   +-------+--------+
                           |
         +-----------------+-----------------+
         |                                   |
         v                                   v
+----------------+                  +----------------+
| api_token_usage|                  |browserbase_costs|
+----------------+                  +----------------+
| executionId(FK)|                  | executionId(FK)|
+----------------+                  +----------------+


+------------------+          +------------------+          +------------------+
| automation_      |          | browser_sessions |          | scheduled_browser|
| workflows        |          +------------------+          | _tasks           |
+------------------+          | userId (FK)      |          +------------------+
| userId (FK)      |          | sessionId        |          | userId (FK)      |
+-------+----------+          +--------+---------+          | cronExpression   |
        |                              |                    +--------+---------+
        v                              v                             |
+------------------+          +------------------+                    v
|workflow_executions|         | extracted_data   |          +------------------+
+------------------+          +------------------+          |scheduled_task_   |
| workflowId (FK)  |          | sessionId (FK)   |          | executions       |
| sessionId (FK)   |          +------------------+          +------------------+
+------------------+                                        | taskId (FK)      |
                                                            +------------------+

+------------------+          +------------------+          +------------------+
| agent_sessions   |          | sop_documents    |          | meta_ad_accounts |
+------------------+          +------------------+          +------------------+
| userId (FK)      |          | userId (FK)      |          | userId (FK)      |
+-------+----------+          +--------+---------+          +--------+---------+
        |                              |                             |
        v                              v                             v
+------------------+          +------------------+          +------------------+
|agent_executions  |          | sop_steps        |          | meta_campaigns   |
+------------------+          +------------------+          +------------------+
| sessionId (FK)   |          | sopId (FK)       |          | accountId (FK)   |
+-------+----------+          +------------------+          +--------+---------+
        |                              |                             |
        v                              v                             v
+------------------+          +------------------+          +------------------+
| tool_executions  |          | sop_executions   |          | meta_ad_sets     |
+------------------+          +------------------+          +------------------+
| executionId (FK) |          | sopId (FK)       |          | campaignId (FK)  |
+------------------+          +------------------+          +--------+---------+
                                                                     |
                                                                     v
                                                            +------------------+
                                                            | meta_ads         |
                                                            +------------------+
                                                            | adSetId (FK)     |
                                                            +------------------+

+------------------+          +------------------+          +------------------+
| alert_rules      |          | documentation_   |          | lead_lists       |
+------------------+          | sources          |          +------------------+
| userId (FK)      |          +------------------+          | userId (FK)      |
+-------+----------+          | userId (FK)      |          +--------+---------+
        |                     +--------+---------+                   |
        v                              |                             v
+------------------+                   v                    +------------------+
| alert_history    |          +------------------+          | leads            |
+------------------+          | documentation_   |          +------------------+
| ruleId (FK)      |          | chunks           |          | listId (FK)      |
+-------+----------+          +------------------+          | userId (FK)      |
        |                     | sourceId (FK)    |          +--------+---------+
        v                     +------------------+                   |
+------------------+                                                 v
|in_app_notifications|                                      +------------------+
+------------------+                                        | ai_calls         |
| alertHistoryId(FK)|                                       +------------------+
+------------------+                                        | leadId (FK)      |
                                                            +------------------+
```

---

## Key Relationships Summary

### One-to-One
- users -> user_profiles
- users -> user_subscriptions
- users -> user_preferences
- users -> user_memory
- users -> cost_budgets
- scheduled_browser_tasks -> cron_job_registry

### One-to-Many
- users -> sessions
- users -> browser_sessions
- users -> automation_workflows
- users -> agent_sessions
- users -> api_keys
- users -> scheduled_browser_tasks
- users -> user_webhooks
- users -> alert_rules
- automation_workflows -> workflow_executions
- agent_sessions -> agent_executions
- agent_executions -> tool_executions
- scheduled_browser_tasks -> scheduled_task_executions
- user_webhooks -> inbound_messages
- agency_tasks -> task_executions
- alert_rules -> alert_history
- sop_documents -> sop_steps
- sop_documents -> sop_executions
- meta_ad_accounts -> meta_campaigns
- meta_campaigns -> meta_ad_sets
- meta_ad_sets -> meta_ads
- lead_lists -> leads
- documentation_sources -> documentation_chunks

### Many-to-One
- workflow_executions -> browser_sessions
- extracted_data -> browser_sessions
- extracted_data -> workflow_executions
- inbound_messages -> bot_conversations
- agency_tasks -> bot_conversations
- task_executions -> api_token_usage
- task_executions -> browserbase_costs

---

## Notes

1. **Timestamps**: All tables use `createdAt` and most use `updatedAt` with `DEFAULT now()`.

2. **Foreign Keys**: Most foreign keys have cascade delete for child tables. Some use `SET NULL` for optional relationships.

3. **JSON/JSONB**: Extensive use of JSONB for flexible structured data (configurations, metadata, arrays).

4. **Encryption**: Sensitive data (credentials, tokens) is encrypted at the application level with AES-256-GCM.

5. **Soft Deletes**: Some tables use `isActive` flags or `deletedAt` timestamps instead of hard deletes.

6. **Indexes**: Critical query paths have indexes defined in the schema files.

7. **Vector Storage**: RAG documentation chunks should have a vector column added when pgvector is enabled.
