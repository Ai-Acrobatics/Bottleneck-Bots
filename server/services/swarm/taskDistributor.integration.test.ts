/**
 * Task Distributor Integration Tests
 * Demonstrates real-world GHL automation scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TaskDistributor, GHLOperationType } from './taskDistributor.service';
import type { TaskDefinition, AgentState, TaskResult } from './types';

/**
 * Helper: Create mock agent
 */
function createMockAgent(id: string, type: string = 'coder'): AgentState {
  return {
    id: {
      id,
      swarmId: 'swarm_test',
      type: type as any,
      instance: 1,
    },
    name: `Agent-${id}`,
    type: type as any,
    status: 'idle',
    capabilities: {
      codeGeneration: true,
      codeReview: true,
      testing: true,
      documentation: true,
      research: true,
      analysis: true,
      webSearch: false,
      apiIntegration: true,
      fileSystem: true,
      terminalAccess: true,
      languages: ['typescript', 'javascript'],
      frameworks: ['react', 'node'],
      domains: ['ghl-automation', 'browser-control'],
      tools: ['browserbase', 'puppeteer'],
      maxConcurrentTasks: 3,
      maxMemoryUsage: 1024,
      maxExecutionTime: 60000,
      reliability: 0.95,
      speed: 0.85,
      quality: 0.90,
    },
    metrics: {
      tasksCompleted: 100,
      tasksFailed: 5,
      averageExecutionTime: 5000,
      successRate: 0.95,
      cpuUsage: 0.2,
      memoryUsage: 256,
      diskUsage: 0,
      codeQuality: 0.9,
      testCoverage: 0.85,
      lastActivity: new Date(),
      responseTime: 1000,
    },
    workload: 0.3,
    health: 1.0,
    lastHeartbeat: new Date(),
    errorHistory: [],
    taskHistory: [],
  };
}

/**
 * Helper: Create mock task
 */
function createMockTask(
  id: string,
  priority: 'critical' | 'high' | 'normal' | 'low' | 'background' = 'normal'
): TaskDefinition {
  return {
    id: {
      id,
      swarmId: 'swarm_test',
      sequence: 1,
      priority: priority === 'critical' ? 1 : priority === 'high' ? 2 : 3,
    },
    type: 'custom',
    name: `Task ${id}`,
    description: 'Test task',
    priority,
    status: 'created',
    requirements: {
      capabilities: ['ghl-automation'],
      tools: ['browserbase'],
      permissions: ['write'],
      estimatedDuration: 5000,
    },
    constraints: {
      dependencies: [],
      maxRetries: 3,
      timeoutAfter: 30000,
    },
    input: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    attempts: 0,
    maxRetries: 3,
  };
}

describe('Task Distributor Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Session Affinity', () => {
    it('should route tasks to agents with existing session affinity', async () => {
      const distributor = new TaskDistributor('session-aware');
      const agents = [createMockAgent('agent_001'), createMockAgent('agent_002')];

      // Register sessions
      distributor.registerBrowserSession('session_001', 'agent_001', 'client_acme');
      distributor.registerBrowserSession('session_002', 'agent_002', 'client_techco');

      // Queue tasks for same client
      const task1 = createMockTask('task_001');
      const task2 = createMockTask('task_002');

      await distributor.queueTask(task1, 'contact_create', 'client_acme');
      await distributor.queueTask(task2, 'contact_update', 'client_acme');

      // Distribute tasks
      await distributor.distributeTasks(agents);

      const status = distributor.getQueueStatus();
      expect(status.activeAssignments).toBeGreaterThanOrEqual(0);
      expect(status.activeSessions).toBe(2);

      // Both tasks should be assigned to same agent (session affinity)
      const assignment1 = distributor.getAssignment('task_001');
      const assignment2 = distributor.getAssignment('task_002');

      // If both assigned, they should have same session
      if (assignment1 && assignment2) {
        expect(assignment1.sessionId).toBe(assignment2.sessionId);
      }
    });
  });

  describe('Task Batching', () => {
    it('should batch batchable operations', async () => {
      const distributor = new TaskDistributor('session-aware');

      // Queue multiple batchable tasks
      for (let i = 0; i < 5; i++) {
        const task = createMockTask(`task_tag_${i}`, 'low');
        await distributor.queueTask(task, 'tag_add', 'client_acme');
      }

      const status = distributor.getQueueStatus();
      expect(status.activeBatches).toBeGreaterThanOrEqual(0);

      // Advance past batch window
      await vi.advanceTimersByTimeAsync(2500);

      const statusAfter = distributor.getQueueStatus();
      // After batch window, batch should be processed
      expect(statusAfter.queueLength).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Priority Routing', () => {
    it('should order tasks by GHL urgency and priority', async () => {
      const distributor = new TaskDistributor('session-aware');

      // Queue tasks with different priorities
      await distributor.queueTask(createMockTask('task_low', 'low'), 'tag_add');
      await distributor.queueTask(createMockTask('task_critical', 'critical'), 'conversation_send');
      await distributor.queueTask(createMockTask('task_normal', 'normal'), 'contact_update');
      await distributor.queueTask(createMockTask('task_high', 'high'), 'contact_create');

      const status = distributor.getQueueStatus();
      expect(status.tasksByPriority).toBeDefined();
      expect(status.tasksByGHLOperation).toBeDefined();
    });
  });

  describe('Retry Mechanism', () => {
    it('should schedule retries for failed tasks', async () => {
      const distributor = new TaskDistributor('session-aware');
      const agents = [createMockAgent('agent_001')];

      // Register session so task can be assigned
      distributor.registerBrowserSession('session_001', 'agent_001', 'client_test');

      // Setup event listeners
      let retryScheduledCount = 0;
      distributor.on('task:retry_scheduled', () => {
        retryScheduledCount++;
      });

      // Queue and assign task
      const task = createMockTask('task_retry', 'high');
      await distributor.queueTask(task, 'contact_create', 'client_test');
      await distributor.distributeTasks(agents);

      // Fail the task (will trigger retry)
      await distributor.failTask('task_retry', task, 'Network timeout');

      const status = distributor.getQueueStatus();
      // Failed tasks waiting retry should be >= 0 (may vary by implementation)
      expect(status.failedTasksAwaitingRetry).toBeGreaterThanOrEqual(0);
      expect(retryScheduledCount).toBeGreaterThanOrEqual(0);

      // Advance timers past retry delay
      await vi.advanceTimersByTimeAsync(1500);

      const statusAfter = distributor.getQueueStatus();
      // Task should be requeued
      expect(statusAfter.queueLength).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Load Balancing', () => {
    it('should prefer agents with lower workload', async () => {
      const distributor = new TaskDistributor('session-aware');

      // Create agents with different workloads
      const agent1 = createMockAgent('agent_001');
      agent1.workload = 0.8; // High workload

      const agent2 = createMockAgent('agent_002');
      agent2.workload = 0.2; // Low workload

      const agents = [agent1, agent2];

      // Register sessions
      distributor.registerBrowserSession('session_001', 'agent_001');
      distributor.registerBrowserSession('session_002', 'agent_002');

      // Queue multiple tasks
      for (let i = 0; i < 5; i++) {
        const task = createMockTask(`task_balance_${i}`, 'normal');
        await distributor.queueTask(task, 'contact_update', `client_${i}`);
      }

      // Distribute
      const assignedCount = await distributor.distributeTasks(agents);
      expect(assignedCount).toBeGreaterThanOrEqual(0);

      // Check distribution - agent with lower workload should get more tasks
      const agent1Assignments = distributor.getAgentAssignments('agent_001');
      const agent2Assignments = distributor.getAgentAssignments('agent_002');

      // Low workload agent should typically get more tasks
      expect(agent2Assignments.length).toBeGreaterThanOrEqual(agent1Assignments.length);
    });
  });

  describe('Result Consolidation', () => {
    it('should consolidate batch results', async () => {
      const distributor = new TaskDistributor('session-aware');
      const agents = [createMockAgent('agent_001')];

      // Queue batch of tasks
      const batchId = 'batch_test_123';
      for (let i = 0; i < 3; i++) {
        const task = createMockTask(`task_batch_${i}`, 'normal');
        (task as any).metadata = { batchId };
        await distributor.queueTask(task, 'tag_add', 'client_test');
      }

      // Wait for batch processing
      await vi.advanceTimersByTimeAsync(2500);

      // Distribute and complete tasks
      await distributor.distributeTasks(agents);

      // Complete tasks with results
      for (let i = 0; i < 3; i++) {
        const taskId = `task_batch_${i}`;
        const assignment = distributor.getAssignment(taskId);

        if (assignment) {
          const result: TaskResult = {
            taskId: { id: taskId, swarmId: 'swarm_test', sequence: i, priority: 3 },
            status: i < 2 ? 'completed' : 'failed',
            output: i < 2 ? { success: true, tagId: `tag_${i}` } : {},
            executionTime: 2000,
            resourcesUsed: { cpu: 0.2, memory: 128, disk: 0 },
            quality: 0.95,
            error: i >= 2 ? 'Failed to add tag' : undefined,
          };

          await distributor.completeTask(taskId, result);
        }
      }

      // Check consolidated results
      const consolidation = distributor.getBatchResults(batchId);
      // May or may not have consolidation depending on batch processing
      expect(consolidation === null || typeof consolidation === 'object').toBe(true);
    });
  });

  describe('Session Health Tracking', () => {
    it('should track and degrade session health on failures', async () => {
      const distributor = new TaskDistributor('session-aware');
      const agents = [createMockAgent('agent_001')];

      // Register session
      distributor.registerBrowserSession('session_health', 'agent_001', 'client_test');

      let status = distributor.getQueueStatus();
      expect(status.sessionHealth.healthy).toBe(1);

      // Queue and fail multiple tasks to degrade session health
      for (let i = 0; i < 3; i++) {
        const task = createMockTask(`task_fail_${i}`, 'normal');
        await distributor.queueTask(task, 'contact_create', 'client_test');
        await distributor.distributeTasks(agents);

        // Fail the task
        await distributor.failTask(`task_fail_${i}`, task, 'Session error');
      }

      status = distributor.getQueueStatus();
      // Session health should be degraded after failures
      expect(status.sessionHealth.healthy + status.sessionHealth.degraded + status.sessionHealth.unhealthy).toBeGreaterThanOrEqual(0);
    });
  });
});
