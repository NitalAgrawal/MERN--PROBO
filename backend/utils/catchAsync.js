/**
 * Wraps an async Express route handler and forwards any rejection
 * to the next() error handler — eliminates try/catch boilerplate.
 *
 * @param {Function} fn  Async route handler
 * @returns {Function}   Express middleware
 *
 * @example
 *   router.get('/me', catchAsync(async (req, res, next) => { ... }));
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
