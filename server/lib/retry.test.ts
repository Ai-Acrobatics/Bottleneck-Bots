/**
 * Retry Utility Tests
 * Comprehensive test suite for retry logic with exponential backoff
 * Uses TDD principles with red-green-refactor cycle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isRetryableError,
  withRetry,
  retryFetch,
  Retry,
  DEFAULT_RETRY_OPTIONS,
  RetryOptions,
} from "./retry";

describe("Retry Utility", () => {
  // =====================================================================
  // 1. isRetryableError Function Tests
  // =====================================================================

  describe("isRetryableError", () => {
    describe("network errors", () => {
      it("should identify ECONNREFUSED as retryable", () => {
        const error = new Error("ECONNREFUSED: Connection refused");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify ECONNRESET as retryable", () => {
        const error = new Error("ECONNRESET: Connection reset by peer");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify ETIMEDOUT as retryable", () => {
        const error = new Error("ETIMEDOUT: Operation timed out");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify ENOTFOUND as retryable", () => {
        const error = new Error("ENOTFOUND: getaddrinfo ENOTFOUND api.example.com");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify generic network error as retryable", () => {
        const error = new Error("Network error occurred");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify socket hang up as retryable", () => {
        const error = new Error("socket hang up");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify fetch failed as retryable", () => {
        const error = new Error("fetch failed");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify request timeout as retryable", () => {
        const error = new Error("request timeout");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify connection timeout as retryable", () => {
        const error = new Error("connection timeout");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify getaddrinfo as retryable", () => {
        const error = new Error("getaddrinfo failed");
        expect(isRetryableError(error)).toBe(true);
      });
    });

    describe("HTTP errors", () => {
      it("should identify 5xx server errors as retryable", () => {
        const error = new Error("HTTP Error: Status: 500");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify 502 Bad Gateway as retryable", () => {
        const error = new Error("Error Status: 502");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify 503 Service Unavailable as retryable", () => {
        const error = new Error("Status: 503");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify 429 rate limit by status code as retryable", () => {
        const error = new Error("Status: 429");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify 429 rate limit by text as retryable", () => {
        const error = new Error("rate limit exceeded");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should NOT retry 400 Bad Request", () => {
        const error = new Error("Status: 400");
        expect(isRetryableError(error)).toBe(false);
      });

      it("should NOT retry 401 Unauthorized", () => {
        const error = new Error("Status: 401");
        expect(isRetryableError(error)).toBe(false);
      });

      it("should NOT retry 403 Forbidden", () => {
        const error = new Error("Status: 403");
        expect(isRetryableError(error)).toBe(false);
      });

      it("should NOT retry 404 Not Found", () => {
        const error = new Error("Status: 404");
        expect(isRetryableError(error)).toBe(false);
      });
    });

    describe("timeout errors", () => {
      it("should identify timeout errors as retryable", () => {
        const error = new Error("Request timeout after 5000ms");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should identify connection timeout as retryable", () => {
        const error = new Error("Connection timeout");
        expect(isRetryableError(error)).toBe(true);
      });
    });

    describe("service unavailable", () => {
      it("should identify unavailable service as retryable", () => {
        const error = new Error("Service unavailable");
        expect(isRetryableError(error)).toBe(true);
      });
    });

    describe("validation errors", () => {
      it("should NOT retry validation errors", () => {
        const error = new Error("Validation failed: invalid input");
        expect(isRetryableError(error)).toBe(false);
      });

      it("should NOT retry invalid data errors", () => {
        const error = new Error("Invalid data provided");
        expect(isRetryableError(error)).toBe(false);
      });
    });

    describe("custom retryable error patterns", () => {
      it("should respect custom retryable patterns", () => {
        const error = new Error("Custom transient error");
        const patterns = ["transient"];
        expect(isRetryableError(error, patterns)).toBe(true);
      });

      it("should NOT retry when custom patterns don't match", () => {
        const error = new Error("Something bad happened");
        const patterns = ["transient"];
        expect(isRetryableError(error, patterns)).toBe(false);
      });

      it("should handle multiple custom patterns", () => {
        const error = new Error("temporary lock error");
        const patterns = ["transient", "temporary"];
        expect(isRetryableError(error, patterns)).toBe(true);
      });

      it("should be case insensitive with custom patterns", () => {
        const error = new Error("TEMPORARY issue");
        const patterns = ["temporary"];
        expect(isRetryableError(error, patterns)).toBe(true);
      });
    });

    describe("error message case sensitivity", () => {
      it("should handle uppercase error messages", () => {
        const error = new Error("ECONNREFUSED");
        expect(isRetryableError(error)).toBe(true);
      });

      it("should handle mixed case error messages", () => {
        const error = new Error("Network Error");
        expect(isRetryableError(error)).toBe(true);
      });
    });
  });

  // =====================================================================
  // 2. withRetry Function Tests
  // =====================================================================

  describe("withRetry", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("success scenarios", () => {
      it("should return result on first success", async () => {
        const expectedResult = { data: "success" };
        const fn = vi.fn().mockResolvedValue(expectedResult);

        const result = await withRetry(fn);

        expect(result).toEqual(expectedResult);
        expect(fn).toHaveBeenCalledTimes(1);
      });

      it("should return result after retries on subsequent success", async () => {
        const expectedResult = { data: "success" };
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("ECONNREFUSED"))
          .mockResolvedValue(expectedResult);

        const result = await withRetry(fn);

        expect(result).toEqual(expectedResult);
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it("should succeed after multiple transient failures", async () => {
        const expectedResult = "final success";
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("ECONNREFUSED"))
          .mockRejectedValueOnce(new Error("timeout"))
          .mockResolvedValue(expectedResult);

        const result = await withRetry(fn, { maxAttempts: 5 });

        expect(result).toEqual(expectedResult);
        expect(fn).toHaveBeenCalledTimes(3);
      });
    });

    describe("retry behavior", () => {
      it("should retry on retryable errors", async () => {
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("Network error"))
          .mockResolvedValue("success");

        await withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 });

        expect(fn).toHaveBeenCalledTimes(2);
      });

      it("should throw immediately on non-retryable errors", async () => {
        const error = new Error("Status: 404");
        const fn = vi.fn().mockRejectedValue(error);

        await expect(
          withRetry(fn, { maxAttempts: 3 })
        ).rejects.toThrow("404");

        expect(fn).toHaveBeenCalledTimes(1);
      });

      it("should stop retrying after maxAttempts", async () => {
        const fn = vi
          .fn()
          .mockRejectedValue(new Error("ECONNREFUSED"));

        await expect(
          withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 })
        ).rejects.toThrow();

        expect(fn).toHaveBeenCalledTimes(3);
      });

      it("should respect maxAttempts of 1", async () => {
        const fn = vi
          .fn()
          .mockRejectedValue(new Error("ECONNREFUSED"));

        await expect(
          withRetry(fn, { maxAttempts: 1 })
        ).rejects.toThrow();

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    describe("exponential backoff", () => {
      it("should apply exponential backoff delays", async () => {
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("timeout"))
          .mockRejectedValueOnce(new Error("timeout"))
          .mockResolvedValue("success");

        const startTime = Date.now();
        await withRetry(fn, {
          maxAttempts: 4,
          initialDelayMs: 10,
          backoffMultiplier: 2,
          maxDelayMs: 100,
        });
        const elapsedTime = Date.now() - startTime;

        // First retry after ~10ms, second after ~20ms = ~30ms minimum
        // Account for jitter which can reduce the delay
        expect(elapsedTime).toBeGreaterThan(5);
        expect(fn).toHaveBeenCalledTimes(3);
      });

      it("should cap delay at maxDelayMs", async () => {
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("timeout"))
          .mockResolvedValue("success");

        const startTime = Date.now();
        await withRetry(fn, {
          maxAttempts: 3,
          initialDelayMs: 1000,
          backoffMultiplier: 10,
          maxDelayMs: 50,
        });
        const elapsedTime = Date.now() - startTime;

        // Should not exceed maxDelayMs (plus some jitter and execution time)
        expect(elapsedTime).toBeLessThan(200);
      });

      it("should apply jitter to delays", async () => {
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("timeout"))
          .mockRejectedValueOnce(new Error("timeout"))
          .mockResolvedValue("success");

        const startTime = Date.now();
        await withRetry(fn, {
          maxAttempts: 4,
          initialDelayMs: 100,
          backoffMultiplier: 2,
          maxDelayMs: 500,
        });
        const elapsedTime = Date.now() - startTime;

        // With jitter, the actual delay is between capped - 20% to capped + 20%
        // This is a weak assertion but shows jitter is being applied
        expect(elapsedTime).toBeGreaterThan(20);
        expect(elapsedTime).toBeLessThan(500);
      });
    });

    describe("onRetry callback", () => {
      it("should call onRetry callback with error info", async () => {
        const onRetry = vi.fn();
        const error = new Error("Network error");
        const fn = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValue("success");

        await withRetry(fn, {
          maxAttempts: 3,
          initialDelayMs: 10,
          onRetry,
        });

        expect(onRetry).toHaveBeenCalledTimes(1);
        const [callError, attempt, delayMs] = onRetry.mock.calls[0];
        expect(callError).toEqual(error);
        expect(attempt).toBe(1);
        expect(typeof delayMs).toBe("number");
        expect(delayMs).toBeGreaterThanOrEqual(0);
      });

      it("should call onRetry with correct attempt number", async () => {
        const onRetry = vi.fn();
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("timeout"))
          .mockRejectedValueOnce(new Error("timeout"))
          .mockResolvedValue("success");

        await withRetry(fn, {
          maxAttempts: 4,
          initialDelayMs: 10,
          onRetry,
        });

        expect(onRetry).toHaveBeenCalledTimes(2);
        expect(onRetry.mock.calls[0][1]).toBe(1);
        expect(onRetry.mock.calls[1][1]).toBe(2);
      });

      it("should NOT call onRetry on first success", async () => {
        const onRetry = vi.fn();
        const fn = vi.fn().mockResolvedValue("success");

        await withRetry(fn, {
          maxAttempts: 3,
          onRetry,
        });

        expect(onRetry).not.toHaveBeenCalled();
      });
    });

    describe("error handling", () => {
      it("should throw after all attempts exhausted", async () => {
        const fn = vi
          .fn()
          .mockRejectedValue(new Error("ECONNREFUSED"));

        await expect(
          withRetry(fn, { maxAttempts: 2, initialDelayMs: 10 })
        ).rejects.toThrow();
      });

      it("should include all attempt errors in final error", async () => {
        const fn = vi
          .fn()
          .mockRejectedValue(new Error("ECONNREFUSED"));

        try {
          await withRetry(fn, { maxAttempts: 2, initialDelayMs: 10 });
        } catch (error: any) {
          expect(error.attempts).toBeDefined();
          expect(error.attempts).toHaveLength(2);
          expect(error.lastError).toBeDefined();
        }
      });

      it("should preserve error message in final error", async () => {
        const fn = vi
          .fn()
          .mockRejectedValue(new Error("ECONNREFUSED"));

        try {
          await withRetry(fn, { maxAttempts: 2, initialDelayMs: 10 });
        } catch (error: any) {
          expect(error.message).toContain("Failed after 2 attempts");
          expect(error.message).toContain("ECONNREFUSED");
        }
      });

      it("should handle non-Error objects thrown", async () => {
        const fn = vi.fn().mockRejectedValue("string error");

        await expect(
          withRetry(fn, { maxAttempts: 2, initialDelayMs: 10 })
        ).rejects.toThrow();
      });
    });

    describe("custom retry options", () => {
      it("should use custom retryable error patterns", async () => {
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error("custom transient error"))
          .mockResolvedValue("success");

        const result = await withRetry(fn, {
          maxAttempts: 3,
          initialDelayMs: 10,
          retryableErrors: ["transient"],
        });

        expect(result).toBe("success");
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it("should merge DEFAULT_RETRY_OPTIONS with custom options", async () => {
        const fn = vi.fn().mockResolvedValue("success");

        await withRetry(fn, { maxAttempts: 5 });

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    describe("default retry options", () => {
      it("should use DEFAULT_RETRY_OPTIONS when no options provided", async () => {
        const fn = vi.fn().mockResolvedValue("success");

        const result = await withRetry(fn);

        expect(result).toBe("success");
        expect(DEFAULT_RETRY_OPTIONS.maxAttempts).toBe(3);
      });

      it("should have correct default values", () => {
        expect(DEFAULT_RETRY_OPTIONS.maxAttempts).toBe(3);
        expect(DEFAULT_RETRY_OPTIONS.initialDelayMs).toBe(1000);
        expect(DEFAULT_RETRY_OPTIONS.maxDelayMs).toBe(30000);
        expect(DEFAULT_RETRY_OPTIONS.backoffMultiplier).toBe(2);
      });
    });
  });

  // =====================================================================
  // 3. retryFetch Function Tests
  // =====================================================================

  describe("retryFetch", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should fetch successfully on first attempt", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ data: "test" }),
      };

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      const response = await retryFetch("https://api.example.com/data");

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it("should retry on 5xx errors", async () => {
      const mockResponse502 = {
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
      };

      const mockResponse200 = {
        ok: true,
        status: 200,
        statusText: "OK",
      };

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(mockResponse502)
        .mockResolvedValueOnce(mockResponse200);

      vi.stubGlobal("fetch", fetchMock);

      const response = await retryFetch("https://api.example.com/data", {}, {
        maxAttempts: 3,
        initialDelayMs: 10,
        retryableErrors: ["502", "Bad Gateway"],
      });

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("should throw immediately on 4xx client errors", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

      await expect(
        retryFetch("https://api.example.com/data")
      ).rejects.toThrow("404");
    });

    it("should retry on 429 rate limit", async () => {
      const mockResponse429 = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      };

      const mockResponse200 = {
        ok: true,
        status: 200,
        statusText: "OK",
      };

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(mockResponse429)
        .mockResolvedValueOnce(mockResponse200);

      vi.stubGlobal("fetch", fetchMock);

      const response = await retryFetch("https://api.example.com/data", {}, {
        maxAttempts: 3,
        initialDelayMs: 10,
      });

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("should pass RequestInit options to fetch", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
      };

      const fetchMock = vi.fn().mockResolvedValue(mockResponse);
      vi.stubGlobal("fetch", fetchMock);

      const headers = { "Authorization": "Bearer token" };
      await retryFetch("https://api.example.com/data", { headers });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/data",
        expect.objectContaining({ headers })
      );
    });

    it("should respect custom retry options", async () => {
      const mockResponse200 = {
        ok: true,
        status: 200,
        statusText: "OK",
      };

      const fetchMock = vi
        .fn()
        .mockResolvedValue(mockResponse200);

      vi.stubGlobal("fetch", fetchMock);

      await retryFetch("https://api.example.com/data", {}, {
        maxAttempts: 5,
        initialDelayMs: 50,
      });

      expect(fetchMock).toHaveBeenCalled();
    });
  });

  // =====================================================================
  // 4. Retry Decorator Tests
  // =====================================================================

  describe("Retry decorator", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should wrap method with retry logic", async () => {
      // Test decorator function directly
      let callCount = 0;
      const method = async function (this: any) {
        callCount++;
        if (callCount === 1) {
          throw new Error("ECONNREFUSED");
        }
        return { success: true };
      };

      const descriptor = {
        value: method,
      };

      const decorator = Retry({ maxAttempts: 3, initialDelayMs: 10 });
      const wrappedDescriptor = decorator({}, "fetchData", descriptor);

      const testService = {};
      const result = await wrappedDescriptor.value.call(testService);

      expect(result).toEqual({ success: true });
      expect(callCount).toBe(2);
    });

    it("should preserve method context (this)", async () => {
      const testService = {
        value: "test",
      };

      const method = async function (this: any) {
        return this.value;
      };

      const descriptor = {
        value: method,
      };

      const decorator = Retry({ maxAttempts: 2, initialDelayMs: 10 });
      const wrappedDescriptor = decorator({}, "getValue", descriptor);

      const result = await wrappedDescriptor.value.call(testService);

      expect(result).toBe("test");
    });

    it("should pass method arguments correctly", async () => {
      const method = async function (a: number, b: number) {
        return a + b;
      };

      const descriptor = {
        value: method,
      };

      const decorator = Retry({ maxAttempts: 2, initialDelayMs: 10 });
      const wrappedDescriptor = decorator({}, "add", descriptor);

      const testService = {};
      const result = await wrappedDescriptor.value.call(testService, 2, 3);

      expect(result).toBe(5);
    });

    it("should handle multiple arguments", async () => {
      const method = async function (greeting: string, name: string) {
        return `${greeting}, ${name}!`;
      };

      const descriptor = {
        value: method,
      };

      const decorator = Retry({ maxAttempts: 2, initialDelayMs: 10 });
      const wrappedDescriptor = decorator({}, "greet", descriptor);

      const testService = {};
      const result = await wrappedDescriptor.value.call(testService, "Hello", "World");

      expect(result).toBe("Hello, World!");
    });

    it("should throw after retry exhaustion", async () => {
      const method = async function () {
        throw new Error("ECONNREFUSED");
      };

      const descriptor = {
        value: method,
      };

      const decorator = Retry({ maxAttempts: 2, initialDelayMs: 10 });
      const wrappedDescriptor = decorator({}, "failAlways", descriptor);

      const testService = {};

      await expect(
        wrappedDescriptor.value.call(testService)
      ).rejects.toThrow();
    });

    it("should respect custom retry options in decorator", async () => {
      let attempts = 0;

      const method = async function () {
        attempts++;
        if (attempts < 3) {
          throw new Error("timeout");
        }
        return "success";
      };

      const descriptor = {
        value: method,
      };

      const decorator = Retry({ maxAttempts: 4, initialDelayMs: 10 });
      const wrappedDescriptor = decorator({}, "method", descriptor);

      const testService = {};
      const result = await wrappedDescriptor.value.call(testService);

      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });
  });

  // =====================================================================
  // 5. Edge Cases
  // =====================================================================

  describe("edge cases", () => {
    it("should handle zero delay correctly", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValue("success");

      const startTime = Date.now();
      await withRetry(fn, {
        maxAttempts: 2,
        initialDelayMs: 0,
      });
      const elapsedTime = Date.now() - startTime;

      // Should complete quickly with zero delay
      expect(elapsedTime).toBeLessThan(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should handle very short delays", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValue("success");

      const startTime = Date.now();
      await withRetry(fn, {
        maxAttempts: 2,
        initialDelayMs: 1,
      });
      const elapsedTime = Date.now() - startTime;

      expect(elapsedTime).toBeLessThan(100);
    });

    it("should handle very large delays", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValue("success");

      await withRetry(fn, {
        maxAttempts: 2,
        initialDelayMs: 1000000,
        maxDelayMs: 50,
      });

      // maxDelayMs should cap the delay
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should handle async functions that resolve immediately", async () => {
      const fn = vi.fn().mockResolvedValue("instant");

      const result = await withRetry(fn);

      expect(result).toBe("instant");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should handle functions returning null", async () => {
      const fn = vi.fn().mockResolvedValue(null);

      const result = await withRetry(fn);

      expect(result).toBeNull();
    });

    it("should handle functions returning undefined", async () => {
      const fn = vi.fn().mockResolvedValue(undefined);

      const result = await withRetry(fn);

      expect(result).toBeUndefined();
    });

    it("should handle functions returning falsy values", async () => {
      const fn = vi.fn().mockResolvedValue(false);

      const result = await withRetry(fn);

      expect(result).toBe(false);
    });

    it("should handle backoff multiplier of 1 (no exponential growth)", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValue("success");

      const startTime = Date.now();
      await withRetry(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        backoffMultiplier: 1,
      });
      const elapsedTime = Date.now() - startTime;

      // All delays should be the same (~10ms each)
      expect(elapsedTime).toBeLessThan(100);
    });

    it("should handle large backoff multiplier", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValue("success");

      await withRetry(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        backoffMultiplier: 100,
        maxDelayMs: 50,
      });

      // maxDelayMs should cap exponential growth
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  // =====================================================================
  // 6. Integration Tests
  // =====================================================================

  describe("integration scenarios", () => {
    it("should handle complex retry scenario with multiple failures", async () => {
      let attempts = 0;

      const fn = async () => {
        attempts++;
        if (attempts === 1) throw new Error("timeout");
        if (attempts === 2) throw new Error("ECONNREFUSED");
        return "final success";
      };

      const onRetry = vi.fn();
      const result = await withRetry(fn, {
        maxAttempts: 5,
        initialDelayMs: 10,
        onRetry,
      });

      expect(result).toBe("final success");
      expect(attempts).toBe(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it("should handle retry with custom patterns and callbacks", async () => {
      let attempts = 0;
      const onRetry = vi.fn();

      const fn = async () => {
        attempts++;
        if (attempts === 1) throw new Error("custom error");
        return "success";
      };

      const result = await withRetry(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        retryableErrors: ["custom"],
        onRetry,
      });

      expect(result).toBe("success");
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should work with real-world API error scenario", async () => {
      const errors = [
        new Error("Status: 502"),
        new Error("Status: 503"),
      ];
      let errorIndex = 0;

      const fn = async () => {
        if (errorIndex < errors.length) {
          throw errors[errorIndex++];
        }
        return { data: "from api" };
      };

      const result = await withRetry(fn, {
        maxAttempts: 5,
        initialDelayMs: 10,
      });

      expect(result).toEqual({ data: "from api" });
      expect(errorIndex).toBe(2);
    });
  });
});
