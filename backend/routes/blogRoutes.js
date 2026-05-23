const express = require('express');

const {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  getPublishedBlogs,
  getFeaturedBlogs,
  submitForReview,
  approveBlog,
  publishBlog,
  getBlogBySlug,
  getBlogPreview,
  getBlogsByCategory,
  getBlogsByTag,
  getBlogsByAuthor,
  getRecentBlogs,
} = require('../controllers/blogController');

const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES — no auth required
// These only return published blogs  
// ─────────────────────────────────────────────────────────────────────────────
router.get('/published',          getPublishedBlogs);
router.get('/featured',           getFeaturedBlogs);
router.get('/slug/:slug',         getBlogBySlug);
router.get('/category/:category', getBlogsByCategory);
router.get('/tag/:tag',           getBlogsByTag);
router.get('/author/:authorId',   getBlogsByAuthor);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/blogs/recent — dashboard widget
 
router.get(
  '/recent',
  protect,
  authorize('superadmin', 'editor'),
  getRecentBlogs
);

// POST /api/blogs — create blog
 
router.post(
  '/',
  protect,
  authorize('superadmin', 'editor', 'author'),
  createBlog
);

// GET /api/blogs — get all blogs (role-filtered in controller)
router.get('/', protect, getAllBlogs);

// GET /api/blogs/:id/manage — get blog by ID for editing (protected)
router.get(
  '/:id/manage',
  protect,
  authorize('superadmin', 'editor', 'author'),
  getBlogById
);

// GET /api/blogs/preview/:id — preview any blog regardless of status
// Authors can only preview their own (enforced in controller)
router.get(
  '/preview/:id',
  protect,
  authorize('superadmin', 'editor', 'author'),
  getBlogPreview
);

// GET /api/blogs/:id — public single blog (published only)
router.get('/:id', getSingleBlog);

// PUT /api/blogs/:id — update blog content
// Authors can only edit own drafts/changes_requested (enforced in controller)
router.put(
  '/:id',
  protect,
  authorize('superadmin', 'editor', 'author'),
  updateBlog
);

// DELETE /api/blogs/:id — delete blog
// Authors can only delete own drafts; editors cannot delete superadmin content (enforced in controller)
router.delete(
  '/:id',
  protect,
  authorize('superadmin', 'editor', 'author'),
  deleteBlog
);

// PUT /api/blogs/:id/status — change status (superadmin/editor only)
// FIX: authors removed — they use /submit instead
// FIX: editor constraints validated in controller
router.put(
  '/:id/status',
  protect,
  authorize('superadmin', 'editor'),
  updateBlogStatus
);

// PUT /api/blogs/:id/submit — author submits draft for review
// FIX: only 'author' role — editors/superadmin use /status endpoint directly
router.put(
  '/:id/submit',
  protect,
  authorize('author'),
  submitForReview
);

// PUT /api/blogs/:id/approve — approve a blog
// FIX: both editor and superadmin can approve
router.put(
  '/:id/approve',
  protect,
  authorize('editor', 'superadmin'),
  approveBlog
);

// PUT /api/blogs/:id/publish — publish an approved blog
// FIX: both editor and superadmin can publish (was superadmin only — wrong)
router.put(
  '/:id/publish',
  protect,
  authorize('superadmin', 'editor'),
  publishBlog
);

module.exports = router;