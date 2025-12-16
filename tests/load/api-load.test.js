/**
 * Load Test
 *
 * Tests system under expected normal and peak load
 * Validates performance under realistic traffic patterns
 *
 * Usage: k6 run tests/load/api-load.test.js
 * Cloud: k6 cloud tests/load/api-load.test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { BASE_URL, getHeaders, ENDPOINTS, STAGES, THRESHOLDS, randomInt } from './k6.config.js';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: STAGES.load,
  thresholds: {
    ...THRESHOLDS,
    errors: ['rate<0.01'], // Less than 1% error rate
    api_duration: ['p(95)<1000'], // 95% of API calls under 1s
    successful_requests: ['count>1000'], // At least 1000 successful requests
  },
  // Scenarios for more complex load patterns
  scenarios: {
    // Main API traffic
    api_traffic: {
      executor: 'ramping-vus',
      stages: STAGES.load,
      gracefulRampDown: '30s',
    },
    // Background health checks
    health_checks: {
      executor: 'constant-arrival-rate',
      rate: 10, // 10 requests per second
      timeUnit: '1s',
      duration: '16m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      exec: 'healthCheck',
    },
  },
  tags: {
    testType: 'load',
    environment: __ENV.ENVIRONMENT || 'local',
  },
};

export function setup() {
  console.log(`Running load test against ${BASE_URL}`);
  console.log(`Using API key: ${__ENV.API_KEY ? 'Yes' : 'No'}`);

  // Warm up the system
  const warmupRes = http.get(`${BASE_URL}${ENDPOINTS.health}`);
  if (warmupRes.status !== 200) {
    console.warn('System may not be fully healthy');
  }

  return {
    startTime: Date.now(),
    testId: `load-${Date.now()}`,
  };
}

// Main test scenario
export default function (data) {
  const headers = getHeaders();

  group('API Endpoints', () => {
    // Test agent listing
    group('Agents API', () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}${ENDPOINTS.agents}`, {
        headers,
        tags: { endpoint: 'agents' },
      });
      apiDuration.add(Date.now() - start);

      const success = check(res, {
        'agents status is 200': (r) => r.status === 200,
        'agents response time < 1s': (r) => r.timings.duration < 1000,
      });

      if (success) {
        successfulRequests.add(1);
      } else {
        failedRequests.add(1);
        errorRate.add(1);
      }
    });

    sleep(randomInt(1, 3));

    // Test task listing
    group('Tasks API', () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}${ENDPOINTS.tasks}`, {
        headers,
        tags: { endpoint: 'tasks' },
      });
      apiDuration.add(Date.now() - start);

      const success = check(res, {
        'tasks status is 200': (r) => r.status === 200,
        'tasks response time < 1s': (r) => r.timings.duration < 1000,
      });

      if (success) {
        successfulRequests.add(1);
      } else {
        failedRequests.add(1);
        errorRate.add(1);
      }
    });

    sleep(randomInt(1, 3));

    // Test swarm status
    group('Swarm API', () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}${ENDPOINTS.swarm}`, {
        headers,
        tags: { endpoint: 'swarm' },
      });
      apiDuration.add(Date.now() - start);

      const success = check(res, {
        'swarm status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      });

      if (success) {
        successfulRequests.add(1);
      } else {
        failedRequests.add(1);
        errorRate.add(1);
      }
    });

    sleep(randomInt(1, 3));

    // Test memory stats
    group('Memory API', () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}${ENDPOINTS.memory}`, {
        headers,
        tags: { endpoint: 'memory' },
      });
      apiDuration.add(Date.now() - start);

      const success = check(res, {
        'memory status is valid': (r) => r.status < 500,
      });

      if (success) {
        successfulRequests.add(1);
      } else {
        failedRequests.add(1);
        errorRate.add(1);
      }
    });
  });

  // Simulate realistic user behavior with think time
  sleep(randomInt(2, 5));
}

// Health check scenario
export function healthCheck() {
  const res = http.get(`${BASE_URL}${ENDPOINTS.health}`, {
    headers: getHeaders(),
    tags: { endpoint: 'health' },
  });

  check(res, {
    'health check passed': (r) => r.status === 200,
    'health check fast': (r) => r.timings.duration < 500,
  });
}

export function teardown(data) {
  const duration = ((Date.now() - data.startTime) / 1000 / 60).toFixed(2);
  console.log(`Load test completed in ${duration} minutes`);
  console.log(`Test ID: ${data.testId}`);
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return {
    [`tests/load/results/load-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: generateTextSummary(data),
  };
}

function generateTextSummary(data) {
  const { metrics } = data;

  const lines = [
    '\n========== LOAD TEST RESULTS ==========\n',
    'Request Statistics:',
    `  Total Requests: ${metrics.http_reqs?.values?.count || 0}`,
    `  Request Rate: ${metrics.http_reqs?.values?.rate?.toFixed(2) || 0}/s`,
    `  Failed Rate: ${(metrics.http_req_failed?.values?.rate * 100)?.toFixed(2) || 0}%`,
    '',
    'Response Times:',
    `  Average: ${metrics.http_req_duration?.values?.avg?.toFixed(2) || 0}ms`,
    `  Median: ${metrics.http_req_duration?.values?.med?.toFixed(2) || 0}ms`,
    `  p90: ${metrics.http_req_duration?.values?.['p(90)']?.toFixed(2) || 0}ms`,
    `  p95: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 0}ms`,
    `  p99: ${metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 0}ms`,
    '',
    'Custom Metrics:',
    `  Error Rate: ${(metrics.errors?.values?.rate * 100)?.toFixed(2) || 0}%`,
    `  Successful Requests: ${metrics.successful_requests?.values?.count || 0}`,
    `  Failed Requests: ${metrics.failed_requests?.values?.count || 0}`,
    '',
    'Threshold Results:',
    ...Object.entries(data.root_group?.checks || {}).map(
      ([name, check]) => `  ${check.passes > 0 ? '✓' : '✗'} ${name}: ${check.passes}/${check.passes + check.fails}`
    ),
    '\n========================================\n',
  ];

  return lines.join('\n');
}
