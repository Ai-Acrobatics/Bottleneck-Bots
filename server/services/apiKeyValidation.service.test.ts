/**
 * API Key Validation Service Tests
 * Unit tests for API key validation functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiKeyValidationService } from "./apiKeyValidation.service";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("API Key Validation Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateOpenAI", () => {
    it("should return invalid for malformed API key", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid API key" } }),
      });

      const result = await apiKeyValidationService.validateOpenAI("invalid-key");

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it("should return result object with required properties", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Unauthorized" } }),
      });

      const result = await apiKeyValidationService.validateOpenAI("sk-test-key");

      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("validateAnthropic", () => {
    it("should return invalid for malformed API key", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid API key" } }),
      });

      const result = await apiKeyValidationService.validateAnthropic("sk-ant-invalid-key");

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await apiKeyValidationService.validateAnthropic("sk-ant-test-key");

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.message).toBeTruthy();
    });
  });

  describe("validateStripe", () => {
    it("should return invalid for test key", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid API key" } }),
      });

      const result = await apiKeyValidationService.validateStripe("sk_test_invalid");

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
    });
  });

  describe("validateTwilio", () => {
    it("should return invalid for wrong credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: "Unauthorized" }),
      });

      const result = await apiKeyValidationService.validateTwilio(
        "ACinvalid",
        "invalid-token"
      );

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
    });

    it("should return result with valid property", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ friendly_name: "Test Account" }),
      });

      const result = await apiKeyValidationService.validateTwilio(
        "ACtest00000000000000000000000000",
        "test-token"
      );

      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("validate (generic method)", () => {
    it("should route to correct validator for openai", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid" } }),
      });

      const result = await apiKeyValidationService.validate("openai", {
        apiKey: "sk-test-key",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });

    it("should route to correct validator for anthropic", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid" } }),
      });

      const result = await apiKeyValidationService.validate("anthropic", {
        apiKey: "sk-ant-test-key",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
    });

    it("should route to correct validator for twilio", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: "Unauthorized" }),
      });

      const result = await apiKeyValidationService.validate("twilio", {
        accountSid: "ACtest",
        authToken: "test-token",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
    });
  });

  describe("validateVapi", () => {
    it("should return validation result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const result = await apiKeyValidationService.validateVapi("test-key");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("validateApify", () => {
    it("should return validation result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const result = await apiKeyValidationService.validateApify("test-key");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("validateBrowserbase", () => {
    it("should return validation result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const result = await apiKeyValidationService.validateBrowserbase("test-key");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("validateSendgrid", () => {
    it("should return validation result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ errors: [{ message: "Unauthorized" }] }),
      });

      const result = await apiKeyValidationService.validateSendgrid("test-key");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("validateGoogle", () => {
    it("should return validation result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid" } }),
      });

      const result = await apiKeyValidationService.validateGoogle("test-key");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("validateGohighlevel", () => {
    it("should return validation result", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const result = await apiKeyValidationService.validateGohighlevel("test-key");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
    });
  });

  describe("Error Handling", () => {
    it("should handle network timeouts", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

      const result = await apiKeyValidationService.validateOpenAI("sk-test-key");

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
    });

    it("should handle invalid JSON responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("Invalid JSON")),
        text: () => Promise.resolve("Server error"),
      });

      const result = await apiKeyValidationService.validateOpenAI("sk-test-key");

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
    });
  });
});
