/**
 * Unit Tests for GHL Login Workflow
 *
 * Tests authentication flow, 2FA handling, credential validation,
 * and login state checking
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ghlLogin, isGHLLoggedIn, ghlLogout, ghlLoginSchema } from "./login";
import { z } from "zod";

// Mock Stagehand
vi.mock("@browserbasehq/stagehand", () => ({
  Stagehand: vi.fn(),
}));

describe("GHL Login Workflow", () => {
  let mockStagehand: any;
  let mockPage: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock page
    mockPage = {
      goto: vi.fn().mockResolvedValue(undefined),
      waitForTimeout: vi.fn().mockResolvedValue(undefined),
      url: vi.fn().mockReturnValue("https://app.gohighlevel.com/"),
      content: vi.fn().mockResolvedValue(""),
      title: vi.fn().mockResolvedValue("GoHighLevel"),
      locator: vi.fn((selector) => ({
        fill: vi.fn().mockResolvedValue(undefined),
        click: vi.fn().mockResolvedValue(undefined),
        waitFor: vi.fn().mockResolvedValue(undefined),
        textContent: vi.fn().mockResolvedValue(""),
        isVisible: vi.fn().mockResolvedValue(true),
        first: vi.fn(function() { return this; }),
        last: vi.fn(function() { return this; }),
        nth: vi.fn(function() { return this; }),
        count: vi.fn().mockResolvedValue(1),
      })),
    };

    // Setup mock Stagehand
    mockStagehand = {
      browserbaseSessionID: "session-123",
      context: {
        pages: vi.fn().mockReturnValue([mockPage]),
      },
      act: vi.fn().mockResolvedValue(undefined),
      extract: vi.fn().mockResolvedValue({}),
      close: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========================================
  // LOGIN SCHEMA VALIDATION TESTS
  // ========================================

  describe("ghlLoginSchema Validation", () => {
    it("should validate valid credentials", () => {
      const credentials = {
        email: "user@example.com",
        password: "SecurePassword123",
      };

      const result = ghlLoginSchema.safeParse(credentials);

      expect(result.success).toBe(true);
    });

    it("should validate credentials with 2FA code", () => {
      const credentials = {
        email: "user@example.com",
        password: "SecurePassword123",
        twoFactorCode: "123456",
      };

      const result = ghlLoginSchema.safeParse(credentials);

      expect(result.success).toBe(true);
    });

    it("should validate credentials with location ID", () => {
      const credentials = {
        email: "user@example.com",
        password: "SecurePassword123",
        locationId: "loc-123456",
      };

      const result = ghlLoginSchema.safeParse(credentials);

      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const credentials = {
        email: "invalid-email",
        password: "Password123",
      };

      const result = ghlLoginSchema.safeParse(credentials);

      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const credentials = {
        email: "user@example.com",
        password: "",
      };

      const result = ghlLoginSchema.safeParse(credentials);

      expect(result.success).toBe(false);
    });

    it("should reject invalid 2FA code length", () => {
      const credentials = {
        email: "user@example.com",
        password: "Password123",
        twoFactorCode: "12345", // Only 5 digits, needs 6
      };

      const result = ghlLoginSchema.safeParse(credentials);

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // GHL LOGIN SUCCESS TESTS
  // ========================================

  describe("ghlLogin - Success Cases", () => {
    it("should login successfully with valid credentials", async () => {
      mockPage.url.mockReturnValue("https://app.gohighlevel.com/dashboard");

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe("session-123");
      expect(result.dashboardUrl).toContain("dashboard");
      expect(mockStagehand.act).toHaveBeenCalled();
    });

    it("should detect already logged in state", async () => {
      mockPage.url.mockReturnValue("https://app.gohighlevel.com/dashboard");

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.dashboardUrl).toContain("dashboard");
    });

    it("should include location ID in result", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/location/loc-123/dashboard"
      );

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
        locationId: "loc-123",
      });

      expect(result.success).toBe(true);
      expect(result.locationId).toBe("loc-123");
    });

    it("should navigate to specific location when provided", async () => {
      // First URL is login page, then redirects to location dashboard
      mockPage.url
        .mockReturnValueOnce("https://app.gohighlevel.com/")
        .mockReturnValueOnce("https://app.gohighlevel.com/location/loc-123/dashboard");

      await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
        locationId: "loc-123",
      });

      expect(mockPage.goto).toHaveBeenCalled();
    });

    it("should handle launchpad URL as success", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/launchpad"
      );

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
    });

    it("should handle location redirect URL as success", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/location/abc123/dashboard"
      );

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
    });
  });

  // ========================================
  // GHL LOGIN 2FA TESTS
  // ========================================

  describe("ghlLogin - 2FA Handling", () => {
    it("should detect 2FA requirement from page content", async () => {
      mockPage.content.mockResolvedValue(
        "Please enter your two-factor verification code"
      );

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.requires2FA).toBe(true);
      expect(result.success).toBe(false);
    });

    it("should handle 2FA with verification keyword", async () => {
      mockPage.content.mockResolvedValue("Verification code required");

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.requires2FA).toBe(true);
    });

    it("should handle 2FA with 2fa keyword", async () => {
      mockPage.content.mockResolvedValue("2FA authentication required");

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.requires2FA).toBe(true);
    });

    it("should login successfully with 2FA code", async () => {
      mockPage.content
        .mockResolvedValueOnce("Please enter your 2FA code")
        .mockResolvedValueOnce("");

      mockPage.url
        .mockReturnValueOnce("https://app.gohighlevel.com/")
        .mockReturnValueOnce("https://app.gohighlevel.com/dashboard");

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
        twoFactorCode: "123456",
      });

      expect(result.success).toBe(true);
      expect(mockStagehand.act).toHaveBeenCalledWith(
        expect.stringContaining("123456")
      );
    });

    it("should reject 2FA requirement without code", async () => {
      mockPage.content.mockResolvedValue("Enter verification code");

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.requires2FA).toBe(true);
      expect(result.error).toContain("2FA");
    });
  });

  // ========================================
  // GHL LOGIN ERROR TESTS
  // ========================================

  describe("ghlLogin - Error Handling", () => {
    it("should handle invalid credentials error", async () => {
      mockPage.url.mockReturnValue("https://app.gohighlevel.com/");
      mockStagehand.extract.mockResolvedValue({
        error: "Invalid email or password",
      });

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "wrongpassword",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle navigation error", async () => {
      mockPage.goto.mockRejectedValue(new Error("Navigation failed"));

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Navigation failed");
    });

    it("should handle Stagehand act error", async () => {
      mockStagehand.act.mockRejectedValue(
        new Error("Could not find email field")
      );

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error message from extract if available", async () => {
      mockPage.url.mockReturnValue("https://app.gohighlevel.com/");
      mockStagehand.extract.mockResolvedValue({
        error: "Account locked due to too many login attempts",
      });

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.error).toContain("Account locked");
    });

    it("should handle extract error gracefully", async () => {
      mockPage.url.mockReturnValue("https://app.gohighlevel.com/");
      mockStagehand.extract.mockRejectedValue(
        new Error("Extract failed")
      );

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("could not verify success");
    });

    it("should handle missing page gracefully", async () => {
      mockStagehand.context.pages.mockReturnValue([]);

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // IS GHL LOGGED IN TESTS
  // ========================================

  describe("isGHLLoggedIn", () => {
    it("should detect logged in state at dashboard", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/dashboard"
      );

      const result = await isGHLLoggedIn(mockStagehand);

      expect(result).toBe(true);
    });

    it("should detect logged in state at location", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/location/loc-123/dashboard"
      );

      const result = await isGHLLoggedIn(mockStagehand);

      expect(result).toBe(true);
    });

    it("should detect logged in state at launchpad", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/launchpad"
      );

      const result = await isGHLLoggedIn(mockStagehand);

      expect(result).toBe(true);
    });

    it("should detect not logged in at login page", async () => {
      mockPage.url.mockReturnValue("https://app.gohighlevel.com/");

      const result = await isGHLLoggedIn(mockStagehand);

      expect(result).toBe(false);
    });

    it("should detect not logged in at different domain", async () => {
      mockPage.url.mockReturnValue("https://example.com");

      const result = await isGHLLoggedIn(mockStagehand);

      expect(result).toBe(false);
    });

    it("should handle page access error", async () => {
      mockStagehand.context.pages.mockReturnValue([]);

      const result = await isGHLLoggedIn(mockStagehand);

      expect(result).toBe(false);
    });

    it("should handle URL retrieval error", async () => {
      mockPage.url.mockImplementation(() => {
        throw new Error("URL not available");
      });

      const result = await isGHLLoggedIn(mockStagehand);

      expect(result).toBe(false);
    });
  });

  // ========================================
  // GHL LOGOUT TESTS
  // ========================================

  describe("ghlLogout", () => {
    it("should logout successfully", async () => {
      const result = await ghlLogout(mockStagehand);

      expect(result).toBe(true);
      expect(mockStagehand.act).toHaveBeenCalledWith(
        expect.stringContaining("user profile menu")
      );
      expect(mockStagehand.act).toHaveBeenCalledWith(
        expect.stringContaining("Logout")
      );
    });

    it("should handle logout error gracefully", async () => {
      mockStagehand.act.mockRejectedValueOnce(
        new Error("Menu not found")
      );

      const result = await ghlLogout(mockStagehand);

      expect(result).toBe(false);
    });

    it("should handle page access error", async () => {
      mockStagehand.context.pages.mockReturnValue([]);

      const result = await ghlLogout(mockStagehand);

      expect(result).toBe(false);
    });
  });

  // ========================================
  // INTEGRATION TESTS
  // ========================================

  describe("Integration", () => {
    it("should flow from login to logged in check", async () => {
      mockPage.url
        .mockReturnValueOnce("https://app.gohighlevel.com/")
        .mockReturnValueOnce("https://app.gohighlevel.com/dashboard");

      const loginResult = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(loginResult.success).toBe(true);

      mockPage.url.mockReturnValue("https://app.gohighlevel.com/dashboard");
      const isLoggedIn = await isGHLLoggedIn(mockStagehand);

      expect(isLoggedIn).toBe(true);
    });

    it("should complete full login, check status, and logout flow", async () => {
      // Login
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/dashboard"
      );
      const loginResult = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });
      expect(loginResult.success).toBe(true);

      // Check logged in
      const isLoggedIn = await isGHLLoggedIn(mockStagehand);
      expect(isLoggedIn).toBe(true);

      // Logout
      const logoutResult = await ghlLogout(mockStagehand);
      expect(logoutResult).toBe(true);
    });

    it("should handle 2FA during login", async () => {
      mockPage.content.mockResolvedValue(
        "Enter your 2FA code"
      );
      mockPage.url
        .mockReturnValueOnce("https://app.gohighlevel.com/")
        .mockReturnValueOnce("https://app.gohighlevel.com/dashboard");

      const result = await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
        twoFactorCode: "123456",
      });

      expect(result.success).toBe(true);
    });
  });

  // ========================================
  // TIMEOUT AND TIMING TESTS
  // ========================================

  describe("Timing and Waits", () => {
    it("should wait after navigation", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/dashboard"
      );

      await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      expect(mockPage.waitForTimeout).toHaveBeenCalled();
    });

    it("should wait between actions", async () => {
      mockPage.url.mockReturnValue(
        "https://app.gohighlevel.com/dashboard"
      );

      await ghlLogin(mockStagehand, {
        email: "user@example.com",
        password: "password123",
      });

      const waitCalls = mockPage.waitForTimeout.mock.calls.length;
      expect(waitCalls).toBeGreaterThan(0);
    });
  });
});
