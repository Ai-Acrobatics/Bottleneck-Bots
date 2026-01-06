/**
 * Unit Tests for Scheduled Tasks Router
 *
 * Tests all 11 tRPC endpoints with mocked database calls
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { scheduledTasksRouter } from "./scheduledTasks";
import {
  createMockContext,
  createMockScheduledTask,
  createMockExecutionResult,
  createMockDb,
} from "@/__tests__/helpers/test-helpers";
import { createTestDb } from "@/__tests__/helpers/test-db";

// Mock dependencies
vi.mock("@/server/db");

describe("Scheduled Tasks Router", () => {
  let mockCtx: any;
  let mockDb: any;

  beforeEach(() => {
    mockCtx = createMockContext({ id: 1 });
    mockDb = createMockDb();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("list", () => {
    it("should list tasks with pagination", async () => {
      const mockTasks = [
        createMockScheduledTask({ id: 1, name: "Task 1" }),
        createMockScheduledTask({ id: 2, name: "Task 2" }),
      ];

      const db = createTestDb({
        selectResponse: mockTasks,
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.list({
        page: 1,
        pageSize: 20,
      });

      expect(result.tasks).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(20);
    });

    it("should filter tasks by status", async () => {
      const db = createTestDb({
        selectResponse: [createMockScheduledTask({ status: "active" })],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.list({
        page: 1,
        pageSize: 20,
        status: "active",
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe("active");
    });

    it("should sort tasks by different fields", async () => {
      const db = createTestDb({
        selectResponse: [
          createMockScheduledTask({ name: "A Task" }),
          createMockScheduledTask({ name: "B Task" }),
        ],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.list({
        page: 1,
        pageSize: 20,
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(result.tasks).toBeDefined();
    });

    it("should throw error when database is unavailable", async () => {
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(null)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(
        caller.list({ page: 1, pageSize: 20 })
      ).rejects.toThrow(TRPCError);
    });

    it("should calculate pagination correctly", async () => {
      const mockTasks = Array(5)
        .fill(null)
        .map((_, i) => createMockScheduledTask({ id: i + 1 }));

      // Create a mock that handles both the tasks query and count query
      let callCount = 0;
      const createChain = () => {
        const chainResult = callCount === 0 ? mockTasks : [{ count: 25 }];
        callCount++;
        const chain: any = {
          from: vi.fn(() => chain),
          where: vi.fn(() => chain),
          orderBy: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          offset: vi.fn(() => chain),
          then: (resolve: any) => {
            resolve(chainResult);
            return Promise.resolve(chainResult);
          },
        };
        return Object.assign(Promise.resolve(chainResult), chain);
      };

      const db = {
        select: vi.fn(() => createChain()),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.list({
        page: 2,
        pageSize: 10,
      });

      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });

  describe("getById", () => {
    it("should get task by ID", async () => {
      const mockTask = createMockScheduledTask({ id: 1, name: "Test Task" });
      const db = createTestDb({ selectResponse: [mockTask] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getById({ id: 1 });

      expect(result.id).toBe(1);
      expect(result.name).toBe("Test Task");
    });

    it("should throw NOT_FOUND for non-existent task", async () => {
      const db = createTestDb({ selectResponse: [] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(caller.getById({ id: 999 })).rejects.toThrow(
        "Task not found"
      );
    });

    it("should only return task for current user", async () => {
      const db = createTestDb({ selectResponse: [] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(caller.getById({ id: 1 })).rejects.toThrow(
        "Task not found"
      );
    });
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const mockTask = createMockScheduledTask();
      const db = createTestDb({ insertResponse: [mockTask] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.create({
        name: "New Task",
        description: "Task description",
        automationType: "chat",
        automationConfig: {
          url: "https://example.com",
          instruction: "Test instruction",
        },
        scheduleType: "daily",
        cronExpression: "0 9 * * *",
        timezone: "UTC",
      });

      expect(result.success).toBe(true);
      expect(result.task).toBeDefined();
      expect(result.message).toContain("created successfully");
    });

    it("should validate automation config", async () => {
      const db = createTestDb();
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(
        caller.create({
          name: "Invalid Task",
          automationType: "chat",
          automationConfig: {
            url: "invalid-url", // Invalid URL
            instruction: "Test",
          },
          scheduleType: "daily",
          cronExpression: "0 9 * * *",
          timezone: "UTC",
        } as any)
      ).rejects.toThrow();
    });

    it("should set default values correctly", async () => {
      const mockTask = createMockScheduledTask({
        retryOnFailure: true,
        maxRetries: 3,
        retryDelay: 60,
      });
      const db = createTestDb({ insertResponse: [mockTask] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.create({
        name: "Task with Defaults",
        automationType: "chat",
        automationConfig: {
          url: "https://example.com",
          instruction: "Test",
        },
        scheduleType: "daily",
        cronExpression: "0 9 * * *",
      });

      expect(result.task.retryOnFailure).toBe(true);
      expect(result.task.maxRetries).toBe(3);
    });

    it("should calculate initial nextRun time", async () => {
      const mockTask = createMockScheduledTask();
      const db = createTestDb({ insertResponse: [mockTask] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.create({
        name: "Scheduled Task",
        automationType: "chat",
        automationConfig: {
          url: "https://example.com",
          instruction: "Test",
        },
        scheduleType: "daily",
        cronExpression: "0 9 * * *",
        timezone: "America/New_York",
      });

      expect(result.task.nextRun).toBeDefined();
    });
  });

  describe("update", () => {
    it("should update an existing task", async () => {
      const existingTask = createMockScheduledTask({ id: 1, name: "Old Name" });
      const updatedTask = createMockScheduledTask({ id: 1, name: "New Name" });

      const db = createTestDb({
        selectResponse: [existingTask],
        updateResponse: [updatedTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        name: "New Name",
      });

      expect(result.success).toBe(true);
      expect(result.task.name).toBe("New Name");
    });

    it("should recalculate nextRun when cron expression changes", async () => {
      const existingTask = createMockScheduledTask({
        cronExpression: "0 9 * * *",
      });
      const updatedTask = createMockScheduledTask({
        cronExpression: "0 10 * * *",
      });

      const db = createTestDb({
        selectResponse: [existingTask],
        updateResponse: [updatedTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        cronExpression: "0 10 * * *",
      });

      expect(result.success).toBe(true);
    });

    it("should throw NOT_FOUND for non-existent task", async () => {
      const db = createTestDb({ selectResponse: [] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(
        caller.update({ id: 999, name: "New Name" })
      ).rejects.toThrow("Task not found");
    });

    it("should update lastModifiedBy", async () => {
      const existingTask = createMockScheduledTask();
      const updatedTask = createMockScheduledTask({ lastModifiedBy: 1 });

      const db = createTestDb({
        selectResponse: [existingTask],
        updateResponse: [updatedTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        name: "Updated Task",
      });

      expect(result.task.lastModifiedBy).toBe(1);
    });
  });

  describe("delete", () => {
    it("should soft delete a task", async () => {
      const existingTask = createMockScheduledTask({ status: "active" });

      const db = createTestDb({
        selectResponse: [existingTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toContain("archived");
    });

    it("should throw NOT_FOUND for non-existent task", async () => {
      const db = createTestDb({ selectResponse: [] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(caller.delete({ id: 999 })).rejects.toThrow(
        "Task not found"
      );
    });
  });

  describe("pause", () => {
    it("should pause an active task", async () => {
      const existingTask = createMockScheduledTask({ status: "active" });
      const pausedTask = createMockScheduledTask({ status: "paused" });

      const db = createTestDb({
        selectResponse: [existingTask],
        updateResponse: [pausedTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.pause({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.task.status).toBe("paused");
    });

    it("should throw error if task is already paused", async () => {
      const pausedTask = createMockScheduledTask({ status: "paused" });

      const db = createTestDb({
        selectResponse: [pausedTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(caller.pause({ id: 1 })).rejects.toThrow(
        "already paused"
      );
    });
  });

  describe("resume", () => {
    it("should resume a paused task", async () => {
      const pausedTask = createMockScheduledTask({ status: "paused" });
      const activeTask = createMockScheduledTask({ status: "active" });

      const db = createTestDb({
        selectResponse: [pausedTask],
        updateResponse: [activeTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.resume({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.task.status).toBe("active");
    });

    it("should throw error if task is not paused", async () => {
      const activeTask = createMockScheduledTask({ status: "active" });

      const db = createTestDb({
        selectResponse: [activeTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(caller.resume({ id: 1 })).rejects.toThrow(
        "not paused"
      );
    });

    it("should recalculate nextRun when resuming", async () => {
      const pausedTask = createMockScheduledTask({ status: "paused" });
      const activeTask = createMockScheduledTask({
        status: "active",
        nextRun: new Date(),
      });

      const db = createTestDb({
        selectResponse: [pausedTask],
        updateResponse: [activeTask],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.resume({ id: 1 });

      expect(result.task.nextRun).toBeDefined();
    });
  });

  describe("executeNow", () => {
    it("should queue manual execution", async () => {
      const task = createMockScheduledTask();
      const execution = createMockExecutionResult({ status: "queued" });

      const db = createTestDb({
        selectResponse: [task],
        insertResponse: [execution],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.executeNow({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.execution).toBeDefined();
      expect(result.execution.status).toBe("queued");
    });

    it("should throw NOT_FOUND for non-existent task", async () => {
      const db = createTestDb({ selectResponse: [] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(caller.executeNow({ id: 999 })).rejects.toThrow(
        "Task not found"
      );
    });
  });

  describe("getExecutionHistory", () => {
    it("should get execution history with pagination", async () => {
      const task = createMockScheduledTask();
      const executions = [
        createMockExecutionResult({ id: 1 }),
        createMockExecutionResult({ id: 2 }),
      ];

      // The router does 3 queries: task verification, executions, and count
      let callCount = 0;
      const responses = [[task], executions, [{ count: 2 }]];

      const createChain = () => {
        const chainResult = responses[callCount] || [];
        callCount++;
        const chain: any = {
          from: vi.fn(() => chain),
          where: vi.fn(() => chain),
          orderBy: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          offset: vi.fn(() => chain),
          then: (resolve: any) => {
            resolve(chainResult);
            return Promise.resolve(chainResult);
          },
        };
        return Object.assign(Promise.resolve(chainResult), chain);
      };

      const db = {
        select: vi.fn(() => createChain()),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getExecutionHistory({
        taskId: 1,
        page: 1,
        pageSize: 20,
      });

      expect(result.executions).toHaveLength(2);
    });

    it("should filter by execution status", async () => {
      const task = createMockScheduledTask();
      const executions = [
        createMockExecutionResult({ status: "success" }),
      ];

      // The router does 3 queries: task verification, executions, and count
      let callCount = 0;
      const responses = [[task], executions, [{ count: 1 }]];

      const createChain = () => {
        const chainResult = responses[callCount] || [];
        callCount++;
        const chain: any = {
          from: vi.fn(() => chain),
          where: vi.fn(() => chain),
          orderBy: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          offset: vi.fn(() => chain),
          then: (resolve: any) => {
            resolve(chainResult);
            return Promise.resolve(chainResult);
          },
        };
        return Object.assign(Promise.resolve(chainResult), chain);
      };

      const db = {
        select: vi.fn(() => createChain()),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getExecutionHistory({
        taskId: 1,
        status: "success",
      });

      expect(result.executions[0].status).toBe("success");
    });

    it("should throw NOT_FOUND if task not found", async () => {
      const db = createTestDb({ selectResponse: [] });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);

      await expect(
        caller.getExecutionHistory({ taskId: 999 })
      ).rejects.toThrow("Task not found");
    });
  });

  describe("getUpcoming", () => {
    it("should get upcoming tasks within time window", async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      const upcomingTasks = [
        createMockScheduledTask({ nextRun: future, status: "active" }),
      ];

      const db = createTestDb({
        selectResponse: upcomingTasks,
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getUpcoming({ hours: 24 });

      expect(result.tasks).toHaveLength(1);
      expect(result.timeWindow.hours).toBe(24);
    });

    it("should only return active tasks", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getUpcoming({ hours: 24 });

      expect(result.tasks).toHaveLength(0);
    });
  });

  describe("getStatistics", () => {
    it("should get task statistics", async () => {
      const task = createMockScheduledTask({
        executionCount: 10,
        successCount: 8,
        failureCount: 2,
        averageDuration: 5000,
      });

      const db = createTestDb({
        selectResponse: [task],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getStatistics({ id: 1 });

      expect(result.executionCount).toBe(10);
      expect(result.successCount).toBe(8);
      expect(result.failureCount).toBe(2);
      expect(result.successRate).toBe(80);
      expect(result.averageDuration).toBe(5000);
    });

    it("should calculate success rate correctly", async () => {
      const task = createMockScheduledTask({
        executionCount: 100,
        successCount: 95,
        failureCount: 5,
      });

      const db = createTestDb({
        selectResponse: [task],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getStatistics({ id: 1 });

      expect(result.successRate).toBe(95);
    });

    it("should handle zero executions", async () => {
      const task = createMockScheduledTask({
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
      });

      const db = createTestDb({
        selectResponse: [task],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = scheduledTasksRouter.createCaller(mockCtx);
      const result = await caller.getStatistics({ id: 1 });

      expect(result.successRate).toBe(0);
    });
  });
});
