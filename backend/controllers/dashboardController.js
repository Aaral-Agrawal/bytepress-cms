const User = require('../models/User');
const Blog = require('../models/Blog');

// ─── Helper: format large numbers ────────────────────────────────────────────
const formatTraffic = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

// ─── Helper: percentage change between two numbers ────────────────────────────
const pctChange = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
};

// ─── GET /api/dashboard/admin ─────────────────────────────────────────────────
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      reviewBlogs,
      archivedBlogs,
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.countDocuments({ status: 'pending_review' }),
      Blog.countDocuments({ status: 'archived' }),
    ]);

    // Estimate monthly traffic from sum of views on published blogs
    const trafficAgg = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);
    const totalViews = trafficAgg[0]?.total || 0;

    // Count distinct categories used across all blogs
    const categoryAgg = await Blog.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories' } },
      { $count: 'total' },
    ]);
    const categories = categoryAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        reviewBlogs,
        archivedBlogs,
        categories,
        monthlyTraffic: formatTraffic(totalViews),
      },
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
};

// ─── GET /api/dashboard/editor ────────────────────────────────────────────────
const getEditorStats = async (req, res) => {
  try {
    const [pendingReview, publishedToday, totalDrafts, totalBlogs] = await Promise.all([
      Blog.countDocuments({ status: 'pending_review' }),
      Blog.countDocuments({
        status: 'published',
        publishedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { pendingReview, publishedToday, totalDrafts, totalBlogs },
    });
  } catch (err) {
    console.error('getEditorStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch editor stats.' });
  }
};

// ─── GET /api/dashboard/author ────────────────────────────────────────────────
const getAuthorStats = async (req, res) => {
  try {
    const authorId = req.user._id;

    const [myBlogs, myDrafts, published, viewsAgg] = await Promise.all([
      Blog.countDocuments({ author: authorId }),
      Blog.countDocuments({ author: authorId, status: 'draft' }),
      Blog.countDocuments({ author: authorId, status: 'published' }),
      Blog.aggregate([
        { $match: { author: authorId, status: 'published' } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
    ]);

    const totalViews = viewsAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        myBlogs,
        myDrafts,
        published,
        totalViews: formatTraffic(totalViews),
      },
    });
  } catch (err) {
    console.error('getAuthorStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch author stats.' });
  }
};

// ─── GET /api/dashboard/analytics/overview ────────────────────────────────────
const getAnalyticsOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      categoryAgg,
      trafficAgg,
    ] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.aggregate([
        { $unwind: '$categories' },
        { $group: { _id: '$categories' } },
        { $count: 'total' },
      ]),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
    ]);

    const categories    = categoryAgg[0]?.total  || 0;
    const totalViews    = trafficAgg[0]?.total   || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        categories,
        monthlyTraffic: formatTraffic(totalViews),
      },
    });
  } catch (err) {
    console.error('getAnalyticsOverview error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics overview.' });
  }
};

// ─── GET /api/dashboard/analytics/traffic ─────────────────────────────────────
 
const getTrafficAnalytics = async (req, res) => {
  try {
    const MONTHS = 7;
    const since  = new Date();
    since.setMonth(since.getMonth() - (MONTHS - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const agg = await Blog.aggregate([
      {
        $match: {
          status:    'published',
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          views:  { $sum: { $ifNull: ['$views', 1] } },
          visits: { $sum: 1 }, // fallback: count published blogs as visits
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const data = agg.map((d) => ({
      month:  MONTH_NAMES[d._id.month - 1],
      views:  d.views,
      visits: d.visits,
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getTrafficAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch traffic analytics.' });
  }
};

// ─── GET /api/dashboard/analytics/blog-status ────────────────────────────────
const getBlogStatusAnalytics = async (req, res) => {
  try {
    const agg = await Blog.aggregate([
      {
        $group: {
          _id:   '$status',
          count: { $sum: 1 },
        },
      },
    ]);

     
    const labelMap = {
      published:      'Published',
      draft:          'Draft',
      pending_review: 'Review',
      approved:       'Approved',
      rejected:       'Rejected',
      archived:       'Archived',
    };

    const data = agg.map((d) => ({
      name:  labelMap[d._id] || d._id,
      count: d.count,
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getBlogStatusAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blog status analytics.' });
  }
};

module.exports = {
  getAdminStats,
  getEditorStats,
  getAuthorStats,
  getAnalyticsOverview,
  getTrafficAnalytics,
  getBlogStatusAnalytics,
};