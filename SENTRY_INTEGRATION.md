# Sentry Error Tracking Integration

This document outlines the Sentry integration for production error monitoring in the ghl-agency-ai project.

## Overview

Sentry has been integrated into both the frontend (React) and backend (Express) to provide comprehensive error tracking and performance monitoring in production.

## Required Packages

Add these packages to your `package.json`:

```bash
pnpm add @sentry/react @sentry/node @sentry/profiling-node
```

## Configuration

### Environment Variables

Add the following to your `.env` file (already added to `.env.example`):

```bash
# Sentry Error Tracking
SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_DSN=your_sentry_dsn_here
```

**Important for Vercel Deployment:**
- Add both `SENTRY_DSN` and `VITE_SENTRY_DSN` to your Vercel environment variables
- The `VITE_` prefix is required for client-side environment variables in Vite

### Getting Your Sentry DSN

1. Create a Sentry account at https://sentry.io
2. Create a new project (select React for frontend, Node.js for backend)
3. Get your DSN from: Settings → Projects → [Your Project] → Client Keys (DSN)
4. Use the same DSN for both `SENTRY_DSN` and `VITE_SENTRY_DSN`

## Implementation Details

### Client-Side (React)

#### Files Created/Modified:

1. **`client/src/lib/sentry.ts`** - Sentry initialization and helper functions
   - Initializes Sentry with browser tracing
   - Session replay for error debugging
   - Privacy-first configuration (masks text, blocks media)
   - Helper functions: `captureException`, `captureMessage`, `setUser`, `addBreadcrumb`

2. **`client/src/main.tsx`** - Early initialization
   - Calls `initSentry()` as early as possible
   - Ensures errors are captured from app startup

3. **`client/src/components/ErrorBoundary.tsx`** - Error boundary integration
   - Added `componentDidCatch` lifecycle method
   - Captures React component errors with stack traces
   - Sends errors to Sentry with component context

#### Features:
- **Performance Monitoring**: Tracks page load times, navigation, and user interactions
- **Session Replay**: Records user sessions when errors occur (privacy-preserving)
- **Error Context**: Captures component stack traces and user information
- **Smart Filtering**: Filters out localhost errors in development

### Server-Side (Express)

#### Files Created/Modified:

1. **`server/lib/sentry.ts`** - Sentry initialization and middleware
   - Initializes Sentry with profiling support
   - Request/response tracking
   - Error handler middleware
   - Helper functions: `captureException`, `captureMessage`, `setUser`, `addBreadcrumb`

2. **`server/_core/index.ts`** - Express middleware integration
   - Calls `initSentry()` on startup
   - Adds `setupSentryRequestHandler` (first middleware)
   - Adds `setupSentryTracingHandler` (after request handler)
   - Adds `sentryErrorHandler` (last middleware, before generic error handler)

#### Features:
- **Request Tracking**: Captures HTTP request details (method, URL, headers, query)
- **Performance Profiling**: Tracks function execution times and bottlenecks
- **User Context**: Attaches user information from auth middleware
- **Smart Filtering**: Excludes expected errors (unauthorized, validation errors)

## Usage Examples

### Manually Capture Errors

#### Client-Side:
```typescript
import { captureException, captureMessage, setUser } from "@/lib/sentry";

// Capture an exception with context
try {
  // some code
} catch (error) {
  captureException(error, { action: "user-action", data: {...} });
}

// Log a message
captureMessage("Something interesting happened", "info");

// Set user context
setUser({ id: "123", email: "user@example.com" });
```

#### Server-Side:
```typescript
import { captureException, addBreadcrumb } from "../lib/sentry";

// Capture an exception
try {
  // some code
} catch (error) {
  captureException(error, { endpoint: "/api/example" });
}

// Add debugging breadcrumb
addBreadcrumb("User performed action", "user", { userId: "123" });
```

## Configuration Options

### Sample Rates

The implementation uses smart sampling to reduce costs while maintaining visibility:

- **Production**:
  - Traces: 10% (performance monitoring)
  - Replays: 10% on normal sessions, 100% on errors
  - Profiles: 10% (server profiling)

- **Development**:
  - Traces: 100% (full visibility)
  - Replays: Disabled (not needed locally)
  - Profiles: 100%

### Privacy Considerations

- **Client replay**: All text is masked, all media is blocked
- **Server data**: Sensitive headers and auth tokens are automatically filtered
- **User errors**: Validation errors and unauthorized errors are not sent (expected behavior)

## Deployment Checklist

### Vercel Deployment

1. **Install Dependencies**:
   ```bash
   pnpm add @sentry/react @sentry/node @sentry/profiling-node
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `SENTRY_DSN`: Your Sentry DSN
   - `VITE_SENTRY_DSN`: Same DSN (for client-side)

3. **Deploy**:
   ```bash
   git add .
   git commit -m "Add Sentry error tracking"
   git push
   ```

4. **Verify**:
   - Check Sentry dashboard for incoming events
   - Test by triggering an error in production
   - Verify errors appear in Sentry within 1-2 minutes

## Monitoring & Alerts

### Sentry Dashboard

Access your errors at: `https://sentry.io/organizations/[org]/issues/`

### Recommended Alerts

Set up alerts in Sentry for:
- New issues detected
- High-frequency errors (>10 per hour)
- Performance degradation (P95 latency)
- Critical error rate threshold (>5% error rate)

### Integration with Slack/Email

Configure in Sentry Settings → Integrations:
- **Slack**: Real-time error notifications
- **Email**: Daily/weekly error summaries
- **GitHub**: Auto-create issues for critical errors

## Testing

### Test Client-Side Error Tracking

Add a test button in development:
```tsx
<button onClick={() => {
  throw new Error("Test Sentry Client Error");
}}>
  Test Sentry
</button>
```

### Test Server-Side Error Tracking

```bash
curl http://localhost:3000/api/test-error
```

Or add a test route:
```typescript
app.get("/api/test-error", () => {
  throw new Error("Test Sentry Server Error");
});
```

## Performance Impact

- **Client bundle size**: ~50KB gzipped (with tree-shaking)
- **Server memory**: <10MB overhead
- **Runtime performance**: <1% overhead with 10% sampling
- **Network**: Minimal (errors batched, compressed)

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN configuration**: Verify `SENTRY_DSN` and `VITE_SENTRY_DSN` are set
2. **Check environment**: Sentry only initializes if DSN is provided
3. **Check console**: Look for "Sentry initialized" log message
4. **Verify network**: Check browser Network tab for requests to `sentry.io`

### Too Many Errors

1. **Increase sampling**: Reduce `replaysSessionSampleRate` and `tracesSampleRate`
2. **Add filters**: Update `beforeSend` in sentry config to filter more errors
3. **Set quotas**: Configure in Sentry dashboard under Settings → Quotas

### Development Noise

Errors from localhost are automatically filtered in non-production environments.

## Cost Optimization

Sentry pricing is based on events and replays:

- **Free tier**: 5,000 errors/month, 50 replays/month
- **Paid tier**: Starts at $26/month for 50K errors

To optimize costs:
1. Use smart sampling (already configured)
2. Filter expected errors (already configured)
3. Set alerts for quota usage
4. Monitor usage in Sentry dashboard

## Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)

## Maintenance

- **Review errors weekly**: Triage and fix high-priority issues
- **Update Sentry SDK**: Keep packages up-to-date for new features
- **Adjust sampling**: Monitor costs and adjust rates as needed
- **Clean up old issues**: Archive resolved issues in Sentry dashboard
