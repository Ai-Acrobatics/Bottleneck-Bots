# PRD-014: Scheduled Tasks (Cron) Feature

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/scheduledTasks.ts`, `server/services/cronScheduler.service.ts`

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

The Scheduled Tasks (Cron) feature enables users to create, manage, and execute recurring browser automation tasks using cron expressions. This system provides enterprise-grade scheduling capabilities with timezone support, intelligent retry mechanisms, comprehensive notification channels, and detailed execution history tracking.

### 1.1 Feature Summary

- **Cron-Based Scheduling**: Full cron expression support with human-readable descriptions
- **Multiple Schedule Types**: Support for daily, weekly, monthly, custom cron, and one-time executions
- **Timezone Support**: Global timezone support for accurate scheduling across regions
- **Multiple Action Types**: Support for act, observe, and extract browser automation actions
- **Success Criteria Validation**: Define and validate success conditions for automated tasks
- **Error Notifications**: Multi-channel notifications via email, Slack, and webhooks
- **Execution History**: Complete tracking of all task executions with logs and metrics
- **Intelligent Retry**: Configurable retry logic with exponential backoff support
- **Manual Execution**: On-demand task triggering with full history tracking

### 1.2 Target Users

- Marketing Automation Specialists managing recurring campaigns
- Quality Assurance Engineers running scheduled monitoring tests
- Data Analysts extracting information on regular schedules
- DevOps Engineers maintaining automated health checks
- Agency Account Managers automating client reporting workflows
- Business Process Automation Teams scheduling repetitive browser tasks

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Manual Repetitive Tasks**: Users must manually trigger browser automation tasks at specific times, leading to inconsistent execution and wasted time
2. **No Centralized Scheduling**: Lack of a unified system to manage recurring automations across different time zones
3. **Limited Visibility**: No historical tracking of when automations ran, their outcomes, or performance trends
4. **Unreliable Execution**: Without proper retry mechanisms, transient failures result in missed critical automations
5. **Communication Gaps**: No automated alerting when scheduled tasks fail, requiring manual monitoring
6. **Time Zone Complexity**: Scheduling tasks across global teams requires manual timezone calculations

### 2.2 User Pain Points

- "I need to extract competitor pricing data every morning at 6 AM before our team starts work"
- "Our QA tests should run every hour, but I can't be online 24/7 to trigger them"
- "When our scheduled data extraction fails, we don't know until hours later when reports are missing"
- "Managing automations across US, EU, and APAC time zones is a nightmare"
- "I want to see how our scheduled automations have performed over the past month"
- "Occasional website changes break our automations, and we need automatic retries"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Manual task triggering | 10+ hours/week wasted on repetitive scheduling per team |
| Missed automation windows | Lost data, incomplete reports, delayed decisions |
| No failure notifications | 4-8 hour average detection time for failed automations |
| Timezone management overhead | 25% scheduling errors in global teams |
| No execution history | Inability to audit, debug, or optimize automations |
| Unreliable retry handling | 15% permanent task failures that could be recovered |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Enable reliable cron-based scheduling with 99.9% execution accuracy | P0 |
| **G2** | Provide comprehensive timezone support for global operations | P0 |
| **G3** | Implement multi-channel failure notifications within 60 seconds | P0 |
| **G4** | Maintain complete execution history with performance metrics | P1 |
| **G5** | Support intelligent retry mechanisms with configurable strategies | P1 |
| **G6** | Enable success criteria validation for automated quality assurance | P2 |

### 3.2 Success Metrics (KPIs)

#### Scheduling Reliability Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| On-Time Execution Rate | >= 99.9% | Tasks started within 60 seconds of scheduled time |
| Cron Parse Accuracy | 100% | Valid expressions execute at correct times |
| Timezone Accuracy | 100% | Tasks execute at correct local time for timezone |
| Schedule Calculation Time | < 10ms | Time to compute next run |

#### Execution Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Task Success Rate | >= 90% | Successful executions / Total executions |
| First-Attempt Success Rate | >= 85% | Tasks succeeding without retry |
| Retry Recovery Rate | >= 70% | Failed tasks recovered via retry |
| Average Task Duration | < 120 seconds | Time from start to completion |
| Timeout Compliance | >= 99% | Tasks completing within configured timeout |

#### Notification Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Notification Delivery Time | < 60 seconds | Time from event to notification sent |
| Notification Success Rate | >= 99% | Successfully delivered notifications |
| Alert Accuracy | 100% | No false positive/negative alerts |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Schedule Creation Time | < 2 minutes | Time to create new scheduled task |
| Dashboard Load Time | < 500ms | Time to load scheduled tasks list |
| History Query Time | < 1 second | Time to retrieve execution history |
| User Adoption Rate | >= 40% | Active users utilizing scheduling |

#### Business Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tasks per User per Week | >= 10 scheduled | Average scheduled tasks per active user |
| Automation ROI | 5x time savings | Manual time saved vs. automation cost |
| Enterprise Conversion | >= 20% | Users upgrading for advanced scheduling |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: Create Scheduled Browser Task
**As a** marketing specialist
**I want to** schedule browser automation tasks to run at specific times
**So that** I can automate repetitive work without manual intervention

**Acceptance Criteria:**
- User can define task name, description, and automation configuration
- User can select schedule type (daily, weekly, monthly, cron, once)
- User can specify timezone for execution
- System validates cron expression and shows human-readable description
- Next run time is calculated and displayed immediately
- Task is saved and begins executing on schedule

#### US-002: Configure Cron Expression
**As a** power user
**I want to** use full cron expression syntax for complex schedules
**So that** I can define precise execution patterns (e.g., "every weekday at 9:15 AM")

**Acceptance Criteria:**
- System accepts standard 5-field cron expressions (minute, hour, day, month, weekday)
- Invalid expressions are rejected with clear error messages
- Human-readable description is generated from cron expression
- Preview of next 5 execution times is displayed
- Complex patterns (ranges, lists, steps) are supported

#### US-003: Timezone-Aware Scheduling
**As an** agency manager with global clients
**I want to** schedule tasks in specific timezones
**So that** automations run at the correct local time for each region

**Acceptance Criteria:**
- User can select from all standard IANA timezones
- Next run time is displayed in both local and UTC time
- Daylight saving transitions are handled correctly
- Tasks execute at correct local time regardless of server timezone
- Timezone changes are reflected immediately in schedule calculations

#### US-004: Pause and Resume Tasks
**As a** user managing multiple automations
**I want to** pause and resume scheduled tasks
**So that** I can temporarily disable automations without deleting them

**Acceptance Criteria:**
- User can pause any active scheduled task
- Paused tasks do not execute on their scheduled time
- User can resume paused tasks at any time
- Resuming recalculates next run time from current moment
- Task history is preserved during pause/resume cycles

#### US-005: Manual Task Execution
**As a** user testing automations
**I want to** manually trigger a scheduled task immediately
**So that** I can verify it works before relying on the schedule

**Acceptance Criteria:**
- "Run Now" button triggers immediate execution
- Manual runs are tracked separately in execution history (triggerType: "manual")
- Manual execution does not affect scheduled next run time
- User receives real-time feedback on execution status
- All automation configuration is honored during manual runs

### 4.2 Notification User Stories

#### US-006: Failure Notifications
**As a** responsible automation owner
**I want to** receive notifications when scheduled tasks fail
**So that** I can investigate and resolve issues quickly

**Acceptance Criteria:**
- User can enable/disable failure notifications per task
- User can configure multiple notification channels (email, Slack, webhook)
- Notifications include task name, error message, and execution details
- Notifications are sent within 60 seconds of failure
- Notification history is logged for auditing

#### US-007: Success Notifications
**As a** manager monitoring critical automations
**I want to** receive notifications when important tasks complete successfully
**So that** I have confirmation of execution without checking manually

**Acceptance Criteria:**
- User can enable/disable success notifications per task
- Notifications include task name, duration, and output summary
- Notifications use same channels configured for failures
- Success notifications can be limited to specific conditions
- Notification preferences are editable after task creation

#### US-008: Slack Integration
**As a** team using Slack for communication
**I want to** receive scheduled task notifications in Slack
**So that** the team is informed in our primary communication tool

**Acceptance Criteria:**
- User can configure Slack webhook URL for notifications
- Notifications are formatted as rich Slack messages
- Messages include task status, timing, and action buttons
- Channel configuration is validated before saving
- Rate limiting prevents notification spam

#### US-009: Webhook Notifications
**As a** developer integrating with external systems
**I want to** receive scheduled task events via webhook
**So that** I can trigger custom workflows on task completion

**Acceptance Criteria:**
- User can configure webhook URL with optional authentication
- Webhook payload includes complete execution details
- Retries are attempted on webhook delivery failure
- Request/response logging is available for debugging
- Custom headers can be configured per webhook

### 4.3 Execution History User Stories

#### US-010: View Execution History
**As a** user managing scheduled tasks
**I want to** view the execution history for each task
**So that** I can track performance and investigate issues

**Acceptance Criteria:**
- Paginated list of executions sorted by most recent
- Each execution shows status, duration, trigger type, and timestamp
- Failed executions display error messages
- User can filter history by status (success, failed, timeout, cancelled)
- History retention is configurable per task

#### US-011: Execution Logs and Details
**As a** developer debugging automation failures
**I want to** view detailed logs for each execution
**So that** I can identify what went wrong and where

**Acceptance Criteria:**
- Each execution includes timestamped log entries
- Browser session ID and debug URLs are recorded
- Output/results from successful extractions are stored
- Execution metadata includes browser configuration used
- Logs are retained for the configured history period

#### US-012: Task Statistics
**As a** user optimizing automations
**I want to** view aggregate statistics for my scheduled tasks
**So that** I can identify performance trends and reliability issues

**Acceptance Criteria:**
- Statistics include: total executions, success rate, failure rate
- Average duration is calculated and displayed
- Last run status and error are prominently shown
- Next scheduled run time is always visible
- Statistics update automatically after each execution

### 4.4 Advanced User Stories

#### US-013: Retry Configuration
**As a** user with unreliable target websites
**I want to** configure automatic retries for failed tasks
**So that** transient failures don't result in missed automations

**Acceptance Criteria:**
- User can enable/disable retry on failure per task
- Maximum retry count is configurable (0-10)
- Retry delay is configurable in seconds
- Each retry attempt is logged separately
- Successful retry updates execution as recovered

#### US-014: Execution Timeout
**As a** user with time-sensitive automations
**I want to** configure execution timeouts
**So that** hung tasks don't block other scheduled work

**Acceptance Criteria:**
- Timeout is configurable per task (10-3600 seconds)
- Tasks exceeding timeout are terminated gracefully
- Timeout events are recorded with appropriate status
- Browser sessions are cleaned up on timeout
- Notifications are sent for timeout events

#### US-015: Upcoming Executions View
**As a** user planning around scheduled tasks
**I want to** see which tasks are scheduled to run soon
**So that** I can anticipate system load and potential conflicts

**Acceptance Criteria:**
- Query returns tasks scheduled within specified time window (1-168 hours)
- Results sorted by next run time ascending
- Only active tasks are included
- Time window is configurable
- Results include task details and calculated run times

#### US-016: Task Archival
**As a** user cleaning up old tasks
**I want to** archive completed or obsolete scheduled tasks
**So that** my active task list remains manageable

**Acceptance Criteria:**
- Deleting a task performs soft delete (status = "archived")
- Archived tasks don't appear in active lists
- Execution history is preserved for archived tasks
- Archived tasks can be restored if needed
- Hard delete is available for complete removal

---

## 5. Functional Requirements

### 5.1 Task Management

#### FR-001: Task Creation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Accept task name (1-255 characters) and optional description | P0 |
| FR-001.2 | Support automation types: chat, observe, extract, workflow, custom | P0 |
| FR-001.3 | Validate automation configuration against schema | P0 |
| FR-001.4 | Calculate initial nextRun based on cron expression and timezone | P0 |
| FR-001.5 | Initialize execution counters to zero | P0 |
| FR-001.6 | Record creating user and timestamp | P0 |

#### FR-002: Task Update
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Allow partial updates of task properties | P0 |
| FR-002.2 | Recalculate nextRun when cron expression or timezone changes | P0 |
| FR-002.3 | Preserve execution history and statistics on update | P0 |
| FR-002.4 | Record modifying user and timestamp | P0 |
| FR-002.5 | Validate all updated fields against schemas | P0 |

#### FR-003: Task Deletion
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Perform soft delete by setting status to "archived" | P0 |
| FR-003.2 | Set isActive to false to prevent execution | P0 |
| FR-003.3 | Preserve all execution history | P1 |
| FR-003.4 | Record deletion timestamp and user | P1 |

#### FR-004: Task Listing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Support pagination with configurable page size (1-100) | P0 |
| FR-004.2 | Filter by status (active, paused, failed, completed, archived) | P0 |
| FR-004.3 | Sort by nextRun, createdAt, lastRun, or name | P0 |
| FR-004.4 | Support ascending and descending sort order | P0 |
| FR-004.5 | Return total count for pagination calculation | P0 |

### 5.2 Scheduling Configuration

#### FR-005: Cron Expression Support
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Parse standard 5-field cron expressions | P0 |
| FR-005.2 | Validate cron expression syntax before saving | P0 |
| FR-005.3 | Generate human-readable schedule description | P0 |
| FR-005.4 | Calculate next run time from current moment | P0 |
| FR-005.5 | Support wildcards (*), ranges (1-5), lists (1,3,5), steps (*/5) | P0 |

#### FR-006: Schedule Types
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Support "daily" schedule type with configurable time | P0 |
| FR-006.2 | Support "weekly" schedule type with day of week selection | P0 |
| FR-006.3 | Support "monthly" schedule type with day of month selection | P0 |
| FR-006.4 | Support "cron" schedule type for custom expressions | P0 |
| FR-006.5 | Support "once" schedule type for single execution | P1 |

#### FR-007: Timezone Support
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Accept any valid IANA timezone identifier | P0 |
| FR-007.2 | Default to UTC when timezone not specified | P0 |
| FR-007.3 | Calculate next run time in specified timezone | P0 |
| FR-007.4 | Handle daylight saving time transitions correctly | P0 |
| FR-007.5 | Store all timestamps in UTC internally | P0 |

### 5.3 Execution Control

#### FR-008: Pause/Resume
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Set status to "paused" when pausing active task | P0 |
| FR-008.2 | Prevent execution of paused tasks | P0 |
| FR-008.3 | Recalculate nextRun when resuming paused task | P0 |
| FR-008.4 | Reject pause request for already paused tasks | P0 |
| FR-008.5 | Reject resume request for non-paused tasks | P0 |

#### FR-009: Manual Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Create execution record with triggerType "manual" | P0 |
| FR-009.2 | Set initial status to "queued" | P0 |
| FR-009.3 | Execute task immediately upon request | P0 |
| FR-009.4 | Do not modify scheduled nextRun time | P0 |
| FR-009.5 | Return execution ID for status tracking | P0 |

### 5.4 Automation Configuration

#### FR-010: Automation Config Schema
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Require URL field with valid URL format | P0 |
| FR-010.2 | Support optional instruction for AI agent | P0 |
| FR-010.3 | Accept actions array with type (act, observe, extract), instruction, and optional selector | P0 |
| FR-010.4 | Support browser configuration (headless, timeout, viewport) | P1 |
| FR-010.5 | Accept extraction schema for data extraction tasks | P1 |
| FR-010.6 | Support success criteria string for validation | P1 |

#### FR-011: Action Types
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | "act" type executes browser interactions based on instruction | P0 |
| FR-011.2 | "observe" type analyzes page and returns actionable steps | P0 |
| FR-011.3 | "extract" type extracts structured data from page | P0 |
| FR-011.4 | Sequential action execution in defined order | P0 |
| FR-011.5 | Each action logs its start time, completion, and results | P0 |

### 5.5 Execution Tracking

#### FR-012: Execution Status
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Track status: queued, running, success, failed, timeout, cancelled | P0 |
| FR-012.2 | Record trigger type: scheduled, manual, retry | P0 |
| FR-012.3 | Track attempt number for retries | P0 |
| FR-012.4 | Store start time, completion time, and duration | P0 |
| FR-012.5 | Capture error messages for failed executions | P0 |

#### FR-013: Execution Output
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Store task output/results as JSON | P0 |
| FR-013.2 | Capture execution logs with timestamps | P0 |
| FR-013.3 | Record browser session ID for debugging | P1 |
| FR-013.4 | Store debug URL and recording URL | P1 |
| FR-013.5 | Preserve metadata for additional context | P1 |

#### FR-014: Execution History
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Query paginated execution history by task ID | P0 |
| FR-014.2 | Filter executions by status | P0 |
| FR-014.3 | Sort by most recent first | P0 |
| FR-014.4 | Return pagination metadata (total count, pages) | P0 |
| FR-014.5 | Enforce max history records per task | P1 |

### 5.6 Retry Configuration

#### FR-015: Retry Settings
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Enable/disable retry on failure per task | P0 |
| FR-015.2 | Configure max retries (0-10, default 3) | P0 |
| FR-015.3 | Configure retry delay in seconds (minimum 1, default 60) | P0 |
| FR-015.4 | Increment attempt number on each retry | P0 |
| FR-015.5 | Stop retrying after max retries exceeded | P0 |

#### FR-016: Timeout Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Configure timeout per task (10-3600 seconds, default 300) | P0 |
| FR-016.2 | Terminate execution that exceeds timeout | P0 |
| FR-016.3 | Set execution status to "timeout" | P0 |
| FR-016.4 | Clean up browser session on timeout | P0 |
| FR-016.5 | Trigger retry if retryOnFailure is enabled | P0 |

### 5.7 Notification System

#### FR-017: Notification Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | Enable/disable notification on success per task | P0 |
| FR-017.2 | Enable/disable notification on failure per task | P0 |
| FR-017.3 | Support multiple notification channels per task | P0 |
| FR-017.4 | Store channel type and configuration | P0 |
| FR-017.5 | Validate channel configuration before saving | P0 |

#### FR-018: Notification Channels
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | Support email notification channel | P0 |
| FR-018.2 | Support Slack webhook notification channel | P0 |
| FR-018.3 | Support generic webhook notification channel | P1 |
| FR-018.4 | Include task name, status, and timing in notifications | P0 |
| FR-018.5 | Include error message and details for failures | P0 |

### 5.8 Statistics

#### FR-019: Task Statistics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-019.1 | Track total execution count | P0 |
| FR-019.2 | Track success count and failure count | P0 |
| FR-019.3 | Calculate and update success rate percentage | P0 |
| FR-019.4 | Calculate and maintain average duration | P0 |
| FR-019.5 | Record last run status, error, and duration | P0 |

#### FR-020: Upcoming Executions
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020.1 | Query tasks scheduled within specified time window | P0 |
| FR-020.2 | Support time window from 1 to 168 hours (7 days) | P0 |
| FR-020.3 | Filter to active tasks only | P0 |
| FR-020.4 | Sort by next run time ascending | P0 |
| FR-020.5 | Return time window boundaries in response | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | API response time (P95) | < 500ms | P0 |
| NFR-002 | Cron expression parsing | < 10ms | P0 |
| NFR-003 | Next run calculation | < 50ms | P0 |
| NFR-004 | Task list query (100 items) | < 200ms | P0 |
| NFR-005 | Execution history query | < 300ms | P0 |
| NFR-006 | Schedule accuracy | Within 60 seconds of target time | P0 |
| NFR-007 | Notification delivery | < 60 seconds from event | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Concurrent scheduled tasks | 10,000 per deployment | P1 |
| NFR-009 | Concurrent executions | 100 per deployment | P1 |
| NFR-010 | Execution history retention | 100 records per task (configurable) | P1 |
| NFR-011 | Tasks per user | 500 maximum | P1 |
| NFR-012 | Database connection pooling | Max 50 connections per instance | P0 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-013 | Scheduler uptime | 99.9% availability | P0 |
| NFR-014 | Execution reliability | 99.9% of tasks start on schedule | P0 |
| NFR-015 | Data durability | 99.99% (database replicated) | P0 |
| NFR-016 | Retry success rate | >= 70% recovery rate | P1 |
| NFR-017 | Notification delivery rate | >= 99% | P0 |
| NFR-018 | Graceful degradation | Continue executing on notification failure | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-019 | All endpoints require authentication (protectedProcedure) | P0 |
| NFR-020 | User isolation - tasks scoped to userId | P0 |
| NFR-021 | Input validation via Zod schemas | P0 |
| NFR-022 | Webhook URLs validated and sanitized | P0 |
| NFR-023 | Sensitive data (credentials) encrypted at rest | P0 |
| NFR-024 | Audit logging for all task modifications | P1 |
| NFR-025 | Rate limiting on API endpoints | P0 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-026 | Structured logging for all operations | P0 |
| NFR-027 | Execution metrics collection | P0 |
| NFR-028 | Scheduler health monitoring | P1 |
| NFR-029 | Error rate alerting (> 5% threshold) | P1 |
| NFR-030 | Task execution dashboard | P2 |

### 6.6 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-031 | TypeScript strict mode | P0 |
| NFR-032 | Zod schema validation | P0 |
| NFR-033 | Test coverage >= 80% | P1 |
| NFR-034 | API documentation | P1 |
| NFR-035 | Modular service architecture | P0 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+----------------------------------------------------------------------------------------------------------+
|                                        Client Application                                                   |
|                          (React/Next.js Frontend with tRPC Client)                                         |
+-----------------------------------+----------------------------------------------------------------------+
                                    | tRPC
                                    v
+----------------------------------------------------------------------------------------------------------+
|                                    API Layer (scheduledTasksRouter)                                        |
|  +----------------+  +----------------+  +----------------+  +----------------+  +----------------+       |
|  |     list       |  |    getById     |  |    create      |  |    update      |  |    delete      |       |
|  | (pagination,   |  | (single task)  |  | (new task)     |  | (modify task)  |  | (soft delete)  |       |
|  |  filtering,    |  |                |  |                |  |                |  |                |       |
|  |  sorting)      |  |                |  |                |  |                |  |                |       |
|  +----------------+  +----------------+  +----------------+  +----------------+  +----------------+       |
|  +----------------+  +----------------+  +----------------+  +----------------+  +----------------+       |
|  |     pause      |  |    resume      |  |  executeNow    |  |getExecutionHist|  |  getUpcoming   |       |
|  | (pause task)   |  | (resume task)  |  | (manual run)   |  |    ory         |  | (scheduled)    |       |
|  +----------------+  +----------------+  +----------------+  +----------------+  +----------------+       |
|  +----------------+                                                                                        |
|  | getStatistics  |                                                                                        |
|  | (task metrics) |                                                                                        |
|  +----------------+                                                                                        |
+-----------------------------------+----------------------------------------------------------------------+
                                    |
            +-----------------------+------------------------+
            v                       v                        v
+-------------------+    +------------------------+    +------------------------+
| CronScheduler     |    | TaskExecution          |    | Notification           |
| Service           |    | Service                |    | Service                |
|                   |    |                        |    |                        |
| - validateCron()  |    | - executeTask()        |    | - sendEmail()          |
| - parseCron()     |    | - handleRetry()        |    | - sendSlack()          |
| - getNextRun()    |    | - updateStatistics()   |    | - sendWebhook()        |
| - describeCron()  |    | - manageTimeout()      |    | - logNotification()    |
| - isTimeToRun()   |    |                        |    |                        |
+--------+----------+    +------------+-----------+    +------------+-----------+
         |                            |                             |
         v                            v                             v
+-------------------+    +------------------------+    +------------------------+
| cron-parser       |    | Stagehand/Browserbase  |    | External Services      |
| cronstrue         |    | (Browser Automation)   |    | - SMTP Server          |
|                   |    |                        |    | - Slack API            |
|                   |    |                        |    | - Webhook Endpoints    |
+-------------------+    +------------------------+    +------------------------+
         |                            |
         +----------------------------+
                      |
                      v
+----------------------------------------------------------------------------------------------------------+
|                                        Database (PostgreSQL + Drizzle)                                     |
|  +---------------------------+  +---------------------------+  +---------------------------+              |
|  | scheduled_browser_tasks   |  | scheduled_task_executions |  | cron_job_registry         |              |
|  |                           |  |                           |  |                           |              |
|  | - id, userId, name        |  | - id, taskId              |  | - id, taskId              |              |
|  | - automationType          |  | - status, triggerType     |  | - jobId, jobName          |              |
|  | - automationConfig        |  | - attemptNumber           |  | - cronExpression          |              |
|  | - scheduleType            |  | - startedAt, completedAt  |  | - timezone                |              |
|  | - cronExpression          |  | - duration                |  | - isRunning               |              |
|  | - timezone                |  | - output, error, logs     |  | - lastStartedAt           |              |
|  | - status, nextRun         |  | - sessionId, debugUrl     |  | - lastCompletedAt         |              |
|  | - retryConfig             |  | - recordingUrl            |  | - nextRunAt               |              |
|  | - notificationConfig      |  | - metadata                |  |                           |              |
|  | - statistics              |  |                           |  |                           |              |
|  +---------------------------+  +---------------------------+  +---------------------------+              |
+----------------------------------------------------------------------------------------------------------+
```

### 7.2 Component Details

#### 7.2.1 Scheduled Tasks Router (`scheduledTasks.ts`)
Primary API interface for scheduled task management.

**Endpoints:**
| Endpoint | Type | Purpose |
|----------|------|---------|
| `list` | Query | Paginated task list with filtering/sorting |
| `getById` | Query | Single task retrieval |
| `create` | Mutation | Create new scheduled task |
| `update` | Mutation | Update existing task |
| `delete` | Mutation | Soft delete (archive) task |
| `pause` | Mutation | Pause active task |
| `resume` | Mutation | Resume paused task |
| `executeNow` | Mutation | Trigger manual execution |
| `getExecutionHistory` | Query | Task execution history |
| `getUpcoming` | Query | Tasks scheduled soon |
| `getStatistics` | Query | Task execution metrics |

#### 7.2.2 Cron Scheduler Service (`cronScheduler.service.ts`)
Handles all cron expression operations.

**Methods:**
| Method | Purpose |
|--------|---------|
| `validateCronExpression()` | Validate cron syntax |
| `parseCronExpression()` | Parse into component fields |
| `describeCronExpression()` | Human-readable description |
| `getNextRunTime()` | Calculate next execution time |
| `getNextNRunTimes()` | Calculate next N execution times |
| `scheduleTypeToCron()` | Convert schedule type to cron |
| `isTimeToRun()` | Check if task should execute now |
| `getScheduleDescription()` | Human-readable schedule |
| `willEverRun()` | Validate expression will trigger |
| `getTimeUntilNextRun()` | Milliseconds until next run |

#### 7.2.3 Automation Configuration Schema

```typescript
interface AutomationConfig {
  url: string;                    // Required: Target URL
  instruction?: string;           // Optional: AI agent instruction
  actions?: Array<{
    type: "act" | "observe" | "extract";
    instruction: string;
    selector?: string;
  }>;
  browserConfig?: {
    headless?: boolean;
    timeout?: number;
    viewport?: {
      width: number;
      height: number;
    };
  };
  extractionSchema?: Record<string, unknown>;
  successCriteria?: string;
}
```

#### 7.2.4 Notification Channel Schema

```typescript
interface NotificationChannel {
  type: "email" | "slack" | "webhook";
  config: {
    // Email
    to?: string;
    subject?: string;

    // Slack
    webhookUrl?: string;
    channel?: string;

    // Webhook
    url?: string;
    method?: "POST" | "PUT";
    headers?: Record<string, string>;
    authToken?: string;
  };
}
```

### 7.3 Data Flow

#### Task Creation Flow
```
1. Client submits create request with task configuration
                    |
                    v
2. Router validates input via Zod schema
                    |
                    v
3. CronSchedulerService validates cron expression
                    |
                    v
4. CronSchedulerService calculates nextRun time
                    |
                    v
5. Task record created in scheduled_browser_tasks
                    |
                    v
6. Response returned with task ID and nextRun
```

#### Scheduled Execution Flow
```
1. Scheduler daemon polls for tasks where nextRun <= NOW
                    |
                    v
2. For each due task, create execution record (status: queued)
                    |
                    v
3. Update execution status to "running"
                    |
                    v
4. Initialize Stagehand/Browserbase session
                    |
                    v
5. Execute automation actions in sequence
                    |
                    v
6. Validate success criteria (if defined)
                    |
                    v
7. Update execution status (success/failed/timeout)
                    |
                    v
8. Update task statistics (counts, average duration)
                    |
                    v
9. Calculate and update nextRun time
                    |
                    v
10. Send notifications (if configured)
```

#### Retry Flow
```
1. Execution completes with failed/timeout status
                    |
                    v
2. Check if retryOnFailure is enabled
                    |
                    v
3. Check if attemptNumber < maxRetries
                    |
                    v
4. Wait for retryDelay seconds
                    |
                    v
5. Create new execution record (triggerType: retry, attemptNumber: N+1)
                    |
                    v
6. Re-execute task
```

### 7.4 Database Schema

```sql
-- Scheduled Browser Tasks
CREATE TABLE scheduled_browser_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Automation
  automation_type VARCHAR(50) NOT NULL,
  automation_config JSONB NOT NULL,

  -- Scheduling
  schedule_type VARCHAR(50) NOT NULL,
  cron_expression VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC' NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  next_run TIMESTAMP,
  last_run TIMESTAMP,
  last_run_status VARCHAR(50),
  last_run_error TEXT,
  last_run_duration INTEGER,

  -- Statistics
  execution_count INTEGER DEFAULT 0 NOT NULL,
  success_count INTEGER DEFAULT 0 NOT NULL,
  failure_count INTEGER DEFAULT 0 NOT NULL,
  average_duration INTEGER DEFAULT 0 NOT NULL,

  -- Retry
  retry_on_failure BOOLEAN DEFAULT true NOT NULL,
  max_retries INTEGER DEFAULT 3 NOT NULL,
  retry_delay INTEGER DEFAULT 60 NOT NULL,
  timeout INTEGER DEFAULT 300 NOT NULL,

  -- Notifications
  notify_on_success BOOLEAN DEFAULT false NOT NULL,
  notify_on_failure BOOLEAN DEFAULT true NOT NULL,
  notification_channels JSONB,

  -- History
  keep_execution_history BOOLEAN DEFAULT true NOT NULL,
  max_history_records INTEGER DEFAULT 100 NOT NULL,
  tags JSONB,
  metadata JSONB,

  -- Audit
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  last_modified_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Task Executions
CREATE TABLE scheduled_task_executions (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES scheduled_browser_tasks(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'queued' NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  attempt_number INTEGER DEFAULT 1 NOT NULL,

  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration INTEGER,

  output JSONB,
  error TEXT,
  logs JSONB,

  session_id VARCHAR(255),
  debug_url TEXT,
  recording_url TEXT,

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Cron Job Registry
CREATE TABLE cron_job_registry (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL UNIQUE REFERENCES scheduled_browser_tasks(id) ON DELETE CASCADE,
  job_id VARCHAR(255) NOT NULL UNIQUE,
  job_name VARCHAR(255) NOT NULL,
  cron_expression VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC' NOT NULL,
  is_running BOOLEAN DEFAULT false NOT NULL,
  last_started_at TIMESTAMP,
  last_completed_at TIMESTAMP,
  next_run_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_scheduled_tasks_user_status ON scheduled_browser_tasks(user_id, status);
CREATE INDEX idx_scheduled_tasks_next_run ON scheduled_browser_tasks(next_run) WHERE status = 'active';
CREATE INDEX idx_task_executions_task_id ON scheduled_task_executions(task_id);
CREATE INDEX idx_task_executions_status ON scheduled_task_executions(status);
```

### 7.5 API Response Schemas

#### Task Response
```typescript
interface ScheduledTaskResponse {
  id: number;
  userId: number;
  name: string;
  description?: string;
  automationType: string;
  automationConfig: AutomationConfig;
  scheduleType: string;
  cronExpression: string;
  timezone: string;
  status: "active" | "paused" | "failed" | "completed" | "archived";
  nextRun?: Date;
  lastRun?: Date;
  lastRunStatus?: string;
  lastRunError?: string;
  lastRunDuration?: number;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationChannels?: NotificationChannel[];
  keepExecutionHistory: boolean;
  maxHistoryRecords: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Pagination Response
```typescript
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Users Schema | `drizzle/schema.ts` | User reference for tasks |
| Scheduled Tasks Schema | `drizzle/schema-scheduled-tasks.ts` | Task and execution tables |
| Logger | `server/lib/logger.ts` | Structured logging |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| cron-parser | ^4.x | Parse and validate cron expressions |
| cronstrue | ^2.x | Human-readable cron descriptions |
| @trpc/server | ^11.x | API framework |
| zod | ^3.x | Schema validation |
| drizzle-orm | ^0.30.x | Database ORM |

### 8.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | Task and execution storage | Yes |
| Browserbase | Browser automation execution | Yes |
| SMTP Server | Email notifications | Optional |
| Slack API | Slack notifications | Optional |

### 8.4 Environment Variables

```bash
# Required
DATABASE_URL=              # PostgreSQL connection
BROWSERBASE_API_KEY=       # Browserbase authentication
BROWSERBASE_PROJECT_ID=    # Browserbase project

# Notifications (Optional)
SMTP_HOST=                 # Email server host
SMTP_PORT=                 # Email server port
SMTP_USER=                 # Email authentication
SMTP_PASS=                 # Email password
SLACK_DEFAULT_WEBHOOK=     # Default Slack webhook (optional)
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Visual schedule builder | Complexity, cron syntax sufficient | v2.0 |
| Conditional scheduling | Focus on time-based first | v2.0 |
| Chained task workflows | Separate orchestration feature | v2.0 |
| Task templates | Lower priority | v1.5 |
| Team/shared task ownership | Requires permissions system | v2.0 |
| Calendar integration | External service dependency | v2.0 |
| SMS notifications | Limited use case | v2.0 |
| PagerDuty integration | Enterprise feature | v3.0 |
| Custom retry strategies | Complexity | v1.5 |
| Geographic execution | Different infrastructure | v3.0 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Minimum interval | 1 minute minimum between executions | Use external scheduler for sub-minute |
| Execution queue | Sequential execution per user | Use multiple accounts for parallelism |
| History retention | Max 100 records per task | Export history before rotation |
| Timezone list | IANA timezones only | No custom UTC offsets |
| Cron fields | 5-field cron only | No seconds or years support |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scheduler drift over time | Medium | Medium | Use database-backed scheduling with regular sync |
| Timezone library bugs | Low | High | Use battle-tested cron-parser library |
| Concurrent execution conflicts | Medium | Medium | Database locking on execution start |
| Notification delivery failures | Medium | Medium | Queue notifications with retry, log all attempts |
| Browser session failures | Medium | Medium | Retry mechanism with exponential backoff |
| Database connection exhaustion | Low | High | Connection pooling with max limits |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| User creates too many tasks | Medium | Medium | Implement per-user task limits |
| High notification volume | Medium | Low | Rate limiting on notifications |
| Task execution costs | High | Medium | Usage tracking and billing integration |
| Complex cron expressions fail | Low | Medium | Expression validation and preview |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unauthorized task access | Low | High | User ID validation on all operations |
| Webhook URL abuse | Medium | Medium | URL validation and rate limiting |
| Credential exposure in logs | Low | Critical | Sanitize all logged data |
| SQL injection | Low | Critical | Parameterized queries via Drizzle ORM |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scheduler process crash | Low | High | Health monitoring, automatic restart |
| Database migration failures | Low | Medium | Test migrations, rollback plan |
| Peak load bottleneck | Medium | Medium | Queue-based execution, auto-scaling |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Scheduling (Weeks 1-4)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | Database schema and migrations | Week 1 |
| M1.2 | CronScheduler service implementation | Week 2 |
| M1.3 | CRUD endpoints (create, read, update, delete) | Week 3 |
| M1.4 | List and filter endpoints with pagination | Week 4 |

**Exit Criteria:**
- [ ] Tasks can be created with cron expressions
- [ ] Cron expressions are validated correctly
- [ ] Human-readable descriptions are generated
- [ ] Next run times are calculated accurately
- [ ] Tasks can be listed, filtered, and sorted

### 11.2 Phase 2: Execution Management (Weeks 5-8)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | Pause/resume functionality | Week 5 |
| M2.2 | Manual execution (executeNow) | Week 6 |
| M2.3 | Execution history tracking | Week 7 |
| M2.4 | Task statistics calculation | Week 8 |

**Exit Criteria:**
- [ ] Tasks can be paused and resumed
- [ ] Manual execution creates proper history records
- [ ] Execution history is queryable with filters
- [ ] Statistics accurately reflect execution results

### 11.3 Phase 3: Scheduler Integration (Weeks 9-12)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Scheduler daemon implementation | Week 9 |
| M3.2 | Browser automation execution integration | Week 10 |
| M3.3 | Retry mechanism implementation | Week 11 |
| M3.4 | Timeout handling | Week 12 |

**Exit Criteria:**
- [ ] Tasks execute at scheduled times (within 60s accuracy)
- [ ] Browser automation actions execute correctly
- [ ] Failed tasks retry according to configuration
- [ ] Timeout handling terminates hung tasks

### 11.4 Phase 4: Notifications (Weeks 13-16)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Email notification channel | Week 13 |
| M4.2 | Slack notification channel | Week 14 |
| M4.3 | Webhook notification channel | Week 15 |
| M4.4 | Notification logging and retry | Week 16 |

**Exit Criteria:**
- [ ] Email notifications delivered on success/failure
- [ ] Slack notifications delivered with rich formatting
- [ ] Webhook notifications delivered with full payload
- [ ] Failed notifications are retried and logged

### 11.5 Phase 5: Polish & Optimization (Weeks 17-20)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M5.1 | Performance optimization | Week 17 |
| M5.2 | Comprehensive logging and monitoring | Week 18 |
| M5.3 | Documentation and examples | Week 19 |
| M5.4 | Testing and bug fixes | Week 20 |

**Exit Criteria:**
- [ ] API response times meet SLA
- [ ] All operations are properly logged
- [ ] Documentation covers all endpoints
- [ ] Test coverage >= 80%

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Task Creation
- [ ] User can create task with all required fields
- [ ] Cron expression is validated before saving
- [ ] Human-readable description is generated
- [ ] Next run time is calculated correctly
- [ ] Task appears in user's task list
- [ ] All automation types are supported

#### AC-002: Cron Expression Handling
- [ ] Standard 5-field cron syntax is supported
- [ ] Invalid expressions are rejected with clear error
- [ ] Wildcards, ranges, lists, and steps work correctly
- [ ] Human-readable descriptions are accurate
- [ ] Next N run times can be calculated and displayed

#### AC-003: Timezone Support
- [ ] All IANA timezones are selectable
- [ ] Next run time respects selected timezone
- [ ] DST transitions are handled correctly
- [ ] UTC conversion is accurate
- [ ] Timezone changes update next run time immediately

#### AC-004: Task Lifecycle
- [ ] Tasks can be paused and resumed
- [ ] Paused tasks do not execute
- [ ] Resumed tasks recalculate next run time
- [ ] Deleted tasks are soft deleted (archived)
- [ ] Archived tasks preserve history

#### AC-005: Manual Execution
- [ ] "Execute Now" triggers immediate execution
- [ ] Manual runs are tracked with correct trigger type
- [ ] Manual execution does not affect scheduled next run
- [ ] Execution ID is returned for status tracking
- [ ] Browser session details are recorded

#### AC-006: Execution History
- [ ] History is paginated correctly
- [ ] Status filter works (success, failed, timeout, cancelled)
- [ ] Each execution shows complete details
- [ ] Logs are captured and retrievable
- [ ] History respects maxHistoryRecords setting

#### AC-007: Retry Mechanism
- [ ] Failed tasks retry when retryOnFailure is true
- [ ] Retry respects maxRetries limit
- [ ] Retry delay is honored
- [ ] Attempt number increments correctly
- [ ] Final failure is recorded after max retries

#### AC-008: Notifications
- [ ] Success notifications sent when enabled
- [ ] Failure notifications sent when enabled
- [ ] Email notifications delivered correctly
- [ ] Slack notifications formatted properly
- [ ] Webhook notifications include full payload
- [ ] Notification failures are logged

#### AC-009: Statistics
- [ ] Execution count increments on each run
- [ ] Success and failure counts are accurate
- [ ] Success rate calculation is correct
- [ ] Average duration updates after each execution
- [ ] Last run details are current

### 12.2 Integration Acceptance

- [ ] API endpoints respond within SLA (P95 < 500ms)
- [ ] Authentication enforced on all endpoints
- [ ] User isolation prevents cross-user access
- [ ] Database queries use proper indexes
- [ ] Concurrent requests handled correctly

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests pass for all endpoints
- [ ] Cron service tests cover edge cases
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks meet targets
- [ ] Documentation complete and accurate

---

## Appendix A: API Reference

### A.1 Scheduled Tasks Router Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `scheduledTasks.list` | Query | ListInput | PaginatedTaskResponse |
| `scheduledTasks.getById` | Query | { id: number } | ScheduledTask |
| `scheduledTasks.create` | Mutation | CreateTaskInput | { success, task, message } |
| `scheduledTasks.update` | Mutation | UpdateTaskInput | { success, task, message } |
| `scheduledTasks.delete` | Mutation | { id: number } | { success, message } |
| `scheduledTasks.pause` | Mutation | { id: number } | { success, task, message } |
| `scheduledTasks.resume` | Mutation | { id: number } | { success, task, message } |
| `scheduledTasks.executeNow` | Mutation | { id: number } | { success, execution, message } |
| `scheduledTasks.getExecutionHistory` | Query | HistoryInput | PaginatedExecutionResponse |
| `scheduledTasks.getUpcoming` | Query | { hours: number } | { tasks, timeWindow } |
| `scheduledTasks.getStatistics` | Query | { id: number } | TaskStatistics |

### A.2 Input Schemas

```typescript
// List Input
{
  page: number;           // >= 1, default 1
  pageSize: number;       // 1-100, default 20
  status?: "active" | "paused" | "failed" | "completed" | "archived";
  sortBy?: "nextRun" | "createdAt" | "lastRun" | "name";
  sortOrder?: "asc" | "desc";
}

// Create Task Input
{
  name: string;           // 1-255 chars
  description?: string;
  automationType: "chat" | "observe" | "extract" | "workflow" | "custom";
  automationConfig: AutomationConfig;
  scheduleType: "daily" | "weekly" | "monthly" | "cron" | "once";
  cronExpression: string;
  timezone?: string;      // default "UTC"
  retryOnFailure?: boolean;
  maxRetries?: number;    // 0-10
  retryDelay?: number;    // >= 1 seconds
  timeout?: number;       // 10-3600 seconds
  notifyOnSuccess?: boolean;
  notifyOnFailure?: boolean;
  notificationChannels?: NotificationChannel[];
  keepExecutionHistory?: boolean;
  maxHistoryRecords?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Execution History Input
{
  taskId: number;
  page?: number;
  pageSize?: number;
  status?: "queued" | "running" | "success" | "failed" | "timeout" | "cancelled";
}
```

---

## Appendix B: Cron Expression Examples

| Expression | Description | Use Case |
|------------|-------------|----------|
| `0 9 * * *` | Every day at 9:00 AM | Daily reports |
| `0 9 * * 1-5` | Weekdays at 9:00 AM | Business day automation |
| `0 */2 * * *` | Every 2 hours | Regular monitoring |
| `30 8 1 * *` | 1st of month at 8:30 AM | Monthly billing |
| `0 0 * * 0` | Every Sunday at midnight | Weekly cleanup |
| `*/15 * * * *` | Every 15 minutes | Frequent checks |
| `0 6,18 * * *` | 6 AM and 6 PM daily | Twice daily sync |
| `0 9 15 * *` | 15th of month at 9 AM | Mid-month reports |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Cron Expression** | A string format for specifying recurring schedules (minute, hour, day, month, weekday) |
| **IANA Timezone** | Internet Assigned Numbers Authority timezone identifier (e.g., "America/New_York") |
| **Execution** | A single run of a scheduled task, whether scheduled, manual, or retry |
| **Trigger Type** | How an execution was initiated: scheduled, manual, or retry |
| **Success Criteria** | Conditions that must be met for an execution to be considered successful |
| **Notification Channel** | A method for delivering alerts: email, Slack, or webhook |
| **Soft Delete** | Marking a record as archived without physical deletion |
| **DST** | Daylight Saving Time, which affects timezone calculations |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Design
