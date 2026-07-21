'use strict';

/**
 * exportController.js
 *
 * Thin HTTP handlers for the book export endpoints.
 * All business logic lives in exportService.js.
 *
 * Routes:
 *   POST /api/v1/stories/:storyId/export   → exportBook
 *   GET  /api/v1/stories/:storyId/exports  → getExportHistory
 */

const exportService = require('../services/export/exportService');
const sendResponse  = require('../utils/sendResponse');
const catchAsync    = require('../utils/catchAsync');
const HTTP_STATUS   = require('../constants/httpStatus');

/**
 * POST /api/v1/stories/:storyId/export
 *
 * Body: { format: "pdf" | "epub" | "html" }
 *
 * Returns the export record (cached or freshly generated).
 * If cached:   { cached: true,  fileUrl, fileSize, pageCount, generatedAt }
 * If new:      { cached: false, fileUrl, fileSize, pageCount, generatedAt }
 */
const exportBook = catchAsync(async (req, res) => {
  const { storyId } = req.params;
  const { format }  = req.body;

  if (!format) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Export format is required. Valid values: pdf, epub, html.'
    });
  }

  const result = await exportService.exportBook(req.user._id, storyId, format.toLowerCase());

  const message = result.cached
    ? `Returning cached ${format.toUpperCase()} export.`
    : `${format.toUpperCase()} export generated successfully.`;

  sendResponse(res, HTTP_STATUS.OK, message, { export: result });
});

/**
 * GET /api/v1/stories/:storyId/exports
 *
 * Returns the full export history for the story (newest first).
 * Internal fields (bookHash, publicId) are stripped by the service.
 */
const getExportHistory = catchAsync(async (req, res) => {
  const { storyId } = req.params;
  const history = await exportService.getExportHistory(req.user._id, storyId);
  sendResponse(res, HTTP_STATUS.OK, 'Export history fetched successfully.', { exports: history });
});

module.exports = { exportBook, getExportHistory };
