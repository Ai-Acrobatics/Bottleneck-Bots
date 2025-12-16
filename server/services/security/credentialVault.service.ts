/**
 * Credential Vault Service
 *
 * Secure credential management with:
 * - Encrypted storage
 * - Access control
 * - Credential rotation
 * - Audit logging
 * - Auto-injection during browser automation
 */

import * as crypto from 'crypto';

// ========================================
// TYPES
// ========================================

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  domain: string;
  username?: string;
  encryptedPassword?: string;
  encryptedApiKey?: string;
  encryptedToken?: string;
  metadata: CredentialMetadata;
  permissions: CredentialPermissions;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

export type CredentialType =
  | 'login'
  | 'api_key'
  | 'oauth_token'
  | 'certificate'
  | 'ssh_key'
  | 'custom';

export interface CredentialMetadata {
  description?: string;
  tags?: string[];
  autoFillSelectors?: {
    usernameSelector?: string;
    passwordSelector?: string;
    submitSelector?: string;
  };
  customFields?: Record<string, string>;
}

export interface CredentialPermissions {
  allowedUsers: number[];
  allowedDomains: string[];
  requireApproval: boolean;
  maxUsesPerDay?: number;
  allowedActions: ('read' | 'use' | 'modify' | 'delete')[];
}

export interface CredentialUsageLog {
  credentialId: string;
  userId: number;
  executionId: string;
  action: 'accessed' | 'used' | 'modified' | 'rotated';
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
  details?: string;
}

export interface DecryptedCredential {
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  customFields?: Record<string, string>;
}

// ========================================
// CONSTANTS
// ========================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// ========================================
// CREDENTIAL VAULT SERVICE
// ========================================

class CredentialVaultService {
  private credentials: Map<string, Credential> = new Map();
  private usageLogs: CredentialUsageLog[] = [];
  private usageCount: Map<string, Map<string, number>> = new Map(); // credentialId -> date -> count
  private encryptionKey: Buffer;

  constructor() {
    // In production, this should come from a secure key management service
    // For development, we generate a key from environment or use a default
    const keySource = process.env.CREDENTIAL_VAULT_KEY || 'default-development-key-change-in-prod';
    this.encryptionKey = crypto.scryptSync(keySource, 'vault-salt', KEY_LENGTH);
  }

  // ========================================
  // CREDENTIAL STORAGE
  // ========================================

  /**
   * Store a new credential in the vault
   */
  async storeCredential(
    userId: number,
    name: string,
    type: CredentialType,
    domain: string,
    data: {
      username?: string;
      password?: string;
      apiKey?: string;
      token?: string;
      customFields?: Record<string, string>;
    },
    options: {
      metadata?: CredentialMetadata;
      permissions?: Partial<CredentialPermissions>;
      expiresAt?: Date;
    } = {}
  ): Promise<{ success: boolean; credentialId?: string; error?: string }> {
    try {
      const credentialId = this.generateCredentialId();

      // Encrypt sensitive data
      const encryptedPassword = data.password ? this.encrypt(data.password) : undefined;
      const encryptedApiKey = data.apiKey ? this.encrypt(data.apiKey) : undefined;
      const encryptedToken = data.token ? this.encrypt(data.token) : undefined;

      // Encrypt custom fields
      const encryptedCustomFields: Record<string, string> = {};
      if (data.customFields) {
        for (const [key, value] of Object.entries(data.customFields)) {
          encryptedCustomFields[key] = this.encrypt(value);
        }
      }

      const credential: Credential = {
        id: credentialId,
        name,
        type,
        domain,
        username: data.username,
        encryptedPassword,
        encryptedApiKey,
        encryptedToken,
        metadata: {
          ...options.metadata,
          customFields: encryptedCustomFields,
        },
        permissions: {
          allowedUsers: [userId],
          allowedDomains: [domain],
          requireApproval: false,
          allowedActions: ['read', 'use'],
          ...options.permissions,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options.expiresAt,
      };

      this.credentials.set(credentialId, credential);

      // Log the creation
      this.logUsage({
        credentialId,
        userId,
        executionId: '',
        action: 'modified',
        timestamp: new Date(),
        success: true,
        details: 'Credential created',
      });

      return { success: true, credentialId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to store credential',
      };
    }
  }

  /**
   * Retrieve a credential (decrypted)
   */
  async getCredential(
    credentialId: string,
    userId: number,
    executionId: string
  ): Promise<{ success: boolean; credential?: DecryptedCredential; error?: string }> {
    try {
      const credential = this.credentials.get(credentialId);

      if (!credential) {
        return { success: false, error: 'Credential not found' };
      }

      // Check permissions
      const permissionCheck = this.checkPermissions(credential, userId, 'read');
      if (!permissionCheck.allowed) {
        this.logUsage({
          credentialId,
          userId,
          executionId,
          action: 'accessed',
          timestamp: new Date(),
          success: false,
          details: `Permission denied: ${permissionCheck.reason}`,
        });
        return { success: false, error: permissionCheck.reason };
      }

      // Check expiration
      if (credential.expiresAt && new Date() > credential.expiresAt) {
        return { success: false, error: 'Credential has expired' };
      }

      // Check daily usage limit
      if (credential.permissions.maxUsesPerDay) {
        const todayUsage = this.getTodayUsage(credentialId);
        if (todayUsage >= credential.permissions.maxUsesPerDay) {
          return { success: false, error: 'Daily usage limit exceeded' };
        }
      }

      // Decrypt and return
      const decrypted: DecryptedCredential = {
        username: credential.username,
        password: credential.encryptedPassword ? this.decrypt(credential.encryptedPassword) : undefined,
        apiKey: credential.encryptedApiKey ? this.decrypt(credential.encryptedApiKey) : undefined,
        token: credential.encryptedToken ? this.decrypt(credential.encryptedToken) : undefined,
      };

      // Decrypt custom fields
      if (credential.metadata.customFields) {
        decrypted.customFields = {};
        for (const [key, encryptedValue] of Object.entries(credential.metadata.customFields)) {
          decrypted.customFields[key] = this.decrypt(encryptedValue);
        }
      }

      // Update last used and log access
      credential.lastUsedAt = new Date();
      this.incrementUsage(credentialId);

      this.logUsage({
        credentialId,
        userId,
        executionId,
        action: 'accessed',
        timestamp: new Date(),
        success: true,
      });

      return { success: true, credential: decrypted };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve credential',
      };
    }
  }

  /**
   * Find credentials for a domain
   */
  findCredentialsForDomain(
    domain: string,
    userId: number
  ): Array<{ id: string; name: string; type: CredentialType; username?: string }> {
    const results: Array<{ id: string; name: string; type: CredentialType; username?: string }> = [];

    for (const credential of Array.from(this.credentials.values())) {
      // Check if domain matches
      if (
        credential.domain === domain ||
        domain.endsWith(credential.domain) ||
        credential.permissions.allowedDomains.some((d) => domain.includes(d))
      ) {
        // Check if user has access
        if (this.checkPermissions(credential, userId, 'read').allowed) {
          results.push({
            id: credential.id,
            name: credential.name,
            type: credential.type,
            username: credential.username,
          });
        }
      }
    }

    return results;
  }

  // ========================================
  // AUTO-FILL SUPPORT
  // ========================================

  /**
   * Get auto-fill configuration for a credential
   */
  getAutoFillConfig(
    credentialId: string,
    userId: number
  ): { success: boolean; config?: CredentialMetadata['autoFillSelectors']; error?: string } {
    const credential = this.credentials.get(credentialId);

    if (!credential) {
      return { success: false, error: 'Credential not found' };
    }

    if (!this.checkPermissions(credential, userId, 'use').allowed) {
      return { success: false, error: 'Permission denied' };
    }

    return {
      success: true,
      config: credential.metadata.autoFillSelectors || {
        usernameSelector: 'input[type="email"], input[name="username"], input[name="email"]',
        passwordSelector: 'input[type="password"]',
        submitSelector: 'button[type="submit"], input[type="submit"]',
      },
    };
  }

  /**
   * Update auto-fill selectors for a credential
   */
  updateAutoFillSelectors(
    credentialId: string,
    userId: number,
    selectors: CredentialMetadata['autoFillSelectors']
  ): { success: boolean; error?: string } {
    const credential = this.credentials.get(credentialId);

    if (!credential) {
      return { success: false, error: 'Credential not found' };
    }

    if (!this.checkPermissions(credential, userId, 'modify').allowed) {
      return { success: false, error: 'Permission denied' };
    }

    credential.metadata.autoFillSelectors = selectors;
    credential.updatedAt = new Date();

    return { success: true };
  }

  // ========================================
  // CREDENTIAL ROTATION
  // ========================================

  /**
   * Rotate a credential (update password/key)
   */
  async rotateCredential(
    credentialId: string,
    userId: number,
    newData: {
      password?: string;
      apiKey?: string;
      token?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const credential = this.credentials.get(credentialId);

      if (!credential) {
        return { success: false, error: 'Credential not found' };
      }

      if (!this.checkPermissions(credential, userId, 'modify').allowed) {
        return { success: false, error: 'Permission denied' };
      }

      // Update encrypted values
      if (newData.password) {
        credential.encryptedPassword = this.encrypt(newData.password);
      }
      if (newData.apiKey) {
        credential.encryptedApiKey = this.encrypt(newData.apiKey);
      }
      if (newData.token) {
        credential.encryptedToken = this.encrypt(newData.token);
      }

      credential.updatedAt = new Date();

      // Log rotation
      this.logUsage({
        credentialId,
        userId,
        executionId: '',
        action: 'rotated',
        timestamp: new Date(),
        success: true,
        details: 'Credential rotated',
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rotate credential',
      };
    }
  }

  // ========================================
  // PERMISSION MANAGEMENT
  // ========================================

  private checkPermissions(
    credential: Credential,
    userId: number,
    action: 'read' | 'use' | 'modify' | 'delete'
  ): { allowed: boolean; reason?: string } {
    // Check if user is allowed
    if (!credential.permissions.allowedUsers.includes(userId)) {
      return { allowed: false, reason: 'User not authorized for this credential' };
    }

    // Check if action is allowed
    if (!credential.permissions.allowedActions.includes(action)) {
      return { allowed: false, reason: `Action '${action}' not permitted` };
    }

    // Check if approval is required (simplified - in production, this would check an approval queue)
    if (credential.permissions.requireApproval && action !== 'read') {
      return { allowed: false, reason: 'Approval required for this action' };
    }

    return { allowed: true };
  }

  /**
   * Grant access to a credential
   */
  grantAccess(
    credentialId: string,
    ownerUserId: number,
    targetUserId: number,
    actions: ('read' | 'use' | 'modify' | 'delete')[]
  ): { success: boolean; error?: string } {
    const credential = this.credentials.get(credentialId);

    if (!credential) {
      return { success: false, error: 'Credential not found' };
    }

    // Only the owner (first user in allowedUsers) can grant access
    if (credential.permissions.allowedUsers[0] !== ownerUserId) {
      return { success: false, error: 'Only the credential owner can grant access' };
    }

    if (!credential.permissions.allowedUsers.includes(targetUserId)) {
      credential.permissions.allowedUsers.push(targetUserId);
    }

    // Update allowed actions
    for (const action of actions) {
      if (!credential.permissions.allowedActions.includes(action)) {
        credential.permissions.allowedActions.push(action);
      }
    }

    credential.updatedAt = new Date();

    return { success: true };
  }

  /**
   * Revoke access from a credential
   */
  revokeAccess(
    credentialId: string,
    ownerUserId: number,
    targetUserId: number
  ): { success: boolean; error?: string } {
    const credential = this.credentials.get(credentialId);

    if (!credential) {
      return { success: false, error: 'Credential not found' };
    }

    if (credential.permissions.allowedUsers[0] !== ownerUserId) {
      return { success: false, error: 'Only the credential owner can revoke access' };
    }

    // Cannot revoke owner's own access
    if (targetUserId === ownerUserId) {
      return { success: false, error: 'Cannot revoke owner access' };
    }

    const index = credential.permissions.allowedUsers.indexOf(targetUserId);
    if (index > -1) {
      credential.permissions.allowedUsers.splice(index, 1);
    }

    credential.updatedAt = new Date();

    return { success: true };
  }

  // ========================================
  // ENCRYPTION
  // ========================================

  private encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine IV + encrypted data + auth tag
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  }

  private decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // ========================================
  // USAGE TRACKING
  // ========================================

  private logUsage(log: CredentialUsageLog): void {
    this.usageLogs.push(log);

    // Keep only last 10000 logs
    if (this.usageLogs.length > 10000) {
      this.usageLogs = this.usageLogs.slice(-10000);
    }
  }

  private getTodayUsage(credentialId: string): number {
    const today = new Date().toISOString().split('T')[0];
    const credentialUsage = this.usageCount.get(credentialId);
    return credentialUsage?.get(today) || 0;
  }

  private incrementUsage(credentialId: string): void {
    const today = new Date().toISOString().split('T')[0];

    if (!this.usageCount.has(credentialId)) {
      this.usageCount.set(credentialId, new Map());
    }

    const credentialUsage = this.usageCount.get(credentialId)!;
    const currentCount = credentialUsage.get(today) || 0;
    credentialUsage.set(today, currentCount + 1);
  }

  /**
   * Get usage logs for a credential
   */
  getUsageLogs(
    credentialId: string,
    userId: number,
    limit: number = 100
  ): CredentialUsageLog[] {
    const credential = this.credentials.get(credentialId);

    if (!credential || !this.checkPermissions(credential, userId, 'read').allowed) {
      return [];
    }

    return this.usageLogs
      .filter((log) => log.credentialId === credentialId)
      .slice(-limit);
  }

  // ========================================
  // UTILITIES
  // ========================================

  private generateCredentialId(): string {
    return `cred-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Delete a credential
   */
  deleteCredential(
    credentialId: string,
    userId: number
  ): { success: boolean; error?: string } {
    const credential = this.credentials.get(credentialId);

    if (!credential) {
      return { success: false, error: 'Credential not found' };
    }

    if (!this.checkPermissions(credential, userId, 'delete').allowed) {
      return { success: false, error: 'Permission denied' };
    }

    this.credentials.delete(credentialId);

    this.logUsage({
      credentialId,
      userId,
      executionId: '',
      action: 'modified',
      timestamp: new Date(),
      success: true,
      details: 'Credential deleted',
    });

    return { success: true };
  }

  /**
   * List all credentials for a user
   */
  listCredentials(userId: number): Array<{
    id: string;
    name: string;
    type: CredentialType;
    domain: string;
    username?: string;
    lastUsedAt?: Date;
    expiresAt?: Date;
  }> {
    const results: Array<{
      id: string;
      name: string;
      type: CredentialType;
      domain: string;
      username?: string;
      lastUsedAt?: Date;
      expiresAt?: Date;
    }> = [];

    for (const credential of Array.from(this.credentials.values())) {
      if (this.checkPermissions(credential, userId, 'read').allowed) {
        results.push({
          id: credential.id,
          name: credential.name,
          type: credential.type,
          domain: credential.domain,
          username: credential.username,
          lastUsedAt: credential.lastUsedAt,
          expiresAt: credential.expiresAt,
        });
      }
    }

    return results;
  }

  /**
   * Clean up expired credentials
   */
  cleanupExpired(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [id, credential] of Array.from(this.credentials.entries())) {
      if (credential.expiresAt && credential.expiresAt < now) {
        this.credentials.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Export singleton instance
export const credentialVaultService = new CredentialVaultService();

// Export factory function for testing
export function createCredentialVaultService(): CredentialVaultService {
  return new CredentialVaultService();
}
