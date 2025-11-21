/**
 * Shared types and schemas for browser automation components
 */

import { z } from 'zod';

// Browser Session Types
export const BrowserSessionStatus = z.enum(['running', 'completed', 'failed', 'expired', 'pending']);
export type BrowserSessionStatus = z.infer<typeof BrowserSessionStatus>;

export const BrowserSessionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  url: z.string().optional(),
  status: BrowserSessionStatus,
  debugUrl: z.string().optional(),
  recordingUrl: z.string().optional(),
  liveViewUrl: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export type BrowserSession = z.infer<typeof BrowserSessionSchema>;

// Workflow Types
export const WorkflowStepType = z.enum(['navigate', 'act', 'observe', 'extract', 'wait', 'custom']);
export type WorkflowStepType = z.infer<typeof WorkflowStepType>;

export const WorkflowStepSchema = z.object({
  id: z.string(),
  type: WorkflowStepType,
  order: z.number(),
  label: z.string(),
  config: z.record(z.any()),
  enabled: z.boolean().default(true),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(WorkflowStepSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()).optional(),
});

export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;

// Session Metrics Types
export const SessionMetricSchema = z.object({
  sessionId: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number(),
  status: BrowserSessionStatus,
  stepsCompleted: z.number(),
  stepsTotal: z.number(),
  errorCount: z.number(),
  successRate: z.number(),
  resourceUsage: z.object({
    cpu: z.number().optional(),
    memory: z.number().optional(),
    bandwidth: z.number().optional(),
  }).optional(),
  cost: z.number().optional(),
});

export type SessionMetric = z.infer<typeof SessionMetricSchema>;

export const AggregatedMetricsSchema = z.object({
  totalSessions: z.number(),
  runningSessions: z.number(),
  completedSessions: z.number(),
  failedSessions: z.number(),
  averageDuration: z.number(),
  successRate: z.number(),
  totalCost: z.number(),
  averageCost: z.number(),
  timeRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export type AggregatedMetrics = z.infer<typeof AggregatedMetricsSchema>;

// Browser Control Types
export const BrowserActionType = z.enum([
  'navigate',
  'click',
  'type',
  'scroll',
  'screenshot',
  'extract',
  'wait',
  'back',
  'forward',
  'refresh',
]);

export type BrowserActionType = z.infer<typeof BrowserActionType>;

export interface BrowserAction {
  type: BrowserActionType;
  target?: string;
  value?: string | number;
  options?: Record<string, any>;
}

// Live View Types
export interface LiveViewState {
  isConnected: boolean;
  isRecording: boolean;
  screenshotUrl?: string;
  lastUpdate: string;
  fps: number;
  latency: number;
}

// Workflow Builder Types
export interface WorkflowNode extends WorkflowStep {
  position: { x: number; y: number };
  connections: string[];
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Filter and Sort Types
export const SessionFilterSchema = z.object({
  status: z.array(BrowserSessionStatus).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  search: z.string().optional(),
});

export type SessionFilter = z.infer<typeof SessionFilterSchema>;

export const SessionSortField = z.enum(['createdAt', 'completedAt', 'duration', 'status']);
export type SessionSortField = z.infer<typeof SessionSortField>;

export const SessionSortOrder = z.enum(['asc', 'desc']);
export type SessionSortOrder = z.infer<typeof SessionSortOrder>;
