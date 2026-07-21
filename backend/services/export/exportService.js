'use strict';

/**
 * exportService.js
 *
 * Orchestrates all book export operations for StoryNest.
 *
 * Responsibilities:
 *   1. Story ownership validation
 *   2. bookHash computation (SHA-256 of generatedBook JSON)
 *   3. Cache lookup — return existing export if book hasn't changed
 *   4. Delegate to format-specific exporter (PDF / ePub / HTML)
 *   5. Upload resulting buffer to Cloudinary (raw resource type)
 *   6. Persist a completed entry in story.exportHistory
 *   7. Return export metadata to the controller
 *
 * Design principles:
 *   - Fully independent of the AI generation pipeline
 *   - New formats plug in via EXPORTERS registry — zero changes elsewhere
 *   - All exports uploaded to Cloudinary so fileUrls are persistent CDN links
 */

const crypto    = require('crypto');
const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;

const Story      = require('../../models/Story');
const AppError   = require('../../utils/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');

const { exportToPdf }  = require('./pdfExporter');
const { exportToEpub } = require('./epubExporter');
const { exportToHtml } = require('./htmlExporter');

// ── Format registry ────────────────────────────────────────────────────────
// Add new formats here — nothing else needs to change.
const EXPORTERS = {
  pdf:  { fn: exportToPdf,  mime: 'application/pdf',  ext: 'pdf',  resourceType: 'raw' },
  epub: { fn: exportToEpub, mime: 'application/epub+zip', ext: 'epub', resourceType: 'raw' },
  html: { fn: exportToHtml, mime: 'text/html', ext: 'html', resourceType: 'raw' }
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Compute a SHA-256 hash of the generatedBook object.
 * Used to detect whether the book content has changed since the last export.
 *
 * @param {object} generatedBook
 * @returns {string} hex digest
 */
const computeBookHash = (generatedBook) =>
  crypto
    .createHash('sha256')
    .update(JSON.stringify(generatedBook))
    .digest('hex');

/**
 * Upload a Buffer to Cloudinary as a raw file.
 *
 * @param {Buffer} buffer
 * @param {object} opts  - { publicId, resourceType, mimeType }
 * @returns {Promise<{ url: string, publicId: string, bytes: number }>}
 */
const uploadBufferToCloudinary = (buffer, { publicId, resourceType, mimeType }) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id:     publicId,
        resource_type: resourceType,
        overwrite:     true,
        invalidate:    true,
        format:        undefined  // keep original extension from public_id
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          bytes:    result.bytes
        });
      }
    );

    // Pipe buffer into Cloudinary upload stream
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

// ── Core operations ────────────────────────────────────────────────────────

/**
 * Export a story book in the requested format.
 *
 * Returns immediately with a cached export if the book hasn't changed.
 * Otherwise generates, uploads, and persists a new export entry.
 *
 * @param {string} userId
 * @param {string} storyId
 * @param {'pdf'|'epub'|'html'} format
 * @returns {Promise<object>} export record
 */
const exportBook = async (userId, storyId, format) => {
  // ── 1. Validate format ─────────────────────────────────────────────────
  if (!EXPORTERS[format]) {
    throw new AppError(
      `Unsupported export format "${format}". Valid formats: ${Object.keys(EXPORTERS).join(', ')}.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // ── 2. Load story with ownership check ────────────────────────────────
  const story = await Story.findOne({ _id: storyId, owner: userId });
  if (!story) {
    throw new AppError('Story not found or you do not have access.', HTTP_STATUS.NOT_FOUND);
  }

  if (!story.generatedBook) {
    throw new AppError(
      'This story has no generated book yet. Please generate the book first.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // ── 3. Cache lookup ────────────────────────────────────────────────────
  const bookHash = computeBookHash(story.generatedBook);

  const existing = story.exportHistory.find(
    (entry) =>
      entry.format  === format &&
      entry.status  === 'completed' &&
      entry.bookHash === bookHash
  );

  if (existing) {
    // Return cached export — no re-generation needed
    return {
      cached:      true,
      format,
      fileUrl:     existing.fileUrl,
      fileSize:    existing.fileSize,
      pageCount:   existing.pageCount,
      generatedAt: existing.generatedAt,
      _id:         existing._id
    };
  }

  // ── 4. Create a pending history entry so concurrent callers wait ───────
  const pendingEntry = {
    format,
    status:   'pending',
    bookHash,
    generatedAt: new Date()
  };
  story.exportHistory.push(pendingEntry);
  await story.save();

  // The entry is the last one we just pushed
  const entryIndex = story.exportHistory.length - 1;

  // ── 5. Generate the export buffer ─────────────────────────────────────
  const exporter = EXPORTERS[format];
  let buffer, pageCount;

  try {
    const storyPlain = story.toJSON();
    const result = await exporter.fn(storyPlain);
    buffer    = result.buffer;
    pageCount = result.pageCount;
  } catch (genErr) {
    // Mark as failed so the user can retry
    story.exportHistory[entryIndex].status = 'failed';
    await story.save();
    throw new AppError(
      `Export generation failed: ${genErr.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // ── 6. Upload to Cloudinary ────────────────────────────────────────────
  const safeTitle = (story.title || 'book').replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
  const publicId  = `storynest/exports/${storyId}/${format}/${safeTitle}_${Date.now()}`;

  let uploadResult;
  try {
    uploadResult = await uploadBufferToCloudinary(buffer, {
      publicId,
      resourceType: exporter.resourceType,
      mimeType:     exporter.mime
    });
  } catch (uploadErr) {
    story.exportHistory[entryIndex].status = 'failed';
    await story.save();
    throw new AppError(
      `Failed to upload export file: ${uploadErr.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // ── 7. Mark completed and persist ─────────────────────────────────────
  story.exportHistory[entryIndex].status      = 'completed';
  story.exportHistory[entryIndex].fileUrl     = uploadResult.url;
  story.exportHistory[entryIndex].publicId    = uploadResult.publicId;
  story.exportHistory[entryIndex].fileSize    = uploadResult.bytes;
  story.exportHistory[entryIndex].pageCount   = pageCount;
  await story.save();

  const completed = story.exportHistory[entryIndex];

  return {
    cached:      false,
    format,
    fileUrl:     completed.fileUrl,
    fileSize:    completed.fileSize,
    pageCount:   completed.pageCount,
    generatedAt: completed.generatedAt,
    _id:         completed._id
  };
};

/**
 * Return the full export history for a story.
 *
 * @param {string} userId
 * @param {string} storyId
 * @returns {Promise<Array>}
 */
const getExportHistory = async (userId, storyId) => {
  const story = await Story.findOne(
    { _id: storyId, owner: userId },
    { exportHistory: 1 }   // only fetch what we need
  ).lean();

  if (!story) {
    throw new AppError('Story not found or you do not have access.', HTTP_STATUS.NOT_FOUND);
  }

  // Return newest-first, strip internal bookHash (it's an implementation detail)
  return (story.exportHistory || [])
    .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
    .map(({ bookHash: _bh, publicId: _pid, ...rest }) => rest);
};

module.exports = { exportBook, getExportHistory };
