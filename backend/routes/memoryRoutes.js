const express = require('express');
const { createMemory, getMemories, updateMemory, deleteMemory, bulkReorderMemories } = require('../controllers/memoryController');
const { createMemorySchema, updateMemorySchema, bulkReorderSchema } = require('../validators/memory.schema');
const validate = require('../validators/validate');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Enforce authentication on all memory actions
router.use(protect);

// Bulk reorder endpoint
// Matches PATCH /api/v1/stories/:storyId/memories/reorder when nested
router.patch('/reorder', validate(bulkReorderSchema), bulkReorderMemories);

// Handles:
// - POST /api/v1/stories/:storyId/memories (Nested)
// - GET  /api/v1/stories/:storyId/memories (Nested)
router.route('/')
  .post(validate(createMemorySchema), createMemory)
  .get(getMemories);

// Handles:
// - PATCH  /api/v1/memories/:id (Standalone)
// - DELETE /api/v1/memories/:id (Standalone)
router.route('/:id')
  .patch(validate(updateMemorySchema), updateMemory)
  .delete(deleteMemory);

module.exports = router;
