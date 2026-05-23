const express = require('express')
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController')

const { protect }   = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

// GET /api/categories — public read
router.get('/', getCategories)

// POST /api/categories
router.post(
  '/',
  protect,
  authorize('superadmin', 'editor'),
  createCategory
)

// PUT /api/categories/:id
router.put(
  '/:id',
  protect,
  authorize('superadmin', 'editor'),
  updateCategory
)

// DELETE /api/categories/:id
router.delete(
  '/:id',
  protect,
  authorize('superadmin'),
  deleteCategory
)

module.exports = router