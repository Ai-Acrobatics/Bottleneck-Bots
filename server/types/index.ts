/**
 * Strict Type Definitions for Agency AI
 * Centralized type safety for task execution, workflows, and automation
 */

// ========================================
// TASK TYPES
// ========================================

export type TaskType =
  | 'browser_automation'
  | 'api_call'
  | 'notification'
  | 'reminder'
  | 'ghl_action'
  | 'data_extraction'
  | 'report_generation'
  | 'custom';

export type TaskStatus =
  | 'pending'
  | 'queued'
  | 'in_progress'
  | 'waiting_input'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'deferred';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskUrgency = 'normal' | 'soon' | 'urgent' | 'immediate';

export type TaskSourceType =
  | 'webhook_sms'
  | 'webhook_email'
  | 'webhook_custom'
  | 'manual'
  | 'scheduled'
  | 'conversation';

export type ExecutionType = 'automatic' | 'manual_trigger' | 'scheduled';

// ========================================
// BROWSER AUTOMATION TYPES
// ========================================

export type BrowserActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'extract'
  | 'wait'
  | 'screenshot';

export interface BrowserAction {
  action: BrowserActionType;
  selector?: string;
  value?: string;
  waitFor?: string;
  instruction?: string;
  screenshot?: boolean;
  continueOnError?: boolean;
}

export interface AutomationStep {
  type: BrowserActionType;
  config: NavigateConfig | ClickConfig | TypeConfig | ExtractConfig | WaitConfig | ScreenshotConfig;
  screenshot?: boolean;
  continueOnError?: boolean;
}

export interface NavigateConfig {
  url: string;
}

export interface ClickConfig {
  selector?: string;
  instruction?: string;
}

export interface TypeConfig {
  selector: string;
  value: string;
}

export interface ExtractConfig {
  instruction: string;
  schema?: ExtractSchema;
}

export interface WaitConfig {
  duration?: number;
  selector?: string;
}

export interface ScreenshotConfig {
  path?: string;
  encoding?: 'base64' | 'binary';
}

export interface ExtractSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface BrowserAutomationConfig {
  url?: string;
  actions?: BrowserAction[];
  automationSteps?: AutomationStep[];
  waitForSelector?: string;
  timeout?: number;
}

// ========================================
// API CALL TYPES
// ========================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type AuthType = 'bearer' | 'api_key' | 'basic' | 'none';

export interface ApiAuthConfig {
  type: AuthType;
  bearerToken?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  username?: string;
  password?: string;
}

export interface ApiCallConfig {
  apiEndpoint: string;
  apiMethod?: HttpMethod;
  apiPayload?: unknown;
  authType?: AuthType;
  bearerToken?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  username?: string;
  password?: string;
  customHeaders?: Record<string, string>;
  timeout?: number;
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export type NotificationType = 'email' | 'sms' | 'webhook' | 'in_app';

export interface NotificationConfig {
  recipient: string;
  message?: string;
  type?: NotificationType;
  channels?: NotificationType[];
}

// ========================================
// REMINDER TYPES
// ========================================

export interface ReminderConfig {
  reminderTime: string | Date;
  reminderMessage: string;
  recipient?: string;
}

// ========================================
// GHL ACTION TYPES
// ========================================

export type GhlActionType =
  | 'add_contact'
  | 'send_sms'
  | 'create_opportunity'
  | 'add_tag'
  | 'update_contact';

export interface GhlBaseConfig {
  ghlAction: GhlActionType;
  locationId?: string;
}

export interface GhlAddContactConfig extends GhlBaseConfig {
  ghlAction: 'add_contact';
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  customFields?: Record<string, unknown>;
}

export interface GhlSendSmsConfig extends GhlBaseConfig {
  ghlAction: 'send_sms';
  contactId: string;
  message: string;
}

export interface GhlCreateOpportunityConfig extends GhlBaseConfig {
  ghlAction: 'create_opportunity';
  pipelineId: string;
  opportunityName: string;
  contactId: string;
  status?: string;
  monetaryValue?: number;
}

export interface GhlAddTagConfig extends GhlBaseConfig {
  ghlAction: 'add_tag';
  contactId: string;
  tags: string | string[];
}

export interface GhlUpdateContactConfig extends GhlBaseConfig {
  ghlAction: 'update_contact';
  contactId: string;
  updateData: Record<string, unknown>;
}

export type GhlActionConfig =
  | GhlAddContactConfig
  | GhlSendSmsConfig
  | GhlCreateOpportunityConfig
  | GhlAddTagConfig
  | GhlUpdateContactConfig;

// ========================================
// REPORT GENERATION TYPES
// ========================================

export type ReportType = 'task_summary' | 'execution_stats' | 'webhook_activity';

export interface ReportConfig {
  reportType: ReportType;
  startDate?: string | Date;
  endDate?: string | Date;
  limit?: number;
  sendNotification?: boolean;
  recipient?: string;
}

// ========================================
// TASK EXECUTION CONFIG (DISCRIMINATED UNION)
// ========================================

export type TaskExecutionConfig =
  | { type: 'browser_automation'; config: BrowserAutomationConfig }
  | { type: 'api_call'; config: ApiCallConfig }
  | { type: 'notification'; config: NotificationConfig }
  | { type: 'reminder'; config: ReminderConfig }
  | { type: 'ghl_action'; config: GhlActionConfig }
  | { type: 'data_extraction'; config: BrowserAutomationConfig }
  | { type: 'report_generation'; config: ReportConfig }
  | { type: 'custom'; config: Record<string, unknown> };

// Backward compatibility - legacy config object
export interface LegacyTaskExecutionConfig {
  workflowId?: number;
  automationSteps?: AutomationStep[];
  apiEndpoint?: string;
  apiMethod?: HttpMethod;
  apiPayload?: unknown;
  browserActions?: BrowserAction[];
  timeout?: number;
  retryCount?: number;
  [key: string]: unknown;
}

// ========================================
// EXECUTION RESULT TYPES
// ========================================

export interface ExecutionResult {
  success: boolean;
  output?: {
    message?: string;
    steps?: unknown[];
    [key: string]: unknown;
  };
  error?: string;
  duration?: number;
  screenshots?: string[];
}

export interface StepResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

// ========================================
// WORKFLOW TYPES
// ========================================

export type WorkflowStepType =
  | 'navigate'
  | 'act'
  | 'observe'
  | 'extract'
  | 'wait'
  | 'condition'
  | 'loop'
  | 'apiCall'
  | 'notification';

export interface WorkflowStep {
  type: WorkflowStepType;
  order: number;
  config: WorkflowStepConfig;
}

export type WorkflowStepConfig =
  | NavigateStepConfig
  | ActStepConfig
  | ObserveStepConfig
  | ExtractStepConfig
  | WaitStepConfig
  | ConditionStepConfig
  | LoopStepConfig
  | ApiCallStepConfig
  | NotificationStepConfig;

export interface NavigateStepConfig {
  type: 'navigate';
  url: string;
  saveAs?: string;
  continueOnError?: boolean;
}

export interface ActStepConfig {
  type: 'act';
  instruction: string;
  saveAs?: string;
  continueOnError?: boolean;
}

export interface ObserveStepConfig {
  type: 'observe';
  observeInstruction: string;
  saveAs?: string;
  continueOnError?: boolean;
}

export interface ExtractStepConfig {
  type: 'extract';
  extractInstruction: string;
  schemaType?: 'contactInfo' | 'productInfo' | 'custom';
  saveAs?: string;
  continueOnError?: boolean;
}

export interface WaitStepConfig {
  type: 'wait';
  waitMs?: number;
  selector?: string;
  saveAs?: string;
  continueOnError?: boolean;
}

export interface ConditionStepConfig {
  type: 'condition';
  condition: string;
  saveAs?: string;
  continueOnError?: boolean;
}

export interface LoopStepConfig {
  type: 'loop';
  items: unknown[];
  saveAs?: string;
  continueOnError?: boolean;
}

export interface ApiCallStepConfig {
  type: 'apiCall';
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  saveAs?: string;
  continueOnError?: boolean;
}

export interface NotificationStepConfig {
  type: 'notification';
  message: string;
  notificationType?: NotificationType;
  saveAs?: string;
  continueOnError?: boolean;
}

// ========================================
// EXECUTION CONTEXT TYPES
// ========================================

export interface ExecutionContext {
  workflowId: number;
  executionId: number;
  userId: number;
  sessionId: string;
  stagehand: any; // Stagehand type from @browserbasehq/stagehand
  variables: Record<string, unknown>;
  stepResults: Array<{
    stepIndex: number;
    type: string;
    success: boolean;
    result?: unknown;
    error?: string;
    timestamp: Date;
  }>;
  extractedData: Array<{
    url: string;
    dataType: string;
    data: unknown;
  }>;
}

export interface ExecutionStatus {
  executionId: number;
  workflowId: number;
  status: string;
  startedAt?: Date;
  completedAt?: Date;
  currentStep?: number;
  stepResults?: unknown[];
  output?: unknown;
  error?: string;
}

export interface ExecuteWorkflowOptions {
  workflowId: number;
  userId: number;
  variables?: Record<string, unknown>;
  geolocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

// ========================================
// TYPE GUARDS
// ========================================

export function isBrowserAutomationConfig(
  config: unknown
): config is BrowserAutomationConfig {
  if (!config || typeof config !== 'object') return false;
  const cfg = config as any;
  return Boolean(cfg.browserActions || cfg.automationSteps);
}

export function isApiCallConfig(config: unknown): config is ApiCallConfig {
  if (!config || typeof config !== 'object') return false;
  const cfg = config as any;
  return Boolean(cfg.apiEndpoint);
}

export function isNotificationConfig(config: unknown): config is NotificationConfig {
  if (!config || typeof config !== 'object') return false;
  const cfg = config as any;
  return Boolean(cfg.recipient);
}

export function isReminderConfig(config: unknown): config is ReminderConfig {
  if (!config || typeof config !== 'object') return false;
  const cfg = config as any;
  return Boolean(cfg.reminderTime);
}

export function isGhlActionConfig(config: unknown): config is GhlActionConfig {
  if (!config || typeof config !== 'object') return false;
  const cfg = config as any;
  return Boolean(cfg.ghlAction);
}

export function isReportConfig(config: unknown): config is ReportConfig {
  if (!config || typeof config !== 'object') return false;
  const cfg = config as any;
  return Boolean(cfg.reportType);
}

// ========================================
// UTILITY TYPES
// ========================================

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type StringKeys<T> = Extract<keyof T, string>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
