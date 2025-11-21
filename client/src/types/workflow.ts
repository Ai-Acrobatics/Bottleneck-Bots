import { Node, Edge } from 'reactflow';

/**
 * Workflow node types for automation builder
 */
export type WorkflowNodeType =
  | 'navigate'
  | 'click'
  | 'extract'
  | 'wait'
  | 'condition'
  | 'loop'
  | 'input'
  | 'scroll'
  | 'screenshot'
  | 'api_call'
  | 'variable'
  | 'transform';

/**
 * Wait condition types
 */
export type WaitCondition = 'element' | 'time' | 'network' | 'custom';

/**
 * Extract data types
 */
export type ExtractType = 'text' | 'attribute' | 'html' | 'table' | 'list' | 'custom';

/**
 * Condition operator types
 */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'exists'
  | 'not_exists';

/**
 * Base configuration for all node types
 */
export interface BaseNodeData {
  label: string;
  description?: string;
  enabled: boolean;
  errorHandling?: {
    continueOnError: boolean;
    retryCount?: number;
    retryDelay?: number;
  };
}

/**
 * Navigate node configuration
 */
export interface NavigateNodeData extends BaseNodeData {
  type: 'navigate';
  url: string;
  waitForLoad?: boolean;
  timeout?: number;
}

/**
 * Click node configuration
 */
export interface ClickNodeData extends BaseNodeData {
  type: 'click';
  selector: string;
  waitForNavigation?: boolean;
  clickCount?: number;
  delay?: number;
}

/**
 * Extract node configuration
 */
export interface ExtractNodeData extends BaseNodeData {
  type: 'extract';
  selector: string;
  extractType: ExtractType;
  attribute?: string;
  variableName: string;
  multiple?: boolean;
}

/**
 * Wait node configuration
 */
export interface WaitNodeData extends BaseNodeData {
  type: 'wait';
  waitCondition: WaitCondition;
  selector?: string;
  duration?: number;
  timeout?: number;
}

/**
 * Condition node configuration
 */
export interface ConditionNodeData extends BaseNodeData {
  type: 'condition';
  variable: string;
  operator: ConditionOperator;
  value: string;
  trueLabel?: string;
  falseLabel?: string;
}

/**
 * Loop node configuration
 */
export interface LoopNodeData extends BaseNodeData {
  type: 'loop';
  loopType: 'count' | 'while' | 'foreach';
  iterations?: number;
  condition?: string;
  arrayVariable?: string;
  itemVariable?: string;
  maxIterations?: number;
}

/**
 * Input node configuration
 */
export interface InputNodeData extends BaseNodeData {
  type: 'input';
  selector: string;
  inputType: 'text' | 'select' | 'checkbox' | 'radio' | 'file';
  value: string;
  clearFirst?: boolean;
  pressEnter?: boolean;
}

/**
 * Scroll node configuration
 */
export interface ScrollNodeData extends BaseNodeData {
  type: 'scroll';
  scrollType: 'element' | 'position' | 'bottom' | 'top';
  selector?: string;
  x?: number;
  y?: number;
}

/**
 * Screenshot node configuration
 */
export interface ScreenshotNodeData extends BaseNodeData {
  type: 'screenshot';
  fullPage?: boolean;
  selector?: string;
  filename?: string;
}

/**
 * API Call node configuration
 */
export interface ApiCallNodeData extends BaseNodeData {
  type: 'api_call';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  variableName: string;
}

/**
 * Variable node configuration
 */
export interface VariableNodeData extends BaseNodeData {
  type: 'variable';
  variableName: string;
  value: string;
  valueType: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

/**
 * Transform node configuration
 */
export interface TransformNodeData extends BaseNodeData {
  type: 'transform';
  inputVariable: string;
  outputVariable: string;
  transformType: 'map' | 'filter' | 'reduce' | 'parse' | 'format' | 'custom';
  transformFunction?: string;
}

/**
 * Union type for all node data types
 */
export type WorkflowNodeData =
  | NavigateNodeData
  | ClickNodeData
  | ExtractNodeData
  | WaitNodeData
  | ConditionNodeData
  | LoopNodeData
  | InputNodeData
  | ScrollNodeData
  | ScreenshotNodeData
  | ApiCallNodeData
  | VariableNodeData
  | TransformNodeData;

/**
 * Workflow node with ReactFlow typing
 */
export type WorkflowNode = Node<WorkflowNodeData>;

/**
 * Workflow edge with custom data
 */
export interface WorkflowEdgeData {
  label?: string;
  condition?: 'true' | 'false';
}

export type WorkflowEdge = Edge<WorkflowEdgeData>;

/**
 * Complete workflow definition
 */
export interface Workflow {
  id?: number;
  userId?: number;
  name: string;
  description?: string;
  category?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: number;
  isTemplate?: boolean;
  tags?: string[];
  variables?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  id?: number;
  workflowId: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  stepResults?: StepResult[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

/**
 * Individual step execution result
 */
export interface StepResult {
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: 'success' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  duration?: number;
  timestamp: Date;
}

/**
 * Node template for the palette
 */
export interface NodeTemplate {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: string;
  category: 'navigation' | 'interaction' | 'data' | 'control' | 'utility';
  defaultData: Partial<WorkflowNodeData>;
}
