const Blog = require('../models/Blog');

 
const createBlog = async (req, res) => {
  try {
     
    let status = req.body.status || 'draft';
    if (req.user.role === 'author') {
      if (!['draft', 'pending_review'].includes(status)) {
        status = 'draft';
      }
    }

    const blog = await Blog.create({
      ...req.body,
      status,
      author: req.user._id,
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET ALL BLOGS (admin/editor/author)
// ===============================
const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      category = '',
      author = '',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (status) query.status = status;
    if (category) query.categories = category;
    if (author) query.author = author;

    // Viewers only see published
    if (req.user.role === 'viewer') {
      query.status = 'published';
    }

    // Authors only see their own blogs — overrides any author param
    if (req.user.role === 'author') {
      query.author = req.user._id;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET RECENT BLOGS — dashboard widget
// GET /api/blogs/recent
// Returns latest 5 blogs (all statuses) for superadmin/editor dashboard
// ===============================
const getRecentBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author status categories createdAt publishedAt views');

    const data = blogs.map((b) => ({
      _id:       b._id,
      title:     b.title,
      author:    b.author,
      status:    b.status,
      category:  b.categories?.[0] || '',
      createdAt: b.createdAt,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getRecentBlogs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent blogs.' });
  }
};

// ===============================
// GET SINGLE BLOG (public — published only, by _id)
// ===============================
const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      status: 'published',
    }).populate('author', 'name email role avatar bio');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET BLOG BY ID (protected — for edit)
// ===============================
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email role avatar');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const authorId = blog.author?._id || blog.author;
    if (
      req.user.role === 'author' &&
      authorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET BLOG PREVIEW (any status — protected)
// ===============================
const getBlogPreview = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email role avatar bio');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const authorId = blog.author?._id || blog.author;
    if (
      req.user.role === 'author' &&
      authorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const authorId = blog.author?._id || blog.author;
 
    if (
      req.user.role === 'author' &&
      authorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied: You can only edit your own blogs.' });
    }

    // Author can only edit blogs that are in draft or changes_requested
    if (req.user.role === 'author') {
      if (!['draft', 'changes_requested'].includes(blog.status)) {
        return res.status(403).json({
          message: `Access denied: You cannot edit a blog that is currently "${blog.status}". Only drafts or blogs with changes requested can be edited.`,
        });
      }
      // Author cannot escalate status beyond pending_review
      if (req.body.status && !['draft', 'pending_review'].includes(req.body.status)) {
        return res.status(403).json({
          message: 'Authors can only set status to draft or pending_review.',
        });
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// DELETE BLOG
// ===============================
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name role');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const authorId = blog.author?._id || blog.author;

    // Author can only delete their own drafts
    if (req.user.role === 'author') {
      if (authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You can only delete your own blogs.' });
      }
      if (blog.status !== 'draft') {
        return res.status(403).json({
          message: 'Authors can only delete their own draft blogs.',
        });
      }
    }

    // Editors cannot delete blogs authored by superadmin
    if (req.user.role === 'editor') {
      const blogAuthor = blog.author;
      const authorRole = blogAuthor?.role;
      if (authorRole === 'superadmin') {
        return res.status(403).json({
          message: 'Editors cannot delete content created by a Super Admin.',
        });
      }
    }

    await blog.deleteOne();
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// UPDATE BLOG STATUS
// ===============================

// Define which transitions each role is allowed
const EDITOR_ALLOWED_FROM = ['pending_review', 'changes_requested', 'approved', 'rejected', 'draft'];
const EDITOR_ALLOWED_TO   = ['approved', 'changes_requested', 'rejected', 'published'];

const updateBlogStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const validStatuses = ['draft', 'pending_review', 'changes_requested', 'approved', 'published', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: `Invalid status: ${newStatus}` });
    }

    // Editor transition validation
    if (req.user.role === 'editor') {
      if (!EDITOR_ALLOWED_TO.includes(newStatus)) {
        return res.status(403).json({
          message: `Editors cannot set status to "${newStatus}".`,
        });
      }
    }

    // Set publishedAt when publishing
    if (newStatus === 'published' && blog.status !== 'published') {
      blog.publishedAt = new Date();
    }

    blog.status = newStatus;
    blog.reviewedBy = req.user._id;
    await blog.save();

    res.status(200).json({ message: `Blog status updated to "${newStatus}" successfully`, blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET PUBLISHED BLOGS — with pagination
// ===============================
const getPublishedBlogs = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 0);

    const query = { status: 'published' };
    const totalBlogs = await Blog.countDocuments(query);

    let blogsQuery = Blog.find(query)
      .populate('author', 'name email role avatar bio')
      .sort({ createdAt: -1 });

    if (limit > 0) {
      blogsQuery = blogsQuery.skip((page - 1) * limit).limit(limit);
    }

    const blogs      = await blogsQuery;
    const totalPages = limit > 0 ? Math.ceil(totalBlogs / limit) : 1;

    res.status(200).json({ blogs, currentPage: page, totalPages, totalBlogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET FEATURED BLOGS
// ===============================
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = Math.min(10, parseInt(req.query.limit) || 3);

    let blogs = await Blog.find({ status: 'published', isFeatured: true })
      .populate('author', 'name email role avatar bio')
      .sort({ publishedAt: -1 })
      .limit(limit);

    if (blogs.length < limit) {
      const existingIds = blogs.map((b) => b._id);
      const extra = await Blog.find({ status: 'published', _id: { $nin: existingIds } })
        .populate('author', 'name email role avatar bio')
        .sort({ publishedAt: -1 })
        .limit(limit - blogs.length);
      blogs = [...blogs, ...extra];
    }

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// SUBMIT FOR REVIEW
// ===============================
const submitForReview = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only submit your own blogs for review.' });
    }

    if (blog.status !== 'draft' && blog.status !== 'changes_requested') {
      return res.status(400).json({
        message: `Blog is currently "${blog.status}". Only draft or changes_requested blogs can be submitted for review.`,
      });
    }

    blog.status = 'pending_review';
    await blog.save();

    res.json({ message: 'Blog submitted for review', blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// APPROVE BLOG
// ===============================
const approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (!['pending_review', 'changes_requested'].includes(blog.status)) {
      return res.status(400).json({
        message: `Blog is currently "${blog.status}". Only pending_review or changes_requested blogs can be approved.`,
      });
    }

    blog.status     = 'approved';
    blog.reviewedBy = req.user._id;
    await blog.save();

    res.json({ message: 'Blog approved successfully', blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// PUBLISH BLOG
// ===============================
const publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.status !== 'approved') {
      return res.status(400).json({
        message: `Only approved blogs can be published. Current status: "${blog.status}".`,
      });
    }

    blog.status      = 'published';
    blog.publishedAt = new Date();
    blog.reviewedBy  = req.user._id;
    await blog.save();

    res.json({ message: 'Blog published successfully', blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET BLOG BY SLUG (public)
// ===============================
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: 'published',
    }).populate('author', 'name email role avatar bio');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET BLOGS BY CATEGORY (public)
// ===============================
const getBlogsByCategory = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 6);

    const query = {
      categories: { $regex: new RegExp(`^${req.params.category}$`, 'i') },
      status: 'published',
    };

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find(query)
      .populate('author', 'name email role avatar bio')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ blogs, currentPage: page, totalPages, totalBlogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET BLOGS BY TAG (public)
// ===============================
const getBlogsByTag = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 6);

    const query = {
      tags: { $regex: new RegExp(`^${req.params.tag}$`, 'i') },
      status: 'published',
    };

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find(query)
      .populate('author', 'name email role avatar bio')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ blogs, currentPage: page, totalPages, totalBlogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET BLOGS BY AUTHOR (public — published only)
// ===============================
const getBlogsByAuthor = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 6);

    const query = { author: req.params.authorId, status: 'published' };

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find(query)
      .populate('author', 'name email role avatar bio')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ blogs, currentPage: page, totalPages, totalBlogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
  getBlogsByCategory,
  getBlogsByTag,
  getBlogsByAuthor,
  getRecentBlogs,
  getBlogPreview,
};