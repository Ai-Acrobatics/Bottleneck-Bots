/**
 * Webhook Service
 * Comprehensive webhook delivery with logging, retry mechanism, and statistics
 *
 * Features:
 * - Webhook delivery with full logging
 * - Automatic retry with exponential backoff
 * - Success rate and performance statistics
 * - Delivery history with filtering and pagination
 */

import { getDb } from "../db";
import { webhookLogs, type InsertWebhookLog, type WebhookLog } from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql, count } from "drizzle-orm";

// ========================================
// RETRY CONFIGURATION
// ========================================

const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  BACKOFF_DELAYS: [
    1 * 60 * 1000,      // 1 minute
    5 * 60 * 1000,      // 5 minutes
    15 * 60 * 1000,     // 15 minutes
    60 * 60 * 1000,     // 1 hour
    4 * 60 * 60 * 1000, // 4 hours
  ],
  TIMEOUT: 30000, // 30 second timeout for webhook requests
};

// ========================================
// WEBHOOK DELIVERY
// ========================================

/**
 * Send webhook with comprehensive logging
 *
 * @param webhookId - Webhook ID from user preferences
 * @param userId - User ID who owns the webhook
 * @param event - Event type that triggered the webhook
 * @param payload - Data to send to webhook
 * @param webhookUrl - The webhook endpoint URL
 * @param webhookSecret - Optional signing secret for payload verification
 * @returns Webhook log entry with delivery status
 */
export async function sendWebhook(params: {
  webhookId: string;
  userId: number;
  event: string;
  payload: Record<string, any>;
  webhookUrl: string;
  webhookSecret?: string;
}): Promise<WebhookLog> {
  const { webhookId, userId, event, payload, webhookUrl, webhookSecret } = params;

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Prepare request
  const requestBody = {
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  const requestBodyString = JSON.stringify(requestBody);

  // Generate signature if secret provided
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Event": event,
    "X-Webhook-ID": webhookId,
  };

  if (webhookSecret) {
    const crypto = await import("crypto");
    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(requestBodyString)
      .digest("hex");
    headers["X-Webhook-Signature"] = signature;
  }

  // Create initial log entry
  const [logEntry] = await db
    .insert(webhookLogs)
    .values({
      webhookId,
      userId,
      event,
      url: webhookUrl,
      method: "POST",
      requestHeaders: headers,
      requestBody,
      status: "pending",
      attempts: 1,
    })
    .returning();

  // Attempt delivery
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.TIMEOUT);

    const startTime = Date.now();
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: requestBodyString,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const responseBody = await response.text().catch(() => null);

    // Update log with response
    const status = response.ok ? "success" : "failed";
    const [updatedLog] = await db
      .update(webhookLogs)
      .set({
        responseStatus: response.status,
        responseBody,
        responseTime,
        status,
        completedAt: status === "success" ? new Date() : null,
        nextRetryAt: status === "failed" ? calculateNextRetry(1) : null,
      })
      .where(eq(webhookLogs.id, logEntry.id))
      .returning();

    return updatedLog;
  } catch (error: any) {
    // Handle delivery error
    const errorMessage = error.message || "Unknown error";
    const errorCode = error.name === "AbortError" ? "TIMEOUT" : error.code || "FETCH_ERROR";

    const [updatedLog] = await db
      .update(webhookLogs)
      .set({
        status: "failed",
        error: errorMessage,
        errorCode,
        nextRetryAt: calculateNextRetry(1),
      })
      .where(eq(webhookLogs.id, logEntry.id))
      .returning();

    return updatedLog;
  }
}

/**
 * Calculate next retry time based on attempt number
 */
function calculateNextRetry(attemptNumber: number): Date | null {
  if (attemptNumber >= RETRY_CONFIG.MAX_RETRIES) {
    return null; // No more retries
  }

  const delay = RETRY_CONFIG.BACKOFF_DELAYS[attemptNumber - 1] || RETRY_CONFIG.BACKOFF_DELAYS[RETRY_CONFIG.BACKOFF_DELAYS.length - 1];
  return new Date(Date.now() + delay);
}

// ========================================
// RETRY MECHANISM
// ========================================

/**
 * Retry failed webhooks that are due for retry
 * Should be called periodically (e.g., every minute via cron)
 *
 * @returns Array of retry results
 */
export async function retryFailedWebhooks(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  permanentlyFailed: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find webhooks due for retry
  const now = new Date();
  const webhooksToRetry = await db
    .select()
    .from(webhookLogs)
    .where(
      and(
        eq(webhookLogs.status, "failed"),
        lte(webhookLogs.nextRetryAt, now)
      )
    )
    .limit(100); // Process in batches

  const results = {
    processed: webhooksToRetry.length,
    succeeded: 0,
    failed: 0,
    permanentlyFailed: 0,
  };

  for (const log of webhooksToRetry) {
    const newAttemptNumber = (log.attempts || 1) + 1;

    // Check if we've exceeded max retries
    if (newAttemptNumber > RETRY_CONFIG.MAX_RETRIES) {
      await db
        .update(webhookLogs)
        .set({
          status: "permanently_failed",
          completedAt: new Date(),
          nextRetryAt: null,
        })
        .where(eq(webhookLogs.id, log.id));

      results.permanentlyFailed++;
      continue;
    }

    // Update status to retrying
    await db
      .update(webhookLogs)
      .set({
        status: "retrying",
        attempts: newAttemptNumber,
      })
      .where(eq(webhookLogs.id, log.id));

    // Attempt delivery
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.TIMEOUT);

      const headers = (log.requestHeaders || {}) as Record<string, string>;
      const startTime = Date.now();

      const response = await fetch(log.url, {
        method: log.method || "POST",
        headers,
        body: JSON.stringify(log.requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text().catch(() => null);

      if (response.ok) {
        // Success
        await db
          .update(webhookLogs)
          .set({
            responseStatus: response.status,
            responseBody,
            responseTime,
            status: "success",
            completedAt: new Date(),
            nextRetryAt: null,
          })
          .where(eq(webhookLogs.id, log.id));

        results.succeeded++;
      } else {
        // Failed again
        await db
          .update(webhookLogs)
          .set({
            responseStatus: response.status,
            responseBody,
            responseTime,
            status: "failed",
            nextRetryAt: calculateNextRetry(newAttemptNumber),
          })
          .where(eq(webhookLogs.id, log.id));

        results.failed++;
      }
    } catch (error: any) {
      // Retry failed with error
      const errorMessage = error.message || "Unknown error";
      const errorCode = error.name === "AbortError" ? "TIMEOUT" : error.code || "FETCH_ERROR";

      await db
        .update(webhookLogs)
        .set({
          status: "failed",
          error: errorMessage,
          errorCode,
          nextRetryAt: calculateNextRetry(newAttemptNumber),
        })
        .where(eq(webhookLogs.id, log.id));

      results.failed++;
    }
  }

  return results;
}

/**
 * Retry a specific failed webhook manually
 */
export async function retryWebhook(logId: string, userId: number): Promise<WebhookLog> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [log] = await db
    .select()
    .from(webhookLogs)
    .where(
      and(
        eq(webhookLogs.id, logId),
        eq(webhookLogs.userId, userId)
      )
    )
    .limit(1);

  if (!log) {
    throw new Error("Webhook log not found");
  }

  if (log.status === "success") {
    throw new Error("Cannot retry successful webhook");
  }

  const newAttemptNumber = (log.attempts || 1) + 1;

  if (newAttemptNumber > RETRY_CONFIG.MAX_RETRIES) {
    throw new Error("Maximum retry attempts exceeded");
  }

  // Update status to retrying
  await db
    .update(webhookLogs)
    .set({
      status: "retrying",
      attempts: newAttemptNumber,
    })
    .where(eq(webhookLogs.id, log.id));

  // Attempt delivery
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.TIMEOUT);

    const headers = (log.requestHeaders || {}) as Record<string, string>;
    const startTime = Date.now();

    const response = await fetch(log.url, {
      method: log.method || "POST",
      headers,
      body: JSON.stringify(log.requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const responseBody = await response.text().catch(() => null);

    const status = response.ok ? "success" : "failed";
    const [updatedLog] = await db
      .update(webhookLogs)
      .set({
        responseStatus: response.status,
        responseBody,
        responseTime,
        status,
        completedAt: status === "success" ? new Date() : null,
        nextRetryAt: status === "failed" ? calculateNextRetry(newAttemptNumber) : null,
      })
      .where(eq(webhookLogs.id, log.id))
      .returning();

    return updatedLog;
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error";
    const errorCode = error.name === "AbortError" ? "TIMEOUT" : error.code || "FETCH_ERROR";

    const [updatedLog] = await db
      .update(webhookLogs)
      .set({
        status: "failed",
        error: errorMessage,
        errorCode,
        nextRetryAt: calculateNextRetry(newAttemptNumber),
      })
      .where(eq(webhookLogs.id, log.id))
      .returning();

    return updatedLog;
  }
}

// ========================================
// WEBHOOK LOGS QUERY
// ========================================

/**
 * Get webhook logs with filtering and pagination
 */
export async function getWebhookLogs(params: {
  userId: number;
  webhookId?: string;
  event?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{
  logs: WebhookLog[];
  total: number;
}> {
  const {
    userId,
    webhookId,
    event,
    status,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = params;

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Build where conditions
  const conditions = [eq(webhookLogs.userId, userId)];

  if (webhookId) {
    conditions.push(eq(webhookLogs.webhookId, webhookId));
  }

  if (event) {
    conditions.push(eq(webhookLogs.event, event));
  }

  if (status) {
    conditions.push(eq(webhookLogs.status, status));
  }

  if (startDate) {
    conditions.push(gte(webhookLogs.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(webhookLogs.createdAt, endDate));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  // Get total count
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(webhookLogs)
    .where(whereClause);

  // Get logs
  const logs = await db
    .select()
    .from(webhookLogs)
    .where(whereClause)
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    logs,
    total: Number(total),
  };
}

// ========================================
// WEBHOOK STATISTICS
// ========================================

/**
 * Get webhook statistics and success metrics
 */
export async function getWebhookStats(params: {
  userId: number;
  webhookId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  permanentlyFailedDeliveries: number;
  successRate: number;
  averageResponseTime: number;
  medianResponseTime: number;
  eventBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  recentErrors: Array<{
    error: string;
    count: number;
  }>;
}> {
  const { userId, webhookId, startDate, endDate } = params;

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Build where conditions
  const conditions = [eq(webhookLogs.userId, userId)];

  if (webhookId) {
    conditions.push(eq(webhookLogs.webhookId, webhookId));
  }

  if (startDate) {
    conditions.push(gte(webhookLogs.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(webhookLogs.createdAt, endDate));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  // Get all logs for calculations
  const logs = await db
    .select()
    .from(webhookLogs)
    .where(whereClause);

  // Calculate statistics
  const totalDeliveries = logs.length;
  const successfulDeliveries = logs.filter(log => log.status === "success").length;
  const failedDeliveries = logs.filter(log => log.status === "failed" || log.status === "retrying").length;
  const permanentlyFailedDeliveries = logs.filter(log => log.status === "permanently_failed").length;
  const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

  // Calculate response times
  const responseTimes = logs
    .filter(log => log.responseTime !== null)
    .map(log => log.responseTime!)
    .sort((a, b) => a - b);

  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;

  const medianResponseTime = responseTimes.length > 0
    ? responseTimes[Math.floor(responseTimes.length / 2)]
    : 0;

  // Event breakdown
  const eventBreakdown: Record<string, number> = {};
  logs.forEach(log => {
    eventBreakdown[log.event] = (eventBreakdown[log.event] || 0) + 1;
  });

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  logs.forEach(log => {
    statusBreakdown[log.status] = (statusBreakdown[log.status] || 0) + 1;
  });

  // Recent errors (top 10)
  const errorCounts: Record<string, number> = {};
  logs
    .filter(log => log.error)
    .forEach(log => {
      const error = log.error!;
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });

  const recentErrors = Object.entries(errorCounts)
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalDeliveries,
    successfulDeliveries,
    failedDeliveries,
    permanentlyFailedDeliveries,
    successRate: Math.round(successRate * 100) / 100,
    averageResponseTime: Math.round(averageResponseTime),
    medianResponseTime,
    eventBreakdown,
    statusBreakdown,
    recentErrors,
  };
}
