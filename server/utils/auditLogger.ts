import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema-admin";
import type { Request } from "express";

/**
 * Admin Action Audit Logger
 *
 * Logs all administrative actions to the audit_logs table for compliance,
 * security auditing, and accountability.
 *
 * Features:
 * - Records admin user ID and action details
 * - Captures IP address and user agent from request
 * - Stores old/new values for change tracking
 * - Supports flexible metadata for action-specific context
 * - Safe error handling to prevent action failures
 */

export interface LogAdminActionParams {
  adminId: number;
  action: string; // e.g., 'user.suspend', 'config.update', 'flag.toggle'
  targetType: string; // e.g., 'user', 'feature_flag', 'system_config'
  targetId: string | number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an admin action to the audit trail
 *
 * This function is designed to never throw errors - if logging fails,
 * it logs the error but allows the admin action to proceed.
 *
 * @param params - Audit log parameters
 * @returns Promise that resolves when logging is complete
 *
 * @example
 * ```typescript
 * await logAdminAction({
 *   adminId: ctx.user.id,
 *   action: 'user.suspend',
 *   targetType: 'user',
 *   targetId: userId,
 *   oldValue: { suspendedAt: null },
 *   newValue: { suspendedAt: new Date(), reason: 'TOS violation' },
 *   ipAddress: getIpAddress(ctx.req),
 *   metadata: { reason: 'Terms of service violation' }
 * });
 * ```
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[AuditLogger] Database not available");
      return;
    }

    // Sanitize values to prevent logging sensitive data or overly large objects
    const sanitizedOldValue = params.oldValue ? sanitizeValue(params.oldValue) : null;
    const sanitizedNewValue = params.newValue ? sanitizeValue(params.newValue) : null;
    const sanitizedMetadata = params.metadata ? sanitizeValue(params.metadata) : null;

    await db.insert(auditLogs).values({
      userId: params.adminId,
      action: params.action,
      entityType: params.targetType,
      entityId: String(params.targetId),
      oldValues: sanitizedOldValue,
      newValues: sanitizedNewValue,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });

    console.log(
      `[AuditLogger] Admin ${params.adminId} performed action: ${params.action} on ${params.targetType}:${params.targetId}`
    );
  } catch (error) {
    // Never throw - we don't want audit logging failures to break admin actions
    console.error("[AuditLogger] Failed to log admin action:", error);
    console.error("[AuditLogger] Action details:", {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
    });
  }
}

/**
 * Sanitize values before storing in audit logs
 * Removes sensitive fields and limits object depth/size
 */
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  // For primitive types, return as-is
  if (typeof value !== 'object') {
    return value;
  }

  // For arrays, sanitize each element (limit to first 50 items)
  if (Array.isArray(value)) {
    return value.slice(0, 50).map(item => sanitizeValue(item));
  }

  // For objects, remove sensitive fields and limit depth
  const sanitized: Record<string, any> = {};
  const sensitiveFields = [
    'password',
    'passwordHash',
    'apiKey',
    'secret',
    'token',
    'accessToken',
    'refreshToken',
    'sessionToken',
    'privateKey',
    'creditCard',
    'ssn',
  ];

  for (const [key, val] of Object.entries(value)) {
    // Skip sensitive fields
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Limit string length
    if (typeof val === 'string' && val.length > 1000) {
      sanitized[key] = val.substring(0, 1000) + '... [truncated]';
      continue;
    }

    // For nested objects, only go one level deep to avoid bloat
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        sanitized[key] = val.slice(0, 20).map(item =>
          typeof item === 'object' ? '[Object]' : item
        );
      } else {
        sanitized[key] = '[Object]';
      }
      continue;
    }

    sanitized[key] = val;
  }

  return sanitized;
}

/**
 * Extract IP address from Express request
 * Handles proxies and load balancers
 */
export function getIpAddress(req: Request): string | undefined {
  // Check for IP from proxy/load balancer
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return ips[0].trim();
  }

  // Check for Cloudflare
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (cfConnectingIp) {
    return typeof cfConnectingIp === 'string' ? cfConnectingIp : cfConnectingIp[0];
  }

  // Check for real IP
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0];
  }

  // Fall back to remote address
  return req.socket?.remoteAddress;
}

/**
 * Extract user agent from Express request
 */
export function getUserAgent(req: Request): string | undefined {
  const userAgent = req.headers['user-agent'];
  return typeof userAgent === 'string' ? userAgent : undefined;
}
