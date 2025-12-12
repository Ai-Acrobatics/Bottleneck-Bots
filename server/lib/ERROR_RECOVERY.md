# Error Recovery System

Comprehensive error recovery implementation with retry logic and circuit breaker patterns for all external service integrations.

## Overview

This system provides resilient error handling for all external service calls, preventing cascading failures and improving system reliability.

### Key Features

- **Exponential Backoff Retry**: Automatically retries transient failures with increasing delays
- **Circuit Breaker Pattern**: Prevents overwhelming failing services with continuous requests
- **Service-Specific Configuration**: Each service has optimized retry and circuit breaker settings
- **Health Monitoring**: Real-time visibility into service health and circuit states
- **Automatic Recovery**: Services automatically recover when they become healthy again

## Architecture

### Components

1. **Retry Logic** (`server/lib/retry.ts`)
   - Exponential backoff with jitter
   - Configurable retry attempts and delays
   - Smart error classification (retryable vs non-retryable)

2. **Circuit Breaker** (`server/lib/circuitBreaker.ts`)
   - Three states: CLOSED (healthy), OPEN (failing), HALF-OPEN (testing)
   - Automatic state transitions based on failure thresholds
   - Per-service circuit breakers with custom configurations

3. **Health Monitoring** (`server/api/routers/health.ts`)
   - System-wide health status endpoint
   - Individual service health checks
   - Circuit breaker metrics and states

## Usage

### Retry Logic

#### Basic Usage

```typescript
import { withRetry, DEFAULT_RETRY_OPTIONS } from '../lib/retry';

// Simple retry with defaults
const result = await withRetry(async () => {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
});

// Custom retry configuration
const result = await withRetry(
  async () => {
    // Your async operation
  },
  {
    maxAttempts: 5,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  }
);
```

#### Advanced Usage

```typescript
// With custom retry callback
const result = await withRetry(
  async () => {
    // Your async operation
  },
  {
    maxAttempts: 3,
    onRetry: (error, attempt, nextDelay) => {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      console.log(`Retrying in ${nextDelay}ms...`);
    },
  }
);

// Custom retryable error patterns
const result = await withRetry(
  async () => {
    // Your async operation
  },
  {
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'rate limit'],
  }
);
```

#### Decorator Pattern

```typescript
import { Retry } from '../lib/retry';

class MyService {
  @Retry({ maxAttempts: 3 })
  async fetchData() {
    // Automatically retried on failure
    const response = await fetch('https://api.example.com/data');
    return response.json();
  }
}
```

### Circuit Breaker

#### Using Pre-configured Circuit Breakers

```typescript
import { circuitBreakers } from '../lib/circuitBreaker';

// Execute with circuit breaker protection
const result = await circuitBreakers.vapi.execute(async () => {
  const response = await fetch('https://api.vapi.ai/call');
  return response.json();
});
```

#### Creating Custom Circuit Breakers

```typescript
import { CircuitBreaker } from '../lib/circuitBreaker';

const myCircuit = new CircuitBreaker('myService', {
  failureThreshold: 5,      // Open after 5 failures
  resetTimeoutMs: 60000,    // Try recovery after 1 minute
  monitoringWindowMs: 60000, // Count failures in 1-minute window
  successThreshold: 2,      // Require 2 successes to close
});

const result = await myCircuit.execute(async () => {
  // Your operation
});
```

#### Combining Retry + Circuit Breaker

```typescript
import { withRetry } from '../lib/retry';
import { circuitBreakers } from '../lib/circuitBreaker';

// Best practice: Circuit breaker wraps retry logic
const result = await circuitBreakers.vapi.execute(async () => {
  return await withRetry(async () => {
    const response = await fetch('https://api.vapi.ai/call');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }, {
    maxAttempts: 3,
    initialDelayMs: 1000,
  });
});
```

## Pre-configured Services

The following services have pre-configured circuit breakers:

### Vapi (Voice AI)
```typescript
circuitBreakers.vapi
```
- **Failure Threshold**: 5 failures
- **Reset Timeout**: 60 seconds
- **Success Threshold**: 2 successes

### Apify (Lead Enrichment)
```typescript
circuitBreakers.apify
```
- **Failure Threshold**: 3 failures
- **Reset Timeout**: 30 seconds
- **Success Threshold**: 2 successes

### Browserbase (Browser Automation)
```typescript
circuitBreakers.browserbase
```
- **Failure Threshold**: 5 failures
- **Reset Timeout**: 60 seconds
- **Success Threshold**: 2 successes

### OpenAI (AI Models)
```typescript
circuitBreakers.openai
```
- **Failure Threshold**: 10 failures
- **Reset Timeout**: 120 seconds
- **Success Threshold**: 3 successes

### Anthropic (Claude AI)
```typescript
circuitBreakers.anthropic
```
- **Failure Threshold**: 10 failures
- **Reset Timeout**: 120 seconds
- **Success Threshold**: 3 successes

### Gmail (Email Provider)
```typescript
circuitBreakers.gmail
```
- **Failure Threshold**: 5 failures
- **Reset Timeout**: 60 seconds
- **Success Threshold**: 2 successes

### Outlook (Email Provider)
```typescript
circuitBreakers.outlook
```
- **Failure Threshold**: 5 failures
- **Reset Timeout**: 60 seconds
- **Success Threshold**: 2 successes

## Health Monitoring

### Available Endpoints

Access health information via tRPC:

```typescript
// Get overall system health
const health = await trpc.health.getSystemHealth.query();
console.log('System healthy:', health.healthy);
console.log('Circuit states:', health.circuits);

// Get specific service health
const vapiHealth = await trpc.health.getServiceHealth.query({
  serviceName: 'vapi'
});
console.log('Vapi state:', vapiHealth.state.state);

// Get all circuit breaker states
const states = await trpc.health.getCircuitStates.query();

// Get service availability summary
const availability = await trpc.health.getServiceAvailability.query();
console.log('Available services:', availability.available);
console.log('Unavailable services:', availability.unavailable);

// Get comprehensive metrics
const metrics = await trpc.health.getMetrics.query();
console.log('Total requests:', metrics.totalRequests);
console.log('Overall failure rate:', metrics.overallFailureRate);

// Liveness probe (for Kubernetes/Docker)
const liveness = await trpc.health.liveness.query();

// Readiness probe (for load balancers)
const readiness = await trpc.health.readiness.query();
```

### Manual Circuit Management

```typescript
// Reset a specific circuit breaker
await trpc.health.resetCircuit.mutate({
  serviceName: 'vapi'
});

// Reset all circuit breakers (use with caution)
await trpc.health.resetAllCircuits.mutate();
```

## Error Classification

### Retryable Errors

These errors trigger automatic retries:
- Network errors (ECONNRESET, ECONNREFUSED, ETIMEDOUT)
- DNS errors (ENOTFOUND)
- HTTP 5xx server errors
- HTTP 429 rate limit errors
- Timeout errors
- Service unavailable errors

### Non-Retryable Errors

These errors fail immediately without retries:
- HTTP 4xx client errors (except 429)
- Validation errors
- Authentication errors
- Invalid input errors

## Implementation Examples

### Service Implementation

```typescript
// server/services/myservice.service.ts
import { withRetry, DEFAULT_RETRY_OPTIONS } from '../lib/retry';
import { circuitBreakers } from '../lib/circuitBreaker';

export class MyService {
  async fetchData(id: string): Promise<any> {
    return await circuitBreakers.myService.execute(async () => {
      return await withRetry(async () => {
        const response = await fetch(`https://api.example.com/data/${id}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      }, {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: 3,
        initialDelayMs: 1000,
      });
    });
  }
}
```

## Best Practices

1. **Always Use Circuit Breakers**: Wrap all external service calls with circuit breakers
2. **Configure Retry Logic**: Set appropriate retry parameters for each service
3. **Layer Protection**: Circuit breaker should wrap retry logic, not the other way around
4. **Monitor Health**: Regularly check circuit breaker states in production
5. **Handle CircuitBreakerError**: Catch and handle circuit breaker errors gracefully
6. **Log Appropriately**: Retry logic logs warnings; circuit breakers log errors
7. **Test Failure Scenarios**: Verify behavior when services are down
8. **Set Realistic Thresholds**: Configure failure thresholds based on service SLAs

## Monitoring in Production

### Setting Up Alerts

Monitor these metrics in your observability platform:

```typescript
const metrics = await trpc.health.getMetrics.query();

// Alert conditions:
if (metrics.overallFailureRate > 0.1) {
  // Alert: High failure rate (>10%)
}

const availability = await trpc.health.getServiceAvailability.query();
if (availability.unavailable.length > 0) {
  // Alert: Services are unavailable
}
```

### Dashboard Integration

```typescript
// Periodic health check for dashboards
setInterval(async () => {
  const health = await trpc.health.getSystemHealth.query();

  // Send to monitoring system
  sendMetric('system.health', health.healthy ? 1 : 0);

  for (const [service, state] of Object.entries(health.circuits)) {
    sendMetric(`circuit.${service}.state`, {
      closed: 0,
      'half-open': 1,
      open: 2,
    }[state.state]);

    sendMetric(`circuit.${service}.failure_rate`, state.failureRate);
  }
}, 60000); // Every minute
```

## Troubleshooting

### Circuit Breaker Stuck Open

If a circuit breaker remains open:

1. Check the service status manually
2. Review recent error logs
3. Verify network connectivity
4. Consider manually resetting: `trpc.health.resetCircuit.mutate({ serviceName: 'vapi' })`

### High Retry Rates

If you see excessive retries:

1. Check if errors are truly transient
2. Adjust retry parameters (fewer attempts, longer delays)
3. Add custom retryable error patterns
4. Consider if the service is fundamentally broken

### False Positives

If circuit breakers trip too easily:

1. Increase `failureThreshold`
2. Increase `monitoringWindowMs`
3. Decrease `successThreshold` for faster recovery

## Future Enhancements

Potential improvements to consider:

- [ ] Bulkhead pattern for resource isolation
- [ ] Fallback strategies when circuits open
- [ ] Adaptive timeout configuration
- [ ] Per-endpoint circuit breakers
- [ ] Integration with distributed tracing
- [ ] Automatic recovery testing
- [ ] Circuit breaker dashboards
- [ ] Prometheus metrics export
