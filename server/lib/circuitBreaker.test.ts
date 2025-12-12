import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
  circuitBreakerRegistry,
  circuitBreakers,
} from './circuitBreaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;
  let consoleSpy: any;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      resetTimeoutMs: 100,
      monitoringWindowMs: 100,
      successThreshold: 2,
    });

    // Suppress console output during tests
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe('1. State Transitions', () => {
    it('should start in CLOSED state', () => {
      const state = circuitBreaker.getState();
      expect(state.state).toBe('closed');
    });

    it('should transition to OPEN after failure threshold reached', async () => {
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Trigger failures until threshold is reached
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(circuitBreaker.getState().state).toBe('open');
    });

    it('should transition to HALF-OPEN after reset timeout', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(circuitBreaker.getState().state).toBe('open');

      // Advance time past reset timeout
      vi.advanceTimersByTime(101);

      // Next execute should attempt half-open
      const succeedingFn = async () => 'success';
      await circuitBreaker.execute(succeedingFn);

      expect(circuitBreaker.getState().state).toBe('half-open');

      vi.useRealTimers();
    });

    it('should transition from HALF-OPEN to CLOSED on success', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      vi.advanceTimersByTime(101);

      // Move to half-open and succeed
      const succeedingFn = async () => 'success';
      await circuitBreaker.execute(succeedingFn);
      await circuitBreaker.execute(succeedingFn);

      expect(circuitBreaker.getState().state).toBe('closed');

      vi.useRealTimers();
    });

    it('should transition from HALF-OPEN to OPEN on failure', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      vi.advanceTimersByTime(101);

      // Move to half-open
      const succeedingFn = async () => 'success';
      await circuitBreaker.execute(succeedingFn);

      expect(circuitBreaker.getState().state).toBe('half-open');

      // Fail in half-open should go back to open
      try {
        await circuitBreaker.execute(failingFn);
      } catch {
        // Expected
      }

      expect(circuitBreaker.getState().state).toBe('open');

      vi.useRealTimers();
    });
  });

  describe('2. Failure Tracking', () => {
    it('should count failures within monitoring window', async () => {
      const failingFn = async () => {
        throw new Error('Service error');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      const state = circuitBreaker.getState();
      expect(state.totalFailures).toBe(2);
    });

    it('should reset failure count after monitoring window expires', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Trigger 2 failures
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(circuitBreaker.getState().failures).toBe(2);

      // Advance past monitoring window
      vi.advanceTimersByTime(101);

      // Success should reset failures
      const succeedingFn = async () => 'success';
      await circuitBreaker.execute(succeedingFn);

      expect(circuitBreaker.getState().failures).toBe(0);

      vi.useRealTimers();
    });

    it('should ignore failures outside monitoring window', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Trigger 1 failure
      try {
        await circuitBreaker.execute(failingFn);
      } catch {
        // Expected
      }

      expect(circuitBreaker.getState().failures).toBe(1);

      // Advance past monitoring window
      vi.advanceTimersByTime(101);

      // Trigger another failure
      try {
        await circuitBreaker.execute(failingFn);
      } catch {
        // Expected
      }

      // Should only count recent failures
      const recentFailures = circuitBreaker.getHealth().recentFailures;
      expect(recentFailures).toBe(1);

      vi.useRealTimers();
    });

    it('should track consecutive failures', async () => {
      const failingFn = async () => {
        throw new Error('Service error');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      const state = circuitBreaker.getState();
      expect(state.totalFailures).toBe(3);
      expect(state.lastFailureTime).not.toBeNull();
    });
  });

  describe('3. Execute Function', () => {
    it('should pass through calls when CLOSED', async () => {
      const fn = vi.fn(async () => 'success');
      const result = await circuitBreaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledOnce();
    });

    it('should fail fast when OPEN (throw CircuitOpenError)', async () => {
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      // Next call should fail fast without executing function
      const shouldNotBeCalled = vi.fn(async () => 'success');
      await expect(circuitBreaker.execute(shouldNotBeCalled)).rejects.toThrow(
        CircuitBreakerError
      );
      expect(shouldNotBeCalled).not.toHaveBeenCalled();
    });

    it('should allow single test call when HALF-OPEN', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      vi.advanceTimersByTime(101);

      // Should allow function to be called in half-open
      const testFn = vi.fn(async () => 'success');
      const result = await circuitBreaker.execute(testFn);

      expect(testFn).toHaveBeenCalledOnce();
      expect(result).toBe('success');

      vi.useRealTimers();
    });

    it('should propagate original errors', async () => {
      const customError = new Error('Custom service error');
      const failingFn = async () => {
        throw customError;
      };

      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow(
        'Custom service error'
      );
    });

    it('should wrap successful results', async () => {
      const data = { id: 123, name: 'test' };
      const fn = async () => data;

      const result = await circuitBreaker.execute(fn);

      expect(result).toEqual(data);
    });

    it('should increment totalRequests on each execute', async () => {
      const fn = async () => 'success';

      await circuitBreaker.execute(fn);
      await circuitBreaker.execute(fn);
      await circuitBreaker.execute(fn);

      expect(circuitBreaker.getState().totalRequests).toBe(3);
    });

    it('should increment totalRequests even when circuit is open', async () => {
      const failingFn = async () => {
        throw new Error('Service error');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(circuitBreaker.getState().totalRequests).toBe(3);

      // Try to execute on open circuit
      try {
        await circuitBreaker.execute(failingFn);
      } catch {
        // Expected
      }

      expect(circuitBreaker.getState().totalRequests).toBe(4);
    });
  });

  describe('4. Callbacks', () => {
    it('should call onStateChange on state transitions', async () => {
      const onStateChange = vi.fn();
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 2,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
        onStateChange,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(onStateChange).toHaveBeenCalledWith('closed', 'open');
    });

    it('should call onOpen when circuit opens', async () => {
      const onOpen = vi.fn();
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 2,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
        onOpen,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(onOpen).toHaveBeenCalledOnce();
    });

    it('should call onHalfOpen when entering half-open', async () => {
      vi.useFakeTimers();
      const onHalfOpen = vi.fn();
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 2,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
        onHalfOpen,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      vi.advanceTimersByTime(101);

      const succeedingFn = async () => 'success';
      await breaker.execute(succeedingFn);

      expect(onHalfOpen).toHaveBeenCalledOnce();

      vi.useRealTimers();
    });

    it('should call onClose when circuit closes', async () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 2,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
        successThreshold: 1,
        onClose,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      vi.advanceTimersByTime(101);

      const succeedingFn = async () => 'success';
      await breaker.execute(succeedingFn);

      expect(onClose).toHaveBeenCalledOnce();

      vi.useRealTimers();
    });

    it('should not call onStateChange if state does not change', async () => {
      const onStateChange = vi.fn();
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 2,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
        onStateChange,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      // Open circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(onStateChange).toHaveBeenCalledOnce();

      // Try to open again (already open)
      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }

      // Should still only be called once
      expect(onStateChange).toHaveBeenCalledOnce();
    });
  });

  describe('5. Configuration', () => {
    it('should use custom failureThreshold', async () => {
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 5,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      // Should need 5 failures to open
      for (let i = 0; i < 4; i++) {
        try {
          await breaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(breaker.getState().state).toBe('closed');

      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }

      expect(breaker.getState().state).toBe('open');
    });

    it('should use custom resetTimeout', async () => {
      vi.useFakeTimers();
      const resetTimeoutMs = 250;
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 1,
        resetTimeoutMs,
        monitoringWindowMs: 100,
        successThreshold: 2, // Require 2 successes to close
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }

      expect(breaker.getState().state).toBe('open');

      // Advance less than resetTimeout
      vi.advanceTimersByTime(100);

      const succeedingFn = async () => 'success';
      try {
        await breaker.execute(succeedingFn);
      } catch {
        // Should still be open - expected to throw CircuitBreakerError
      }

      expect(breaker.getState().state).toBe('open');

      // Advance past resetTimeout (need to go to 251ms total)
      vi.advanceTimersByTime(160);

      // Now should be allowed to move to half-open
      const result = await breaker.execute(succeedingFn);

      expect(result).toBe('success');
      expect(breaker.getState().state).toBe('half-open');

      vi.useRealTimers();
    });

    it('should use custom monitoringWindow', async () => {
      vi.useFakeTimers();
      const monitoringWindowMs = 200;
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 2,
        resetTimeoutMs: 100,
        monitoringWindowMs,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }

      // Advance past initial monitoring window but not the custom one
      vi.advanceTimersByTime(150);

      const succeedingFn = async () => 'success';
      await breaker.execute(succeedingFn);

      // Failure count should be reset since it was within window
      expect(breaker.getState().failures).toBe(0);

      vi.useRealTimers();
    });

    it('should use default successThreshold of 1', async () => {
      vi.useFakeTimers();
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 1,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
        // No successThreshold specified
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }

      vi.advanceTimersByTime(101);

      const succeedingFn = async () => 'success';
      await breaker.execute(succeedingFn);

      // Should close after 1 success with default threshold
      expect(breaker.getState().state).toBe('closed');

      vi.useRealTimers();
    });

    it('should use custom successThreshold', async () => {
      vi.useFakeTimers();
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 1,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
        successThreshold: 3,
      });

      const failingFn = async () => {
        throw new Error('Error');
      };

      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }

      vi.advanceTimersByTime(101);

      const succeedingFn = async () => 'success';
      await breaker.execute(succeedingFn);
      expect(breaker.getState().state).toBe('half-open');

      await breaker.execute(succeedingFn);
      expect(breaker.getState().state).toBe('half-open');

      await breaker.execute(succeedingFn);
      expect(breaker.getState().state).toBe('closed');

      vi.useRealTimers();
    });
  });

  describe('6. Statistics', () => {
    it('should track totalRequests', async () => {
      const fn = async () => 'success';

      await circuitBreaker.execute(fn);
      expect(circuitBreaker.getState().totalRequests).toBe(1);

      await circuitBreaker.execute(fn);
      expect(circuitBreaker.getState().totalRequests).toBe(2);

      await circuitBreaker.execute(fn);
      expect(circuitBreaker.getState().totalRequests).toBe(3);
    });

    it('should track totalFailures', async () => {
      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(circuitBreaker.getState().totalFailures).toBe(3);
    });

    it('should track totalSuccesses', async () => {
      const fn = async () => 'success';

      await circuitBreaker.execute(fn);
      await circuitBreaker.execute(fn);
      expect(circuitBreaker.getState().totalSuccesses).toBe(2);
    });

    it('should track lastFailureTime', async () => {
      const failingFn = async () => {
        throw new Error('Error');
      };

      expect(circuitBreaker.getState().lastFailureTime).toBeNull();

      try {
        await circuitBreaker.execute(failingFn);
      } catch {
        // Expected
      }

      expect(circuitBreaker.getState().lastFailureTime).not.toBeNull();
    });

    it('should track lastSuccessTime', async () => {
      const fn = async () => 'success';

      expect(circuitBreaker.getState().lastSuccessTime).toBeNull();

      await circuitBreaker.execute(fn);

      expect(circuitBreaker.getState().lastSuccessTime).not.toBeNull();
    });

    it('should calculate failure rate correctly', async () => {
      const failingFn = async () => {
        throw new Error('Error');
      };
      const succeedingFn = async () => 'success';

      // 2 failures
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      // 3 successes
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(succeedingFn);
      }

      const health = circuitBreaker.getHealth();
      expect(health.failureRate).toBe(2 / 5); // 2 failures out of 5 total requests
    });

    it('should return 0 failure rate when no requests', () => {
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 1,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
      });

      const health = breaker.getHealth();
      expect(health.failureRate).toBe(0);
    });
  });

  describe('7. Additional Functionality', () => {
    it('should allow manual reset', async () => {
      const failingFn = async () => {
        throw new Error('Error');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      expect(circuitBreaker.getState().state).toBe('open');

      // Reset manually
      circuitBreaker.reset();

      expect(circuitBreaker.getState().state).toBe('closed');
      expect(circuitBreaker.getState().failures).toBe(0);
    });

    it('should provide health status', () => {
      const health = circuitBreaker.getHealth();

      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('state');
      expect(health).toHaveProperty('failureRate');
      expect(health).toHaveProperty('recentFailures');
      expect(health).toHaveProperty('totalRequests');
    });

    it('should indicate healthy when CLOSED', async () => {
      const fn = async () => 'success';
      await circuitBreaker.execute(fn);

      const health = circuitBreaker.getHealth();
      expect(health.healthy).toBe(true);
    });

    it('should indicate not healthy when OPEN', async () => {
      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      const health = circuitBreaker.getHealth();
      expect(health.healthy).toBe(false);
    });

    it('should provide circuit breaker name', () => {
      const breaker = new CircuitBreaker('my-service', {
        failureThreshold: 1,
        resetTimeoutMs: 100,
        monitoringWindowMs: 100,
      });

      expect(breaker.getName()).toBe('my-service');
    });

    it('should track successes in half-open state', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      vi.advanceTimersByTime(101);

      const succeedingFn = async () => 'success';
      await circuitBreaker.execute(succeedingFn);

      expect(circuitBreaker.getState().successes).toBe(1);

      vi.useRealTimers();
    });

    it('should reset success count when closing', async () => {
      vi.useFakeTimers();
      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      vi.advanceTimersByTime(101);

      const succeedingFn = async () => 'success';
      await circuitBreaker.execute(succeedingFn);
      await circuitBreaker.execute(succeedingFn);

      expect(circuitBreaker.getState().state).toBe('closed');
      expect(circuitBreaker.getState().successes).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('8. CircuitBreakerError', () => {
    it('should throw CircuitBreakerError when circuit is open', async () => {
      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      try {
        await circuitBreaker.execute(failingFn);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CircuitBreakerError);
        expect((error as CircuitBreakerError).state).toBe('open');
      }
    });

    it('should have correct error message', async () => {
      const failingFn = async () => {
        throw new Error('Error');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch {
          // Expected
        }
      }

      try {
        await circuitBreaker.execute(failingFn);
        expect.fail('Should have thrown');
      } catch (error) {
        const cbError = error as CircuitBreakerError;
        expect(cbError.message).toContain('Circuit breaker');
        expect(cbError.message).toContain('OPEN');
      }
    });
  });
});

describe('CircuitBreakerRegistry', () => {
  it('should get a registered circuit breaker from global registry', () => {
    const breaker = circuitBreakerRegistry.get('vapi');
    expect(breaker).toBeInstanceOf(CircuitBreaker);
  });

  it('should return undefined for unregistered breaker', () => {
    const breaker = circuitBreakerRegistry.get('nonexistent-service-xyz');
    expect(breaker).toBeUndefined();
  });

  it('should get or create a circuit breaker', () => {
    const breaker1 = circuitBreakerRegistry.getOrCreate('test-service-unique', {
      failureThreshold: 3,
      resetTimeoutMs: 100,
      monitoringWindowMs: 100,
    });

    const breaker2 = circuitBreakerRegistry.getOrCreate('test-service-unique', {
      failureThreshold: 5,
      resetTimeoutMs: 200,
      monitoringWindowMs: 200,
    });

    expect(breaker1).toBe(breaker2);
  });

  it('should get all circuit breakers', () => {
    const all = circuitBreakerRegistry.getAll();
    expect(all.size).toBeGreaterThan(0);
    expect(all.has('vapi')).toBe(true);
    expect(all.has('apify')).toBe(true);
  });

  it('should get health of all circuit breakers', () => {
    const health = circuitBreakerRegistry.getAllHealth();
    expect(Object.keys(health).length).toBeGreaterThan(0);
    expect(health).toHaveProperty('vapi');
    expect(health.vapi).toHaveProperty('healthy');
  });

  it('should reset all circuit breakers', async () => {
    const breaker1 = circuitBreakerRegistry.getOrCreate('test-reset-1', {
      failureThreshold: 1,
      resetTimeoutMs: 100,
      monitoringWindowMs: 100,
    });

    const breaker2 = circuitBreakerRegistry.getOrCreate('test-reset-2', {
      failureThreshold: 1,
      resetTimeoutMs: 100,
      monitoringWindowMs: 100,
    });

    const failingFn = async () => {
      throw new Error('Error');
    };

    try {
      await breaker1.execute(failingFn);
    } catch {
      // Expected
    }

    try {
      await breaker2.execute(failingFn);
    } catch {
      // Expected
    }

    expect(breaker1.getState().state).toBe('open');
    expect(breaker2.getState().state).toBe('open');

    circuitBreakerRegistry.resetAll();

    expect(breaker1.getState().state).toBe('closed');
    expect(breaker2.getState().state).toBe('closed');
  });
});

describe('Pre-configured Circuit Breakers', () => {
  it('should have vapi circuit breaker configured', () => {
    expect(circuitBreakers.vapi).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakers.vapi.getName()).toBe('vapi');
  });

  it('should have apify circuit breaker configured', () => {
    expect(circuitBreakers.apify).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakers.apify.getName()).toBe('apify');
  });

  it('should have browserbase circuit breaker configured', () => {
    expect(circuitBreakers.browserbase).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakers.browserbase.getName()).toBe('browserbase');
  });

  it('should have openai circuit breaker configured', () => {
    expect(circuitBreakers.openai).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakers.openai.getName()).toBe('openai');
  });

  it('should have anthropic circuit breaker configured', () => {
    expect(circuitBreakers.anthropic).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakers.anthropic.getName()).toBe('anthropic');
  });

  it('should have gmail circuit breaker configured', () => {
    expect(circuitBreakers.gmail).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakers.gmail.getName()).toBe('gmail');
  });

  it('should have outlook circuit breaker configured', () => {
    expect(circuitBreakers.outlook).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakers.outlook.getName()).toBe('outlook');
  });
});
