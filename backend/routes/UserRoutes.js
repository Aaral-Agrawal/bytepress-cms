const express = require('express')
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController')

const { protect }              = require('../middleware/authMiddleware')
const { authorize, blockViewers } = require('../middleware/roleMiddleware')

const router = express.Router()

// All user routes require auth and block viewers
router.use(protect)
router.use(blockViewers)

// GET /api/users — superadmin only
router.get(
  '/',
  authorize('superadmin'),
  getAllUsers
)

// PUT /api/users/:id — superadmin only
router.put(
  '/:id',
  authorize('superadmin'),
  updateUser
)

// DELETE /api/users/:id — superadmin only
router.delete(
  '/:id',
  authorize('superadmin'),
  deleteUser
)

module.exports = router