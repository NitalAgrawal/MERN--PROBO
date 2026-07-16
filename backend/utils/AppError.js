const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Custom application error class.
 * Pass this to next() to trigger the global error handler with
 * a specific HTTP status and clean message.
 *
 * @example
 *   throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status     = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true; // distinguish from unexpected crashes

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
