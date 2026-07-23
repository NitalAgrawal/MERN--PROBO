const express = require('express');
const { createStory, getStories, getStory, updateStory, deleteStory, generateBook } = require('../controllers/storyController');
const { exportBook, getExportHistory } = require('../controllers/exportController');
const { generateCover, getCovers, selectActiveCover } = require('../controllers/coverController');
const { createStorySchema, updateStorySchema } = require('../validators/story.schema');
const validate = require('../validators/validate');
const { protect } = require('../middleware/auth');
const { aiLimiter, exportLimiter } = require('../middleware/rateLimiter');

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

// Trigger AI generation for a specific story (rate limited)
router.post('/:id/generate', aiLimiter, generateBook);

// Export a book in a specific format (POST) / fetch export history (GET)
router.post('/:storyId/export', exportLimiter, exportBook);
router.get('/:storyId/exports', getExportHistory);

// Cover Studio API Endpoints (AI generation is rate limited)
router.post('/:storyId/generate-cover', aiLimiter, generateCover);
router.get('/:storyId/covers', getCovers);
router.patch('/:storyId/covers/:coverId/select', selectActiveCover);

module.exports = router;

