const logger = require('../config/logger');

/**
 * Standard error response format
 */
const formatError = (error, req) => {
  const timestamp = new Date().toISOString();
  const requestId = req.id || req.headers['x-request-id'] || 'unknown';

  return {
    error: {
      message: error.message || 'Internal Server Error',
      status: error.status || error.statusCode || 500,
      timestamp,
      requestId,
      path: req.path
    }
  };
};

/**
 * Global error handler middleware
 * This should be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
  // Set default error status if not set
  const status = err.status || err.statusCode || 500;

  // Log the error with context
  const errorContext = {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    requestId: req.id || req.headers['x-request-id'],
    body: req.body,
    params: req.params,
    query: req.query
  };

  if (status >= 500) {
    logger.error('Server error occurred', errorContext);
  } else {
    logger.warn('Client error occurred', errorContext);
  }

  // Don't expose sensitive error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = formatError(err, req);

  if (!isDevelopment && status >= 500) {
    errorResponse.error.message = 'Internal Server Error';
    delete errorResponse.error.stack;
  }

  res.status(status).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.method} ${req.path} not found`);
  error.status = 404;
  next(error);
};

/**
 * Async error wrapper for route handlers
 * Use this to wrap async route handlers to catch rejected promises
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler for Joi validation errors
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.isJoi) {
    const error = new Error('Validation Error');
    error.status = 400;
    error.details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return next(error);
  }
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validationErrorHandler,
  formatError
};