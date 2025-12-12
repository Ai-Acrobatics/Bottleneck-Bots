/**
 * Cache Key Helpers
 * Centralized cache key generation for consistent naming
 */

/**
 * Cache key generators for different data types
 */
export const cacheKeys = {
  /**
   * User-related cache keys
   */
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  userSettings: (id: string) => `user:${id}:settings`,

  /**
   * User credits cache keys
   */
  userCredits: (id: string) => `credits:${id}`,

  /**
   * Session cache keys
   */
  session: (id: string) => `session:${id}`,
  sessionUser: (sessionId: string) => `session:${sessionId}:user`,

  /**
   * Workflow-related cache keys
   */
  workflow: (id: string) => `workflow:${id}`,
  workflowDefinition: (id: string) => `workflow:${id}:definition`,
  workflowExecutions: (workflowId: string) => `workflow:${workflowId}:executions`,
  workflowExecution: (executionId: string) => `execution:${executionId}`,

  /**
   * Lead-related cache keys
   */
  leads: (listId: string) => `leads:${listId}`,
  leadMetadata: (listId: string) => `leads:${listId}:metadata`,
  lead: (leadId: string) => `lead:${leadId}`,

  /**
   * API rate limiting keys
   */
  rateLimit: (userId: string, endpoint: string) => `rate:${userId}:${endpoint}`,
  rateLimitGlobal: (endpoint: string) => `rate:global:${endpoint}`,

  /**
   * Authentication-related cache keys
   */
  authToken: (token: string) => `auth:token:${token}`,
  authRefresh: (refreshToken: string) => `auth:refresh:${refreshToken}`,

  /**
   * Feature flags and configurations
   */
  featureFlag: (flag: string) => `feature:${flag}`,
  config: (key: string) => `config:${key}`,

  /**
   * Analytics and metrics
   */
  analyticsDaily: (date: string) => `analytics:daily:${date}`,
  analyticsUser: (userId: string, date: string) => `analytics:user:${userId}:${date}`,

  /**
   * Integration cache keys
   */
  integration: (provider: string, userId: string) => `integration:${provider}:${userId}`,
  integrationAuth: (provider: string, userId: string) => `integration:${provider}:${userId}:auth`,

  /**
   * Queue and job status
   */
  jobStatus: (jobId: string) => `job:${jobId}:status`,
  queueStats: (queueName: string) => `queue:${queueName}:stats`,

  /**
   * Template and content cache
   */
  template: (id: string) => `template:${id}`,
  templateList: (category?: string) => category ? `templates:${category}` : 'templates:all',
} as const;

/**
 * Pattern generators for bulk operations
 */
export const cachePatterns = {
  /**
   * All keys for a specific user
   */
  userAll: (userId: string) => `user:${userId}`,

  /**
   * All sessions
   */
  allSessions: () => 'session:',

  /**
   * All workflows
   */
  allWorkflows: () => 'workflow:',

  /**
   * All leads for a list
   */
  allLeads: (listId: string) => `leads:${listId}`,

  /**
   * All rate limit keys for a user
   */
  userRateLimits: (userId: string) => `rate:${userId}`,

  /**
   * All integrations for a user
   */
  userIntegrations: (userId: string) => `integration:*:${userId}`,

  /**
   * All analytics for a specific date
   */
  analyticsDate: (date: string) => `analytics:*:${date}`,
} as const;

/**
 * Helper function to generate time-based cache keys
 */
export function getTimestampedKey(baseKey: string): string {
  const timestamp = new Date().toISOString();
  return `${baseKey}:${timestamp}`;
}

/**
 * Helper function to generate paginated cache keys
 */
export function getPaginatedKey(baseKey: string, page: number, limit: number): string {
  return `${baseKey}:page:${page}:limit:${limit}`;
}

/**
 * Helper function to generate sorted cache keys
 */
export function getSortedKey(baseKey: string, sortBy: string, sortOrder: 'asc' | 'desc'): string {
  return `${baseKey}:sort:${sortBy}:${sortOrder}`;
}
