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
const logger        = require('../services/logger/logger');
const metricsService = require('../services/metrics/metricsService');
const cacheService  = require('../services/cache/cacheService');

/**
 * POST /api/v1/stories/:storyId/export
 *
 * Body: { format: "pdf" | "epub" | "html" }
 */
const exportBook = catchAsync(async (req, res) => {
  const startTime = Date.now();
  const { storyId } = req.params;
  const { format }  = req.body;

  if (!format) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Export format is required. Valid values: pdf, epub, html.'
    });
  }

  const result = await exportService.exportBook(req.user._id, storyId, format.toLowerCase());
  const duration = Date.now() - startTime;
  metricsService.recordExport(duration);

  logger.logExport('info', `Book export completed: ${format.toUpperCase()}`, {
    storyId,
    format,
    durationMs: duration,
    cached: result.cached,
  });

  await cacheService.del(`export_meta_${storyId}`);

  const message = result.cached
    ? `Returning cached ${format.toUpperCase()} export.`
    : `${format.toUpperCase()} export generated successfully.`;

  sendResponse(res, HTTP_STATUS.OK, message, { export: result });
});

/**
 * GET /api/v1/stories/:storyId/exports
 */
const getExportHistory = catchAsync(async (req, res) => {
  const { storyId } = req.params;

  const cacheKey = `export_meta_${storyId}`;
  const cachedHistory = await cacheService.get(cacheKey);
  if (cachedHistory) {
    return sendResponse(res, HTTP_STATUS.OK, 'Export history fetched successfully (cached).', { exports: cachedHistory });
  }

  const history = await exportService.getExportHistory(req.user._id, storyId);
  await cacheService.set(cacheKey, history, 120);

  sendResponse(res, HTTP_STATUS.OK, 'Export history fetched successfully.', { exports: history });
});

module.exports = { exportBook, getExportHistory };

