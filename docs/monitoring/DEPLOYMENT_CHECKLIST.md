# Production Monitoring Deployment Checklist

## Pre-Deployment Setup

### 1. Sentry Configuration ✅
- [x] Install `@sentry/react` and `@sentry/node` packages
- [x] Create `sentry.client.config.ts` with browser integration
- [x] Create `sentry.server.config.ts` with Express integration
- [x] Update `vite.config.ts` with Sentry Vite plugin
- [x] Add error boundary component (`components/error-boundary.tsx`)
- [ ] **TODO**: Add SENTRY_DSN to Vercel environment variables
- [ ] **TODO**: Add SENTRY_AUTH_TOKEN for source maps upload

### 2. Environment Variables

Add to **Vercel Production Environment**:

```bash
# Required
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
VITE_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]

# Optional (for source maps)
SENTRY_AUTH_TOKEN=sntrys_[token]
SENTRY_ORG=your-org-name
SENTRY_PROJECT=bottleneck-bots
```

### 3. Alert Rules Configuration

Configure in **Sentry Dashboard → Alerts**:

#### Critical Alerts (Immediate Response)
- [ ] High Error Rate (>10 errors/min) → Slack #critical-alerts
- [ ] Database Connection Failures → Slack #infrastructure + PagerDuty
- [ ] API 500 Error Spike (>5 in 5min) → Slack #api-errors

#### High Priority Alerts (15-min Response)
- [ ] Unhandled Promise Rejections (>3 in 10min) → Slack #backend-errors
- [ ] Memory Leak Detection (heap >90%) → Slack #performance
- [ ] Bot Execution Failures (>5 in 10min) → Slack #bot-monitoring

#### Medium Priority Alerts (1-hour Response)
- [ ] Slow API Response (P95 >2s) → Slack #performance
- [ ] User Session Errors (>3 errors/session) → Slack #user-experience
- [ ] Payment Processing Errors → Slack #payments

### 4. Slack Integration
- [ ] Create Slack webhook URL
- [ ] Add webhook to Sentry notification settings
- [ ] Create alert channels:
  - #critical-alerts
  - #api-errors
  - #infrastructure
  - #performance
  - #user-experience
  - #bot-monitoring
  - #payments
- [ ] Test notifications with sample error

### 5. Dashboard Creation

Create in **Sentry → Dashboards**:

- [ ] **Production Health Dashboard**
  - Error rate (last 24h)
  - P50/P95/P99 latency
  - Active users
  - Top 10 errors

- [ ] **Bot Performance Dashboard**
  - Bot execution success rate
  - Average execution time
  - Browserbase session failures
  - Task queue depth

- [ ] **API Performance Dashboard**
  - Endpoint latency heatmap
  - Failed requests by route
  - Database query performance
  - Redis cache hit rate

### 6. Error Boundary Integration

- [x] Create `ErrorBoundary` component
- [ ] Wrap application root in `main.tsx`
- [ ] Add error boundaries to critical routes:
  - [ ] Dashboard (`/dashboard`)
  - [ ] Bot editor (`/bots/:id`)
  - [ ] Task execution viewer (`/tasks/:id`)
  - [ ] Settings pages

### 7. Manual Error Tracking

Add Sentry tracking to critical operations:

- [ ] Payment processing (`server/api/payments/*`)
- [ ] Bot execution (`server/services/bot-runner/*`)
- [ ] Browserbase sessions (`server/services/browserbase/*`)
- [ ] Database migrations
- [ ] Webhook handlers (`server/api/webhooks/*`)

Example:
```typescript
import * as Sentry from '@sentry/node';

try {
  await executeBotTask(taskId);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'bot-execution' },
    level: 'error',
  });
  throw error;
}
```

## Deployment Steps

### Step 1: Install Dependencies
```bash
cd /Users/julianbradley/bottleneck-bots
pnpm install
```

### Step 2: Update Vercel Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all required Sentry variables (see section 2 above)
3. Mark as "Production" and "Preview" environments

### Step 3: Deploy to Vercel
```bash
# Deploy to production
git add .
git commit -m "feat: add comprehensive Sentry monitoring"
git push origin main

# Vercel auto-deploys from main branch
```

### Step 4: Verify Deployment
- [ ] Check Vercel deployment logs for Sentry initialization
- [ ] Trigger test error in production: `/api/test/sentry-error`
- [ ] Verify error appears in Sentry dashboard
- [ ] Check source maps are working (stack traces show TypeScript)
- [ ] Verify session replay captures user interactions

### Step 5: Configure Sentry Alerts
1. Go to Sentry Dashboard → Alerts → Create Alert
2. Configure all 8 alert rules (see section 3 above)
3. Test each alert with sample error
4. Verify Slack notifications arrive

### Step 6: Create Dashboards
1. Go to Sentry Dashboard → Dashboards → Create Dashboard
2. Add widgets for each metric (see section 5 above)
3. Share dashboards with team

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error rate every hour
- [ ] Check for false positive alerts
- [ ] Tune alert thresholds if needed
- [ ] Review session replays for UX issues
- [ ] Verify all integrations working (Stripe, Browserbase, etc.)

### First Week
- [ ] Daily error rate review
- [ ] Identify top 10 errors and prioritize fixes
- [ ] Monitor performance metrics (P95 latency)
- [ ] Check for memory leaks or resource exhaustion
- [ ] Review user session errors

### First Month
- [ ] Weekly error trend analysis
- [ ] Update alert thresholds based on actual traffic
- [ ] Document common errors in playbook
- [ ] Train team on Sentry dashboard usage
- [ ] Create incident response procedures

## Testing Checklist

### Development Testing
```typescript
// Test client-side error tracking
import * as Sentry from '@sentry/react';
Sentry.captureMessage('Test client error', 'info');

// Test server-side error tracking
import * as Sentry from '@sentry/node';
Sentry.captureMessage('Test server error', 'error');
```

### Staging Testing
- [ ] Trigger authentication error
- [ ] Trigger database connection error
- [ ] Trigger API 500 error
- [ ] Trigger unhandled promise rejection
- [ ] Verify all errors appear in Sentry

### Production Testing
- [ ] Send test event via Sentry CLI
  ```bash
  npx sentry-cli send-event -m "Production test event"
  ```
- [ ] Verify alert notifications
- [ ] Check session replay recording
- [ ] Verify source maps uploaded correctly

## Rollback Plan

If monitoring causes issues:

1. **Disable Sentry in Vercel**
   ```bash
   # Remove SENTRY_DSN from environment variables
   # Redeploy
   ```

2. **Rollback to previous deployment**
   ```bash
   vercel rollback [previous-deployment-url]
   ```

3. **Disable source maps upload**
   ```bash
   # Remove SENTRY_AUTH_TOKEN from Vercel
   # Sentry will still work, just without source maps
   ```

## Success Criteria

Monitoring is successfully deployed when:

- ✅ Zero errors during deployment
- ✅ Test error appears in Sentry within 1 minute
- ✅ Slack notifications working for all alert types
- ✅ Session replay captures user interactions
- ✅ Source maps show original TypeScript code
- ✅ Performance metrics tracking (P50, P95, P99)
- ✅ All dashboards displaying data
- ✅ Team trained on using Sentry

## Maintenance Schedule

### Daily (Automated)
- Error rate monitoring (via alerts)
- Critical alert notifications

### Weekly (Manual)
- Review top 10 errors
- Check performance trends
- Update alert thresholds if needed

### Monthly (Manual)
- Full error trend analysis
- Update monitoring documentation
- Team training on new features
- Cost optimization review

## Resources

- **Sentry Dashboard**: https://sentry.io/organizations/[org]/projects/bottleneck-bots/
- **Alert Playbooks**: `docs/monitoring/ALERT_PLAYBOOKS.md`
- **Setup Guide**: `docs/monitoring/SENTRY_SETUP.md`
- **Vercel Dashboard**: https://vercel.com/[team]/bottleneck-bots
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/react/

## Contact

- **On-Call Engineer**: [Configure in PagerDuty]
- **Team Lead**: [Configure in Slack]
- **Sentry Admin**: [Configure Sentry user roles]
