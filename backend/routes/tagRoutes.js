const express = require('express')
const {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} = require('../controllers/tagController')

const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

// GET /api/tags — public read
router.get('/', getTags)

// POST /api/tags
router.post(
  '/',
  protect,
  authorize('superadmin', 'editor'),
  createTag
)

// PUT /api/tags/:id
router.put(
  '/:id',
  protect,
  authorize('superadmin', 'editor'),
  updateTag
)

// DELETE /api/tags/:id
router.delete(
  '/:id',
  protect,
  authorize('superadmin', 'editor'),
  deleteTag
)

module.exports = router