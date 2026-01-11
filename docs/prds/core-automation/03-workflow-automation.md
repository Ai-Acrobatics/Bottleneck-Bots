# PRD-03: Workflow Automation

**Feature:** Workflow Automation Engine
**Version:** 1.0
**Status:** Draft
**Author:** Bottleneck-Bots Team
**Last Updated:** 2026-01-11
**Location:** `server/api/routers/workflows.ts`, `server/services/workflowExecution.service.ts`

---

## 1. Overview

The Workflow Automation feature enables users to define, manage, and execute complex multi-step browser automation workflows. Built on Browserbase and Stagehand technology, this feature provides a powerful yet intuitive system for automating repetitive web-based tasks including navigation, data extraction, form submission, API integration, and conditional logic execution.

### 1.1 Feature Summary

| Aspect | Description |
|--------|-------------|
| **Core Capability** | Multi-step browser automation with AI-powered interactions |
| **Step Types** | 9 distinct step types: navigate, act, observe, extract, wait, condition, loop, apiCall, notification |
| **Trigger Types** | Manual, Scheduled, Webhook, Event-based |
| **Execution** | Sequential step processing with error handling and retry logic |
| **Data Handling** | Variable substitution, data extraction, and cross-step data sharing |

### 1.2 Key Stakeholders

- **End Users**: Business users automating repetitive browser tasks
- **Developers**: Building integrations and custom automation workflows
- **Operations Teams**: Scheduling and monitoring automated processes
- **System Administrators**: Managing execution resources and quotas

---

## 2. Problem Statement

### 2.1 Current Pain Points

1. **Manual Repetition**: Users spend significant time performing repetitive browser-based tasks like data entry, form submission, and information gathering across multiple websites.

2. **Error-Prone Processes**: Manual execution of multi-step processes leads to human errors, inconsistent data, and missed steps.

3. **Lack of Integration**: Existing automation tools often work in isolation without the ability to combine browser actions with API calls and business logic.

4. **Limited Scalability**: Manual processes cannot scale to handle increasing workloads or run during off-hours.

5. **No Visibility**: Users lack insight into what happened during automation runs, making debugging and optimization difficult.

### 2.2 User Needs

- Define complex, multi-step automation workflows without programming knowledge
- Execute workflows on-demand or on a schedule
- Extract and transform data from web pages automatically
- Integrate browser automation with external APIs and services
- Monitor workflow execution and troubleshoot failures
- Reuse and share workflow templates across the organization

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

| Goal | Target | Timeline |
|------|--------|----------|
| Increase user automation adoption | 60% of active users create at least 1 workflow | Q2 2026 |
| Reduce manual task time | 70% reduction in time spent on automated tasks | Q2 2026 |
| Improve workflow success rate | 95% successful execution rate | Q3 2026 |
| Enable self-service automation | 80% of workflows created without support assistance | Q3 2026 |

### 3.2 Success Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Workflow Creation Rate** | Number of new workflows created per user per month | 3+ workflows |
| **Execution Success Rate** | Percentage of workflow executions completing successfully | >= 95% |
| **Average Execution Time** | Mean time to complete workflow execution | < 5 minutes |
| **User Retention** | Users actively using workflows after 30 days | >= 75% |
| **Error Recovery Rate** | Percentage of failed steps recovered via retry logic | >= 80% |
| **Time Savings** | Estimated hours saved per user per month | 10+ hours |

### 3.3 Technical Goals

- Support up to 50 steps per workflow
- Execute workflows within 10-minute timeout window
- Handle concurrent executions (up to 5 per user)
- Provide real-time execution status updates
- Maintain < 500ms API response times for CRUD operations

---

## 4. User Stories

### 4.1 Workflow Creation

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-01 | User | As a user, I want to create a new workflow with a descriptive name and steps so that I can automate repetitive tasks | P0 |
| US-02 | User | As a user, I want to add multiple step types (navigate, act, extract, etc.) to my workflow so that I can handle complex automation scenarios | P0 |
| US-03 | User | As a user, I want to configure each step with specific parameters (URL, selectors, instructions) so that the automation behaves correctly | P0 |
| US-04 | User | As a user, I want to reorder steps by changing their order number so that I can adjust the execution sequence | P1 |
| US-05 | User | As a user, I want to save workflows as drafts before activating them so that I can refine them over time | P1 |

### 4.2 Workflow Execution

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-06 | User | As a user, I want to manually trigger a workflow execution so that I can run automation on-demand | P0 |
| US-07 | User | As a user, I want to pass variables to workflow execution so that I can customize behavior for each run | P0 |
| US-08 | User | As a user, I want to specify geolocation for workflow execution so that I can access region-specific content | P1 |
| US-09 | User | As a user, I want to test a workflow without saving it so that I can validate steps before committing | P0 |
| US-10 | User | As a user, I want to cancel a running workflow execution so that I can stop processes that are taking too long | P1 |

### 4.3 Monitoring & History

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-11 | User | As a user, I want to view the execution history for my workflows so that I can track past runs | P0 |
| US-12 | User | As a user, I want to see step-by-step results for each execution so that I can understand what happened | P0 |
| US-13 | User | As a user, I want to filter execution history by status (completed, failed, cancelled) so that I can focus on specific outcomes | P1 |
| US-14 | User | As a user, I want to view extracted data from workflow executions so that I can use the results | P0 |
| US-15 | User | As a user, I want to receive notifications when workflow executions complete or fail so that I stay informed | P2 |

### 4.4 Workflow Management

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-16 | User | As a user, I want to list all my workflows with status indicators so that I can manage them efficiently | P0 |
| US-17 | User | As a user, I want to update workflow steps and configuration so that I can improve automation over time | P0 |
| US-18 | User | As a user, I want to archive (soft delete) workflows so that I can remove unused automation without losing history | P1 |
| US-19 | User | As a user, I want to duplicate a workflow so that I can create variations without starting from scratch | P2 |
| US-20 | User | As a user, I want to use workflow templates so that I can quickly set up common automation patterns | P2 |

---

## 5. Functional Requirements

### 5.1 Step Types

#### 5.1.1 Navigate Step
```typescript
{
  type: "navigate",
  order: 0,
  config: {
    url: "https://example.com/page",    // Required: Target URL (supports variable substitution)
    continueOnError: false               // Optional: Continue workflow on navigation failure
  }
}
```
**Behavior**: Navigates the browser to the specified URL. Waits for page load before proceeding.

#### 5.1.2 Act Step
```typescript
{
  type: "act",
  order: 1,
  config: {
    instruction: "Click the login button",  // Required: Natural language instruction
    modelName: "gpt-4o",                     // Optional: Override default LLM model
    continueOnError: false
  }
}
```
**Behavior**: Uses Stagehand AI to perform the described action on the current page.

#### 5.1.3 Observe Step
```typescript
{
  type: "observe",
  order: 2,
  config: {
    observeInstruction: "List all available navigation links",  // Required
    continueOnError: false
  }
}
```
**Behavior**: Uses AI to observe and return available actions/elements on the page.

#### 5.1.4 Extract Step
```typescript
{
  type: "extract",
  order: 3,
  config: {
    extractInstruction: "Extract the contact information",  // Required
    schemaType: "contactInfo" | "productInfo" | "custom",   // Optional: Predefined schema
    saveAs: "contactData",                                   // Optional: Variable name for result
    continueOnError: false
  }
}
```
**Behavior**: Extracts structured data from the page using AI. Supports predefined schemas:
- `contactInfo`: email, phone, address, name, company
- `productInfo`: name, price, description, availability, sku, rating
- `custom`: Free-form extraction

#### 5.1.5 Wait Step
```typescript
{
  type: "wait",
  order: 4,
  config: {
    waitMs: 3000,                    // Optional: Time to wait in milliseconds (max 60000)
    selector: ".loading-spinner",    // Optional: CSS selector to wait for
    continueOnError: false
  }
}
```
**Behavior**: Pauses execution for specified time or until element appears.

#### 5.1.6 Condition Step
```typescript
{
  type: "condition",
  order: 5,
  config: {
    condition: "extractedData.price < 100",  // Required: Expression to evaluate
    continueOnError: false
  }
}
```
**Behavior**: Evaluates condition using safe expression parser. Supports comparisons, logical operators, and property access. Returns `passed: true/false` in result.

#### 5.1.7 Loop Step
```typescript
{
  type: "loop",
  order: 6,
  config: {
    items: "{{productUrls}}",        // Required: Array variable or literal array
    saveAs: "__loopItem",            // Auto-set: Current item available as __loopItem
    continueOnError: false
  }
}
```
**Behavior**: Iterates over array items, setting `__loopItem` and `__loopIndex` variables for each iteration.

#### 5.1.8 API Call Step
```typescript
{
  type: "apiCall",
  order: 7,
  config: {
    url: "https://api.example.com/data",         // Required
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",  // Optional: defaults to GET
    headers: { "Authorization": "Bearer {{token}}" },      // Optional
    body: { "key": "{{value}}" },                          // Optional: For POST/PUT/PATCH
    saveAs: "apiResponse",                                  // Optional: Variable name for response
    continueOnError: false
  }
}
```
**Behavior**: Makes HTTP request and stores response. Supports variable substitution in URL, headers, and body.

#### 5.1.9 Notification Step
```typescript
{
  type: "notification",
  order: 8,
  config: {
    message: "Workflow completed: {{extractedData.count}} items processed",  // Required
    type: "info" | "success" | "warning" | "error",                          // Optional
    continueOnError: false
  }
}
```
**Behavior**: Sends notification (currently logs to console; future: email, SMS, webhook).

### 5.2 Variable Substitution

Variables use `{{variableName}}` syntax and are substituted at runtime:

```typescript
// Input variables passed at execution
variables: {
  targetUrl: "https://example.com",
  searchTerm: "automation tools"
}

// Usage in step config
{
  type: "navigate",
  config: {
    url: "{{targetUrl}}/search?q={{searchTerm}}"
  }
}
```

**Variable Sources:**
- Execution input variables
- Step results saved via `saveAs`
- Loop iteration variables (`__loopItem`, `__loopIndex`)
- Extracted data from previous steps

### 5.3 Trigger Types

| Trigger | Description | Implementation Status |
|---------|-------------|----------------------|
| `manual` | User-initiated execution via API | Implemented |
| `scheduled` | Cron-based scheduled execution | Planned (Phase 2) |
| `webhook` | External HTTP trigger | Planned (Phase 2) |
| `event` | Internal event-based trigger | Planned (Phase 3) |

### 5.4 Error Handling

1. **Step-Level Error Handling**
   - Each step can set `continueOnError: true` to proceed despite failures
   - Failed steps record error message in `stepResults`

2. **Workflow-Level Error Handling**
   - Workflow stops on first failing step (unless `continueOnError` is set)
   - Execution status set to `failed` with error message
   - Browser session cleaned up on failure

3. **Retry Logic** (Planned)
   - Configurable retry count per step
   - Exponential backoff between retries
   - Retry on specific error types

### 5.5 Execution States

```
pending -> running -> completed
                   -> failed
                   -> cancelled
```

| State | Description |
|-------|-------------|
| `pending` | Execution created, not yet started |
| `running` | Execution in progress |
| `completed` | All steps executed successfully |
| `failed` | Execution stopped due to error |
| `cancelled` | Execution cancelled by user |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| API Response Time | < 500ms | p95 latency for CRUD operations |
| Workflow Execution Start | < 5s | Time from trigger to first step execution |
| Concurrent Executions | 5 per user | Parallel workflow runs |
| Maximum Workflow Steps | 50 steps | Per workflow limit |
| Execution Timeout | 10 minutes | Maximum workflow runtime |
| Cache TTL | 5 minutes | Workflow definition cache |

### 6.2 Scalability

- Support 10,000+ concurrent active workflows system-wide
- Handle 1,000+ concurrent workflow executions
- Scale browser session infrastructure independently
- Queue-based execution for high-volume scheduled triggers

### 6.3 Reliability

| Requirement | Target |
|-------------|--------|
| Service Uptime | 99.9% |
| Execution Success Rate | 95%+ |
| Data Durability | 99.99% (execution history) |
| Browser Session Recovery | Automatic cleanup on failure |

### 6.4 Security

1. **Authentication & Authorization**
   - All endpoints require authentication
   - Users can only access their own workflows and executions
   - Protected procedures enforce user ID checks

2. **Input Validation**
   - Zod schema validation for all inputs
   - URL validation for navigate and apiCall steps
   - Safe expression parsing for conditions (no `eval`)

3. **Data Protection**
   - Variables may contain sensitive data; encrypt at rest
   - API keys in headers should use secure variable storage
   - Browser session recordings stored securely

4. **Rate Limiting**
   - Maximum 50 steps per workflow
   - Maximum 60-second wait time per step
   - Execution concurrency limits per user

### 6.5 Observability

1. **Logging**
   - Step-level execution logging
   - Error logging with stack traces
   - Performance timing for each step

2. **Metrics**
   - Execution count by status
   - Average execution duration
   - Step type usage distribution
   - Error rate by step type

3. **Tracing**
   - Execution ID correlation
   - Browser session ID mapping
   - Request tracing for debugging

---

## 7. Technical Architecture

### 7.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Workflow   │  │  Execution  │  │   Results   │              │
│  │   Builder   │  │   Monitor   │  │   Viewer    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer (tRPC)                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              workflows.ts Router                             ││
│  │  create | list | get | update | delete | execute | testRun  ││
│  │  getExecutions | getExecution | cancelExecution              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │           workflowExecution.service.ts                       ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       ││
│  │  │   Variable   │  │    Step      │  │   Result     │       ││
│  │  │ Substitution │  │  Execution   │  │  Handling    │       ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Automation Layer                      │
│  ┌──────────────────────┐  ┌───────────────────────────────────┐│
│  │     Browserbase      │  │           Stagehand               ││
│  │  ┌────────────────┐  │  │  ┌─────────┐  ┌────────────────┐  ││
│  │  │ Session Mgmt   │  │  │  │  act()  │  │   extract()    │  ││
│  │  │ Proxy/Geo      │  │  │  └─────────┘  └────────────────┘  ││
│  │  │ Recording      │  │  │  ┌─────────┐  ┌────────────────┐  ││
│  │  └────────────────┘  │  │  │observe()│  │   page.goto()  │  ││
│  └──────────────────────┘  │  └─────────┘  └────────────────┘  ││
│                            └───────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ automation_     │  │ workflow_       │  │ browser_        │  │
│  │ workflows       │  │ executions      │  │ sessions        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ extracted_data  │  │ cache_service   │                       │
│  └─────────────────┘  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Database Schema

#### automation_workflows
```sql
CREATE TABLE automation_workflows (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,                    -- Array of WorkflowStep objects
  category VARCHAR(50) DEFAULT 'custom',
  isTemplate BOOLEAN DEFAULT FALSE,
  tags JSONB,                              -- Array of strings
  version INTEGER DEFAULT 1,
  isActive BOOLEAN DEFAULT TRUE,
  executionCount INTEGER DEFAULT 0,
  lastExecutedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### workflow_executions
```sql
CREATE TABLE workflow_executions (
  id SERIAL PRIMARY KEY,
  workflowId INTEGER NOT NULL REFERENCES automation_workflows(id),
  sessionId INTEGER REFERENCES browser_sessions(id),
  userId INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',    -- pending, running, completed, failed, cancelled
  input JSONB,                             -- Input variables
  output JSONB,                            -- Final output/extracted data
  error TEXT,
  startedAt TIMESTAMP,
  completedAt TIMESTAMP,
  duration INTEGER,                        -- Execution time in milliseconds
  stepResults JSONB,                       -- Array of step execution results
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### browser_sessions
```sql
CREATE TABLE browser_sessions (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  sessionId VARCHAR(128) NOT NULL UNIQUE,  -- Browserbase session ID
  status VARCHAR(20) DEFAULT 'active',
  url TEXT,
  projectId VARCHAR(128),
  debugUrl TEXT,
  recordingUrl TEXT,
  metadata JSONB,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP
);
```

### 7.3 API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `workflows.create` | Mutation | Create new workflow | Protected |
| `workflows.list` | Query | List user workflows | Protected |
| `workflows.get` | Query | Get workflow by ID | Protected |
| `workflows.update` | Mutation | Update workflow | Protected |
| `workflows.delete` | Mutation | Soft delete workflow | Protected |
| `workflows.execute` | Mutation | Execute workflow | Protected |
| `workflows.testRun` | Mutation | Test workflow without saving | Protected |
| `workflows.getExecutions` | Query | Get execution history | Protected |
| `workflows.getExecution` | Query | Get single execution | Protected |
| `workflows.cancelExecution` | Mutation | Cancel running execution | Protected |

### 7.4 Step Execution Flow

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       ▼
┌──────────────────────────────────────┐
│  Load Workflow from DB (with cache)  │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Create Execution Record (pending)   │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Create Browser Session              │
│  (Browserbase + geolocation)         │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Initialize Stagehand                │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Create Execution Context            │
│  (variables, stepResults, etc.)      │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────────────────────────┐◄─────────────┐
│  Execute Next Step                   │              │
│  (variable substitution applied)     │              │
└──────┬───────────────────────────────┘              │
       ▼                                              │
┌──────────────────────────────────────┐              │
│  Handle Step Result                  │              │
│  - Update stepResults                │              │
│  - Save to variables if saveAs set   │              │
│  - Update execution record           │              │
└──────┬───────────────────────────────┘              │
       ▼                                              │
   ┌───────────┐                                      │
   │  Success? │                                      │
   └─────┬─────┘                                      │
         │                                            │
    Yes  │  No                                        │
    ┌────┴────┐                                       │
    │         ▼                                       │
    │    ┌────────────────┐                          │
    │    │continueOnError?│                          │
    │    └────┬───────────┘                          │
    │         │                                       │
    │    Yes  │  No                                  │
    │    ┌────┴────┐                                 │
    │    │         ▼                                 │
    │    │    ┌─────────────────────────────┐        │
    │    │    │  Mark Execution as Failed   │        │
    │    │    │  Clean up browser session   │        │
    │    │    └─────────────────────────────┘        │
    │    │                                           │
    ▼    ▼                                           │
┌──────────────────────────────────────┐             │
│  More Steps?                         │─────Yes────►│
└──────┬───────────────────────────────┘
       │ No
       ▼
┌──────────────────────────────────────┐
│  Mark Execution as Completed         │
│  - Update workflow stats             │
│  - Close browser session             │
│  - Return final results              │
└──────────────────────────────────────┘
```

---

## 8. Dependencies

### 8.1 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| **Browserbase** | Browser session management, proxies, geolocation | Yes |
| **Stagehand** | AI-powered browser automation (act, observe, extract) | Yes |
| **OpenAI/Anthropic/Gemini** | LLM for AI actions | Yes (one required) |
| **PostgreSQL** | Data persistence | Yes |
| **Redis** | Caching and rate limiting | Recommended |

### 8.2 Internal Dependencies

| Component | Purpose |
|-----------|---------|
| `server/_core/browserbase.ts` | Browserbase service wrapper |
| `server/_core/browserbaseSDK.ts` | Session creation and management |
| `server/_core/variableSubstitution.ts` | Variable replacement utility |
| `server/lib/safeExpressionParser.ts` | Secure condition evaluation |
| `server/services/cache.service.ts` | Workflow definition caching |
| `drizzle/schema.ts` | Database schema definitions |

### 8.3 NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `@browserbasehq/stagehand` | ^1.x | Browser automation SDK |
| `zod` | ^3.x | Schema validation |
| `@trpc/server` | ^10.x | API framework |
| `drizzle-orm` | ^0.x | Database ORM |

---

## 9. Out of Scope

The following items are explicitly out of scope for Phase 1:

### 9.1 Phase 1 Exclusions

1. **Scheduled Triggers** - Cron-based workflow scheduling (Phase 2)
2. **Webhook Triggers** - External HTTP trigger endpoints (Phase 2)
3. **Event Triggers** - Internal event-based automation (Phase 3)
4. **Workflow Versioning UI** - Version history and rollback interface (Phase 2)
5. **Template Marketplace** - Sharing and discovering workflow templates (Phase 3)
6. **Parallel Step Execution** - Running multiple steps simultaneously (Phase 2)
7. **Sub-workflow Calls** - Calling one workflow from another (Phase 3)
8. **Visual Workflow Builder** - Drag-and-drop workflow designer (Phase 2)
9. **Advanced Retry Logic** - Exponential backoff, retry policies (Phase 2)
10. **Execution Notifications** - Email/SMS alerts on completion/failure (Phase 2)

### 9.2 Technical Limitations

1. **File Downloads** - Handling downloaded files from browser sessions
2. **Multi-tab Automation** - Managing multiple browser tabs
3. **Authentication Persistence** - Sharing login sessions across workflows
4. **PDF/Document Processing** - Extracting data from uploaded documents
5. **Video/Audio Processing** - Handling media files

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Browserbase Rate Limits** | Executions blocked | Medium | Implement queuing, session pooling, user quotas |
| **AI Action Failures** | Steps fail unexpectedly | High | Provide clear instructions, add retry logic, allow manual fallback |
| **Website Structure Changes** | Extractions break | High | Monitor failure rates, alert users, suggest selector updates |
| **Long-Running Executions** | Timeouts, resource exhaustion | Medium | Implement checkpointing, timeout warnings, cleanup routines |
| **Variable Injection Attacks** | Security vulnerabilities | Low | Strict input validation, safe expression parser |

### 10.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Low Adoption** | Feature underutilized | Medium | User education, templates, onboarding tutorials |
| **High Support Load** | Team overwhelmed | Medium | Self-service debugging tools, detailed documentation |
| **Cost Overruns** | Browser sessions expensive | Medium | Usage quotas, tiered pricing, session optimization |
| **Competitor Features** | Users leave for alternatives | Low | Rapid iteration, unique AI capabilities |

### 10.3 Compliance Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Terms of Service Violations** | Users scrape prohibited sites | Medium | User guidelines, blocked domain list, audit logs |
| **Data Privacy** | Extracted data contains PII | High | Data handling policies, encryption, retention limits |
| **Robot Exclusion** | Ignore robots.txt | Low | Honor robots.txt where appropriate, user education |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Functionality (Weeks 1-4)

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| 1 | API Foundation | CRUD endpoints, database schema, validation |
| 2 | Execution Engine | Step handlers (navigate, act, observe, extract, wait) |
| 3 | Advanced Steps | Condition, loop, apiCall, notification steps |
| 4 | Polish & Testing | Error handling, test run feature, integration tests |

### 11.2 Phase 2: Enhanced Features (Weeks 5-8)

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| 5 | Scheduled Triggers | Cron integration, scheduler service |
| 6 | Webhook Triggers | HTTP endpoints, payload validation |
| 7 | Workflow Templates | Template library, import/export |
| 8 | Visual Builder | Drag-and-drop UI, step configuration panels |

### 11.3 Phase 3: Scale & Enterprise (Weeks 9-12)

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| 9 | Event Triggers | Internal event system, trigger configuration |
| 10 | Advanced Retry | Retry policies, exponential backoff |
| 11 | Template Marketplace | Community templates, ratings, search |
| 12 | Enterprise Features | Team workflows, role-based access, audit logs |

---

## 12. Acceptance Criteria

### 12.1 Workflow CRUD Operations

- [ ] **AC-01**: User can create a workflow with name, description, and at least 1 step
- [ ] **AC-02**: User can list all their workflows with pagination and status filtering
- [ ] **AC-03**: User can retrieve a single workflow with all step configurations
- [ ] **AC-04**: User can update workflow name, description, and steps
- [ ] **AC-05**: User can soft-delete (archive) a workflow
- [ ] **AC-06**: Workflows support up to 50 steps
- [ ] **AC-07**: All step types validate their required configuration fields

### 12.2 Workflow Execution

- [ ] **AC-08**: User can execute a workflow and receive an execution ID
- [ ] **AC-09**: Execution creates browser session with specified geolocation
- [ ] **AC-10**: Steps execute sequentially in order
- [ ] **AC-11**: Variable substitution works in all supported config fields
- [ ] **AC-12**: Failed steps stop execution unless `continueOnError` is true
- [ ] **AC-13**: Execution status updates in real-time (pending -> running -> completed/failed)
- [ ] **AC-14**: User can cancel a running execution
- [ ] **AC-15**: Browser session is cleaned up on completion, failure, or cancellation

### 12.3 Step Type Functionality

- [ ] **AC-16**: Navigate step successfully loads target URL
- [ ] **AC-17**: Act step performs AI-described action on page
- [ ] **AC-18**: Observe step returns available page actions
- [ ] **AC-19**: Extract step returns structured data using schemas
- [ ] **AC-20**: Wait step pauses for specified time or element
- [ ] **AC-21**: Condition step evaluates expressions and returns passed/failed
- [ ] **AC-22**: Loop step iterates over array and sets __loopItem/__loopIndex
- [ ] **AC-23**: API Call step makes HTTP request and stores response
- [ ] **AC-24**: Notification step logs message with type

### 12.4 Test Run Feature

- [ ] **AC-25**: User can test workflow steps without creating a saved workflow
- [ ] **AC-26**: Test run returns step-by-step results with timing
- [ ] **AC-27**: Test run cleans up browser session on completion or failure
- [ ] **AC-28**: Test run supports stepByStep mode with delays

### 12.5 Execution History

- [ ] **AC-29**: User can list execution history for a workflow
- [ ] **AC-30**: Execution history supports status filtering and pagination
- [ ] **AC-31**: User can retrieve detailed execution with step results
- [ ] **AC-32**: Execution includes extracted data and final variables

### 12.6 Error Handling

- [ ] **AC-33**: Validation errors return clear, actionable messages
- [ ] **AC-34**: Step failures include error details in stepResults
- [ ] **AC-35**: Workflow-level errors update execution status to "failed"
- [ ] **AC-36**: Condition evaluation errors are logged but don't crash workflow

### 12.7 Performance & Security

- [ ] **AC-37**: API endpoints respond within 500ms for CRUD operations
- [ ] **AC-38**: Users can only access their own workflows and executions
- [ ] **AC-39**: Condition expressions use safe parser (no eval)
- [ ] **AC-40**: Workflow definitions are cached for 5 minutes

---

## Appendix A: Step Configuration Reference

### A.1 Common Configuration Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | enum | Required | Step type identifier |
| `order` | integer | Required | Execution order (0-based) |
| `config.continueOnError` | boolean | false | Continue workflow on step failure |
| `config.saveAs` | string | - | Variable name to store step result |
| `config.modelName` | string | - | Override LLM model for AI steps |

### A.2 Variable Substitution Examples

```typescript
// Simple variable
"{{username}}"

// Nested object property
"{{user.profile.email}}"

// Array access
"{{items[0].name}}"

// In URL
"https://api.example.com/users/{{userId}}"

// In condition
"{{extractedData.price}} < 100"

// In API body
{
  "name": "{{formData.name}}",
  "email": "{{formData.email}}"
}
```

---

## Appendix B: Error Codes Reference

| Code | Description | Resolution |
|------|-------------|------------|
| `WORKFLOW_NOT_FOUND` | Workflow ID does not exist or unauthorized | Verify workflow ID and permissions |
| `WORKFLOW_INACTIVE` | Workflow is archived/disabled | Reactivate workflow or use active one |
| `EXECUTION_NOT_FOUND` | Execution ID does not exist | Verify execution ID |
| `INVALID_STEP_CONFIG` | Step configuration validation failed | Check required fields for step type |
| `BROWSER_SESSION_FAILED` | Could not create browser session | Check Browserbase credentials and quotas |
| `STEP_EXECUTION_FAILED` | Step failed during execution | Review step configuration and page state |
| `EXECUTION_TIMEOUT` | Workflow exceeded time limit | Optimize workflow or increase timeout |
| `EXECUTION_CANCELLED` | Execution was cancelled by user | N/A - expected behavior |

---

## Appendix C: Related Documentation

- [Browser Automation PRD](./01-browser-automation.md)
- [Data Extraction PRD](./02-data-extraction.md)
- [Scheduled Tasks PRD](./04-scheduled-tasks.md)
- [API Reference](/docs/api/workflows.md)
- [User Guide: Creating Workflows](/docs/guides/workflow-creation.md)
