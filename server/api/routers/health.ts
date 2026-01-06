/**
 * Health Check Router
 * System health monitoring including circuit breaker states
 */

import { z } from "zod";
import { router, publicProcedure } from "../../_core/trpc";
import { circuitBreakerRegistry } from "../../lib/circuitBreaker";
import { browserbaseSDK } from "../../_core/browserbaseSDK";

/**
 * Health Router
 * Provides system health status and circuit breaker monitoring
 */
export const healthRouter = router({
  /**
   * Get overall system health status
   *
   * Returns:
   * - Overall system health
   * - Circuit breaker states for all services
   * - Timestamp of health check
   *
   * @example
   * ```ts
   * const health = await trpc.health.getSystemHealth.query();
   * console.log('System healthy:', health.healthy);
   * console.log('Vapi circuit state:', health.circuits.vapi.state);
   * ```
   */
  getSystemHealth: publicProcedure.query(async () => {
    const allHealth = circuitBreakerRegistry.getAllHealth();

    // Determine overall system health
    const healthy = Object.values(allHealth).every(circuit => circuit.healthy);

    return {
      healthy,
      timestamp: new Date().toISOString(),
      circuits: allHealth,
    };
  }),

  /**
   * Get detailed circuit breaker states
   *
   * Returns full state information for all circuit breakers including:
   * - Current state (open/closed/half-open)
   * - Failure counts
   * - Success counts
   * - Timestamps
   * - Total request metrics
   *
   * @example
   * ```ts
   * const states = await trpc.health.getCircuitStates.query();
   * for (const [name, state] of Object.entries(states)) {
   *   console.log(`${name}: ${state.state} (failures: ${state.failures})`);
   * }
   * ```
   */
  getCircuitStates: publicProcedure.query(async () => {
    const breakers = circuitBreakerRegistry.getAll();
    const states: Record<string, any> = {};

    for (const [name, breaker] of Array.from(breakers)) {
      states[name] = breaker.getState();
    }

    return states;
  }),

  /**
   * Get health status for a specific service
   *
   * @param serviceName - Name of the service (vapi, apify, browserbase, etc.)
   *
   * @example
   * ```ts
   * const vapiHealth = await trpc.health.getServiceHealth.query({ serviceName: 'vapi' });
   * console.log('Vapi state:', vapiHealth.state);
   * console.log('Vapi failure rate:', vapiHealth.failureRate);
   * ```
   */
  getServiceHealth: publicProcedure
    .input(
      z.object({
        serviceName: z.enum([
          'vapi',
          'apify',
          'browserbase',
          'openai',
          'anthropic',
          'gmail',
          'outlook',
        ]),
      })
    )
    .query(async ({ input }) => {
      const breaker = circuitBreakerRegistry.get(input.serviceName);

      if (!breaker) {
        return {
          exists: false,
          serviceName: input.serviceName,
        };
      }

      return {
        exists: true,
        serviceName: input.serviceName,
        state: breaker.getState(),
        health: breaker.getHealth(),
      };
    }),

  /**
   * Reset a specific circuit breaker
   * Useful for manually recovering from a failure state
   *
   * @param serviceName - Name of the service to reset
   *
   * @example
   * ```ts
   * await trpc.health.resetCircuit.mutate({ serviceName: 'vapi' });
   * ```
   */
  resetCircuit: publicProcedure
    .input(
      z.object({
        serviceName: z.enum([
          'vapi',
          'apify',
          'browserbase',
          'openai',
          'anthropic',
          'gmail',
          'outlook',
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const breaker = circuitBreakerRegistry.get(input.serviceName);

      if (!breaker) {
        throw new Error(`Circuit breaker '${input.serviceName}' not found`);
      }

      breaker.reset();

      return {
        success: true,
        serviceName: input.serviceName,
        message: `Circuit breaker '${input.serviceName}' has been reset`,
      };
    }),

  /**
   * Reset all circuit breakers
   * Use with caution - only reset all circuits when necessary
   *
   * @example
   * ```ts
   * await trpc.health.resetAllCircuits.mutate();
   * ```
   */
  resetAllCircuits: publicProcedure.mutation(async () => {
    circuitBreakerRegistry.resetAll();

    return {
      success: true,
      message: 'All circuit breakers have been reset',
    };
  }),

  /**
   * Get service availability summary
   * Returns a simplified view of which services are currently available
   *
   * @example
   * ```ts
   * const availability = await trpc.health.getServiceAvailability.query();
   * console.log('Available services:', availability.available);
   * console.log('Unavailable services:', availability.unavailable);
   * ```
   */
  getServiceAvailability: publicProcedure.query(async () => {
    const allHealth = circuitBreakerRegistry.getAllHealth();

    const available: string[] = [];
    const unavailable: string[] = [];
    const degraded: string[] = [];

    for (const [name, health] of Object.entries(allHealth)) {
      if (health.state === 'closed') {
        available.push(name);
      } else if (health.state === 'open') {
        unavailable.push(name);
      } else if (health.state === 'half-open') {
        degraded.push(name);
      }
    }

    return {
      available,
      unavailable,
      degraded,
      totalServices: available.length + unavailable.length + degraded.length,
      availabilityPercentage:
        ((available.length + degraded.length * 0.5) /
          (available.length + unavailable.length + degraded.length)) *
        100,
    };
  }),

  /**
   * Check Browserbase service health
   * Verifies configuration and API connectivity
   *
   * @example
   * ```ts
   * const browserHealth = await trpc.health.getBrowserbaseHealth.query();
   * if (!browserHealth.healthy) {
   *   console.error('Browserbase issues:', browserHealth.details.errors);
   * }
   * ```
   */
  getBrowserbaseHealth: publicProcedure.query(async () => {
    try {
      const health = await browserbaseSDK.healthCheck();
      return health;
    } catch (error) {
      return {
        healthy: false,
        status: 'error',
        details: {
          configured: false,
          initialized: false,
          canConnect: false,
          projectId: null,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }),

  /**
   * Get Browserbase configuration status (without testing connectivity)
   * Fast check for configuration validation
   *
   * @example
   * ```ts
   * const config = await trpc.health.getBrowserbaseConfig.query();
   * if (!config.isConfigured) {
   *   console.log('Missing:', config.errors.join(', '));
   * }
   * ```
   */
  getBrowserbaseConfig: publicProcedure.query(async () => {
    return browserbaseSDK.getConfigurationStatus();
  }),

  /**
   * Liveness probe
   * Simple endpoint for Kubernetes/Docker health checks
   * Returns 200 OK if the server is running
   *
   * @example
   * ```ts
   * await fetch('/api/trpc/health.liveness');
   * ```
   */
  liveness: publicProcedure.query(async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Readiness probe
   * Checks if the server is ready to handle requests
   * Fails if critical services are unavailable
   *
   * @example
   * ```ts
   * const ready = await trpc.health.readiness.query();
   * if (!ready.ready) {
   *   console.error('Server not ready:', ready.reasons);
   * }
   * ```
   */
  readiness: publicProcedure.query(async () => {
    const allHealth = circuitBreakerRegistry.getAllHealth();

    // Check for critical services (those that are open/unavailable)
    const criticalServicesDown = Object.entries(allHealth)
      .filter(([_, health]) => health.state === 'open')
      .map(([name]) => name);

    const ready = criticalServicesDown.length === 0;

    return {
      ready,
      timestamp: new Date().toISOString(),
      unavailableServices: criticalServicesDown,
      reasons: ready
        ? []
        : [
            `Critical services unavailable: ${criticalServicesDown.join(', ')}`,
          ],
    };
  }),

  /**
   * Get metrics for monitoring dashboards
   * Returns comprehensive metrics for all circuit breakers
   *
   * @example
   * ```ts
   * const metrics = await trpc.health.getMetrics.query();
   * console.log('Total requests:', metrics.totalRequests);
   * console.log('Overall failure rate:', metrics.overallFailureRate);
   * ```
   */
  getMetrics: publicProcedure.query(async () => {
    const allHealth = circuitBreakerRegistry.getAllHealth();
    const allStates = await (async () => {
      const breakers = circuitBreakerRegistry.getAll();
      const states: Record<string, any> = {};
      for (const [name, breaker] of Array.from(breakers)) {
        states[name] = breaker.getState();
      }
      return states;
    })();

    // Calculate aggregate metrics
    let totalRequests = 0;
    let totalFailures = 0;
    let totalSuccesses = 0;

    for (const state of Object.values(allStates)) {
      totalRequests += state.totalRequests || 0;
      totalFailures += state.totalFailures || 0;
      totalSuccesses += state.totalSuccesses || 0;
    }

    const overallFailureRate =
      totalRequests > 0 ? totalFailures / totalRequests : 0;
    const overallSuccessRate =
      totalRequests > 0 ? totalSuccesses / totalRequests : 0;

    return {
      timestamp: new Date().toISOString(),
      totalRequests,
      totalFailures,
      totalSuccesses,
      overallFailureRate,
      overallSuccessRate,
      services: allStates,
      healthSummary: allHealth,
    };
  }),

  /**
   * Check Supabase/Database health
   * Verifies database connectivity and configuration
   *
   * @example
   * ```ts
   * const dbHealth = await trpc.health.getDatabaseHealth.query();
   * if (!dbHealth.healthy) {
   *   console.error('Database issues:', dbHealth.error);
   * }
   * ```
   */
  getDatabaseHealth: publicProcedure.query(async () => {
    try {
      const { getDb } = await import('../../db');
      const { testSupabaseConnection, getSupabaseClient } = await import('../../services/supabase.service');

      const results: {
        healthy: boolean;
        timestamp: string;
        drizzle: { connected: boolean; error?: string };
        supabase: { connected: boolean; configured: boolean; error?: string };
      } = {
        healthy: false,
        timestamp: new Date().toISOString(),
        drizzle: { connected: false },
        supabase: { connected: false, configured: false },
      };

      // Test Drizzle ORM connection
      try {
        const db = await getDb();
        results.drizzle.connected = db !== null;
      } catch (error) {
        results.drizzle.connected = false;
        results.drizzle.error = error instanceof Error ? error.message : 'Unknown error';
      }

      // Test Supabase client
      try {
        const client = getSupabaseClient();
        results.supabase.configured = client !== null;

        if (client) {
          results.supabase.connected = await testSupabaseConnection();
        }
      } catch (error) {
        results.supabase.connected = false;
        results.supabase.error = error instanceof Error ? error.message : 'Unknown error';
      }

      results.healthy = results.drizzle.connected || results.supabase.connected;

      return results;
    } catch (error) {
      return {
        healthy: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        drizzle: { connected: false },
        supabase: { connected: false, configured: false },
      };
    }
  }),
});
