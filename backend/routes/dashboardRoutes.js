const express = require('express');
const router  = express.Router();

const {
  getAdminStats,
  getEditorStats,
  getAuthorStats,
  getAnalyticsOverview,
  getTrafficAnalytics,
  getBlogStatusAnalytics,
} = require('../controllers/dashboardController');

const { protect }             = require('../middleware/authMiddleware');
const { authorize, blockViewers } = require('../middleware/roleMiddleware');

// All dashboard routes require auth; block viewers
router.use(protect);
router.use(blockViewers);

// ── Role dashboards ──────────────────────────────────────────────────────────

// GET /api/dashboard/admin
router.get('/admin', authorize('superadmin'), getAdminStats);

// GET /api/dashboard/editor
router.get('/editor', authorize('editor'), getEditorStats);

// GET /api/dashboard/author
router.get('/author', authorize('author'), getAuthorStats);

// ── Analytics ────────────────────────────────────────────────────────────────

// GET /api/dashboard/analytics/overview
router.get('/analytics/overview', authorize('superadmin', 'editor'), getAnalyticsOverview);

// GET /api/dashboard/analytics/traffic
router.get('/analytics/traffic', authorize('superadmin', 'editor'), getTrafficAnalytics);

// GET /api/dashboard/analytics/blog-status
router.get('/analytics/blog-status', authorize('superadmin', 'editor'), getBlogStatusAnalytics);

module.exports = router;