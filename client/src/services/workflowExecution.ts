/**
 * Workflow Execution Service
 * Handles workflow execution, validation, and monitoring
 */

import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecutionResult,
  StepResult,
  WorkflowNodeData,
} from '@/types/workflow';

/**
 * Validate workflow before execution
 */
export function validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if workflow has nodes
  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push('Workflow must have at least one node');
  }

  // Check for disconnected nodes (except start nodes)
  const connectedNodeIds = new Set<string>();
  workflow.edges.forEach((edge) => {
    connectedNodeIds.add(edge.target);
    connectedNodeIds.add(edge.source);
  });

  workflow.nodes.forEach((node) => {
    if (!connectedNodeIds.has(node.id) && node.data.type !== 'navigate') {
      errors.push(`Node "${node.data.label}" is not connected`);
    }
  });

  // Validate node configurations
  workflow.nodes.forEach((node) => {
    const nodeErrors = validateNode(node);
    errors.push(...nodeErrors);
  });

  // Check for cycles (basic check)
  if (hasCycle(workflow.nodes, workflow.edges)) {
    errors.push('Workflow contains a cycle without a loop node');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate individual node configuration
 */
function validateNode(node: WorkflowNode): string[] {
  const errors: string[] = [];
  const data = node.data;

  switch (data.type) {
    case 'navigate':
      if (!data.url || !isValidUrl(data.url)) {
        errors.push(`Navigate node "${data.label}" has invalid URL`);
      }
      break;

    case 'click':
    case 'input':
      if (!data.selector) {
        errors.push(`${data.type} node "${data.label}" is missing selector`);
      }
      break;

    case 'extract':
      if (!data.selector) {
        errors.push(`Extract node "${data.label}" is missing selector`);
      }
      if (!data.variableName) {
        errors.push(`Extract node "${data.label}" is missing variable name`);
      }
      break;

    case 'wait':
      if (data.waitCondition === 'time' && (!data.duration || data.duration <= 0)) {
        errors.push(`Wait node "${data.label}" has invalid duration`);
      }
      if (data.waitCondition === 'element' && !data.selector) {
        errors.push(`Wait node "${data.label}" is missing selector`);
      }
      break;

    case 'condition':
      if (!data.variable) {
        errors.push(`Condition node "${data.label}" is missing variable`);
      }
      break;

    case 'loop':
      if (data.loopType === 'count' && (!data.iterations || data.iterations <= 0)) {
        errors.push(`Loop node "${data.label}" has invalid iteration count`);
      }
      if (data.loopType === 'foreach' && !data.arrayVariable) {
        errors.push(`Loop node "${data.label}" is missing array variable`);
      }
      break;

    case 'api_call':
      if (!data.url || !isValidUrl(data.url)) {
        errors.push(`API Call node "${data.label}" has invalid URL`);
      }
      if (!data.variableName) {
        errors.push(`API Call node "${data.label}" is missing variable name`);
      }
      break;

    case 'variable':
      if (!data.variableName) {
        errors.push(`Variable node "${data.label}" is missing variable name`);
      }
      break;
  }

  return errors;
}

/**
 * Check if URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check for cycles in workflow
 */
function hasCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adjacencyList = new Map<string, string[]>();

  // Build adjacency list
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  edges.forEach((edge) => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        // Check if this is a valid loop
        const node = nodes.find((n) => n.id === neighbor);
        if (node?.data.type !== 'loop') {
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

/**
 * Get execution order of nodes (topological sort)
 */
export function getExecutionOrder(workflow: Workflow): WorkflowNode[] {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  workflow.nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph
  workflow.edges.forEach((edge) => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  const order: WorkflowNode[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (node) order.push(node);

    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach((neighbor) => {
      const degree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, degree);
      if (degree === 0) {
        queue.push(neighbor);
      }
    });
  }

  return order;
}

/**
 * Estimate workflow execution time
 */
export function estimateExecutionTime(workflow: Workflow): number {
  let totalTime = 0;

  workflow.nodes.forEach((node) => {
    const data = node.data;

    switch (data.type) {
      case 'navigate':
        totalTime += data.timeout || 30000;
        break;
      case 'wait':
        totalTime += data.duration || 1000;
        break;
      case 'click':
      case 'input':
        totalTime += 1000; // Assume 1 second per action
        break;
      case 'extract':
        totalTime += 2000; // Assume 2 seconds per extraction
        break;
      case 'loop':
        totalTime += (data.iterations || 1) * 5000; // Assume 5 seconds per iteration
        break;
      case 'api_call':
        totalTime += 3000; // Assume 3 seconds per API call
        break;
      default:
        totalTime += 500; // Default 500ms
    }
  });

  return totalTime;
}

/**
 * Convert workflow execution time to human-readable format
 */
export function formatExecutionTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Dry run workflow (validation + execution plan)
 */
export function dryRunWorkflow(workflow: Workflow): {
  valid: boolean;
  errors: string[];
  executionOrder: WorkflowNode[];
  estimatedTime: number;
  nodeCount: number;
  edgeCount: number;
} {
  const validation = validateWorkflow(workflow);
  const executionOrder = getExecutionOrder(workflow);
  const estimatedTime = estimateExecutionTime(workflow);

  return {
    valid: validation.valid,
    errors: validation.errors,
    executionOrder,
    estimatedTime,
    nodeCount: workflow.nodes.length,
    edgeCount: workflow.edges.length,
  };
}

/**
 * Execute workflow (placeholder - actual execution happens on backend)
 */
export async function executeWorkflow(
  workflow: Workflow,
  variables?: Record<string, any>
): Promise<WorkflowExecutionResult> {
  // Validate first
  const validation = validateWorkflow(workflow);
  if (!validation.valid) {
    throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
  }

  // PLACEHOLDER: This would actually call the backend API
  // For now, return mock execution result
  console.log('[Workflow Execution] Starting workflow:', workflow.name);
  console.log('[Workflow Execution] Variables:', variables);

  return {
    workflowId: workflow.id || 0,
    status: 'completed',
    input: variables,
    output: {
      message: 'Workflow execution is a placeholder. Backend integration required.',
    },
    stepResults: [],
    startedAt: new Date(),
    completedAt: new Date(),
    duration: 0,
  };
}
