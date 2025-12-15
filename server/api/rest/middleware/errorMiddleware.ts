/**
 * Error Handling Middleware
 * Centralized error handling for REST API
 */

import type { Request, Response, NextFunction } from "express";

/**
 * API Error class with structured error responses
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    statusCode: number,
    message: string,
    code: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message: string = "Resource not found"): ApiError {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message: string, details?: any): ApiError {
    return new ApiError(409, message, "CONFLICT", details);
  }

  static unprocessableEntity(message: string, details?: any): ApiError {
    return new ApiError(422, message, "UNPROCESSABLE_ENTITY", details);
  }

  static tooManyRequests(message: string = "Too many requests"): ApiError {
    return new ApiError(429, message, "RATE_LIMIT_EXCEEDED");
  }

  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(500, message, "INTERNAL_ERROR");
  }

  static serviceUnavailable(message: string = "Service unavailable"): ApiError {
    return new ApiError(503, message, "SERVICE_UNAVAILABLE");
  }
}

/**
 * Error response formatter
 */
interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  details?: any;
  timestamp: string;
  path: string;
  requestId?: string;
}

/**
 * Format error response
 */
function formatErrorResponse(
  error: Error | ApiError,
  req: Request
): ErrorResponse {
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;
  const code = isApiError ? error.code : "INTERNAL_ERROR";
  const message = error.message || "An unexpected error occurred";

  const response: ErrorResponse = {
    error: getErrorName(statusCode),
    message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Add error details if available (for validation errors, etc.)
  if (isApiError && error.details) {
    response.details = error.details;
  }

  // Add request ID if available
  const requestId = (req as any).id || req.headers["x-request-id"];
  if (requestId) {
    response.requestId = requestId as string;
  }

  return response;
}

/**
 * Get HTTP error name from status code
 */
function getErrorName(statusCode: number): string {
  const errorNames: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    503: "Service Unavailable",
  };

  return errorNames[statusCode] || "Error";
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 *
 * Usage:
 * ```typescript
 * router.get('/api/v1/tasks', asyncHandler(async (req, res) => {
 *   const tasks = await getTasks();
 *   res.json(tasks);
 * }));
 * ```
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 * Must be registered last in the middleware chain
 */
export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error details
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;

  if (statusCode >= 500) {
    // Log server errors
    console.error("API Error:", {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      statusCode,
    });
  } else {
    // Log client errors at debug level
    console.debug("API Client Error:", {
      error: error.message,
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  // Send error response
  const errorResponse = formatErrorResponse(error, req);
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Handles routes that don't match any defined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = ApiError.notFound(`Route ${req.method} ${req.path} not found`);
  next(error);
}

/**
 * Request validation error handler
 * Formats validation errors from express-validator or zod
 */
export function validationErrorHandler(errors: any[]): never {
  const details = errors.map((err) => ({
    field: err.param || err.path,
    message: err.msg || err.message,
    value: err.value,
  }));

  throw ApiError.unprocessableEntity("Validation failed", details);
}
