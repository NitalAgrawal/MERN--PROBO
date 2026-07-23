const Memory = require('../models/Memory');
const Story = require('../models/Story');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');
const mediaService = require('./mediaService');
const logger = require('./logger/logger');
const cacheService = require('./cache/cacheService');

/**
 * Helper to verify story ownership.
 */
const verifyStoryOwnership = async (storyId, userId) => {
  const story = await Story.findOne({ _id: storyId, owner: userId });
  if (!story) {
    throw new AppError('Story not found or you do not have access.', HTTP_STATUS.NOT_FOUND);
  }
  return story;
};

/**
 * Create a new memory for a story.
 */
const createMemory = async (userId, storyId, data) => {
  const story = await verifyStoryOwnership(storyId, userId);

  const lastMemory = await Memory.findOne({ storyId }).sort({ order: -1 });
  const newOrder = lastMemory ? lastMemory.order + 1 : 0;

  const memory = await Memory.create({
    storyId,
    order: newOrder,
    ...data
  });

  story.lastEdited = Date.now();
  await story.save();

  await cacheService.del(`story_meta_${storyId}`);
  await cacheService.del(`user_stories_${userId}`);

  return memory;
};

/**
 * Get memories for a story, ordered by order ascending.
 */
const getStoryMemories = async (userId, storyId) => {
  await verifyStoryOwnership(storyId, userId);
  return Memory.find({ storyId }).sort({ order: 1 });
};

/**
 * Update a single memory.
 */
const updateMemory = async (userId, memoryId, data) => {
  const memory = await Memory.findById(memoryId);
  if (!memory) {
    throw new AppError('Memory not found.', HTTP_STATUS.NOT_FOUND);
  }

  const story = await verifyStoryOwnership(memory.storyId, userId);

  Object.keys(data).forEach(key => {
    memory[key] = data[key];
  });
  await memory.save();

  story.lastEdited = Date.now();
  await story.save();

  await cacheService.del(`story_meta_${memory.storyId}`);

  return memory;
};

/**
 * Delete a single memory.
 */
const deleteMemory = async (userId, memoryId) => {
  const memory = await Memory.findById(memoryId);
  if (!memory) {
    throw new AppError('Memory not found.', HTTP_STATUS.NOT_FOUND);
  }

  const story = await verifyStoryOwnership(memory.storyId, userId);

  if (memory.photos && memory.photos.length > 0) {
    for (const photo of memory.photos) {
      if (photo.publicId) {
        try {
          await mediaService.deleteAsset(photo.publicId, 'image');
        } catch (cloudinaryErr) {
          logger.error({ err: cloudinaryErr.message, publicId: photo.publicId }, 'Failed to delete photo from Cloudinary during memory delete');
        }
      }
    }
  }

  if (memory.voiceNotes && memory.voiceNotes.length > 0) {
    for (const voice of memory.voiceNotes) {
      if (voice.publicId) {
        try {
          await mediaService.deleteAsset(voice.publicId, 'video');
        } catch (cloudinaryErr) {
          logger.error({ err: cloudinaryErr.message, publicId: voice.publicId }, 'Failed to delete voice note from Cloudinary during memory delete');
        }
      }
    }
  }

  await Memory.deleteOne({ _id: memoryId });

  story.lastEdited = Date.now();
  await story.save();

  await cacheService.del(`story_meta_${memory.storyId}`);
  await cacheService.del(`user_stories_${userId}`);

  return { id: memoryId };
};


/**
 * Bulk reorder memories in one request.
 * Expects reorders as [{ id: string, order: number }]
 */
const bulkReorderMemories = async (userId, storyId, reorders) => {
  const story = await verifyStoryOwnership(storyId, userId);

  // Perform bulk operations
  const bulkOps = reorders.map(item => ({
    updateOne: {
      filter: { _id: item.id, storyId },
      update: { $set: { order: item.order } }
    }
  }));

  if (bulkOps.length > 0) {
    await Memory.bulkWrite(bulkOps);
  }

  // Update lastEdited on parent story
  story.lastEdited = Date.now();
  await story.save();

  // Return the newly sorted list of memories
  return Memory.find({ storyId }).sort({ order: 1 });
};

module.exports = {
  createMemory,
  getStoryMemories,
  updateMemory,
  deleteMemory,
  bulkReorderMemories
};
