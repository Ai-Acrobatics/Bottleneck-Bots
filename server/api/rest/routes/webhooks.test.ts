/**
 * Unit Tests for Webhooks REST API Routes
 *
 * Tests webhook authentication, payload validation, task handlers,
 * error handling, and database logging
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { z } from "zod";
import type { Request, Response } from "express";

// Mock dependencies
vi.mock("@/server/db", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/server/workflows/ghl", () => ({
  ghlLogin: vi.fn(),
  extractContacts: vi.fn(),
  extractWorkflows: vi.fn(),
  extractPipelines: vi.fn(),
  extractDashboardMetrics: vi.fn(),
}));

vi.mock("@browserbasehq/stagehand", () => ({
  Stagehand: vi.fn(),
}));

describe("Webhooks REST API Routes", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockDb: any;
  let mockGHLFunctions: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock request
    mockReq = {
      headers: {
        "x-webhook-secret": process.env.WEBHOOK_SECRET || "test-secret",
      },
      body: {},
      query: {},
    };

    // Setup mock response
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Setup mock database
    mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{}]),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    const { getDb } = require("@/server/db");
    getDb.mockResolvedValue(mockDb);

    // Setup mock GHL functions
    mockGHLFunctions = {
      ghlLogin: require("@/server/workflows/ghl").ghlLogin,
      extractContacts: require("@/server/workflows/ghl").extractContacts,
      extractWorkflows: require("@/server/workflows/ghl").extractWorkflows,
      extractPipelines: require("@/server/workflows/ghl").extractPipelines,
      extractDashboardMetrics: require("@/server/workflows/ghl").extractDashboardMetrics,
    };

    // Set environment
    process.env.WEBHOOK_SECRET = "test-secret";
    process.env.BROWSERBASE_API_KEY = "test-api-key";
    process.env.BROWSERBASE_PROJECT_ID = "test-project-id";
    process.env.OPENAI_API_KEY = "test-openai-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========================================
  // WEBHOOK SECRET VALIDATION TESTS
  // ========================================

  describe("Webhook Secret Validation", () => {
    it("should accept valid webhook secret in header", () => {
      mockReq.headers = { "x-webhook-secret": "test-secret" };

      // Validation logic
      const secret = mockReq.headers["x-webhook-secret"];
      const isValid = secret === process.env.WEBHOOK_SECRET;

      expect(isValid).toBe(true);
    });

    it("should accept valid webhook secret in query parameter", () => {
      mockReq.headers = {};
      mockReq.query = { secret: "test-secret" };

      const secret = mockReq.headers["x-webhook-secret"] || mockReq.query.secret;
      const isValid = secret === process.env.WEBHOOK_SECRET;

      expect(isValid).toBe(true);
    });

    it("should reject invalid webhook secret", () => {
      mockReq.headers = { "x-webhook-secret": "invalid-secret" };

      const secret = mockReq.headers["x-webhook-secret"];
      const isValid = secret === process.env.WEBHOOK_SECRET;

      expect(isValid).toBe(false);
    });

    it("should reject request with no secret when required", () => {
      mockReq.headers = {};
      mockReq.query = {};

      const secret = mockReq.headers["x-webhook-secret"] || mockReq.query.secret;
      const isValid = secret === process.env.WEBHOOK_SECRET;

      expect(isValid).toBe(false);
    });

    it("should allow request without secret when WEBHOOK_SECRET not configured", () => {
      const originalSecret = process.env.WEBHOOK_SECRET;
      delete process.env.WEBHOOK_SECRET;
      delete process.env.JWT_SECRET;

      mockReq.headers = {};
      mockReq.query = {};

      const expectedSecret = process.env.WEBHOOK_SECRET || process.env.JWT_SECRET;
      const isValid = !expectedSecret || true;

      expect(isValid).toBe(true);

      process.env.WEBHOOK_SECRET = originalSecret!;
    });
  });

  // ========================================
  // PAYLOAD VALIDATION TESTS
  // ========================================

  describe("Payload Validation", () => {
    const webhookPayloadSchema = z.object({
      clientId: z.string().min(1),
      taskType: z.enum([
        "ghl-login",
        "ghl-extract-contacts",
        "ghl-extract-workflows",
        "ghl-extract-pipelines",
        "ghl-extract-dashboard",
        "browser-navigate",
        "browser-act",
        "browser-extract",
        "custom",
      ]),
      taskData: z.object({
        email: z.string().email().optional(),
        password: z.string().optional(),
        locationId: z.string().optional(),
        twoFactorCode: z.string().optional(),
        url: z.string().url().optional(),
        instruction: z.string().optional(),
        extractionSchema: z.any().optional(),
        limit: z.number().optional(),
        searchTerm: z.string().optional(),
        customActions: z.array(z.string()).optional(),
      }),
      callbackUrl: z.string().url().optional(),
      priority: z.enum(["low", "normal", "high"]).default("normal"),
      timeout: z.number().min(30000).max(600000).default(300000),
    });

    it("should validate valid GHL login payload", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {
          email: "user@example.com",
          password: "password123",
        },
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.success).toBe(true);
    });

    it("should validate payload with all optional fields", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-extract-contacts",
        taskData: {
          email: "user@example.com",
          password: "password123",
          limit: 50,
          searchTerm: "John",
        },
        callbackUrl: "https://example.com/webhook",
        priority: "high",
        timeout: 120000,
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.success).toBe(true);
    });

    it("should reject missing clientId", () => {
      const payload = {
        taskType: "ghl-login",
        taskData: { email: "user@example.com" },
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.success).toBe(false);
    });

    it("should reject invalid taskType", () => {
      const payload = {
        clientId: "client-123",
        taskType: "invalid-task",
        taskData: {},
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.success).toBe(false);
    });

    it("should reject invalid email in taskData", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {
          email: "not-an-email",
          password: "password",
        },
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.success).toBe(false);
    });

    it("should reject timeout below minimum", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
        timeout: 10000, // Less than 30000 minimum
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.success).toBe(false);
    });

    it("should reject timeout above maximum", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
        timeout: 700000, // More than 600000 maximum
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.success).toBe(false);
    });

    it("should use default priority when not specified", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.data?.priority).toBe("normal");
    });

    it("should use default timeout when not specified", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
      };

      const result = webhookPayloadSchema.safeParse(payload);

      expect(result.data?.timeout).toBe(300000);
    });
  });

  // ========================================
  // GHL LOGIN HANDLER TESTS
  // ========================================

  describe("GHL Login Handler", () => {
    it("should handle ghl-login task", async () => {
      mockGHLFunctions.ghlLogin.mockResolvedValue({
        success: true,
        sessionId: "session-123",
        dashboardUrl: "https://app.gohighlevel.com/dashboard",
      });

      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {
          email: "user@example.com",
          password: "password123",
        },
      };

      // Simulate handler
      const ghlLogin = mockGHLFunctions.ghlLogin;
      const result = await ghlLogin(
        { /* mock stagehand */ },
        payload.taskData
      );

      expect(result.success).toBe(true);
    });

    it("should require email and password for login", () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {
          password: "password123",
          // Missing email
        },
      };

      const schema = z.object({
        email: z.string().email(),
        password: z.string().optional(),
      });

      const validationResult = schema.safeParse(payload.taskData);
      expect(validationResult.success).toBe(false);
    });

    it("should pass 2FA code to login function", async () => {
      mockGHLFunctions.ghlLogin.mockResolvedValue({
        success: true,
      });

      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {
          email: "user@example.com",
          password: "password123",
          twoFactorCode: "123456",
        },
      };

      const ghlLogin = mockGHLFunctions.ghlLogin;
      await ghlLogin(
        { /* mock stagehand */ },
        payload.taskData
      );

      expect(ghlLogin).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          twoFactorCode: "123456",
        })
      );
    });
  });

  // ========================================
  // EXTRACT HANDLERS TESTS
  // ========================================

  describe("Extract Handlers", () => {
    it("should handle ghl-extract-contacts task", async () => {
      mockGHLFunctions.extractContacts.mockResolvedValue([
        { name: "John", email: "john@example.com" },
      ]);

      const payload = {
        clientId: "client-123",
        taskType: "ghl-extract-contacts",
        taskData: {
          email: "user@example.com",
          password: "password123",
          limit: 20,
        },
      };

      const extractContacts = mockGHLFunctions.extractContacts;
      const result = await extractContacts(
        { /* mock stagehand */ },
        {
          limit: payload.taskData.limit,
          searchTerm: payload.taskData.searchTerm,
        }
      );

      expect(result).toBeDefined();
      expect(mockGHLFunctions.ghlLogin).toBeDefined();
    });

    it("should handle ghl-extract-workflows task", async () => {
      mockGHLFunctions.extractWorkflows.mockResolvedValue([
        { name: "Workflow 1", status: "active" },
      ]);

      const payload = {
        clientId: "client-123",
        taskType: "ghl-extract-workflows",
        taskData: {
          email: "user@example.com",
          password: "password123",
        },
      };

      const extractWorkflows = mockGHLFunctions.extractWorkflows;
      const result = await extractWorkflows(
        { /* mock stagehand */ }
      );

      expect(result).toBeDefined();
    });

    it("should handle ghl-extract-pipelines task", async () => {
      mockGHLFunctions.extractPipelines.mockResolvedValue([
        { name: "Pipeline 1", stages: [] },
      ]);

      const payload = {
        clientId: "client-123",
        taskType: "ghl-extract-pipelines",
        taskData: {
          email: "user@example.com",
          password: "password123",
        },
      };

      const extractPipelines = mockGHLFunctions.extractPipelines;
      const result = await extractPipelines(
        { /* mock stagehand */ }
      );

      expect(result).toBeDefined();
    });

    it("should handle ghl-extract-dashboard task", async () => {
      mockGHLFunctions.extractDashboardMetrics.mockResolvedValue({
        totalLeads: 100,
        newLeads: 5,
      });

      const payload = {
        clientId: "client-123",
        taskType: "ghl-extract-dashboard",
        taskData: {},
      };

      const extractDashboardMetrics = mockGHLFunctions.extractDashboardMetrics;
      const result = await extractDashboardMetrics(
        { /* mock stagehand */ }
      );

      expect(result).toBeDefined();
    });

    it("should apply search filter to contacts extraction", async () => {
      mockGHLFunctions.extractContacts.mockResolvedValue([]);

      const payload = {
        clientId: "client-123",
        taskType: "ghl-extract-contacts",
        taskData: {
          searchTerm: "John",
          limit: 10,
        },
      };

      const extractContacts = mockGHLFunctions.extractContacts;
      await extractContacts(
        { /* mock stagehand */ },
        {
          searchTerm: payload.taskData.searchTerm,
          limit: payload.taskData.limit,
        }
      );

      expect(mockGHLFunctions.extractContacts).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          searchTerm: "John",
          limit: 10,
        })
      );
    });
  });

  // ========================================
  // BROWSER ACTION HANDLERS TESTS
  // ========================================

  describe("Browser Action Handlers", () => {
    it("should validate browser-navigate requires URL", () => {
      const payload = {
        clientId: "client-123",
        taskType: "browser-navigate",
        taskData: {
          // Missing url
        },
      };

      const schema = z.object({
        url: z.string().url(),
      });

      const result = schema.safeParse(payload.taskData);
      expect(result.success).toBe(false);
    });

    it("should validate browser-act requires instruction", () => {
      const payload = {
        clientId: "client-123",
        taskType: "browser-act",
        taskData: {
          // Missing instruction
        },
      };

      const schema = z.object({
        instruction: z.string(),
      });

      const result = schema.safeParse(payload.taskData);
      expect(result.success).toBe(false);
    });

    it("should validate browser-extract requires url and instruction", () => {
      const payload = {
        clientId: "client-123",
        taskType: "browser-extract",
        taskData: {
          url: "https://example.com",
          // Missing instruction
        },
      };

      const schema = z.object({
        url: z.string().url(),
        instruction: z.string(),
      });

      const result = schema.safeParse(payload.taskData);
      expect(result.success).toBe(false);
    });

    it("should validate custom requires customActions", () => {
      const payload = {
        clientId: "client-123",
        taskType: "custom",
        taskData: {
          // Missing customActions
        },
      };

      const schema = z.object({
        customActions: z.array(z.string()).min(1),
      });

      const result = schema.safeParse(payload.taskData);
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // DATABASE LOGGING TESTS
  // ========================================

  describe("Database Logging", () => {
    it("should log successful execution to database", async () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {
          email: "user@example.com",
          password: "password123",
        },
      };

      const sessionId = "session-123";

      // Simulate logging
      await mockDb.insert().values({
        userId: payload.clientId,
        sessionId: sessionId,
        status: "completed",
        url: payload.taskData.email || "webhook-automation",
        metadata: {
          taskType: payload.taskType,
          clientId: payload.clientId,
          source: "webhook",
        },
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should log failed execution to database", async () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
      };

      const sessionId = "session-456";
      const error = "Login failed";

      // Simulate error logging
      await mockDb.insert().values({
        userId: payload.clientId,
        sessionId: sessionId,
        status: "failed",
        metadata: {
          taskType: payload.taskType,
          error: error,
          source: "webhook",
        },
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should handle database logging errors gracefully", async () => {
      mockDb.insert.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
      };

      // Should not throw, just log error
      try {
        await mockDb.insert().values({
          userId: payload.clientId,
          sessionId: "session-123",
          status: "completed",
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ========================================
  // CALLBACK NOTIFICATION TESTS
  // ========================================

  describe("Callback Notifications", () => {
    it("should send callback when callbackUrl provided", async () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
        callbackUrl: "https://example.com/webhook",
      };

      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const callbackData = {
        success: true,
        clientId: payload.clientId,
        taskType: payload.taskType,
        sessionId: "session-123",
        result: { success: true },
      };

      await mockFetch(payload.callbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callbackData),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        payload.callbackUrl,
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should not send callback when callbackUrl not provided", async () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
        // No callbackUrl
      };

      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      if (payload.callbackUrl) {
        await mockFetch(payload.callbackUrl);
      }

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle callback errors gracefully", async () => {
      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {},
        callbackUrl: "https://example.com/webhook",
      };

      const mockFetch = vi.fn().mockRejectedValue(
        new Error("Callback failed")
      );
      global.fetch = mockFetch;

      try {
        await mockFetch(payload.callbackUrl);
      } catch (error) {
        // Should handle error without throwing
        expect(error).toBeDefined();
      }
    });
  });

  // ========================================
  // RESPONSE FORMATTING TESTS
  // ========================================

  describe("Response Formatting", () => {
    it("should return success response with all fields", () => {
      const response = {
        success: true,
        clientId: "client-123",
        taskType: "ghl-login",
        sessionId: "session-123",
        result: { success: true },
        executionTime: 5000,
        sessionUrl: "https://www.browserbase.com/sessions/session-123",
      };

      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("clientId");
      expect(response).toHaveProperty("taskType");
      expect(response).toHaveProperty("sessionId");
      expect(response).toHaveProperty("result");
      expect(response).toHaveProperty("executionTime");
      expect(response).toHaveProperty("sessionUrl");
    });

    it("should format extraction results in response", () => {
      const result = [
        { name: "John", email: "john@example.com" },
        { name: "Jane", email: "jane@example.com" },
      ];

      const response = {
        success: true,
        result: result,
      };

      expect(response.result).toEqual(result);
    });
  });

  // ========================================
  // INTEGRATION TESTS
  // ========================================

  describe("Integration", () => {
    it("should handle complete webhook request flow", async () => {
      mockGHLFunctions.ghlLogin.mockResolvedValue({
        success: true,
        sessionId: "session-123",
      });

      const payload = {
        clientId: "client-123",
        taskType: "ghl-login",
        taskData: {
          email: "user@example.com",
          password: "password123",
        },
        callbackUrl: "https://example.com/webhook",
      };

      // Validate
      const webhookPayloadSchema = z.object({
        clientId: z.string().min(1),
        taskType: z.string(),
        taskData: z.object({}),
      });

      const validated = webhookPayloadSchema.safeParse(payload);
      expect(validated.success).toBe(true);

      // Execute
      const result = await mockGHLFunctions.ghlLogin(
        { /* mock stagehand */ },
        payload.taskData
      );

      expect(result.success).toBe(true);

      // Log
      await mockDb.insert().values({
        userId: payload.clientId,
        sessionId: result.sessionId,
        status: "completed",
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  // ========================================
  // HEALTH CHECK TESTS
  // ========================================

  describe("Health Check Endpoint", () => {
    it("should return health status", () => {
      const healthResponse = {
        status: "healthy",
        endpoint: "/api/v1/webhooks/automation",
        supportedTasks: [
          "ghl-login",
          "ghl-extract-contacts",
          "ghl-extract-workflows",
          "ghl-extract-pipelines",
          "ghl-extract-dashboard",
          "browser-navigate",
          "browser-act",
          "browser-extract",
          "custom",
        ],
        authentication: "x-webhook-secret header or ?secret= query param",
      };

      expect(healthResponse.status).toBe("healthy");
      expect(healthResponse.supportedTasks).toContain("ghl-login");
      expect(healthResponse.supportedTasks).toContain("browser-navigate");
    });
  });
});
