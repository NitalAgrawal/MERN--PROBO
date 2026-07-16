const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Global Express error handler — must be the LAST middleware in server.js.
 *
 * Handles all operational and unexpected errors and always returns the
 * standardized error shape:
 *   { success: false, message: "..." }
 *
 * Error types handled:
 *  - AppError (operational)        → use its statusCode + message
 *  - Mongoose CastError            → 404 "Resource not found."
 *  - Mongoose duplicate key 11000  → 409 "Email already in use."
 *  - Mongoose ValidationError      → 400 first validation message
 *  - JsonWebTokenError             → 401 "Invalid token."
 *  - TokenExpiredError             → 401 "Token expired."
 *  - Everything else               → 500 (generic, no leak of internals)
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message    = err.message    || 'Something went wrong. Please try again later.';

  // ── Mongoose: invalid ObjectId ───────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message    = `Resource not found.`;
  }

  // ── Mongoose: duplicate key (e.g. email) ─────────────────────────────────
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists.`;
  }

  // ── Mongoose: schema validation error ────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message    = Object.values(err.errors).map((e) => e.message)[0];
  }

  // ── JWT errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message    = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message    = 'Your session has expired. Please log in again.';
  }

  // ── In development: log stack trace for non-operational errors ───────────
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    console.error('💥 Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
