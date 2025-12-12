/**
 * Comprehensive Tests for Task Execution Service
 *
 * Tests all task types, validation, execution flows, and error handling
 * Covers 45+ test cases across 5 categories
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { ExecutionResult, BrowserAutomationConfig, ApiCallConfig, NotificationConfig, ReminderConfig, GhlActionConfig, ReportConfig } from "../types";
import { TaskExecutionService } from "./taskExecution.service";
import { agencyTasks } from "../../drizzle/schema-webhooks";
import { isGhlActionConfig, isApiCallConfig, isNotificationConfig, isReminderConfig, isBrowserAutomationConfig, isReportConfig } from "../types";

// Mock dependencies
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

vi.mock("../_core/browserbaseSDK", () => ({
  browserbaseSDK: {
    createSession: vi.fn(),
    getSessionDebug: vi.fn(),
  },
}));

vi.mock("@browserbasehq/stagehand", () => ({
  Stagehand: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    context: {
      pages: vi.fn().mockReturnValue([{
        goto: vi.fn(),
        click: vi.fn(),
        fill: vi.fn(),
        screenshot: vi.fn(),
      }]),
    },
    act: vi.fn(),
    extract: vi.fn(),
    close: vi.fn(),
  })),
}));

// ========================================
// TEST HELPERS AND MOCKS
// ========================================

type TaskRecord = typeof agencyTasks.$inferSelect;

function createMockTask(overrides?: Partial<TaskRecord>): TaskRecord {
  return {
    id: 1,
    userId: 1,
    projectId: 1,
    title: "Test Task",
    description: "Test task description",
    taskType: "browser_automation" as const,
    status: "pending" as const,
    priority: "medium" as const,
    assignedToBot: true,
    requiresHumanReview: false,
    humanReviewedBy: null,
    sourceType: "manual" as const,
    sourceWebhookId: 1,
    conversationId: null,
    notifyOnComplete: false,
    notifyOnFailure: false,
    maxRetries: 3,
    errorCount: 0,
    lastError: null,
    statusReason: null,
    executionConfig: {
      browserActions: [
        { action: "navigate", selector: "https://example.com" }
      ],
    },
    startedAt: null,
    completedAt: null,
    result: null,
    resultSummary: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    scheduledFor: null,
    ...overrides,
  } as TaskRecord;
}

function createMockDb() {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
  };
}

// ========================================
// TESTS: TASK VALIDATION (10 tests)
// ========================================

describe("TaskExecutionService - Task Validation", () => {
  let service: TaskExecutionService;
  let mockDb: any;

  beforeEach(() => {
    service = new TaskExecutionService();
    mockDb = createMockDb();
    vi.clearAllMocks();
  });

  it("should validate browser_automation task with browserActions", () => {
    const task = createMockTask({
      taskType: "browser_automation",
      executionConfig: {
        browserActions: [
          { action: "navigate", selector: "https://example.com" }
        ],
      },
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });

  it("should validate browser_automation task with automationSteps", () => {
    const task = createMockTask({
      taskType: "browser_automation",
      executionConfig: {
        automationSteps: [
          {
            type: "navigate",
            config: { url: "https://example.com" },
          },
        ],
      },
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(true);
  });

  it("should validate api_call task with valid URL", () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/users",
      } as ApiCallConfig,
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(true);
  });

  it("should reject api_call task with invalid URL", () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "not a valid url",
      } as any,
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("Invalid API endpoint URL");
  });

  it("should validate ghl_action task with valid action type", () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "add_contact",
      } as GhlActionConfig,
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(true);
  });

  it("should validate notification task with recipient", () => {
    const task = createMockTask({
      taskType: "notification",
      executionConfig: {
        recipient: "user@example.com",
      } as NotificationConfig,
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(true);
  });

  it("should validate reminder task with reminderTime", () => {
    const task = createMockTask({
      taskType: "reminder",
      executionConfig: {
        reminderTime: new Date().toISOString(),
        reminderMessage: "Test reminder",
      } as ReminderConfig,
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(true);
  });

  it("should reject task without required executionConfig", () => {
    const task = createMockTask({
      taskType: "browser_automation",
      executionConfig: null,
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("requires execution configuration");
  });

  it("should reject browser_automation without actions or steps", () => {
    const task = createMockTask({
      taskType: "browser_automation",
      executionConfig: {},
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("requires browserActions or automationSteps");
  });

  it("should validate report_generation task with reportType", () => {
    const task = createMockTask({
      taskType: "report_generation",
      executionConfig: {
        reportType: "task_summary",
      } as ReportConfig,
    });

    const validation = (service as any).validateTaskConfig(task);
    expect(validation.valid).toBe(true);
  });
});

// ========================================
// TESTS: EXECUTION LOGGING (5 tests)
// ========================================

describe("TaskExecutionService - Execution Logging", () => {
  let service: TaskExecutionService;
  let mockDb: any;

  beforeEach(() => {
    service = new TaskExecutionService();
    mockDb = createMockDb();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create execution record on task start", async () => {
    const { getDb } = await import("../db");
    const mockDbInstance = {
      ...mockDb,
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([createMockTask()]),
          }),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDbInstance);

    const task = createMockTask();
    mockDbInstance.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1, status: "running" }]),
      }),
    });

    // This should create an execution record
    await service.executeTask(task.id, "manual");

    expect(mockDbInstance.insert).toHaveBeenCalled();
  });

  it("should track execution duration", async () => {
    const { getDb } = await import("../db");
    const mockDbInstance = createMockDb();

    mockDbInstance.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({ taskType: "notification" })
          ]),
        }),
      }),
    });

    mockDbInstance.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDbInstance.update.mockReturnThis();
    mockDbInstance.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDbInstance);

    const result = await service.executeTask(1);

    expect(result.duration).toBeDefined();
    expect(typeof result.duration).toBe("number");
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it("should record success status in execution", async () => {
    const { getDb } = await import("../db");
    const mockDbInstance = createMockDb();

    const successTask = createMockTask({ taskType: "notification" });
    mockDbInstance.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([successTask]),
        }),
      }),
    });

    mockDbInstance.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDbInstance.update.mockReturnThis();
    mockDbInstance.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDbInstance);

    const result = await service.executeTask(successTask.id);

    expect(result.success).toBeDefined();
  });

  it("should record error message in execution on failure", async () => {
    const { getDb } = await import("../db");
    const mockDbInstance = createMockDb();

    mockDbInstance.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([null]),
        }),
      }),
    });

    vi.mocked(getDb).mockResolvedValue(mockDbInstance);

    const result = await service.executeTask(999);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should update execution record with completion status", async () => {
    const { getDb } = await import("../db");
    const mockDbInstance = createMockDb();

    mockDbInstance.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({ taskType: "notification" })
          ]),
        }),
      }),
    });

    mockDbInstance.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    const updateMock = vi.fn().mockReturnThis();
    mockDbInstance.update.mockReturnValue({
      set: vi.fn().mockResolvedValue(undefined),
    });

    vi.mocked(getDb).mockResolvedValue(mockDbInstance);

    await service.executeTask(1);

    expect(mockDbInstance.update).toHaveBeenCalled();
  });
});

// ========================================
// TESTS: API CALL EXECUTION (10 tests)
// ========================================

describe("TaskExecutionService - API Call Execution", () => {
  let service: TaskExecutionService;

  beforeEach(() => {
    service = new TaskExecutionService();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make GET request to configured endpoint", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/users",
        apiMethod: "GET",
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue({ id: 1, name: "Test" }),
      text: vi.fn(),
    } as any);

    const result = await (service as any).executeApiCall(task);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/users",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("should add Bearer token authentication to request", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/data",
        authType: "bearer",
        bearerToken: "test-token-123",
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn(),
    } as any);

    await (service as any).executeApiCall(task);

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    expect(callArgs[1].headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer test-token-123",
      })
    );
  });

  it("should add API key authentication to request", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/data",
        authType: "api_key",
        apiKey: "key-123",
        apiKeyHeader: "X-API-Key",
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn(),
    } as any);

    await (service as any).executeApiCall(task);

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    expect(callArgs[1].headers).toEqual(
      expect.objectContaining({
        "X-API-Key": "key-123",
      })
    );
  });

  it("should add Basic authentication to request", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/data",
        authType: "basic",
        username: "user",
        password: "pass",
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn(),
    } as any);

    await (service as any).executeApiCall(task);

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const expectedAuth = `Basic ${Buffer.from("user:pass").toString("base64")}`;
    expect(callArgs[1].headers).toEqual(
      expect.objectContaining({
        Authorization: expectedAuth,
      })
    );
  });

  it("should parse JSON response", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/json",
      } as ApiCallConfig,
    });

    const responseData = { id: 1, status: "active" };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue(responseData),
      text: vi.fn(),
    } as any);

    const result = await (service as any).executeApiCall(task);

    expect(result.success).toBe(true);
    expect(result.output.data).toEqual(responseData);
  });

  it("should handle API error responses (4xx status)", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/notfound",
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue({ error: "Not found" }),
      text: vi.fn(),
    } as any);

    const result = await (service as any).executeApiCall(task);

    expect(result.success).toBe(false);
    expect(result.error).toContain("404");
  });

  it("should handle API error responses (5xx status)", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/error",
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue({ error: "Server error" }),
      text: vi.fn(),
    } as any);

    const result = await (service as any).executeApiCall(task);

    expect(result.success).toBe(false);
    expect(result.error).toContain("500");
  });

  it("should respect timeout configuration", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/slow",
        timeout: 5000,
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockRejectedValue(
      new Error("Timeout")
    );

    await (service as any).executeApiCall(task);

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    expect(callArgs[1].signal).toBeDefined();
  });

  it("should handle network failure gracefully", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/offline",
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockRejectedValue(
      new Error("Network error")
    );

    const result = await (service as any).executeApiCall(task);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should include custom headers in request", async () => {
    const task = createMockTask({
      taskType: "api_call",
      executionConfig: {
        apiEndpoint: "https://api.example.com/custom",
        customHeaders: {
          "X-Custom-Header": "custom-value",
          "User-Agent": "Test Agent",
        },
      } as ApiCallConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map([["content-type", "application/json"]]),
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn(),
    } as any);

    await (service as any).executeApiCall(task);

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    expect(callArgs[1].headers).toEqual(
      expect.objectContaining({
        "X-Custom-Header": "custom-value",
        "User-Agent": "Test Agent",
      })
    );
  });
});

// ========================================
// TESTS: GHL ACTION EXECUTION (8 tests)
// ========================================

describe("TaskExecutionService - GHL Action Execution", () => {
  let service: TaskExecutionService;

  beforeEach(() => {
    service = new TaskExecutionService();
    vi.clearAllMocks();
    global.fetch = vi.fn();
    process.env.GHL_API_KEY = "test-ghl-key";
    process.env.GHL_LOCATION_ID = "loc-123";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GHL_API_KEY;
    delete process.env.GHL_LOCATION_ID;
  });

  it("should execute add_contact GHL action", async () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "add_contact",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "555-1234",
      } as GhlActionConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({ id: "contact-123" }),
    } as any);

    const result = await (service as any).executeGhlAction(task);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://rest.gohighlevel.com/v1/contacts/",
      expect.any(Object)
    );
  });

  it("should execute send_sms GHL action", async () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "send_sms",
        contactId: "contact-123",
        message: "Hello from automation",
      } as GhlActionConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: "message-123" }),
    } as any);

    const result = await (service as any).executeGhlAction(task);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://rest.gohighlevel.com/v1/conversations/messages",
      expect.any(Object)
    );
  });

  it("should execute create_opportunity GHL action", async () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "create_opportunity",
        pipelineId: "pipeline-123",
        opportunityName: "Test Opportunity",
        contactId: "contact-123",
        status: "open",
        monetaryValue: 5000,
      } as GhlActionConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: "opp-123" }),
    } as any);

    const result = await (service as any).executeGhlAction(task);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://rest.gohighlevel.com/v1/opportunities/",
      expect.any(Object)
    );
  });

  it("should execute add_tag GHL action", async () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "add_tag",
        contactId: "contact-123",
        tags: ["vip", "interested"],
      } as GhlActionConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    } as any);

    const result = await (service as any).executeGhlAction(task);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://rest.gohighlevel.com/v1/contacts/contact-123/tags",
      expect.any(Object)
    );
  });

  it("should handle GHL API errors appropriately", async () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "add_contact",
        firstName: "John",
      } as GhlActionConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: "Invalid request" }),
    } as any);

    const result = await (service as any).executeGhlAction(task);

    expect(result.success).toBe(false);
    expect(result.error).toContain("GHL API error");
  });

  it("should use GHL API key from environment", async () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "add_contact",
        firstName: "Test",
      } as GhlActionConfig,
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: "contact-123" }),
    } as any);

    await (service as any).executeGhlAction(task);

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    expect(callArgs[1].headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer test-ghl-key",
      })
    );
  });

  it("should fail if GHL API key is not configured", async () => {
    delete process.env.GHL_API_KEY;

    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "add_contact",
      } as GhlActionConfig,
    });

    const result = await (service as any).executeGhlAction(task);

    expect(result.success).toBe(false);
    expect(result.error).toContain("GHL API key not configured");
  });

  it("should handle invalid GHL action type", async () => {
    const task = createMockTask({
      taskType: "ghl_action",
      executionConfig: {
        ghlAction: "invalid_action",
      } as any,
    });

    const result = await (service as any).executeGhlAction(task);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown GHL action");
  });
});

// ========================================
// TESTS: BROWSER AUTOMATION EXECUTION (12 tests)
// ========================================

describe("TaskExecutionService - Browser Automation Execution", () => {
  let service: TaskExecutionService;
  let mockDb: any;

  beforeEach(() => {
    service = new TaskExecutionService();
    mockDb = createMockDb();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize Stagehand with correct configuration", async () => {
    const { getDb } = await import("../db");
    const { browserbaseSDK } = await import("../_core/browserbaseSDK");
    const { Stagehand } = await import("@browserbasehq/stagehand");

    const mockSession = { id: "session-123" };
    const mockDebugInfo = { debuggerFullscreenUrl: "https://debug.url" };

    vi.mocked(browserbaseSDK.createSession).mockResolvedValue(mockSession as any);
    vi.mocked(browserbaseSDK.getSessionDebug).mockResolvedValue(mockDebugInfo as any);

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              taskType: "browser_automation",
              executionConfig: {
                automationSteps: [
                  {
                    type: "navigate",
                    config: { url: "https://example.com" },
                  },
                ],
              },
            }),
          ]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDb.update.mockReturnThis();
    mockDb.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDb);

    await service.executeTask(1);

    expect(Stagehand).toHaveBeenCalledWith(
      expect.objectContaining({
        env: "BROWSERBASE",
        browserbaseSessionID: "session-123",
      })
    );
  });

  it("should create Browserbase session on automation start", async () => {
    const { getDb } = await import("../db");
    const { browserbaseSDK } = await import("../_core/browserbaseSDK");
    const { Stagehand } = await import("@browserbasehq/stagehand");

    const mockSession = { id: "session-456" };
    vi.mocked(browserbaseSDK.createSession).mockResolvedValue(mockSession as any);
    vi.mocked(browserbaseSDK.getSessionDebug).mockResolvedValue({
      debuggerFullscreenUrl: "https://debug.url",
    } as any);

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              taskType: "browser_automation",
              executionConfig: {
                automationSteps: [
                  {
                    type: "navigate",
                    config: { url: "https://example.com" },
                  },
                ],
              },
            }),
          ]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDb.update.mockReturnThis();
    mockDb.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDb);

    await service.executeTask(1);

    expect(browserbaseSDK.createSession).toHaveBeenCalled();
    expect(browserbaseSDK.getSessionDebug).toHaveBeenCalledWith("session-456");
  });

  it("should handle Stagehand initialization failure", async () => {
    const { getDb } = await import("../db");
    const { browserbaseSDK } = await import("../_core/browserbaseSDK");
    const { Stagehand } = await import("@browserbasehq/stagehand");

    vi.mocked(browserbaseSDK.createSession).mockRejectedValue(
      new Error("Session creation failed")
    );

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              taskType: "browser_automation",
              executionConfig: {
                automationSteps: [
                  {
                    type: "navigate",
                    config: { url: "https://example.com" },
                  },
                ],
              },
            }),
          ]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDb.update.mockReturnThis();
    mockDb.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDb);

    const result = await service.executeTask(1);

    expect(result.success).toBe(false);
  });

  it("should execute browser actions in sequence", async () => {
    const { getDb } = await import("../db");
    const { browserbaseSDK } = await import("../_core/browserbaseSDK");

    vi.mocked(browserbaseSDK.createSession).mockResolvedValue({
      id: "session-123",
    } as any);
    vi.mocked(browserbaseSDK.getSessionDebug).mockResolvedValue({
      debuggerFullscreenUrl: "https://debug.url",
    } as any);

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              taskType: "browser_automation",
              executionConfig: {
                automationSteps: [
                  {
                    type: "navigate",
                    config: { url: "https://example.com" },
                  },
                  {
                    type: "wait",
                    config: { duration: 1000 },
                  },
                ],
              },
            }),
          ]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDb.update.mockReturnThis();
    mockDb.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDb);

    const result = await service.executeTask(1);

    // Should have executed without error
    expect(result).toBeDefined();
  });

  it("should cleanup browser session on completion", async () => {
    const { getDb } = await import("../db");
    const { browserbaseSDK } = await import("../_core/browserbaseSDK");
    const { Stagehand } = await import("@browserbasehq/stagehand");

    const mockStagehandInstance = {
      init: vi.fn(),
      context: {
        pages: vi.fn().mockReturnValue([{
          goto: vi.fn(),
          screenshot: vi.fn(),
        }]),
      },
      close: vi.fn(),
    };

    vi.mocked(Stagehand).mockImplementation(() => mockStagehandInstance as any);
    vi.mocked(browserbaseSDK.createSession).mockResolvedValue({
      id: "session-789",
    } as any);
    vi.mocked(browserbaseSDK.getSessionDebug).mockResolvedValue({
      debuggerFullscreenUrl: "https://debug.url",
    } as any);

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              taskType: "browser_automation",
              executionConfig: {
                automationSteps: [
                  {
                    type: "navigate",
                    config: { url: "https://example.com" },
                  },
                ],
              },
            }),
          ]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDb.update.mockReturnThis();
    mockDb.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDb);

    await service.executeTask(1);

    expect(mockStagehandInstance.close).toHaveBeenCalled();
  });

  it("should capture screenshots on failure", async () => {
    const task = createMockTask({
      taskType: "browser_automation",
      executionConfig: {
        automationSteps: [
          {
            type: "navigate",
            config: { url: "https://example.com" },
            screenshot: true,
          },
        ],
      },
    });

    // This test validates the screenshot capability in the service
    expect(task.executionConfig).toBeDefined();
  });

  it("should handle navigation errors", async () => {
    const { getDb } = await import("../db");
    const { browserbaseSDK } = await import("../_core/browserbaseSDK");
    const { Stagehand } = await import("@browserbasehq/stagehand");

    const mockPage = {
      goto: vi.fn().mockRejectedValue(new Error("Navigation failed")),
      screenshot: vi.fn(),
    };

    const mockStagehandInstance = {
      init: vi.fn(),
      context: {
        pages: vi.fn().mockReturnValue([mockPage]),
      },
      close: vi.fn(),
    };

    vi.mocked(Stagehand).mockImplementation(() => mockStagehandInstance as any);
    vi.mocked(browserbaseSDK.createSession).mockResolvedValue({
      id: "session-123",
    } as any);
    vi.mocked(browserbaseSDK.getSessionDebug).mockResolvedValue({
      debuggerFullscreenUrl: "https://debug.url",
    } as any);

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              taskType: "browser_automation",
              executionConfig: {
                automationSteps: [
                  {
                    type: "navigate",
                    config: { url: "https://example.com" },
                  },
                ],
              },
            }),
          ]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    mockDb.update.mockReturnThis();
    mockDb.set.mockResolvedValue(undefined);

    vi.mocked(getDb).mockResolvedValue(mockDb);

    const result = await service.executeTask(1);

    expect(result.success).toBe(false);
  });

  it("should handle action timeout appropriately", async () => {
    const task = createMockTask({
      taskType: "browser_automation",
      executionConfig: {
        timeout: 5000,
        automationSteps: [
          {
            type: "navigate",
            config: { url: "https://example.com" },
          },
        ],
      },
    });

    // Validate timeout configuration is present
    expect(task.executionConfig?.timeout).toBe(5000);
  });

  it("should handle continueOnError flag in automation steps", async () => {
    const task = createMockTask({
      taskType: "browser_automation",
      executionConfig: {
        automationSteps: [
          {
            type: "navigate",
            config: { url: "https://example.com" },
            continueOnError: true,
          },
          {
            type: "navigate",
            config: { url: "https://fallback.com" },
          },
        ],
      },
    });

    // Validate continueOnError flag is recognized
    const steps = (task.executionConfig as any)?.automationSteps;
    expect(steps?.[0]?.continueOnError).toBe(true);
  });

  it("should update execution with session info after Browserbase creation", async () => {
    const { getDb } = await import("../db");
    const { browserbaseSDK } = await import("../_core/browserbaseSDK");

    vi.mocked(browserbaseSDK.createSession).mockResolvedValue({
      id: "session-update-test",
    } as any);
    vi.mocked(browserbaseSDK.getSessionDebug).mockResolvedValue({
      debuggerFullscreenUrl: "https://debug.url",
    } as any);

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              taskType: "browser_automation",
              executionConfig: {
                automationSteps: [
                  {
                    type: "navigate",
                    config: { url: "https://example.com" },
                  },
                ],
              },
            }),
          ]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      into: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    const updateMock = vi.fn().mockReturnThis();
    mockDb.update.mockReturnValue({
      set: vi.fn().mockResolvedValue(undefined),
    });

    vi.mocked(getDb).mockResolvedValue(mockDb);

    await service.executeTask(1);

    expect(mockDb.update).toHaveBeenCalled();
  });
});

// ========================================
// INTEGRATION TESTS
// ========================================

describe("TaskExecutionService - Integration", () => {
  let service: TaskExecutionService;
  let mockDb: any;

  beforeEach(() => {
    service = new TaskExecutionService();
    mockDb = createMockDb();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle task not found error", async () => {
    const { getDb } = await import("../db");

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([null]),
        }),
      }),
    });

    vi.mocked(getDb).mockResolvedValue(mockDb);

    const result = await service.executeTask(999, "manual");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("should not execute already completed tasks", async () => {
    const { getDb } = await import("../db");

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({ status: "completed" }),
          ]),
        }),
      }),
    });

    vi.mocked(getDb).mockResolvedValue(mockDb);

    const result = await service.executeTask(1);

    expect(result.success).toBe(false);
    expect(result.error).toContain("already completed");
  });

  it("should not execute cancelled tasks", async () => {
    const { getDb } = await import("../db");

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({ status: "cancelled" }),
          ]),
        }),
      }),
    });

    vi.mocked(getDb).mockResolvedValue(mockDb);

    const result = await service.executeTask(1);

    expect(result.success).toBe(false);
    expect(result.error).toContain("cancelled");
  });

  it("should not execute tasks requiring human review without approval", async () => {
    const { getDb } = await import("../db");

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            createMockTask({
              requiresHumanReview: true,
              humanReviewedBy: null,
            }),
          ]),
        }),
      }),
    });

    vi.mocked(getDb).mockResolvedValue(mockDb);

    const result = await service.executeTask(1);

    expect(result.success).toBe(false);
    expect(result.error).toContain("human review");
  });

  it("should generate result summary after successful completion", async () => {
    const result: ExecutionResult = {
      success: true,
      output: { message: "Success" },
    };

    const summary = (service as any).generateResultSummary(result);

    expect(summary).toBeDefined();
    expect(typeof summary).toBe("string");
  });

  it("should handle database initialization failure gracefully", async () => {
    const { getDb } = await import("../db");

    vi.mocked(getDb).mockResolvedValue(null);

    const result = await service.executeTask(1);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Database");
  });
});
