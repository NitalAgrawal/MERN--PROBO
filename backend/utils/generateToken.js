const jwt = require('jsonwebtoken');

/**
 * Parses a duration string like "7d", "30d", "1h" into milliseconds.
 * Used to set cookie maxAge from JWT_EXPIRE env var.
 */
const parseDurationMs = (duration) => {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid JWT_EXPIRE format: "${duration}"`);
  return parseInt(match[1], 10) * units[match[2]];
};

/**
 * Signs a JWT for the given user ID, sets it as a secure httpOnly cookie
 * on the response, and returns the token string.
 *
 * Cookie options are driven entirely by environment variables — nothing hardcoded.
 *
 * @param {import('express').Response} res
 * @param {string} userId   MongoDB ObjectId as string
 * @returns {string}        Signed JWT
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   parseDurationMs(process.env.JWT_EXPIRE),
  });

  return token;
};

module.exports = generateToken;
