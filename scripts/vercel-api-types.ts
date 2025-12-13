/**
 * Vercel API Type Definitions
 * Comprehensive type definitions for Vercel API responses
 */

export interface VercelDeploymentGitSource {
  type: string;
  org?: string;
  repo?: string;
  ref?: string;
  sha?: string;
  repoId?: string;
  prId?: number | null;
}

export interface VercelDeploymentFunction {
  name: string;
  duration?: number;
  memory?: number;
  status?: string;
  cpus?: string;
  log?: string;
}

export interface VercelDeploymentMetadata {
  deploymentHostname?: string;
  environment?: 'production' | 'preview' | 'development';
  customEnvironment?: string;
  socialImage?: string | null;
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  target?: string | null;
  state: string;
  description: string | null;
  preview?: string;
  aliasAssigned?: number | boolean;
  aliasError?: string | null;
  creator: {
    uid: string;
    email: string;
    username: string;
    githubLogin?: string;
    gitlabLogin?: string;
    bitbucketLogin?: string;
  };
  team?: {
    id: string;
    slug: string;
    name: string;
  };
  created: number;
  updated?: number;
  buildingAt?: number;
  readyAt?: number;
  createdAt?: number;
  source?: VercelDeploymentGitSource | null;
  inspectorUrl: string | null;
  isRollbackCandidate?: boolean;
  buildLogs?: Array<{
    text: string;
    timestamp: number;
    stream?: 'stdout' | 'stderr';
  }>;
  functions?: VercelDeploymentFunction[];
  meta?: Record<string, string>;
  version?: number;
  projectId?: string;
  metadata?: VercelDeploymentMetadata;
}

export interface VercelDeploymentsResponse {
  deployments: VercelDeployment[];
  pagination?: {
    count: number;
    next?: number;
    prev?: number;
  };
}

export interface VercelDeploymentEvent {
  id?: string;
  type: string;
  timestamp: number;
  text?: string;
  data?: Record<string, unknown>;
  state?: string;
}

export interface DeploymentCheckResult {
  deploymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'BUILDING' | 'QUEUED' | 'ERROR';
  url: string;
  state: string;
  createdAt: Date;
  completedAt?: Date;
  creator: string;
  branch?: string;
  commit?: string;
  duration?: number;
  buildErrors: string[];
  buildWarnings: string[];
  functionDetails?: VercelDeploymentFunction[];
  isProduction: boolean;
  aliasUrl?: string;
  inspectorUrl?: string | null;
  metadata?: {
    environment?: string;
    socialImage?: string | null;
  };
}

export interface DeploymentCheckerConfig {
  accessToken: string;
  projectId?: string;
  teamId?: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface DeploymentFilterOptions {
  limit?: number;
  since?: number;
  until?: number;
  state?: string;
  target?: string;
  production?: boolean;
  environment?: string;
}
