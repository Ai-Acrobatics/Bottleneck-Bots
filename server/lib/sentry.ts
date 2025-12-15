import * as Sentry from "@sentry/node";
import { Express, Request, Response, NextFunction } from "express";

/**
 * Initialize Sentry for server-side error tracking
 * Only initializes in production or when SENTRY_DSN is explicitly provided
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";
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
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
    // Filter out specific errors
    beforeSend(event, hint) {
      // Don't send certain expected errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip unauthorized errors (these are expected)
        if (error.message.includes("Unauthorized") || error.message.includes("UNAUTHED")) {
          return null;
        }
        // Skip validation errors (these are user errors, not bugs)
        if (error.name === "ValidationError" || error.name === "ZodError") {
          return null;
        }
      }
      return event;
    },
  });

  console.log(`Sentry initialized for ${environment} environment`);
}

/**
 * Setup Sentry middleware for Express
 * Must be added before any other middleware/routes
 */
export function setupSentryMiddleware(app: Express) {
  if (!process.env.SENTRY_DSN) return;

  // Add request data to Sentry scope
  app.use((req: Request, _res: Response, next: NextFunction) => {
    Sentry.setContext("request", {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });
    next();
  });
}

/**
 * Sentry error handler middleware
 * Must be added AFTER all routes and other error handlers
 */
export function sentryErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Only send to Sentry if DSN is configured
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, {
      contexts: {
        request: {
          method: req.method,
          url: req.url,
          query: req.query,
        },
      },
      user: {
        // Add user context if available from auth middleware
        id: (req as any).userId,
        email: (req as any).userEmail,
      },
    });
  }

  // Pass to next error handler
  next(err);
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
export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}
