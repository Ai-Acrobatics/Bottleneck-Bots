/**
 * Memory Router - tRPC API for Agent Memory System
 *
 * Provides endpoints for:
 * - CRUD operations for agent memory entries
 * - Memory consolidation and cleanup
 * - Relevance-based memory retrieval (RAG-like patterns)
 * - Memory statistics and analytics
 * - Session context management
 * - Reasoning pattern management
 */

import { z } from 'zod';
import { publicProcedure, router } from '../../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getMemorySystem, memoryCleanupScheduler } from '../../services/memory';

// ========================================
// ZOD SCHEMAS
// ========================================

/**
 * Memory entry metadata schema
 */
const memoryMetadataSchema = z.object({
  type: z.enum(['context', 'reasoning', 'knowledge', 'state']).optional(),
  domain: z.string().optional(),
  namespace: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.string().optional(),
}).passthrough(); // Allow additional fields

/**
 * Create memory entry input
 */
const createMemorySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
  agentId: z.string().optional(),
  userId: z.number().optional(),
  metadata: memoryMetadataSchema.optional(),
  ttl: z.number().positive().optional(), // Time to live in seconds
  embedding: z.array(z.number()).optional(),
});

/**
 * Update memory entry input
 */
const updateMemorySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
  metadata: memoryMetadataSchema.optional(),
});

/**
 * Delete memory entry input
 */
const deleteMemorySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  key: z.string().optional(),
});

/**
 * Memory query input
 */
const queryMemorySchema = z.object({
  sessionId: z.string().optional(),
  agentId: z.string().optional(),
  userId: z.number().optional(),
  namespace: z.string().optional(),
  domain: z.string().optional(),
  tags: z.array(z.string()).optional(),
  type: z.string().optional(),
  limit: z.number().positive().optional(),
  offset: z.number().min(0).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  includeExpired: z.boolean().optional(),
});

/**
 * Session context input
 */
const sessionContextSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  context: z.record(z.string(), z.any()),
  agentId: z.string().optional(),
  userId: z.number().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Reasoning pattern input
 */
const reasoningPatternSchema = z.object({
  pattern: z.string().min(1, 'Pattern is required'),
  result: z.any(),
  context: z.record(z.string(), z.any()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  domain: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Search similar reasoning input
 */
const searchReasoningSchema = z.object({
  pattern: z.string().min(1, 'Pattern is required'),
  domain: z.string().optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  limit: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Update reasoning usage input
 */
const updateReasoningUsageSchema = z.object({
  patternId: z.string().min(1, 'Pattern ID is required'),
  success: z.boolean(),
});

/**
 * Cleanup options input
 */
const cleanupOptionsSchema = z.object({
  cleanupExpired: z.boolean().optional(),
  cleanupLowPerformance: z.boolean().optional(),
  minSuccessRate: z.number().min(0).max(1).optional(),
  minUsageCount: z.number().min(0).optional(),
}).optional();

// ========================================
// MEMORY ROUTER
// ========================================

export const memoryRouter = router({
  // ========================================
  // MEMORY ENTRY CRUD OPERATIONS
  // ========================================

  /**
   * Create a new memory entry
   */
  create: publicProcedure
    .input(createMemorySchema)
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const entryId = await memorySystem.searchMemory({}).then(async () => {
          // Use the agentMemory service directly for creating entries
          const agentMemory = (await import('../../services/memory')).getAgentMemory();
          return await agentMemory.storeContext(
            input.sessionId,
            input.key,
            input.value,
            {
              agentId: input.agentId,
              userId: input.userId,
              metadata: input.metadata,
              ttl: input.ttl,
              embedding: input.embedding,
            }
          );
        });

        return {
          success: true,
          entryId,
          message: 'Memory entry created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create memory entry',
        });
      }
    }),

  /**
   * Retrieve memory entries by session
   */
  getBySession: publicProcedure
    .input(z.object({
      sessionId: z.string().min(1, 'Session ID is required'),
      limit: z.number().positive().optional(),
      offset: z.number().min(0).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const entries = await memorySystem.getSessionMemories(input.sessionId, {
          limit: input.limit,
          offset: input.offset,
        });

        return {
          success: true,
          entries,
          total: entries.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retrieve memory entries',
        });
      }
    }),

  /**
   * Retrieve a specific memory entry by key
   */
  getByKey: publicProcedure
    .input(z.object({
      sessionId: z.string().min(1, 'Session ID is required'),
      key: z.string().min(1, 'Key is required'),
    }))
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const value = await memorySystem.retrieveContextValue(input.sessionId, input.key);

        if (value === undefined) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Memory entry not found: ${input.key}`,
          });
        }

        return {
          success: true,
          value,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retrieve memory entry',
        });
      }
    }),

  /**
   * Search memory entries with filters
   */
  search: publicProcedure
    .input(queryMemorySchema)
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const entries = await memorySystem.searchMemory(input);

        return {
          success: true,
          entries,
          total: entries.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to search memory entries',
        });
      }
    }),

  /**
   * Update an existing memory entry
   */
  update: publicProcedure
    .input(updateMemorySchema)
    .mutation(async ({ input }) => {
      try {
        const { getAgentMemory } = await import('../../services/memory');
        const agentMemory = getAgentMemory();

        await agentMemory.updateContext(
          input.sessionId,
          input.key,
          input.value,
          input.metadata
        );

        return {
          success: true,
          message: 'Memory entry updated successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update memory entry',
        });
      }
    }),

  /**
   * Delete memory entry or all entries for a session
   */
  delete: publicProcedure
    .input(deleteMemorySchema)
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        await memorySystem.deleteContext(input.sessionId, input.key);

        const message = input.key
          ? `Memory entry '${input.key}' deleted`
          : `All memory entries for session '${input.sessionId}' deleted`;

        return {
          success: true,
          message,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete memory entry',
        });
      }
    }),

  // ========================================
  // SESSION CONTEXT MANAGEMENT
  // ========================================

  /**
   * Store session context
   */
  storeContext: publicProcedure
    .input(sessionContextSchema)
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        await memorySystem.storeContext(input.sessionId, input.context, {
          agentId: input.agentId,
          userId: input.userId,
          metadata: input.metadata,
        });

        return {
          success: true,
          message: 'Session context stored successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to store session context',
        });
      }
    }),

  /**
   * Retrieve session context
   */
  getContext: publicProcedure
    .input(z.object({
      sessionId: z.string().min(1, 'Session ID is required'),
    }))
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const context = await memorySystem.retrieveContext(input.sessionId);

        return {
          success: true,
          context: context || null,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retrieve session context',
        });
      }
    }),

  /**
   * Update session context
   */
  updateContext: publicProcedure
    .input(sessionContextSchema)
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        await memorySystem.updateContext(input.sessionId, input.context, {
          agentId: input.agentId,
          userId: input.userId,
          metadata: input.metadata,
        });

        return {
          success: true,
          message: 'Session context updated successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update session context',
        });
      }
    }),

  // ========================================
  // REASONING PATTERNS
  // ========================================

  /**
   * Store a reasoning pattern
   */
  storeReasoning: publicProcedure
    .input(reasoningPatternSchema)
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const patternId = await memorySystem.storeReasoning(
          input.pattern,
          input.result,
          {
            context: input.context,
            confidence: input.confidence,
            domain: input.domain,
            tags: input.tags,
            metadata: input.metadata,
          }
        );

        return {
          success: true,
          patternId,
          message: 'Reasoning pattern stored successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to store reasoning pattern',
        });
      }
    }),

  /**
   * Search for similar reasoning patterns (RAG-like retrieval)
   */
  searchReasoning: publicProcedure
    .input(searchReasoningSchema)
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const patterns = await memorySystem.findSimilarReasoning(input.pattern, {
          domain: input.domain,
          minConfidence: input.minConfidence,
          limit: input.limit,
          tags: input.tags,
        });

        return {
          success: true,
          patterns,
          total: patterns.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to search reasoning patterns',
        });
      }
    }),

  /**
   * Update reasoning pattern usage statistics
   */
  updateReasoningUsage: publicProcedure
    .input(updateReasoningUsageSchema)
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        await memorySystem.updateReasoningUsage(input.patternId, input.success);

        return {
          success: true,
          message: 'Reasoning pattern usage updated',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update reasoning usage',
        });
      }
    }),

  /**
   * Get top performing reasoning patterns
   */
  getTopReasoning: publicProcedure
    .input(z.object({
      limit: z.number().positive().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const patterns = await memorySystem.getTopReasoningPatterns(input?.limit || 10);

        return {
          success: true,
          patterns,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retrieve top reasoning patterns',
        });
      }
    }),

  // ========================================
  // MEMORY CONSOLIDATION & MAINTENANCE
  // ========================================

  /**
   * Consolidate similar memory entries (merge duplicates)
   */
  consolidate: publicProcedure
    .input(z.object({
      sessionId: z.string().optional(),
      agentId: z.string().optional(),
      threshold: z.number().min(0).max(1).optional(),
    }).optional())
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();

        // Get all entries for the session/agent
        const entries = await memorySystem.searchMemory({
          sessionId: input?.sessionId,
          agentId: input?.agentId,
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
        for (const [key, group] of Array.from(keyGroups)) {
          if (group.length > 1) {
            // Sort by date, keep newest
            group.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
            const newest = group[0];

            // Merge metadata and values if needed
            const mergedMetadata = {
              ...newest.metadata,
              consolidatedFrom: group.slice(1).map((e: any) => e.id),
              consolidatedAt: new Date().toISOString(),
            };

            // Update the newest entry with merged metadata
            const { getAgentMemory } = await import('../../services/memory');
            const agentMemory = getAgentMemory();
            await agentMemory.updateContext(
              newest.sessionId,
              key,
              newest.value,
              mergedMetadata
            );

            consolidatedCount += group.length - 1;
          }
        }

        return {
          success: true,
          consolidatedCount,
          message: `Consolidated ${consolidatedCount} duplicate entries`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to consolidate memory entries',
        });
      }
    }),

  /**
   * Clean up expired and low-performing memory
   */
  cleanup: publicProcedure
    .input(cleanupOptionsSchema)
    .mutation(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const result = await memorySystem.cleanup(input);

        return {
          success: true,
          expiredCleaned: result.expiredCleaned,
          lowPerformanceCleaned: result.lowPerformanceCleaned,
          message: `Cleaned ${result.expiredCleaned} expired entries and ${result.lowPerformanceCleaned} low-performance patterns`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cleanup memory',
        });
      }
    }),

  /**
   * Clear all caches
   */
  clearCaches: publicProcedure
    .mutation(() => {
      try {
        const memorySystem = getMemorySystem();
        memorySystem.clearCaches();

        return {
          success: true,
          message: 'All caches cleared successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to clear caches',
        });
      }
    }),

  // ========================================
  // STATISTICS & ANALYTICS
  // ========================================

  /**
   * Get memory system statistics
   */
  getStats: publicProcedure
    .input(z.object({
      sessionId: z.string().optional(),
      domain: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const stats = await memorySystem.getStats(input?.sessionId, input?.domain);

        return {
          success: true,
          stats,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
        });
      }
    }),

  /**
   * Get memory usage breakdown by type
   */
  getUsageBreakdown: publicProcedure
    .input(z.object({
      sessionId: z.string().optional(),
      agentId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const memorySystem = getMemorySystem();
        const entries = await memorySystem.searchMemory({
          sessionId: input?.sessionId,
          agentId: input?.agentId,
        });

        // Group by type
        const breakdown = entries.reduce((acc, entry) => {
          const type = entry.metadata?.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          success: true,
          breakdown,
          total: entries.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get usage breakdown',
        });
      }
    }),

  /**
   * Health check for memory system
   */
  health: publicProcedure
    .query(async () => {
      try {
        const memorySystem = getMemorySystem();
        const stats = await memorySystem.getStats();

        return {
          success: true,
          healthy: true,
          stats: {
            totalEntries: stats.totalEntries,
            totalReasoningPatterns: stats.totalReasoningPatterns,
            avgConfidence: stats.avgConfidence,
            hitRate: stats.hitRate,
          },
        };
      } catch (error) {
        return {
          success: false,
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // ========================================
  // MEMORY CLEANUP SCHEDULER CONTROL
  // ========================================

  /**
   * Manually trigger memory cleanup
   */
  triggerCleanup: publicProcedure
    .input(z.object({
      cleanupExpired: z.boolean().optional(),
      cleanupLowPerformance: z.boolean().optional(),
      minSuccessRate: z.number().min(0).max(1).optional(),
      minUsageCount: z.number().min(0).optional(),
    }).optional())
    .mutation(async ({ input }) => {
      try {
        const result = await memoryCleanupScheduler.runCleanup(input);

        return {
          success: true,
          expiredCleaned: result.expiredCleaned,
          lowPerformanceCleaned: result.lowPerformanceCleaned,
          message: `Cleaned ${result.expiredCleaned} expired entries and ${result.lowPerformanceCleaned} low-performance patterns`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to run cleanup',
        });
      }
    }),

  /**
   * Manually trigger memory consolidation
   */
  triggerConsolidation: publicProcedure
    .input(z.object({
      sessionId: z.string().optional(),
      agentId: z.string().optional(),
      threshold: z.number().min(0).max(1).optional(),
    }).optional())
    .mutation(async ({ input }) => {
      try {
        const result = await memoryCleanupScheduler.runConsolidation(input);

        return {
          success: true,
          consolidatedCount: result.consolidatedCount,
          message: `Consolidated ${result.consolidatedCount} duplicate entries`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to run consolidation',
        });
      }
    }),

  /**
   * Get memory cleanup scheduler statistics
   */
  getCleanupStats: publicProcedure
    .query(() => {
      try {
        const stats = memoryCleanupScheduler.getStats();

        return {
          success: true,
          stats,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get cleanup stats',
        });
      }
    }),

  /**
   * Start memory cleanup scheduler
   */
  startCleanupScheduler: publicProcedure
    .input(z.object({
      cleanupIntervalHours: z.number().positive().optional(),
      consolidateIntervalHours: z.number().positive().optional(),
      runImmediately: z.boolean().optional(),
    }).optional())
    .mutation(({ input }) => {
      try {
        memoryCleanupScheduler.start({
          cleanupIntervalMs: (input?.cleanupIntervalHours || 6) * 60 * 60 * 1000,
          consolidateIntervalMs: (input?.consolidateIntervalHours || 24) * 60 * 60 * 1000,
          runImmediately: input?.runImmediately,
        });

        return {
          success: true,
          message: 'Memory cleanup scheduler started',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to start cleanup scheduler',
        });
      }
    }),

  /**
   * Stop memory cleanup scheduler
   */
  stopCleanupScheduler: publicProcedure
    .mutation(() => {
      try {
        memoryCleanupScheduler.stop();

        return {
          success: true,
          message: 'Memory cleanup scheduler stopped',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to stop cleanup scheduler',
        });
      }
    }),
});
