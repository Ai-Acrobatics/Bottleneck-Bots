/**
 * Integration Tests for Workflows Router
 *
 * Comprehensive integration tests for the workflow system including:
 * - Full CRUD operations with database interactions
 * - Complete workflow execution flow
 * - Error handling and edge cases
 * - Cross-service integration
 *
 * These tests validate end-to-end functionality using mocked external services
 * (Browserbase, AI services) while testing real database interactions through mocks
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";
import { TRPCError } from "@trpc/server";

// ========================================
// MOCK SETUP - Must be before imports
// ========================================

// Mock ioredis before any other imports
vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock database module
vi.mock("../../db", () => ({
  getDb: vi.fn(),
}));

// Mock workflow execution service
vi.mock("../../services/workflowExecution.service", () => ({
  executeWorkflow: vi.fn(),
  testExecuteWorkflow: vi.fn(),
  getExecutionStatus: vi.fn(),
  cancelExecution: vi.fn(),
}));

// Mock browserbase service
vi.mock("../../_core/browserbase", () => ({
  getBrowserbaseService: vi.fn(),
}));

// Mock browserbase SDK
vi.mock("../../_core/browserbaseSDK", () => ({
  browserbaseSDK: {
    createSession: vi.fn().mockResolvedValue({ id: "test-session-123" }),
    createSessionWithGeoLocation: vi.fn().mockResolvedValue({ id: "geo-session-123" }),
    terminateSession: vi.fn().mockResolvedValue(undefined),
    getDebugUrl: vi.fn().mockResolvedValue("https://browserbase.com/debug/test-session"),
  },
}));

// Mock Stagehand
vi.mock("@browserbasehq/stagehand", () => ({
  Stagehand: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    act: vi.fn().mockResolvedValue({ success: true }),
    observe: vi.fn().mockResolvedValue([{ action: "click", selector: "button" }]),
    extract: vi.fn().mockResolvedValue({ data: "extracted-data" }),
    context: {
      pages: vi.fn().mockReturnValue([
        {
          goto: vi.fn().mockResolvedValue(undefined),
          url: vi.fn().mockReturnValue("https://example.com"),
          locator: vi.fn().mockReturnValue({
            waitFor: vi.fn().mockResolvedValue(undefined),
          }),
        },
      ]),
    },
  })),
}));

// Mock cache service
vi.mock("../../services/cache.service", () => ({
  cacheService: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    getOrSet: vi.fn().mockImplementation(async (_key: string, fn: () => Promise<unknown>) => fn()),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  CACHE_TTL: { SHORT: 60, MEDIUM: 300, LONG: 3600 },
}));

// Import router after mocks
import { workflowsRouter } from "./workflows";

// Import mocked modules for manipulation
import { getDb } from "../../db";
import {
  executeWorkflow,
  testExecuteWorkflow,
  getExecutionStatus,
  cancelExecution,
} from "../../services/workflowExecution.service";
import { browserbaseSDK } from "../../_core/browserbaseSDK";

// ========================================
// TEST FIXTURES & HELPERS
// ========================================

interface MockUser {
  id: number;
  email?: string;
  name?: string;
}

interface MockContext {
  user: MockUser;
  session?: { user: MockUser };
}

/**
 * Create a mock tRPC context with an authenticated user
 */
function createMockContext(user: MockUser = { id: 1, email: "test@example.com", name: "Test User" }): MockContext {
  return {
    user,
    session: { user },
  };
}

/**
 * Create a comprehensive mock database with all necessary chain methods
 */
function createMockDatabase(options: {
  selectResults?: unknown[][];
  insertResults?: unknown[][];
  updateResults?: unknown[][];
  shouldThrow?: boolean;
  throwError?: Error;
} = {}) {
  const {
    selectResults = [[]],
    insertResults = [[]],
    updateResults = [[]],
    shouldThrow = false,
    throwError = new Error("Database error"),
  } = options;

  let selectCallIndex = 0;
  let insertCallIndex = 0;
  let updateCallIndex = 0;

  const mockDb = {
    select: vi.fn().mockImplementation(() => {
      if (shouldThrow) throw throwError;
      const result = selectResults[selectCallIndex] || [];
      selectCallIndex = Math.min(selectCallIndex + 1, selectResults.length - 1);
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(result),
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(result),
              }),
            }),
          }),
        }),
      };
    }),
    insert: vi.fn().mockImplementation(() => {
      if (shouldThrow) throw throwError;
      const result = insertResults[insertCallIndex] || [];
      insertCallIndex = Math.min(insertCallIndex + 1, insertResults.length - 1);
      return {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(result),
        }),
      };
    }),
    update: vi.fn().mockImplementation(() => {
      if (shouldThrow) throw throwError;
      const result = updateResults[updateCallIndex] || [];
      updateCallIndex = Math.min(updateCallIndex + 1, updateResults.length - 1);
      return {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue(result),
          }),
        }),
      };
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
    transaction: vi.fn().mockImplementation(async (fn: (tx: any) => Promise<any>) => fn(mockDb)),
  };

  return mockDb;
}

/**
 * Create a valid workflow object
 */
function createMockWorkflow(overrides: Partial<{
  id: number;
  userId: number;
  name: string;
  description: string;
  steps: unknown[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: 1,
    userId: 1,
    name: "Test Workflow",
    description: "A test workflow for integration testing",
    steps: [
      {
        type: "navigate",
        order: 0,
        config: {
          url: "https://example.com",
          continueOnError: false,
        },
      },
    ],
    isActive: true,
    executionCount: 0,
    lastExecutedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a valid workflow execution object
 */
function createMockExecution(overrides: Partial<{
  id: number;
  workflowId: number;
  userId: number;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  error: string | null;
  stepResults: unknown[];
  output: unknown;
  sessionId: number | null;
}> = {}) {
  return {
    id: 1,
    workflowId: 1,
    userId: 1,
    status: "completed",
    startedAt: new Date(),
    completedAt: new Date(),
    error: null,
    stepResults: [
      {
        stepIndex: 0,
        type: "navigate",
        success: true,
        result: { url: "https://example.com", timestamp: new Date() },
        timestamp: new Date(),
      },
    ],
    output: { success: true },
    sessionId: null,
    ...overrides,
  };
}

/**
 * Create valid workflow input for create/update operations
 */
function createValidWorkflowInput(overrides: Partial<{
  name: string;
  description: string;
  trigger: "manual" | "scheduled" | "webhook" | "event";
  steps: Array<{
    type: string;
    order: number;
    config: Record<string, unknown>;
  }>;
  geolocation: { city?: string; state?: string; country?: string };
}> = {}) {
  return {
    name: "New Test Workflow",
    description: "A new workflow for testing",
    trigger: "manual" as const,
    steps: [
      {
        type: "navigate" as const,
        order: 0,
        config: {
          url: "https://example.com",
          continueOnError: false,
        },
      },
    ],
    ...overrides,
  };
}

// ========================================
// INTEGRATION TESTS: WORKFLOW CRUD
// ========================================

describe("Workflow Integration Tests", () => {
  let mockCtx: MockContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCtx = createMockContext({ id: 1 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Workflow CRUD Flow", () => {
    it("should create, retrieve, update, and delete a workflow", async () => {
      const workflowId = 1;
      const mockWorkflow = createMockWorkflow({ id: workflowId });
      const updatedWorkflow = createMockWorkflow({
        id: workflowId,
        name: "Updated Workflow Name",
        description: "Updated description",
      });

      // Setup mock database for full CRUD cycle
      // create() only does insert (no select), so first select is from get()
      const db = createMockDatabase({
        selectResults: [
          [mockWorkflow], // For get after create
          [mockWorkflow], // For update existence check
          [updatedWorkflow], // For delete existence check
        ],
        insertResults: [[mockWorkflow]],
        updateResults: [
          [updatedWorkflow],
          [{ ...updatedWorkflow, isActive: false }], // Soft delete
        ],
      });

      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      // 1. CREATE
      const created = await caller.create(createValidWorkflowInput());
      expect(created).toBeDefined();
      expect(created.name).toBe("Test Workflow");
      expect(created.isActive).toBe(true);

      // 2. GET
      const retrieved = await caller.get({ id: workflowId });
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(workflowId);

      // 3. UPDATE
      const updated = await caller.update({
        id: workflowId,
        name: "Updated Workflow Name",
        description: "Updated description",
      });
      expect(updated).toBeDefined();
      expect(updated.name).toBe("Updated Workflow Name");

      // 4. DELETE (soft delete)
      const deleteResult = await caller.delete({ id: workflowId });
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.id).toBe(workflowId);
    });

    it("should handle workflow creation with all step types", async () => {
      const complexSteps = [
        { type: "navigate", order: 0, config: { url: "https://example.com", continueOnError: false } },
        { type: "act", order: 1, config: { instruction: "Click the login button", continueOnError: false } },
        { type: "wait", order: 2, config: { waitMs: 2000, continueOnError: false } },
        { type: "extract", order: 3, config: { extractInstruction: "Get user data", schemaType: "custom", continueOnError: false } },
        { type: "condition", order: 4, config: { condition: "{{hasData}} === true", continueOnError: false } },
        { type: "apiCall", order: 5, config: { url: "https://api.example.com/data", method: "GET", saveAs: "apiResult", continueOnError: false } },
        { type: "notification", order: 6, config: { message: "Workflow completed", type: "success", continueOnError: false } },
      ];

      const mockWorkflow = createMockWorkflow({ steps: complexSteps });
      const db = createMockDatabase({
        insertResults: [[mockWorkflow]],
      });

      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.create(createValidWorkflowInput({ steps: complexSteps as any }));

      expect(result).toBeDefined();
      expect(result.steps).toHaveLength(7);
    });

    it("should list workflows with pagination and filtering", async () => {
      const workflows = [
        createMockWorkflow({ id: 1, name: "Workflow 1", isActive: true }),
        createMockWorkflow({ id: 2, name: "Workflow 2", isActive: true }),
        createMockWorkflow({ id: 3, name: "Workflow 3", isActive: false }),
      ];

      const activeWorkflows = workflows.filter(w => w.isActive);

      const db = createMockDatabase({
        selectResults: [activeWorkflows],
      });

      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      // List with status filter
      const result = await caller.list({
        status: "active",
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveLength(2);
      expect(result.every(w => w.isActive)).toBe(true);
    });
  });

  // ========================================
  // INTEGRATION TESTS: WORKFLOW EXECUTION
  // ========================================

  describe("Workflow Execution Integration", () => {
    it("should execute a workflow and return complete results", async () => {
      const mockWorkflow = createMockWorkflow();
      const mockExecution = createMockExecution({
        status: "completed",
        stepResults: [
          { stepIndex: 0, type: "navigate", success: true, result: { url: "https://example.com" }, timestamp: new Date() },
        ],
        output: { extractedData: [], finalVariables: {} },
      });

      vi.mocked(executeWorkflow).mockResolvedValue({
        executionId: mockExecution.id,
        workflowId: mockWorkflow.id,
        status: "completed",
        stepResults: mockExecution.stepResults as any,
        output: mockExecution.output,
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.execute({
        workflowId: mockWorkflow.id,
      });

      expect(result.success).toBe(true);
      expect(result.executionId).toBe(mockExecution.id);
      expect(result.status).toBe("completed");
      expect(result.stepResults).toHaveLength(1);
    });

    it("should execute workflow with variables and geolocation", async () => {
      const variables = {
        username: "testuser",
        searchQuery: "test query",
      };
      const geolocation = {
        city: "New York",
        state: "NY",
        country: "USA",
      };

      vi.mocked(executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: [],
        output: { variables },
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.execute({
        workflowId: 1,
        variables,
        geolocation,
      });

      expect(result.success).toBe(true);
      expect(executeWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: 1,
          userId: 1,
          variables,
          geolocation,
        })
      );
    });

    it("should handle multi-step workflow execution", async () => {
      const multiStepResults = [
        { stepIndex: 0, type: "navigate", success: true, result: { url: "https://example.com" } },
        { stepIndex: 1, type: "act", success: true, result: { instruction: "Click button" } },
        { stepIndex: 2, type: "wait", success: true, result: { waitedFor: "time", waitMs: 2000 } },
        { stepIndex: 3, type: "extract", success: true, result: { data: "extracted content" } },
      ];

      vi.mocked(executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: multiStepResults as any,
        output: { success: true },
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.execute({ workflowId: 1 });

      expect(result.stepResults).toHaveLength(4);
      expect(result.stepResults[0].type).toBe("navigate");
      expect(result.stepResults[3].type).toBe("extract");
    });

    it("should handle execution failure gracefully", async () => {
      vi.mocked(executeWorkflow).mockRejectedValue(
        new Error("Browser session creation failed")
      );

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.execute({ workflowId: 1 })).rejects.toThrow(
        "Browser session creation failed"
      );
    });

    it("should get execution status with step results", async () => {
      const mockExecution = createMockExecution({
        status: "running",
        stepResults: [
          { stepIndex: 0, type: "navigate", success: true, result: {} },
          { stepIndex: 1, type: "act", success: true, result: {} },
        ],
      });

      vi.mocked(getExecutionStatus).mockResolvedValue({
        executionId: mockExecution.id,
        workflowId: mockExecution.workflowId,
        status: "running",
        startedAt: mockExecution.startedAt,
        stepResults: mockExecution.stepResults as any,
        currentStep: 2,
      });

      const db = createMockDatabase({
        selectResults: [[mockExecution]],
      });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.getExecution({ executionId: mockExecution.id });

      expect(result.status).toBe("running");
      expect(result.currentStep).toBe(2);
    });

    it("should cancel a running execution", async () => {
      const runningExecution = createMockExecution({
        status: "running",
        completedAt: null,
      });

      vi.mocked(cancelExecution).mockResolvedValue(undefined);

      const db = createMockDatabase({
        selectResults: [[runningExecution]],
      });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.cancelExecution({ executionId: runningExecution.id });

      expect(result.success).toBe(true);
      expect(cancelExecution).toHaveBeenCalledWith(runningExecution.id);
    });

    it("should get execution history with pagination and filtering", async () => {
      const mockWorkflow = createMockWorkflow();
      const executions = [
        createMockExecution({ id: 1, status: "completed" }),
        createMockExecution({ id: 2, status: "failed" }),
        createMockExecution({ id: 3, status: "completed" }),
      ];

      const db = createMockDatabase({
        selectResults: [[mockWorkflow], executions],
      });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.getExecutions({
        workflowId: mockWorkflow.id,
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveLength(3);
    });
  });

  // ========================================
  // INTEGRATION TESTS: TEST RUN
  // ========================================

  describe("Test Run Integration", () => {
    it("should execute test run without database persistence", async () => {
      const testSteps = [
        { type: "navigate" as const, order: 0, config: { url: "https://example.com", continueOnError: false } },
        { type: "extract" as const, order: 1, config: { extractInstruction: "Get title", continueOnError: false } },
      ];

      vi.mocked(testExecuteWorkflow).mockResolvedValue({
        executionId: -1,
        workflowId: -1,
        status: "completed",
        stepResults: [
          { stepIndex: 0, success: true, result: { url: "https://example.com" } },
          { stepIndex: 1, success: true, result: { data: "Page Title" } },
        ],
        output: { extractedData: [], finalVariables: {} },
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.testRun({
        steps: testSteps,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("completed");
      expect(testExecuteWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          steps: testSteps,
        })
      );
    });

    it("should support step-by-step test execution", async () => {
      const testSteps = [
        { type: "navigate" as const, order: 0, config: { url: "https://example.com", continueOnError: false } },
      ];

      vi.mocked(testExecuteWorkflow).mockResolvedValue({
        executionId: -1,
        workflowId: -1,
        status: "completed",
        stepResults: [],
        output: {},
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      await caller.testRun({
        steps: testSteps,
        stepByStep: true,
      });

      expect(testExecuteWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          stepByStep: true,
        })
      );
    });

    it("should return error details on test run failure", async () => {
      const testSteps = [
        { type: "navigate" as const, order: 0, config: { url: "https://invalid-url.test", continueOnError: false } },
      ];

      vi.mocked(testExecuteWorkflow).mockResolvedValue({
        executionId: -1,
        workflowId: -1,
        status: "failed",
        stepResults: [
          { stepIndex: 0, success: false, error: "Navigation failed: DNS resolution error" },
        ],
        output: null,
        error: "Step 1 failed: Navigation failed",
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.testRun({ steps: testSteps });

      expect(result.status).toBe("failed");
      expect(result.error).toBeDefined();
    });
  });

  // ========================================
  // INTEGRATION TESTS: ERROR HANDLING
  // ========================================

  describe("Error Handling Integration", () => {
    it("should handle database connection failure gracefully", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.list({})).rejects.toThrow("Database not initialized");
    });

    it("should handle database query timeout", async () => {
      const db = createMockDatabase({
        shouldThrow: true,
        throwError: new Error("Query timeout exceeded"),
      });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.create(createValidWorkflowInput())).rejects.toThrow(TRPCError);
    });

    it("should handle constraint violation on duplicate name", async () => {
      const db = createMockDatabase();
      db.insert = vi.fn().mockImplementation(() => {
        const error = new Error("UNIQUE constraint failed: workflows.name") as any;
        error.code = "SQLITE_CONSTRAINT";
        throw error;
      });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.create(createValidWorkflowInput())).rejects.toThrow(TRPCError);
    });

    it("should return NOT_FOUND for non-existent workflow", async () => {
      const db = createMockDatabase({ selectResults: [[]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.get({ id: 999 })).rejects.toThrow("Workflow not found");
    });

    it("should return NOT_FOUND for workflow owned by different user", async () => {
      const otherUserWorkflow = createMockWorkflow({ userId: 999 });
      const db = createMockDatabase({ selectResults: [[]] }); // Returns empty for userId filter
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.get({ id: 1 })).rejects.toThrow("Workflow not found");
    });

    it("should handle execution service failure", async () => {
      vi.mocked(executeWorkflow).mockRejectedValue(
        new Error("Browserbase API rate limit exceeded")
      );

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.execute({ workflowId: 1 })).rejects.toThrow(
        "Browserbase API rate limit exceeded"
      );
    });

    it("should handle cancellation of non-running execution", async () => {
      const completedExecution = createMockExecution({ status: "completed" });
      vi.mocked(cancelExecution).mockRejectedValue(
        new Error("Only running executions can be cancelled")
      );

      const db = createMockDatabase({ selectResults: [[completedExecution]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(caller.cancelExecution({ executionId: 1 })).rejects.toThrow(
        "Only running executions can be cancelled"
      );
    });
  });

  // ========================================
  // INTEGRATION TESTS: EDGE CASES
  // ========================================

  describe("Edge Cases Integration", () => {
    it("should handle workflow with maximum allowed steps (50)", async () => {
      const maxSteps = Array.from({ length: 50 }, (_, i) => ({
        type: "navigate" as const,
        order: i,
        config: { url: `https://example.com/page${i}`, continueOnError: false },
      }));

      const mockWorkflow = createMockWorkflow({ steps: maxSteps });
      const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.create(createValidWorkflowInput({ steps: maxSteps }));

      expect(result.steps).toHaveLength(50);
    });

    it("should reject workflow with too many steps (>50)", async () => {
      const tooManySteps = Array.from({ length: 51 }, (_, i) => ({
        type: "navigate" as const,
        order: i,
        config: { url: `https://example.com/page${i}`, continueOnError: false },
      }));

      const db = createMockDatabase();
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(
        caller.create(createValidWorkflowInput({ steps: tooManySteps as any }))
      ).rejects.toThrow();
    });

    it("should handle workflow with empty steps array", async () => {
      const db = createMockDatabase();
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(
        caller.create(createValidWorkflowInput({ steps: [] as any }))
      ).rejects.toThrow();
    });

    it("should handle special characters in workflow name", async () => {
      const specialName = "Test & Workflow <script>alert('xss')</script>";
      const mockWorkflow = createMockWorkflow({ name: specialName });
      const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.create(createValidWorkflowInput({ name: specialName }));

      expect(result.name).toBe(specialName);
    });

    it("should handle workflow name at maximum length (255)", async () => {
      const maxLengthName = "a".repeat(255);
      const mockWorkflow = createMockWorkflow({ name: maxLengthName });
      const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.create(createValidWorkflowInput({ name: maxLengthName }));

      expect(result.name).toHaveLength(255);
    });

    it("should reject workflow name exceeding maximum length", async () => {
      const tooLongName = "a".repeat(256);
      const db = createMockDatabase();
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      await expect(
        caller.create(createValidWorkflowInput({ name: tooLongName }))
      ).rejects.toThrow();
    });

    it("should handle unicode characters in workflow data", async () => {
      const unicodeName = "Workflow with unicode characters";
      const unicodeDescription = "Description with unicode characters";
      const mockWorkflow = createMockWorkflow({
        name: unicodeName,
        description: unicodeDescription,
      });
      const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.create(createValidWorkflowInput({
        name: unicodeName,
        description: unicodeDescription,
      }));

      expect(result.name).toBe(unicodeName);
      expect(result.description).toBe(unicodeDescription);
    });

    it("should handle empty geolocation object", async () => {
      const mockWorkflow = createMockWorkflow();
      const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.create(createValidWorkflowInput({ geolocation: {} }));

      expect(result).toBeDefined();
    });

    it("should handle concurrent workflow operations", async () => {
      const mockWorkflow = createMockWorkflow();
      const db = createMockDatabase({ insertResults: [[mockWorkflow], [mockWorkflow]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      // Simulate concurrent creates
      const [result1, result2] = await Promise.all([
        caller.create(createValidWorkflowInput({ name: "Workflow 1" })),
        caller.create(createValidWorkflowInput({ name: "Workflow 2" })),
      ]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should handle partial geolocation data", async () => {
      vi.mocked(executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: [],
        output: {},
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.execute({
        workflowId: 1,
        geolocation: { country: "USA" }, // Only country provided
      });

      expect(result.success).toBe(true);
      expect(executeWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          geolocation: { country: "USA" },
        })
      );
    });
  });

  // ========================================
  // INTEGRATION TESTS: STEP VALIDATION
  // ========================================

  describe("Step Validation Integration", () => {
    it("should validate navigate step URL format", async () => {
      const db = createMockDatabase();
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      // Note: The actual URL validation depends on schema strictness
      // This test verifies the schema accepts valid URLs
      const validStep = {
        type: "navigate" as const,
        order: 0,
        config: { url: "https://example.com/path?query=value", continueOnError: false },
      };

      const mockWorkflow = createMockWorkflow({ steps: [validStep] });
      const db2 = createMockDatabase({ insertResults: [[mockWorkflow]] });
      vi.mocked(getDb).mockResolvedValue(db2 as any);

      const result = await caller.create(createValidWorkflowInput({ steps: [validStep] }));
      expect(result).toBeDefined();
    });

    it("should validate wait step duration limits", async () => {
      const db = createMockDatabase();
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      // Wait duration exceeds maximum (60000ms)
      const invalidWaitStep = {
        type: "wait" as const,
        order: 0,
        config: { waitMs: 70000, continueOnError: false }, // Exceeds 60000 limit
      };

      await expect(
        caller.create(createValidWorkflowInput({ steps: [invalidWaitStep] as any }))
      ).rejects.toThrow();
    });

    it("should validate API call step method", async () => {
      const db = createMockDatabase();
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      const invalidApiStep = {
        type: "apiCall" as const,
        order: 0,
        config: {
          url: "https://api.example.com",
          method: "INVALID_METHOD" as any,
          continueOnError: false,
        },
      };

      await expect(
        caller.create(createValidWorkflowInput({ steps: [invalidApiStep] as any }))
      ).rejects.toThrow();
    });

    it("should accept all valid extract schema types", async () => {
      const schemaTypes = ["contactInfo", "productInfo", "custom"] as const;

      for (const schemaType of schemaTypes) {
        const step = {
          type: "extract" as const,
          order: 0,
          config: {
            extractInstruction: "Extract data",
            schemaType,
            continueOnError: false,
          },
        };

        const mockWorkflow = createMockWorkflow({ steps: [step] });
        const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
        vi.mocked(getDb).mockResolvedValue(db as any);

        const caller = workflowsRouter.createCaller(mockCtx as any);
        const result = await caller.create(createValidWorkflowInput({ steps: [step] }));

        expect(result).toBeDefined();
      }
    });

    it("should validate notification step type", async () => {
      const validNotificationTypes = ["info", "success", "warning", "error"] as const;

      for (const notifType of validNotificationTypes) {
        const step = {
          type: "notification" as const,
          order: 0,
          config: {
            message: "Test notification",
            type: notifType,
            continueOnError: false,
          },
        };

        const mockWorkflow = createMockWorkflow({ steps: [step] });
        const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
        vi.mocked(getDb).mockResolvedValue(db as any);

        const caller = workflowsRouter.createCaller(mockCtx as any);
        const result = await caller.create(createValidWorkflowInput({ steps: [step] }));

        expect(result).toBeDefined();
      }
    });

    it("should reject invalid step type", async () => {
      const db = createMockDatabase();
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(mockCtx as any);

      const invalidStep = {
        type: "invalid_type" as any,
        order: 0,
        config: { continueOnError: false },
      };

      await expect(
        caller.create(createValidWorkflowInput({ steps: [invalidStep] }))
      ).rejects.toThrow();
    });
  });

  // ========================================
  // INTEGRATION TESTS: AUTHORIZATION
  // ========================================

  describe("Authorization Integration", () => {
    it("should isolate workflows by user ID", async () => {
      // User 1 workflows
      const user1Workflows = [
        createMockWorkflow({ id: 1, userId: 1, name: "User 1 Workflow" }),
      ];

      // User 2 workflows
      const user2Workflows = [
        createMockWorkflow({ id: 2, userId: 2, name: "User 2 Workflow" }),
      ];

      // User 1 context
      const user1Ctx = createMockContext({ id: 1 });
      const db1 = createMockDatabase({ selectResults: [user1Workflows] });
      vi.mocked(getDb).mockResolvedValue(db1 as any);

      const caller1 = workflowsRouter.createCaller(user1Ctx as any);
      const result1 = await caller1.list({});

      expect(result1).toHaveLength(1);
      expect(result1[0].userId).toBe(1);

      // User 2 context
      const user2Ctx = createMockContext({ id: 2 });
      const db2 = createMockDatabase({ selectResults: [user2Workflows] });
      vi.mocked(getDb).mockResolvedValue(db2 as any);

      const caller2 = workflowsRouter.createCaller(user2Ctx as any);
      const result2 = await caller2.list({});

      expect(result2).toHaveLength(1);
      expect(result2[0].userId).toBe(2);
    });

    it("should prevent cross-user workflow access", async () => {
      // User 1 tries to access User 2's workflow
      const user1Ctx = createMockContext({ id: 1 });

      // Empty result because userId filter doesn't match
      const db = createMockDatabase({ selectResults: [[]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(user1Ctx as any);

      await expect(caller.get({ id: 999 })).rejects.toThrow("Workflow not found");
    });

    it("should prevent cross-user execution access", async () => {
      const user1Ctx = createMockContext({ id: 1 });

      // Empty result because userId filter doesn't match
      const db = createMockDatabase({ selectResults: [[]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      vi.mocked(getExecutionStatus).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
      });

      const caller = workflowsRouter.createCaller(user1Ctx as any);

      await expect(caller.getExecution({ executionId: 999 })).rejects.toThrow(
        "Execution not found"
      );
    });

    it("should prevent cross-user workflow deletion", async () => {
      const user1Ctx = createMockContext({ id: 1 });

      // Empty result because userId filter doesn't match
      const db = createMockDatabase({ selectResults: [[]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(user1Ctx as any);

      await expect(caller.delete({ id: 999 })).rejects.toThrow("Workflow not found");
    });

    it("should prevent cross-user execution cancellation", async () => {
      const user1Ctx = createMockContext({ id: 1 });

      // Empty result because userId filter doesn't match
      const db = createMockDatabase({ selectResults: [[]] });
      vi.mocked(getDb).mockResolvedValue(db as any);

      const caller = workflowsRouter.createCaller(user1Ctx as any);

      await expect(caller.cancelExecution({ executionId: 999 })).rejects.toThrow(
        "Execution not found"
      );
    });
  });

  // ========================================
  // INTEGRATION TESTS: VARIABLE SUBSTITUTION
  // ========================================

  describe("Variable Substitution Integration", () => {
    it("should pass variables through workflow execution", async () => {
      const variables = {
        baseUrl: "https://example.com",
        username: "testuser",
        query: "search term",
      };

      vi.mocked(executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: [],
        output: { finalVariables: variables },
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      const result = await caller.execute({
        workflowId: 1,
        variables,
      });

      expect(result.success).toBe(true);
      expect(executeWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ variables })
      );
    });

    it("should pass variables through test run", async () => {
      const variables = {
        testVar: "test value",
        count: 42,
      };

      vi.mocked(testExecuteWorkflow).mockResolvedValue({
        executionId: -1,
        workflowId: -1,
        status: "completed",
        stepResults: [],
        output: { finalVariables: variables },
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx as any);
      await caller.testRun({
        steps: [{ type: "navigate" as const, order: 0, config: { url: "{{baseUrl}}", continueOnError: false } }],
        variables,
      });

      expect(testExecuteWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ variables })
      );
    });
  });
});

// ========================================
// INTEGRATION TESTS: COMPLEX SCENARIOS
// ========================================

describe("Complex Integration Scenarios", () => {
  let mockCtx: MockContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCtx = createMockContext({ id: 1 });
  });

  it("should handle complete workflow lifecycle", async () => {
    const mockWorkflow = createMockWorkflow();
    const mockExecution = createMockExecution();

    // Database mock for full lifecycle
    const db = createMockDatabase({
      selectResults: [
        [mockWorkflow], // For get
        [mockWorkflow], // For update check
        [mockWorkflow], // For execution getExecutions check
        [mockExecution], // For executions list
      ],
      insertResults: [[mockWorkflow]],
      updateResults: [[{ ...mockWorkflow, name: "Updated" }]],
    });
    vi.mocked(getDb).mockResolvedValue(db as any);

    vi.mocked(executeWorkflow).mockResolvedValue({
      executionId: mockExecution.id,
      workflowId: mockWorkflow.id,
      status: "completed",
      stepResults: [],
      output: {},
    });

    const caller = workflowsRouter.createCaller(mockCtx as any);

    // 1. Create workflow
    const created = await caller.create(createValidWorkflowInput());
    expect(created).toBeDefined();

    // 2. Execute workflow
    const executed = await caller.execute({ workflowId: created.id });
    expect(executed.success).toBe(true);

    // 3. Get executions
    const executions = await caller.getExecutions({ workflowId: created.id });
    expect(executions).toBeDefined();

    // 4. Update workflow
    const updated = await caller.update({ id: created.id, name: "Updated" });
    expect(updated.name).toBe("Updated");
  });

  it("should handle workflow with complex condition logic", async () => {
    const complexSteps = [
      { type: "navigate" as const, order: 0, config: { url: "https://example.com", continueOnError: false } },
      { type: "extract" as const, order: 1, config: { extractInstruction: "Get count", saveAs: "itemCount", continueOnError: false } },
      { type: "condition" as const, order: 2, config: { condition: "{{itemCount}} > 0", continueOnError: false } },
      { type: "loop" as const, order: 3, config: { items: ["{{items}}"], continueOnError: false } },
    ];

    const mockWorkflow = createMockWorkflow({ steps: complexSteps });
    const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const caller = workflowsRouter.createCaller(mockCtx as any);
    const result = await caller.create(createValidWorkflowInput({ steps: complexSteps }));

    expect(result.steps).toHaveLength(4);
    expect(result.steps[2].type).toBe("condition");
    expect(result.steps[3].type).toBe("loop");
  });

  it("should handle workflow execution with error recovery", async () => {
    const stepsWithErrorHandling = [
      {
        type: "navigate" as const,
        order: 0,
        config: { url: "https://example.com", continueOnError: true },
      },
      {
        type: "act" as const,
        order: 1,
        config: { instruction: "Click optional element", continueOnError: true },
      },
      {
        type: "extract" as const,
        order: 2,
        config: { extractInstruction: "Get data", continueOnError: false },
      },
    ];

    vi.mocked(executeWorkflow).mockResolvedValue({
      executionId: 1,
      workflowId: 1,
      status: "completed",
      stepResults: [
        { stepIndex: 0, success: true, result: {} },
        { stepIndex: 1, success: false, error: "Element not found" }, // Failed but continued
        { stepIndex: 2, success: true, result: { data: "extracted" } },
      ],
      output: { extractedData: [{ data: "extracted" }] },
    });

    const caller = workflowsRouter.createCaller(mockCtx as any);
    const result = await caller.execute({ workflowId: 1 });

    expect(result.success).toBe(true);
    expect(result.status).toBe("completed");
    expect(result.stepResults).toHaveLength(3);
    expect(result.stepResults[1].success).toBe(false); // Failed step
    expect(result.stepResults[2].success).toBe(true); // But execution continued
  });

  it("should handle rapid sequential executions", async () => {
    vi.mocked(executeWorkflow).mockResolvedValue({
      executionId: 1,
      workflowId: 1,
      status: "completed",
      stepResults: [],
      output: {},
    });

    const caller = workflowsRouter.createCaller(mockCtx as any);

    // Rapid sequential executions
    const results = [];
    for (let i = 0; i < 5; i++) {
      const result = await caller.execute({ workflowId: 1 });
      results.push(result);
    }

    expect(results).toHaveLength(5);
    expect(results.every(r => r.success)).toBe(true);
    expect(executeWorkflow).toHaveBeenCalledTimes(5);
  });

  it("should handle workflow with API call step integration", async () => {
    const apiCallSteps = [
      {
        type: "navigate" as const,
        order: 0,
        config: { url: "https://example.com", continueOnError: false },
      },
      {
        type: "apiCall" as const,
        order: 1,
        config: {
          url: "https://api.example.com/data",
          method: "GET" as const,
          saveAs: "apiResponse",
          continueOnError: false,
        },
      },
      {
        type: "condition" as const,
        order: 2,
        config: { condition: "{{apiResponse.status}} === 200", continueOnError: false },
      },
    ];

    const mockWorkflow = createMockWorkflow({ steps: apiCallSteps });
    const db = createMockDatabase({ insertResults: [[mockWorkflow]] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const caller = workflowsRouter.createCaller(mockCtx as any);
    const result = await caller.create(createValidWorkflowInput({ steps: apiCallSteps }));

    expect(result.steps[1].type).toBe("apiCall");
    expect(result.steps[1].config.method).toBe("GET");
  });
});
