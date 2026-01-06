/**
 * Memory Cleanup Worker
 * Processes memory cleanup and consolidation jobs from the BullMQ queue
 */

import { Job } from "bullmq";
import { memoryCleanupScheduler } from "../services/memory";

// ========================================
// JOB DATA TYPES
// ========================================

export interface MemoryCleanupJobData {
  type: "memory_cleanup";
  options?: {
    cleanupExpired?: boolean;
    cleanupLowPerformance?: boolean;
    minSuccessRate?: number;
    minUsageCount?: number;
  };
}

export interface MemoryConsolidationJobData {
  type: "memory_consolidation";
  options?: {
    sessionId?: string;
    agentId?: string;
    threshold?: number;
  };
}

export type MemoryJobData = MemoryCleanupJobData | MemoryConsolidationJobData;

// ========================================
// WORKER PROCESSOR
// ========================================

/**
 * Process memory cleanup and consolidation jobs
 */
export async function processMemoryJob(job: Job<MemoryJobData>): Promise<any> {
  const { data } = job;

  console.log(`[Memory Worker] Processing job ${job.id} - Type: ${data.type}`);

  try {
    switch (data.type) {
      case "memory_cleanup": {
        const result = await memoryCleanupScheduler.runCleanup(data.options);

        return {
          success: true,
          type: "memory_cleanup",
          expiredCleaned: result.expiredCleaned,
          lowPerformanceCleaned: result.lowPerformanceCleaned,
        };
      }

      case "memory_consolidation": {
        const result = await memoryCleanupScheduler.runConsolidation(data.options);

        return {
          success: true,
          type: "memory_consolidation",
          consolidatedCount: result.consolidatedCount,
        };
      }

      default: {
        throw new Error(`Unknown memory job type: ${(data as any).type}`);
      }
    }
  } catch (error) {
    console.error(`[Memory Worker] Job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Job completion handler
 */
export function onMemoryJobCompleted(job: Job, result: any): void {
  console.log(`[Memory Worker] Job ${job.id} completed successfully`);

  if (result.type === "memory_cleanup") {
    console.log(`  - Expired entries cleaned: ${result.expiredCleaned}`);
    console.log(`  - Low-performance patterns cleaned: ${result.lowPerformanceCleaned}`);
  } else if (result.type === "memory_consolidation") {
    console.log(`  - Entries consolidated: ${result.consolidatedCount}`);
  }
}

/**
 * Job failure handler
 */
export function onMemoryJobFailed(job: Job | undefined, error: Error): void {
  if (job) {
    console.error(`[Memory Worker] Job ${job.id} failed:`, error.message);
  } else {
    console.error("[Memory Worker] Job failed:", error.message);
  }
}

/**
 * Job progress handler
 */
export function onMemoryJobProgress(job: Job, progress: number | object | string | boolean): void {
  console.log(`[Memory Worker] Job ${job.id} progress:`, progress);
}

// ========================================
// WORKER FACTORY
// ========================================

import { Worker } from "bullmq";
import { getRedisConnection } from "./utils";

/**
 * Create and configure the memory cleanup worker
 */
export function createMemoryCleanupWorker(): Worker {
  const worker = new Worker<MemoryJobData>(
    "memory_cleanup",
    async (job) => {
      return await processMemoryJob(job);
    },
    {
      connection: getRedisConnection(),
      concurrency: 2, // Process up to 2 cleanup jobs concurrently
      limiter: {
        max: 5, // Max 5 jobs
        duration: 60000, // Per minute (cleanup jobs are less frequent)
      },
    }
  );

  worker.on("completed", onMemoryJobCompleted);
  worker.on("failed", onMemoryJobFailed);
  worker.on("progress", onMemoryJobProgress);

  console.log("Memory cleanup worker initialized");
  return worker;
}
