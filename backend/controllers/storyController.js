const storyService = require('../services/storyService');
const aiGenerationService = require('../services/ai/aiGenerationService');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const HTTP_STATUS = require('../constants/httpStatus');

const createStory = catchAsync(async (req, res) => {
  const story = await storyService.createStory(req.user._id, req.body);
  sendResponse(res, HTTP_STATUS.CREATED, 'Story created successfully.', { story });
});

const getStories = catchAsync(async (req, res) => {
  const stories = await storyService.getUserStories(req.user._id);
  sendResponse(res, HTTP_STATUS.OK, 'Stories fetched successfully.', { stories });
});

const getStory = catchAsync(async (req, res) => {
  const story = await storyService.getStoryById(req.user._id, req.params.id);
  sendResponse(res, HTTP_STATUS.OK, 'Story fetched successfully.', { story });
});

const updateStory = catchAsync(async (req, res) => {
  const story = await storyService.updateStory(req.user._id, req.params.id, req.body);
  sendResponse(res, HTTP_STATUS.OK, 'Story updated successfully.', { story });
});

const deleteStory = catchAsync(async (req, res) => {
  const result = await storyService.deleteStory(req.user._id, req.params.id);
  sendResponse(res, HTTP_STATUS.OK, 'Story deleted successfully.', result);
});

/**
 * POST /api/v1/stories/:id/generate
 *
 * Thin handler — all logic lives in aiGenerationService.
 * Returns 409 if generation is already in progress (enforced in service).
 */
const generateBook = catchAsync(async (req, res) => {
  const story = await aiGenerationService.generateBook(req.user._id, req.params.id);
  sendResponse(res, HTTP_STATUS.OK, 'Book generated successfully.', { story });
});

module.exports = {
  createStory,
  getStories,
  getStory,
  updateStory,
  deleteStory,
  generateBook
};
