/**
 * Vercel Deployment Checker
 * Comprehensive deployment status verification using Vercel API
 */

import {
  VercelDeployment,
  VercelDeploymentsResponse,
  VercelDeploymentEvent,
  DeploymentCheckResult,
  DeploymentCheckerConfig,
  DeploymentFilterOptions,
} from './vercel-api-types';

const VERCEL_API_BASE = 'https://api.vercel.com';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_TIMEOUT = 30000;

class DeploymentLogger {
  private isDev = process.env.NODE_ENV !== 'production';

  log(level: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;

    if (level === 'ERROR' || level === 'WARN' || this.isDev) {
      console.log(prefix, message);
      if (data) console.log(JSON.stringify(data, null, 2));
    }
  }

  info(message: string, data?: unknown): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('WARN', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('ERROR', message, data);
  }

  debug(message: string, data?: unknown): void {
    if (this.isDev) this.log('DEBUG', message, data);
  }
}

class RetryHandler {
  constructor(
    private maxRetries: number = DEFAULT_MAX_RETRIES,
    private baseDelay: number = DEFAULT_RETRY_DELAY,
    private logger: DeploymentLogger = new DeploymentLogger()
  ) {}

  async execute<T>(fn: () => Promise<T>, operationName: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`Executing ${operationName} (attempt ${attempt}/${this.maxRetries})`);
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`${operationName} failed on attempt ${attempt}/${this.maxRetries}`, lastError.message);

        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          this.logger.debug(`Retrying ${operationName} in ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${operationName} failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }
}

export class VercelDeploymentChecker {
  private accessToken: string;
  private projectId?: string;
  private teamId?: string;
  private logger: DeploymentLogger;
  private retryHandler: RetryHandler;
  private timeout: number;

  constructor(config: DeploymentCheckerConfig) {
    if (!config.accessToken) throw new Error('Vercel access token is required');

    this.accessToken = config.accessToken;
    this.projectId = config.projectId;
    this.teamId = config.teamId;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.logger = new DeploymentLogger();
    this.retryHandler = new RetryHandler(
      config.maxRetries || DEFAULT_MAX_RETRIES,
      config.retryDelay || DEFAULT_RETRY_DELAY,
      this.logger
    );
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private buildQueryParams(options?: DeploymentFilterOptions): string {
    if (!options) return '';

    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.since) params.append('since', String(options.since));
    if (options.until) params.append('until', String(options.until));
    if (options.state) params.append('state', options.state);
    if (options.target) params.append('target', options.target);
    if (options.production !== undefined) params.append('production', String(options.production));
    if (options.environment) params.append('environment', options.environment);

    return params.toString() ? `?${params.toString()}` : '';
  }

  private async executeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`API error ${response.status}: ${error.message || response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getDeployments(options?: DeploymentFilterOptions): Promise<VercelDeployment[]> {
    return this.retryHandler.execute(async () => {
      const queryParams = this.buildQueryParams(options);
      const url = `${VERCEL_API_BASE}/v6/deployments${queryParams}`;

      this.logger.debug(`Fetching deployments from ${url}`);
      const response = await this.executeRequest<VercelDeploymentsResponse>(url);
      this.logger.info(`Retrieved ${response.deployments.length} deployments`);

      return response.deployments;
    }, 'getDeployments');
  }

  async getDeploymentById(deploymentId: string): Promise<VercelDeployment> {
    return this.retryHandler.execute(async () => {
      const url = `${VERCEL_API_BASE}/v13/deployments/${deploymentId}`;
      this.logger.debug(`Fetching deployment ${deploymentId}`);
      return await this.executeRequest<VercelDeployment>(url);
    }, `getDeploymentById(${deploymentId})`);
  }

  async getDeploymentEvents(deploymentId: string): Promise<VercelDeploymentEvent[]> {
    return this.retryHandler.execute(async () => {
      const url = `${VERCEL_API_BASE}/v2/deployments/${deploymentId}/events`;
      this.logger.debug(`Fetching events for deployment ${deploymentId}`);
      const response = await this.executeRequest<{ events: VercelDeploymentEvent[] }>(url);
      return response.events;
    }, `getDeploymentEvents(${deploymentId})`);
  }

  private parseEventLogs(events: VercelDeploymentEvent[]): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const event of events) {
      const text = event.text || '';
      if (event.type === 'error' || text.toLowerCase().includes('error') || text.toLowerCase().includes('failed')) {
        errors.push(text);
      } else if (event.type === 'warning' || text.toLowerCase().includes('warning') || text.toLowerCase().includes('deprecated')) {
        warnings.push(text);
      }
    }

    return { errors, warnings };
  }

  async checkLatestDeployment(filters?: DeploymentFilterOptions): Promise<DeploymentCheckResult> {
    try {
      const deployments = await this.getDeployments({ ...filters, limit: 1 });
      if (!deployments.length) throw new Error('No deployments found');
      return this.checkDeployment(deployments[0].uid);
    } catch (error) {
      this.logger.error('Failed to check latest deployment', error);
      throw error;
    }
  }

  async checkDeployment(deploymentId: string): Promise<DeploymentCheckResult> {
    try {
      const [deployment, events] = await Promise.all([
        this.getDeploymentById(deploymentId),
        this.getDeploymentEvents(deploymentId),
      ]);

      const { errors, warnings } = this.parseEventLogs(events);
      const status = this.determineStatus(deployment.state, errors);
      const createdAt = new Date(deployment.created);
      const completedAt = deployment.readyAt || deployment.buildingAt
        ? new Date(deployment.readyAt || deployment.buildingAt || 0)
        : undefined;
      const duration = completedAt && deployment.buildingAt
        ? completedAt.getTime() - new Date(deployment.buildingAt).getTime()
        : undefined;

      const result: DeploymentCheckResult = {
        deploymentId: deployment.uid,
        status,
        url: `https://${deployment.url}`,
        state: deployment.state,
        createdAt,
        completedAt,
        creator: deployment.creator.username || deployment.creator.email,
        branch: deployment.source?.ref,
        commit: deployment.source?.sha,
        duration,
        buildErrors: errors,
        buildWarnings: warnings,
        functionDetails: deployment.functions,
        isProduction: deployment.target === 'production',
        inspectorUrl: deployment.inspectorUrl,
        metadata: deployment.metadata
          ? { environment: deployment.metadata.environment, socialImage: deployment.metadata.socialImage }
          : undefined,
      };

      if (deployment.aliasAssigned) {
        result.aliasUrl = `https://${deployment.name}.vercel.app`;
      }

      this.logger.info(`Deployment ${deploymentId} check completed`, {
        status: result.status,
        hasErrors: result.buildErrors.length > 0,
        hasWarnings: result.buildWarnings.length > 0,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to check deployment ${deploymentId}`, error);
      throw error;
    }
  }

  private determineStatus(state: string, errors: string[]): DeploymentCheckResult['status'] {
    if (state === 'READY' && errors.length === 0) return 'SUCCESS';
    if (state === 'ERROR' || errors.length > 0) return 'FAILED';
    if (state === 'BUILDING') return 'BUILDING';
    if (state === 'QUEUED') return 'QUEUED';
    return 'ERROR';
  }

  formatResult(result: DeploymentCheckResult): string {
    const lines: string[] = [];

    lines.push('='.repeat(70));
    lines.push('VERCEL DEPLOYMENT CHECK');
    lines.push('='.repeat(70));
    lines.push('');
    lines.push(`Status: ${result.status}`);
    lines.push(`Deployment ID: ${result.deploymentId}`);
    lines.push(`URL: ${result.url}`);
    lines.push(`Created: ${result.createdAt.toISOString()}`);

    if (result.completedAt) lines.push(`Completed: ${result.completedAt.toISOString()}`);
    if (result.duration) lines.push(`Duration: ${Math.round(result.duration / 1000)}s`);

    lines.push(`Environment: ${result.isProduction ? 'Production' : 'Preview'}`);
    lines.push(`Creator: ${result.creator}`);

    if (result.branch) lines.push(`Branch: ${result.branch}`);
    if (result.commit) lines.push(`Commit: ${result.commit.substring(0, 7)}`);

    lines.push('');
    lines.push('URLs:');
    lines.push(`  Preview: ${result.url}`);
    if (result.aliasUrl) lines.push(`  Alias: ${result.aliasUrl}`);
    if (result.inspectorUrl) lines.push(`  Inspector: ${result.inspectorUrl}`);

    if (result.buildErrors.length > 0) {
      lines.push('');
      lines.push('Build Errors:');
      result.buildErrors.forEach((error) => lines.push(`  - ${error}`));
    }

    if (result.buildWarnings.length > 0) {
      lines.push('');
      lines.push('Build Warnings:');
      result.buildWarnings.forEach((warning) => lines.push(`  - ${warning}`));
    }

    if (result.functionDetails && result.functionDetails.length > 0) {
      lines.push('');
      lines.push('Functions:');
      result.functionDetails.forEach((fn) => {
        const durationStr = fn.duration ? ` (${fn.duration}ms)` : '';
        const memoryStr = fn.memory ? ` - ${fn.memory}MB` : '';
        lines.push(`  - ${fn.name}${durationStr}${memoryStr}`);
      });
    }

    lines.push('');
    lines.push('='.repeat(70));

    return lines.join('\n');
  }
}

export async function checkDeployment(deploymentId: string): Promise<DeploymentCheckResult> {
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_OIDC_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN, VERCEL_ACCESS_TOKEN, or VERCEL_OIDC_TOKEN environment variable not found');

  const checker = new VercelDeploymentChecker({ accessToken: token });
  return checker.checkDeployment(deploymentId);
}

export async function checkLatestDeployment(filters?: DeploymentFilterOptions): Promise<DeploymentCheckResult> {
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_OIDC_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN, VERCEL_ACCESS_TOKEN, or VERCEL_OIDC_TOKEN environment variable not found');

  const checker = new VercelDeploymentChecker({ accessToken: token });
  return checker.checkLatestDeployment(filters);
}

export default VercelDeploymentChecker;
