import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Enable profiling
  profilesSampleRate: 1.0,

  integrations: [
    Sentry.httpIntegration({ tracing: true }),
    Sentry.expressIntegration(),
    Sentry.nodeProfilingIntegration(),
  ],

  // Set environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Filter out certain errors
  ignoreErrors: [
    // Common network issues
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
    "ECONNRESET",
    // Redis connection issues (non-critical)
    "Redis connection lost",
    // Database connection pool warnings
    "Connection terminated unexpectedly",
  ],

  // Before sending event
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      console.error("Sentry Error (dev mode - not sent):", hint.originalException || hint.syntheticException);
      return null;
    }

    // Add additional context for server errors
    if (event.request) {
      event.tags = {
        ...event.tags,
        server: "express",
      };
    }

    return event;
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});
