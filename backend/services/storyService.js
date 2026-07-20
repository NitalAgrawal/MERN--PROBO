const Story = require('../models/Story');
const Memory = require('../models/Memory');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');
const mediaService = require('./mediaService');

/**
 * Calculates the story progress dynamically based on status and memory count.
 *
 * @param {string} status
 * @param {number} memoryCount
 * @returns {number}
 */
const calculateProgress = (status, memoryCount) => {
  if (status === 'Draft') return 10;
  if (status === 'Generating') return 95;
  if (status === 'Ready' || status === 'Published') return 100;
  if (status === 'Collecting Memories') {
    return Math.min(90, 10 + memoryCount * 20);
  }
  return 0;
};

/**
 * Helper to convert a Mongoose story document to a plain object and inject dynamic progress.
 */
const injectProgress = async (storyDoc) => {
  if (!storyDoc) return null;
  const memoryCount = await Memory.countDocuments({ storyId: storyDoc._id });
  const storyObj = storyDoc.toJSON ? storyDoc.toJSON() : storyDoc.toObject();
  storyObj.progress = calculateProgress(storyDoc.status, memoryCount);
  return storyObj;
};

/**
 * Create a new story.
 */
const createStory = async (userId, data) => {
  const story = await Story.create({
    owner: userId,
    ...data
  });
  return injectProgress(story);
};

/**
 * Get all stories for a user.
 */
const getUserStories = async (userId) => {
  const stories = await Story.find({ owner: userId }).sort({ updatedAt: -1 });
  return Promise.all(stories.map(story => injectProgress(story)));
};

/**
 * Get a story by ID, checking ownership.
 */
const getStoryById = async (userId, storyId) => {
  const story = await Story.findOne({ _id: storyId, owner: userId });
  if (!story) {
    throw new AppError('Story not found or you do not have access.', HTTP_STATUS.NOT_FOUND);
  }
  return injectProgress(story);
};

/**
 * Update a story.
 */
const updateStory = async (userId, storyId, data) => {
  const story = await Story.findOne({ _id: storyId, owner: userId });
  if (!story) {
    throw new AppError('Story not found or you do not have access.', HTTP_STATUS.NOT_FOUND);
  }

  // Update allowed fields
  Object.keys(data).forEach(key => {
    story[key] = data[key];
  });
  story.lastEdited = Date.now();
  await story.save();

  return injectProgress(story);
};

/**
 * Delete a story and its memories.
 */
const deleteStory = async (userId, storyId) => {
  const story = await Story.findOne({ _id: storyId, owner: userId });
  if (!story) {
    throw new AppError('Story not found or you do not have access.', HTTP_STATUS.NOT_FOUND);
  }

  // Find all memories first to clean up associated Cloudinary files
  const memories = await Memory.find({ storyId });
  for (const memory of memories) {
    if (memory.photos && memory.photos.length > 0) {
      for (const photo of memory.photos) {
        if (photo.publicId) {
          try {
            await mediaService.deleteAsset(photo.publicId, 'image');
          } catch (err) {
            console.error(`Failed to delete photo ${photo.publicId} during story delete:`, err);
          }
        }
      }
    }
    if (memory.voiceNotes && memory.voiceNotes.length > 0) {
      for (const voice of memory.voiceNotes) {
        if (voice.publicId) {
          try {
            await mediaService.deleteAsset(voice.publicId, 'video');
          } catch (err) {
            console.error(`Failed to delete voice note ${voice.publicId} during story delete:`, err);
          }
        }
      }
    }
  }

  await Story.deleteOne({ _id: storyId });
  await Memory.deleteMany({ storyId });

  return { id: storyId };
};

module.exports = {
  createStory,
  getUserStories,
  getStoryById,
  updateStory,
  deleteStory,
  calculateProgress
};
