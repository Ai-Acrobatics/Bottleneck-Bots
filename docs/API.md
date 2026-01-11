# Bottleneck-Bots API Documentation

This document provides comprehensive documentation for the Bottleneck-Bots tRPC API. All endpoints use tRPC protocol and require authentication unless otherwise noted.

## Table of Contents

- [Authentication](#authentication)
- [Auth Router](#auth-router)
- [Workflows Router](#workflows-router)
- [Agency Tasks Router](#agency-tasks-router)
- [Browser Router](#browser-router)
- [Onboarding Router](#onboarding-router)
- [Settings Router](#settings-router)
- [Error Codes](#error-codes)
- [Common Types](#common-types)

---

## Authentication

Most endpoints require authentication. The API uses session-based authentication with cookies. Users must be logged in to access protected procedures.

- **Public Procedures**: Available without authentication
- **Protected Procedures**: Require valid session cookie (`COOKIE_NAME`)

---

## Auth Router

Basic authentication management endpoints.

### `auth.me`

Get the currently authenticated user.

**Type:** Query (Public)

**Input:** None

**Response:**
```typescript
{
  id: number;
  email: string;
  name: string | null;
  onboardingCompleted: boolean;
  // ... other user fields
} | null
```

**Example:**
```typescript
const user = await trpc.auth.me.query();
```

---

### `auth.logout`

Log out the current user by clearing the session cookie.

**Type:** Mutation (Public)

**Input:** None

**Response:**
```typescript
{
  success: true;
}
```

**Example:**
```typescript
await trpc.auth.logout.mutate();
```

---

## Workflows Router

Manage automation workflows with browser automation capabilities.

### `workflows.create`

Create a new automation workflow.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  name: string;           // 1-255 characters
  description?: string;   // max 1000 characters
  trigger: "manual" | "scheduled" | "webhook" | "event";  // default: "manual"
  steps: WorkflowStep[];  // 1-50 steps required
  geolocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
}
```

**WorkflowStep Schema:**
```typescript
{
  type: "navigate" | "act" | "observe" | "extract" | "wait" | "condition" | "loop" | "apiCall" | "notification";
  order: number;          // 0 or greater
  config: {
    // Navigation step
    url?: string;

    // Action step (act)
    instruction?: string;

    // Observation step (observe)
    observeInstruction?: string;

    // Extraction step (extract)
    extractInstruction?: string;
    schemaType?: "contactInfo" | "productInfo" | "custom";

    // Wait step
    waitMs?: number;      // 0-60000ms
    selector?: string;    // CSS selector to wait for

    // Condition step
    condition?: string;

    // Loop step
    items?: any[];

    // API Call step
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    body?: any;
    saveAs?: string;

    // Notification step
    message?: string;
    type?: "info" | "success" | "warning" | "error";

    // Common
    modelName?: string;
    continueOnError?: boolean;  // default: false
  };
}
```

**Response:**
```typescript
{
  id: number;
  userId: number;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**
```typescript
const workflow = await trpc.workflows.create.mutate({
  name: "Scrape Contact Info",
  description: "Extract contact information from a website",
  trigger: "manual",
  steps: [
    {
      type: "navigate",
      order: 0,
      config: { url: "https://example.com/contact" }
    },
    {
      type: "extract",
      order: 1,
      config: {
        extractInstruction: "Extract all contact information",
        schemaType: "contactInfo"
      }
    }
  ]
});
```

---

### `workflows.list`

List all workflows for the authenticated user.

**Type:** Query (Protected)

**Input:**
```typescript
{
  status?: "active" | "paused" | "archived";
  limit?: number;   // 1-100, default: 50
  offset?: number;  // default: 0
}
```

**Response:**
```typescript
Array<{
  id: number;
  userId: number;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  isActive: boolean;
  stepCount: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

### `workflows.get`

Get a single workflow by ID.

**Type:** Query (Protected)

**Input:**
```typescript
{
  id: number;  // positive integer
}
```

**Response:** Single workflow object (same as create response)

**Error Codes:**
- `NOT_FOUND`: Workflow not found or not owned by user

---

### `workflows.update`

Update an existing workflow.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number;                  // required
  name?: string;               // 1-255 characters
  description?: string;        // max 1000 characters
  trigger?: "manual" | "scheduled" | "webhook" | "event";
  status?: "active" | "paused" | "archived";
  steps?: WorkflowStep[];      // 1-50 steps
}
```

**Response:** Updated workflow object

---

### `workflows.delete`

Soft delete (archive) a workflow.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number;  // positive integer
}
```

**Response:**
```typescript
{
  success: true;
  id: number;
}
```

---

### `workflows.execute`

Execute a workflow and run all steps.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  workflowId: number;
  geolocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
  variables?: Record<string, any>;  // Dynamic variables for workflow
}
```

**Response:**
```typescript
{
  success: boolean;
  executionId: number;
  workflowId: number;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  stepResults: any[];
  output: any;
}
```

---

### `workflows.getExecutions`

Get execution history for a workflow.

**Type:** Query (Protected)

**Input:**
```typescript
{
  workflowId: number;
  status?: "pending" | "running" | "completed" | "failed" | "cancelled";
  limit?: number;   // 1-100, default: 20
  offset?: number;  // default: 0
}
```

**Response:** Array of execution records

---

### `workflows.getExecution`

Get a single execution by ID.

**Type:** Query (Protected)

**Input:**
```typescript
{
  executionId: number;
}
```

---

### `workflows.cancelExecution`

Cancel a running workflow execution.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  executionId: number;
}
```

**Response:**
```typescript
{
  success: true;
  executionId: number;
}
```

---

### `workflows.testRun`

Test run a workflow without saving to database.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  steps: WorkflowStep[];  // 1-50 steps
  variables?: Record<string, any>;
  geolocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
  stepByStep?: boolean;   // default: false
}
```

**Response:**
```typescript
{
  success: boolean;
  status: string;
  stepResults: any[];
  output: any;
  error?: string;
}
```

---

## Agency Tasks Router

Manage agency tasks with human review and automatic execution capabilities.

### `agencyTasks.create`

Create a new task.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  title: string;                    // 1-500 characters
  description?: string;             // max 5000 characters
  category?: string;                // max 100 chars, default: "general"
  taskType: "browser_automation" | "api_call" | "notification" | "reminder" | "ghl_action" | "data_extraction" | "report_generation" | "custom";
  priority?: "low" | "medium" | "high" | "critical";  // default: "medium"
  urgency?: "normal" | "soon" | "urgent" | "immediate";  // default: "normal"
  assignedToBot?: boolean;          // default: true
  requiresHumanReview?: boolean;    // default: false
  executionType?: "automatic" | "manual_trigger" | "scheduled";  // default: "automatic"
  executionConfig?: Record<string, any>;
  scheduledFor?: string;            // ISO datetime
  deadline?: string;                // ISO datetime
  dependsOn?: number[];             // Task IDs this depends on
  tags?: string[];
  metadata?: Record<string, any>;
}
```

**Response:** Created task object

**Note:** If `executionType` is "automatic", `assignedToBot` is true, `requiresHumanReview` is false, and `scheduledFor` is not set, the task will auto-execute immediately.

---

### `agencyTasks.list`

List tasks with filtering options.

**Type:** Query (Protected)

**Input:**
```typescript
{
  status?: "pending" | "queued" | "in_progress" | "waiting_input" | "completed" | "failed" | "cancelled" | "deferred";
  statuses?: string[];              // Multiple status filter
  priority?: "low" | "medium" | "high" | "critical";
  category?: string;
  taskType?: string;
  assignedToBot?: boolean;
  requiresHumanReview?: boolean;
  scheduledBefore?: string;         // ISO datetime
  scheduledAfter?: string;          // ISO datetime
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "scheduledFor" | "deadline";  // default: "createdAt"
  sortOrder?: "asc" | "desc";       // default: "desc"
  limit?: number;                   // 1-100, default: 50
  offset?: number;                  // default: 0
}
```

**Response:**
```typescript
{
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}
```

---

### `agencyTasks.get`

Get a single task with executions and source message.

**Type:** Query (Protected)

**Input:**
```typescript
{
  id: number;
}
```

**Response:**
```typescript
{
  ...task,
  executions: TaskExecution[];      // Last 10 executions
  sourceMessage: InboundMessage | null;
}
```

---

### `agencyTasks.update`

Update a task.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  urgency?: string;
  status?: string;
  statusReason?: string;            // max 500 chars
  assignedToBot?: boolean;
  requiresHumanReview?: boolean;
  executionType?: string;
  executionConfig?: Record<string, any>;
  scheduledFor?: string | null;
  deadline?: string | null;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

---

### `agencyTasks.delete`

Cancel a task (soft delete).

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number;
}
```

**Response:**
```typescript
{
  success: true;
  id: number;
}
```

---

### `agencyTasks.approve`

Approve a task for execution (human review).

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number;
  notes?: string;  // max 1000 chars
}
```

**Error Codes:**
- `BAD_REQUEST`: Task does not require human review

---

### `agencyTasks.reject`

Reject a task (human review).

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number;
  reason: string;  // 1-1000 characters, required
}
```

---

### `agencyTasks.execute`

Manually trigger task execution.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  id: number;
}
```

**Response:**
```typescript
{
  success: true;
  taskId: number;
  message: "Task execution started";
}
```

**Error Codes:**
- `BAD_REQUEST`: Task is already in progress, completed, or requires human review

---

### `agencyTasks.getStats`

Get task statistics dashboard.

**Type:** Query (Protected)

**Input:** None

**Response:**
```typescript
{
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  pendingReview: number;
  overdue: number;
  scheduledToday: number;
}
```

---

### `agencyTasks.getExecutions`

Get execution history for a task.

**Type:** Query (Protected)

**Input:**
```typescript
{
  taskId: number;
  limit?: number;   // 1-100, default: 20
  offset?: number;  // default: 0
}
```

---

### `agencyTasks.getTaskQueue`

Get task queue with filtering.

**Type:** Query (Protected)

**Input:**
```typescript
{
  filter?: "all" | "running" | "pending" | "scheduled";
  limit?: number;  // 1-100, default: 50
}
```

**Response:**
```typescript
{
  tasks: Array<Task & {
    isRunning: boolean;
    queuePosition?: number;
  }>;
  counts: {
    running: number;
    pending: number;
    scheduled: number;
  };
}
```

---

## Browser Router

Control browser sessions with AI-powered automation via Browserbase and Stagehand.

### `browser.createSession`

Create a new browser session.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  geolocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
  browserSettings?: {
    viewport?: {
      width: number;   // 320-3840, default: 1920
      height: number;  // 240-2160, default: 1080
    };
    blockAds?: boolean;       // default: true
    solveCaptchas?: boolean;  // default: true
    advancedStealth?: boolean; // default: false
  };
  recordSession?: boolean;    // default: true
  keepAlive?: boolean;        // default: true
  timeout?: number;           // 60-7200 seconds, default: 3600
  cacheDir?: string;          // Enable 10-100x faster subsequent runs
  selfHeal?: boolean;         // Adapt to minor page changes, default: false
}
```

**Response:**
```typescript
{
  sessionId: string;
  debugUrl: string;
  wsUrl: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}
```

---

### `browser.navigateTo`

Navigate to a URL.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  url: string;                // valid URL
  waitUntil?: "load" | "domcontentloaded" | "networkidle";  // default: "load"
  timeout?: number;           // 1000-60000ms, default: 30000
}
```

---

### `browser.clickElement`

Click an element using selector or AI instruction.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  selector: string;
  instruction?: string;       // AI fallback instruction
  waitForNavigation?: boolean; // default: false
  timeout?: number;           // 1000-30000ms, default: 10000
}
```

---

### `browser.typeText`

Type text into an input field.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  selector: string;
  text: string;
  instruction?: string;       // AI fallback instruction
  delay?: number;             // 0-1000ms typing delay, default: 0
  clearFirst?: boolean;       // default: false
}
```

---

### `browser.scrollTo`

Scroll to a position on the page.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  position: "top" | "bottom" | { x: number; y: number };
  smooth?: boolean;           // default: true
}
```

---

### `browser.extractData`

Extract data from the page using AI.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  instruction: string;
  schemaType?: "contactInfo" | "productInfo" | "tableData" | "custom";
  selector?: string;          // Narrow extraction scope
  saveToDatabase?: boolean;   // default: true
  tags?: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  data: any;
  url: string;
  savedToDatabase: boolean;
  recordId?: number;
  timestamp: Date;
}
```

---

### `browser.takeScreenshot`

Take a screenshot of the page.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  fullPage?: boolean;         // default: false
  selector?: string;          // Capture specific element
  quality?: number;           // 0-100, default: 80
}
```

**Response:**
```typescript
{
  success: boolean;
  screenshot: string;         // Base64 data URL
  size: number;
  timestamp: Date;
}
```

---

### `browser.act`

Perform an AI-powered action.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  instruction: string;
  modelName?: string;
  waitForNavigation?: boolean;  // default: false
}
```

---

### `browser.observe`

Observe page elements and get available actions.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  instruction: string;
  modelName?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  actions: ObservedAction[];
  timestamp: Date;
}
```

---

### `browser.batchActions`

Optimized batch actions using observe + act pattern (2-3x faster).

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  instruction: string;
  actionType?: "click" | "type" | "select";  // default: "click"
  textToType?: string;        // For type actions
  maxActions?: number;        // 1-20, default: 10
}
```

**Response:**
```typescript
{
  success: boolean;
  elementsFound: number;
  actionsPerformed: number;
  results: Array<{
    element: string;
    success: boolean;
    error?: string;
  }>;
  timing: {
    observeTimeMs: number;
    actTimeMs: number;
    totalTimeMs: number;
  };
  timestamp: Date;
}
```

---

### `browser.optimizeDOM`

Clean up DOM for faster processing (20-40% speed improvement).

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  removeVideos?: boolean;       // default: true
  removeIframes?: boolean;      // default: true
  disableAnimations?: boolean;  // default: true
  removeHiddenElements?: boolean; // default: false
}
```

---

### `browser.fastAct`

Fast action with reduced timeout (5s default).

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  instruction: string;
  timeout?: number;  // 1000-30000ms, default: 5000
}
```

---

### `browser.fastNavigate`

Fast navigation with domcontentloaded default.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  url: string;
  waitUntil?: "domcontentloaded" | "load" | "networkidle";  // default: "domcontentloaded"
  timeout?: number;       // 1000-30000ms, default: 15000
  optimizeDOM?: boolean;  // default: false
}
```

---

### `browser.closeSession`

Close and cleanup a browser session.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
}
```

---

### `browser.deleteSession`

Delete a browser session from database.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
}
```

---

### `browser.listSessions`

List user's browser sessions.

**Type:** Query (Protected)

**Input:**
```typescript
{
  status?: "active" | "completed" | "failed" | "expired";
  limit?: number;   // 1-100, default: 20
  offset?: number;  // default: 0
}
```

---

### `browser.getDebugUrl`

Get session debug/live view URL.

**Type:** Query (Protected)

**Input:**
```typescript
{
  sessionId: string;
}
```

---

### `browser.getRecording`

Get session recording URL.

**Type:** Query (Protected)

**Input:**
```typescript
{
  sessionId: string;
}
```

---

### `browser.getSessionMetrics`

Get session metrics and cost.

**Type:** Query (Protected)

**Input:**
```typescript
{
  sessionId: string;
}
```

---

### `browser.agentExecute`

Execute an autonomous agent task.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  sessionId: string;
  instruction: string;
  maxSteps?: number;          // 1-100, default: 20
  systemPrompt?: string;
  model?: string;             // e.g., "google/gemini-2.0-flash"
  cua?: boolean;              // Computer Use Agent mode, default: false
  integrations?: string[];    // MCP integration URLs
}
```

---

## Onboarding Router

Handle user onboarding and business information collection.

### `onboarding.validateGHLApiKey`

Validate a GoHighLevel API key.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  apiKey: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  details?: any;
}
```

---

### `onboarding.submit`

Submit onboarding data and create user profile.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  fullName: string;
  companyName: string;
  phoneNumber: string;
  industry: "marketing-agency" | "real-estate" | "healthcare" | "ecommerce" | "saas" | "other";
  monthlyRevenue: "0-10k" | "10k-50k" | "50k-100k" | "100k-500k" | "500k+";
  employeeCount: "just-me" | "2-5" | "6-20" | "21-50" | "50+";
  websiteUrl?: string;        // Valid URL or empty
  goals: string[];            // At least one required
  otherGoal?: string;
  ghlApiKey?: string;         // Optional, can add later
}
```

**Response:**
```typescript
{
  success: true;
  message: "Onboarding completed successfully";
  data: {
    companyName: string;
    industry: string;
  };
}
```

---

### `onboarding.getProfile`

Get existing onboarding profile data.

**Type:** Query (Protected)

**Input:** None

**Response:**
```typescript
{
  exists: boolean;
  data: {
    id: number;
    companyName: string;
    industry: string;
    monthlyRevenue: string;
    employeeCount: string;
    website: string | null;
    phone: string;
    goals: string[];
    createdAt: Date;
    updatedAt: Date;
  } | null;
}
```

---

### `onboarding.getStatus`

Check if user has completed onboarding.

**Type:** Query (Protected)

**Input:** None

**Response:**
```typescript
{
  completed: boolean;
}
```

---

### `onboarding.uploadBrandAssets`

Upload brand assets (logo and guidelines) to S3.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  logoBase64?: string;
  logoMimeType?: string;
  logoFileName?: string;
  guidelinesBase64?: Array<{
    data: string;
    mimeType: string;
    fileName: string;
  }>;
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
  assets: Array<{
    id: string;
    originalName: string;
    optimizedName: string;
    url: string;
    altText: string;
    contextTag: "LOGO" | "HERO" | "TEAM" | "TESTIMONIAL" | "PRODUCT" | "UNKNOWN";
    status: "ready";
  }>;
}
```

---

### `onboarding.saveBrandVoice`

Save brand voice to user's default client profile.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  brandVoice: string;         // Required
  companyName?: string;
  assets?: Array<{
    id: string;
    originalName: string;
    optimizedName: string;
    url: string;
    altText: string;
    contextTag: "HERO" | "TEAM" | "TESTIMONIAL" | "PRODUCT" | "LOGO" | "UNKNOWN";
    status: "uploading" | "optimizing" | "ready";
  }>;
}
```

---

### `onboarding.initializeIntegrations`

Initialize selected integrations.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  integrations: string[];
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
  integrations: string[];  // Actually initialized integrations
}
```

---

## Settings Router

Manage API keys, OAuth integrations, and user preferences.

### API Keys Management

#### `settings.listApiKeys`

List all configured API keys (masked).

**Type:** Query (Protected)

**Input:** None

**Response:**
```typescript
{
  apiKeys: Array<{
    service: string;
    maskedKey: string;
    isConfigured: boolean;
    createdAt: Date;
  }>;
}
```

---

#### `settings.validateApiKey`

Validate an API key before saving.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  service: "openai" | "browserbase" | "anthropic" | "google" | "stripe" | "twilio" | "sendgrid" | "gohighlevel" | "vapi" | "apify" | "custom";
  apiKey: string;
  accountSid?: string;  // Required for Twilio
  authToken?: string;   // Required for Twilio
}
```

---

#### `settings.saveApiKey`

Save an encrypted API key.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  service: string;
  apiKey: string;
  label?: string;
}
```

---

#### `settings.deleteApiKey`

Delete an API key.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  service: string;
}
```

---

#### `settings.testApiKey`

Test a saved API key with real service validation.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  service: string;
}
```

---

### OAuth Integrations

#### `settings.listIntegrations`

List all OAuth integrations.

**Type:** Query (Protected)

**Input:** None

**Response:**
```typescript
{
  integrations: Array<{
    id: number;
    service: string;
    isActive: string;
    expiresAt: Date | null;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
    isExpired: boolean;
  }>;
}
```

---

#### `settings.initiateOAuth`

Initiate OAuth flow.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  provider: "google" | "gmail" | "outlook" | "facebook" | "instagram" | "linkedin";
}
```

**Response:**
```typescript
{
  success: true;
  authorizationUrl: string;
  state: string;
}
```

---

#### `settings.handleOAuthCallback`

Handle OAuth callback and exchange code for tokens.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  provider: string;
  code: string;
  state: string;
  codeVerifier: string;
}
```

---

#### `settings.refreshOAuthToken`

Refresh an OAuth token.

**Type:** Mutation (Protected)

**Input:**
```typescript
{
  integrationId: number;
}
```

---

## Error Codes

The API uses standard tRPC error codes:

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid input parameters |
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Not authorized for this action |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `INTERNAL_SERVER_ERROR` | Server error |
| `TIMEOUT` | Request timeout |

Example error response:
```typescript
{
  error: {
    code: "NOT_FOUND",
    message: "Workflow not found"
  }
}
```

---

## Common Types

### Priority Levels
```typescript
type Priority = "low" | "medium" | "high" | "critical";
```

### Urgency Levels
```typescript
type Urgency = "normal" | "soon" | "urgent" | "immediate";
```

### Task Status
```typescript
type TaskStatus = "pending" | "queued" | "in_progress" | "waiting_input" | "completed" | "failed" | "cancelled" | "deferred";
```

### Execution Status
```typescript
type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
```

### Task Types
```typescript
type TaskType = "browser_automation" | "api_call" | "notification" | "reminder" | "ghl_action" | "data_extraction" | "report_generation" | "custom";
```

### Pagination
Most list endpoints support standard pagination:
```typescript
{
  limit: number;   // Items per page (usually 1-100)
  offset: number;  // Number of items to skip
}
```

---

## Additional Routers

The API includes many additional routers not fully documented here:

- **`ai`** - AI generation and chat endpoints
- **`email`** - Email sending and management
- **`voice`** - Voice call management
- **`seo`** - SEO analysis tools
- **`ads`** - Ad campaign management
- **`marketplace`** - Marketplace integrations
- **`templates`** - Template management
- **`quiz`** - Quiz builder
- **`aiCalling`** - AI calling features
- **`credits`** - Credit management
- **`leadEnrichment`** - Lead enrichment services
- **`scheduledTasks`** - Scheduled task management
- **`rag`** - RAG (Retrieval Augmented Generation)
- **`alerts`** - Alert management
- **`analytics`** - Analytics dashboard
- **`webhooks`** - Webhook management
- **`clientProfiles`** - Client profile management
- **`subAccounts`** - Sub-account management
- **`admin`** - Admin dashboard
- **`agent`** - Autonomous agent management
- **`agentPermissions`** - Agent permissions
- **`agentMemory`** - Agent memory/training
- **`webdev`** - Web development projects
- **`deployment`** - Deployment management
- **`mcp`** - Model Context Protocol
- **`swarm`** - Multi-agent swarm coordination
- **`knowledge`** - Knowledge management
- **`subscription`** - Subscription billing
- **`memory`** - Memory management system
- **`tools`** - Tools execution engine
- **`costs`** - Cost tracking
- **`health`** - Health checks

For documentation on these routers, refer to the source code in `/server/api/routers/`.
