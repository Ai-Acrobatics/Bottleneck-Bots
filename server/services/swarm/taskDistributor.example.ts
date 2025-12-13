/**
 * Task Distributor Usage Examples
 * Demonstrates GHL-specific task distribution patterns
 */

import { TaskDistributor, GHLOperationType } from './taskDistributor.service';
import type { TaskDefinition, AgentState } from './types';

/**
 * Example 1: Initialize the Task Distributor with session-aware strategy
 */
function initializeDistributor() {
  const distributor = new TaskDistributor('session-aware');

  // Listen to events
  distributor.on('task:queued', (data) => {
    console.log('Task queued:', data);
  });

  distributor.on('task:assigned', (data) => {
    console.log('Task assigned:', data);
  });

  distributor.on('task:completed', (data) => {
    console.log('Task completed:', data);
  });

  distributor.on('task:retry_scheduled', (data) => {
    console.log('Task retry scheduled:', data);
  });

  distributor.on('batch:processed', (data) => {
    console.log('Batch processed:', data);
  });

  distributor.on('session:registered', (data) => {
    console.log('Browser session registered:', data);
  });

  return distributor;
}

/**
 * Example 2: Queue a high-priority contact creation task
 */
async function queueContactCreation(distributor: TaskDistributor) {
  const task: TaskDefinition = {
    id: {
      id: 'task_contact_create_001',
      swarmId: 'swarm_123',
      sequence: 1,
      priority: 2,
    },
    type: 'custom',
    name: 'Create Contact in GHL',
    description: 'Create a new contact with custom fields',
    priority: 'high',
    status: 'created',
    requirements: {
      capabilities: ['ghl-automation', 'browser-control'],
      tools: ['browserbase'],
      permissions: ['write'],
      estimatedDuration: 4000,
    },
    constraints: {
      dependencies: [],
      maxRetries: 3,
      timeoutAfter: 30000,
    },
    input: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      customFields: {
        company: 'Acme Corp',
        industry: 'Technology',
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    attempts: 0,
    maxRetries: 3,
  };

  await distributor.queueTask(task, 'contact_create', 'client_acme_001');
}

/**
 * Example 3: Queue multiple batchable tasks (tags)
 */
async function queueBatchedTagOperations(distributor: TaskDistributor) {
  const clientId = 'client_acme_001';

  // These will automatically batch together
  for (let i = 0; i < 5; i++) {
    const task: TaskDefinition = {
      id: {
        id: `task_tag_add_00${i}`,
        swarmId: 'swarm_123',
        sequence: i,
        priority: 4,
      },
      type: 'custom',
      name: `Add Tag to Contact ${i}`,
      description: 'Add marketing tag to contact',
      priority: 'low',
      status: 'created',
      requirements: {
        capabilities: ['ghl-automation'],
        tools: ['browserbase'],
        permissions: ['write'],
      },
      constraints: {
        dependencies: [],
        maxRetries: 3,
        timeoutAfter: 10000,
      },
      input: {
        contactId: `contact_00${i}`,
        tag: 'marketing_qualified',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: 0,
      maxRetries: 3,
    };

    await distributor.queueTask(task, 'tag_add', clientId);
  }

  console.log('Queued 5 tag operations - they will batch automatically');
}

/**
 * Example 4: Register browser sessions for agents
 */
function registerBrowserSessions(distributor: TaskDistributor) {
  // Register session for agent 1 with client affinity
  distributor.registerBrowserSession(
    'bb_session_12345',
    'agent_001',
    'client_acme_001'
  );

  // Register session for agent 2
  distributor.registerBrowserSession(
    'bb_session_67890',
    'agent_002',
    'client_techco_002'
  );

  console.log('Browser sessions registered');
}

/**
 * Example 5: Distribute tasks to available agents
 */
async function distributeTasks(distributor: TaskDistributor, agents: AgentState[]) {
  const assignedCount = await distributor.distributeTasks(agents);
  console.log(`Assigned ${assignedCount} tasks to agents`);
}

/**
 * Example 6: Handle task completion
 */
async function completeTask(distributor: TaskDistributor, taskId: string) {
  const result = {
    taskId: {
      id: taskId,
      swarmId: 'swarm_123',
      sequence: 1,
      priority: 2,
    },
    status: 'completed' as const,
    output: {
      contactId: 'contact_new_123',
      success: true,
      message: 'Contact created successfully',
    },
    executionTime: 3500,
    resourcesUsed: {
      cpu: 0.2,
      memory: 128,
      disk: 0,
    },
    quality: 0.95,
  };

  await distributor.completeTask(taskId, result);
}

/**
 * Example 7: Handle task failure (will trigger retry)
 */
async function failTask(distributor: TaskDistributor, taskId: string, task: TaskDefinition) {
  await distributor.failTask(
    taskId,
    task,
    'Network timeout while creating contact'
  );
  // Task will automatically retry with exponential backoff
}

/**
 * Example 8: Monitor queue status
 */
function monitorQueueStatus(distributor: TaskDistributor) {
  const status = distributor.getQueueStatus();

  console.log('Queue Status:', {
    queueLength: status.queueLength,
    activeAssignments: status.activeAssignments,
    activeBatches: status.activeBatches,
    activeSessions: status.activeSessions,
    failedTasksAwaitingRetry: status.failedTasksAwaitingRetry,
    tasksByPriority: status.tasksByPriority,
    tasksByGHLOperation: status.tasksByGHLOperation,
    sessionHealth: status.sessionHealth,
  });
}

/**
 * Example 9: Get batch results
 */
function getBatchResults(distributor: TaskDistributor, batchId: string) {
  const results = distributor.getBatchResults(batchId);

  if (results) {
    console.log('Batch Results:', {
      batchId: results.batchId,
      totalTasks: results.taskIds.length,
      successCount: results.successCount,
      failureCount: results.failureCount,
      totalExecutionTime: results.totalExecutionTime,
      consolidatedOutput: results.consolidatedOutput,
    });
  }
}

/**
 * Example 10: Cleanup stale sessions
 */
function cleanupSessions(distributor: TaskDistributor) {
  distributor.cleanupStaleSessions();
  console.log('Stale sessions cleaned up');
}

/**
 * Complete workflow example
 */
async function completeWorkflowExample() {
  // 1. Initialize
  const distributor = initializeDistributor();

  // 2. Register browser sessions
  registerBrowserSessions(distributor);

  // 3. Queue various tasks
  await queueContactCreation(distributor);
  await queueBatchedTagOperations(distributor);

  // 4. Monitor status
  monitorQueueStatus(distributor);

  // 5. Setup periodic cleanup
  setInterval(() => {
    cleanupSessions(distributor);
  }, 60000); // Every minute

  console.log('Workflow setup complete');
}

// Export examples
export {
  initializeDistributor,
  queueContactCreation,
  queueBatchedTagOperations,
  registerBrowserSessions,
  distributeTasks,
  completeTask,
  failTask,
  monitorQueueStatus,
  getBatchResults,
  cleanupSessions,
  completeWorkflowExample,
};
