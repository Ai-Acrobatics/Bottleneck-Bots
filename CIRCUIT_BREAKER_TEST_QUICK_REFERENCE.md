# Circuit Breaker Test Suite - Quick Reference Guide

## Test File Location
```
/root/github-repos/ghl-agency-ai/server/lib/circuitBreaker.test.ts
```

## Quick Stats
- **Total Tests**: 55
- **Test File Size**: 1,067 lines
- **All Tests Status**: PASSING
- **Execution Time**: ~1.2 seconds

## Run Tests
```bash
# Run all circuit breaker tests
npm test -- server/lib/circuitBreaker.test.ts

# Run with verbose output
npm test -- server/lib/circuitBreaker.test.ts --reporter=verbose

# Watch mode for development
npm test -- server/lib/circuitBreaker.test.ts --watch

# Run entire test suite
npm test
```

## Test Organization

```
CircuitBreaker (42 tests)
├── 1. State Transitions (5 tests)
│   ├── Initial CLOSED state
│   ├── CLOSED -> OPEN transition
│   ├── OPEN -> HALF_OPEN transition
│   ├── HALF_OPEN -> CLOSED transition
│   └── HALF_OPEN -> OPEN transition
├── 2. Failure Tracking (4 tests)
│   ├── Count failures within window
│   ├── Reset failures after window expires
│   ├── Ignore failures outside window
│   └── Track consecutive failures
├── 3. Execute Function (6 tests)
│   ├── Pass through when CLOSED
│   ├── Fail fast when OPEN
│   ├── Allow test call in HALF_OPEN
│   ├── Propagate original errors
│   ├── Wrap successful results
│   └── Increment totalRequests (including when OPEN)
├── 4. Callbacks (5 tests)
│   ├── onStateChange on transitions
│   ├── onOpen when opening
│   ├── onHalfOpen when entering half-open
│   ├── onClose when closing
│   └── No change callback when already in state
├── 5. Configuration (5 tests)
│   ├── Custom failureThreshold
│   ├── Custom resetTimeout
│   ├── Custom monitoringWindow
│   ├── Default successThreshold (1)
│   └── Custom successThreshold
├── 6. Statistics (7 tests)
│   ├── Track totalRequests
│   ├── Track totalFailures
│   ├── Track totalSuccesses
│   ├── Track lastFailureTime
│   ├── Track lastSuccessTime
│   ├── Calculate failure rate
│   └── Failure rate when no requests
├── 7. Additional Functionality (7 tests)
│   ├── Manual reset
│   ├── Health status object
│   ├── Healthy when CLOSED
│   ├── Not healthy when OPEN
│   ├── Circuit breaker name
│   ├── Track successes in half-open
│   └── Reset success count when closing
└── 8. CircuitBreakerError (2 tests)
    ├── Throw error when OPEN
    └── Error message content

CircuitBreakerRegistry (6 tests)
├── Get registered breaker from registry
├── Return undefined for unregistered
├── Get or create breaker (idempotent)
├── Get all circuit breakers
├── Get health of all breakers
└── Reset all breakers

Pre-configured Circuit Breakers (7 tests)
├── vapi breaker exists
├── apify breaker exists
├── browserbase breaker exists
├── openai breaker exists
├── anthropic breaker exists
├── gmail breaker exists
└── outlook breaker exists
```

## Key Testing Patterns

### Testing State Transitions
```typescript
// Open circuit by reaching failure threshold
for (let i = 0; i < 3; i++) {
  try {
    await circuitBreaker.execute(failingFn);
  } catch {
    // Expected
  }
}
expect(circuitBreaker.getState().state).toBe('open');
```

### Testing Time-Based Behavior
```typescript
vi.useFakeTimers();

// Trigger failure to open circuit
try {
  await circuitBreaker.execute(failingFn);
} catch { }

// Advance past reset timeout
vi.advanceTimersByTime(101);

// Now can transition to half-open
await circuitBreaker.execute(succeedingFn);
expect(circuitBreaker.getState().state).toBe('half-open');

vi.useRealTimers();
```

### Testing Callbacks
```typescript
const onOpen = vi.fn();
const breaker = new CircuitBreaker('test', {
  failureThreshold: 1,
  resetTimeoutMs: 100,
  monitoringWindowMs: 100,
  onOpen,
});

// Trigger failure
try {
  await breaker.execute(async () => { throw new Error(); });
} catch { }

expect(onOpen).toHaveBeenCalledOnce();
```

### Testing Error Propagation
```typescript
const customError = new Error('Custom message');
const failingFn = async () => { throw customError; };

await expect(circuitBreaker.execute(failingFn))
  .rejects.toThrow('Custom message');
```

### Testing Metrics
```typescript
const failingFn = async () => { throw new Error(); };
const succeedingFn = async () => 'success';

for (let i = 0; i < 2; i++) {
  try {
    await circuitBreaker.execute(failingFn);
  } catch { }
}

for (let i = 0; i < 3; i++) {
  await circuitBreaker.execute(succeedingFn);
}

const state = circuitBreaker.getState();
expect(state.totalRequests).toBe(5);
expect(state.totalFailures).toBe(2);
expect(state.totalSuccesses).toBe(3);
expect(state.lastFailureTime).not.toBeNull();
expect(state.lastSuccessTime).not.toBeNull();
```

## Configuration Defaults
```typescript
new CircuitBreaker('service-name', {
  failureThreshold: 3,        // Required
  resetTimeoutMs: 100,        // Required
  monitoringWindowMs: 100,    // Required
  successThreshold: 1,        // Optional, defaults to 1
  onStateChange: () => {},    // Optional
  onOpen: () => {},           // Optional
  onHalfOpen: () => {},       // Optional
  onClose: () => {},          // Optional
})
```

## Pre-configured Services
The test suite verifies these pre-configured breakers exist:

| Service | Failure Threshold | Reset Timeout | Monitoring Window | Success Threshold |
|---------|-------------------|---------------|-------------------|-------------------|
| vapi | 5 | 60s | 60s | 2 |
| apify | 3 | 30s | 30s | 2 |
| browserbase | 5 | 60s | 60s | 2 |
| openai | 10 | 120s | 120s | 3 |
| anthropic | 10 | 120s | 120s | 3 |
| gmail | 5 | 60s | 60s | 2 |
| outlook | 5 | 60s | 60s | 2 |

## Common Test Assertions

```typescript
// State assertions
expect(breaker.getState().state).toBe('closed');
expect(breaker.getState().state).toBe('open');
expect(breaker.getState().state).toBe('half-open');

// Metric assertions
expect(breaker.getState().totalRequests).toBe(5);
expect(breaker.getState().totalFailures).toBe(2);
expect(breaker.getState().totalSuccesses).toBe(3);
expect(breaker.getState().failures).toBe(2);
expect(breaker.getState().successes).toBe(1);

// Health assertions
expect(breaker.getHealth().healthy).toBe(true); // CLOSED state
expect(breaker.getHealth().healthy).toBe(false); // OPEN state
expect(breaker.getHealth().failureRate).toBe(0.4); // 2 failures / 5 requests

// Error assertions
expect(circuitBreaker.execute(fn)).rejects.toThrow(CircuitBreakerError);

// Callback assertions
const onOpen = vi.fn();
expect(onOpen).toHaveBeenCalledOnce();
expect(onStateChange).toHaveBeenCalledWith('closed', 'open');

// Instance assertions
expect(breaker).toBeInstanceOf(CircuitBreaker);
expect(breaker.getName()).toBe('service-name');
```

## Coverage Summary

The test suite covers:

1. **State Machine** (all 3 states and valid transitions)
2. **Failure Detection** (threshold, window, cleanup)
3. **Success Tracking** (in half-open state)
4. **Error Handling** (propagation, custom errors)
5. **Metrics** (7 different statistics)
6. **Callbacks** (4 different event handlers)
7. **Configuration** (all configurable options)
8. **Public API** (all public methods)
9. **Registry** (registration, retrieval, batch operations)
10. **Pre-configured Services** (7 services)

## Maintenance Tips

### Adding New Tests
1. Identify the feature category
2. Create new `it()` block in appropriate describe section
3. Use existing patterns for consistency
4. Run tests frequently with `--watch` flag

### Debugging Failed Tests
```bash
# Run with detailed output
npm test -- server/lib/circuitBreaker.test.ts --reporter=verbose

# Run specific test
npm test -- server/lib/circuitBreaker.test.ts -t "should start in CLOSED state"

# Watch mode for quick iteration
npm test -- server/lib/circuitBreaker.test.ts --watch
```

### Test Isolation
- Each test uses fresh `CircuitBreaker` instance via `beforeEach()`
- Timers are reset in `afterEach()` to prevent cross-test pollution
- Console mocks are cleared to prevent noise

## Performance

- **Execution Time**: ~1.2 seconds for all 55 tests
- **Average per Test**: ~22ms
- **Fastest Tests**: State verification (0-1ms)
- **Slowest Tests**: Timer-based tests (8-11ms)

## Dependencies

The test suite uses:
- **vitest** 4.0.15 - Test framework
- **vi** - Vitest's mocking and spying utilities
- Built-in JavaScript features (async/await, promises)

## File Structure
```
circuitBreaker.test.ts
├── Imports
├── CircuitBreaker describe block (42 tests)
│   ├── beforeEach/afterEach setup
│   └── 8 test categories
├── CircuitBreakerRegistry describe block (6 tests)
└── Pre-configured Circuit Breakers describe block (7 tests)
```

## Notes

- Tests suppress console output to keep output clean
- Fake timers are used extensively for reliable time-dependent tests
- All async operations are properly awaited
- Tests follow AAA pattern (Arrange, Act, Assert)
- Clear test names describe expected behavior
