const express = require('express');
const { createStory, getStories, getStory, updateStory, deleteStory, generateBook } = require('../controllers/storyController');
const { exportBook, getExportHistory } = require('../controllers/exportController');
const { generateCover, getCovers, selectActiveCover } = require('../controllers/coverController');
const { createStorySchema, updateStorySchema } = require('../validators/story.schema');
const validate = require('../validators/validate');
const { protect } = require('../middleware/auth');

// Import memory router to nest it under stories
const memoryRoutes = require('./memoryRoutes');

const router = express.Router();

// Enforce authentication on all story actions
router.use(protect);

// Nest memories under stories: /api/v1/stories/:storyId/memories
router.use('/:storyId/memories', memoryRoutes);

// Story CRUD
router.route('/')
  .post(validate(createStorySchema), createStory)
  .get(getStories);

router.route('/:id')
  .get(getStory)
  .patch(validate(updateStorySchema), updateStory)
  .delete(deleteStory);

// Trigger AI generation for a specific story
router.post('/:id/generate', generateBook);

// Export a book in a specific format (POST) / fetch export history (GET)
// Uses :storyId to match the memory sub-router convention
router.post('/:storyId/export', exportBook);
router.get('/:storyId/exports', getExportHistory);

// Cover Studio API Endpoints
router.post('/:storyId/generate-cover', generateCover);
router.get('/:storyId/covers', getCovers);
router.patch('/:storyId/covers/:coverId/select', selectActiveCover);

module.exports = router;
