/**
 * Security Services Index
 *
 * Centralized exports for all security-related services
 */

// Credential Vault
export {
  credentialVaultService,
  createCredentialVaultService,
  type Credential,
  type CredentialType,
  type CredentialMetadata,
  type CredentialPermissions,
  type CredentialUsageLog,
  type DecryptedCredential,
} from './credentialVault.service';

// Execution Control
export {
  executionControlService,
  createExecutionControlService,
  type ExecutionState,
  type ExecutionStatus,
  type ExecutionCheckpoint,
  type ResourceUsage,
  type ResourceQuota,
  type ControlEvent,
  type RateLimitConfig,
} from './executionControl.service';

// Getter functions for lazy initialization
import { credentialVaultService } from './credentialVault.service';
import { executionControlService } from './executionControl.service';

export function getCredentialVault() {
  return credentialVaultService;
}

export function getExecutionControl() {
  return executionControlService;
}
