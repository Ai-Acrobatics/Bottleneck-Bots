import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
  ],

  // Set environment
  environment: import.meta.env.MODE,

  // Release tracking
  release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA,

  // Filter out certain errors
  ignoreErrors: [
    // Random plugins/extensions
    "top.GLOBALS",
    // Browser extensions
    "chrome-extension://",
    "safari-extension://",
    // Network errors
    "Failed to fetch",
    "NetworkError",
    "Load failed",
    // Common user-triggered
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // Navigation errors
    "Navigation cancelled",
    "Navigation preempted",
  ],

  // Before sending event
  beforeSend(event, hint) {
    // Don't send events in development
    if (import.meta.env.MODE === "development") {
      console.error("Sentry Error (dev mode - not sent):", hint.originalException || hint.syntheticException);
      return null;
    }

    // Filter out localhost errors in production builds
    if (event.request?.url?.includes("localhost")) {
      return null;
    }

    return event;
  },

  // Enable debug mode in development
  debug: import.meta.env.MODE === "development",
});
