/**
 * Execution Control Service
 *
 * Manages execution lifecycle with:
 * - Pause/Resume capabilities
 * - Cancellation with cleanup
 * - Rate limiting
 * - Resource quotas
 * - Emergency stops
 */

import { EventEmitter } from 'events';

// ========================================
// TYPES
// ========================================

export interface ExecutionState {
  executionId: string;
  userId: number;
  status: ExecutionStatus;
  startTime: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  completedAt?: Date;
  totalPausedTime: number;
  currentAction?: string;
  checkpoint?: ExecutionCheckpoint;
  resources: ResourceUsage;
  controlHistory: ControlEvent[];
}

export type ExecutionStatus =
  | 'running'
  | 'paused'
  | 'resuming'
  | 'cancelling'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'emergency_stopped';

export interface ExecutionCheckpoint {
  step: number;
  action: string;
  state: Record<string, any>;
  timestamp: Date;
}

export interface ResourceUsage {
  apiCalls: number;
  browserActions: number;
  tokensUsed: number;
  executionTimeMs: number;
  memoryMb: number;
}

export interface ResourceQuota {
  maxApiCalls: number;
  maxBrowserActions: number;
  maxTokens: number;
  maxExecutionTimeMs: number;
  maxMemoryMb: number;
}

export interface ControlEvent {
  action: 'start' | 'pause' | 'resume' | 'cancel' | 'emergency_stop' | 'quota_exceeded';
  timestamp: Date;
  userId: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RateLimitConfig {
  maxExecutionsPerMinute: number;
  maxExecutionsPerHour: number;
  maxConcurrentExecutions: number;
  cooldownAfterError: number; // ms
}

// ========================================
// CONSTANTS
// ========================================

const DEFAULT_QUOTA: ResourceQuota = {
  maxApiCalls: 1000,
  maxBrowserActions: 500,
  maxTokens: 100000,
  maxExecutionTimeMs: 30 * 60 * 1000, // 30 minutes
  maxMemoryMb: 512,
};

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxExecutionsPerMinute: 10,
  maxExecutionsPerHour: 100,
  maxConcurrentExecutions: 3,
  cooldownAfterError: 5000,
};

// ========================================
// EXECUTION CONTROL SERVICE
// ========================================

class ExecutionControlService extends EventEmitter {
  private executions: Map<string, ExecutionState> = new Map();
  private userQuotas: Map<number, ResourceQuota> = new Map();
  private rateLimits: Map<number, { minute: number[]; hour: number[] }> = new Map();
  private pauseCallbacks: Map<string, () => Promise<void>> = new Map();
  private resumeCallbacks: Map<string, () => Promise<void>> = new Map();

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  // ========================================
  // EXECUTION LIFECYCLE
  // ========================================

  /**
   * Register a new execution
   */
  registerExecution(
    executionId: string,
    userId: number,
    options?: {
      onPause?: () => Promise<void>;
      onResume?: () => Promise<void>;
    }
  ): { success: boolean; error?: string } {
    // Check rate limits
    const rateLimitCheck = this.checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      return { success: false, error: rateLimitCheck.reason };
    }

    // Check concurrent executions
    const concurrent = this.getConcurrentExecutions(userId);
    if (concurrent >= DEFAULT_RATE_LIMIT.maxConcurrentExecutions) {
      return {
        success: false,
        error: `Maximum concurrent executions (${DEFAULT_RATE_LIMIT.maxConcurrentExecutions}) reached`,
      };
    }

    const state: ExecutionState = {
      executionId,
      userId,
      status: 'running',
      startTime: new Date(),
      totalPausedTime: 0,
      resources: {
        apiCalls: 0,
        browserActions: 0,
        tokensUsed: 0,
        executionTimeMs: 0,
        memoryMb: 0,
      },
      controlHistory: [
        {
          action: 'start',
          timestamp: new Date(),
          userId,
        },
      ],
    };

    this.executions.set(executionId, state);

    // Register callbacks
    if (options?.onPause) {
      this.pauseCallbacks.set(executionId, options.onPause);
    }
    if (options?.onResume) {
      this.resumeCallbacks.set(executionId, options.onResume);
    }

    // Track rate limit
    this.trackExecution(userId);

    this.emit('execution:started', { executionId, userId });

    return { success: true };
  }

  /**
   * Pause an execution
   */
  async pauseExecution(
    executionId: string,
    userId: number,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const state = this.executions.get(executionId);

    if (!state) {
      return { success: false, error: 'Execution not found' };
    }

    if (state.userId !== userId) {
      return { success: false, error: 'Not authorized to control this execution' };
    }

    if (state.status !== 'running') {
      return { success: false, error: `Cannot pause execution in '${state.status}' state` };
    }

    // Call pause callback if registered
    const pauseCallback = this.pauseCallbacks.get(executionId);
    if (pauseCallback) {
      try {
        await pauseCallback();
      } catch (error) {
        console.error('[ExecutionControl] Pause callback failed:', error);
      }
    }

    state.status = 'paused';
    state.pausedAt = new Date();
    state.controlHistory.push({
      action: 'pause',
      timestamp: new Date(),
      userId,
      reason,
    });

    this.emit('execution:paused', { executionId, userId, reason });

    return { success: true };
  }

  /**
   * Resume a paused execution
   */
  async resumeExecution(
    executionId: string,
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    const state = this.executions.get(executionId);

    if (!state) {
      return { success: false, error: 'Execution not found' };
    }

    if (state.userId !== userId) {
      return { success: false, error: 'Not authorized to control this execution' };
    }

    if (state.status !== 'paused') {
      return { success: false, error: `Cannot resume execution in '${state.status}' state` };
    }

    // Calculate paused time
    if (state.pausedAt) {
      state.totalPausedTime += Date.now() - state.pausedAt.getTime();
    }

    state.status = 'resuming';
    state.resumedAt = new Date();

    // Call resume callback if registered
    const resumeCallback = this.resumeCallbacks.get(executionId);
    if (resumeCallback) {
      try {
        await resumeCallback();
      } catch (error) {
        console.error('[ExecutionControl] Resume callback failed:', error);
        state.status = 'paused';
        return { success: false, error: 'Failed to resume execution' };
      }
    }

    state.status = 'running';
    state.controlHistory.push({
      action: 'resume',
      timestamp: new Date(),
      userId,
    });

    this.emit('execution:resumed', { executionId, userId });

    return { success: true };
  }

  /**
   * Cancel an execution
   */
  async cancelExecution(
    executionId: string,
    userId: number,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const state = this.executions.get(executionId);

    if (!state) {
      return { success: false, error: 'Execution not found' };
    }

    if (state.userId !== userId) {
      return { success: false, error: 'Not authorized to control this execution' };
    }

    if (['cancelled', 'completed', 'failed', 'emergency_stopped'].includes(state.status)) {
      return { success: false, error: `Execution already in terminal state: ${state.status}` };
    }

    state.status = 'cancelling';

    // Perform cleanup
    await this.cleanupExecution(executionId);

    state.status = 'cancelled';
    state.completedAt = new Date();
    state.controlHistory.push({
      action: 'cancel',
      timestamp: new Date(),
      userId,
      reason,
    });

    this.emit('execution:cancelled', { executionId, userId, reason });

    return { success: true };
  }

  /**
   * Emergency stop - immediate halt with no cleanup
   */
  async emergencyStop(
    executionId: string,
    userId: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const state = this.executions.get(executionId);

    if (!state) {
      return { success: false, error: 'Execution not found' };
    }

    // Emergency stop can be triggered by anyone with the execution ID
    // (useful for admin intervention)

    state.status = 'emergency_stopped';
    state.completedAt = new Date();
    state.controlHistory.push({
      action: 'emergency_stop',
      timestamp: new Date(),
      userId,
      reason,
    });

    this.emit('execution:emergency_stopped', { executionId, userId, reason });

    // Force cleanup resources
    this.pauseCallbacks.delete(executionId);
    this.resumeCallbacks.delete(executionId);

    return { success: true };
  }

  /**
   * Mark execution as completed
   */
  completeExecution(
    executionId: string,
    success: boolean
  ): void {
    const state = this.executions.get(executionId);

    if (!state) return;

    state.status = success ? 'completed' : 'failed';
    state.completedAt = new Date();
    state.resources.executionTimeMs =
      Date.now() - state.startTime.getTime() - state.totalPausedTime;

    this.emit('execution:completed', {
      executionId,
      userId: state.userId,
      success,
      duration: state.resources.executionTimeMs,
    });

    // Cleanup callbacks
    this.pauseCallbacks.delete(executionId);
    this.resumeCallbacks.delete(executionId);
  }

  // ========================================
  // RESOURCE TRACKING
  // ========================================

  /**
   * Track resource usage
   */
  trackResourceUsage(
    executionId: string,
    usage: Partial<ResourceUsage>
  ): { quotaExceeded: boolean; resource?: string } {
    const state = this.executions.get(executionId);

    if (!state) {
      return { quotaExceeded: false };
    }

    // Update usage
    if (usage.apiCalls) state.resources.apiCalls += usage.apiCalls;
    if (usage.browserActions) state.resources.browserActions += usage.browserActions;
    if (usage.tokensUsed) state.resources.tokensUsed += usage.tokensUsed;
    if (usage.memoryMb) state.resources.memoryMb = Math.max(state.resources.memoryMb, usage.memoryMb);

    // Update execution time
    state.resources.executionTimeMs = Date.now() - state.startTime.getTime() - state.totalPausedTime;

    // Check quota
    const quota = this.getUserQuota(state.userId);

    if (state.resources.apiCalls > quota.maxApiCalls) {
      return { quotaExceeded: true, resource: 'apiCalls' };
    }
    if (state.resources.browserActions > quota.maxBrowserActions) {
      return { quotaExceeded: true, resource: 'browserActions' };
    }
    if (state.resources.tokensUsed > quota.maxTokens) {
      return { quotaExceeded: true, resource: 'tokens' };
    }
    if (state.resources.executionTimeMs > quota.maxExecutionTimeMs) {
      return { quotaExceeded: true, resource: 'executionTime' };
    }
    if (state.resources.memoryMb > quota.maxMemoryMb) {
      return { quotaExceeded: true, resource: 'memory' };
    }

    return { quotaExceeded: false };
  }

  /**
   * Set checkpoint for an execution
   */
  setCheckpoint(
    executionId: string,
    checkpoint: ExecutionCheckpoint
  ): void {
    const state = this.executions.get(executionId);
    if (state) {
      state.checkpoint = checkpoint;
      state.currentAction = checkpoint.action;
    }
  }

  /**
   * Get checkpoint for resuming
   */
  getCheckpoint(executionId: string): ExecutionCheckpoint | undefined {
    return this.executions.get(executionId)?.checkpoint;
  }

  // ========================================
  // QUOTA MANAGEMENT
  // ========================================

  /**
   * Set custom quota for a user
   */
  setUserQuota(userId: number, quota: Partial<ResourceQuota>): void {
    const current = this.getUserQuota(userId);
    this.userQuotas.set(userId, { ...current, ...quota });
  }

  /**
   * Get quota for a user
   */
  getUserQuota(userId: number): ResourceQuota {
    return this.userQuotas.get(userId) || DEFAULT_QUOTA;
  }

  /**
   * Get remaining quota for a user
   */
  getRemainingQuota(
    executionId: string
  ): { remaining: Partial<ResourceQuota>; used: ResourceUsage } | null {
    const state = this.executions.get(executionId);
    if (!state) return null;

    const quota = this.getUserQuota(state.userId);

    return {
      remaining: {
        maxApiCalls: quota.maxApiCalls - state.resources.apiCalls,
        maxBrowserActions: quota.maxBrowserActions - state.resources.browserActions,
        maxTokens: quota.maxTokens - state.resources.tokensUsed,
        maxExecutionTimeMs: quota.maxExecutionTimeMs - state.resources.executionTimeMs,
        maxMemoryMb: quota.maxMemoryMb - state.resources.memoryMb,
      },
      used: state.resources,
    };
  }

  // ========================================
  // RATE LIMITING
  // ========================================

  private checkRateLimit(userId: number): { allowed: boolean; reason?: string } {
    const limits = this.rateLimits.get(userId) || { minute: [], hour: [] };
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    // Clean old entries
    limits.minute = limits.minute.filter((t) => t > oneMinuteAgo);
    limits.hour = limits.hour.filter((t) => t > oneHourAgo);

    // Check limits
    if (limits.minute.length >= DEFAULT_RATE_LIMIT.maxExecutionsPerMinute) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: max ${DEFAULT_RATE_LIMIT.maxExecutionsPerMinute} executions per minute`,
      };
    }

    if (limits.hour.length >= DEFAULT_RATE_LIMIT.maxExecutionsPerHour) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: max ${DEFAULT_RATE_LIMIT.maxExecutionsPerHour} executions per hour`,
      };
    }

    return { allowed: true };
  }

  private trackExecution(userId: number): void {
    const limits = this.rateLimits.get(userId) || { minute: [], hour: [] };
    const now = Date.now();

    limits.minute.push(now);
    limits.hour.push(now);

    this.rateLimits.set(userId, limits);
  }

  private getConcurrentExecutions(userId: number): number {
    let count = 0;
    for (const state of Array.from(this.executions.values())) {
      if (state.userId === userId && ['running', 'paused', 'resuming'].includes(state.status)) {
        count++;
      }
    }
    return count;
  }

  // ========================================
  // STATUS & QUERIES
  // ========================================

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): ExecutionState | null {
    return this.executions.get(executionId) || null;
  }

  /**
   * Check if execution is paused
   */
  isPaused(executionId: string): boolean {
    return this.executions.get(executionId)?.status === 'paused';
  }

  /**
   * Check if execution should continue
   */
  shouldContinue(executionId: string): boolean {
    const state = this.executions.get(executionId);
    if (!state) return false;

    return state.status === 'running';
  }

  /**
   * Wait for resume if paused
   */
  async waitForResume(executionId: string, checkInterval: number = 1000): Promise<boolean> {
    const state = this.executions.get(executionId);
    if (!state) return false;

    while (state.status === 'paused') {
      await new Promise((resolve) => setTimeout(resolve, checkInterval));

      // Check if cancelled during pause
      if (['cancelled', 'emergency_stopped'].includes(state.status)) {
        return false;
      }
    }

    return state.status === 'running';
  }

  /**
   * Get all executions for a user
   */
  getUserExecutions(userId: number): ExecutionState[] {
    return Array.from(this.executions.values()).filter((e) => e.userId === userId);
  }

  /**
   * Get active executions count
   */
  getActiveExecutionsCount(): number {
    return Array.from(this.executions.values()).filter((e) =>
      ['running', 'paused', 'resuming'].includes(e.status)
    ).length;
  }

  // ========================================
  // CLEANUP
  // ========================================

  private async cleanupExecution(executionId: string): Promise<void> {
    // Cleanup callbacks
    this.pauseCallbacks.delete(executionId);
    this.resumeCallbacks.delete(executionId);

    // Emit cleanup event for other services to react
    this.emit('execution:cleanup', { executionId });
  }

  /**
   * Clean up old completed executions
   */
  cleanupOldExecutions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    let cleaned = 0;

    for (const [id, state] of Array.from(this.executions.entries())) {
      if (
        ['completed', 'cancelled', 'failed', 'emergency_stopped'].includes(state.status) &&
        state.completedAt &&
        state.completedAt.getTime() < cutoff
      ) {
        this.executions.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get control history for an execution
   */
  getControlHistory(executionId: string): ControlEvent[] {
    return this.executions.get(executionId)?.controlHistory || [];
  }
}

// Export singleton instance
export const executionControlService = new ExecutionControlService();

// Export factory function for testing
export function createExecutionControlService(): ExecutionControlService {
  return new ExecutionControlService();
}
