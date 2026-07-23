const logger = require('../services/logger/logger');

const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  const sanitized = { ...body };
  const sensitiveKeys = ['password', 'confirmPassword', 'token', 'refreshToken', 'secret', 'apiKey'];
  sensitiveKeys.forEach((key) => {
    if (key in sanitized) {
      sanitized[key] = '***REDACTED***';
    }
  });
  return sanitized;
};

const errorLogger = (err, req, res, next) => {
  const requestId = req.id || req.requestId || req.headers['x-request-id'] || 'N/A';
  const userId = req.user ? (req.user._id || req.user.id) : 'Anonymous';
  const route = req.originalUrl || req.url;

  const errContext = {
    requestId,
    userId,
    route,
    method: req.method,
    body: sanitizeBody(req.body),
    name: err.name,
    message: err.message,
    stack: err.stack,
    providerFailure: Boolean(err.isProviderFailure || err.aiProvider),
    cloudinaryFailure: Boolean(err.isCloudinaryFailure || (err.message && err.message.toLowerCase().includes('cloudinary'))),
    exportFailure: Boolean(err.isExportFailure || (err.message && err.message.toLowerCase().includes('export'))),
  };

  logger.error(errContext, `[Central Error Log] ${req.method} ${route} - ${err.message}`);

  next(err);
};

module.exports = errorLogger;
