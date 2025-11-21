/**
 * Browser Automation Components
 * Production-ready React components for browser automation system
 */

export { BrowserSessionManager } from './BrowserSessionManager';
export { SessionLiveView } from './SessionLiveView';
export { WorkflowBuilder } from './WorkflowBuilder';
export { SessionMetrics } from './SessionMetrics';
export { BrowserSessionCard } from './BrowserSessionCard';
export { BrowserControlToolbar } from './BrowserControlToolbar';
export { LiveBrowserView } from './LiveBrowserView';

export type {
  BrowserSession,
  BrowserSessionStatus,
  WorkflowStep,
  WorkflowTemplate,
  WorkflowStepType,
  SessionMetric,
  AggregatedMetrics,
  BrowserAction,
  BrowserActionType,
  LiveViewState,
  SessionFilter,
  SessionSortField,
  SessionSortOrder,
} from './types';
