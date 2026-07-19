const express = require('express');
const { createStory, getStories, getStory, updateStory, deleteStory, generateBook } = require('../controllers/storyController');
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

module.exports = router;
