/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests to failing services
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests fail immediately
 * - HALF_OPEN: Testing if service recovered, allow one request
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeoutMs: number; // Time before attempting half-open state
  monitoringWindowMs: number; // Time window for counting failures
  successThreshold?: number; // Successes needed in half-open to close (default: 1)
  onStateChange?: (oldState: CircuitState, newState: CircuitState) => void;
  onOpen?: () => void;
  onHalfOpen?: () => void;
  onClose?: () => void;
}

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreakerError extends Error {
  constructor(message: string, public readonly state: CircuitState) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit Breaker
 * Protects services from cascading failures
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private failureTimestamps: number[] = [];

  private readonly options: Required<CircuitBreakerOptions>;

  constructor(
    private readonly name: string,
    options: CircuitBreakerOptions
  ) {
    this.options = {
      successThreshold: 1,
      onStateChange: () => {},
      onOpen: () => {},
      onHalfOpen: () => {},
      onClose: () => {},
      ...options,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   *
   * @param fn - The async function to execute
   * @returns The result of the function
   * @throws CircuitBreakerError if circuit is open
   * @throws Original error if function fails
   *
   * @example
   * ```ts
   * const result = await circuitBreaker.execute(async () => {
   *   const response = await fetch('https://api.example.com/data');
   *   return response.json();
   * });
   * ```
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check circuit state
    if (this.state === 'open') {
      // Check if enough time has passed to try half-open
      if (this.shouldAttemptReset()) {
        this.moveToHalfOpen();
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker [${this.name}] is OPEN. Service is temporarily unavailable.`,
          this.state
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Record a successful execution
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.totalSuccesses++;

    if (this.state === 'half-open') {
      this.successes++;

      // If enough successes in half-open, close the circuit
      if (this.successes >= this.options.successThreshold) {
        this.close();
      }
    } else if (this.state === 'closed') {
      // Reset failure count on success
      this.failures = 0;
      this.failureTimestamps = [];
    }
  }

  /**
   * Record a failed execution
   */
  private onFailure(): void {
    const now = Date.now();
    this.lastFailureTime = now;
    this.totalFailures++;
    this.failures++;
    this.failureTimestamps.push(now);

    // Clean up old failure timestamps outside monitoring window
    this.cleanupOldFailures();

    if (this.state === 'half-open') {
      // Failure in half-open state immediately opens circuit
      this.open();
    } else if (this.state === 'closed') {
      // Check if failures exceed threshold in monitoring window
      const recentFailures = this.getRecentFailureCount();

      if (recentFailures >= this.options.failureThreshold) {
        this.open();
      }
    }
  }

  /**
   * Get count of failures within monitoring window
   */
  private getRecentFailureCount(): number {
    const now = Date.now();
    const windowStart = now - this.options.monitoringWindowMs;

    return this.failureTimestamps.filter(timestamp => timestamp >= windowStart).length;
  }

  /**
   * Remove failure timestamps outside monitoring window
   */
  private cleanupOldFailures(): void {
    const now = Date.now();
    const windowStart = now - this.options.monitoringWindowMs;

    this.failureTimestamps = this.failureTimestamps.filter(
      timestamp => timestamp >= windowStart
    );
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;

    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure >= this.options.resetTimeoutMs;
  }

  /**
   * Move circuit to OPEN state
   */
  private open(): void {
    if (this.state === 'open') return;

    const oldState = this.state;
    this.state = 'open';
    this.successes = 0;

    console.error(
      `[CircuitBreaker:${this.name}] Circuit OPENED after ${this.failures} failures. ` +
      `Will attempt reset in ${this.options.resetTimeoutMs}ms.`
    );

    this.options.onStateChange(oldState, this.state);
    this.options.onOpen();
  }

  /**
   * Move circuit to HALF-OPEN state
   */
  private moveToHalfOpen(): void {
    if (this.state === 'half-open') return;

    const oldState = this.state;
    this.state = 'half-open';
    this.failures = 0;
    this.successes = 0;

    console.log(
      `[CircuitBreaker:${this.name}] Circuit moved to HALF-OPEN. ` +
      `Testing service recovery...`
    );

    this.options.onStateChange(oldState, this.state);
    this.options.onHalfOpen();
  }

  /**
   * Move circuit to CLOSED state
   */
  private close(): void {
    if (this.state === 'closed') return;

    const oldState = this.state;
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.failureTimestamps = [];

    console.log(`[CircuitBreaker:${this.name}] Circuit CLOSED. Service recovered.`);

    this.options.onStateChange(oldState, this.state);
    this.options.onClose();
  }

  /**
   * Manually reset the circuit breaker
   */
  public reset(): void {
    this.close();
  }

  /**
   * Get current state of the circuit breaker
   */
  public getState(): CircuitBreakerState {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Get health status with metrics
   */
  public getHealth(): {
    healthy: boolean;
    state: CircuitState;
    failureRate: number;
    recentFailures: number;
    totalRequests: number;
  } {
    const recentFailures = this.getRecentFailureCount();
    const failureRate = this.totalRequests > 0
      ? this.totalFailures / this.totalRequests
      : 0;

    return {
      healthy: this.state === 'closed',
      state: this.state,
      failureRate,
      recentFailures,
      totalRequests: this.totalRequests,
    };
  }

  /**
   * Get circuit breaker name
   */
  public getName(): string {
    return this.name;
  }
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers for different services
 */
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Register a new circuit breaker
   */
  register(name: string, options: CircuitBreakerOptions): CircuitBreaker {
    if (this.breakers.has(name)) {
      throw new Error(`Circuit breaker '${name}' is already registered`);
    }

    const breaker = new CircuitBreaker(name, options);
    this.breakers.set(name, breaker);
    return breaker;
  }

  /**
   * Get a circuit breaker by name
   */
  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * Get or create a circuit breaker
   */
  getOrCreate(name: string, options: CircuitBreakerOptions): CircuitBreaker {
    const existing = this.breakers.get(name);
    if (existing) return existing;

    return this.register(name, options);
  }

  /**
   * Get all circuit breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  /**
   * Get health status of all circuit breakers
   */
  getAllHealth(): Record<string, ReturnType<CircuitBreaker['getHealth']>> {
    const health: Record<string, ReturnType<CircuitBreaker['getHealth']>> = {};

    for (const [name, breaker] of Array.from(this.breakers)) {
      health[name] = breaker.getHealth();
    }

    return health;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of Array.from(this.breakers.values())) {
      breaker.reset();
    }
  }
}

// Export singleton registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Pre-configured circuit breakers for external services
 */
export const circuitBreakers = {
  vapi: circuitBreakerRegistry.getOrCreate('vapi', {
    failureThreshold: 5,
    resetTimeoutMs: 60000, // 1 minute
    monitoringWindowMs: 60000, // 1 minute window
    successThreshold: 2,
  }),

  apify: circuitBreakerRegistry.getOrCreate('apify', {
    failureThreshold: 3,
    resetTimeoutMs: 30000, // 30 seconds
    monitoringWindowMs: 30000, // 30 second window
    successThreshold: 2,
  }),

  browserbase: circuitBreakerRegistry.getOrCreate('browserbase', {
    failureThreshold: 5,
    resetTimeoutMs: 60000, // 1 minute
    monitoringWindowMs: 60000, // 1 minute window
    successThreshold: 2,
  }),

  openai: circuitBreakerRegistry.getOrCreate('openai', {
    failureThreshold: 10,
    resetTimeoutMs: 120000, // 2 minutes
    monitoringWindowMs: 120000, // 2 minute window
    successThreshold: 3,
  }),

  anthropic: circuitBreakerRegistry.getOrCreate('anthropic', {
    failureThreshold: 10,
    resetTimeoutMs: 120000, // 2 minutes
    monitoringWindowMs: 120000, // 2 minute window
    successThreshold: 3,
  }),

  gmail: circuitBreakerRegistry.getOrCreate('gmail', {
    failureThreshold: 5,
    resetTimeoutMs: 60000, // 1 minute
    monitoringWindowMs: 60000, // 1 minute window
    successThreshold: 2,
  }),

  outlook: circuitBreakerRegistry.getOrCreate('outlook', {
    failureThreshold: 5,
    resetTimeoutMs: 60000, // 1 minute
    monitoringWindowMs: 60000, // 1 minute window
    successThreshold: 2,
  }),
};
