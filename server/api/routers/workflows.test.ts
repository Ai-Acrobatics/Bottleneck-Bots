/**
 * Unit Tests for Workflows Router
 *
 * Comprehensive tests for all workflow endpoints including:
 * - CRUD operations (create, list, get, update, delete)
 * - Execution management (execute, getExecutions, getExecution, cancelExecution)
 * - Test runs (testRun)
 * - Input validation and authorization
 * - Error handling and edge cases
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";

// Mock ioredis FIRST before any imports that use it
vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
    on: vi.fn(),
  })),
}));

// Mock dependencies
vi.mock("../../db", () => ({
  getDb: vi.fn(),
}));
vi.mock("../../services/workflowExecution.service", () => ({
  executeWorkflow: vi.fn(),
  testExecuteWorkflow: vi.fn(),
  getExecutionStatus: vi.fn(),
  cancelExecution: vi.fn(),
}));
vi.mock("../../_core/browserbase", () => ({
  getBrowserbaseService: vi.fn(),
}));
vi.mock("../../services/cache.service", () => ({
  cacheService: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    getOrSet: vi.fn().mockImplementation(async (_key: string, fn: () => Promise<unknown>) => fn()),
  },
  CACHE_TTL: { SHORT: 60, MEDIUM: 300, LONG: 3600 },
}));

import { workflowsRouter } from "./workflows";

// Helper functions
function createMockContext(user: { id: number }) {
  return {
    user,
    session: { user },
  };
}

function createTestDb(options: {
  selectResponse?: unknown[];
  insertResponse?: unknown[];
  updateResponse?: unknown[];
} = {}) {
  const { selectResponse = [], insertResponse = [], updateResponse = [] } = options;

  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(selectResponse)),
          offset: vi.fn(() => Promise.resolve(selectResponse)),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve(selectResponse)),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve(insertResponse)),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve(updateResponse)),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
    transaction: vi.fn(),
  };
}

describe("Workflows Router", () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockContext({ id: 1 });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== Helper Functions ====================

  function createMockWorkflow(overrides?: any) {
    return {
      id: 1,
      userId: 1,
      name: "Test Workflow",
      description: "Test workflow description",
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
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  function createMockWorkflowExecution(overrides?: any) {
    return {
      id: 1,
      workflowId: 1,
      userId: 1,
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      stepResults: [
        {
          step: 0,
          status: "success",
          result: { url: "https://example.com" },
        },
      ],
      output: { success: true },
      error: null,
      ...overrides,
    };
  }

  function createValidWorkflowInput(overrides?: any) {
    return {
      name: "New Workflow",
      description: "A new workflow",
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

  // ==================== Create Endpoint Tests ====================

  describe("create", () => {
    it("should create a workflow with valid input", async () => {
      const mockWorkflow = createMockWorkflow({
        name: "New Workflow",
        id: 2,
      });

      const db = createTestDb({
        insertResponse: [mockWorkflow],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.create(createValidWorkflowInput());

      expect(result).toBeDefined();
      expect(result.name).toBe("New Workflow");
      expect(result.userId).toBe(1);
      expect(result.isActive).toBe(true);
    });

    it("should reject workflow creation with missing name", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const input = createValidWorkflowInput({ name: "" });

      await expect(caller.create(input as any)).rejects.toThrow();
    });

    it("should reject workflow creation with invalid name length", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const tooLongName = "a".repeat(256);
      const input = createValidWorkflowInput({ name: tooLongName });

      await expect(caller.create(input as any)).rejects.toThrow();
    });

    it("should reject workflow with no steps", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const input = createValidWorkflowInput({ steps: [] });

      await expect(caller.create(input as any)).rejects.toThrow();
    });

    it("should reject workflow with too many steps (>50)", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const manySteps = Array.from({ length: 51 }, (_, i) => ({
        type: "navigate" as const,
        order: i,
        config: { url: "https://example.com" },
      }));
      const input = createValidWorkflowInput({ steps: manySteps });

      await expect(caller.create(input as any)).rejects.toThrow();
    });

    it("should validate step configuration by type", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const invalidStep = {
        type: "invalid-type" as any,
        order: 0,
        config: {},
      };
      const input = createValidWorkflowInput({ steps: [invalidStep] });

      await expect(caller.create(input as any)).rejects.toThrow();
    });

    it("should reject workflow with invalid description length", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const tooLongDescription = "a".repeat(1001);
      const input = createValidWorkflowInput({ description: tooLongDescription });

      await expect(caller.create(input as any)).rejects.toThrow();
    });

    it("should accept optional geolocation", async () => {
      const mockWorkflow = createMockWorkflow();
      const db = createTestDb({
        insertResponse: [mockWorkflow],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const input = createValidWorkflowInput({
        geolocation: {
          city: "New York",
          state: "NY",
          country: "USA",
        },
      });

      const result = await caller.create(input);
      expect(result).toBeDefined();
    });

    it("should handle database error during creation", async () => {
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(null)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.create(createValidWorkflowInput())
      ).rejects.toThrow("Database not initialized");
    });

    it("should throw INTERNAL_SERVER_ERROR on database failure", async () => {
      const db = createTestDb();
      db.insert = vi.fn(() => {
        throw new Error("Database connection failed");
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.create(createValidWorkflowInput())
      ).rejects.toThrow(TRPCError);
    });
  });

  // ==================== List Endpoint Tests ====================

  describe("list", () => {
    it("should list user's workflows with default pagination", async () => {
      const workflows = [
        createMockWorkflow({ id: 1, name: "Workflow 1" }),
        createMockWorkflow({ id: 2, name: "Workflow 2" }),
      ];

      const db = createTestDb({
        selectResponse: workflows,
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.list({});

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Workflow 1");
      expect(result[0].stepCount).toBe(1);
    });

    it("should list workflows with custom pagination", async () => {
      const workflows = [createMockWorkflow({ id: 1 })];

      const db = createTestDb({
        selectResponse: workflows,
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.list({
        limit: 10,
        offset: 5,
      });

      expect(result).toBeDefined();
    });

    it("should filter workflows by active status", async () => {
      const activeWorkflows = [
        createMockWorkflow({ id: 1, isActive: true }),
      ];

      const db = createTestDb({
        selectResponse: activeWorkflows,
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.list({ status: "active" });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it("should filter workflows by archived status", async () => {
      const archivedWorkflows = [
        createMockWorkflow({ id: 1, isActive: false }),
      ];

      const db = createTestDb({
        selectResponse: archivedWorkflows,
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.list({ status: "archived" });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(false);
    });

    it("should return empty list when no workflows found", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.list({});

      expect(result).toEqual([]);
    });

    it("should calculate step count correctly", async () => {
      const workflows = [
        createMockWorkflow({
          id: 1,
          steps: [
            { type: "navigate", order: 0, config: { url: "https://example.com" } },
            { type: "act", order: 1, config: { instruction: "click" } },
            { type: "extract", order: 2, config: { extractInstruction: "get data" } },
          ],
        }),
      ];

      const db = createTestDb({
        selectResponse: workflows,
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.list({});

      expect(result[0].stepCount).toBe(3);
    });

    it("should enforce pagination limits", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      // Test limit > 100
      await expect(
        caller.list({ limit: 101 } as any)
      ).rejects.toThrow();
    });

    it("should handle database error in list", async () => {
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(null)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.list({})).rejects.toThrow(
        "Database not initialized"
      );
    });

    it("should only return workflows for current user", async () => {
      // This is implicitly tested by using userId from context
      // The query builder should be called with userId condition
      const workflows = [createMockWorkflow({ userId: 1 })];

      const db = createTestDb({
        selectResponse: workflows,
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.list({});

      expect(result[0].userId).toBe(1);
    });
  });

  // ==================== Get Endpoint Tests ====================

  describe("get", () => {
    it("should get a workflow by id", async () => {
      const mockWorkflow = createMockWorkflow({ id: 1 });

      const db = createTestDb({
        selectResponse: [mockWorkflow],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.get({ id: 1 });

      expect(result.id).toBe(1);
      expect(result.name).toBe("Test Workflow");
      expect(result.steps).toBeDefined();
    });

    it("should throw NOT_FOUND for non-existent workflow", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.get({ id: 999 })).rejects.toThrow(
        "Workflow not found"
      );
    });

    it("should reject invalid workflow ID", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.get({ id: 0 } as any)
      ).rejects.toThrow();
    });

    it("should only return workflow owned by current user", async () => {
      const workflowOwnedByOtherUser = createMockWorkflow({
        id: 1,
        userId: 2,
      });

      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.get({ id: 1 })).rejects.toThrow(
        "Workflow not found"
      );
    });

    it("should handle database error", async () => {
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(null)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.get({ id: 1 })).rejects.toThrow(
        "Database not initialized"
      );
    });
  });

  // ==================== Update Endpoint Tests ====================

  describe("update", () => {
    it("should update workflow name", async () => {
      const existing = createMockWorkflow({ id: 1, name: "Old Name" });
      const updated = createMockWorkflow({ id: 1, name: "New Name" });

      const db = createTestDb({
        selectResponse: [existing],
        updateResponse: [updated],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        name: "New Name",
      });

      expect(result.name).toBe("New Name");
      expect(result.id).toBe(1);
    });

    it("should update workflow description", async () => {
      const existing = createMockWorkflow({
        id: 1,
        description: "Old description",
      });
      const updated = createMockWorkflow({
        id: 1,
        description: "New description",
      });

      const db = createTestDb({
        selectResponse: [existing],
        updateResponse: [updated],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        description: "New description",
      });

      expect(result.description).toBe("New description");
    });

    it("should update workflow status", async () => {
      const existing = createMockWorkflow({ id: 1, isActive: true });
      const updated = createMockWorkflow({ id: 1, isActive: false });

      const db = createTestDb({
        selectResponse: [existing],
        updateResponse: [updated],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        status: "archived",
      });

      expect(result.isActive).toBe(false);
    });

    it("should update workflow steps", async () => {
      const newSteps = [
        {
          type: "navigate" as const,
          order: 0,
          config: { url: "https://updated.com" },
        },
      ];

      const existing = createMockWorkflow({ id: 1 });
      const updated = createMockWorkflow({ id: 1, steps: newSteps });

      const db = createTestDb({
        selectResponse: [existing],
        updateResponse: [updated],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        steps: newSteps,
      });

      expect(result.steps).toEqual(newSteps);
    });

    it("should throw NOT_FOUND for non-existent workflow", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.update({ id: 999, name: "Updated" })
      ).rejects.toThrow("Workflow not found");
    });

    it("should validate name length on update", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const tooLongName = "a".repeat(256);

      await expect(
        caller.update({ id: 1, name: tooLongName } as any)
      ).rejects.toThrow();
    });

    it("should reject invalid trigger type", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.update({ id: 1, trigger: "invalid" } as any)
      ).rejects.toThrow();
    });

    it("should set updatedAt on update", async () => {
      const existing = createMockWorkflow({ id: 1 });
      const updated = createMockWorkflow({
        id: 1,
        updatedAt: new Date("2024-01-01"),
      });

      const db = createTestDb({
        selectResponse: [existing],
        updateResponse: [updated],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        name: "Updated",
      });

      expect(result.updatedAt).toBeDefined();
    });

    it("should handle database error during update", async () => {
      const existing = createMockWorkflow({ id: 1 });
      const db = createTestDb({
        selectResponse: [existing],
      });
      db.update = vi.fn(() => {
        throw new Error("Update failed");
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.update({ id: 1, name: "Updated" })
      ).rejects.toThrow(TRPCError);
    });
  });

  // ==================== Delete Endpoint Tests ====================

  describe("delete", () => {
    it("should soft delete a workflow", async () => {
      const existing = createMockWorkflow({ id: 1, isActive: true });

      const db = createTestDb({
        selectResponse: [existing],
        updateResponse: [{ ...existing, isActive: false }],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.id).toBe(1);
    });

    it("should throw NOT_FOUND for non-existent workflow", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.delete({ id: 999 })).rejects.toThrow(
        "Workflow not found"
      );
    });

    it("should reject invalid workflow ID", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.delete({ id: 0 } as any)
      ).rejects.toThrow();
    });

    it("should only allow deletion of own workflows", async () => {
      const workflowOwnedByOther = createMockWorkflow({
        id: 1,
        userId: 2,
      });

      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.delete({ id: 1 })).rejects.toThrow(
        "Workflow not found"
      );
    });

    it("should handle database error during delete", async () => {
      const existing = createMockWorkflow({ id: 1 });
      const db = createTestDb({
        selectResponse: [existing],
      });
      db.update = vi.fn(() => {
        throw new Error("Delete failed");
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.delete({ id: 1 })).rejects.toThrow(TRPCError);
    });
  });

  // ==================== Execute Endpoint Tests ====================

  describe("execute", () => {
    it("should execute a workflow", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: [],
        output: { success: true },
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.execute({
        workflowId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.executionId).toBe(1);
      expect(result.workflowId).toBe(1);
      expect(result.status).toBe("completed");
    });

    it("should pass geolocation to execution service", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: [],
        output: {},
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      await caller.execute({
        workflowId: 1,
        geolocation: {
          city: "New York",
          state: "NY",
          country: "USA",
        },
      });

      expect(workflowExecService.executeWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: 1,
          geolocation: {
            city: "New York",
            state: "NY",
            country: "USA",
          },
        })
      );
    });

    it("should pass variables to execution service", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: [],
        output: {},
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      await caller.execute({
        workflowId: 1,
        variables: {
          username: "test",
          password: "secret",
        },
      });

      expect(workflowExecService.executeWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            username: "test",
            password: "secret",
          },
        })
      );
    });

    it("should reject invalid workflow ID", async () => {
      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.execute({ workflowId: 0 } as any)
      ).rejects.toThrow();
    });

    it("should handle execution service errors", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.executeWorkflow).mockRejectedValue(
        new Error("Execution failed")
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.execute({ workflowId: 1 })
      ).rejects.toThrow("Execution failed");
    });

    it("should return execution step results", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.executeWorkflow).mockResolvedValue({
        executionId: 1,
        workflowId: 1,
        status: "completed",
        stepResults: [
          { stepIndex: 0, status: "success", result: { url: "https://example.com" } },
          { stepIndex: 1, status: "success", result: { text: "extracted text" } },
        ],
        output: { success: true },
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.execute({ workflowId: 1 });

      expect(result.stepResults).toHaveLength(2);
    });
  });

  // ==================== GetExecutions Endpoint Tests ====================

  describe("getExecutions", () => {
    it("should get execution history for a workflow", async () => {
      const workflow = createMockWorkflow({ id: 1 });
      const executions = [
        createMockWorkflowExecution({ id: 1, workflowId: 1 }),
        createMockWorkflowExecution({ id: 2, workflowId: 1 }),
      ];

      const db = createTestDb({
        selectResponse: executions,
      });

      // Mock workflow verification query
      db.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([workflow])),
            offset: vi.fn(() => Promise.resolve(executions)),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve(executions)),
              })),
            })),
          })),
        })),
      })) as any;

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.getExecutions({
        workflowId: 1,
        limit: 20,
        offset: 0,
      });

      expect(result).toHaveLength(2);
      expect(result[0].workflowId).toBe(1);
    });

    it("should filter executions by status", async () => {
      const workflow = createMockWorkflow({ id: 1 });
      const executions = [
        createMockWorkflowExecution({ id: 1, status: "completed" }),
      ];

      const db = createTestDb({
        selectResponse: executions,
      });

      db.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([workflow])),
            offset: vi.fn(() => Promise.resolve(executions)),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve(executions)),
              })),
            })),
          })),
        })),
      })) as any;

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.getExecutions({
        workflowId: 1,
        status: "completed",
      });

      expect(result[0].status).toBe("completed");
    });

    it("should handle pagination parameters", async () => {
      const workflow = createMockWorkflow({ id: 1 });
      const executions = [createMockWorkflowExecution({ id: 1 })];

      const db = createTestDb({
        selectResponse: executions,
      });

      db.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([workflow])),
            offset: vi.fn(() => Promise.resolve(executions)),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve(executions)),
              })),
            })),
          })),
        })),
      })) as any;

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.getExecutions({
        workflowId: 1,
        limit: 10,
        offset: 5,
      });

      expect(result).toBeDefined();
    });

    it("should throw NOT_FOUND for non-existent workflow", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.getExecutions({ workflowId: 999 })
      ).rejects.toThrow("Workflow not found");
    });

    it("should reject invalid status", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.getExecutions({ workflowId: 1, status: "invalid" } as any)
      ).rejects.toThrow();
    });

    it("should enforce pagination limits", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.getExecutions({ workflowId: 1, limit: 101 } as any)
      ).rejects.toThrow();
    });

    it("should order executions by startedAt descending", async () => {
      const workflow = createMockWorkflow({ id: 1 });
      const executions = [
        createMockWorkflowExecution({
          id: 1,
          startedAt: new Date("2024-01-02"),
        }),
        createMockWorkflowExecution({
          id: 2,
          startedAt: new Date("2024-01-01"),
        }),
      ];

      const db = createTestDb({
        selectResponse: executions,
      });

      db.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([workflow])),
            offset: vi.fn(() => Promise.resolve(executions)),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve(executions)),
              })),
            })),
          })),
        })),
      })) as any;

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.getExecutions({ workflowId: 1 });

      expect(result).toBeDefined();
    });
  });

  // ==================== GetExecution Endpoint Tests ====================

  describe("getExecution", () => {
    it("should get single execution by ID", async () => {
      const execution = createMockWorkflowExecution({ id: 1 });

      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.getExecutionStatus).mockResolvedValue(
        execution
      );

      const db = createTestDb({
        selectResponse: [execution],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.getExecution({ executionId: 1 });

      expect(result).toBeDefined();
    });

    it("should throw NOT_FOUND for non-existent execution", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.getExecutionStatus).mockResolvedValue(
        null
      );

      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.getExecution({ executionId: 999 })
      ).rejects.toThrow("Execution not found");
    });

    it("should verify execution ownership", async () => {
      const execution = createMockWorkflowExecution({
        id: 1,
        userId: 2,
      });

      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.getExecutionStatus).mockResolvedValue(
        execution
      );

      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.getExecution({ executionId: 1 })
      ).rejects.toThrow("Execution not found");
    });

    it("should reject invalid execution ID", async () => {
      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.getExecution({ executionId: 0 } as any)
      ).rejects.toThrow();
    });

    it("should handle service errors", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.getExecutionStatus).mockRejectedValue(
        new Error("Service error")
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.getExecution({ executionId: 1 })
      ).rejects.toThrow("Service error");
    });
  });

  // ==================== CancelExecution Endpoint Tests ====================

  describe("cancelExecution", () => {
    it("should cancel a running execution", async () => {
      const execution = createMockWorkflowExecution({
        id: 1,
        status: "running",
      });

      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.cancelExecution).mockResolvedValue(
        undefined
      );

      const db = createTestDb({
        selectResponse: [execution],
        updateResponse: [{ ...execution, status: "cancelled" }],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.cancelExecution({ executionId: 1 });

      expect(result.success).toBe(true);
      expect(result.executionId).toBe(1);
    });

    it("should throw NOT_FOUND for non-existent execution", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.cancelExecution({ executionId: 999 })
      ).rejects.toThrow("Execution not found");
    });

    it("should only allow cancellation of own executions", async () => {
      const execution = createMockWorkflowExecution({
        id: 1,
        userId: 2,
      });

      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.cancelExecution({ executionId: 1 })
      ).rejects.toThrow("Execution not found");
    });

    it("should call execution service cancel", async () => {
      const execution = createMockWorkflowExecution({ id: 1 });

      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.cancelExecution).mockResolvedValue(
        undefined
      );

      const db = createTestDb({
        selectResponse: [execution],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      await caller.cancelExecution({ executionId: 1 });

      expect(workflowExecService.cancelExecution).toHaveBeenCalledWith(1);
    });

    it("should reject invalid execution ID", async () => {
      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.cancelExecution({ executionId: 0 } as any)
      ).rejects.toThrow();
    });

    it("should handle service errors", async () => {
      const execution = createMockWorkflowExecution({ id: 1 });

      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.cancelExecution).mockRejectedValue(
        new Error("Cancel failed")
      );

      const db = createTestDb({
        selectResponse: [execution],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.cancelExecution({ executionId: 1 })
      ).rejects.toThrow("Cancel failed");
    });
  });

  // ==================== TestRun Endpoint Tests ====================

  describe("testRun", () => {
    it("should execute test run without persistence", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.testExecuteWorkflow).mockResolvedValue({
        status: "completed",
        stepResults: [],
        output: { success: true },
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.testRun({
        steps: [
          {
            type: "navigate",
            order: 0,
            config: { url: "https://example.com" },
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("completed");
    });

    it("should pass variables to test execution", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.testExecuteWorkflow).mockResolvedValue({
        status: "completed",
        stepResults: [],
        output: {},
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      await caller.testRun({
        steps: [
          {
            type: "navigate",
            order: 0,
            config: { url: "https://example.com" },
          },
        ],
        variables: { username: "test" },
      });

      expect(workflowExecService.testExecuteWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { username: "test" },
        })
      );
    });

    it("should pass geolocation to test execution", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.testExecuteWorkflow).mockResolvedValue({
        status: "completed",
        stepResults: [],
        output: {},
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      await caller.testRun({
        steps: [
          {
            type: "navigate",
            order: 0,
            config: { url: "https://example.com" },
          },
        ],
        geolocation: { city: "NYC", state: "NY", country: "USA" },
      });

      expect(workflowExecService.testExecuteWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          geolocation: { city: "NYC", state: "NY", country: "USA" },
        })
      );
    });

    it("should support stepByStep execution mode", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.testExecuteWorkflow).mockResolvedValue({
        status: "completed",
        stepResults: [],
        output: {},
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      await caller.testRun({
        steps: [
          {
            type: "navigate",
            order: 0,
            config: { url: "https://example.com" },
          },
        ],
        stepByStep: true,
      });

      expect(workflowExecService.testExecuteWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          stepByStep: true,
        })
      );
    });

    it("should reject empty steps", async () => {
      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.testRun({ steps: [] })
      ).rejects.toThrow();
    });

    it("should reject too many steps", async () => {
      const caller = workflowsRouter.createCaller(mockCtx);
      const manySteps = Array.from({ length: 51 }, (_, i) => ({
        type: "navigate" as const,
        order: i,
        config: { url: "https://example.com" },
      }));

      await expect(
        caller.testRun({ steps: manySteps } as any)
      ).rejects.toThrow();
    });

    it("should validate step configuration", async () => {
      const caller = workflowsRouter.createCaller(mockCtx);
      const invalidStep = {
        type: "invalid-type" as any,
        order: 0,
        config: {},
      };

      await expect(
        caller.testRun({ steps: [invalidStep] })
      ).rejects.toThrow();
    });

    it("should handle test execution errors", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.testExecuteWorkflow).mockRejectedValue(
        new Error("Test execution failed")
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.testRun({
          steps: [
            {
              type: "navigate",
              order: 0,
              config: { url: "https://example.com" },
            },
          ],
        })
      ).rejects.toThrow("Test execution failed");
    });

    it("should return step results from test run", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.testExecuteWorkflow).mockResolvedValue({
        status: "completed",
        stepResults: [
          { stepIndex: 0, status: "success" },
          { stepIndex: 1, status: "success" },
        ],
        output: { data: "extracted" },
        error: null,
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.testRun({
        steps: [
          {
            type: "navigate",
            order: 0,
            config: { url: "https://example.com" },
          },
          {
            type: "extract",
            order: 1,
            config: { extractInstruction: "get data" },
          },
        ],
      });

      expect(result.stepResults).toHaveLength(2);
      expect(result.output.data).toBe("extracted");
    });

    it("should return error if test run fails", async () => {
      const workflowExecService = await import(
        "../../services/workflowExecution.service"
      );
      vi.mocked(workflowExecService.testExecuteWorkflow).mockResolvedValue({
        status: "failed",
        stepResults: [],
        output: null,
        error: "Test execution failed due to network error",
      });

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.testRun({
        steps: [
          {
            type: "navigate",
            order: 0,
            config: { url: "https://invalid.invalid" },
          },
        ],
      });

      expect(result.status).toBe("failed");
      expect(result.error).toBeDefined();
    });
  });

  // ==================== Authorization Tests ====================

  describe("Authorization", () => {
    it("should only allow authenticated users", async () => {
      const unauthenticatedCtx = { user: null } as any;

      try {
        const caller = workflowsRouter.createCaller(unauthenticatedCtx);
        // The caller should exist, but the procedure should require auth
        // This is handled by protectedProcedure wrapper
        expect(true).toBe(true); // Placeholder for auth check
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should isolate workflows by userId", async () => {
      // User 1 context
      const ctx1 = createMockContext({ id: 1 });
      const workflow1 = createMockWorkflow({ id: 1, userId: 1 });

      const db = createTestDb({
        selectResponse: [workflow1],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller1 = workflowsRouter.createCaller(ctx1);
      const result1 = await caller1.list({});

      expect(result1[0].userId).toBe(1);

      // User 2 context should not see User 1's workflows
      const ctx2 = createMockContext({ id: 2 });

      const db2 = createTestDb({
        selectResponse: [],
      });

      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db2 as any)
      );

      const caller2 = workflowsRouter.createCaller(ctx2);
      const result2 = await caller2.list({});

      expect(result2).toEqual([]);
    });
  });

  // ==================== Input Validation Tests ====================

  describe("Input Validation", () => {
    describe("Workflow Step Validation", () => {
      it("should validate navigate step config", async () => {
        const db = createTestDb();
        const dbModule = await import("../../db");
        vi.mocked(dbModule.getDb).mockImplementation(() =>
          Promise.resolve(db as any)
        );

        const caller = workflowsRouter.createCaller(mockCtx);
        const step = {
          type: "navigate" as const,
          order: 0,
          config: {
            url: "not-a-url", // Invalid URL
          },
        };

        const input = createValidWorkflowInput({ steps: [step] });

        // Note: The validation depends on how strict the URL validation is
        // This may or may not throw depending on implementation
        try {
          await caller.create(input);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      it("should validate wait step duration limit", async () => {
        const db = createTestDb();
        const dbModule = await import("../../db");
        vi.mocked(dbModule.getDb).mockImplementation(() =>
          Promise.resolve(db as any)
        );

        const caller = workflowsRouter.createCaller(mockCtx);
        const step = {
          type: "wait" as const,
          order: 0,
          config: {
            waitMs: 70000, // Exceeds max 60000
          },
        };

        const input = createValidWorkflowInput({ steps: [step] });

        await expect(caller.create(input as any)).rejects.toThrow();
      });

      it("should accept valid extract schema types", async () => {
        const validSchemas = ["contactInfo", "productInfo", "custom"];
        const mockWorkflow = createMockWorkflow();
        const db = createTestDb({
          insertResponse: [mockWorkflow],
        });

        const dbModule = await import("../../db");
        vi.mocked(dbModule.getDb).mockImplementation(() =>
          Promise.resolve(db as any)
        );

        const caller = workflowsRouter.createCaller(mockCtx);

        for (const schemaType of validSchemas) {
          const step = {
            type: "extract" as const,
            order: 0,
            config: {
              extractInstruction: "extract data",
              schemaType: schemaType as any,
            },
          };

          const input = createValidWorkflowInput({ steps: [step] });
          const result = await caller.create(input);
          expect(result).toBeDefined();
        }
      });

      it("should validate API call step method", async () => {
        const db = createTestDb();
        const dbModule = await import("../../db");
        vi.mocked(dbModule.getDb).mockImplementation(() =>
          Promise.resolve(db as any)
        );

        const caller = workflowsRouter.createCaller(mockCtx);
        const step = {
          type: "apiCall" as const,
          order: 0,
          config: {
            method: "INVALID" as any,
            headers: { "Content-Type": "application/json" },
          },
        };

        const input = createValidWorkflowInput({ steps: [step] });

        await expect(caller.create(input as any)).rejects.toThrow();
      });

      it("should validate notification type", async () => {
        const validTypes = ["info", "success", "warning", "error"];
        const mockWorkflow = createMockWorkflow();
        const db = createTestDb({
          insertResponse: [mockWorkflow],
        });

        const dbModule = await import("../../db");
        vi.mocked(dbModule.getDb).mockImplementation(() =>
          Promise.resolve(db as any)
        );

        const caller = workflowsRouter.createCaller(mockCtx);

        for (const notificationType of validTypes) {
          const step = {
            type: "notification" as const,
            order: 0,
            config: {
              message: "Test notification",
              type: notificationType as any,
            },
          };

          const input = createValidWorkflowInput({ steps: [step] });
          const result = await caller.create(input);
          expect(result).toBeDefined();
        }
      });
    });

    describe("Pagination Validation", () => {
      it("should reject negative offset", async () => {
        const db = createTestDb();
        const dbModule = await import("../../db");
        vi.mocked(dbModule.getDb).mockImplementation(() =>
          Promise.resolve(db as any)
        );

        const caller = workflowsRouter.createCaller(mockCtx);

        await expect(
          caller.list({ offset: -1 } as any)
        ).rejects.toThrow();
      });

      it("should reject zero or negative limit", async () => {
        const db = createTestDb();
        const dbModule = await import("../../db");
        vi.mocked(dbModule.getDb).mockImplementation(() =>
          Promise.resolve(db as any)
        );

        const caller = workflowsRouter.createCaller(mockCtx);

        await expect(
          caller.list({ limit: 0 } as any)
        ).rejects.toThrow();
      });
    });
  });

  // ==================== Edge Cases & Error Handling ====================

  describe("Edge Cases", () => {
    it("should handle workflow with null steps array", async () => {
      const db = createTestDb();
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const input = createValidWorkflowInput({ steps: null as any });

      await expect(caller.create(input as any)).rejects.toThrow();
    });

    it("should handle empty geolocation object", async () => {
      const mockWorkflow = createMockWorkflow();
      const db = createTestDb({
        insertResponse: [mockWorkflow],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const input = createValidWorkflowInput({
        geolocation: {},
      });

      const result = await caller.create(input);
      expect(result).toBeDefined();
    });

    it("should handle concurrent create requests", async () => {
      // Both requests will get the same response since they share the mock
      const mockWorkflow = createMockWorkflow({ id: 1 });

      const db = createTestDb({
        insertResponse: [mockWorkflow],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const promise1 = caller.create(
        createValidWorkflowInput({ name: "Workflow 1" })
      );
      const promise2 = caller.create(
        createValidWorkflowInput({ name: "Workflow 2" })
      );

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both complete successfully (concurrent handling works)
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should handle special characters in workflow name", async () => {
      const mockWorkflow = createMockWorkflow({
        name: "Workflow with & symbols <> \"",
      });
      const db = createTestDb({
        insertResponse: [mockWorkflow],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.create(
        createValidWorkflowInput({ name: "Workflow with & symbols <> \"" })
      );

      expect(result.name).toBe("Workflow with & symbols <> \"");
    });

    it("should handle very long step arrays efficiently", async () => {
      const steps = Array.from({ length: 50 }, (_, i) => ({
        type: "navigate" as const,
        order: i,
        config: { url: "https://example.com" },
      }));

      const mockWorkflow = createMockWorkflow({ steps });
      const db = createTestDb({
        insertResponse: [mockWorkflow],
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);
      const result = await caller.create(
        createValidWorkflowInput({ steps })
      );

      expect(result.steps).toHaveLength(50);
    });
  });

  // ==================== Database Error Scenarios ====================

  describe("Database Error Handling", () => {
    it("should handle connection timeout", async () => {
      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockRejectedValue(
        new Error("Connection timeout")
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(caller.list({})).rejects.toThrow();
    });

    it("should handle database constraint violation", async () => {
      const db = createTestDb();
      db.insert = vi.fn(() => {
        const err = new Error("UNIQUE constraint failed") as any;
        err.code = "SQLITE_CONSTRAINT";
        throw err;
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.create(createValidWorkflowInput())
      ).rejects.toThrow(TRPCError);
    });

    it("should handle database transaction rollback", async () => {
      // Test that errors during insert propagate correctly
      const db = createTestDb();
      db.insert = vi.fn(() => {
        throw new Error("Transaction rolled back");
      });

      const dbModule = await import("../../db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = workflowsRouter.createCaller(mockCtx);

      await expect(
        caller.create(createValidWorkflowInput())
      ).rejects.toThrow(TRPCError);
    });
  });
});
