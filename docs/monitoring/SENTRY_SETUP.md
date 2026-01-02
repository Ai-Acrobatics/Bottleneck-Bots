# Sentry Monitoring Setup

## Overview

Bottleneck Bots uses Sentry for production error tracking, performance monitoring, and session replay. This document outlines the monitoring infrastructure and alerting strategy.

## Architecture

### Client-Side Monitoring (`sentry.client.config.ts`)
- **Error Tracking**: Captures unhandled exceptions and promise rejections
- **Session Replay**: Records user sessions when errors occur (10% sample rate normally, 100% on errors)
- **Performance Monitoring**: Tracks page load times, API calls, and user interactions
- **Browser Profiling**: Identifies performance bottlenecks in React components

**Key Features:**
- Masked PII (all text and media blocked in replays)
- Browser extension errors filtered out
- Network error noise reduction
- Development mode logging without sending to Sentry

### Server-Side Monitoring (`sentry.server.config.ts`)
- **API Error Tracking**: Captures Express route errors and unhandled exceptions
- **Performance Tracing**: Monitors API endpoint latency and database queries
- **Profiling**: Identifies slow functions and CPU bottlenecks
- **HTTP Integration**: Tracks all HTTP requests and responses

**Key Features:**
- Express middleware integration
- Database query tracking
- Redis connection monitoring
- Development mode console logging

## Environment Variables

Add to `.env` and Vercel environment variables:

```bash
# Sentry Error Tracking (required for production)
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
VITE_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]

# Optional: For source maps upload
SENTRY_AUTH_TOKEN=sntrys_[token]
SENTRY_ORG=your-org-name
SENTRY_PROJECT=bottleneck-bots
```

## Critical Alert Rules

Configure these alerts in Sentry UI (Settings → Alerts):

### 1. High Error Rate Alert
**Trigger:** More than 10 errors per minute
**Notification:** Slack #critical-alerts + Email
**Severity:** Critical
```
Issue Count >= 10 errors in 1 minute
Environment: production
```

### 2. API 500 Error Spike
**Trigger:** 5+ internal server errors in 5 minutes
**Notification:** Slack #api-errors + PagerDuty
**Severity:** High
```
Issue Count >= 5 errors in 5 minutes
Tags: status_code: 500
Environment: production
```

### 3. Database Connection Failures
**Trigger:** Any database connection error
**Notification:** Slack #infrastructure + Email
**Severity:** Critical
```
Issue Contains: "database" OR "postgres" OR "connection pool"
Environment: production
```

### 4. Unhandled Promise Rejections
**Trigger:** 3+ unhandled rejections in 10 minutes
**Notification:** Slack #backend-errors
**Severity:** High
```
Issue Type: UnhandledRejection
Issue Count >= 3 errors in 10 minutes
Environment: production
```

### 5. Memory Leak Detection
**Trigger:** Heap usage > 90%
**Notification:** Slack #performance + Email
**Severity:** High
```
Transaction: memory usage > 90%
Environment: production
```

### 6. Slow API Response (P95 > 2s)
**Trigger:** P95 latency exceeds 2 seconds
**Notification:** Slack #performance
**Severity:** Medium
```
Transaction Duration (p95) > 2000ms
Environment: production
```

### 7. Session Replay Error Rate
**Trigger:** User experiencing 3+ errors in single session
**Notification:** Slack #user-experience
**Severity:** Medium
```
Issue Count >= 3 errors per session
With Session Replay attached
```

## Error Boundaries

Implement React error boundaries to catch component errors:

```tsx
// components/error-boundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Usage in Application

### Wrap App Root
```tsx
// client/index.tsx
import { ErrorBoundary } from './components/error-boundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

### Wrap Critical Routes
```tsx
// app/routes/dashboard.tsx
<ErrorBoundary fallback={<DashboardErrorFallback />}>
  <Dashboard />
</ErrorBoundary>
```

### Manual Error Tracking
```tsx
import * as Sentry from '@sentry/react';

try {
  // Risky operation
  await processPayment(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'payments',
      user_plan: user.plan,
    },
    level: 'error',
  });
  throw error;
}
```

### Performance Tracking
```tsx
import * as Sentry from '@sentry/react';

const transaction = Sentry.startTransaction({
  name: 'Bot Execution',
  op: 'task',
});

try {
  const span = transaction.startChild({
    op: 'http',
    description: 'API Call',
  });

  await executeBotTask(botId);

  span.finish();
} finally {
  transaction.finish();
}
```

## Vercel Deployment Configuration

Add to Vercel project settings:

1. **Environment Variables:**
   - `SENTRY_DSN` (Server)
   - `VITE_SENTRY_DSN` (Client)
   - `SENTRY_AUTH_TOKEN` (Optional, for source maps)

2. **Build Command:**
   ```bash
   pnpm build
   ```
   (Vite build will include Sentry automatically)

3. **Post-Deploy Hook:**
   Configure Sentry release tracking:
   ```bash
   sentry-cli releases new $VERCEL_GIT_COMMIT_SHA
   sentry-cli releases finalize $VERCEL_GIT_COMMIT_SHA
   ```

## Dashboard Recommendations

Create custom Sentry dashboards for:

1. **Production Health**
   - Error rate (last 24h)
   - P50/P95/P99 latency
   - Session replay availability
   - Top 10 errors by volume

2. **API Performance**
   - Endpoint latency heatmap
   - Failed requests by route
   - Database query performance
   - Redis cache hit rate

3. **User Experience**
   - Errors by user session
   - Browser distribution
   - Geographic error distribution
   - Time-to-interactive metrics

## Testing Sentry Integration

### Development
```bash
# Client-side test
import * as Sentry from '@sentry/react';
Sentry.captureMessage('Test error from dev', 'info');

# Server-side test
import * as Sentry from '@sentry/node';
Sentry.captureMessage('Test server error', 'error');
```

### Production
Use Sentry CLI to verify:
```bash
npx sentry-cli send-event -m "Production test event"
```

## Next Steps

1. ✅ Add Sentry DSN to Vercel environment variables
2. ✅ Configure alert rules in Sentry dashboard
3. ✅ Set up Slack webhook for notifications
4. ✅ Create error boundary components
5. ✅ Test error tracking in staging environment
6. ✅ Monitor first week of production errors
7. ✅ Tune alert thresholds based on actual traffic

## Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Node Docs](https://docs.sentry.io/platforms/node/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/vite/)
- [Alert Rules Best Practices](https://docs.sentry.io/product/alerts/create-alerts/)
