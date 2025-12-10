/**
 * Session Cleanup Service
 * Handles automatic cleanup of expired and stale browser sessions
 */

import { getDb } from "../db";
import { browserSessions } from "../../drizzle/schema";
import { eq, lt, and, or } from "drizzle-orm";
import { browserbaseSDK } from "../_core/browserbaseSDK";

interface CleanupResult {
  cleaned: number;
  failed: number;
  errors: string[];
}

class SessionCleanupService {
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Start the automatic cleanup scheduler
   * @param intervalMs - Cleanup interval in milliseconds (default: 5 minutes)
   */
  startScheduler(intervalMs: number = 5 * 60 * 1000): void {
    if (this.cleanupIntervalId) {
      console.log("[SessionCleanup] Scheduler already running");
      return;
    }

    console.log(`[SessionCleanup] Starting scheduler with ${intervalMs}ms interval`);

    // Run initial cleanup
    this.runCleanup();

    // Schedule periodic cleanup
    this.cleanupIntervalId = setInterval(() => {
      this.runCleanup();
    }, intervalMs);
  }

  /**
   * Stop the automatic cleanup scheduler
   */
  stopScheduler(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
      console.log("[SessionCleanup] Scheduler stopped");
    }
  }

  /**
   * Run cleanup process
   */
  async runCleanup(): Promise<CleanupResult> {
    if (this.isRunning) {
      console.log("[SessionCleanup] Cleanup already in progress, skipping");
      return { cleaned: 0, failed: 0, errors: [] };
    }

    this.isRunning = true;
    const result: CleanupResult = { cleaned: 0, failed: 0, errors: [] };

    try {
      console.log("[SessionCleanup] Starting cleanup...");

      const db = await getDb();
      if (!db) {
        console.warn("[SessionCleanup] Database not available");
        return result;
      }

      const now = new Date();

      // Find expired sessions
      const expiredSessions = await db
        .select()
        .from(browserSessions)
        .where(
          and(
            eq(browserSessions.status, "active"),
            or(
              lt(browserSessions.expiresAt, now),
              // Also cleanup sessions older than 2 hours without an expiry
              lt(browserSessions.createdAt, new Date(now.getTime() - 2 * 60 * 60 * 1000))
            )
          )
        );

      console.log(`[SessionCleanup] Found ${expiredSessions.length} expired sessions`);

      for (const session of expiredSessions) {
        try {
          // Try to terminate on Browserbase
          if (session.sessionId) {
            try {
              await browserbaseSDK.terminateSession(session.sessionId);
            } catch (e) {
              // Session may already be terminated
              console.log(`[SessionCleanup] Browserbase session may already be terminated: ${session.sessionId}`);
            }
          }

          // Update database status
          await db
            .update(browserSessions)
            .set({
              status: "expired",
              completedAt: now,
              updatedAt: now,
            })
            .where(eq(browserSessions.id, session.id));

          result.cleaned++;
          console.log(`[SessionCleanup] Cleaned session: ${session.sessionId}`);
        } catch (error) {
          result.failed++;
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          result.errors.push(`Session ${session.sessionId}: ${errorMsg}`);
          console.error(`[SessionCleanup] Failed to clean session ${session.sessionId}:`, error);
        }
      }

      console.log(`[SessionCleanup] Cleanup complete. Cleaned: ${result.cleaned}, Failed: ${result.failed}`);
    } catch (error) {
      console.error("[SessionCleanup] Cleanup error:", error);
      result.errors.push(error instanceof Error ? error.message : "Unknown error");
    } finally {
      this.isRunning = false;
    }

    return result;
  }

  /**
   * Clean up sessions for a specific user
   */
  async cleanupUserSessions(userId: number): Promise<CleanupResult> {
    const result: CleanupResult = { cleaned: 0, failed: 0, errors: [] };

    try {
      const db = await getDb();
      if (!db) {
        return result;
      }

      const userSessions = await db
        .select()
        .from(browserSessions)
        .where(
          and(
            eq(browserSessions.userId, userId),
            eq(browserSessions.status, "active")
          )
        );

      for (const session of userSessions) {
        try {
          if (session.sessionId) {
            try {
              await browserbaseSDK.terminateSession(session.sessionId);
            } catch (e) {
              // Ignore
            }
          }

          await db
            .update(browserSessions)
            .set({
              status: "completed",
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(browserSessions.id, session.id));

          result.cleaned++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Session ${session.sessionId}: ${error instanceof Error ? error.message : "Unknown"}`);
        }
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : "Unknown error");
    }

    return result;
  }

  /**
   * Get cleanup statistics
   */
  async getStats(): Promise<{
    active: number;
    completed: number;
    expired: number;
    failed: number;
  }> {
    const db = await getDb();
    if (!db) {
      return { active: 0, completed: 0, expired: 0, failed: 0 };
    }

    const [active, completed, expired, failed] = await Promise.all([
      db.select().from(browserSessions).where(eq(browserSessions.status, "active")),
      db.select().from(browserSessions).where(eq(browserSessions.status, "completed")),
      db.select().from(browserSessions).where(eq(browserSessions.status, "expired")),
      db.select().from(browserSessions).where(eq(browserSessions.status, "failed")),
    ]);

    return {
      active: active.length,
      completed: completed.length,
      expired: expired.length,
      failed: failed.length,
    };
  }
}

// Export singleton instance
export const sessionCleanupService = new SessionCleanupService();
