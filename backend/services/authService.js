const User     = require('../models/User');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Business logic layer for authentication.
 * Controllers call these — keeps controllers thin and HTTP-focused.
 */

/**
 * Create a new user document.
 * Password is hashed automatically via the User model pre-save hook.
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<User>}
 */
const createUser = async ({ name, email, password }) => {
  const user = await User.create({ name, email, password });
  return user;
};

/**
 * Find a user by email, optionally including the password field.
 *
 * @param {string}  email
 * @param {boolean} [includePassword=false]
 * @returns {Promise<User|null>}
 */
const findUserByEmail = async (email, includePassword = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  if (includePassword) query.select('+password');
  return query;
};

/**
 * Find a user by their MongoDB ObjectId.
 *
 * @param {string} id
 * @returns {Promise<User|null>}
 */
const findUserById = async (id) => {
  return User.findById(id);
};

module.exports = { createUser, findUserByEmail, findUserById };
