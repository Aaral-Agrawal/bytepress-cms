const express = require('express')
const { getSettings, updateSettings } = require('../controllers/settingsController')
const { protect } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')

const router = express.Router()

// GET /api/settings — any authenticated user can read
router.get('/', protect, getSettings)

// PUT /api/settings — superadmin only
router.put(
  '/',
  protect,
  authorize('superadmin'),
  updateSettings
)

module.exports = router