import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for client-side error tracking
 * Only initializes in production or when SENTRY_DSN is explicitly provided
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || "development";
  const isProduction = environment === "production";

  // Skip initialization if no DSN is provided or in development without explicit DSN
  if (!dsn) {
    if (isProduction) {
      console.warn("Sentry DSN not configured. Error tracking disabled.");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    // Enable performance monitoring in production
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text content and block all media (privacy-first approach)
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
    // Session Replay
    replaysSessionSampleRate: isProduction ? 0.1 : 0, // 10% in prod, disabled in dev
    replaysOnErrorSampleRate: 1.0, // Always capture on error
    // Filter out localhost and development URLs
    beforeSend(event, hint) {
      // Don't send errors from localhost in non-production environments
      if (!isProduction && typeof window !== "undefined") {
        const isLocalhost = window.location.hostname === "localhost" ||
                           window.location.hostname === "127.0.0.1";
        if (isLocalhost) {
          return null;
        }
      }
      return event;
    },
  });

  console.log(`Sentry initialized for ${environment} environment`);
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.setContext("additional", context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}
