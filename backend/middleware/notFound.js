const HTTP_STATUS = require('../constants/httpStatus');

/**
 * 404 handler — registered after all routes in server.js.
 * Catches any request that didn't match a registered route.
 */
const notFound = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found.',
  });
};

module.exports = notFound;
