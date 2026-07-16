const rateLimit = require('express-rate-limit');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Auth rate limiter — applied to register, login, and forgot-password.
 * Limits each IP to 15 requests per 15-minute window.
 */
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              15,
  standardHeaders:  true,  // return rate limit info in RateLimit-* headers
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
});

module.exports = { authLimiter };
