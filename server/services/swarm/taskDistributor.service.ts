/**
 * Task Distributor Service
 * Handles intelligent task assignment and load balancing across agents
 * Enhanced with GHL-specific automation routing and browser session management
 */

import { EventEmitter } from 'events';
import type {
  TaskDefinition,
  AgentState,
  AgentType,
  TaskId,
  TaskResult,
  TaskStatus,
} from './types';
import { getAgentTypeDefinition } from './agentTypes';

// GHL-specific operation types
export type GHLOperationType =
  | 'contact_create'
  | 'contact_update'
  | 'contact_delete'
  | 'opportunity_create'
  | 'opportunity_update'
  | 'workflow_trigger'
  | 'campaign_add'
  | 'campaign_remove'
  | 'calendar_booking'
  | 'task_create'
  | 'note_create'
  | 'conversation_send'
  | 'conversation_read'
  | 'pipeline_update'
  | 'custom_field_update'
  | 'tag_add'
  | 'tag_remove'
  | 'bulk_operation'
  | 'report_generate'
  | 'data_export'
  | 'integration_sync';

// GHL operation urgency mapping
export interface GHLOperationUrgency {
  type: GHLOperationType;
  urgencyLevel: 1 | 2 | 3 | 4 | 5; // 1=critical, 5=background
  estimatedDuration: number; // milliseconds
  requiresSession: boolean;
  canBatch: boolean;
}

// Browser session info
export interface BrowserSessionInfo {
  sessionId: string;
  agentId: string;
  activeTaskCount: number;
  clientAffinity?: string; // clientId for session affinity
  createdAt: Date;
  lastUsed: Date;
  health: number; // 0-1
  maxConcurrentTasks: number;
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignedAt: Date;
  priority: number;
  estimatedDuration: number;
  ghlOperationType?: GHLOperationType;
  sessionId?: string;
  retryCount: number;
  nextRetryAt?: Date;
  clientId?: string;
  batchId?: string;
}

export interface DistributionStrategy {
  name: string;
  selectAgent: (task: TaskDefinition, availableAgents: AgentState[]) => AgentState | null;
}

export interface TaskBatch {
  batchId: string;
  clientId: string;
  tasks: TaskDefinition[];
  operationType: GHLOperationType;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ResultConsolidation {
  batchId?: string;
  taskIds: string[];
  results: TaskResult[];
  consolidatedOutput: Record<string, any>;
  successCount: number;
  failureCount: number;
  totalExecutionTime: number;
  startedAt: Date;
  completedAt: Date;
}

/**
 * GHL Operation Urgency Configuration
 */
const GHL_OPERATION_URGENCY: Record<GHLOperationType, GHLOperationUrgency> = {
  // Critical operations (urgency 1) - execute immediately
  conversation_send: { type: 'conversation_send', urgencyLevel: 1, estimatedDuration: 5000, requiresSession: true, canBatch: false },
  workflow_trigger: { type: 'workflow_trigger', urgencyLevel: 1, estimatedDuration: 3000, requiresSession: true, canBatch: false },
  calendar_booking: { type: 'calendar_booking', urgencyLevel: 1, estimatedDuration: 8000, requiresSession: true, canBatch: false },

  // High priority operations (urgency 2)
  contact_create: { type: 'contact_create', urgencyLevel: 2, estimatedDuration: 4000, requiresSession: true, canBatch: true },
  opportunity_create: { type: 'opportunity_create', urgencyLevel: 2, estimatedDuration: 5000, requiresSession: true, canBatch: true },
  pipeline_update: { type: 'pipeline_update', urgencyLevel: 2, estimatedDuration: 3000, requiresSession: true, canBatch: false },

  // Normal priority operations (urgency 3)
  contact_update: { type: 'contact_update', urgencyLevel: 3, estimatedDuration: 3000, requiresSession: true, canBatch: true },
  opportunity_update: { type: 'opportunity_update', urgencyLevel: 3, estimatedDuration: 4000, requiresSession: true, canBatch: true },
  task_create: { type: 'task_create', urgencyLevel: 3, estimatedDuration: 2000, requiresSession: true, canBatch: true },
  note_create: { type: 'note_create', urgencyLevel: 3, estimatedDuration: 2000, requiresSession: true, canBatch: true },
  custom_field_update: { type: 'custom_field_update', urgencyLevel: 3, estimatedDuration: 2500, requiresSession: true, canBatch: true },

  // Low priority operations (urgency 4)
  campaign_add: { type: 'campaign_add', urgencyLevel: 4, estimatedDuration: 3000, requiresSession: true, canBatch: true },
  campaign_remove: { type: 'campaign_remove', urgencyLevel: 4, estimatedDuration: 3000, requiresSession: true, canBatch: true },
  tag_add: { type: 'tag_add', urgencyLevel: 4, estimatedDuration: 1500, requiresSession: true, canBatch: true },
  tag_remove: { type: 'tag_remove', urgencyLevel: 4, estimatedDuration: 1500, requiresSession: true, canBatch: true },
  conversation_read: { type: 'conversation_read', urgencyLevel: 4, estimatedDuration: 2000, requiresSession: true, canBatch: false },

  // Background operations (urgency 5)
  contact_delete: { type: 'contact_delete', urgencyLevel: 5, estimatedDuration: 3000, requiresSession: true, canBatch: true },
  bulk_operation: { type: 'bulk_operation', urgencyLevel: 5, estimatedDuration: 30000, requiresSession: true, canBatch: false },
  report_generate: { type: 'report_generate', urgencyLevel: 5, estimatedDuration: 15000, requiresSession: true, canBatch: false },
  data_export: { type: 'data_export', urgencyLevel: 5, estimatedDuration: 20000, requiresSession: true, canBatch: false },
  integration_sync: { type: 'integration_sync', urgencyLevel: 5, estimatedDuration: 10000, requiresSession: false, canBatch: false },
};

/**
 * Task Distributor
 * Intelligently assigns tasks to agents based on capabilities, workload, and priority
 * Enhanced with GHL-specific routing, session affinity, batching, and retry mechanisms
 */
export class TaskDistributor extends EventEmitter {
  private assignments: Map<string, TaskAssignment> = new Map();
  private taskQueue: TaskDefinition[] = [];
  private strategy: DistributionStrategy;
  private browserSessions: Map<string, BrowserSessionInfo> = new Map();
  private clientSessionAffinity: Map<string, string> = new Map(); // clientId -> sessionId
  private taskBatches: Map<string, TaskBatch> = new Map();
  private failedTasks: Map<string, TaskAssignment> = new Map();
  private resultConsolidations: Map<string, ResultConsolidation> = new Map();

  // Configuration
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly BASE_RETRY_DELAY = 1000; // 1 second
  private readonly MAX_RETRY_DELAY = 32000; // 32 seconds
  private readonly BATCH_WINDOW_MS = 2000; // 2 seconds to collect batchable tasks
  private readonly MAX_BATCH_SIZE = 10;
  private readonly SESSION_AFFINITY_TIMEOUT = 300000; // 5 minutes

  constructor(strategyName: 'capability-based' | 'least-loaded' | 'round-robin' | 'session-aware' = 'session-aware') {
    super();
    this.strategy = this.getStrategy(strategyName);
    this.startBatchProcessor();
    this.startRetryProcessor();
  }

  /**
   * Add task to distribution queue with GHL-specific routing
   */
  async queueTask(task: TaskDefinition, ghlOperationType?: GHLOperationType, clientId?: string): Promise<void> {
    // Enhance task with GHL operation metadata in input
    const enhancedTask: TaskDefinition = {
      ...task,
      input: {
        ...task.input,
        ghlOperationType,
        clientId,
        queuedAt: new Date(),
      },
    };

    // Check if task can be batched
    if (ghlOperationType && GHL_OPERATION_URGENCY[ghlOperationType]?.canBatch && clientId) {
      await this.addToBatch(enhancedTask, ghlOperationType, clientId);
      return;
    }

    // Add to priority queue
    this.taskQueue.push(enhancedTask);
    this.sortTaskQueue();

    this.emit('task:queued', {
      taskId: task.id.id,
      priority: task.priority,
      ghlOperationType,
      clientId
    });

    console.log(`[TaskDistributor] Queued task: ${task.id.id}`, {
      priority: task.priority,
      ghlOperationType,
      queueLength: this.taskQueue.length,
    });
  }

  /**
   * Sort task queue by GHL urgency and priority
   */
  private sortTaskQueue(): void {
    this.taskQueue.sort((a, b) => {
      const aGhlOp = a.input?.ghlOperationType as GHLOperationType | undefined;
      const bGhlOp = b.input?.ghlOperationType as GHLOperationType | undefined;

      // First, sort by GHL urgency level if available
      if (aGhlOp && bGhlOp) {
        const aUrgency = GHL_OPERATION_URGENCY[aGhlOp]?.urgencyLevel || 3;
        const bUrgency = GHL_OPERATION_URGENCY[bGhlOp]?.urgencyLevel || 3;
        if (aUrgency !== bUrgency) {
          return aUrgency - bUrgency; // Lower urgency number = higher priority
        }
      }

      // Then by task priority
      if (a.id.priority !== b.id.priority) {
        return a.id.priority - b.id.priority;
      }

      // Finally by creation time
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * Add task to batch for grouped execution
   */
  private async addToBatch(task: TaskDefinition, operationType: GHLOperationType, clientId: string): Promise<void> {
    const batchKey = `${clientId}:${operationType}`;
    let batch = this.taskBatches.get(batchKey);

    if (!batch) {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      batch = {
        batchId,
        clientId,
        tasks: [],
        operationType,
        createdAt: new Date(),
        status: 'pending',
      };
      this.taskBatches.set(batchKey, batch);
    }

    batch.tasks.push(task);

    this.emit('task:batched', {
      taskId: task.id.id,
      batchId: batch.batchId,
      batchSize: batch.tasks.length,
    });

    console.log(`[TaskDistributor] Added task to batch: ${batch.batchId}`, {
      operationType,
      batchSize: batch.tasks.length,
    });

    // If batch is full, process immediately
    if (batch.tasks.length >= this.MAX_BATCH_SIZE) {
      await this.processBatch(batchKey);
    }
  }

  /**
   * Process a batch of tasks
   */
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.taskBatches.get(batchKey);
    if (!batch || batch.status !== 'pending') return;

    batch.status = 'processing';

    // Add batched tasks to queue with batch metadata
    for (const task of batch.tasks) {
      task.input = {
        ...task.input,
        batchId: batch.batchId,
      };
      this.taskQueue.push(task);
    }

    this.sortTaskQueue();
    this.taskBatches.delete(batchKey);

    this.emit('batch:processed', {
      batchId: batch.batchId,
      taskCount: batch.tasks.length,
    });

    console.log(`[TaskDistributor] Processed batch: ${batch.batchId}`, {
      taskCount: batch.tasks.length,
    });
  }

  /**
   * Background batch processor - processes batches after window timeout
   */
  private startBatchProcessor(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [batchKey, batch] of Array.from(this.taskBatches.entries())) {
        const age = now - batch.createdAt.getTime();
        if (age >= this.BATCH_WINDOW_MS && batch.status === 'pending') {
          this.processBatch(batchKey);
        }
      }
    }, this.BATCH_WINDOW_MS);
  }

  /**
   * Assign task to most suitable agent with session awareness
   */
  async assignTask(task: TaskDefinition, availableAgents: AgentState[]): Promise<AgentState | null> {
    const ghlOperationType = task.input?.ghlOperationType as GHLOperationType | undefined;
    const clientId = task.input?.clientId as string | undefined;

    // Check for session affinity
    let selectedAgent: AgentState | null = null;
    let sessionId: string | undefined;

    if (clientId && ghlOperationType && GHL_OPERATION_URGENCY[ghlOperationType]?.requiresSession) {
      const affinityResult = this.findAgentWithSessionAffinity(clientId, availableAgents);
      if (affinityResult) {
        selectedAgent = affinityResult.agent;
        sessionId = affinityResult.sessionId;
        console.log(`[TaskDistributor] Using session affinity for client ${clientId}`);
      }
    }

    // If no affinity found, filter by capability and select using strategy
    if (!selectedAgent) {
      const capableAgents = this.filterCapableAgents(task, availableAgents);

      if (capableAgents.length === 0) {
        console.warn(`[TaskDistributor] No capable agents for task: ${task.id.id}`);
        return null;
      }

      selectedAgent = this.strategy.selectAgent(task, capableAgents);

      if (!selectedAgent) {
        console.warn(`[TaskDistributor] Strategy failed to select agent for task: ${task.id.id}`);
        return null;
      }

      // Create or find session for this agent
      if (ghlOperationType && GHL_OPERATION_URGENCY[ghlOperationType]?.requiresSession) {
        sessionId = this.assignBrowserSession(selectedAgent.id.id, clientId);
      }
    }

    // Create assignment with GHL metadata
    const assignment: TaskAssignment = {
      taskId: task.id.id,
      agentId: selectedAgent.id.id,
      assignedAt: new Date(),
      priority: task.id.priority,
      estimatedDuration: ghlOperationType
        ? GHL_OPERATION_URGENCY[ghlOperationType].estimatedDuration
        : task.requirements.estimatedDuration || 0,
      ghlOperationType,
      sessionId,
      retryCount: 0,
      clientId,
      batchId: task.input?.batchId as string | undefined,
    };

    this.assignments.set(task.id.id, assignment);

    // Update task and agent state
    task.status = 'assigned';
    task.assignedAgent = selectedAgent.id;
    selectedAgent.workload = Math.min(1.0, selectedAgent.workload + 0.2);
    selectedAgent.status = 'busy';

    // Update session usage
    if (sessionId) {
      const session = this.browserSessions.get(sessionId);
      if (session) {
        session.activeTaskCount++;
        session.lastUsed = new Date();
      }
    }

    this.emit('task:assigned', {
      taskId: task.id.id,
      agentId: selectedAgent.id.id,
      agentName: selectedAgent.name,
      sessionId,
      ghlOperationType,
    });

    console.log(`[TaskDistributor] Assigned task ${task.id.id} to agent ${selectedAgent.name}`, {
      ghlOperationType,
      sessionId,
    });

    return selectedAgent;
  }

  /**
   * Register a browser session
   */
  registerBrowserSession(sessionId: string, agentId: string, clientId?: string): void {
    const session: BrowserSessionInfo = {
      sessionId,
      agentId,
      activeTaskCount: 0,
      clientAffinity: clientId,
      createdAt: new Date(),
      lastUsed: new Date(),
      health: 1.0,
      maxConcurrentTasks: 5,
    };

    this.browserSessions.set(sessionId, session);

    if (clientId) {
      this.clientSessionAffinity.set(clientId, sessionId);
    }

    this.emit('session:registered', { sessionId, agentId, clientId });
    console.log(`[TaskDistributor] Registered browser session: ${sessionId}`, { agentId, clientId });
  }

  /**
   * Assign browser session to agent
   */
  private assignBrowserSession(agentId: string, clientId?: string): string {
    // Find existing session for this agent with capacity
    for (const [sessionId, session] of Array.from(this.browserSessions.entries())) {
      if (session.agentId === agentId && session.activeTaskCount < session.maxConcurrentTasks) {
        if (clientId && !session.clientAffinity) {
          session.clientAffinity = clientId;
          this.clientSessionAffinity.set(clientId, sessionId);
        }
        return sessionId;
      }
    }

    // Create new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.registerBrowserSession(sessionId, agentId, clientId);
    return sessionId;
  }

  /**
   * Find agent with existing session affinity
   */
  private findAgentWithSessionAffinity(
    clientId: string,
    availableAgents: AgentState[]
  ): { agent: AgentState; sessionId: string } | null {
    const sessionId = this.clientSessionAffinity.get(clientId);
    if (!sessionId) return null;

    const session = this.browserSessions.get(sessionId);
    if (!session) {
      this.clientSessionAffinity.delete(clientId);
      return null;
    }

    // Check if session is still healthy and has capacity
    const sessionAge = Date.now() - session.lastUsed.getTime();
    if (sessionAge > this.SESSION_AFFINITY_TIMEOUT || session.health < 0.5) {
      this.clientSessionAffinity.delete(clientId);
      this.browserSessions.delete(sessionId);
      return null;
    }

    if (session.activeTaskCount >= session.maxConcurrentTasks) {
      return null;
    }

    // Find the agent for this session
    const agent = availableAgents.find((a) => a.id.id === session.agentId);
    if (!agent || agent.workload >= 0.9) {
      return null;
    }

    return { agent, sessionId };
  }

  /**
   * Release browser session
   */
  releaseBrowserSession(sessionId: string): void {
    const session = this.browserSessions.get(sessionId);
    if (session) {
      session.activeTaskCount = Math.max(0, session.activeTaskCount - 1);
      session.lastUsed = new Date();

      this.emit('session:released', { sessionId, activeTaskCount: session.activeTaskCount });
    }
  }

  /**
   * Clean up stale sessions
   */
  cleanupStaleSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of Array.from(this.browserSessions.entries())) {
      const age = now - session.lastUsed.getTime();
      if (age > this.SESSION_AFFINITY_TIMEOUT && session.activeTaskCount === 0) {
        this.browserSessions.delete(sessionId);
        if (session.clientAffinity) {
          this.clientSessionAffinity.delete(session.clientAffinity);
        }
        this.emit('session:cleaned', { sessionId });
        console.log(`[TaskDistributor] Cleaned up stale session: ${sessionId}`);
      }
    }
  }

  /**
   * Distribute queued tasks to available agents
   */
  async distributeTasks(availableAgents: AgentState[]): Promise<number> {
    let assignedCount = 0;

    while (this.taskQueue.length > 0 && this.hasAvailableAgents(availableAgents)) {
      const task = this.taskQueue.shift();
      if (!task) break;

      const agent = await this.assignTask(task, availableAgents);
      if (agent) {
        assignedCount++;
      } else {
        // Put task back in queue if assignment failed
        this.taskQueue.unshift(task);
        break;
      }
    }

    return assignedCount;
  }

  /**
   * Complete a task assignment with result consolidation
   */
  async completeTask(taskId: string, result: TaskResult): Promise<void> {
    const assignment = this.assignments.get(taskId);
    if (!assignment) {
      console.warn(`[TaskDistributor] No assignment found for task: ${taskId}`);
      return;
    }

    // Release browser session if assigned
    if (assignment.sessionId) {
      this.releaseBrowserSession(assignment.sessionId);
    }

    // Handle batch result consolidation
    if (assignment.batchId) {
      await this.consolidateBatchResult(assignment.batchId, taskId, result);
    }

    this.assignments.delete(taskId);
    this.failedTasks.delete(taskId);

    this.emit('task:completed', {
      taskId,
      agentId: assignment.agentId,
      duration: Date.now() - assignment.assignedAt.getTime(),
      result,
      batchId: assignment.batchId,
      ghlOperationType: assignment.ghlOperationType,
    });

    console.log(`[TaskDistributor] Task completed: ${taskId}`, {
      ghlOperationType: assignment.ghlOperationType,
      batchId: assignment.batchId,
    });
  }

  /**
   * Fail a task assignment with retry logic
   */
  async failTask(taskId: string, task: TaskDefinition, error: string): Promise<void> {
    const assignment = this.assignments.get(taskId);
    if (!assignment) {
      console.warn(`[TaskDistributor] No assignment found for task: ${taskId}`);
      return;
    }

    // Release browser session if assigned
    if (assignment.sessionId) {
      this.releaseBrowserSession(assignment.sessionId);

      // Mark session as unhealthy if multiple failures
      const session = this.browserSessions.get(assignment.sessionId);
      if (session) {
        session.health = Math.max(0, session.health - 0.2);
      }
    }

    // Check if task should be retried
    const shouldRetry = assignment.retryCount < this.MAX_RETRY_ATTEMPTS;

    if (shouldRetry) {
      // Calculate exponential backoff delay
      const retryDelay = Math.min(
        this.BASE_RETRY_DELAY * Math.pow(2, assignment.retryCount),
        this.MAX_RETRY_DELAY
      );

      assignment.retryCount++;
      assignment.nextRetryAt = new Date(Date.now() + retryDelay);

      // Move to failed tasks queue for retry
      this.failedTasks.set(taskId, assignment);
      this.assignments.delete(taskId);

      this.emit('task:retry_scheduled', {
        taskId,
        agentId: assignment.agentId,
        error,
        retryCount: assignment.retryCount,
        retryDelay,
        nextRetryAt: assignment.nextRetryAt,
      });

      console.log(`[TaskDistributor] Task failed, scheduling retry ${assignment.retryCount}/${this.MAX_RETRY_ATTEMPTS}: ${taskId}`, {
        error,
        retryDelay,
      });
    } else {
      // Max retries exceeded - permanent failure
      this.assignments.delete(taskId);
      this.failedTasks.delete(taskId);

      // Handle batch failure
      if (assignment.batchId) {
        await this.consolidateBatchResult(assignment.batchId, taskId, {
          taskId: task.id,
          status: 'failed',
          output: {},
          executionTime: Date.now() - assignment.assignedAt.getTime(),
          resourcesUsed: { cpu: 0, memory: 0, disk: 0 },
          quality: 0,
          error,
        });
      }

      this.emit('task:failed', {
        taskId,
        agentId: assignment.agentId,
        error,
        retryCount: assignment.retryCount,
        permanent: true,
      });

      console.error(`[TaskDistributor] Task permanently failed after ${assignment.retryCount} retries: ${taskId}`, {
        error,
      });
    }
  }

  /**
   * Background retry processor
   */
  private startRetryProcessor(): void {
    setInterval(() => {
      const now = Date.now();
      const tasksToRetry: string[] = [];

      for (const [taskId, assignment] of Array.from(this.failedTasks.entries())) {
        if (assignment.nextRetryAt && now >= assignment.nextRetryAt.getTime()) {
          tasksToRetry.push(taskId);
        }
      }

      // Re-queue failed tasks for retry
      for (const taskId of tasksToRetry) {
        const assignment = this.failedTasks.get(taskId);
        if (assignment) {
          this.failedTasks.delete(taskId);

          // Create new task definition for retry
          const retryTask: TaskDefinition = {
            id: {
              id: taskId,
              swarmId: '',
              sequence: 0,
              priority: assignment.priority
            },
            type: 'custom',
            name: `Retry: ${taskId}`,
            description: 'Retrying failed task',
            priority: 'high',
            status: 'queued',
            requirements: {
              capabilities: [],
              tools: [],
              permissions: [],
            },
            constraints: {
              dependencies: [],
              maxRetries: this.MAX_RETRY_ATTEMPTS,
              timeoutAfter: 60000,
            },
            input: {
              ghlOperationType: assignment.ghlOperationType,
              clientId: assignment.clientId,
              batchId: assignment.batchId,
              retryAttempt: assignment.retryCount,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            attempts: assignment.retryCount,
            maxRetries: this.MAX_RETRY_ATTEMPTS,
          };

          this.taskQueue.unshift(retryTask); // Add to front of queue
          this.sortTaskQueue();

          this.emit('task:retrying', {
            taskId,
            retryCount: assignment.retryCount,
          });

          console.log(`[TaskDistributor] Retrying task: ${taskId}`, {
            retryCount: assignment.retryCount,
          });
        }
      }
    }, 1000); // Check every second
  }

  /**
   * Consolidate batch results
   */
  private async consolidateBatchResult(batchId: string, taskId: string, result: TaskResult): Promise<void> {
    let consolidation = this.resultConsolidations.get(batchId);

    if (!consolidation) {
      consolidation = {
        batchId,
        taskIds: [],
        results: [],
        consolidatedOutput: {},
        successCount: 0,
        failureCount: 0,
        totalExecutionTime: 0,
        startedAt: new Date(),
        completedAt: new Date(),
      };
      this.resultConsolidations.set(batchId, consolidation);
    }

    consolidation.taskIds.push(taskId);
    consolidation.results.push(result);
    consolidation.totalExecutionTime += result.executionTime;

    if (result.status === 'completed') {
      consolidation.successCount++;
      // Merge outputs
      Object.assign(consolidation.consolidatedOutput, result.output);
    } else {
      consolidation.failureCount++;
    }

    consolidation.completedAt = new Date();

    this.emit('batch:result_consolidated', {
      batchId,
      taskId,
      successCount: consolidation.successCount,
      failureCount: consolidation.failureCount,
      totalTasks: consolidation.taskIds.length,
    });

    console.log(`[TaskDistributor] Consolidated batch result for ${batchId}`, {
      taskId,
      successCount: consolidation.successCount,
      failureCount: consolidation.failureCount,
    });
  }

  /**
   * Get consolidated batch results
   */
  getBatchResults(batchId: string): ResultConsolidation | null {
    return this.resultConsolidations.get(batchId) || null;
  }

  /**
   * Clear batch results
   */
  clearBatchResults(batchId: string): void {
    this.resultConsolidations.delete(batchId);
  }

  /**
   * Get queue status with GHL metrics
   */
  getQueueStatus(): {
    queueLength: number;
    activeAssignments: number;
    tasksByPriority: Record<string, number>;
    tasksByGHLOperation: Record<string, number>;
    activeBatches: number;
    activeSessions: number;
    failedTasksAwaitingRetry: number;
    sessionHealth: {
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
  } {
    const tasksByPriority: Record<string, number> = {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0,
      background: 0,
    };

    const tasksByGHLOperation: Record<string, number> = {};

    for (const task of this.taskQueue) {
      tasksByPriority[task.priority] = (tasksByPriority[task.priority] || 0) + 1;

      const ghlOp = task.input?.ghlOperationType as GHLOperationType | undefined;
      if (ghlOp) {
        tasksByGHLOperation[ghlOp] = (tasksByGHLOperation[ghlOp] || 0) + 1;
      }
    }

    // Calculate session health metrics
    const sessionHealth = { healthy: 0, degraded: 0, unhealthy: 0 };
    for (const session of Array.from(this.browserSessions.values())) {
      if (session.health > 0.7) sessionHealth.healthy++;
      else if (session.health > 0.3) sessionHealth.degraded++;
      else sessionHealth.unhealthy++;
    }

    return {
      queueLength: this.taskQueue.length,
      activeAssignments: this.assignments.size,
      tasksByPriority,
      tasksByGHLOperation,
      activeBatches: this.taskBatches.size,
      activeSessions: this.browserSessions.size,
      failedTasksAwaitingRetry: this.failedTasks.size,
      sessionHealth,
    };
  }

  /**
   * Get task assignment
   */
  getAssignment(taskId: string): TaskAssignment | null {
    return this.assignments.get(taskId) || null;
  }

  /**
   * Get all assignments for an agent
   */
  getAgentAssignments(agentId: string): TaskAssignment[] {
    return Array.from(this.assignments.values()).filter((a) => a.agentId === agentId);
  }

  // Private methods

  private filterCapableAgents(task: TaskDefinition, agents: AgentState[]): AgentState[] {
    return agents.filter((agent) => {
      // Check if agent is available
      if (agent.status !== 'idle' && agent.status !== 'busy') {
        return false;
      }

      // Check workload capacity
      if (agent.workload >= 0.9) {
        return false;
      }

      // Check concurrent task limit
      if (agent.capabilities.maxConcurrentTasks <= 0) {
        return false;
      }

      // Check capability requirements
      const requiredCapabilities = task.requirements.capabilities;
      const agentCapabilities = [
        ...agent.capabilities.languages,
        ...agent.capabilities.frameworks,
        ...agent.capabilities.domains,
        ...agent.capabilities.tools,
      ];

      // Check if agent has required capabilities
      const hasCapabilities = requiredCapabilities.every((required) =>
        agentCapabilities.some((cap) => cap.toLowerCase().includes(required.toLowerCase()))
      );

      if (!hasCapabilities) {
        return false;
      }

      // Check agent type if specified
      if (task.requirements.agentType && task.requirements.agentType !== agent.type) {
        return false;
      }

      return true;
    });
  }

  private hasAvailableAgents(agents: AgentState[]): boolean {
    return agents.some(
      (agent) =>
        (agent.status === 'idle' || agent.status === 'busy') &&
        agent.workload < 0.9 &&
        agent.capabilities.maxConcurrentTasks > 0
    );
  }

  private getStrategy(strategyName: string): DistributionStrategy {
    const strategies: Record<string, DistributionStrategy> = {
      'capability-based': {
        name: 'Capability-Based',
        selectAgent: (task, agents) => {
          // Score agents by capability match and availability
          const scored = agents.map((agent) => ({
            agent,
            score: this.scoreAgent(agent, task),
          }));

          scored.sort((a, b) => b.score - a.score);
          return scored[0]?.agent || null;
        },
      },

      'least-loaded': {
        name: 'Least Loaded',
        selectAgent: (task, agents) => {
          // Select agent with lowest workload
          let best = agents[0];
          for (const agent of agents) {
            if (agent.workload < best.workload) {
              best = agent;
            }
          }
          return best;
        },
      },

      'round-robin': {
        name: 'Round Robin',
        selectAgent: (task, agents) => {
          // Simple round-robin selection
          const index = this.assignments.size % agents.length;
          return agents[index] || agents[0];
        },
      },

      'session-aware': {
        name: 'Session-Aware (GHL Optimized)',
        selectAgent: (task, agents) => {
          // Prioritize agents with existing sessions and low workload
          const scored = agents.map((agent) => {
            let score = this.scoreAgent(agent, task);

            // Bonus for having healthy browser sessions
            const agentSessions = Array.from(this.browserSessions.values()).filter(
              (s) => s.agentId === agent.id.id && s.health > 0.5
            );

            if (agentSessions.length > 0) {
              score += 15; // Bonus for having sessions
              const avgSessionHealth = agentSessions.reduce((sum, s) => sum + s.health, 0) / agentSessions.length;
              score += avgSessionHealth * 10; // Bonus for session health
            }

            // Penalty for high session count (avoid overloading)
            const totalSessionTasks = agentSessions.reduce((sum, s) => sum + s.activeTaskCount, 0);
            score -= totalSessionTasks * 2;

            return { agent, score };
          });

          scored.sort((a, b) => b.score - a.score);
          return scored[0]?.agent || null;
        },
      },
    };

    return strategies[strategyName] || strategies['session-aware'];
  }

  private scoreAgent(agent: AgentState, task: TaskDefinition): number {
    let score = 0;

    // Health score (0-30 points)
    score += agent.health * 30;

    // Success rate score (0-25 points)
    score += agent.metrics.successRate * 25;

    // Availability score (0-20 points)
    const availability = 1 - agent.workload;
    score += availability * 20;

    // Quality score (0-15 points)
    score += agent.capabilities.quality * 15;

    // Reliability score (0-10 points)
    score += agent.capabilities.reliability * 10;

    return score;
  }
}
