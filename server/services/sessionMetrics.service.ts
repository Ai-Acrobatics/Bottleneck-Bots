/**
 * Session Metrics Service
 * Tracks browser session metrics, operations, and costs
 */

interface SessionMetrics {
  sessionId: string;
  startTime: Date | null;
  endTime: Date | null;
  operations: Array<{
    type: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  totalOperations: number;
  totalCost: number;
}

class SessionMetricsService {
  private metrics: Map<string, SessionMetrics> = new Map();

  /**
   * Track session start
   */
  async trackSessionStart(sessionId: string, userId: number): Promise<void> {
    this.metrics.set(sessionId, {
      sessionId,
      startTime: new Date(),
      endTime: null,
      operations: [],
      totalOperations: 0,
      totalCost: 0,
    });
    console.log(`[SessionMetrics] Tracking started for session ${sessionId}`);
  }

  /**
   * Track session end
   */
  async trackSessionEnd(sessionId: string, status: string): Promise<void> {
    const metrics = this.metrics.get(sessionId);
    if (metrics) {
      metrics.endTime = new Date();
      console.log(`[SessionMetrics] Session ${sessionId} ended with status: ${status}`);
    }
  }

  /**
   * Track an operation
   */
  async trackOperation(
    sessionId: string,
    operationType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const metrics = this.metrics.get(sessionId);
    if (metrics) {
      metrics.operations.push({
        type: operationType,
        timestamp: new Date(),
        metadata,
      });
      metrics.totalOperations++;
      console.log(`[SessionMetrics] Tracked operation ${operationType} for session ${sessionId}`);
    }
  }

  /**
   * Get session metrics
   */
  async getSessionMetrics(sessionId: string): Promise<SessionMetrics | null> {
    return this.metrics.get(sessionId) || null;
  }

  /**
   * Calculate session cost
   */
  async calculateCost(sessionId: string): Promise<number> {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) {
      return 0;
    }

    // Simple cost calculation: base cost + per-operation cost
    const baseCost = 0.01; // $0.01 per session
    const operationCost = 0.001; // $0.001 per operation
    const totalCost = baseCost + metrics.totalOperations * operationCost;

    metrics.totalCost = totalCost;
    return totalCost;
  }

  /**
   * Get all metrics
   */
  async getMetrics(filter?: { userId?: number; startDate?: Date; endDate?: Date }): Promise<SessionMetrics[]> {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear metrics for a session
   */
  clearSessionMetrics(sessionId: string): void {
    this.metrics.delete(sessionId);
    console.log(`[SessionMetrics] Cleared metrics for session ${sessionId}`);
  }
}

// Export singleton instance
export const sessionMetricsService = new SessionMetricsService();
