'use strict';

const Memory = require('../models/Memory');
const Story = require('../models/Story');
const mediaService = require('../services/mediaService');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');

/**
 * Verify memory existence and story ownership.
 *
 * @param {string} memoryId
 * @param {string} userId
 * @returns {Promise<{ memory: object, story: object }>}
 */
const verifyMemoryOwnership = async (memoryId, userId) => {
  if (!memoryId) {
    throw new AppError('Memory ID is required.', HTTP_STATUS.BAD_REQUEST);
  }
  const memory = await Memory.findById(memoryId);
  if (!memory) {
    throw new AppError('Memory not found.', HTTP_STATUS.NOT_FOUND);
  }
  const story = await Story.findOne({ _id: memory.storyId, owner: userId });
  if (!story) {
    throw new AppError('Story not found or you do not have access.', HTTP_STATUS.NOT_FOUND);
  }
  return { memory, story };
};

/**
 * Upload an image file for a memory.
 */
const uploadImage = catchAsync(async (req, res) => {
  const { memoryId, caption } = req.body;
  if (!req.file) {
    throw new AppError('No file uploaded.', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Verify access
  const { memory } = await verifyMemoryOwnership(memoryId, req.user._id);

  // 2. Upload to Cloudinary
  const uploadResult = await mediaService.uploadImage(req.file.buffer);

  // 3. Construct structured object
  const photoDoc = {
    url: uploadResult.url,
    thumbnailUrl: uploadResult.thumbnailUrl,
    publicId: uploadResult.publicId,
    width: uploadResult.width,
    height: uploadResult.height,
    caption: caption || '',
    status: 'uploaded',
    uploadedAt: new Date()
  };

  memory.photos.push(photoDoc);
  await memory.save();

  sendResponse(res, HTTP_STATUS.OK, 'Image uploaded successfully.', {
    memory,
    photo: memory.photos[memory.photos.length - 1]
  });
});

/**
 * Upload a voice note file for a memory.
 */
const uploadVoice = catchAsync(async (req, res) => {
  const { memoryId } = req.body;
  if (!req.file) {
    throw new AppError('No file uploaded.', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Verify access
  const { memory } = await verifyMemoryOwnership(memoryId, req.user._id);

  // 2. Upload to Cloudinary
  const uploadResult = await mediaService.uploadVoiceNote(req.file.buffer);

  // 3. Construct structured object
  const voiceNoteDoc = {
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    duration: uploadResult.duration,
    status: 'uploaded',
    uploadedAt: new Date()
  };

  memory.voiceNotes.push(voiceNoteDoc);
  await memory.save();

  sendResponse(res, HTTP_STATUS.OK, 'Voice note uploaded successfully.', {
    memory,
    voiceNote: memory.voiceNotes[memory.voiceNotes.length - 1]
  });
});

/**
 * Delete a photo by database photoId. Resolves Cloudinary publicId internally.
 */
const deletePhoto = catchAsync(async (req, res) => {
  const memoryId = req.body.memoryId || req.query.memoryId;
  const photoId = req.body.photoId || req.query.photoId;

  if (!memoryId || !photoId) {
    throw new AppError('memoryId and photoId are required.', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Verify access
  const { memory } = await verifyMemoryOwnership(memoryId, req.user._id);

  // 2. Find photo subdocument
  const photo = memory.photos.id(photoId);
  if (!photo) {
    throw new AppError('Photo not found in memory.', HTTP_STATUS.NOT_FOUND);
  }

  // 3. Delete from Cloudinary
  await mediaService.deleteAsset(photo.publicId, 'image');

  // 4. Remove subdocument and save
  memory.photos.pull(photoId);
  await memory.save();

  sendResponse(res, HTTP_STATUS.OK, 'Photo deleted successfully.', { memory });
});

/**
 * Delete a voice note by database voiceId. Resolves Cloudinary publicId internally.
 */
const deleteVoice = catchAsync(async (req, res) => {
  const memoryId = req.body.memoryId || req.query.memoryId;
  const voiceId = req.body.voiceId || req.query.voiceId;

  if (!memoryId || !voiceId) {
    throw new AppError('memoryId and voiceId are required.', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Verify access
  const { memory } = await verifyMemoryOwnership(memoryId, req.user._id);

  // 2. Find voiceNote subdocument
  const voiceNote = memory.voiceNotes.id(voiceId);
  if (!voiceNote) {
    throw new AppError('Voice note not found in memory.', HTTP_STATUS.NOT_FOUND);
  }

  // 3. Delete from Cloudinary
  await mediaService.deleteAsset(voiceNote.publicId, 'video');

  // 4. Remove subdocument and save
  memory.voiceNotes.pull(voiceId);
  await memory.save();

  sendResponse(res, HTTP_STATUS.OK, 'Voice note deleted successfully.', { memory });
});

module.exports = {
  uploadImage,
  uploadVoice,
  deletePhoto,
  deleteVoice
};
