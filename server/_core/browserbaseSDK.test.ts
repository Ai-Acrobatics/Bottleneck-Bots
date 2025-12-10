/**
 * Unit Tests for Browserbase SDK Service
 *
 * Tests session management, error handling, and SDK initialization
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  BrowserbaseSDKService,
  BrowserbaseSDKError,
  type SessionCreateOptions,
} from "./browserbaseSDK";
import { createMockBrowserbaseClient, mockEnv } from "../../client/src/__tests__/helpers/test-helpers";

// Mock the Browserbase SDK
vi.mock("@browserbasehq/sdk", () => ({
  default: vi.fn(),
}));

describe("BrowserbaseSDK Service", () => {
  let restoreEnv: () => void;
  let mockClient: ReturnType<typeof createMockBrowserbaseClient>;

  beforeEach(async () => {
    // Mock environment variables
    restoreEnv = mockEnv({
      BROWSERBASE_API_KEY: "test-api-key-123",
      BROWSERBASE_PROJECT_ID: "test-project-id-456",
    });

    // Create mock Browserbase client
    mockClient = createMockBrowserbaseClient();

    // Mock the Browserbase constructor
    const Browserbase = (await import("@browserbasehq/sdk")).default;
    vi.mocked(Browserbase).mockImplementation(() => mockClient as any);

    vi.clearAllMocks();
  });

  afterEach(() => {
    restoreEnv();
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize successfully with API key", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      expect(browserbaseSDK.isInitialized()).toBe(true);
    });

    it("should handle missing API key gracefully", async () => {
      restoreEnv();
      restoreEnv = mockEnv({
        BROWSERBASE_PROJECT_ID: "test-project-id",
      });

      // Need to clear the module cache to re-initialize
      vi.resetModules();

      const { browserbaseSDK } = await import("./browserbaseSDK");

      expect(browserbaseSDK.isInitialized()).toBe(false);
    });

    it("should store project ID from environment", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      expect(browserbaseSDK.getDefaultProjectId()).toBe("test-project-id-456");
    });

    it("should handle initialization error", async () => {
      const Browserbase = (await import("@browserbasehq/sdk")).default;
      vi.mocked(Browserbase).mockImplementation(() => {
        throw new Error("Initialization failed");
      });

      vi.resetModules();

      await expect(async () => {
        await import("./browserbaseSDK");
      }).rejects.toThrow(BrowserbaseSDKError);
    });
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = BrowserbaseSDKService.getInstance();
      const instance2 = BrowserbaseSDKService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("createSession", () => {
    it("should create a session successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      const options: SessionCreateOptions = {
        browserSettings: {
          viewport: { width: 1920, height: 1080 },
        },
        recordSession: true,
      };

      const session = await browserbaseSDK.createSession(options);

      expect(session).toBeDefined();
      expect(session.id).toBe("session-123");
      expect(session.status).toBe("RUNNING");
      expect(mockClient.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "test-project-id-456",
          browserSettings: options.browserSettings,
          recordSession: true,
        })
      );
    });

    it("should use provided project ID over default", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await browserbaseSDK.createSession({
        projectId: "custom-project-id",
      });

      expect(mockClient.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "custom-project-id",
        })
      );
    });

    it("should throw error if project ID is missing", async () => {
      restoreEnv();
      restoreEnv = mockEnv({
        BROWSERBASE_API_KEY: "test-api-key",
      });

      vi.resetModules();
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.createSession()).rejects.toThrow(
        BrowserbaseSDKError
      );
    });

    it("should handle session creation failure", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.create.mockRejectedValueOnce(
        new Error("API rate limit exceeded")
      );

      await expect(browserbaseSDK.createSession()).rejects.toThrow(
        BrowserbaseSDKError
      );
      await expect(browserbaseSDK.createSession()).rejects.toThrow(
        "Failed to create Browserbase session"
      );
    });

    it("should handle proxy configuration", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await browserbaseSDK.createSession({
        proxies: true,
      });

      expect(mockClient.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          proxies: true,
        })
      );
    });

    it("should handle custom timeout", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await browserbaseSDK.createSession({
        timeout: 7200,
      });

      expect(mockClient.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 7200,
        })
      );
    });
  });

  describe("terminateSession", () => {
    it("should terminate a session successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      const result = await browserbaseSDK.terminateSession("session-123");

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe("session-123");
      expect(mockClient.sessions.update).toHaveBeenCalledWith("session-123", {
        status: "REQUEST_RELEASE",
      });
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.terminateSession("")).rejects.toThrow(
        BrowserbaseSDKError
      );
      await expect(browserbaseSDK.terminateSession("")).rejects.toThrow(
        "Session ID is required"
      );
    });

    it("should handle termination failure", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.update.mockRejectedValueOnce(
        new Error("Session not found")
      );

      await expect(
        browserbaseSDK.terminateSession("session-123")
      ).rejects.toThrow(BrowserbaseSDKError);
      await expect(
        browserbaseSDK.terminateSession("session-123")
      ).rejects.toThrow("Failed to terminate session");
    });
  });

  describe("getSessionDebug", () => {
    it("should get debug info successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      const debugInfo = await browserbaseSDK.getSessionDebug("session-123");

      expect(debugInfo).toBeDefined();
      expect(debugInfo.debuggerFullscreenUrl).toContain("fullscreen");
      expect(debugInfo.wsUrl).toContain("ws");
      expect(mockClient.sessions.debug).toHaveBeenCalledWith("session-123");
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.getSessionDebug("")).rejects.toThrow(
        BrowserbaseSDKError
      );
    });

    it("should handle debug info retrieval failure", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.debug.mockRejectedValueOnce(
        new Error("Session expired")
      );

      await expect(
        browserbaseSDK.getSessionDebug("session-123")
      ).rejects.toThrow(BrowserbaseSDKError);
      await expect(
        browserbaseSDK.getSessionDebug("session-123")
      ).rejects.toThrow("Failed to get session debug info");
    });
  });

  describe("getSessionRecording", () => {
    it("should get recording successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      const recording = await browserbaseSDK.getSessionRecording("session-123");

      expect(recording).toBeDefined();
      expect(recording.recordingUrl).toBeDefined();
      expect(recording.status).toBe("COMPLETED");
      expect(mockClient.sessions.recording.retrieve).toHaveBeenCalledWith(
        "session-123"
      );
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.getSessionRecording("")).rejects.toThrow(
        BrowserbaseSDKError
      );
    });

    it("should handle recording retrieval failure", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.recording.retrieve.mockRejectedValueOnce(
        new Error("Recording not ready")
      );

      await expect(
        browserbaseSDK.getSessionRecording("session-123")
      ).rejects.toThrow(BrowserbaseSDKError);
    });
  });

  describe("getSessionLogs", () => {
    it("should get logs successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      const logs = await browserbaseSDK.getSessionLogs("session-123");

      expect(logs).toBeDefined();
      expect(logs.logs).toBeInstanceOf(Array);
      expect(logs.logs.length).toBeGreaterThan(0);
      expect(mockClient.sessions.logs.list).toHaveBeenCalledWith("session-123");
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.getSessionLogs("")).rejects.toThrow(
        BrowserbaseSDKError
      );
    });

    it("should handle logs retrieval failure", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.logs.list.mockRejectedValueOnce(
        new Error("Logs not available")
      );

      await expect(
        browserbaseSDK.getSessionLogs("session-123")
      ).rejects.toThrow(BrowserbaseSDKError);
    });
  });

  describe("listSessions", () => {
    it("should list sessions successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.list.mockResolvedValueOnce([
        { id: "session-1", status: "RUNNING" },
        { id: "session-2", status: "COMPLETED" },
      ]);

      const sessions = await browserbaseSDK.listSessions();

      expect(sessions).toBeInstanceOf(Array);
      expect(sessions.length).toBe(2);
      expect(mockClient.sessions.list).toHaveBeenCalled();
    });

    it("should handle list failure", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.list.mockRejectedValueOnce(
        new Error("API error")
      );

      await expect(browserbaseSDK.listSessions()).rejects.toThrow();
    });
  });

  describe("getSession", () => {
    it("should get session details successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.retrieve.mockResolvedValueOnce({
        id: "session-123",
        status: "RUNNING",
        projectId: "project-123",
      });

      const session = await browserbaseSDK.getSession("session-123");

      expect(session).toBeDefined();
      expect(session.id).toBe("session-123");
      expect(mockClient.sessions.retrieve).toHaveBeenCalledWith("session-123");
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.getSession("")).rejects.toThrow(
        BrowserbaseSDKError
      );
    });

    it("should handle session retrieval failure", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.retrieve.mockRejectedValueOnce(
        new Error("Session not found")
      );

      await expect(browserbaseSDK.getSession("session-123")).rejects.toThrow(
        BrowserbaseSDKError
      );
    });
  });

  describe("updateSessionStatus", () => {
    it("should update session status successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      const result = await browserbaseSDK.updateSessionStatus(
        "session-123",
        "REQUEST_RELEASE"
      );

      expect(result).toBeDefined();
      expect(mockClient.sessions.update).toHaveBeenCalledWith("session-123", {
        status: "REQUEST_RELEASE",
      });
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(
        browserbaseSDK.updateSessionStatus("", "REQUEST_RELEASE")
      ).rejects.toThrow(BrowserbaseSDKError);
    });
  });

  describe("getSessionDownloads", () => {
    it("should get downloads successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.downloads.list.mockResolvedValueOnce([
        { filename: "file1.pdf", url: "https://example.com/file1.pdf" },
      ]);

      const downloads = await browserbaseSDK.getSessionDownloads("session-123");

      expect(downloads).toBeInstanceOf(Array);
      expect(mockClient.sessions.downloads.list).toHaveBeenCalledWith(
        "session-123"
      );
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.getSessionDownloads("")).rejects.toThrow(
        BrowserbaseSDKError
      );
    });
  });

  describe("getSessionUploads", () => {
    it("should get uploads successfully", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      mockClient.sessions.uploads.list.mockResolvedValueOnce([
        { filename: "upload1.txt" },
      ]);

      const uploads = await browserbaseSDK.getSessionUploads("session-123");

      expect(uploads).toBeInstanceOf(Array);
      expect(mockClient.sessions.uploads.list).toHaveBeenCalledWith(
        "session-123"
      );
    });

    it("should throw error if session ID is missing", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.getSessionUploads("")).rejects.toThrow(
        BrowserbaseSDKError
      );
    });
  });

  describe("createSessionWithGeoLocation", () => {
    it("should create session with geolocation", async () => {
      const { browserbaseSDK } = await import("./browserbaseSDK");

      const session = await browserbaseSDK.createSessionWithGeoLocation({
        city: "San Francisco",
        state: "CA",
        country: "US",
      });

      expect(session).toBeDefined();
      expect(mockClient.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          proxies: true,
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw BrowserbaseSDKError with correct properties", async () => {
      const error = new BrowserbaseSDKError(
        "Test error",
        "TEST_ERROR",
        new Error("Original error")
      );

      expect(error.name).toBe("BrowserbaseSDKError");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it("should throw NOT_INITIALIZED error when client is not initialized", async () => {
      restoreEnv();
      restoreEnv = mockEnv({});

      vi.resetModules();
      const { browserbaseSDK } = await import("./browserbaseSDK");

      await expect(browserbaseSDK.createSession()).rejects.toThrow(
        "Browserbase SDK is not initialized"
      );
    });
  });
});
