const rateLimit = require('express-rate-limit');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Authentication Rate Limiter
 * Limits each IP to 15 requests per 15-minute window.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
});

/**
 * AI Generation Rate Limiter
 * Limits heavy AI generation tasks to 10 requests per 5-minute window.
 */
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI generation requests. Please wait a few minutes before trying again.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
});

/**
 * Media Upload Rate Limiter
 * Limits file uploads to 20 uploads per 10-minute window.
 */
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. Please wait before uploading more media.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
});

/**
 * Book Export Rate Limiter
 * Limits PDF/EPUB/HTML export generation to 10 requests per 10-minute window.
 */
const exportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Export limit reached. Please wait before requesting another export.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
});

module.exports = {
  authLimiter,
  aiLimiter,
  uploadLimiter,
  exportLimiter,
};
