/**
 * Unit Tests for Webhook Receiver Service
 *
 * Tests webhook processing, authentication validation,
 * and conversation management
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebhookReceiverService } from "./webhookReceiver.service";

// Mock dependencies
vi.mock("@/server/db");
vi.mock("./messageProcessing.service", () => {
  const MockMessageProcessingService = function(this: any) {
    this.processMessage = vi.fn().mockResolvedValue({ taskId: 1, reply: "Auto-reply" });
  };
  return {
    MessageProcessingService: MockMessageProcessingService,
  };
});

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

describe("Webhook Receiver Service", () => {
  let restoreEnv: () => void;
  let webhookService: WebhookReceiverService;

  beforeEach(() => {
    vi.clearAllMocks();
    webhookService = new WebhookReceiverService();

    restoreEnv = mockEnv({
      TWILIO_AUTH_TOKEN: "test-twilio-token",
      ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    });
  });

  afterEach(() => {
    restoreEnv();
    vi.restoreAllMocks();
  });

  // ========================================
  // WEBHOOK PROCESSING TESTS
  // ========================================

  describe("processWebhook", () => {
    it("should return error when webhook not found", async () => {
      const db = createTestDb({ selectResponse: [] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await webhookService.processWebhook(
        "non-existent-token",
        { Body: "Test message" },
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Webhook not found");
    });

    it("should return error when webhook is inactive", async () => {
      const inactiveWebhook = {
        id: 1,
        webhookToken: "test-token",
        isActive: false,
        channelType: "sms",
        userId: 1,
      };

      const db = createTestDb({ selectResponse: [inactiveWebhook] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await webhookService.processWebhook(
        "test-token",
        { Body: "Test message" },
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Webhook is inactive");
    });

    it("should process valid SMS webhook", async () => {
      const activeWebhook = {
        id: 1,
        webhookToken: "test-token",
        isActive: true,
        channelType: "sms",
        userId: 1,
        providerConfig: null,
        totalMessagesReceived: 0,
      };

      const conversation = {
        id: 1,
        userId: 1,
        webhookId: 1,
        participantIdentifier: "+1234567890",
        status: "active",
        messageCount: 0,
      };

      const message = {
        id: 1,
        webhookId: 1,
        userId: 1,
        conversationId: 1,
        content: "Test message",
      };

      const db = createTestDb({
        selectResponse: [activeWebhook],
        insertResponse: [message],
        updateResponse: [{ ...activeWebhook, totalMessagesReceived: 1 }],
      });

      // Mock select to return different results on subsequent calls
      let selectCallCount = 0;
      db.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First call: find webhook
          return createChainableQuery([activeWebhook]);
        } else {
          // Subsequent calls: find conversation (return empty to create new)
          return createChainableQuery([]);
        }
      });

      function createChainableQuery(response: any) {
        const chain: any = {
          from: vi.fn(() => chain),
          where: vi.fn(() => chain),
          orderBy: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          then: (resolve: (value: any) => void) => {
            resolve(response);
            return Promise.resolve(response);
          },
        };
        return Object.assign(Promise.resolve(response), chain);
      }

      // Mock insert to return conversation then message
      let insertCallCount = 0;
      db.insert.mockImplementation(() => {
        insertCallCount++;
        const response = insertCallCount === 1 ? [conversation] : [message];
        const chain: any = {
          values: vi.fn(() => chain),
          returning: vi.fn(() => Promise.resolve(response)),
        };
        return chain;
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const twilioPayload = {
        MessageSid: "SM1234567890",
        AccountSid: "AC1234567890",
        From: "+1234567890",
        To: "+0987654321",
        Body: "Test message",
      };

      const result = await webhookService.processWebhook(
        "test-token",
        twilioPayload,
        {}
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it("should handle authentication failure", async () => {
      const webhookWithAuth = {
        id: 1,
        webhookToken: "test-token",
        isActive: true,
        channelType: "sms",
        userId: 1,
        providerConfig: {
          authType: "bearer",
          authToken: "expected-token",
        },
      };

      const db = createTestDb({ selectResponse: [webhookWithAuth] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await webhookService.processWebhook(
        "test-token",
        { Body: "Test" },
        { authorization: "Bearer wrong-token" }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication failed");
    });

    it("should process email webhook", async () => {
      const emailWebhook = {
        id: 2,
        webhookToken: "email-token",
        isActive: true,
        channelType: "email",
        userId: 1,
        providerConfig: null,
        totalMessagesReceived: 0,
      };

      const conversation = {
        id: 2,
        userId: 1,
        webhookId: 2,
        participantIdentifier: "sender@example.com",
        status: "active",
      };

      const message = {
        id: 2,
        webhookId: 2,
        userId: 1,
        conversationId: 2,
        content: "Email body",
      };

      const db = createTestDb({
        selectResponse: [emailWebhook],
        insertResponse: [message],
      });

      let selectCallCount = 0;
      db.select.mockImplementation(() => {
        selectCallCount++;
        const response = selectCallCount === 1 ? [emailWebhook] : [];
        const chain: any = {
          from: vi.fn(() => chain),
          where: vi.fn(() => chain),
          orderBy: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          then: (resolve: (value: any) => void) => {
            resolve(response);
            return Promise.resolve(response);
          },
        };
        return Object.assign(Promise.resolve(response), chain);
      });

      let insertCallCount = 0;
      db.insert.mockImplementation(() => {
        insertCallCount++;
        const response = insertCallCount === 1 ? [conversation] : [message];
        const chain: any = {
          values: vi.fn(() => chain),
          returning: vi.fn(() => Promise.resolve(response)),
        };
        return chain;
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const emailPayload = {
        messageId: "email-123",
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Email",
        body: "Email body",
      };

      const result = await webhookService.processWebhook(
        "email-token",
        emailPayload,
        {}
      );

      expect(result.success).toBe(true);
    });

    it("should process custom webhook", async () => {
      const customWebhook = {
        id: 3,
        webhookToken: "custom-token",
        isActive: true,
        channelType: "custom_webhook",
        userId: 1,
        providerConfig: null,
        totalMessagesReceived: 0,
      };

      const conversation = {
        id: 3,
        userId: 1,
        webhookId: 3,
        participantIdentifier: "custom-sender",
        status: "active",
      };

      const message = {
        id: 3,
        webhookId: 3,
        userId: 1,
        conversationId: 3,
      };

      const db = createTestDb({
        selectResponse: [customWebhook],
        insertResponse: [message],
      });

      let selectCallCount = 0;
      db.select.mockImplementation(() => {
        selectCallCount++;
        const response = selectCallCount === 1 ? [customWebhook] : [];
        const chain: any = {
          from: vi.fn(() => chain),
          where: vi.fn(() => chain),
          orderBy: vi.fn(() => chain),
          limit: vi.fn(() => chain),
          then: (resolve: (value: any) => void) => {
            resolve(response);
            return Promise.resolve(response);
          },
        };
        return Object.assign(Promise.resolve(response), chain);
      });

      let insertCallCount = 0;
      db.insert.mockImplementation(() => {
        insertCallCount++;
        const response = insertCallCount === 1 ? [conversation] : [message];
        const chain: any = {
          values: vi.fn(() => chain),
          returning: vi.fn(() => Promise.resolve(response)),
        };
        return chain;
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const customPayload = {
        sender: "custom-sender",
        content: "Custom message content",
      };

      const result = await webhookService.processWebhook(
        "custom-token",
        customPayload,
        {}
      );

      expect(result.success).toBe(true);
    });

    it("should return error for unknown channel type", async () => {
      const unknownWebhook = {
        id: 4,
        webhookToken: "unknown-token",
        isActive: true,
        channelType: "unknown",
        userId: 1,
        providerConfig: null,
      };

      const db = createTestDb({ selectResponse: [unknownWebhook] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await webhookService.processWebhook(
        "unknown-token",
        {},
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown channel type");
    });
  });

  // ========================================
  // SEND REPLY TESTS
  // ========================================

  describe("sendReply", () => {
    it("should return error when webhook not found", async () => {
      const db = createTestDb({ selectResponse: [] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await webhookService.sendReply(
        999,
        "+1234567890",
        "Reply message"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Webhook not found");
    });

    it("should return error when outbound is disabled", async () => {
      const webhook = {
        id: 1,
        outboundEnabled: false,
        userId: 1,
      };

      const db = createTestDb({ selectResponse: [webhook] });
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await webhookService.sendReply(
        1,
        "+1234567890",
        "Reply message"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Outbound messaging is disabled");
    });

    it("should send reply successfully", async () => {
      const webhook = {
        id: 1,
        outboundEnabled: true,
        userId: 1,
        totalMessagesSent: 0,
      };

      const outboundMessage = {
        id: 1,
        webhookId: 1,
        userId: 1,
        content: "Reply message",
        recipientIdentifier: "+1234567890",
        deliveryStatus: "pending",
      };

      const db = createTestDb({
        selectResponse: [webhook],
        insertResponse: [outboundMessage],
        updateResponse: [{ ...outboundMessage, deliveryStatus: "sent" }],
      });

      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(db as any);

      const result = await webhookService.sendReply(
        1,
        "+1234567890",
        "Reply message"
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });
});
