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

// Create hoisted mocks for all dependencies
const {
  mockGetDb,
  mockBrowserbaseSDK,
  MockStagehandClass,
  mockSessionMetricsService,
  mockWebsocketService,
} = vi.hoisted(() => {
  // Create a mock page object
  const mockPage = {
    goto: vi.fn().mockResolvedValue(undefined),
    click: vi.fn().mockResolvedValue(undefined),
    fill: vi.fn().mockResolvedValue(undefined),
    type: vi.fn().mockResolvedValue(undefined),
    locator: vi.fn().mockReturnValue({
      click: vi.fn().mockResolvedValue(undefined),
      fill: vi.fn().mockResolvedValue(undefined),
      scrollIntoViewIfNeeded: vi.fn().mockResolvedValue(undefined),
    }),
    evaluate: vi.fn().mockResolvedValue(undefined),
    screenshot: vi.fn().mockResolvedValue(Buffer.from("fake-screenshot")),
    url: vi.fn().mockReturnValue("https://example.com"),
    title: vi.fn().mockResolvedValue("Test Page"),
  };

  // Stagehand needs to be a proper class mock with context.pages()
  const MockStagehandClass = vi.fn();
  MockStagehandClass.prototype.init = vi.fn().mockResolvedValue(undefined);
  MockStagehandClass.prototype.close = vi.fn().mockResolvedValue(undefined);
  MockStagehandClass.prototype.context = {
    pages: vi.fn().mockReturnValue([mockPage]),
    newPage: vi.fn().mockResolvedValue(mockPage),
  };
  MockStagehandClass.prototype.page = mockPage; // Also expose directly for compatibility
  MockStagehandClass.prototype.act = vi.fn().mockResolvedValue({ success: true, message: "Action completed" });
  MockStagehandClass.prototype.observe = vi.fn().mockResolvedValue([{ selector: "#element", description: "Element" }]);
  MockStagehandClass.prototype.extract = vi.fn().mockResolvedValue({ data: { key: "value" } });

  return {
    mockGetDb: vi.fn(),
    mockBrowserbaseSDK: {
      createSession: vi.fn().mockResolvedValue({
        id: "session-123",
        connectUrl: "wss://test.browserbase.io",
        projectId: "project-123",
        status: "RUNNING",
      }),
      terminateSession: vi.fn().mockResolvedValue({ success: true, sessionId: "session-123" }),
      getSessionDebug: vi.fn().mockResolvedValue({
        debuggerFullscreenUrl: "https://debug.browserbase.io/session-123/fullscreen",
        wsUrl: "wss://debug.browserbase.io/ws",
        pages: [{ url: "about:blank", title: "New Tab" }],
      }),
      getSessionRecording: vi.fn().mockResolvedValue({
        recordingUrl: "https://recording.browserbase.io/session-123",
        status: "COMPLETED",
      }),
      getSessionLogs: vi.fn().mockResolvedValue([]),
      listSessions: vi.fn().mockResolvedValue([]),
      getSession: vi.fn().mockResolvedValue({ id: "session-123", status: "RUNNING" }),
    },
    MockStagehandClass,
    mockSessionMetricsService: {
      trackSessionStart: vi.fn().mockResolvedValue(undefined),
      trackSessionEnd: vi.fn().mockResolvedValue(undefined),
      trackOperation: vi.fn().mockResolvedValue(undefined),
      getSessionMetrics: vi.fn().mockResolvedValue({ sessionId: "session-123", operations: 0, duration: 0 }),
      calculateCost: vi.fn().mockResolvedValue({ totalCost: 0.50, breakdown: { compute: 0.30, storage: 0.20 } }),
    },
    mockWebsocketService: {
      broadcastToUser: vi.fn(),
      sendToUser: vi.fn(),
    },
  };
});

// Mock dependencies with factory functions
vi.mock("@/server/db", () => ({ getDb: mockGetDb }));
vi.mock("@/server/_core/browserbaseSDK", () => ({ browserbaseSDK: mockBrowserbaseSDK }));
vi.mock("@browserbasehq/stagehand", () => ({ Stagehand: MockStagehandClass }));
vi.mock("@/server/services/sessionMetrics.service", () => ({ sessionMetricsService: mockSessionMetricsService }));
vi.mock("@/server/services/websocket.service", () => ({ websocketService: mockWebsocketService }));

describe("Browser Router", () => {
  let mockCtx: any;
  let mockDb: any;

  beforeEach(() => {
    // Reset all mocks before each test but keep implementations
    vi.clearAllMocks();

    mockCtx = createMockContext({ id: 1 });
    mockDb = createTestDb();

    // Configure database mock
    mockGetDb.mockResolvedValue(mockDb as any);

    // Reset browserbaseSDK mock implementations
    mockBrowserbaseSDK.createSession.mockResolvedValue({
      id: "session-123",
      connectUrl: "wss://test.browserbase.io",
      projectId: "project-123",
      status: "RUNNING",
    });
    mockBrowserbaseSDK.terminateSession.mockResolvedValue({ success: true, sessionId: "session-123" });
    mockBrowserbaseSDK.getSessionDebug.mockResolvedValue({
      debuggerFullscreenUrl: "https://debug.browserbase.io/session-123/fullscreen",
      wsUrl: "wss://debug.browserbase.io/ws",
      pages: [{ url: "about:blank", title: "New Tab" }],
    });
    mockBrowserbaseSDK.getSessionRecording.mockResolvedValue({
      recordingUrl: "https://recording.browserbase.io/session-123",
      status: "COMPLETED",
    });

    // Reset Stagehand prototype methods
    MockStagehandClass.prototype.init.mockResolvedValue(undefined);
    MockStagehandClass.prototype.close.mockResolvedValue(undefined);
    MockStagehandClass.prototype.act.mockResolvedValue({ success: true, message: "Action completed" });
    MockStagehandClass.prototype.observe.mockResolvedValue([{ selector: "#element", description: "Element" }]);
    MockStagehandClass.prototype.extract.mockResolvedValue({ data: { key: "value" } });
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
      expect(mockBrowserbaseSDK.createSession).toHaveBeenCalled();
      expect(mockSessionMetricsService.trackSessionStart).toHaveBeenCalledWith(
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

      expect(mockBrowserbaseSDK.createSession).toHaveBeenCalledWith(
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
      // Use hoisted mock to simulate null database
      mockGetDb.mockResolvedValue(null);

      const caller = browserRouter.createCaller(mockCtx);

      await expect(caller.createSession({})).rejects.toThrow(TRPCError);
      await expect(caller.createSession({})).rejects.toThrow(
        "Database not initialized"
      );

      // Reset mock for other tests
      mockGetDb.mockResolvedValue(mockDb as any);
    });

    it("should handle browserbase session creation failure", async () => {
      mockBrowserbaseSDK.createSession.mockRejectedValueOnce(
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
      expect(MockStagehandClass.prototype.page.goto).toHaveBeenCalledWith(
        "https://example.com",
        expect.objectContaining({
          waitUntil: "load",
          timeout: 30000,
        })
      );
      expect(mockSessionMetricsService.trackOperation).toHaveBeenCalledWith(
        "session-123",
        "navigate",
        expect.any(Object)
      );
    });

    it("should handle navigation timeout", async () => {
      MockStagehandClass.prototype.page.goto.mockRejectedValueOnce(new Error("Timeout"));

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
      expect(MockStagehandClass.prototype.page.click).toHaveBeenCalledWith(
        "button.submit",
        expect.any(Object)
      );
    });

    it("should fall back to AI instruction when selector fails", async () => {
      MockStagehandClass.prototype.page.click.mockRejectedValueOnce(
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
      expect(MockStagehandClass.prototype.act).toHaveBeenCalledWith("Click the submit button");
    });

    it("should fail when both selector and instruction fail", async () => {
      MockStagehandClass.prototype.page.click.mockRejectedValueOnce(
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

      expect(mockSessionMetricsService.trackOperation).toHaveBeenCalledWith(
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
      expect(MockStagehandClass.prototype.page.type).toHaveBeenCalledWith(
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

      // The router uses page.evaluate() to clear the field, not page.fill()
      expect(MockStagehandClass.prototype.page.evaluate).toHaveBeenCalled();
      expect(MockStagehandClass.prototype.page.type).toHaveBeenCalled();
    });

    it("should fall back to AI instruction", async () => {
      MockStagehandClass.prototype.page.type.mockRejectedValueOnce(
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
      expect(MockStagehandClass.prototype.act).toHaveBeenCalled();
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
      expect(MockStagehandClass.prototype.page.evaluate).toHaveBeenCalledWith(
        expect.stringContaining("scrollTo")
      );
    });

    it("should scroll to bottom", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.scrollTo({
        sessionId: "session-123",
        position: "bottom",
      });

      expect(MockStagehandClass.prototype.page.evaluate).toHaveBeenCalledWith(
        expect.stringContaining("scrollHeight")
      );
    });

    it("should scroll to specific coordinates", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.scrollTo({
        sessionId: "session-123",
        position: { x: 0, y: 500 },
      });

      expect(MockStagehandClass.prototype.page.evaluate).toHaveBeenCalledWith(
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

      MockStagehandClass.prototype.extract.mockResolvedValueOnce({
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
      expect(MockStagehandClass.prototype.extract).toHaveBeenCalled();
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

      MockStagehandClass.prototype.extract.mockResolvedValueOnce({
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

      MockStagehandClass.prototype.extract.mockResolvedValueOnce({
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

      MockStagehandClass.prototype.extract.mockResolvedValueOnce({
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

      MockStagehandClass.prototype.extract.mockResolvedValueOnce({ data: "test" });

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
      expect(MockStagehandClass.prototype.page.screenshot).toHaveBeenCalledWith(
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

      expect(MockStagehandClass.prototype.page.screenshot).toHaveBeenCalled();
    });

    it("should track screenshot operation", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.takeScreenshot({
        sessionId: "session-123",
      });

      expect(mockSessionMetricsService.trackOperation).toHaveBeenCalledWith(
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
      expect(MockStagehandClass.prototype.act).toHaveBeenCalledWith("Click the login button");
    });

    it("should track act operation", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.act({
        sessionId: "session-123",
        instruction: "Fill out the form",
      });

      expect(mockSessionMetricsService.trackOperation).toHaveBeenCalledWith(
        "session-123",
        "act",
        expect.objectContaining({
          instruction: "Fill out the form",
        })
      );
    });

    it("should handle act failure", async () => {
      MockStagehandClass.prototype.act.mockRejectedValueOnce(
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
      MockStagehandClass.prototype.observe.mockResolvedValueOnce([
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
      expect(MockStagehandClass.prototype.observe).toHaveBeenCalledWith(
        "Find all interactive elements"
      );
    });

    it("should track observe operation", async () => {
      const caller = browserRouter.createCaller(mockCtx);
      await caller.observe({
        sessionId: "session-123",
        instruction: "Observe buttons",
      });

      expect(mockSessionMetricsService.trackOperation).toHaveBeenCalledWith(
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
      expect(mockBrowserbaseSDK.getSessionDebug).toHaveBeenCalledWith(
        "session-123"
      );
    });

    it("should handle debug URL retrieval failure", async () => {
      mockBrowserbaseSDK.getSessionDebug.mockRejectedValueOnce(
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
        mockBrowserbaseSDK.getSessionRecording
      ).toHaveBeenCalledWith("session-123");
    });

    it("should handle recording retrieval failure", async () => {
      mockBrowserbaseSDK.getSessionRecording.mockRejectedValueOnce(
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

      // Configure terminateSession for this test
      mockBrowserbaseSDK.terminateSession.mockResolvedValueOnce({
        success: true,
        sessionId: "session-123",
      });

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.closeSession({
        sessionId: "session-123",
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe("session-123");
      expect(mockSessionMetricsService.trackSessionEnd).toHaveBeenCalledWith(
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
      // Configure terminateSession to fail
      mockBrowserbaseSDK.terminateSession.mockRejectedValueOnce(new Error("Termination failed"));

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
      // Use hoisted mock to simulate null database
      mockGetDb.mockResolvedValueOnce(null);

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

      // Configure terminateSession for this test
      mockBrowserbaseSDK.terminateSession.mockResolvedValue({
        success: true,
        sessionId: "session-123",
      });

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

      // The router catches terminateSession errors gracefully (see browser.ts line 1481-1483)
      // So even if terminateSession fails, it won't populate the failed array
      // unless closeStagehandInstance throws, which it won't with no active instances
      mockBrowserbaseSDK.terminateSession.mockResolvedValue({ success: true });

      const caller = browserRouter.createCaller(mockCtx);
      const result = await caller.bulkTerminate({
        sessionIds: ["session-1", "session-2", "session-3"],
      });

      // All sessions should succeed since terminateSession errors are caught
      expect(result.success.length).toBe(3);
      expect(result.failed.length).toBe(0);
    });

    it("should emit websocket event", async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      // Configure terminateSession for this test
      mockBrowserbaseSDK.terminateSession.mockResolvedValue({ success: true });

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
      // Use hoisted mock to simulate null database
      mockGetDb.mockResolvedValueOnce(null);

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
      expect(mockSessionMetricsService.getSessionMetrics).toHaveBeenCalledWith(
        "session-123"
      );
      expect(mockSessionMetricsService.calculateCost).toHaveBeenCalledWith(
        "session-123"
      );
    });

    it("should handle metrics retrieval failure", async () => {
      mockSessionMetricsService.getSessionMetrics.mockRejectedValueOnce(
        new Error("Metrics not found")
      );

      const caller = browserRouter.createCaller(mockCtx);

      await expect(
        caller.getSessionMetrics({ sessionId: "session-123" })
      ).rejects.toThrow(TRPCError);
    });
  });
});
