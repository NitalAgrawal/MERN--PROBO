const AppError    = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Generic Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), register);
 *
 * On failure: passes a 400 AppError to next() with the first validation message.
 * On success: attaches the parsed (type-safe) body to req.body and calls next().
 *
 * @param {import('zod').ZodSchema} schema  Zod schema to validate req.body against
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Flatten all Zod errors and surface the first human-readable message
    const errors  = result.error.errors;
    const message = errors[0]?.message || 'Invalid request data.';
    return next(new AppError(message, HTTP_STATUS.BAD_REQUEST));
  }

  // Replace req.body with the validated + typed data
  req.body = result.data;
  next();
};

module.exports = validate;
