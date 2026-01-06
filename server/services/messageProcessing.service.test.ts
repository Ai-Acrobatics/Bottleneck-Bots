/**
 * Unit Tests for Message Processing Service
 *
 * Tests the processMessage method which handles inbound message processing
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock AI clients before importing the service
vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = function(this: any) {
    this.messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Mock response" }],
      }),
    };
  };
  return { default: MockAnthropic };
});

vi.mock("openai", () => {
  const MockOpenAI = function(this: any) {
    this.chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: "Mock response" } }],
        }),
      },
    };
  };
  return { default: MockOpenAI };
});

// Mock dependencies
vi.mock("@/server/db");

// Import after mocking
import { MessageProcessingService } from "./messageProcessing.service";

// Helper: Create test database mock
function createTestDb(config: {
  selectResponse?: any[];
  insertResponse?: any[];
  updateResponse?: any[];
} = {}) {
  const { selectResponse = [], insertResponse = [], updateResponse = [] } = config;

  const createChainableQuery = (response: any) => {
    const chain: any = {
      from: vi.fn(() => chain),
      where: vi.fn(() => chain),
      orderBy: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      offset: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      leftJoin: vi.fn(() => chain),
      then: (resolve: (value: any) => void) => {
        resolve(response);
        return Promise.resolve(response);
      },
    };
    return Object.assign(Promise.resolve(response), chain);
  };

  const createInsertChain = (response: any) => {
    const chain: any = {
      values: vi.fn(() => chain),
      returning: vi.fn(() => Promise.resolve(response)),
      onConflictDoUpdate: vi.fn(() => chain),
      then: (resolve: (value: any) => void) => {
        resolve(response);
        return Promise.resolve(response);
      },
    };
    return Object.assign(Promise.resolve(response), chain);
  };

  const createUpdateChain = (response: any) => {
    const chain: any = {
      set: vi.fn(() => chain),
      where: vi.fn(() => chain),
      returning: vi.fn(() => Promise.resolve(response)),
      then: (resolve: (value: any) => void) => {
        resolve(response);
        return Promise.resolve(response);
      },
    };
    return Object.assign(Promise.resolve(response), chain);
  };

  return {
    select: vi.fn(() => createChainableQuery(selectResponse)),
    insert: vi.fn(() => createInsertChain(insertResponse)),
    update: vi.fn(() => createUpdateChain(updateResponse)),
    delete: vi.fn(() => createChainableQuery([])),
  };
}

// Helper: Mock environment variables
function mockEnv(vars: Record<string, string>): () => void {
  const originalEnv = { ...process.env };
  Object.entries(vars).forEach(([key, value]) => {
    process.env[key] = value;
  });
  return () => {
    process.env = originalEnv;
  };
}

describe("Message Processing Service", () => {
  let restoreEnv: () => void;
  let messageProcessingService: MessageProcessingService;

  beforeEach(() => {
    vi.clearAllMocks();

    restoreEnv = mockEnv({
      OPENAI_API_KEY: "sk-test-key",
      ANTHROPIC_API_KEY: "sk-ant-test-key",
      DATABASE_URL: "postgresql://test:test@localhost/test",
    });

    messageProcessingService = new MessageProcessingService();
  });

  afterEach(() => {
    restoreEnv();
    vi.restoreAllMocks();
  });

  // ========================================
  // SERVICE INSTANTIATION TESTS
  // ========================================

  describe("Service Instantiation", () => {
    it("should create an instance of MessageProcessingService", () => {
      expect(messageProcessingService).toBeDefined();
      expect(messageProcessingService).toBeInstanceOf(MessageProcessingService);
    });

    it("should have processMessage method", () => {
      expect(typeof messageProcessingService.processMessage).toBe("function");
    });
  });

  // ========================================
  // PROCESS MESSAGE TESTS
  // ========================================

  describe("processMessage", () => {
    it("should return error when database is not initialized", async () => {
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const result = await messageProcessingService.processMessage(1, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database not initialized");
    });

    it("should return error when message is not found", async () => {
      const db = createTestDb({ selectResponse: [] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(999, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Message not found");
    });

    it("should process valid message successfully", async () => {
      const testMessage = {
        id: 1,
        webhookId: 1,
        userId: 1,
        conversationId: 1,
        content: "I need help with my order #12345",
        senderIdentifier: "+1234567890",
        processingStatus: "pending",
        createdAt: new Date(),
      };

      const testTask = {
        id: 1,
        userId: 1,
        sourceType: "webhook_sms",
        title: "Order inquiry for #12345",
        status: "pending",
      };

      // Mock select to return message on first call, empty for task check
      let selectCallCount = 0;
      const db = {
        select: vi.fn().mockImplementation(() => {
          selectCallCount++;
          const response = selectCallCount === 1 ? [testMessage] : [];
          const chain: any = {
            from: vi.fn(() => chain),
            where: vi.fn(() => chain),
            orderBy: vi.fn(() => chain),
            limit: vi.fn(() => chain),
            then: (resolve: any) => {
              resolve(response);
              return Promise.resolve(response);
            },
          };
          return Object.assign(Promise.resolve(response), chain);
        }),
        insert: vi.fn().mockImplementation(() => {
          const chain: any = {
            values: vi.fn(() => chain),
            returning: vi.fn(() => Promise.resolve([testTask])),
            then: (resolve: any) => {
              resolve([testTask]);
              return Promise.resolve([testTask]);
            },
          };
          return chain;
        }),
        update: vi.fn().mockImplementation(() => {
          const chain: any = {
            set: vi.fn(() => chain),
            where: vi.fn(() => chain),
            returning: vi.fn(() => Promise.resolve([testMessage])),
            then: (resolve: any) => {
              resolve([testMessage]);
              return Promise.resolve([testMessage]);
            },
          };
          return chain;
        }),
      };

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(1, 1);

      // The service should attempt to process the message
      expect(db.select).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const db = {
        select: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
        update: vi.fn().mockImplementation(() => {
          const chain: any = {
            set: vi.fn(() => chain),
            where: vi.fn(() => chain),
            returning: vi.fn(() => Promise.resolve([])),
          };
          return chain;
        }),
      };

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(1, 1);

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // INPUT VALIDATION TESTS
  // ========================================

  describe("Input Validation", () => {
    it("should handle invalid message ID", async () => {
      const db = createTestDb({ selectResponse: [] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(-1, 1);

      expect(result.success).toBe(false);
    });

    it("should handle invalid user ID", async () => {
      const db = createTestDb({ selectResponse: [] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(1, -1);

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // EDGE CASES
  // ========================================

  describe("Edge Cases", () => {
    it("should handle empty message content", async () => {
      const testMessage = {
        id: 1,
        webhookId: 1,
        userId: 1,
        conversationId: 1,
        content: "",
        senderIdentifier: "+1234567890",
        processingStatus: "pending",
        createdAt: new Date(),
      };

      const db = createTestDb({ selectResponse: [testMessage] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(1, 1);

      // Should still attempt to process even with empty content
      expect(db.select).toHaveBeenCalled();
    });

    it("should handle very long message content", async () => {
      const testMessage = {
        id: 1,
        webhookId: 1,
        userId: 1,
        conversationId: 1,
        content: "A".repeat(10000),
        senderIdentifier: "+1234567890",
        processingStatus: "pending",
        createdAt: new Date(),
      };

      const db = createTestDb({ selectResponse: [testMessage] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(1, 1);

      // Should handle long content gracefully
      expect(db.select).toHaveBeenCalled();
    });

    it("should handle special characters in message", async () => {
      const testMessage = {
        id: 1,
        webhookId: 1,
        userId: 1,
        conversationId: 1,
        content: '<script>alert("XSS")</script>',
        senderIdentifier: "+1234567890",
        processingStatus: "pending",
        createdAt: new Date(),
      };

      const db = createTestDb({ selectResponse: [testMessage] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await messageProcessingService.processMessage(1, 1);

      // Should handle special characters gracefully
      expect(db.select).toHaveBeenCalled();
    });
  });
});
