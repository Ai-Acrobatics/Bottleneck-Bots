/**
 * GHL Workflows Index
 * Central export point for all GoHighLevel automation workflows
 */

// Login and authentication
export {
  ghlLogin,
  ghlLogout,
  isGHLLoggedIn,
  ghlLoginSchema,
  type GHLLoginCredentials,
  type GHLLoginResult,
} from "./login";

// Data extraction
export {
  extractContacts,
  extractWorkflows,
  extractPipelines,
  extractDashboardMetrics,
  extractContactDetails,
  extractCampaignStats,
  contactSchema,
  workflowSchema,
  pipelineSchema,
  type GHLContact,
  type GHLWorkflow,
  type GHLPipeline,
} from "./extract";

// Workflow types for external use
export type GHLWorkflowType =
  | "login"
  | "extractContacts"
  | "extractWorkflows"
  | "extractPipelines"
  | "extractDashboard"
  | "extractCampaigns"
  | "custom";

// Workflow execution configuration
export interface GHLWorkflowConfig {
  workflowType: GHLWorkflowType;
  credentials?: {
    email: string;
    password: string;
    locationId?: string;
    twoFactorCode?: string;
  };
  options?: Record<string, any>;
}

// Workflow execution result
export interface GHLWorkflowResult {
  success: boolean;
  workflowType: GHLWorkflowType;
  data?: any;
  error?: string;
  sessionId?: string;
  executionTime?: number;
}
