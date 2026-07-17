const Story = require('../models/Story');
const Memory = require('../models/Memory');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

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
