const authService    = require('../services/authService');
const generateToken  = require('../utils/generateToken');
const sendResponse   = require('../utils/sendResponse');
const AppError       = require('../utils/AppError');
const catchAsync     = require('../utils/catchAsync');
const HTTP_STATUS    = require('../constants/httpStatus');

// ── Register ──────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/register
 * Creates a new user account, issues a JWT cookie, and returns the user.
 */
const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check for duplicate email before attempting insert
  const existing = await authService.findUserByEmail(email);
  if (existing) {
    return next(
      new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT)
    );
  }

  const user = await authService.createUser({ name, email, password });

  generateToken(res, user._id);

  sendResponse(res, HTTP_STATUS.CREATED, 'Account created successfully.', {
    user: user.toJSON(),
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/login
 * Validates credentials, issues a JWT cookie, and returns the user.
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // findUserByEmail with includePassword: true (field is select: false by default)
  const user = await authService.findUserByEmail(email, true);

  if (!user || !(await user.comparePassword(password))) {
    return next(
      new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED)
    );
  }

  generateToken(res, user._id);

  sendResponse(res, HTTP_STATUS.OK, 'Logged in successfully.', {
    user: user.toJSON(),
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/logout  (protected)
 * Clears the JWT cookie.
 */
const logout = catchAsync(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    expires:  new Date(0), // immediately expire the cookie
  });

  sendResponse(res, HTTP_STATUS.OK, 'Logged out successfully.', {});
});

// ── Forgot Password ───────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/forgot-password
 * Placeholder — always returns the same message to prevent user enumeration.
 * Real email sending will be implemented in a later phase.
 */
const forgotPassword = catchAsync(async (req, res) => {
  // NOTE: We intentionally do NOT confirm whether the email exists.
  // This prevents attackers from enumerating registered emails.
  sendResponse(res, HTTP_STATUS.OK, 'If that email exists, a reset link has been sent.', {});
});

// ── Get Me ────────────────────────────────────────────────────────────────────
/**
 * GET /api/v1/auth/me  (protected)
 * Returns the currently authenticated user attached by the protect middleware.
 */
const getMe = catchAsync(async (req, res) => {
  sendResponse(res, HTTP_STATUS.OK, 'User fetched successfully.', {
    user: req.user.toJSON(),
  });
});

module.exports = { register, login, logout, forgotPassword, getMe };
