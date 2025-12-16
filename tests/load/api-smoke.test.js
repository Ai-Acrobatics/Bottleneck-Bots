/**
 * Smoke Test
 *
 * Verifies basic system functionality under minimal load
 * Run before other tests to ensure system is responsive
 *
 * Usage: k6 run tests/load/api-smoke.test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, getHeaders, ENDPOINTS, STAGES, THRESHOLDS } from './k6.config.js';

// Custom metrics
const errorRate = new Rate('errors');
const healthCheckDuration = new Trend('health_check_duration');

// Test configuration
export const options = {
  stages: STAGES.smoke,
  thresholds: {
    ...THRESHOLDS,
    errors: ['rate<0.05'], // Smoke test allows 5% error rate
    health_check_duration: ['p(95)<500'], // Health checks should be fast
  },
  // Tags for filtering results
  tags: {
    testType: 'smoke',
    environment: __ENV.ENVIRONMENT || 'local',
  },
};

// Setup function - runs once before test
export function setup() {
  console.log(`Running smoke test against ${BASE_URL}`);

  // Verify system is reachable
  const res = http.get(`${BASE_URL}${ENDPOINTS.health}`, {
    headers: getHeaders(),
    timeout: '10s',
  });

  if (res.status !== 200) {
    throw new Error(`System health check failed: ${res.status}`);
  }

  return { startTime: Date.now() };
}

// Main test function - runs repeatedly for each VU
export default function (data) {
  const headers = getHeaders();

  // Test 1: Health check endpoint
  const healthStart = Date.now();
  const healthRes = http.get(`${BASE_URL}${ENDPOINTS.health}`, { headers });
  healthCheckDuration.add(Date.now() - healthStart);

  const healthOk = check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 500ms': (r) => r.timings.duration < 500,
    'health body contains status': (r) => r.body && r.body.includes('status'),
  });

  errorRate.add(!healthOk);

  sleep(1);

  // Test 2: Detailed health check
  const detailedRes = http.get(`${BASE_URL}${ENDPOINTS.healthDetailed}`, { headers });

  const detailedOk = check(detailedRes, {
    'detailed health status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    'detailed health has components': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.components !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!detailedOk);

  sleep(1);

  // Test 3: API endpoints availability
  const endpoints = [
    ENDPOINTS.agents,
    ENDPOINTS.tasks,
    ENDPOINTS.swarm,
  ];

  for (const endpoint of endpoints) {
    const res = http.get(`${BASE_URL}${endpoint}`, {
      headers,
      timeout: '5s',
    });

    const ok = check(res, {
      [`${endpoint} responds`]: (r) => r.status < 500,
    });

    errorRate.add(!ok);
    sleep(0.5);
  }

  // Think time between iterations
  sleep(2);
}

// Teardown function - runs once after test
export function teardown(data) {
  const duration = ((Date.now() - data.startTime) / 1000).toFixed(2);
  console.log(`Smoke test completed in ${duration}s`);
}

// Handle test summary
export function handleSummary(data) {
  return {
    'tests/load/results/smoke-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const { metrics } = data;
  const lines = [
    '\n===== SMOKE TEST RESULTS =====\n',
    `Total Requests: ${metrics.http_reqs?.values?.count || 0}`,
    `Failed Requests: ${metrics.http_req_failed?.values?.rate?.toFixed(4) || 0}`,
    `Avg Duration: ${metrics.http_req_duration?.values?.avg?.toFixed(2) || 0}ms`,
    `p95 Duration: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 0}ms`,
    `Error Rate: ${(metrics.errors?.values?.rate * 100)?.toFixed(2) || 0}%`,
    '\n==============================\n',
  ];

  return lines.join('\n');
}
