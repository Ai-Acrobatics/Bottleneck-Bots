/**
 * Tools Router Type Definitions
 * Shared types for the Tools Execution Engine
 */

import type { ToolCategory } from '../../mcp/types';

/**
 * Tool execution status
 */
export type ToolExecutionStatus = 'running' | 'success' | 'failed' | 'cancelled';

/**
 * Tool execution record
 */
export interface ToolExecution {
  id: string;
  toolName: string;
  category: ToolCategory;
  arguments: Record<string, unknown>;
  status: ToolExecutionStatus;
  startTime: Date;
  endTime?: Date;
  result?: unknown;
  error?: string;
  userId: string;
  sessionId?: string;
  executionTime?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Tool definition with metadata
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  category: ToolCategory;
  tags?: string[];
  deprecated?: boolean;
  version?: string;
}

/**
 * Tool execution options
 */
export interface ToolExecutionOptions {
  name: string;
  arguments?: Record<string, unknown>;
  timeout?: number;
  context?: {
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  success: boolean;
  executionId: string;
  result: unknown;
  toolName: string;
  executionTime: number;
  timestamp: Date;
}

/**
 * Tool metrics for a specific tool
 */
export interface ToolMetrics {
  totalInvocations: number;
  successfulInvocations: number;
  failedInvocations: number;
  averageExecutionTime: number;
  lastInvoked?: Date;
}

/**
 * User-specific tool statistics
 */
export interface UserToolStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  cancelledExecutions: number;
  averageExecutionTime: number;
}

/**
 * Tool history query filters
 */
export interface ToolHistoryFilters {
  toolName?: string;
  category?: ToolCategory;
  limit?: number;
  offset?: number;
  status?: ToolExecutionStatus;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Tool history response
 */
export interface ToolHistoryResponse {
  success: boolean;
  executions: ToolExecution[];
  totalCount: number;
  limit: number;
  offset: number;
  stats: {
    total: number;
    success: number;
    failed: number;
    cancelled: number;
    averageExecutionTime: number;
  };
}

/**
 * Active execution info (lightweight)
 */
export interface ActiveExecutionInfo {
  id: string;
  toolName: string;
  category: string;
  status: string;
  startTime: Date;
  runningTime: number;
}

/**
 * Tool list filters
 */
export interface ToolListFilters {
  category?: ToolCategory;
  tags?: string[];
  includeDeprecated?: boolean;
  search?: string;
}

/**
 * Categorized tools response
 */
export interface CategorizedToolsResponse {
  success: boolean;
  tools: ToolDefinition[];
  categorizedTools: Record<string, ToolDefinition[]>;
  totalCount: number;
  categories: string[];
}

/**
 * Tool details response
 */
export interface ToolDetailsResponse {
  success: boolean;
  tool: {
    name: string;
    description: string;
    inputSchema: object;
    category: string;
  };
  metrics: ToolMetrics;
  userStats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    lastExecuted?: Date;
    averageExecutionTime: number;
  };
}

/**
 * Tool metrics response
 */
export interface ToolMetricsResponse {
  success: boolean;
  registryMetrics: ToolMetrics | { totalTools: number };
  activeExecutions: number;
  userStats: UserToolStats;
  categoryStats: Record<string, number>;
  toolUsageStats: Record<string, number>;
  mostUsedTools: Array<{ tool: string; count: number }>;
  timestamp: Date;
}
