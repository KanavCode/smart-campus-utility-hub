const { logger } = require('../config/db');

/**
 * Global error handling middleware
 * This should be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  
  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 409;
        message = 'Duplicate entry: Resource already exists';
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Invalid reference: Related resource does not exist';
        break;
      case '23502': // Not null violation
        statusCode = 400;
        message = 'Missing required field';
        break;
      case '22P02': // Invalid text representation
        statusCode = 400;
        message = 'Invalid data format';
        break;
      case '42P01': // Undefined table
        statusCode = 500;
        message = 'Database configuration error';
        break;
      default:
        message = 'Database error occurred';
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
  }

  // Send error response
  const response = {
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err.details || null
    } : undefined
  };

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 * Should be used before the error handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper to avoid try-catch in every controller
 * Usage: asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create custom error with status code
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ApiError
};
