const memoryService = require('../services/memoryService');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const HTTP_STATUS = require('../constants/httpStatus');

const createMemory = catchAsync(async (req, res) => {
  const memory = await memoryService.createMemory(req.user._id, req.params.storyId, req.body);
  sendResponse(res, HTTP_STATUS.CREATED, 'Memory created successfully.', { memory });
});

const getMemories = catchAsync(async (req, res) => {
  const memories = await memoryService.getStoryMemories(req.user._id, req.params.storyId);
  sendResponse(res, HTTP_STATUS.OK, 'Memories fetched successfully.', { memories });
});

const updateMemory = catchAsync(async (req, res) => {
  const memory = await memoryService.updateMemory(req.user._id, req.params.id, req.body);
  sendResponse(res, HTTP_STATUS.OK, 'Memory updated successfully.', { memory });
});

const deleteMemory = catchAsync(async (req, res) => {
  const result = await memoryService.deleteMemory(req.user._id, req.params.id);
  sendResponse(res, HTTP_STATUS.OK, 'Memory deleted successfully.', result);
});

const bulkReorderMemories = catchAsync(async (req, res) => {
  const memories = await memoryService.bulkReorderMemories(
    req.user._id,
    req.params.storyId,
    req.body.reorders
  );
  sendResponse(res, HTTP_STATUS.OK, 'Memories reordered successfully.', { memories });
});

module.exports = {
  createMemory,
  getMemories,
  updateMemory,
  deleteMemory,
  bulkReorderMemories
};
