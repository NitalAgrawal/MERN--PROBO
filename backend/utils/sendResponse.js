/**
 * Standardized JSON response helper.
 * Every successful API response goes through this — no raw res.json() calls.
 *
 * Shape:  { success: true, message: "...", data: { ... } }
 *
 * @param {import('express').Response} res
 * @param {number} statusCode   HTTP_STATUS constant
 * @param {string} message      Human-readable result message
 * @param {object} [data={}]    Response payload
 */
const sendResponse = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = sendResponse;
