/**
 * k6 Load Testing Configuration
 *
 * Test scenarios for GHL Agency AI platform
 *
 * Installation: https://k6.io/docs/getting-started/installation/
 *   brew install k6 (macOS)
 *   apt install k6 (Ubuntu/Debian)
 *   docker pull grafana/k6 (Docker)
 *
 * Usage:
 *   k6 run tests/load/api-smoke.test.js
 *   k6 run tests/load/api-load.test.js
 *   k6 run tests/load/api-stress.test.js
 *   k6 run tests/load/api-spike.test.js
 *
 * Cloud execution (Grafana Cloud k6):
 *   k6 cloud tests/load/api-load.test.js
 */

// Base configuration
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const API_KEY = __ENV.API_KEY || '';

// Common headers
export function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  return headers;
}

// Threshold configurations
export const THRESHOLDS = {
  // Response time thresholds
  http_req_duration: [
    'p(50)<200',     // 50% of requests should be below 200ms
    'p(90)<500',     // 90% of requests should be below 500ms
    'p(95)<1000',    // 95% of requests should be below 1s
    'p(99)<2000',    // 99% of requests should be below 2s
  ],
  // Error rate threshold
  http_req_failed: ['rate<0.01'], // Error rate should be below 1%
  // Throughput threshold
  http_reqs: ['rate>10'], // At least 10 requests per second
};

// Stage configurations for different test types
export const STAGES = {
  smoke: [
    { duration: '1m', target: 5 },    // Ramp up to 5 users
    { duration: '2m', target: 5 },    // Stay at 5 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  load: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  stress: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 300 },  // Ramp up to 300 users
    { duration: '5m', target: 300 },  // Stay at 300 users
    { duration: '5m', target: 0 },    // Ramp down
  ],
  spike: [
    { duration: '1m', target: 10 },   // Normal load
    { duration: '30s', target: 500 }, // Spike to 500 users
    { duration: '1m', target: 500 },  // Stay at spike
    { duration: '30s', target: 10 },  // Back to normal
    { duration: '2m', target: 10 },   // Stay at normal
    { duration: '1m', target: 0 },    // Ramp down
  ],
  soak: [
    { duration: '5m', target: 100 },   // Ramp up
    { duration: '4h', target: 100 },   // Soak at 100 users for 4 hours
    { duration: '5m', target: 0 },     // Ramp down
  ],
};

// API endpoints to test
export const ENDPOINTS = {
  health: '/api/health',
  healthDetailed: '/api/health/detailed',
  agents: '/api/agents',
  tasks: '/api/tasks',
  swarm: '/api/swarm/status',
  memory: '/api/memory/stats',
  knowledge: '/api/knowledge/patterns',
  browser: '/api/browser/sessions',
};

// Utility functions
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
