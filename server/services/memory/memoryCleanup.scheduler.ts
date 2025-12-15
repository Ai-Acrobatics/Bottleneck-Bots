/**
 * Memory Cleanup Scheduler
 * Periodically cleans up expired memory entries and consolidates low-performance patterns
 * Integrates with the existing memory system and BullMQ job queue
 */

import { getMemorySystem } from "./index";
import { addJob, REDIS_AVAILABLE } from "../../_core/queue";

// ========================================
// TYPES
// ========================================

export interface MemoryCleanupOptions {
  /**
   * Clean up expired memory entries
   */
  cleanupExpired?: boolean;
  /**
   * Clean up low-performance reasoning patterns
   */
  cleanupLowPerformance?: boolean;
  /**
   * Minimum success rate for reasoning patterns (0-1)
   */
  minSuccessRate?: number;
  /**
   * Minimum usage count before evaluating performance
   */
  minUsageCount?: number;
}

export interface MemoryConsolidateOptions {
  /**
   * Session ID to consolidate (optional, consolidates all if not provided)
   */
  sessionId?: string;
  /**
   * Agent ID to consolidate (optional)
   */
  agentId?: string;
  /**
   * Similarity threshold for consolidation (0-1)
   */
  threshold?: number;
}

export interface MemoryCleanupStats {
  lastCleanupTime: Date | null;
  lastConsolidationTime: Date | null;
  totalCleanupsRun: number;
  totalConsolidationsRun: number;
  totalExpiredCleaned: number;
  totalLowPerformanceCleaned: number;
  totalEntriesConsolidated: number;
  isRunning: boolean;
}

// ========================================
// MEMORY CLEANUP SCHEDULER SERVICE
// ========================================

class MemoryCleanupSchedulerService {
  private isRunning = false;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private consolidateIntervalId: NodeJS.Timeout | null = null;

  // Default intervals (in milliseconds)
  private cleanupIntervalMs = 6 * 60 * 60 * 1000; // 6 hours
  private consolidateIntervalMs = 24 * 60 * 60 * 1000; // 24 hours

  // Statistics
  private stats: MemoryCleanupStats = {
    lastCleanupTime: null,
    lastConsolidationTime: null,
    totalCleanupsRun: 0,
    totalConsolidationsRun: 0,
    totalExpiredCleaned: 0,
    totalLowPerformanceCleaned: 0,
    totalEntriesConsolidated: 0,
    isRunning: false,
  };

  /**
   * Start the memory cleanup scheduler
   * @param options - Configuration options
   */
  start(options?: {
    cleanupIntervalMs?: number;
    consolidateIntervalMs?: number;
    runImmediately?: boolean;
  }): void {
    if (this.isRunning) {
      console.log("[Memory Cleanup] Scheduler is already running");
      return;
    }

    // Update intervals if provided
    if (options?.cleanupIntervalMs) {
      this.cleanupIntervalMs = options.cleanupIntervalMs;
    }
    if (options?.consolidateIntervalMs) {
      this.consolidateIntervalMs = options.consolidateIntervalMs;
    }

    this.isRunning = true;
    this.stats.isRunning = true;

    console.log("[Memory Cleanup] Starting scheduler");
    console.log(`  - Cleanup interval: ${this.cleanupIntervalMs / 1000 / 60} minutes`);
    console.log(`  - Consolidation interval: ${this.consolidateIntervalMs / 1000 / 60 / 60} hours`);

    // Run immediately if requested
    if (options?.runImmediately) {
      this.runCleanup().catch(error => {
        console.error("[Memory Cleanup] Initial cleanup failed:", error);
      });
      this.runConsolidation().catch(error => {
        console.error("[Memory Cleanup] Initial consolidation failed:", error);
      });
    }

    // Schedule cleanup job
    this.cleanupIntervalId = setInterval(() => {
      this.runCleanup().catch(error => {
        console.error("[Memory Cleanup] Scheduled cleanup failed:", error);
      });
    }, this.cleanupIntervalMs);

    // Schedule consolidation job
    this.consolidateIntervalId = setInterval(() => {
      this.runConsolidation().catch(error => {
        console.error("[Memory Cleanup] Scheduled consolidation failed:", error);
      });
    }, this.consolidateIntervalMs);
  }

  /**
   * Stop the memory cleanup scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("[Memory Cleanup] Scheduler is not running");
      return;
    }

    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }

    if (this.consolidateIntervalId) {
      clearInterval(this.consolidateIntervalId);
      this.consolidateIntervalId = null;
    }

    this.isRunning = false;
    this.stats.isRunning = false;
    console.log("[Memory Cleanup] Scheduler stopped");
  }

  /**
   * Run memory cleanup immediately
   */
  async runCleanup(options?: MemoryCleanupOptions): Promise<{
    expiredCleaned: number;
    lowPerformanceCleaned: number;
  }> {
    const startTime = Date.now();
    console.log("[Memory Cleanup] Starting cleanup job...");

    try {
      const memorySystem = getMemorySystem();

      const result = await memorySystem.cleanup({
        cleanupExpired: options?.cleanupExpired ?? true,
        cleanupLowPerformance: options?.cleanupLowPerformance ?? true,
        minSuccessRate: options?.minSuccessRate ?? 0.3,
        minUsageCount: options?.minUsageCount ?? 5,
      });

      // Update statistics
      this.stats.lastCleanupTime = new Date();
      this.stats.totalCleanupsRun++;
      this.stats.totalExpiredCleaned += result.expiredCleaned;
      this.stats.totalLowPerformanceCleaned += result.lowPerformanceCleaned;

      const duration = Date.now() - startTime;
      console.log(`[Memory Cleanup] Cleanup completed in ${duration}ms`);
      console.log(`  - Expired entries cleaned: ${result.expiredCleaned}`);
      console.log(`  - Low-performance patterns cleaned: ${result.lowPerformanceCleaned}`);

      return result;
    } catch (error) {
      console.error("[Memory Cleanup] Cleanup job failed:", error);
      throw error;
    }
  }

  /**
   * Run memory consolidation immediately
   */
  async runConsolidation(options?: MemoryConsolidateOptions): Promise<{
    consolidatedCount: number;
  }> {
    const startTime = Date.now();
    console.log("[Memory Cleanup] Starting consolidation job...");

    try {
      const memorySystem = getMemorySystem();

      // Get all entries for consolidation
      const entries = await memorySystem.searchMemory({
        sessionId: options?.sessionId,
        agentId: options?.agentId,
      });

      // Group entries by key and merge similar ones
      const keyGroups = new Map<string, typeof entries>();
      for (const entry of entries) {
        const existing = keyGroups.get(entry.key) || [];
        existing.push(entry);
        keyGroups.set(entry.key, existing);
      }

      let consolidatedCount = 0;

      // For each group, keep the most recent and delete others
      const { getAgentMemory } = await import("./agentMemory.service");
      const agentMemory = getAgentMemory();

      for (const [key, group] of Array.from(keyGroups)) {
        if (group.length > 1) {
          // Sort by date, keep newest
          group.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
          const newest = group[0];

          // Merge metadata
          const mergedMetadata = {
            ...newest.metadata,
            consolidatedFrom: group.slice(1).map((e: any) => e.id),
            consolidatedAt: new Date().toISOString(),
          };

          // Update the newest entry with merged metadata
          await agentMemory.updateContext(
            newest.sessionId,
            key,
            newest.value,
            mergedMetadata
          );

          consolidatedCount += group.length - 1;
        }
      }

      // Update statistics
      this.stats.lastConsolidationTime = new Date();
      this.stats.totalConsolidationsRun++;
      this.stats.totalEntriesConsolidated += consolidatedCount;

      const duration = Date.now() - startTime;
      console.log(`[Memory Cleanup] Consolidation completed in ${duration}ms`);
      console.log(`  - Entries consolidated: ${consolidatedCount}`);

      return { consolidatedCount };
    } catch (error) {
      console.error("[Memory Cleanup] Consolidation job failed:", error);
      throw error;
    }
  }

  /**
   * Get scheduler statistics
   */
  getStats(): MemoryCleanupStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      lastCleanupTime: null,
      lastConsolidationTime: null,
      totalCleanupsRun: 0,
      totalConsolidationsRun: 0,
      totalExpiredCleaned: 0,
      totalLowPerformanceCleaned: 0,
      totalEntriesConsolidated: 0,
      isRunning: this.isRunning,
    };
  }

  /**
   * Check if scheduler is running
   */
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Update cleanup interval
   */
  updateCleanupInterval(intervalMs: number): void {
    this.cleanupIntervalMs = intervalMs;
    if (this.isRunning) {
      // Restart scheduler with new interval
      this.stop();
      this.start({ cleanupIntervalMs: intervalMs });
    }
  }

  /**
   * Update consolidation interval
   */
  updateConsolidationInterval(intervalMs: number): void {
    this.consolidateIntervalMs = intervalMs;
    if (this.isRunning) {
      // Restart scheduler with new interval
      this.stop();
      this.start({ consolidateIntervalMs: intervalMs });
    }
  }
}

// ========================================
// EXPORT SINGLETON
// ========================================

export const memoryCleanupScheduler = new MemoryCleanupSchedulerService();

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Queue a memory cleanup job (for manual triggering via API or workers)
 */
export async function queueMemoryCleanup(options?: MemoryCleanupOptions) {
  if (!REDIS_AVAILABLE) {
    console.log("[Memory Cleanup] Redis not available, running cleanup directly");
    return await memoryCleanupScheduler.runCleanup(options);
  }

  // Queue the job using BullMQ
  return await addJob("workflow", "MEMORY_CLEANUP" as any, {
    type: "memory_cleanup",
    options,
  } as any);
}

/**
 * Queue a memory consolidation job (for manual triggering via API or workers)
 */
export async function queueMemoryConsolidation(options?: MemoryConsolidateOptions) {
  if (!REDIS_AVAILABLE) {
    console.log("[Memory Cleanup] Redis not available, running consolidation directly");
    return await memoryCleanupScheduler.runConsolidation(options);
  }

  // Queue the job using BullMQ
  return await addJob("workflow", "MEMORY_CONSOLIDATION" as any, {
    type: "memory_consolidation",
    options,
  } as any);
}
