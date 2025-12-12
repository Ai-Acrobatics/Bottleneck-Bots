/**
 * Webhook Retry Worker
 * Background worker for retrying failed webhook deliveries with exponential backoff
 *
 * This worker runs periodically to:
 * - Find webhooks that failed and are due for retry
 * - Attempt redelivery with automatic retry tracking
 * - Mark webhooks as permanently failed after max retries
 *
 * Schedule: Every 1 minute
 */

import { retryFailedWebhooks } from "../services/webhook.service";

/**
 * Webhook retry worker
 * Should be scheduled to run every minute via cron or background job scheduler
 */
export async function webhookRetryWorker(): Promise<void> {
  console.log("[WebhookRetryWorker] Starting webhook retry process...");

  try {
    const results = await retryFailedWebhooks();

    console.log("[WebhookRetryWorker] Webhook retry completed:", {
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      permanentlyFailed: results.permanentlyFailed,
    });

    if (results.processed > 0) {
      console.log(
        `[WebhookRetryWorker] ✓ ${results.succeeded} succeeded, ` +
        `✗ ${results.failed} failed, ` +
        `⊗ ${results.permanentlyFailed} permanently failed`
      );
    }
  } catch (error) {
    console.error("[WebhookRetryWorker] Error during webhook retry:", error);
    throw error;
  }
}

/**
 * Start the webhook retry worker with interval
 * @param intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
 */
export function startWebhookRetryWorker(intervalMs: number = 60000): NodeJS.Timeout {
  console.log(`[WebhookRetryWorker] Starting with interval: ${intervalMs}ms`);

  // Run immediately on start
  webhookRetryWorker().catch((error) => {
    console.error("[WebhookRetryWorker] Initial run failed:", error);
  });

  // Then run on interval
  const interval = setInterval(() => {
    webhookRetryWorker().catch((error) => {
      console.error("[WebhookRetryWorker] Scheduled run failed:", error);
    });
  }, intervalMs);

  return interval;
}

/**
 * Stop the webhook retry worker
 */
export function stopWebhookRetryWorker(interval: NodeJS.Timeout): void {
  console.log("[WebhookRetryWorker] Stopping worker");
  clearInterval(interval);
}

// If this file is run directly, start the worker
if (require.main === module) {
  console.log("[WebhookRetryWorker] Running in standalone mode");
  startWebhookRetryWorker();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("[WebhookRetryWorker] Received SIGINT, shutting down...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("[WebhookRetryWorker] Received SIGTERM, shutting down...");
    process.exit(0);
  });
}
