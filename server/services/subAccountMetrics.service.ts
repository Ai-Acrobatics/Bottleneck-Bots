/**
 * Sub-Account Metrics & Observability Service
 * Task 3.1 - Implements monitoring and observability for sub-account operations
 *
 * Features:
 * - Real-time metrics tracking
 * - Step-by-step operation logging
 * - Cost estimation
 * - Anomaly detection
 * - Performance monitoring
 */

export interface SubAccountOperationMetrics {
  operationId: string;
  operationType: 'create' | 'switch' | 'list' | 'update' | 'delete';
  userId: number;
  sessionId: string;
  startTime: Date;
  endTime: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps: Array<{
    step: string;
    startTime: Date;
    endTime: Date | null;
    success: boolean;
    duration: number;
    error?: string;
  }>;
  subAccountId?: string;
  subAccountName?: string;
  estimatedCost: number;
  actualCost: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface SubAccountMetricsSummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  totalCost: number;
  operationsByType: Record<string, number>;
  recentOperations: SubAccountOperationMetrics[];
}

// Cost constants based on Task 3.1 specification
const COST_CONSTANTS = {
  baseSessionCost: 0.01,
  llmCallCost: 0.003,
  browserMinuteCost: 0.01,
  subAccountCreate: {
    minCost: 0.30,
    maxCost: 0.50,
    estimatedMinutes: 15,
  },
};

class SubAccountMetricsService {
  private operations: Map<string, SubAccountOperationMetrics> = new Map();
  private completedOperations: SubAccountOperationMetrics[] = [];

  /**
   * Start tracking a new operation
   */
  startOperation(
    operationType: SubAccountOperationMetrics['operationType'],
    userId: number,
    sessionId: string,
    metadata?: Record<string, unknown>
  ): string {
    const operationId = `subaccount_${operationType}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const operation: SubAccountOperationMetrics = {
      operationId,
      operationType,
      userId,
      sessionId,
      startTime: new Date(),
      endTime: null,
      status: 'pending',
      steps: [],
      estimatedCost: this.estimateCost(operationType),
      actualCost: 0,
      metadata,
    };

    this.operations.set(operationId, operation);
    console.log(`[SubAccountMetrics] Started ${operationType} operation: ${operationId}`);

    return operationId;
  }

  /**
   * Record a step in the operation
   */
  recordStep(
    operationId: string,
    stepName: string,
    success: boolean,
    duration: number,
    error?: string
  ): void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`[SubAccountMetrics] Operation not found: ${operationId}`);
      return;
    }

    operation.steps.push({
      step: stepName,
      startTime: new Date(Date.now() - duration),
      endTime: new Date(),
      success,
      duration,
      error,
    });

    operation.status = 'in_progress';

    // Increment actual cost based on step
    operation.actualCost += COST_CONSTANTS.llmCallCost + (duration / 60000) * COST_CONSTANTS.browserMinuteCost;

    console.log(`[SubAccountMetrics] Step "${stepName}" recorded for ${operationId}: ${success ? 'SUCCESS' : 'FAILED'}`);
  }

  /**
   * Complete the operation
   */
  completeOperation(
    operationId: string,
    success: boolean,
    result?: {
      subAccountId?: string;
      subAccountName?: string;
      errorMessage?: string;
    }
  ): SubAccountOperationMetrics | null {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`[SubAccountMetrics] Operation not found: ${operationId}`);
      return null;
    }

    operation.endTime = new Date();
    operation.status = success ? 'completed' : 'failed';
    operation.subAccountId = result?.subAccountId;
    operation.subAccountName = result?.subAccountName;
    operation.errorMessage = result?.errorMessage;

    // Calculate final cost
    const durationMinutes = (operation.endTime.getTime() - operation.startTime.getTime()) / 60000;
    operation.actualCost = Math.max(
      operation.actualCost,
      COST_CONSTANTS.baseSessionCost + durationMinutes * COST_CONSTANTS.browserMinuteCost
    );

    // Move to completed operations
    this.completedOperations.push(operation);
    this.operations.delete(operationId);

    // Keep only last 1000 completed operations
    if (this.completedOperations.length > 1000) {
      this.completedOperations = this.completedOperations.slice(-1000);
    }

    console.log(`[SubAccountMetrics] Operation ${operationId} completed: ${success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`[SubAccountMetrics] Duration: ${durationMinutes.toFixed(2)} minutes, Cost: $${operation.actualCost.toFixed(4)}`);

    return operation;
  }

  /**
   * Estimate cost for an operation type
   */
  private estimateCost(operationType: SubAccountOperationMetrics['operationType']): number {
    switch (operationType) {
      case 'create':
        return (COST_CONSTANTS.subAccountCreate.minCost + COST_CONSTANTS.subAccountCreate.maxCost) / 2;
      case 'switch':
        return 0.02;
      case 'list':
        return 0.03;
      case 'update':
        return 0.15;
      case 'delete':
        return 0.05;
      default:
        return 0.10;
    }
  }

  /**
   * Get metrics summary
   */
  getSummary(userId?: number): SubAccountMetricsSummary {
    let operations = this.completedOperations;
    if (userId) {
      operations = operations.filter(op => op.userId === userId);
    }

    const successful = operations.filter(op => op.status === 'completed');
    const failed = operations.filter(op => op.status === 'failed');

    const totalDuration = operations.reduce((sum, op) => {
      if (op.endTime) {
        return sum + (op.endTime.getTime() - op.startTime.getTime());
      }
      return sum;
    }, 0);

    const operationsByType: Record<string, number> = {};
    operations.forEach(op => {
      operationsByType[op.operationType] = (operationsByType[op.operationType] || 0) + 1;
    });

    return {
      totalOperations: operations.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      averageDuration: operations.length > 0 ? totalDuration / operations.length : 0,
      totalCost: operations.reduce((sum, op) => sum + op.actualCost, 0),
      operationsByType,
      recentOperations: operations.slice(-10).reverse(),
    };
  }

  /**
   * Get active operations
   */
  getActiveOperations(): SubAccountOperationMetrics[] {
    return Array.from(this.operations.values());
  }

  /**
   * Get operation by ID
   */
  getOperation(operationId: string): SubAccountOperationMetrics | undefined {
    return this.operations.get(operationId) ||
           this.completedOperations.find(op => op.operationId === operationId);
  }

  /**
   * Detect anomalies in operations
   */
  detectAnomalies(): Array<{
    operationId: string;
    type: string;
    message: string;
    severity: 'warning' | 'critical';
  }> {
    const anomalies: Array<{
      operationId: string;
      type: string;
      message: string;
      severity: 'warning' | 'critical';
    }> = [];

    // Check for long-running operations
    const now = Date.now();
    for (const [operationId, operation] of this.operations) {
      const duration = now - operation.startTime.getTime();
      const maxExpectedDuration = COST_CONSTANTS.subAccountCreate.estimatedMinutes * 2 * 60 * 1000; // 2x expected

      if (duration > maxExpectedDuration) {
        anomalies.push({
          operationId,
          type: 'long_running',
          message: `Operation running for ${(duration / 60000).toFixed(1)} minutes (expected max: ${COST_CONSTANTS.subAccountCreate.estimatedMinutes * 2} minutes)`,
          severity: duration > maxExpectedDuration * 2 ? 'critical' : 'warning',
        });
      }
    }

    // Check for high failure rate
    const recentOps = this.completedOperations.slice(-20);
    const recentFailures = recentOps.filter(op => op.status === 'failed').length;
    if (recentOps.length >= 5 && recentFailures / recentOps.length > 0.3) {
      anomalies.push({
        operationId: 'aggregate',
        type: 'high_failure_rate',
        message: `High failure rate: ${recentFailures}/${recentOps.length} recent operations failed`,
        severity: recentFailures / recentOps.length > 0.5 ? 'critical' : 'warning',
      });
    }

    return anomalies;
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics(): string {
    const summary = this.getSummary();
    const lines: string[] = [];

    lines.push('# HELP ghl_subaccount_operations_total Total sub-account operations');
    lines.push('# TYPE ghl_subaccount_operations_total counter');
    lines.push(`ghl_subaccount_operations_total{status="completed"} ${summary.successfulOperations}`);
    lines.push(`ghl_subaccount_operations_total{status="failed"} ${summary.failedOperations}`);

    lines.push('# HELP ghl_subaccount_cost_total Total cost of sub-account operations');
    lines.push('# TYPE ghl_subaccount_cost_total counter');
    lines.push(`ghl_subaccount_cost_total ${summary.totalCost.toFixed(4)}`);

    lines.push('# HELP ghl_subaccount_duration_avg_ms Average operation duration in milliseconds');
    lines.push('# TYPE ghl_subaccount_duration_avg_ms gauge');
    lines.push(`ghl_subaccount_duration_avg_ms ${summary.averageDuration.toFixed(0)}`);

    lines.push('# HELP ghl_subaccount_active_operations Current active operations');
    lines.push('# TYPE ghl_subaccount_active_operations gauge');
    lines.push(`ghl_subaccount_active_operations ${this.operations.size}`);

    for (const [type, count] of Object.entries(summary.operationsByType)) {
      lines.push(`ghl_subaccount_operations_by_type{type="${type}"} ${count}`);
    }

    return lines.join('\n');
  }
}

// Export singleton instance
export const subAccountMetricsService = new SubAccountMetricsService();
