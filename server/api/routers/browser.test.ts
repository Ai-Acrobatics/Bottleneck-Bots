/**
 * Integration Tests for Browser Router
 *
 * Tests all browser automation endpoints with mocked dependencies
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { browserRouter } from "./browser";
import {
  createMockContext,
  createMockBrowserSession,
  createMockStagehand,
  createMockExtractedData,
  createMockBrowserbaseClient,
  createMockSessionMetricsService,
  createMockWebsocketService,
} from "../../../client/src/__tests__/helpers/test-helpers";
import { createTestDb } from "../../../client/src/__tests__/helpers/test-db";

// Mock dependencies
vi.mock("@/server/db");
vi.mock("@/server/_core/browserbaseSDK");
vi.mock("@browserbasehq/stagehand");
vi.mock("@/server/services/sessionMetrics.service");
vi.mock("@/server/services/websocket.service");

describe("Browser Router", () => {
  let mockCtx: any;
  let mockDb: any;
  let mockBrowserbaseClient: ReturnType<typeof createMockBrowserbaseClient>;
  let mockStagehand: ReturnType<typeof createMockStagehand>;
  let mockMetricsService: ReturnType<typeof createMockSessionMetricsService>;
  let mockWebsocketService: ReturnType<typeof createMockWebsocketService>;

  beforeEach(async () => {
    mockCtx = createMockContext({ id: 1 });
    mockDb = createTestDb();
    mockBrowserbaseClient = createMockBrowserbaseClient();
    mockStagehand = createMockStagehand();
    mockMetricsService = createMockSessionMetricsService();
    mockWebsocketService = createMockWebsocketService();

    // Mock database
    const dbModule = await import("@/server/db");
    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    // Mock browserbaseSDK
    const browserbaseModule = await import("@/server/_core/browserbaseSDK");
    vi.mocked(browserbaseModule.browserbaseSDK).mockReturnValue({
      createSession: mockBrowserbaseClient.sessions.create,
      terminateSession: vi.fn().mockResolvedValue({ success: true, sessionId: "session-123" }),
      getSessionDebug: mockBrowserbaseClient.sessions.debug,
      getSessionRecording: mockBrowserbaseClient.sessions.recording.retrieve,
      getSessionLogs: mockBrowserbaseClient.sessions.logs.list,
      listSessions: mockBrowserbaseClient.sessions.list,
      getSession: mockBrowserbaseClient.sessions.retrieve,
    } as any);

    // Mock Stagehand
    const { Stagehand } = await import("@browserbasehq/stagehand");
    vi.mocked(Stagehand).mockImplementation(() => mockStagehand as any);

    // Mock services
    const metricsModule = await import("@/server/services/sessionMetrics.service");
    vi.mocked(metricsModule.sessionMetricsService).mockReturnValue(mockMetricsService as any);

    const wsModule = await import("@/server/services/websocket.service");
    vi.mocked(wsModule.websocketService).mockReturnValue(mockWebsocketService as any);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createSession", () => {
    it("should create a session successfully", async () => {
      const mockSession = createMockBrowserSession();

      mockDb.insert = vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockSession])),
        })),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.createSession({
        browserSettings: {
          viewport: { width: 1920, height: 1080 },
          blockAds: true,
          solveCaptchas: true,
        },
        recordSession: true,
        keepAlive: true,
        timeout: 3600,
      });

      expect(result.sessionId).toBe("session-123");
      expect(result.debugUrl).toBeDefined();
      expect(result.status).toBe("RUNNING");
      expect(mockBrowserbaseClient.sessions.create).toHaveBeenCalled();
      expect(mockMetricsService.trackSessionStart).toHaveBeenCalledWith(
        "session-123",
        1
      );
      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:session:created",
        expect.any(Object)
      );
    });

    it("should create session with geolocation", async () => {
      const mockSession = createMockBrowserSession();

      mockDb.insert = vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockSession])),
        })),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      await caller.createSession({
        geolocation: {
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      });

      expect(mockBrowserbaseClient.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          proxies: expect.arrayContaining([
            expect.objectContaining({
              geolocation: {
                city: "San Francisco",
                state: "CA",
                country: "US",
              },
            }),
          ]),
        })
      );
    });

    it("should handle database error", async () => {
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const caller = browserRouter.createCaller(mockCtx);

      await expect(caller.createSession({})).rejects.toThrow(TRPCError);
      await expect(caller.createSession({})).rejects.toThrow(
        "Database not initialized"
      );
    });

    it("should handle browserbase session creation failure", async () => {
      mockBrowserbaseClient.sessions.create.mockRejectedValueOnce(
        new Error("API error")
      );

      const caller = browserRouter.createCaller(mockCtx);

      await expect(caller.createSession({})).rejects.toThrow(TRPCError);
    });
  });

  describe("navigateTo", () => {
    it("should navigate to URL successfully", async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.navigateTo({
        sessionId: "session-123",
        url: "https://example.com",
        waitUntil: "load",
        timeout: 30000,
      });

      expect(result.success).toBe(true);
      expect(result.url).toBe("https://example.com");
      expect(mockStagehand.page.goto).toHaveBeenCalledWith(
        "https://example.com",
        expect.objectContaining({
          waitUntil: "load",
          timeout: 30000,
        })
      );
      expect(mockMetricsService.trackOperation).toHaveBeenCalledWith(
        "session-123",
        "navigate",
        expect.any(Object)
      );
    });

    it("should handle navigation timeout", async () => {
      mockStagehand.page.goto.mockRejectedValueOnce(new Error("Timeout"));

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.navigateTo({
          sessionId: "session-123",
          url: "https://example.com",
        })
      ).rejects.toThrow(TRPCError);
    });

    it("should emit websocket event on navigation", async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      await caller.navigateTo({
        sessionId: "session-123",
        url: "https://test.com",
      });

      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:navigation",
        expect.objectContaining({
          sessionId: "session-123",
          url: "https://test.com",
        })
      );
    });
  });

  describe("clickElement", () => {
    it("should click element by selector", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.clickElement({
        sessionId: "session-123",
        selector: "button.submit",
        timeout: 10000,
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe("selector");
      expect(mockStagehand.page.click).toHaveBeenCalledWith(
        "button.submit",
        expect.any(Object)
      );
    });

    it("should fall back to AI instruction when selector fails", async () => {
      mockStagehand.page.click.mockRejectedValueOnce(
        new Error("Element not found")
      );

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.clickElement({
        sessionId: "session-123",
        selector: "button.missing",
        instruction: "Click the submit button",
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe("ai");
      expect(mockStagehand.act).toHaveBeenCalledWith("Click the submit button");
    });

    it("should fail when both selector and instruction fail", async () => {
      mockStagehand.page.click.mockRejectedValueOnce(
        new Error("Element not found")
      );

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.clickElement({
          sessionId: "session-123",
          selector: "button.missing",
        })
      ).rejects.toThrow(TRPCError);
    });

    it("should track click operation", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.clickElement({
        sessionId: "session-123",
        selector: "button",
      });

      expect(mockMetricsService.trackOperation).toHaveBeenCalledWith(
        "session-123",
        "click",
        expect.objectContaining({
          selector: "button",
          method: "selector",
        })
      );
    });
  });

  describe("typeText", () => {
    it("should type text into input field", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.typeText({
        sessionId: "session-123",
        selector: "input#email",
        text: "test@example.com",
        delay: 50,
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe("selector");
      expect(mockStagehand.page.type).toHaveBeenCalledWith(
        "input#email",
        "test@example.com",
        { delay: 50 }
      );
    });

    it("should clear field first if requested", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.typeText({
        sessionId: "session-123",
        selector: "input",
        text: "new text",
        clearFirst: true,
      });

      expect(mockStagehand.page.fill).toHaveBeenCalledWith("input", "");
      expect(mockStagehand.page.type).toHaveBeenCalled();
    });

    it("should fall back to AI instruction", async () => {
      mockStagehand.page.type.mockRejectedValueOnce(
        new Error("Field not found")
      );

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.typeText({
        sessionId: "session-123",
        selector: "input",
        text: "test",
        instruction: "Type test in the email field",
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe("ai");
      expect(mockStagehand.act).toHaveBeenCalled();
    });
  });

  describe("scrollTo", () => {
    it("should scroll to top", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.scrollTo({
        sessionId: "session-123",
        position: "top",
        smooth: true,
      });

      expect(result.success).toBe(true);
      expect(mockStagehand.page.evaluate).toHaveBeenCalledWith(
        expect.stringContaining("scrollTo")
      );
    });

    it("should scroll to bottom", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.scrollTo({
        sessionId: "session-123",
        position: "bottom",
      });

      expect(mockStagehand.page.evaluate).toHaveBeenCalledWith(
        expect.stringContaining("scrollHeight")
      );
    });

    it("should scroll to specific coordinates", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.scrollTo({
        sessionId: "session-123",
        position: { x: 0, y: 500 },
      });

      expect(mockStagehand.page.evaluate).toHaveBeenCalledWith(
        expect.stringContaining("top: 500")
      );
    });
  });

  describe("extractData", () => {
    it("should extract contact info with schema", async () => {
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve([createMockBrowserSession()])
            ),
          })),
        })),
      }));

      mockDb.insert = vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() =>
            Promise.resolve([createMockExtractedData()])
          ),
        })),
      }));

      mockStagehand.extract.mockResolvedValueOnce({
        contactInfo: {
          email: "contact@example.com",
          phone: "123-456-7890",
        },
      });

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.extractData({
        sessionId: "session-123",
        instruction: "Extract contact information",
        schemaType: "contactInfo",
        saveToDatabase: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.savedToDatabase).toBe(true);
      expect(mockStagehand.extract).toHaveBeenCalled();
    });

    it("should extract product info with schema", async () => {
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve([createMockBrowserSession()])
            ),
          })),
        })),
      }));

      mockDb.insert = vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() =>
            Promise.resolve([createMockExtractedData()])
          ),
        })),
      }));

      mockStagehand.extract.mockResolvedValueOnce({
        productInfo: {
          name: "Test Product",
          price: "$99.99",
        },
      });

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.extractData({
        sessionId: "session-123",
        instruction: "Extract product details",
        schemaType: "productInfo",
      });

      expect(result.success).toBe(true);
      expect(result.data.productInfo).toBeDefined();
    });

    it("should extract table data with schema", async () => {
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve([createMockBrowserSession()])
            ),
          })),
        })),
      }));

      mockDb.insert = vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() =>
            Promise.resolve([createMockExtractedData()])
          ),
        })),
      }));

      mockStagehand.extract.mockResolvedValueOnce({
        tableData: [
          { col1: "val1", col2: "val2" },
          { col1: "val3", col2: "val4" },
        ],
      });

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.extractData({
        sessionId: "session-123",
        instruction: "Extract table data",
        schemaType: "tableData",
      });

      expect(result.success).toBe(true);
      expect(result.data.tableData).toBeInstanceOf(Array);
    });

    it("should extract custom data without schema", async () => {
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve([createMockBrowserSession()])
            ),
          })),
        })),
      }));

      mockStagehand.extract.mockResolvedValueOnce({
        customField: "custom value",
      });

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.extractData({
        sessionId: "session-123",
        instruction: "Extract custom data",
        saveToDatabase: false,
      });

      expect(result.success).toBe(true);
      expect(result.savedToDatabase).toBe(false);
    });

    it("should emit websocket event on extraction", async () => {
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve([createMockBrowserSession()])
            ),
          })),
        })),
      }));

      mockStagehand.extract.mockResolvedValueOnce({ data: "test" });

      const caller = browserRouter.createCaller(mockCtx);
      await caller.extractData({
        sessionId: "session-123",
        instruction: "Extract data",
        saveToDatabase: false,
      });

      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:data:extracted",
        expect.any(Object)
      );
    });
  });

  describe("takeScreenshot", () => {
    it("should capture full page screenshot", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.takeScreenshot({
        sessionId: "session-123",
        fullPage: true,
        quality: 80,
      });

      expect(result.success).toBe(true);
      expect(result.screenshot).toContain("data:image/png;base64,");
      expect(result.size).toBeGreaterThan(0);
      expect(mockStagehand.page.screenshot).toHaveBeenCalledWith(
        expect.objectContaining({
          fullPage: true,
          type: "png",
          quality: 80,
        })
      );
    });

    it("should capture element screenshot", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.takeScreenshot({
        sessionId: "session-123",
        fullPage: false,
        selector: "#main-content",
      });

      expect(mockStagehand.page.screenshot).toHaveBeenCalled();
    });

    it("should track screenshot operation", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.takeScreenshot({
        sessionId: "session-123",
      });

      expect(mockMetricsService.trackOperation).toHaveBeenCalledWith(
        "session-123",
        "screenshot",
        expect.any(Object)
      );
    });

    it("should emit websocket event", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.takeScreenshot({
        sessionId: "session-123",
      });

      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:screenshot:captured",
        expect.any(Object)
      );
    });
  });

  describe("act", () => {
    it("should perform AI action successfully", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.act({
        sessionId: "session-123",
        instruction: "Click the login button",
      });

      expect(result.success).toBe(true);
      expect(result.instruction).toBe("Click the login button");
      expect(mockStagehand.act).toHaveBeenCalledWith("Click the login button");
    });

    it("should track act operation", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.act({
        sessionId: "session-123",
        instruction: "Fill out the form",
      });

      expect(mockMetricsService.trackOperation).toHaveBeenCalledWith(
        "session-123",
        "act",
        expect.objectContaining({
          instruction: "Fill out the form",
        })
      );
    });

    it("should handle act failure", async () => {
      mockStagehand.act.mockRejectedValueOnce(
        new Error("Action failed")
      );

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.act({
          sessionId: "session-123",
          instruction: "Invalid action",
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("observe", () => {
    it("should observe page elements", async () => {
      mockStagehand.observe.mockResolvedValueOnce([
        { action: "click", selector: "button#submit" },
        { action: "type", selector: "input#email" },
      ]);

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.observe({
        sessionId: "session-123",
        instruction: "Find all interactive elements",
      });

      expect(result.success).toBe(true);
      expect(result.actions).toBeInstanceOf(Array);
      expect(result.actions.length).toBe(2);
      expect(mockStagehand.observe).toHaveBeenCalledWith(
        "Find all interactive elements"
      );
    });

    it("should track observe operation", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.observe({
        sessionId: "session-123",
        instruction: "Observe buttons",
      });

      expect(mockMetricsService.trackOperation).toHaveBeenCalledWith(
        "session-123",
        "observe",
        expect.any(Object)
      );
    });
  });

  describe("getDebugUrl", () => {
    it("should return debug URL", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.getDebugUrl({
        sessionId: "session-123",
      });

      expect(result.sessionId).toBe("session-123");
      expect(result.debugUrl).toContain("fullscreen");
      expect(result.wsUrl).toBeDefined();
      expect(mockBrowserbaseClient.sessions.debug).toHaveBeenCalledWith(
        "session-123"
      );
    });

    it("should handle debug URL retrieval failure", async () => {
      mockBrowserbaseClient.sessions.debug.mockRejectedValueOnce(
        new Error("Session not found")
      );

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.getDebugUrl({ sessionId: "session-123" })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("getRecording", () => {
    it("should return recording URL", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.getRecording({
        sessionId: "session-123",
      });

      expect(result.sessionId).toBe("session-123");
      expect(result.recordingUrl).toBeDefined();
      expect(result.status).toBe("COMPLETED");
      expect(
        mockBrowserbaseClient.sessions.recording.retrieve
      ).toHaveBeenCalledWith("session-123");
    });

    it("should handle recording retrieval failure", async () => {
      mockBrowserbaseClient.sessions.recording.retrieve.mockRejectedValueOnce(
        new Error("Recording not ready")
      );

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.getRecording({ sessionId: "session-123" })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("closeSession", () => {
    it("should close session successfully", async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const browserbaseModule = await import("@/server/_core/browserbaseSDK");
      const terminateMock = vi.fn().mockResolvedValue({
        success: true,
        sessionId: "session-123",
      });
      vi.mocked(browserbaseModule.browserbaseSDK).terminateSession = terminateMock;

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.closeSession({
        sessionId: "session-123",
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe("session-123");
      expect(mockMetricsService.trackSessionEnd).toHaveBeenCalledWith(
        "session-123",
        "completed"
      );
      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:session:closed",
        expect.any(Object)
      );
    });

    it("should handle close session failure", async () => {
      const browserbaseModule = await import("@/server/_core/browserbaseSDK");
      const terminateMock = vi.fn().mockRejectedValue(new Error("Termination failed"));
      vi.mocked(browserbaseModule.browserbaseSDK).terminateSession = terminateMock;

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.closeSession({ sessionId: "session-123" })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("deleteSession", () => {
    it("should delete session and related data", async () => {
      const mockSession = createMockBrowserSession();

      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockSession])),
          })),
        })),
      }));

      mockDb.delete = vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.deleteSession({
        sessionId: "session-123",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("deleted successfully");
      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:session:deleted",
        expect.any(Object)
      );
    });

    it("should handle database error", async () => {
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.deleteSession({ sessionId: "session-123" })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("bulkTerminate", () => {
    it("should terminate multiple sessions", async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const browserbaseModule = await import("@/server/_core/browserbaseSDK");
      const terminateMock = vi.fn().mockResolvedValue({
        success: true,
        sessionId: "session-123",
      });
      vi.mocked(browserbaseModule.browserbaseSDK).terminateSession = terminateMock;

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.bulkTerminate({
        sessionIds: ["session-1", "session-2", "session-3"],
      });

      expect(result.success).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
    });

    it("should handle partial failures", async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const browserbaseModule = await import("@/server/_core/browserbaseSDK");
      let callCount = 0;
      const terminateMock = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error("Termination failed"));
        }
        return Promise.resolve({ success: true });
      });
      vi.mocked(browserbaseModule.browserbaseSDK).terminateSession = terminateMock;

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.bulkTerminate({
        sessionIds: ["session-1", "session-2", "session-3"],
      });

      expect(result.success.length).toBeGreaterThan(0);
      expect(result.failed.length).toBeGreaterThan(0);
    });

    it("should emit websocket event", async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const browserbaseModule = await import("@/server/_core/browserbaseSDK");
      const terminateMock = vi.fn().mockResolvedValue({ success: true });
      vi.mocked(browserbaseModule.browserbaseSDK).terminateSession = terminateMock;

      const caller = browserRouter.createCaller(mockCtx);
      await caller.bulkTerminate({
        sessionIds: ["session-1"],
      });

      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:sessions:bulk-terminated",
        expect.any(Object)
      );
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple sessions", async () => {
      const mockSession = createMockBrowserSession();

      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockSession])),
          })),
        })),
      }));

      mockDb.delete = vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.bulkDelete({
        sessionIds: ["session-1", "session-2"],
      });

      expect(result.success).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
    });

    it("should handle partial failures", async () => {
      let callCount = 0;
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => {
              callCount++;
              if (callCount === 2) {
                return Promise.reject(new Error("Database error"));
              }
              return Promise.resolve([createMockBrowserSession()]);
            }),
          })),
        })),
      }));

      mockDb.delete = vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.bulkDelete({
        sessionIds: ["session-1", "session-2"],
      });

      expect(result.success.length).toBeGreaterThan(0);
      expect(result.failed.length).toBeGreaterThan(0);
    });

    it("should emit websocket event", async () => {
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([createMockBrowserSession()])),
          })),
        })),
      }));

      mockDb.delete = vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      await caller.bulkDelete({
        sessionIds: ["session-1"],
      });

      expect(mockWebsocketService.broadcastToUser).toHaveBeenCalledWith(
        1,
        "browser:sessions:bulk-deleted",
        expect.any(Object)
      );
    });
  });

  describe("listSessions", () => {
    it("should list user sessions with pagination", async () => {
      const mockSessions = [
        createMockBrowserSession({ id: 1 }),
        createMockBrowserSession({ id: 2 }),
      ];

      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve(mockSessions)),
              })),
            })),
          })),
        })),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.listSessions({
        limit: 20,
        offset: 0,
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
    });

    it("should filter by status", async () => {
      const mockSessions = [
        createMockBrowserSession({ status: "active" }),
      ];

      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve(mockSessions)),
              })),
            })),
          })),
        })),
      }));

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.listSessions({
        status: "active",
      });

      expect(result[0].status).toBe("active");
    });

    it("should handle database error", async () => {
      const dbModule = await import("@/server/db");
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const caller = browserRouter.createCaller(mockCtx);

      await expect(caller.listSessions()).rejects.toThrow(TRPCError);
    });
  });

  describe("getSessionMetrics", () => {
    it("should return session metrics and cost", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.getSessionMetrics({
        sessionId: "session-123",
      });

      expect(result.sessionId).toBe("session-123");
      expect(result.cost).toBeDefined();
      expect(result.cost.totalCost).toBe(0.50);
      expect(mockMetricsService.getSessionMetrics).toHaveBeenCalledWith(
        "session-123"
      );
      expect(mockMetricsService.calculateCost).toHaveBeenCalledWith(
        "session-123"
      );
    });

    it("should handle metrics retrieval failure", async () => {
      mockMetricsService.getSessionMetrics.mockRejectedValueOnce(
        new Error("Metrics not found")
      );

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.getSessionMetrics({ sessionId: "session-123" })
      ).rejects.toThrow(TRPCError);
    });
  });
});
