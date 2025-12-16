/**
 * Agent Memory Router - tRPC API for Browser Agent Memory Management
 *
 * Provides endpoints for:
 * - User memory (preferences, learned patterns, GHL selectors)
 * - Execution checkpoints (resume failed tasks)
 * - Task success patterns (pattern library)
 * - Workflow patterns (reusable workflows)
 * - Learning engine (training feedback)
 */

import { z } from 'zod';
import { publicProcedure, router } from '../../_core/trpc';
import { TRPCError } from '@trpc/server';
import {
  getCheckpointService,
  getLearningEngine,
  getPatternReuseService,
  getUserMemoryService,
} from '../../services/memory';

// ========================================
// ZOD SCHEMAS
// ========================================

const userIdSchema = z.object({
  userId: z.number(),
});

const checkpointIdSchema = z.object({
  checkpointId: z.string(),
});

const patternIdSchema = z.object({
  patternId: z.string(),
});

const updatePreferencesSchema = z.object({
  userId: z.number(),
  preferences: z.object({
    actionSpeed: z.enum(['careful', 'normal', 'fast']).optional(),
    approvalRequired: z.boolean().optional(),
    favoriteStrategies: z.array(z.string()).optional(),
    autoApprovePatterns: z.array(z.string()).optional(),
    defaultTimeout: z.number().optional(),
    maxRetries: z.number().optional(),
  }),
});

const recordGHLSelectorSchema = z.object({
  userId: z.number(),
  elementType: z.string(),
  selector: z.string(),
});

const recordWorkflowSchema = z.object({
  userId: z.number(),
  taskType: z.string(),
  taskName: z.string().optional(),
  successfulApproach: z.any(),
  selectors: z.record(z.string(), z.string()).optional(),
  workflow: z.array(z.any()).optional(),
  avgExecutionTime: z.number().optional(),
});

const trainingFeedbackSchema = z.object({
  userId: z.number(),
  executionId: z.number(),
  taskType: z.string(),
  success: z.boolean(),
  approach: z.string(),
  executionTime: z.number(),
  feedback: z.object({
    type: z.enum(['approval', 'correction', 'rejection']),
    originalAction: z.any().optional(),
    correctedAction: z.any().optional(),
  }).optional(),
});

const createCheckpointSchema = z.object({
  executionId: z.number(),
  userId: z.number(),
  checkpointReason: z.enum(['error', 'manual', 'auto', 'phase_complete']).optional(),
  phaseId: z.number().optional(),
  phaseName: z.string().optional(),
  stepIndex: z.number().optional(),
  completedSteps: z.array(z.string()).optional(),
  completedPhases: z.array(z.number()).optional(),
  partialResults: z.record(z.string(), z.any()).optional(),
  extractedData: z.record(z.string(), z.any()).optional(),
  sessionState: z.object({
    url: z.string().nullable().optional(),
    cookies: z.array(z.any()).optional(),
    localStorage: z.record(z.string(), z.string()).optional(),
    sessionStorage: z.record(z.string(), z.string()).optional(),
    authenticatedAs: z.string().nullable().optional(),
  }).optional(),
  browserContext: z.object({
    pageState: z.any().optional(),
    domSnapshot: z.any().optional(),
    screenshotUrl: z.string().nullable().optional(),
  }).optional(),
  ttlSeconds: z.number().optional(),
});

const patternQuerySchema = z.object({
  userId: z.number(),
  taskType: z.string().optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  limit: z.number().optional(),
});

// ========================================
// AGENT MEMORY ROUTER
// ========================================

export const agentMemoryRouter = router({
  // ========================================
  // USER MEMORY OPERATIONS
  // ========================================

  /**
   * Get user memory (preferences, patterns, stats)
   */
  getUserMemory: publicProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const memory = await service.getUserMemory(input.userId);
        return { success: true, memory };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get user memory',
        });
      }
    }),

  /**
   * Update user preferences
   */
  updatePreferences: publicProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        await service.updatePreferences(input.userId, input.preferences);
        return { success: true, message: 'Preferences updated' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update preferences',
        });
      }
    }),

  /**
   * Get cached GHL selectors
   */
  getGHLSelectors: publicProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const memory = await service.getUserMemory(input.userId);
        const patterns = (memory.learnedPatterns as any) ?? {};
        return {
          success: true,
          selectors: patterns.ghlSelectors ?? {},
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get selectors',
        });
      }
    }),

  /**
   * Cache a GHL selector
   */
  cacheGHLSelector: publicProcedure
    .input(recordGHLSelectorSchema)
    .mutation(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        await service.learnSelector(input.userId, input.elementType, input.selector);
        return { success: true, message: 'Selector cached' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cache selector',
        });
      }
    }),

  /**
   * Get a specific selector
   */
  getSelector: publicProcedure
    .input(z.object({
      userId: z.number(),
      elementType: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const selector = await service.getSelector(input.userId, input.elementType);
        return { success: true, selector };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get selector',
        });
      }
    }),

  /**
   * Get user execution stats
   */
  getUserStats: publicProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const stats = await service.getUserStats(input.userId);
        return { success: true, stats };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get stats',
        });
      }
    }),

  /**
   * Store a task pattern
   */
  storeTaskPattern: publicProcedure
    .input(recordWorkflowSchema)
    .mutation(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const patternId = await service.storeTaskPattern(input.userId, {
          taskType: input.taskType,
          taskName: input.taskName,
          successfulApproach: input.successfulApproach,
          selectors: input.selectors,
          workflow: input.workflow,
          avgExecutionTime: input.avgExecutionTime,
        });
        return { success: true, patternId };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to store pattern',
        });
      }
    }),

  /**
   * Find similar task patterns
   */
  findSimilarPatterns: publicProcedure
    .input(patternQuerySchema)
    .query(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const patterns = await service.findSimilarTaskPatterns(
          input.userId,
          input.taskType ?? '',
          { minConfidence: input.minConfidence, limit: input.limit }
        );
        return { success: true, patterns };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to find patterns',
        });
      }
    }),

  /**
   * Update task pattern usage
   */
  updatePatternUsage: publicProcedure
    .input(z.object({
      patternId: z.string(),
      success: z.boolean(),
      executionTime: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        await service.updateTaskPatternUsage(input.patternId, input.success, input.executionTime);
        return { success: true, message: 'Pattern usage updated' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update pattern usage',
        });
      }
    }),

  /**
   * Record user feedback
   */
  recordUserFeedback: publicProcedure
    .input(z.object({
      userId: z.number(),
      executionId: z.number().optional(),
      feedbackType: z.enum(['correction', 'approval', 'rejection', 'suggestion']),
      originalAction: z.any(),
      correctedAction: z.any().optional(),
      context: z.any().optional(),
      sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
      impact: z.enum(['critical', 'important', 'minor']).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const feedbackId = await service.recordUserFeedback({
          userId: input.userId,
          executionId: input.executionId,
          feedbackType: input.feedbackType,
          originalAction: input.originalAction,
          correctedAction: input.correctedAction,
          context: input.context,
          sentiment: input.sentiment,
          impact: input.impact,
        });
        return { success: true, feedbackId };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to record feedback',
        });
      }
    }),

  /**
   * Check if task should auto-approve
   */
  shouldAutoApprove: publicProcedure
    .input(z.object({
      userId: z.number(),
      taskType: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getUserMemoryService();
        const shouldApprove = await service.shouldAutoApprove(input.userId, input.taskType);
        return { success: true, shouldAutoApprove: shouldApprove };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check auto-approve',
        });
      }
    }),

  // ========================================
  // CHECKPOINT OPERATIONS
  // ========================================

  /**
   * List checkpoints for a user
   */
  listCheckpoints: publicProcedure
    .input(z.object({
      userId: z.number(),
      includeExpired: z.boolean().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getCheckpointService();
        const checkpoints = await service.getCheckpointsForUser(input.userId, {
          includeExpired: input.includeExpired,
          limit: input.limit,
        });
        return { success: true, checkpoints };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list checkpoints',
        });
      }
    }),

  /**
   * Get a specific checkpoint
   */
  getCheckpoint: publicProcedure
    .input(checkpointIdSchema)
    .query(async ({ input }) => {
      try {
        const service = getCheckpointService();
        const checkpoint = await service.loadCheckpoint(input.checkpointId);
        return { success: true, checkpoint };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get checkpoint',
        });
      }
    }),

  /**
   * Get latest checkpoint for an execution
   */
  getLatestCheckpoint: publicProcedure
    .input(z.object({ executionId: z.number() }))
    .query(async ({ input }) => {
      try {
        const service = getCheckpointService();
        const checkpoint = await service.getLatestCheckpoint(input.executionId);
        return { success: true, checkpoint };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get latest checkpoint',
        });
      }
    }),

  /**
   * Get checkpoints for an execution
   */
  getCheckpointsForExecution: publicProcedure
    .input(z.object({ executionId: z.number() }))
    .query(async ({ input }) => {
      try {
        const service = getCheckpointService();
        const checkpoints = await service.getCheckpointsForExecution(input.executionId);
        return { success: true, checkpoints };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get execution checkpoints',
        });
      }
    }),

  /**
   * Create a checkpoint
   */
  createCheckpoint: publicProcedure
    .input(createCheckpointSchema)
    .mutation(async ({ input }) => {
      try {
        const service = getCheckpointService();
        const checkpointId = await service.createCheckpoint({
          executionId: input.executionId,
          userId: input.userId,
          checkpointReason: input.checkpointReason ?? 'manual',
          phaseId: input.phaseId,
          phaseName: input.phaseName,
          stepIndex: input.stepIndex,
          completedSteps: input.completedSteps,
          completedPhases: input.completedPhases,
          partialResults: input.partialResults,
          extractedData: input.extractedData,
          sessionState: input.sessionState,
          browserContext: input.browserContext,
          ttlSeconds: input.ttlSeconds,
        });
        return { success: true, checkpointId };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create checkpoint',
        });
      }
    }),

  /**
   * Resume from a checkpoint
   */
  resumeCheckpoint: publicProcedure
    .input(checkpointIdSchema)
    .mutation(async ({ input }) => {
      try {
        const service = getCheckpointService();
        const result = await service.resumeFromCheckpoint(input.checkpointId);
        return { success: true, result };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to resume checkpoint',
        });
      }
    }),

  /**
   * Update a checkpoint
   */
  updateCheckpoint: publicProcedure
    .input(z.object({
      checkpointId: z.string(),
      stepIndex: z.number().optional(),
      completedSteps: z.array(z.string()).optional(),
      partialResults: z.record(z.string(), z.any()).optional(),
      extractedData: z.record(z.string(), z.any()).optional(),
      sessionState: z.any().optional(),
      browserContext: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const service = getCheckpointService();
        await service.updateCheckpoint(input.checkpointId, {
          stepIndex: input.stepIndex,
          completedSteps: input.completedSteps,
          partialResults: input.partialResults,
          extractedData: input.extractedData,
          sessionState: input.sessionState,
          browserContext: input.browserContext,
        });
        return { success: true, message: 'Checkpoint updated' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update checkpoint',
        });
      }
    }),

  /**
   * Invalidate a checkpoint
   */
  invalidateCheckpoint: publicProcedure
    .input(checkpointIdSchema)
    .mutation(async ({ input }) => {
      try {
        const service = getCheckpointService();
        await service.invalidateCheckpoint(input.checkpointId);
        return { success: true, message: 'Checkpoint invalidated' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to invalidate checkpoint',
        });
      }
    }),

  /**
   * Invalidate all checkpoints for an execution
   */
  invalidateExecutionCheckpoints: publicProcedure
    .input(z.object({ executionId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const service = getCheckpointService();
        await service.invalidateExecutionCheckpoints(input.executionId);
        return { success: true, message: 'Execution checkpoints invalidated' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to invalidate execution checkpoints',
        });
      }
    }),

  /**
   * Clean up expired checkpoints
   */
  cleanupExpiredCheckpoints: publicProcedure
    .mutation(async () => {
      try {
        const service = getCheckpointService();
        const count = await service.cleanupExpiredCheckpoints();
        return { success: true, deletedCount: count };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cleanup checkpoints',
        });
      }
    }),

  /**
   * Get checkpoint stats for a user
   */
  getCheckpointStats: publicProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        const service = getCheckpointService();
        const stats = await service.getCheckpointStats(input.userId);
        return { success: true, stats };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get checkpoint stats',
        });
      }
    }),

  // ========================================
  // PATTERN REUSE OPERATIONS
  // ========================================

  /**
   * Find best matching pattern for a task
   */
  findBestPattern: publicProcedure
    .input(z.object({
      userId: z.number(),
      taskType: z.string(),
      taskName: z.string().optional(),
      parameters: z.record(z.string(), z.any()).optional(),
      context: z.record(z.string(), z.any()).optional(),
      executionId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getPatternReuseService();
        const match = await service.findBestPattern({
          userId: input.userId,
          taskType: input.taskType,
          taskName: input.taskName,
          parameters: input.parameters,
          context: input.context,
          executionId: input.executionId,
        });
        return { success: true, match };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to find best pattern',
        });
      }
    }),

  /**
   * Get pattern reuse stats
   */
  getPatternReuseStats: publicProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        const service = getPatternReuseService();
        const stats = await service.getPatternReuseStats(input.userId);
        return { success: true, stats };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get pattern stats',
        });
      }
    }),

  /**
   * Suggest patterns for a new task
   */
  suggestPatternsForNewTask: publicProcedure
    .input(z.object({
      userId: z.number(),
      taskType: z.string(),
      context: z.record(z.string(), z.any()).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getPatternReuseService();
        const suggestions = await service.suggestPatternsForNewTask(
          input.userId,
          input.taskType,
          input.context
        );
        return { success: true, suggestions };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to suggest patterns',
        });
      }
    }),

  /**
   * Record pattern usage
   */
  recordPatternUsage: publicProcedure
    .input(z.object({
      patternId: z.string(),
      success: z.boolean(),
      executionTime: z.number().optional(),
      adaptations: z.array(z.object({
        field: z.string(),
        value: z.any(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const service = getPatternReuseService();
        await service.recordPatternUsage(
          input.patternId,
          input.success,
          input.executionTime,
          input.adaptations
        );
        return { success: true, message: 'Pattern usage recorded' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to record pattern usage',
        });
      }
    }),

  // ========================================
  // LEARNING ENGINE OPERATIONS
  // ========================================

  /**
   * Get recommended strategy for a task
   */
  getRecommendedStrategy: publicProcedure
    .input(z.object({
      userId: z.number(),
      taskType: z.string(),
      executionId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getLearningEngine();
        const strategy = await service.getRecommendedStrategy({
          userId: input.userId,
          taskType: input.taskType,
          executionId: input.executionId,
          sessionId: input.sessionId,
        });
        return { success: true, strategy };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get strategy',
        });
      }
    }),

  /**
   * Process training feedback
   */
  processFeedback: publicProcedure
    .input(trainingFeedbackSchema)
    .mutation(async ({ input }) => {
      try {
        const service = getLearningEngine();
        await service.processFeedback({
          userId: input.userId,
          executionId: input.executionId,
          taskType: input.taskType,
          success: input.success,
          approach: input.approach,
          executionTime: input.executionTime,
          feedback: input.feedback,
        });
        return { success: true, message: 'Feedback processed' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process feedback',
        });
      }
    }),

  /**
   * Process unprocessed feedback in batch
   */
  processUnprocessedFeedback: publicProcedure
    .input(z.object({ userId: z.number().optional() }))
    .mutation(async ({ input }) => {
      try {
        const service = getLearningEngine();
        const processedCount = await service.processUnprocessedFeedback(input.userId);
        return { success: true, processedCount };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process unprocessed feedback',
        });
      }
    }),

  /**
   * Get cached selector via learning engine
   */
  getCachedSelector: publicProcedure
    .input(z.object({
      userId: z.number(),
      elementType: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getLearningEngine();
        const selector = await service.getCachedSelector(input.userId, input.elementType);
        return { success: true, selector };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get cached selector',
        });
      }
    }),

  /**
   * Cache selector via learning engine
   */
  cacheSelector: publicProcedure
    .input(z.object({
      userId: z.number(),
      elementType: z.string(),
      selector: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const service = getLearningEngine();
        await service.cacheSelector(input.userId, input.elementType, input.selector);
        return { success: true, message: 'Selector cached' };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cache selector',
        });
      }
    }),

  /**
   * Check if approval is required
   */
  shouldRequestApproval: publicProcedure
    .input(z.object({
      userId: z.number(),
      taskType: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getLearningEngine();
        const shouldRequest = await service.shouldRequestApproval(input.userId, input.taskType);
        return { success: true, shouldRequestApproval: shouldRequest };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check approval requirement',
        });
      }
    }),

  /**
   * Analyze failure and suggest recovery
   */
  analyzeFailure: publicProcedure
    .input(z.object({
      userId: z.number(),
      taskType: z.string(),
      error: z.string(),
      errorContext: z.any(),
    }))
    .query(async ({ input }) => {
      try {
        const service = getLearningEngine();
        const analysis = await service.analyzeFailure({
          userId: input.userId,
          taskType: input.taskType,
          error: input.error,
          errorContext: input.errorContext,
        });
        return { success: true, analysis };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to analyze failure',
        });
      }
    }),

  /**
   * Get user insights from learning engine
   */
  getUserInsights: publicProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        const service = getLearningEngine();
        const insights = await service.getUserInsights(input.userId);
        return { success: true, insights };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get user insights',
        });
      }
    }),

  // ========================================
  // ANALYTICS & DASHBOARD
  // ========================================

  /**
   * Get comprehensive memory analytics
   */
  getAnalytics: publicProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        const userMemory = getUserMemoryService();
        const checkpoint = getCheckpointService();
        const pattern = getPatternReuseService();
        const learning = getLearningEngine();

        const [memory, checkpoints, patternStats, insights] = await Promise.all([
          userMemory.getUserMemory(input.userId),
          checkpoint.getCheckpointsForUser(input.userId, { limit: 100 }),
          pattern.getPatternReuseStats(input.userId),
          learning.getUserInsights(input.userId),
        ]);

        const memoryStats = (memory.stats as any) ?? {};
        const learnedPatterns = (memory.learnedPatterns as any) ?? {};

        return {
          success: true,
          analytics: {
            userMemory: {
              totalExecutions: memoryStats.totalExecutions ?? 0,
              successRate: memoryStats.totalExecutions > 0
                ? ((memoryStats.successfulExecutions ?? 0) / memoryStats.totalExecutions) * 100
                : 0,
              avgExecutionTime: memoryStats.avgExecutionTime ?? 0,
              cachedSelectors: Object.keys(learnedPatterns.ghlSelectors ?? {}).length,
              savedWorkflows: (learnedPatterns.commonWorkflows ?? []).length,
            },
            checkpoints: {
              active: checkpoints.filter((c) => c.canResume).length,
              total: checkpoints.length,
            },
            patterns: patternStats,
            learning: insights,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get analytics',
        });
      }
    }),
});
