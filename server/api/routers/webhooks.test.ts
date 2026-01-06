/**
 * Unit Tests for Webhooks Router
 *
 * Tests webhook CRUD operations, 3-webhook limit enforcement,
 * verification flow, token regeneration, and message retrieval
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { webhooksRouter } from "./webhooks";
import {
  createMockContext,
  mockEnv,
} from "../../../client/src/__tests__/helpers/test-helpers";
import { createTestDb } from "../../../client/src/__tests__/helpers/test-db";

// Mock dependencies
vi.mock("@/server/db");
vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    default: {
      ...actual,
      randomBytes: vi.fn(() => Buffer.from("0123456789abcdef0123456789abcdef")),
      createHmac: vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn(() => "test-signature"),
      })),
      randomUUID: vi.fn(() => "test-uuid-12345"),
    },
    randomBytes: vi.fn(() => Buffer.from("0123456789abcdef0123456789abcdef")),
    createHmac: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => "test-signature"),
    })),
    randomUUID: vi.fn(() => "test-uuid-12345"),
  };
});

// Helper to create a mock webhook that matches the actual schema
function createMockUserWebhook(overrides?: any) {
  return {
    id: 1,
    userId: 1,
    webhookToken: "test-token-uuid",
    webhookUrl: "/api/webhooks/inbound/test-token-uuid",
    channelType: "sms",
    channelName: "Test Webhook",
    channelOrder: 1,
    providerConfig: null,
    outboundEnabled: true,
    outboundConfig: null,
    isActive: true,
    isPrimary: true,
    isVerified: false,
    verifiedAt: null,
    verificationCode: "ABC123",
    secretKey: "test-secret-key",
    rateLimitPerMinute: 30,
    rateLimitPerHour: 200,
    totalMessagesReceived: 0,
    totalMessagesSent: 0,
    lastMessageAt: null,
    tags: [],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("Webhooks Router", () => {
  let mockCtx: any;
  let restoreEnv: () => void;

  beforeEach(() => {
    mockCtx = createMockContext({ id: 1 });
    vi.clearAllMocks();

    // Mock environment variables
    restoreEnv = mockEnv({
      ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    });
  });

  afterEach(() => {
    restoreEnv();
    vi.restoreAllMocks();
  });

  // ========================================
  // LIST WEBHOOKS TESTS
  // ========================================

  describe("list", () => {
    it("should list all webhooks for user", async () => {
      const webhooks = [
        createMockUserWebhook({ id: 1, channelName: "Webhook 1" }),
        createMockUserWebhook({ id: 2, channelName: "Webhook 2" }),
        createMockUserWebhook({ id: 3, channelName: "Webhook 3" }),
      ];

      const db = createTestDb({
        selectResponse: webhooks,
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.list();

      expect(result).toHaveLength(3);
      expect(result[0].channelName).toBe("Webhook 1");
    });

    it("should return empty array when no webhooks exist", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.list();

      expect(result).toEqual([]);
    });

    it("should include inactive webhooks when requested", async () => {
      const webhooks = [
        createMockUserWebhook({ id: 1, isActive: true }),
        createMockUserWebhook({ id: 2, isActive: false }),
      ];

      const db = createTestDb({
        selectResponse: webhooks,
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.list({ includeInactive: true });

      expect(result).toHaveLength(2);
    });

    it("should throw error when database not initialized", async () => {
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(null)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(caller.list()).rejects.toThrow("Database not initialized");
    });
  });

  // ========================================
  // CREATE WEBHOOK TESTS
  // ========================================

  describe("create", () => {
    it("should create a new webhook", async () => {
      const newWebhook = createMockUserWebhook({
        id: 1,
        channelName: "New Webhook",
      });

      const db = createTestDb({
        selectResponse: [{ count: 0 }], // count query
        insertResponse: [newWebhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.create({
        channelType: "sms",
        channelName: "New Webhook",
      });

      expect(result.id).toBe(1);
      expect(result.channelName).toBe("New Webhook");
    });

    it("should enforce 3-webhook limit per user", async () => {
      const db = createTestDb({
        selectResponse: [{ count: 3 }], // Already has 3 webhooks
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.create({
          channelType: "sms",
          channelName: "Fourth Webhook",
        })
      ).rejects.toThrow("Maximum of 3 webhooks allowed per user");
    });

    it("should allow webhook creation when below limit", async () => {
      const newWebhook = createMockUserWebhook({
        id: 3,
        channelName: "Third Webhook",
        channelOrder: 3,
      });

      const db = createTestDb({
        selectResponse: [{ count: 2 }], // Has 2 webhooks
        insertResponse: [newWebhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.create({
        channelType: "custom_webhook",
        channelName: "Third Webhook",
      });

      expect(result.id).toBe(3);
    });

    it("should validate channel name is required", async () => {
      const db = createTestDb();

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.create({
          channelType: "sms",
          channelName: "",
        })
      ).rejects.toThrow();
    });

    it("should throw error when database not initialized", async () => {
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(null)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.create({
          channelType: "sms",
          channelName: "Test",
        })
      ).rejects.toThrow("Database not initialized");
    });
  });

  // ========================================
  // GET WEBHOOK TESTS
  // ========================================

  describe("get", () => {
    it("should get webhook by ID", async () => {
      const webhook = createMockUserWebhook({ id: 1 });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.get({ id: 1 });

      expect(result.id).toBe(1);
    });

    it("should throw NOT_FOUND for non-existent webhook", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.get({ id: 999 })
      ).rejects.toThrow("Webhook not found");
    });
  });

  // ========================================
  // UPDATE WEBHOOK TESTS
  // ========================================

  describe("update", () => {
    it("should update webhook configuration", async () => {
      const existingWebhook = createMockUserWebhook({
        id: 1,
        channelName: "Old Name",
      });

      const updatedWebhook = createMockUserWebhook({
        id: 1,
        channelName: "New Name",
      });

      const db = createTestDb({
        selectResponse: [existingWebhook],
        updateResponse: [updatedWebhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        channelName: "New Name",
      });

      expect(result.channelName).toBe("New Name");
    });

    it("should throw error if webhook not found", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.update({
          id: 999,
          channelName: "Updated",
        })
      ).rejects.toThrow("Webhook not found");
    });

    it("should update webhook active status", async () => {
      const webhook = createMockUserWebhook({ isActive: true });
      const updatedWebhook = createMockUserWebhook({ isActive: false });

      const db = createTestDb({
        selectResponse: [webhook],
        updateResponse: [updatedWebhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        isActive: false,
      });

      expect(result.isActive).toBe(false);
    });
  });

  // ========================================
  // DELETE WEBHOOK TESTS
  // ========================================

  describe("delete", () => {
    it("should soft delete webhook", async () => {
      const webhook = createMockUserWebhook({ id: 1 });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.id).toBe(1);
    });

    it("should throw error if webhook not found", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.delete({ id: 999 })
      ).rejects.toThrow("Webhook not found");
    });
  });

  // ========================================
  // WEBHOOK VERIFICATION TESTS
  // ========================================

  describe("verify", () => {
    it("should verify webhook with valid code", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        isVerified: false,
        verificationCode: "ABC123",
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.verify({
        id: 1,
        verificationCode: "ABC123",
      });

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
    });

    it("should reject invalid verification code", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        isVerified: false,
        verificationCode: "ABC123",
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.verify({
          id: 1,
          verificationCode: "WRONG",
        })
      ).rejects.toThrow("Invalid verification code");
    });

    it("should reject if already verified", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        isVerified: true,
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.verify({
          id: 1,
          verificationCode: "ABC123",
        })
      ).rejects.toThrow("already verified");
    });
  });

  // ========================================
  // TOKEN REGENERATION TESTS
  // ========================================

  describe("regenerateToken", () => {
    it("should regenerate webhook token", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        webhookToken: "old-token",
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.regenerateToken({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.webhookToken).toBeDefined();
      expect(result.webhookUrl).toBeDefined();
    });

    it("should throw error if webhook not found", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.regenerateToken({ id: 999 })
      ).rejects.toThrow("Webhook not found");
    });
  });

  // ========================================
  // SECRET KEY TESTS
  // ========================================

  describe("regenerateSecretKey", () => {
    it("should regenerate webhook secret key", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        secretKey: "old-secret",
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.regenerateSecretKey({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.secretKey).toBeDefined();
    });
  });

  describe("getSecretKey", () => {
    it("should return webhook secret key", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        secretKey: "test-secret-key",
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.getSecretKey({ id: 1 });

      expect(result.secretKey).toBe("test-secret-key");
      expect(result.usage).toBeDefined();
    });
  });

  // ========================================
  // MESSAGE RETRIEVAL TESTS
  // ========================================

  describe("getMessages", () => {
    it("should retrieve messages for webhook", async () => {
      const webhook = createMockUserWebhook({ id: 1 });
      const messages = [
        {
          id: 1,
          webhookId: 1,
          content: "Test message 1",
          receivedAt: new Date(),
        },
        {
          id: 2,
          webhookId: 1,
          content: "Test message 2",
          receivedAt: new Date(),
        },
      ];

      // First call returns webhook, second returns messages
      let callCount = 0;
      const db = createTestDb({
        selectResponse: [webhook],
      });

      db.select = vi.fn().mockImplementation(() => {
        callCount++;
        const response = callCount === 1 ? [webhook] : messages;
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => ({
                  offset: vi.fn(() => Promise.resolve(response)),
                })),
              })),
              limit: vi.fn(() => Promise.resolve(response)),
            })),
          })),
        };
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.getMessages({
        webhookId: 1,
      });

      expect(result).toBeInstanceOf(Array);
    });

    it("should throw error if webhook not found", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.getMessages({
          webhookId: 999,
        })
      ).rejects.toThrow("Webhook not found");
    });
  });

  // ========================================
  // CONVERSATIONS TESTS
  // ========================================

  describe("getConversations", () => {
    it("should retrieve conversations", async () => {
      const conversations = [
        {
          id: 1,
          userId: 1,
          webhookId: 1,
          status: "active",
          lastMessageAt: new Date(),
        },
      ];

      const db = createTestDb({
        selectResponse: conversations,
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.getConversations({});

      expect(result).toBeInstanceOf(Array);
    });
  });

  // ========================================
  // TEST WEBHOOK TESTS
  // ========================================

  describe("test", () => {
    it("should test webhook for SMS/email channels", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        channelType: "sms",
        webhookUrl: "/api/webhooks/inbound/test",
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.test({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.webhookUrl).toBeDefined();
    });

    it("should test custom webhook with outbound URL", async () => {
      const webhook = createMockUserWebhook({
        id: 1,
        channelType: "custom_webhook",
        outboundConfig: {
          outboundWebhookUrl: "https://example.com/webhook",
        },
      });

      const db = createTestDb({
        selectResponse: [webhook],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
      });

      const caller = webhooksRouter.createCaller(mockCtx);
      const result = await caller.test({ id: 1 });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it("should throw error if webhook not found", async () => {
      const db = createTestDb({
        selectResponse: [],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(db as any)
      );

      const caller = webhooksRouter.createCaller(mockCtx);

      await expect(
        caller.test({ id: 999 })
      ).rejects.toThrow("Webhook not found");
    });
  });

  // ========================================
  // INTEGRATION TESTS
  // ========================================

  describe("Integration", () => {
    it("should complete full webhook lifecycle", async () => {
      // Create webhook
      const createdWebhook = createMockUserWebhook({ id: 1 });

      let createDb = createTestDb({
        selectResponse: [{ count: 0 }],
        insertResponse: [createdWebhook],
      });

      let dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(createDb as any)
      );

      let caller = webhooksRouter.createCaller(mockCtx);
      const created = await caller.create({
        channelType: "sms",
        channelName: "Test Webhook",
      });

      expect(created.id).toBe(1);

      // Get webhook
      const getDb = createTestDb({
        selectResponse: [createdWebhook],
      });

      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(getDb as any)
      );

      caller = webhooksRouter.createCaller(mockCtx);
      const retrieved = await caller.get({ id: 1 });

      expect(retrieved.id).toBe(1);

      // Update webhook
      const updatedWebhook = createMockUserWebhook({
        id: 1,
        channelName: "Updated Name",
      });

      const updateDb = createTestDb({
        selectResponse: [createdWebhook],
        updateResponse: [updatedWebhook],
      });

      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(updateDb as any)
      );

      caller = webhooksRouter.createCaller(mockCtx);
      const updated = await caller.update({
        id: 1,
        channelName: "Updated Name",
      });

      expect(updated.channelName).toBe("Updated Name");

      // Delete webhook
      const deleteDb = createTestDb({
        selectResponse: [updatedWebhook],
      });

      vi.mocked(dbModule.getDb).mockImplementation(() =>
        Promise.resolve(deleteDb as any)
      );

      caller = webhooksRouter.createCaller(mockCtx);
      const deleted = await caller.delete({ id: 1 });

      expect(deleted.success).toBe(true);
    });
  });
});
