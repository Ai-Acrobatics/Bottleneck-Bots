/**
 * Workflow API integration with database
 * Connects the workflow builder with the backend tRPC API
 */

import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowExecutionResult } from '@/types/workflow';
import { trpcClient } from '@/lib/trpc';

/**
 * Step type mapping from ReactFlow node types to backend step types
 */
type BackendStepType = 'navigate' | 'act' | 'observe' | 'extract' | 'wait' | 'condition' | 'loop' | 'apiCall' | 'notification';

/**
 * Map ReactFlow node type to backend step type
 */
function mapNodeTypeToStepType(nodeType: string): BackendStepType {
  const typeMap: Record<string, BackendStepType> = {
    'navigate': 'navigate',
    'click': 'act',
    'input': 'act',
    'scroll': 'act',
    'extract': 'extract',
    'wait': 'wait',
    'condition': 'condition',
    'loop': 'loop',
    'api_call': 'apiCall',
    'variable': 'act',
    'transform': 'act',
    'screenshot': 'observe',
  };
  return typeMap[nodeType] || 'act';
}

/**
 * Convert ReactFlow nodes to backend step format
 */
function nodesToSteps(nodes: WorkflowNode[]) {
  return nodes.map((node, index) => ({
    type: mapNodeTypeToStepType(node.data.type) as BackendStepType,
    order: index,
    config: {
      // Navigation
      url: 'url' in node.data ? node.data.url : undefined,
      // Action
      instruction: node.data.label,
      // Observation
      observeInstruction: node.data.description,
      // Extraction
      extractInstruction: 'extractType' in node.data ? node.data.label : undefined,
      schemaType: 'custom' as const,
      // Wait
      waitMs: 'duration' in node.data ? node.data.duration : undefined,
      selector: 'selector' in node.data ? node.data.selector : undefined,
      // Condition
      condition: 'condition' in node.data ? node.data.condition : undefined,
      // Loop
      items: 'arrayVariable' in node.data ? [] : undefined,
      // API Call
      method: 'method' in node.data ? node.data.method : undefined,
      headers: 'headers' in node.data ? node.data.headers : undefined,
      body: 'body' in node.data ? node.data.body : undefined,
      saveAs: 'variableName' in node.data ? node.data.variableName : undefined,
      // Notification
      message: node.data.description,
      type: 'info' as const,
      // Common
      continueOnError: node.data.errorHandling?.continueOnError || false,
    },
  }));
}

/**
 * Convert ReactFlow format to database format
 */
function workflowToDbFormat(workflow: Workflow) {
  return {
    name: workflow.name,
    description: workflow.description,
    steps: nodesToSteps(workflow.nodes),
  };
}

/**
 * Convert database format to ReactFlow format
 */
function dbToWorkflowFormat(dbWorkflow: any): Workflow {
  return {
    id: dbWorkflow.id,
    userId: dbWorkflow.userId,
    name: dbWorkflow.name,
    description: dbWorkflow.description,
    category: dbWorkflow.category,
    nodes: dbWorkflow.steps || [],
    edges: dbWorkflow.edges || [],
    version: dbWorkflow.version || 1,
    isTemplate: dbWorkflow.isTemplate || false,
    tags: dbWorkflow.tags || [],
    variables: {},
    createdAt: dbWorkflow.createdAt,
    updatedAt: dbWorkflow.updatedAt,
  };
}

/**
 * Save workflow to database
 * Creates a new workflow if no ID exists, otherwise updates the existing one
 */
export async function saveWorkflow(workflow: Workflow): Promise<Workflow> {
  try {
    const dbFormat = workflowToDbFormat(workflow);

    if (workflow.id) {
      // Update existing workflow
      const result = await trpcClient.workflows.update.mutate({
        id: workflow.id,
        name: dbFormat.name,
        description: dbFormat.description,
        steps: dbFormat.steps,
      });

      console.log('[Workflow API] Updated workflow:', result.name);
      return dbToWorkflowFormat(result);
    } else {
      // Create new workflow
      const result = await trpcClient.workflows.create.mutate({
        name: dbFormat.name,
        description: dbFormat.description,
        steps: dbFormat.steps,
        trigger: 'manual',
      });

      console.log('[Workflow API] Created workflow:', result.name);
      return dbToWorkflowFormat(result);
    }
  } catch (error) {
    console.error('[Workflow API] Failed to save workflow:', error);
    throw error;
  }
}

/**
 * Load workflow from database by ID
 */
export async function loadWorkflow(workflowId: number): Promise<Workflow> {
  try {
    const result = await trpcClient.workflows.get.query({ id: workflowId });

    console.log('[Workflow API] Loaded workflow:', result.name);
    return dbToWorkflowFormat(result);
  } catch (error) {
    console.error('[Workflow API] Failed to load workflow:', error);
    throw error;
  }
}

/**
 * Get all workflows for current user
 * Returns workflows as a record keyed by workflow ID
 */
export async function getAllWorkflows(): Promise<Record<number, Workflow>> {
  try {
    const result = await trpcClient.workflows.list.query({ limit: 100, offset: 0 });

    const workflows = result.reduce<Record<number, Workflow>>((acc, w) => {
      acc[w.id] = dbToWorkflowFormat(w);
      return acc;
    }, {});

    console.log('[Workflow API] Loaded', Object.keys(workflows).length, 'workflows');
    return workflows;
  } catch (error) {
    console.error('[Workflow API] Failed to get workflows:', error);
    return {};
  }
}

/**
 * Get all workflows as an array
 * Useful for list views and iteration
 */
export async function listWorkflows(options?: {
  status?: 'active' | 'paused' | 'archived';
  limit?: number;
  offset?: number;
}): Promise<Workflow[]> {
  try {
    const result = await trpcClient.workflows.list.query({
      status: options?.status,
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
    });

    console.log('[Workflow API] Listed', result.length, 'workflows');
    return result.map(dbToWorkflowFormat);
  } catch (error) {
    console.error('[Workflow API] Failed to list workflows:', error);
    return [];
  }
}

/**
 * Delete workflow from database (soft delete - archives the workflow)
 */
export async function deleteWorkflow(workflowId: number): Promise<void> {
  try {
    await trpcClient.workflows.delete.mutate({ id: workflowId });
    console.log('[Workflow API] Deleted workflow:', workflowId);
  } catch (error) {
    console.error('[Workflow API] Failed to delete workflow:', error);
    throw error;
  }
}

/**
 * Execute workflow on the backend
 * Creates a browser session and runs all workflow steps
 */
export async function executeWorkflow(
  workflowId: number,
  options?: {
    variables?: Record<string, any>;
    geolocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
  }
): Promise<WorkflowExecutionResult> {
  try {
    const result = await trpcClient.workflows.execute.mutate({
      workflowId,
      variables: options?.variables,
      geolocation: options?.geolocation,
    });

    console.log('[Workflow API] Executed workflow:', workflowId, 'execution:', result.executionId);
    return {
      id: result.executionId,
      workflowId: result.workflowId,
      status: result.status as WorkflowExecutionResult['status'],
      output: result.output as Record<string, any> | undefined,
      stepResults: result.stepResults as any,
    };
  } catch (error) {
    console.error('[Workflow API] Failed to execute workflow:', error);
    throw error;
  }
}

/**
 * List workflow executions for a specific workflow
 */
export async function getWorkflowExecutions(
  workflowId: number,
  options?: {
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    limit?: number;
    offset?: number;
  }
): Promise<WorkflowExecutionResult[]> {
  try {
    const result = await trpcClient.workflows.getExecutions.query({
      workflowId,
      status: options?.status,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });

    console.log('[Workflow API] Got', result.length, 'executions for workflow:', workflowId);
    return result.map((exec) => ({
      id: exec.id,
      workflowId: exec.workflowId,
      status: exec.status as WorkflowExecutionResult['status'],
      output: exec.output as Record<string, any> | undefined,
      error: exec.error ?? undefined,
      stepResults: exec.stepResults as any,
      startedAt: exec.startedAt ?? undefined,
      completedAt: exec.completedAt ?? undefined,
    }));
  } catch (error) {
    console.error('[Workflow API] Failed to get executions:', error);
    return [];
  }
}

/**
 * Get a single execution by ID
 */
export async function getExecution(executionId: number): Promise<WorkflowExecutionResult | null> {
  try {
    const result = await trpcClient.workflows.getExecution.query({ executionId });

    console.log('[Workflow API] Got execution:', executionId);
    return {
      id: result.executionId,
      workflowId: result.workflowId,
      status: result.status as WorkflowExecutionResult['status'],
      output: result.output as Record<string, any> | undefined,
      error: result.error ?? undefined,
      stepResults: result.stepResults as any,
    };
  } catch (error) {
    console.error('[Workflow API] Failed to get execution:', error);
    return null;
  }
}

/**
 * Cancel a running workflow execution
 */
export async function cancelExecution(executionId: number): Promise<boolean> {
  try {
    await trpcClient.workflows.cancelExecution.mutate({ executionId });
    console.log('[Workflow API] Cancelled execution:', executionId);
    return true;
  } catch (error) {
    console.error('[Workflow API] Failed to cancel execution:', error);
    return false;
  }
}

/**
 * Test run a workflow without saving to database
 * Useful for previewing workflow behavior before saving
 */
export async function testRunWorkflow(
  nodes: WorkflowNode[],
  options?: {
    variables?: Record<string, any>;
    geolocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
    stepByStep?: boolean;
  }
): Promise<{
  success: boolean;
  status: string;
  stepResults?: any[];
  output?: Record<string, any>;
  error?: string;
}> {
  try {
    const steps = nodesToSteps(nodes);

    const result = await trpcClient.workflows.testRun.mutate({
      steps,
      variables: options?.variables,
      geolocation: options?.geolocation,
      stepByStep: options?.stepByStep ?? false,
    });

    console.log('[Workflow API] Test run completed with status:', result.status);
    return {
      success: result.success,
      status: result.status,
      stepResults: result.stepResults,
      output: result.output as Record<string, any> | undefined,
      error: result.error,
    };
  } catch (error) {
    console.error('[Workflow API] Failed to test run workflow:', error);
    throw error;
  }
}
