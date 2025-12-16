/**
 * Browser Agent Bridge Service
 *
 * Connects the Agent Orchestrator (browser automation) to the Swarm system
 * for multi-agent browser task coordination.
 *
 * Features:
 * - Swarm-initiated browser automation tasks
 * - Multi-agent browser coordination for complex GHL workflows
 * - Result consolidation across multiple browser agents
 * - Session affinity and load balancing
 */

import { EventEmitter } from 'events';
import { getAgentOrchestrator, type AgentExecutionResult } from '../agentOrchestrator.service';
import { TaskDistributor, type GHLOperationType } from './taskDistributor.service';
import type { TaskDefinition, TaskResult, TaskType, TaskPriority, TaskStatus, TaskId } from './types';

// ========================================
// TYPES
// ========================================

export interface BrowserTaskRequest {
  taskDescription: string;
  userId: number;
  ghlOperationType?: GHLOperationType;
  clientId?: string;
  context?: Record<string, unknown>;
  priority?: number;
}

export interface BrowserTaskResult {
  taskId: string;
  executionId: number;
  success: boolean;
  result?: unknown;
  error?: string;
  screenshots?: string[];
  duration: number;
}

export interface MultiAgentBrowserTask {
  id: string;
  name: string;
  description: string;
  subtasks: BrowserTaskRequest[];
  coordinationType: 'parallel' | 'sequential' | 'pipeline';
  resultAggregation: 'merge' | 'collect' | 'reduce';
  maxConcurrentAgents?: number;
  timeout?: number;
}

export interface MultiAgentResult {
  taskId: string;
  success: boolean;
  subtaskResults: BrowserTaskResult[];
  consolidatedOutput: Record<string, unknown>;
  totalDuration: number;
  successCount: number;
  failureCount: number;
}

interface ActiveBrowserAgent {
  agentId: string;
  userId: number;
  executionId: number;
  startedAt: Date;
  taskDescription: string;
  status: 'running' | 'completed' | 'failed';
}

// ========================================
// BROWSER AGENT BRIDGE SERVICE
// ========================================

class BrowserAgentBridgeService extends EventEmitter {
  private activeBrowserAgents: Map<string, ActiveBrowserAgent> = new Map();
  private multiAgentTasks: Map<string, MultiAgentBrowserTask> = new Map();
  private multiAgentResults: Map<string, BrowserTaskResult[]> = new Map();
  private taskDistributor: TaskDistributor;
  private taskIdCounter = 0;

  constructor() {
    super();
    this.setMaxListeners(50);
    this.taskDistributor = new TaskDistributor('session-aware');
    this.setupEventListeners();
  }

  // ========================================
  // SWARM INTEGRATION
  // ========================================

  /**
   * Execute a browser automation task via the swarm system
   */
  async executeSwarmBrowserTask(request: BrowserTaskRequest): Promise<BrowserTaskResult> {
    const taskId = this.generateTaskId();
    const orchestrator = getAgentOrchestrator();

    // Map priority number to TaskPriority type
    const priorityMap: Record<number, TaskPriority> = {
      1: 'critical',
      2: 'high',
      3: 'normal',
      4: 'low',
      5: 'background',
    };

    // Create a task definition for the swarm
    const taskDef: TaskDefinition = {
      id: taskId as unknown as TaskDefinition['id'],
      type: 'custom' as TaskType,
      name: request.taskDescription.slice(0, 100),
      description: request.taskDescription,
      priority: priorityMap[request.priority || 3],
      status: 'created' as TaskStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: 0,
      maxRetries: 3,
      input: {
        taskDescription: request.taskDescription,
        userId: request.userId,
        context: request.context || {},
        ghlOperationType: request.ghlOperationType,
        clientId: request.clientId,
      },
      requirements: {
        capabilities: ['browserAutomation'],
        tools: ['browser'],
        permissions: ['execute'],
      },
      constraints: {
        dependencies: [],
        maxRetries: 3,
        timeoutAfter: 300000, // 5 minutes
      },
    };

    // Queue task with GHL operation type for priority routing
    this.taskDistributor.queueTask(
      taskDef,
      request.ghlOperationType,
      request.clientId
    );

    this.emit('task:queued', { taskId, request });

    // Execute via agent orchestrator
    const startTime = Date.now();
    try {
      const result: AgentExecutionResult = await orchestrator.executeTask({
        taskDescription: request.taskDescription,
        userId: request.userId,
        context: request.context || {},
      });

      // Extract screenshots from tool history
      const screenshots = this.extractScreenshots(result);

      const browserResult: BrowserTaskResult = {
        taskId,
        executionId: result.executionId,
        success: result.status === 'completed',
        result: result.output,
        screenshots,
        duration: Date.now() - startTime,
      };

      // Complete task in distributor
      this.taskDistributor.completeTask(taskId, {
        taskId: taskId as unknown as TaskId,
        status: 'completed' as TaskStatus,
        output: result.output as Record<string, unknown>,
        artifacts: screenshots.length > 0 ? { screenshots } : undefined,
        executionTime: Date.now() - startTime,
        resourcesUsed: { cpu: 0, memory: 0, disk: 0 },
        quality: result.status === 'completed' ? 1.0 : 0.5,
      });

      this.emit('task:completed', browserResult);
      return browserResult;

    } catch (error) {
      const browserResult: BrowserTaskResult = {
        taskId,
        executionId: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };

      // Fail task in distributor (triggers retry if eligible)
      this.taskDistributor.failTask(taskId, taskDef, browserResult.error!);

      this.emit('task:failed', browserResult);
      return browserResult;
    }
  }

  /**
   * Extract screenshots from tool history
   */
  private extractScreenshots(result: AgentExecutionResult): string[] {
    const screenshots: string[] = [];
    for (const tool of result.toolHistory) {
      if (tool.toolName === 'screenshot' && tool.result && typeof tool.result === 'object') {
        const res = tool.result as Record<string, unknown>;
        if (res.url && typeof res.url === 'string') {
          screenshots.push(res.url);
        }
        if (res.path && typeof res.path === 'string') {
          screenshots.push(res.path);
        }
      }
    }
    return screenshots;
  }

  // ========================================
  // MULTI-AGENT COORDINATION
  // ========================================

  /**
   * Execute a complex task using multiple browser agents
   */
  async executeMultiAgentTask(task: MultiAgentBrowserTask): Promise<MultiAgentResult> {
    const taskId = task.id || this.generateTaskId();
    this.multiAgentTasks.set(taskId, task);
    this.multiAgentResults.set(taskId, []);

    this.emit('multiagent:started', { taskId, subtaskCount: task.subtasks.length });

    const startTime = Date.now();
    const results: BrowserTaskResult[] = [];

    try {
      switch (task.coordinationType) {
        case 'parallel':
          const parallelResults = await this.executeParallel(
            task.subtasks,
            task.maxConcurrentAgents || 3
          );
          results.push(...parallelResults);
          break;

        case 'sequential':
          const sequentialResults = await this.executeSequential(task.subtasks);
          results.push(...sequentialResults);
          break;

        case 'pipeline':
          const pipelineResults = await this.executePipeline(task.subtasks);
          results.push(...pipelineResults);
          break;
      }

      // Aggregate results
      const consolidatedOutput = this.aggregateResults(results, task.resultAggregation);

      const multiAgentResult: MultiAgentResult = {
        taskId,
        success: results.every(r => r.success),
        subtaskResults: results,
        consolidatedOutput,
        totalDuration: Date.now() - startTime,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
      };

      this.emit('multiagent:completed', multiAgentResult);
      this.multiAgentTasks.delete(taskId);
      this.multiAgentResults.delete(taskId);

      return multiAgentResult;

    } catch (error) {
      const multiAgentResult: MultiAgentResult = {
        taskId,
        success: false,
        subtaskResults: results,
        consolidatedOutput: { error: error instanceof Error ? error.message : 'Unknown error' },
        totalDuration: Date.now() - startTime,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length + 1,
      };

      this.emit('multiagent:failed', multiAgentResult);
      this.multiAgentTasks.delete(taskId);
      this.multiAgentResults.delete(taskId);

      return multiAgentResult;
    }
  }

  /**
   * Execute subtasks in parallel with concurrency limit
   */
  private async executeParallel(
    subtasks: BrowserTaskRequest[],
    maxConcurrent: number
  ): Promise<BrowserTaskResult[]> {
    const results: BrowserTaskResult[] = [];
    const chunks: BrowserTaskRequest[][] = [];

    // Split into chunks for concurrency control
    for (let i = 0; i < subtasks.length; i += maxConcurrent) {
      chunks.push(subtasks.slice(i, i + maxConcurrent));
    }

    // Execute each chunk in parallel
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(subtask => this.executeSwarmBrowserTask(subtask));
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);

      this.emit('multiagent:chunk_completed', {
        completedCount: results.length,
        totalCount: subtasks.length,
      });
    }

    return results;
  }

  /**
   * Execute subtasks sequentially, one at a time
   */
  private async executeSequential(subtasks: BrowserTaskRequest[]): Promise<BrowserTaskResult[]> {
    const results: BrowserTaskResult[] = [];

    for (const subtask of subtasks) {
      const result = await this.executeSwarmBrowserTask(subtask);
      results.push(result);

      this.emit('multiagent:subtask_completed', {
        completedCount: results.length,
        totalCount: subtasks.length,
        lastResult: result,
      });

      // Stop on failure for sequential execution
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute subtasks as a pipeline, passing output to next input
   */
  private async executePipeline(subtasks: BrowserTaskRequest[]): Promise<BrowserTaskResult[]> {
    const results: BrowserTaskResult[] = [];
    let pipelineContext: Record<string, unknown> = {};

    for (const subtask of subtasks) {
      // Merge pipeline context into subtask context
      const enrichedSubtask: BrowserTaskRequest = {
        ...subtask,
        context: {
          ...subtask.context,
          ...pipelineContext,
          _pipelineStep: results.length,
        },
      };

      const result = await this.executeSwarmBrowserTask(enrichedSubtask);
      results.push(result);

      // Pass output to next stage
      if (result.success && result.result) {
        pipelineContext = {
          ...pipelineContext,
          _previousResult: result.result,
          _previousTaskId: result.taskId,
        };
      }

      this.emit('multiagent:pipeline_step', {
        step: results.length,
        totalSteps: subtasks.length,
        result,
      });

      // Stop pipeline on failure
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Aggregate results based on strategy
   */
  private aggregateResults(
    results: BrowserTaskResult[],
    strategy: 'merge' | 'collect' | 'reduce'
  ): Record<string, unknown> {
    switch (strategy) {
      case 'merge':
        // Deep merge all results into one object
        return results.reduce((acc, r) => {
          if (r.result && typeof r.result === 'object') {
            return { ...acc, ...(r.result as Record<string, unknown>) };
          }
          return acc;
        }, {} as Record<string, unknown>);

      case 'collect':
        // Collect all results into an array
        return {
          results: results.map(r => ({
            taskId: r.taskId,
            success: r.success,
            result: r.result,
            error: r.error,
          })),
        };

      case 'reduce':
        // Only keep the final successful result
        const lastSuccess = [...results].reverse().find(r => r.success);
        return (lastSuccess?.result as Record<string, unknown>) || {};
    }
  }

  // ========================================
  // GHL-SPECIFIC MULTI-AGENT WORKFLOWS
  // ========================================

  /**
   * Execute a bulk GHL operation across multiple contacts
   */
  async executeBulkGHLOperation(
    operation: GHLOperationType,
    targets: string[], // contactIds, opportunityIds, etc.
    userId: number,
    clientId: string,
    actionTemplate: string
  ): Promise<MultiAgentResult> {
    const subtasks: BrowserTaskRequest[] = targets.map((targetId, index) => ({
      taskDescription: actionTemplate.replace('{{TARGET_ID}}', targetId),
      userId,
      ghlOperationType: operation,
      clientId,
      context: { targetId, targetIndex: index },
      priority: 3,
    }));

    return this.executeMultiAgentTask({
      id: this.generateTaskId(),
      name: `Bulk ${operation}`,
      description: `Execute ${operation} on ${targets.length} targets`,
      subtasks,
      coordinationType: 'parallel',
      resultAggregation: 'collect',
      maxConcurrentAgents: Math.min(5, targets.length),
      timeout: 30 * 60 * 1000, // 30 minutes
    });
  }

  /**
   * Execute a GHL workflow with multiple steps
   */
  async executeGHLWorkflow(
    workflowName: string,
    steps: Array<{
      operation: GHLOperationType;
      description: string;
      context?: Record<string, unknown>;
    }>,
    userId: number,
    clientId: string
  ): Promise<MultiAgentResult> {
    const subtasks: BrowserTaskRequest[] = steps.map((step, index) => ({
      taskDescription: step.description,
      userId,
      ghlOperationType: step.operation,
      clientId,
      context: {
        ...step.context,
        workflowStep: index + 1,
        totalSteps: steps.length,
      },
      priority: 2, // Higher priority for workflow steps
    }));

    return this.executeMultiAgentTask({
      id: this.generateTaskId(),
      name: workflowName,
      description: `${steps.length}-step GHL workflow`,
      subtasks,
      coordinationType: 'pipeline',
      resultAggregation: 'reduce',
      timeout: 15 * 60 * 1000, // 15 minutes
    });
  }

  /**
   * Execute parallel data extraction from multiple GHL pages
   */
  async executeParallelExtraction(
    extractionTasks: Array<{
      url: string;
      extractionPrompt: string;
      dataType: string;
    }>,
    userId: number,
    clientId: string
  ): Promise<MultiAgentResult> {
    const subtasks: BrowserTaskRequest[] = extractionTasks.map((task, index) => ({
      taskDescription: `Navigate to ${task.url} and extract ${task.dataType}: ${task.extractionPrompt}`,
      userId,
      ghlOperationType: 'data_export',
      clientId,
      context: {
        targetUrl: task.url,
        extractionPrompt: task.extractionPrompt,
        dataType: task.dataType,
        extractionIndex: index,
      },
      priority: 3,
    }));

    return this.executeMultiAgentTask({
      id: this.generateTaskId(),
      name: 'Parallel Data Extraction',
      description: `Extract data from ${extractionTasks.length} GHL pages`,
      subtasks,
      coordinationType: 'parallel',
      resultAggregation: 'merge',
      maxConcurrentAgents: 3,
      timeout: 10 * 60 * 1000, // 10 minutes
    });
  }

  // ========================================
  // STATUS & MONITORING
  // ========================================

  /**
   * Get active browser agent status
   */
  getActiveAgents(): ActiveBrowserAgent[] {
    return Array.from(this.activeBrowserAgents.values());
  }

  /**
   * Get active multi-agent tasks
   */
  getActiveMultiAgentTasks(): MultiAgentBrowserTask[] {
    return Array.from(this.multiAgentTasks.values());
  }

  /**
   * Get multi-agent task progress
   */
  getMultiAgentProgress(taskId: string): {
    task: MultiAgentBrowserTask | undefined;
    completedCount: number;
    totalCount: number;
    results: BrowserTaskResult[];
  } | null {
    const task = this.multiAgentTasks.get(taskId);
    const results = this.multiAgentResults.get(taskId) || [];

    if (!task) return null;

    return {
      task,
      completedCount: results.length,
      totalCount: task.subtasks.length,
      results,
    };
  }

  // ========================================
  // HELPERS
  // ========================================

  private generateTaskId(): string {
    return `browser-task-${Date.now()}-${++this.taskIdCounter}`;
  }

  private setupEventListeners(): void {
    // Listen for task distributor events
    this.taskDistributor.on('task:completed', (data: { taskId: string }) => {
      const taskResults = this.multiAgentResults.get(data.taskId);
      if (taskResults) {
        // Part of a multi-agent task
        this.emit('multiagent:subtask_completed', { taskId: data.taskId });
      }
    });

    this.taskDistributor.on('task:failed', (data: { taskId: string; error: string }) => {
      this.emit('task:failed_distributed', data);
    });

    this.taskDistributor.on('task:retry_scheduled', (data: { taskId: string }) => {
      this.emit('task:retry_scheduled', data);
    });
  }
}

// ========================================
// SINGLETON EXPORT
// ========================================

export const browserAgentBridgeService = new BrowserAgentBridgeService();

export function getBrowserAgentBridge(): BrowserAgentBridgeService {
  return browserAgentBridgeService;
}
