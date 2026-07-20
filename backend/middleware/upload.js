'use strict';

const multer = require('multer');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

const storage = multer.memoryStorage();

/**
 * Filter for allowed image types (jpg, jpeg, png, webp).
 */
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only jpg, jpeg, png, and webp images are allowed.', HTTP_STATUS.BAD_REQUEST), false);
  }
};

/**
 * Filter for allowed voice note types (mp3, wav, m4a, and common web audio formats like webm/ogg).
 */
const voiceFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/webm' // webm is common for in-browser media recording
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only mp3, wav, and m4a voice notes are allowed.', HTTP_STATUS.BAD_REQUEST), false);
  }
};

// Internal Multer instances
const uploadImageSingle = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
}).single('file');

const uploadVoiceSingle = multer({
  storage,
  fileFilter: voiceFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
}).single('file');

/**
 * Middleware wrapper for image uploads.
 * Catches Multer limits/errors and returns a clean 400 Bad Request error.
 */
const uploadImageMiddleware = (req, res, next) => {
  uploadImageSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Image size exceeds the 10 MB limit.', HTTP_STATUS.BAD_REQUEST));
        }
        return next(new AppError(err.message, HTTP_STATUS.BAD_REQUEST));
      }
      return next(err);
    }
    next();
  });
};

/**
 * Middleware wrapper for voice note uploads.
 * Catches Multer limits/errors and returns a clean 400 Bad Request error.
 */
const uploadVoiceMiddleware = (req, res, next) => {
  uploadVoiceSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Voice note size exceeds the 25 MB limit.', HTTP_STATUS.BAD_REQUEST));
        }
        return next(new AppError(err.message, HTTP_STATUS.BAD_REQUEST));
      }
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadImage: uploadImageMiddleware,
  uploadVoice: uploadVoiceMiddleware
};
