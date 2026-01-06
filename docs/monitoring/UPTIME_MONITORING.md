# Uptime Monitoring Setup for Bottleneck Bots

**Site:** https://bottleneckbots.com
**Last Updated:** 2026-01-06

---

## Overview

This guide covers setting up external uptime monitoring for the Bottleneck Bots production environment. Uptime monitoring complements Sentry error tracking and Vercel Analytics by providing external availability checks.

---

## Recommended Services

### Option 1: UptimeRobot (Free Tier Available)

**Website:** https://uptimerobot.com

**Free Plan Features:**
- 50 monitors
- 5-minute check intervals
- Email/SMS/Slack alerts
- Status pages

**Setup Steps:**

1. Create an account at https://uptimerobot.com
2. Click "Add New Monitor"
3. Configure the following monitors:

#### Monitor 1: Main Site Availability
```
Monitor Type: HTTP(s)
Friendly Name: Bottleneck Bots - Main Site
URL: https://bottleneckbots.com
Monitoring Interval: 5 minutes
Alert Contacts: [your-email]
```

#### Monitor 2: API Health Check
```
Monitor Type: HTTP(s)
Friendly Name: Bottleneck Bots - API Health
URL: https://bottleneckbots.com/api/trpc/health.liveness
Monitoring Interval: 5 minutes
Alert Contacts: [your-email]
HTTP Method: GET
Expected Status Code: 200
```

#### Monitor 3: API Readiness Check
```
Monitor Type: HTTP(s)
Friendly Name: Bottleneck Bots - API Readiness
URL: https://bottleneckbots.com/api/trpc/health.readiness
Monitoring Interval: 5 minutes
Alert Contacts: [your-email]
HTTP Method: GET
Expected Status Code: 200
```

#### Monitor 4: SSL Certificate
```
Monitor Type: SSL Certificate
Friendly Name: Bottleneck Bots - SSL
URL: https://bottleneckbots.com
Alert Before Expiry: 14 days
Alert Contacts: [your-email]
```

---

### Option 2: Better Uptime (More Features)

**Website:** https://betteruptime.com

**Free Plan Features:**
- 10 monitors
- 3-minute check intervals
- Incident management
- Status pages
- On-call scheduling

**Setup Steps:**

1. Sign up at https://betteruptime.com
2. Add team members and configure escalation policies
3. Create monitors:

#### Monitor Configuration:
```yaml
- name: "Bottleneck Bots - Website"
  url: "https://bottleneckbots.com"
  check_frequency: 180  # 3 minutes
  regions:
    - us-east
    - us-west
    - eu-west
  expected_status_code: 200

- name: "Bottleneck Bots - API Liveness"
  url: "https://bottleneckbots.com/api/trpc/health.liveness"
  check_frequency: 180
  expected_status_code: 200
  timeout: 10

- name: "Bottleneck Bots - API Readiness"
  url: "https://bottleneckbots.com/api/trpc/health.readiness"
  check_frequency: 180
  expected_status_code: 200
  timeout: 15
```

---

### Option 3: Vercel Built-in (Already Configured)

Vercel provides built-in monitoring for projects deployed on their platform:

1. Go to Vercel Dashboard > Your Project > Analytics
2. Web Vitals and performance metrics are automatically tracked
3. Edge and serverless function monitoring available

**Note:** Vercel Analytics is already integrated in this project via `@vercel/analytics`.

---

## Health Check Endpoints

The following endpoints are available for monitoring:

### `/api/trpc/health.liveness`
- **Purpose:** Simple liveness check - confirms server is running
- **Response:** `{ "status": "ok", "timestamp": "2026-01-06T..." }`
- **Use Case:** Basic uptime monitoring

### `/api/trpc/health.readiness`
- **Purpose:** Checks if server can handle requests (all services available)
- **Response:**
  ```json
  {
    "ready": true,
    "timestamp": "2026-01-06T...",
    "unavailableServices": [],
    "reasons": []
  }
  ```
- **Use Case:** Load balancer health checks

### `/api/trpc/health.getSystemHealth`
- **Purpose:** Comprehensive system health with circuit breaker states
- **Response:**
  ```json
  {
    "healthy": true,
    "timestamp": "2026-01-06T...",
    "circuits": {
      "vapi": { "state": "closed", "healthy": true },
      "browserbase": { "state": "closed", "healthy": true },
      ...
    }
  }
  ```
- **Use Case:** Detailed monitoring dashboards

### `/api/trpc/health.getMetrics`
- **Purpose:** Performance metrics for all services
- **Response:** Aggregate request counts, failure rates, success rates

---

## Alert Configuration

### Recommended Alert Channels:

1. **Email** - Primary notification method
2. **Slack** - Team communication (configure webhook in SLACK_WEBHOOK_URL)
3. **PagerDuty/Opsgenie** - On-call escalation for critical issues

### Alert Thresholds:

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time | > 2s | > 5s |
| Availability | < 99.5% | < 99% |
| Error Rate | > 1% | > 5% |
| SSL Expiry | 14 days | 7 days |

---

## Status Page Setup

### UptimeRobot Status Page:

1. Go to UptimeRobot > Status Pages
2. Create new status page
3. Configure:
   - Custom domain: status.bottleneckbots.com (optional)
   - Add all monitors
   - Enable incident history

### Better Uptime Status Page:

1. Go to Better Uptime > Status Pages
2. Create page with custom branding
3. Configure public/private visibility
4. Add incident communication templates

---

## Integration with Existing Monitoring

The monitoring stack for Bottleneck Bots includes:

| Layer | Tool | Status |
|-------|------|--------|
| Error Tracking | Sentry | Configured |
| Web Analytics | Vercel Analytics | Configured |
| Speed Insights | Vercel Speed Insights | Configured |
| Uptime Monitoring | UptimeRobot/Better Uptime | Needs Setup |
| APM | Sentry Performance | Configured |

---

## Troubleshooting

### Health Check Returns 500

1. Check database connectivity:
   ```bash
   curl https://bottleneckbots.com/api/trpc/health.getDatabaseHealth
   ```

2. Check circuit breaker states:
   ```bash
   curl https://bottleneckbots.com/api/trpc/health.getCircuitStates
   ```

3. Review Sentry for recent errors

### High Response Times

1. Check Vercel Analytics for slow endpoints
2. Review database query performance in Sentry
3. Check Browserbase session limits

### Service Degradation

1. Check individual service health:
   ```bash
   curl "https://bottleneckbots.com/api/trpc/health.getServiceHealth?input={\"serviceName\":\"browserbase\"}"
   ```

2. Reset circuit breaker if needed (via admin API)

---

## Maintenance Windows

When performing maintenance:

1. Update status page to "Under Maintenance"
2. Pause uptime monitoring alerts
3. After maintenance, verify:
   - Health checks pass
   - Resume monitoring
   - Update status page

---

## Quick Reference

### Monitor URLs:
- Main: `https://bottleneckbots.com`
- Liveness: `https://bottleneckbots.com/api/trpc/health.liveness`
- Readiness: `https://bottleneckbots.com/api/trpc/health.readiness`
- System Health: `https://bottleneckbots.com/api/trpc/health.getSystemHealth`

### Expected Response Times:
- Liveness: < 100ms
- Readiness: < 500ms
- System Health: < 1s

### Escalation:
1. Auto-retry (3 attempts)
2. Email notification (5 min)
3. Slack notification (5 min)
4. PagerDuty (15 min downtime)
