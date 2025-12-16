/**
 * Spike Test
 *
 * Tests system behavior under sudden traffic spikes
 * Validates auto-scaling and recovery capabilities
 *
 * Usage: k6 run tests/load/api-spike.test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { BASE_URL, getHeaders, ENDPOINTS, STAGES } from './k6.config.js';

// Custom metrics
const errorRate = new Rate('errors');
const recoveryTime = new Trend('recovery_time');
const spikeErrors = new Counter('spike_errors');
const normalErrors = new Counter('normal_errors');

// Test configuration
export const options = {
  stages: STAGES.spike,
  thresholds: {
    // Spike test has different thresholds
    http_req_duration: ['p(95)<5000'], // Allow 5s during spike
    http_req_failed: ['rate<0.20'], // Up to 20% errors during spike
    recovery_time: ['p(95)<1000'], // Quick recovery expected
  },
  tags: {
    testType: 'spike',
    environment: __ENV.ENVIRONMENT || 'local',
  },
};

// Track test phases
let isSpike = false;
let spikeStart = 0;
let spikeEnd = 0;

export function setup() {
  console.log(`Running SPIKE test against ${BASE_URL}`);
  console.log('This test simulates sudden traffic bursts');

  return {
    startTime: Date.now(),
    testId: `spike-${Date.now()}`,
    phases: [],
  };
}

export default function (data) {
  const headers = getHeaders();
  const currentVUs = __VU;

  // Detect spike phase (more than 100 VUs indicates spike)
  const wasSpike = isSpike;
  isSpike = currentVUs > 100;

  // Track phase transitions
  if (!wasSpike && isSpike) {
    spikeStart = Date.now();
    console.log(`SPIKE STARTED at ${spikeStart}`);
  } else if (wasSpike && !isSpike) {
    spikeEnd = Date.now();
    console.log(`SPIKE ENDED at ${spikeEnd}, duration: ${spikeEnd - spikeStart}ms`);
  }

  // Primary endpoint test
  const startTime = Date.now();
  const res = http.get(`${BASE_URL}${ENDPOINTS.health}`, {
    headers,
    timeout: '10s',
    tags: { phase: isSpike ? 'spike' : 'normal' },
  });
  const duration = Date.now() - startTime;

  // Track recovery time after spike
  if (!isSpike && spikeEnd > 0 && Date.now() - spikeEnd < 60000) {
    recoveryTime.add(duration);
  }

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response < 5s': (r) => r.timings.duration < 5000,
    'body not empty': (r) => r.body && r.body.length > 0,
  });

  if (!success) {
    errorRate.add(1);
    if (isSpike) {
      spikeErrors.add(1);
    } else {
      normalErrors.add(1);
    }
  } else {
    errorRate.add(0);
  }

  // Additional endpoints during normal load
  if (!isSpike) {
    testSecondaryEndpoints(headers);
  }

  // Minimal sleep during spike, normal sleep otherwise
  sleep(isSpike ? 0.1 : 1);
}

function testSecondaryEndpoints(headers) {
  const endpoints = [
    ENDPOINTS.agents,
    ENDPOINTS.tasks,
  ];

  for (const endpoint of endpoints) {
    const res = http.get(`${BASE_URL}${endpoint}`, {
      headers,
      tags: { phase: 'normal', endpoint },
    });

    check(res, {
      [`${endpoint} status valid`]: (r) => r.status < 500,
    });

    sleep(0.5);
  }
}

export function teardown(data) {
  const duration = ((Date.now() - data.startTime) / 1000).toFixed(2);
  console.log(`Spike test completed in ${duration}s`);
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const { metrics } = data;

  // Analyze spike vs normal performance
  const spikeAnalysis = {
    testType: 'spike',
    timestamp: new Date().toISOString(),
    normalPhase: {
      // These would need actual phase-based filtering in production
      avgResponseTime: metrics.http_req_duration?.values?.avg || 0,
    },
    spikePhase: {
      peakVUs: 500,
      errorsDuringSpike: metrics.spike_errors?.values?.count || 0,
    },
    recovery: {
      p95RecoveryTime: metrics.recovery_time?.values?.['p(95)'] || 0,
      errorsAfterSpike: metrics.normal_errors?.values?.count || 0,
    },
    overall: {
      totalRequests: metrics.http_reqs?.values?.count || 0,
      totalErrors: metrics.http_req_failed?.values?.count || 0,
      errorRate: (metrics.errors?.values?.rate * 100) || 0,
    },
  };

  return {
    [`tests/load/results/spike-${timestamp}.json`]: JSON.stringify(data, null, 2),
    [`tests/load/results/spike-analysis-${timestamp}.json`]: JSON.stringify(spikeAnalysis, null, 2),
    stdout: generateSpikeSummary(spikeAnalysis),
  };
}

function generateSpikeSummary(analysis) {
  const { overall, spikePhase, recovery } = analysis;

  const recoveryStatus = recovery.p95RecoveryTime < 1000 ? '✓ FAST' : '⚠ SLOW';
  const overallStatus = overall.errorRate < 20 ? '✓ PASSED' : '✗ FAILED';

  return `
╔════════════════════════════════════════════════════════════╗
║                  SPIKE TEST RESULTS                        ║
╠════════════════════════════════════════════════════════════╣
║  Overall Status: ${overallStatus.padEnd(38)}║
╠════════════════════════════════════════════════════════════╣
║  Spike Phase:                                              ║
║    Peak Virtual Users:    ${spikePhase.peakVUs.toString().padEnd(30)}║
║    Errors During Spike:   ${spikePhase.errorsDuringSpike.toString().padEnd(30)}║
╠════════════════════════════════════════════════════════════╣
║  Recovery Phase:                                           ║
║    Recovery Status:       ${recoveryStatus.padEnd(30)}║
║    p95 Recovery Time:     ${recovery.p95RecoveryTime.toFixed(0)}ms${' '.repeat(27)}║
║    Errors After Spike:    ${recovery.errorsAfterSpike.toString().padEnd(30)}║
╠════════════════════════════════════════════════════════════╣
║  Overall:                                                  ║
║    Total Requests:        ${overall.totalRequests.toString().padEnd(30)}║
║    Total Errors:          ${overall.totalErrors.toString().padEnd(30)}║
║    Error Rate:            ${overall.errorRate.toFixed(2)}%${' '.repeat(27)}║
╚════════════════════════════════════════════════════════════╝
`;
}
