const jwt        = require('jsonwebtoken');
const User        = require('../models/User');
const AppError    = require('../utils/AppError');
const catchAsync  = require('../utils/catchAsync');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * protect — verifies the JWT from the httpOnly cookie and attaches
 * the authenticated user to req.user. Must be applied to all private routes.
 */
const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to access this resource.', HTTP_STATUS.UNAUTHORIZED)
    );
  }

  // Verify signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED));
    }
    return next(new AppError('Invalid authentication token.', HTTP_STATUS.UNAUTHORIZED));
  }

  // Fetch fresh user from DB (password excluded via select: false on schema)
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError('The user belonging to this token no longer exists.', HTTP_STATUS.UNAUTHORIZED)
    );
  }

  req.user = user;
  next();
});

module.exports = { protect };
