# PRD-015: Agency Tasks

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/agencyTasks.ts`

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

The Agency Tasks feature provides a comprehensive task management system for agency owners to create, assign, track, and execute automation tasks. Tasks can originate from multiple sources including webhooks (SMS, email, custom), manual creation, or scheduled triggers. The system supports task dependencies, bulk operations, templates, human review workflows, and automatic bot execution.

### 1.1 Feature Summary

- **Multi-Source Task Creation**: Tasks from webhooks, manual input, conversations, or scheduled triggers
- **Status Workflow Management**: Complete lifecycle tracking from pending through completion/failure
- **Priority and Urgency System**: Four-level priority (low, medium, high, critical) and urgency (normal, soon, urgent, immediate)
- **Task Dependencies**: Define execution order with depends-on relationships
- **Human Review Workflow**: Optional human approval before bot execution
- **Execution Tracking**: Detailed execution history with browser session recordings
- **Bulk Operations**: Mass status updates, assignments, and deletions
- **Task Templates**: Save and reuse common task configurations
- **Real-Time Queue Management**: View running, pending, and scheduled tasks
- **Statistics Dashboard**: Aggregate metrics by status, priority, and timeline

### 1.2 Target Users

- Agency Owners managing client automation
- Virtual Assistants handling task delegation
- Operations Managers overseeing bot execution
- Client Success Teams monitoring task completion
- Developers integrating automation workflows

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Fragmented Task Sources**: Tasks arrive via SMS, email, webhooks, and manual entry without centralized management
2. **No Execution Visibility**: Users cannot track what the bot is currently working on or has completed
3. **Missing Prioritization**: Urgent tasks get lost among routine work without proper ordering
4. **No Dependency Management**: Complex workflows requiring sequential steps cannot be modeled
5. **Lack of Human Oversight**: High-risk automation tasks execute without approval workflow
6. **Poor Error Recovery**: Failed tasks provide no context for debugging or retry
7. **No Reusability**: Common task patterns must be recreated from scratch each time

### 2.2 User Pain Points

- "I receive client requests via SMS and email but have no central place to track them"
- "I need to approve certain automations before the bot executes them"
- "When a task fails, I have no idea what went wrong or how to fix it"
- "I spend time recreating the same task configurations repeatedly"
- "Complex workflows with dependencies are impossible to manage"
- "I cannot see what the bot is working on right now vs. what's queued"
- "There's no way to prioritize urgent client requests over routine work"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Fragmented task sources | 2+ hours/day consolidating requests from multiple channels |
| No execution visibility | 40% of support tickets asking "what's the status?" |
| Missing prioritization | 25% of urgent tasks delayed due to queue position |
| No dependency management | 30% workflow failure rate from incorrect execution order |
| Lack of human oversight | $5K+ monthly in reversed automation mistakes |
| Poor error recovery | 50% of failed tasks require developer intervention |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Centralize all task sources into unified task board | P0 |
| **G2** | Provide complete execution visibility and history | P0 |
| **G3** | Enable priority-based queue management | P0 |
| **G4** | Support task dependencies for complex workflows | P1 |
| **G5** | Implement human review workflow for sensitive tasks | P1 |
| **G6** | Enable bulk operations for efficiency | P1 |
| **G7** | Support task templates and cloning | P2 |

### 3.2 Success Metrics (KPIs)

#### Task Management Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Task Creation Success Rate | >= 99% | Successful creates / Total attempts |
| Average Time to First Action | < 30 seconds | Time from creation to queue/execution |
| Status Transition Accuracy | 100% | Valid state machine transitions only |
| Dependency Resolution Rate | >= 95% | Tasks correctly blocked until dependencies complete |

#### Execution Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Auto-Execution Success Rate | >= 85% | Successful auto-executions / Total auto-executions |
| Manual Trigger Response | < 2 seconds | Time from trigger to execution start |
| Human Review Turnaround | < 1 hour (median) | Time from pending review to approved/rejected |
| Retry Success Rate | >= 60% | Successful retries / Total retries |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Dashboard Load Time | < 500ms | P95 getStats + list response time |
| Queue Visibility Adoption | >= 80% | Users checking queue at least daily |
| Bulk Operation Usage | >= 30% | Users performing bulk operations monthly |
| Template Adoption | >= 40% | Tasks created from templates |

#### Business Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tasks Processed per Day | >= 100/user | Total completed tasks / Active users |
| Time Saved per User | >= 4 hours/week | Survey + comparison baseline |
| Support Ticket Reduction | >= 50% | Status-related tickets before/after |
| Error Resolution Time | < 15 minutes | Time from failure to resolution |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: Create Task Manually
**As an** agency owner
**I want to** create tasks manually with all relevant details
**So that** I can track work that doesn't come from automated sources

**Acceptance Criteria:**
- User can enter title (required, max 500 chars)
- User can enter description (optional, max 5000 chars)
- User can select task type (browser_automation, api_call, notification, reminder, ghl_action, data_extraction, report_generation, custom)
- User can set priority (low, medium, high, critical)
- User can set urgency (normal, soon, urgent, immediate)
- User can specify scheduling (immediate, scheduled datetime)
- User can add tags and metadata
- Task is created with pending status
- Auto-execution triggers if conditions are met

#### US-002: List and Filter Tasks
**As an** operations manager
**I want to** view all tasks with flexible filtering
**So that** I can quickly find and act on specific tasks

**Acceptance Criteria:**
- Filter by single or multiple statuses
- Filter by priority level
- Filter by category and task type
- Filter by assignment (bot vs. human)
- Filter by human review requirement
- Filter by scheduled date range
- Search across title and description
- Sort by createdAt, updatedAt, priority, scheduledFor, deadline
- Paginate results with configurable limit (1-100)
- Return total count for pagination UI

#### US-003: Update Task Properties
**As a** virtual assistant
**I want to** modify task details after creation
**So that** I can correct or enhance task information

**Acceptance Criteria:**
- Update title, description, category
- Change priority and urgency
- Modify status with automatic timestamp updates
- Toggle bot assignment and human review flags
- Reschedule execution time
- Add/remove tags and metadata
- Validate user ownership before update
- Return updated task data

#### US-004: Approve Task for Execution
**As an** agency owner
**I want to** approve tasks requiring human review
**So that** I can ensure quality before bot execution

**Acceptance Criteria:**
- Only tasks with requiresHumanReview=true can be approved
- Approval records reviewer ID and timestamp
- Approval removes human review flag
- Status changes to queued
- Optional approval notes are stored
- Auto-execution triggers after approval
- Execution does not occur without approval

#### US-005: Reject Task
**As an** agency owner
**I want to** reject tasks that should not be executed
**So that** I can prevent inappropriate automations

**Acceptance Criteria:**
- Rejection requires a reason (1-1000 chars)
- Rejection records reviewer ID and timestamp
- Status changes to cancelled
- Reason is stored in statusReason field
- Rejected tasks do not execute

#### US-006: Execute Task Manually
**As a** power user
**I want to** trigger task execution on demand
**So that** I can run tasks outside the automatic queue

**Acceptance Criteria:**
- Only non-in_progress, non-completed tasks can be executed
- Tasks requiring human review must be approved first
- Execution starts asynchronously (non-blocking)
- Response confirms execution started
- Task status updates to in_progress
- Execution service handles the actual work

#### US-007: View Task Queue
**As an** operations manager
**I want to** see the current task queue state
**So that** I can understand what's running and waiting

**Acceptance Criteria:**
- View tasks filtered by: all, running, pending, scheduled
- See count of running, pending, and scheduled tasks
- Running tasks show isRunning=true
- Pending tasks show queue position
- Sorted by priority then creation date
- Configurable result limit

#### US-008: View Task Statistics
**As an** agency owner
**I want to** see aggregate task metrics
**So that** I can understand overall workload and performance

**Acceptance Criteria:**
- Count by each status (pending, queued, in_progress, etc.)
- Count by each priority level
- Count of tasks pending human review
- Count of overdue tasks (past deadline, not completed)
- Count of tasks scheduled for today
- Real-time data (not cached)

### 4.2 Advanced User Stories

#### US-009: Task Dependencies
**As a** workflow specialist
**I want to** define task dependencies
**So that** tasks execute in the correct order

**Acceptance Criteria:**
- Specify dependsOn array of task IDs at creation
- Dependent tasks remain blocked until dependencies complete
- Circular dependency detection (future enhancement)
- blockedBy field tracks blocking task
- Completion of blocking task triggers dependent evaluation

#### US-010: View Execution History
**As a** developer
**I want to** see detailed execution history for a task
**So that** I can debug failures and understand behavior

**Acceptance Criteria:**
- List all executions for a task with pagination
- Show execution status, duration, attempt number
- Show browser session details if applicable
- Show step-by-step progress (stepsTotal, stepsCompleted)
- Show error details for failed executions
- Show logs and screenshots
- Most recent executions first

#### US-011: Delete/Cancel Task
**As an** agency owner
**I want to** remove tasks that are no longer needed
**So that** my task board stays clean and relevant

**Acceptance Criteria:**
- Verify user ownership before deletion
- Soft delete: status changes to cancelled
- Preserve history for audit purposes
- Store cancellation reason
- Prevent deletion of in_progress tasks (cancel first)

#### US-012: Bulk Status Update
**As an** operations manager
**I want to** update multiple tasks at once
**So that** I can efficiently manage large task volumes

**Acceptance Criteria:**
- Select multiple tasks by ID
- Apply status change to all selected
- Validate all tasks are owned by user
- Return success/failure per task
- Skip tasks that cannot transition to target status

#### US-013: Clone Task (Template)
**As a** power user
**I want to** create a new task based on an existing one
**So that** I can reuse common configurations

**Acceptance Criteria:**
- Clone creates new task with same configuration
- New task gets new ID and UUID
- Status resets to pending
- Timestamps reset to current time
- User can modify cloned task before saving
- Original task is unchanged

#### US-014: Get Single Task with Details
**As a** user
**I want to** view complete task details including related data
**So that** I can understand the full context

**Acceptance Criteria:**
- Return all task fields
- Include recent execution history (last 10)
- Include source message if task originated from webhook
- Verify user ownership
- Return 404 if task not found or not owned

---

## 5. Functional Requirements

### 5.1 Task Creation

#### FR-001: Create Task
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Accept title (1-500 chars, required) | P0 |
| FR-001.2 | Accept description (max 5000 chars, optional) | P0 |
| FR-001.3 | Accept category (max 100 chars, default: general) | P0 |
| FR-001.4 | Accept taskType (browser_automation, api_call, notification, reminder, ghl_action, data_extraction, report_generation, custom) | P0 |
| FR-001.5 | Accept priority (low, medium, high, critical; default: medium) | P0 |
| FR-001.6 | Accept urgency (normal, soon, urgent, immediate; default: normal) | P0 |
| FR-001.7 | Accept assignedToBot (boolean, default: true) | P0 |
| FR-001.8 | Accept requiresHumanReview (boolean, default: false) | P0 |
| FR-001.9 | Accept executionType (automatic, manual_trigger, scheduled; default: automatic) | P0 |
| FR-001.10 | Accept executionConfig (JSON object, optional) | P1 |
| FR-001.11 | Accept scheduledFor (datetime, optional) | P1 |
| FR-001.12 | Accept deadline (datetime, optional) | P1 |
| FR-001.13 | Accept dependsOn (array of task IDs, optional) | P1 |
| FR-001.14 | Accept tags (array of strings, optional) | P2 |
| FR-001.15 | Accept metadata (JSON object, optional) | P2 |
| FR-001.16 | Set sourceType to "manual" for API-created tasks | P0 |
| FR-001.17 | Set status to "pending" on creation | P0 |
| FR-001.18 | Auto-execute if: executionType=automatic AND assignedToBot=true AND requiresHumanReview=false AND scheduledFor=null | P0 |

#### FR-002: Input Validation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Validate title length (1-500 characters) | P0 |
| FR-002.2 | Validate description length (max 5000 characters) | P0 |
| FR-002.3 | Validate category length (max 100 characters) | P0 |
| FR-002.4 | Validate taskType against enum | P0 |
| FR-002.5 | Validate priority against enum | P0 |
| FR-002.6 | Validate urgency against enum | P0 |
| FR-002.7 | Validate scheduledFor as ISO8601 datetime | P0 |
| FR-002.8 | Validate deadline as ISO8601 datetime | P0 |
| FR-002.9 | Validate dependsOn contains positive integers | P1 |

### 5.2 Task Listing and Filtering

#### FR-003: List Tasks
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Filter by single status | P0 |
| FR-003.2 | Filter by multiple statuses (array) | P0 |
| FR-003.3 | Filter by priority | P0 |
| FR-003.4 | Filter by category | P1 |
| FR-003.5 | Filter by taskType | P1 |
| FR-003.6 | Filter by assignedToBot | P1 |
| FR-003.7 | Filter by requiresHumanReview | P1 |
| FR-003.8 | Filter by scheduledBefore (datetime) | P1 |
| FR-003.9 | Filter by scheduledAfter (datetime) | P1 |
| FR-003.10 | Support search parameter (future: full-text search) | P2 |
| FR-003.11 | Sort by createdAt, updatedAt, priority, scheduledFor, deadline | P0 |
| FR-003.12 | Support ascending and descending sort order | P0 |
| FR-003.13 | Paginate with limit (1-100, default: 50) | P0 |
| FR-003.14 | Paginate with offset (min: 0, default: 0) | P0 |
| FR-003.15 | Return total count for pagination | P0 |
| FR-003.16 | Only return tasks owned by authenticated user | P0 |

### 5.3 Task Updates

#### FR-004: Update Task
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Require task ID (positive integer) | P0 |
| FR-004.2 | Verify task ownership before update | P0 |
| FR-004.3 | Support partial updates (only provided fields) | P0 |
| FR-004.4 | Update title if provided | P0 |
| FR-004.5 | Update description if provided | P0 |
| FR-004.6 | Update category if provided | P0 |
| FR-004.7 | Update priority if provided | P0 |
| FR-004.8 | Update urgency if provided | P0 |
| FR-004.9 | Update status if provided | P0 |
| FR-004.10 | Update statusReason if provided | P0 |
| FR-004.11 | Update assignedToBot if provided | P1 |
| FR-004.12 | Update requiresHumanReview if provided | P1 |
| FR-004.13 | Update executionType if provided | P1 |
| FR-004.14 | Update executionConfig if provided | P1 |
| FR-004.15 | Update scheduledFor if provided (nullable) | P1 |
| FR-004.16 | Update deadline if provided (nullable) | P1 |
| FR-004.17 | Update tags if provided | P2 |
| FR-004.18 | Update metadata if provided | P2 |
| FR-004.19 | Set completedAt when status changes to "completed" | P0 |
| FR-004.20 | Set startedAt when status changes to "in_progress" | P0 |
| FR-004.21 | Set queuedAt when status changes to "queued" | P0 |
| FR-004.22 | Always update updatedAt timestamp | P0 |
| FR-004.23 | Return updated task data | P0 |

### 5.4 Task Actions

#### FR-005: Approve Task
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Accept task ID (positive integer) | P0 |
| FR-005.2 | Accept optional approval notes (max 1000 chars) | P1 |
| FR-005.3 | Verify task ownership | P0 |
| FR-005.4 | Verify task requires human review | P0 |
| FR-005.5 | Set requiresHumanReview to false | P0 |
| FR-005.6 | Set humanReviewedBy to approving user ID | P0 |
| FR-005.7 | Set humanReviewedAt to current timestamp | P0 |
| FR-005.8 | Set status to "queued" | P0 |
| FR-005.9 | Set queuedAt to current timestamp | P0 |
| FR-005.10 | Store notes in statusReason | P1 |
| FR-005.11 | Trigger auto-execution if assignedToBot and not scheduled | P0 |

#### FR-006: Reject Task
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Accept task ID (positive integer) | P0 |
| FR-006.2 | Accept rejection reason (1-1000 chars, required) | P0 |
| FR-006.3 | Verify task ownership | P0 |
| FR-006.4 | Set humanReviewedBy to rejecting user ID | P0 |
| FR-006.5 | Set humanReviewedAt to current timestamp | P0 |
| FR-006.6 | Set status to "cancelled" | P0 |
| FR-006.7 | Store "Rejected: {reason}" in statusReason | P0 |

#### FR-007: Execute Task
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Accept task ID (positive integer) | P0 |
| FR-007.2 | Verify task ownership | P0 |
| FR-007.3 | Reject if status is "in_progress" | P0 |
| FR-007.4 | Reject if status is "completed" | P0 |
| FR-007.5 | Reject if requiresHumanReview is true | P0 |
| FR-007.6 | Trigger execution via taskExecutionService | P0 |
| FR-007.7 | Execute asynchronously (non-blocking response) | P0 |
| FR-007.8 | Return success confirmation with task ID | P0 |

#### FR-008: Delete/Cancel Task
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Accept task ID (positive integer) | P0 |
| FR-008.2 | Verify task ownership | P0 |
| FR-008.3 | Soft delete: set status to "cancelled" | P0 |
| FR-008.4 | Set statusReason to "Cancelled by user" | P0 |
| FR-008.5 | Update updatedAt timestamp | P0 |
| FR-008.6 | Return success with task ID | P0 |

### 5.5 Task Queue and Statistics

#### FR-009: Get Task Queue
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Accept filter (all, running, pending, scheduled) | P0 |
| FR-009.2 | Accept limit (1-100, default: 50) | P0 |
| FR-009.3 | Return matching tasks for authenticated user | P0 |
| FR-009.4 | Mark running tasks with isRunning=true | P0 |
| FR-009.5 | Calculate queue position for pending/queued tasks | P1 |
| FR-009.6 | Sort by priority desc, then createdAt desc | P0 |
| FR-009.7 | Return counts: running, pending, scheduled | P0 |

#### FR-010: Get Task Statistics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Return count by each status value | P0 |
| FR-010.2 | Return count by each priority value | P0 |
| FR-010.3 | Return count of tasks pending human review | P0 |
| FR-010.4 | Return count of overdue tasks (deadline past, not completed) | P0 |
| FR-010.5 | Return count of tasks scheduled for today | P1 |
| FR-010.6 | Only count tasks owned by authenticated user | P0 |

### 5.6 Execution History

#### FR-011: Get Single Task
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Accept task ID (positive integer) | P0 |
| FR-011.2 | Verify task ownership | P0 |
| FR-011.3 | Return all task fields | P0 |
| FR-011.4 | Include last 10 executions | P0 |
| FR-011.5 | Include source message if sourceMessageId exists | P1 |
| FR-011.6 | Return 404 if task not found or not owned | P0 |

#### FR-012: Get Executions
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Accept task ID (positive integer) | P0 |
| FR-012.2 | Verify task ownership | P0 |
| FR-012.3 | Accept limit (1-100, default: 20) | P0 |
| FR-012.4 | Accept offset (min: 0, default: 0) | P0 |
| FR-012.5 | Return executions sorted by startedAt desc | P0 |
| FR-012.6 | Include all execution fields | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Task creation response time | < 200ms | P0 |
| NFR-002 | Task list query (50 items) | < 300ms | P0 |
| NFR-003 | Statistics query | < 500ms | P0 |
| NFR-004 | Task queue query | < 300ms | P0 |
| NFR-005 | Task update response time | < 200ms | P0 |
| NFR-006 | Concurrent task creations | 100/second | P1 |
| NFR-007 | Database index coverage | 100% for common queries | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Tasks per user | Unlimited | P0 |
| NFR-009 | Active tasks per user | 10,000+ | P1 |
| NFR-010 | Executions per task | Unlimited | P0 |
| NFR-011 | Concurrent users | 1,000+ | P1 |
| NFR-012 | Database connection pooling | Max 50 per instance | P0 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-013 | Task creation success rate | >= 99.9% | P0 |
| NFR-014 | Status transition integrity | 100% | P0 |
| NFR-015 | Data durability | 99.99% | P0 |
| NFR-016 | Execution trigger reliability | >= 99% | P0 |
| NFR-017 | Soft delete for all deletions | 100% | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-018 | All endpoints require authentication (protectedProcedure) | P0 |
| NFR-019 | User can only access their own tasks | P0 |
| NFR-020 | User ID validation on all queries | P0 |
| NFR-021 | Input validation via Zod schemas | P0 |
| NFR-022 | SQL injection prevention via Drizzle ORM | P0 |
| NFR-023 | Audit logging for task state changes | P1 |
| NFR-024 | Sensitive data excluded from logs | P0 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-025 | Error logging with context (task ID, user ID) | P0 |
| NFR-026 | Execution duration tracking | P0 |
| NFR-027 | Status transition logging | P1 |
| NFR-028 | Query performance monitoring | P1 |
| NFR-029 | Alert on error rate > 1% | P1 |

### 6.6 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-030 | TypeScript strict mode | P0 |
| NFR-031 | Zod schema validation | P0 |
| NFR-032 | Shared schema reuse (common.ts) | P0 |
| NFR-033 | Consistent error handling | P0 |
| NFR-034 | Test coverage >= 80% | P1 |
| NFR-035 | API documentation | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+------------------------------------------------------------------+
|                         Client Application                         |
|                    (React/Next.js with tRPC)                       |
+----------------------------------+-------------------------------+
                                   | tRPC
                                   v
+------------------------------------------------------------------+
|                    API Layer (tRPC Router)                         |
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  |  agencyTasks     |  |  webhookRouter   |  |  agentRouter     |  |
|  |  Router          |  |  (task creation) |  |  (execution)     |  |
|  +------------------+  +------------------+  +------------------+  |
|           |                    |                    |              |
+-----------|--------------------|--------------------|-------------+
            |                    |                    |
            v                    v                    v
+------------------------------------------------------------------+
|                    Service Layer                                   |
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  |  Task CRUD       |  |  taskExecution   |  |  agentOrchestrator|  |
|  |  Operations      |  |  Service         |  |  Service          |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
+----------------------------------+-------------------------------+
                                   |
                                   v
+------------------------------------------------------------------+
|                    Database Layer (Drizzle ORM)                    |
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  |  agency_tasks    |  |  task_executions |  |  inbound_messages|  |
|  |  Table           |  |  Table           |  |  Table           |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
+------------------------------------------------------------------+
                                   |
                                   v
+------------------------------------------------------------------+
|                    PostgreSQL Database                             |
+------------------------------------------------------------------+
```

### 7.2 Component Details

#### 7.2.1 Agency Tasks Router (`agencyTasks.ts`)
Primary tRPC router for all task management operations.

**Endpoints:**
- `create`: Create new task with validation and auto-execution
- `list`: Query tasks with filtering, sorting, pagination
- `get`: Retrieve single task with executions and source message
- `update`: Partial update with status transition handling
- `delete`: Soft delete (cancel) preserving history
- `approve`: Human review approval workflow
- `reject`: Human review rejection workflow
- `execute`: Manual execution trigger
- `getStats`: Aggregate statistics
- `getExecutions`: Paginated execution history
- `getTaskQueue`: Queue state with counts

#### 7.2.2 Database Schema

**agency_tasks Table:**
```sql
CREATE TABLE agency_tasks (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  taskUuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Source tracking
  sourceType VARCHAR(50) NOT NULL,
  sourceWebhookId INTEGER REFERENCES user_webhooks(id),
  sourceMessageId INTEGER REFERENCES inbound_messages(id),
  conversationId INTEGER REFERENCES bot_conversations(id),

  -- Task details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  originalMessage TEXT,
  category VARCHAR(100) DEFAULT 'general',
  taskType VARCHAR(100) NOT NULL,

  -- Priority
  priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
  urgency VARCHAR(20) DEFAULT 'normal' NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  statusReason TEXT,

  -- Assignment
  assignedToBot BOOLEAN DEFAULT true NOT NULL,
  requiresHumanReview BOOLEAN DEFAULT false NOT NULL,
  humanReviewedBy INTEGER REFERENCES users(id),
  humanReviewedAt TIMESTAMP,

  -- Execution
  executionType VARCHAR(50) DEFAULT 'automatic',
  executionConfig JSONB,
  scheduledFor TIMESTAMP,
  deadline TIMESTAMP,

  -- Dependencies
  dependsOn JSONB,
  blockedBy INTEGER REFERENCES agency_tasks(id),

  -- Results
  result JSONB,
  resultSummary TEXT,
  lastError TEXT,
  errorCount INTEGER DEFAULT 0 NOT NULL,
  maxRetries INTEGER DEFAULT 3 NOT NULL,

  -- Notifications
  notifyOnComplete BOOLEAN DEFAULT true NOT NULL,
  notifyOnFailure BOOLEAN DEFAULT true NOT NULL,
  notificationsSent JSONB,

  -- Metadata
  tags JSONB,
  metadata JSONB,

  -- Timestamps
  queuedAt TIMESTAMP,
  startedAt TIMESTAMP,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX agency_tasks_user_id_idx ON agency_tasks(userId);
CREATE UNIQUE INDEX agency_tasks_uuid_idx ON agency_tasks(taskUuid);
CREATE INDEX agency_tasks_status_idx ON agency_tasks(status);
CREATE INDEX agency_tasks_priority_idx ON agency_tasks(priority);
CREATE INDEX agency_tasks_task_type_idx ON agency_tasks(taskType);
CREATE INDEX agency_tasks_scheduled_for_idx ON agency_tasks(scheduledFor);
CREATE INDEX agency_tasks_conversation_id_idx ON agency_tasks(conversationId);
CREATE INDEX agency_tasks_user_status_idx ON agency_tasks(userId, status);
CREATE INDEX agency_tasks_pending_bot_idx ON agency_tasks(status, assignedToBot, scheduledFor);
```

**task_executions Table:**
```sql
CREATE TABLE task_executions (
  id SERIAL PRIMARY KEY,
  taskId INTEGER NOT NULL REFERENCES agency_tasks(id) ON DELETE CASCADE,
  executionUuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  attemptNumber INTEGER DEFAULT 1 NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'started' NOT NULL,
  triggeredBy VARCHAR(50) NOT NULL,
  triggeredByUserId INTEGER REFERENCES users(id),

  -- Browser session
  browserSessionId VARCHAR(255),
  debugUrl TEXT,
  recordingUrl TEXT,

  -- Progress
  stepsTotal INTEGER DEFAULT 0 NOT NULL,
  stepsCompleted INTEGER DEFAULT 0 NOT NULL,
  currentStep VARCHAR(255),
  stepResults JSONB,

  -- Output
  output JSONB,
  logs JSONB,
  screenshots JSONB,

  -- Errors
  error TEXT,
  errorCode VARCHAR(100),
  errorStack TEXT,

  -- Performance
  duration INTEGER,
  resourceUsage JSONB,

  -- Timestamps
  startedAt TIMESTAMP DEFAULT NOW() NOT NULL,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX task_executions_task_id_idx ON task_executions(taskId);
CREATE UNIQUE INDEX task_executions_uuid_idx ON task_executions(executionUuid);
CREATE INDEX task_executions_status_idx ON task_executions(status);
CREATE INDEX task_executions_started_at_idx ON task_executions(startedAt);
CREATE INDEX task_executions_browser_session_idx ON task_executions(browserSessionId);
```

### 7.3 Status State Machine

```
                                    +--------+
                                    | manual |
                                    | create |
                                    +---+----+
                                        |
                                        v
                                  +-----------+
                         +------->| pending   |<-----------+
                         |        +-----------+            |
                         |             |                   |
                         |             v                   |
                         |        +-----------+            |
                         |        | queued    |            |
                         |        +-----------+            |
                         |             |                   |
             (retry)     |             v                   | (defer)
                         |        +-----------+            |
                         +--------| in_progress|-----------+
                                  +-----------+
                                    /        \
                                   /          \
                                  v            v
                          +-----------+   +-----------+
                          | completed |   | failed    |
                          +-----------+   +-----------+
                                               |
                                               v
                                          +-----------+
                                          | cancelled |
                                          +-----------+

Additional States:
- waiting_input: Paused for external input
- deferred: Postponed for future scheduling
```

### 7.4 Execution Flow

```
1. Task Created (status: pending)
         |
         v
2. Auto-execution check:
   - executionType = automatic?
   - assignedToBot = true?
   - requiresHumanReview = false?
   - scheduledFor = null?
         |
         +--- No ---> Wait for trigger
         |
         +--- Yes --> Trigger execution
         |
         v
3. taskExecutionService.executeTask(taskId, triggerType)
         |
         v
4. Create execution record
         |
         v
5. Update task status to in_progress
         |
         v
6. Execute browser automation / API call / etc.
         |
         +--- Success --> status: completed, record result
         |
         +--- Failure --> status: failed, record error
                          Check retry count
                          If retries remaining, schedule retry
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | Router framework with protectedProcedure |
| Database Helper | `server/_core/dbHelper.ts` | requireDb, withTrpcErrorHandling |
| Common Schemas | `server/api/schemas/common.ts` | Shared Zod validation schemas |
| Task Execution Service | `server/services/taskExecution.service.ts` | Handles actual task execution |
| Webhooks Schema | `drizzle/schema-webhooks.ts` | Database table definitions |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| zod | ^3.x | Schema validation |
| @trpc/server | ^11.x | API framework |
| drizzle-orm | ^0.30.x | Database ORM |
| pg | ^8.x | PostgreSQL driver |

### 8.3 Database Tables

| Table | Purpose |
|-------|---------|
| agency_tasks | Core task storage |
| task_executions | Execution history |
| inbound_messages | Source messages for webhook-created tasks |
| bot_conversations | Conversation context |
| user_webhooks | Webhook configuration |
| users | User authentication |

### 8.4 Related Features

| Feature | Relationship |
|---------|-------------|
| Webhooks Management (PRD-007) | Creates tasks from inbound messages |
| AI Agent Orchestration (PRD-001) | Executes browser automation tasks |
| Voice Agent (PRD-006) | Creates tasks from voice conversations |
| Email Integration (PRD-005) | Creates tasks from email messages |

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Task templates CRUD | Complexity; manual cloning first | v1.5 |
| Bulk operations API | Focus on single operations first | v1.5 |
| Full-text search | Requires search infrastructure | v2.0 |
| Circular dependency detection | Edge case; manual verification | v1.5 |
| Task comments/notes | Lower priority | v2.0 |
| File attachments | Requires file storage | v2.0 |
| Subtasks/checklists | Adds complexity | v2.0 |
| Task sharing between users | Multi-tenancy considerations | v3.0 |
| Recurring tasks | Scheduling complexity | v2.0 |
| Task time tracking | Different feature scope | Separate PRD |
| Kanban board UI | Frontend scope | Separate PRD |
| Mobile push notifications | Requires push infrastructure | v2.0 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| No real-time updates | Status updates on refresh | Polling or future SSE |
| Search is partial | Only filters, no fuzzy search | Use filters effectively |
| No task versioning | History in executions only | Review executions for history |
| Single assignment | Task assigned to bot OR user, not both | Use human review workflow |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database performance degradation with many tasks | Medium | High | Indexed queries, pagination, archiving old tasks |
| Task execution bottlenecks | Medium | Medium | Queue-based execution, concurrency limits |
| Deadlocks in concurrent updates | Low | High | Optimistic locking, retry logic |
| Status transition bugs | Low | High | State machine validation, comprehensive tests |
| Memory leaks in long-running executions | Low | Medium | Execution timeouts, resource cleanup |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low adoption of human review workflow | Medium | Medium | Default to auto-execution, onboarding |
| Users overwhelmed by task volume | Medium | Medium | Priority system, dashboard, filtering |
| Confusion about status meanings | Low | Medium | Clear documentation, UI tooltips |
| Dependency on execution service | High | High | Fallback mechanisms, monitoring |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unauthorized task access | Low | Critical | User ID validation on all queries |
| Task data leakage | Low | High | Proper scoping, audit logging |
| Injection via metadata/tags | Low | High | Zod validation, sanitization |
| Execution config manipulation | Low | High | Schema validation, allow-list |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Large query result sets | Medium | Medium | Enforced pagination limits |
| Stats query performance | Medium | Medium | Database indexes, caching |
| Orphaned executions | Low | Low | Cleanup jobs, monitoring |
| Time zone handling | Medium | Medium | Store UTC, convert on display |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Task CRUD (Weeks 1-2)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | Create task endpoint with validation | Week 1 |
| M1.2 | List tasks with filtering and pagination | Week 1 |
| M1.3 | Get single task endpoint | Week 1 |
| M1.4 | Update task endpoint | Week 2 |
| M1.5 | Delete (cancel) task endpoint | Week 2 |

**Exit Criteria:**
- [ ] Tasks can be created with all fields
- [ ] Tasks can be listed with filters
- [ ] Tasks can be updated and deleted
- [ ] All endpoints validate user ownership

### 11.2 Phase 2: Task Actions (Weeks 3-4)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | Approve task endpoint | Week 3 |
| M2.2 | Reject task endpoint | Week 3 |
| M2.3 | Execute task endpoint | Week 3 |
| M2.4 | Auto-execution on create | Week 4 |
| M2.5 | Execution service integration | Week 4 |

**Exit Criteria:**
- [ ] Human review workflow is complete
- [ ] Manual execution triggers work
- [ ] Auto-execution conditions are enforced
- [ ] Execution service is called correctly

### 11.3 Phase 3: Queue and Statistics (Weeks 5-6)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Get task queue endpoint | Week 5 |
| M3.2 | Get statistics endpoint | Week 5 |
| M3.3 | Queue position calculation | Week 6 |
| M3.4 | Performance optimization | Week 6 |

**Exit Criteria:**
- [ ] Queue displays running/pending/scheduled
- [ ] Statistics show all required metrics
- [ ] Queries perform within SLA
- [ ] Database indexes are optimized

### 11.4 Phase 4: Execution History (Weeks 7-8)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Get executions endpoint | Week 7 |
| M4.2 | Execution detail in get task | Week 7 |
| M4.3 | Source message inclusion | Week 8 |
| M4.4 | End-to-end testing | Week 8 |

**Exit Criteria:**
- [ ] Execution history is accessible
- [ ] Task details include related data
- [ ] All endpoints have test coverage
- [ ] Integration tests pass

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Task Creation
- [ ] User can create task with title and taskType (required)
- [ ] All optional fields are correctly handled
- [ ] Task is assigned pending status
- [ ] Auto-execution triggers when conditions met
- [ ] User receives created task data in response

#### AC-002: Task Listing
- [ ] Tasks are filtered by authenticated user only
- [ ] All filter parameters work correctly
- [ ] Sorting works for all supported fields
- [ ] Pagination returns correct subset
- [ ] Total count is accurate

#### AC-003: Task Updates
- [ ] Only task owner can update
- [ ] Partial updates only modify provided fields
- [ ] Status transitions update related timestamps
- [ ] Updated task is returned in response

#### AC-004: Human Review Workflow
- [ ] Approval removes review requirement
- [ ] Approval triggers execution if appropriate
- [ ] Rejection cancels task with reason
- [ ] Reviewer identity is recorded
- [ ] Timestamps are accurate

#### AC-005: Task Execution
- [ ] Only eligible tasks can be executed
- [ ] Execution is non-blocking
- [ ] Execution service is invoked correctly
- [ ] User receives confirmation

#### AC-006: Task Queue
- [ ] Filter options work correctly
- [ ] Counts are accurate
- [ ] Running tasks are identified
- [ ] Sorting is by priority then date

#### AC-007: Statistics
- [ ] Status counts are accurate
- [ ] Priority counts are accurate
- [ ] Pending review count is correct
- [ ] Overdue calculation is correct
- [ ] Today's scheduled count is correct

#### AC-008: Execution History
- [ ] Executions are returned newest first
- [ ] Pagination works correctly
- [ ] Task ownership is verified
- [ ] All execution fields are included

### 12.2 Integration Acceptance

- [ ] All endpoints require authentication
- [ ] User ID is validated on all queries
- [ ] Error responses include meaningful messages
- [ ] TRPC error codes are correct (NOT_FOUND, BAD_REQUEST, etc.)
- [ ] Database transactions are used where appropriate

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests for all endpoints
- [ ] Zod schema validation on all inputs
- [ ] No TypeScript errors
- [ ] No security vulnerabilities

---

## Appendix A: API Reference

### A.1 Endpoint Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `agencyTasks.create` | mutation | Create new task |
| `agencyTasks.list` | query | List tasks with filters |
| `agencyTasks.get` | query | Get single task with details |
| `agencyTasks.update` | mutation | Update task properties |
| `agencyTasks.delete` | mutation | Cancel task |
| `agencyTasks.approve` | mutation | Approve for execution |
| `agencyTasks.reject` | mutation | Reject with reason |
| `agencyTasks.execute` | mutation | Trigger manual execution |
| `agencyTasks.getStats` | query | Get aggregate statistics |
| `agencyTasks.getExecutions` | query | Get execution history |
| `agencyTasks.getTaskQueue` | query | Get queue state |

### A.2 Status Values

| Status | Description |
|--------|-------------|
| `pending` | Task created, awaiting processing |
| `queued` | Task approved and queued for execution |
| `in_progress` | Task currently executing |
| `waiting_input` | Task paused for external input |
| `completed` | Task successfully completed |
| `failed` | Task execution failed |
| `cancelled` | Task cancelled by user or system |
| `deferred` | Task postponed for future execution |

### A.3 Task Types

| Type | Description |
|------|-------------|
| `browser_automation` | Stagehand browser automation |
| `api_call` | HTTP API request |
| `notification` | Send notification to user |
| `reminder` | Scheduled reminder |
| `ghl_action` | GoHighLevel specific action |
| `data_extraction` | Extract data from page |
| `report_generation` | Generate report |
| `custom` | Custom task type |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Agency Task** | A unit of work to be executed by the bot or human |
| **Execution** | A single attempt to complete a task |
| **Human Review** | Approval workflow requiring user confirmation |
| **Queue Position** | Order in which pending tasks will execute |
| **Soft Delete** | Setting status to cancelled instead of removing data |
| **Source Message** | The inbound message that created a webhook task |
| **Task Dependency** | A task that must complete before another can start |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Design
