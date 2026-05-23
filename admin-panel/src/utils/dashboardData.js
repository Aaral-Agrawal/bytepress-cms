 
const MOCK_USERS = [
  { name: "Priya K.",  role: "author", status: "active"   },
  { name: "Rahul M.",  role: "author", status: "active"   },
  { name: "Neha S.",   role: "editor", status: "active"   },
  { name: "Isha T.",   role: "author", status: "inactive" },
];

const MOCK_SEO = [
  { blog: "MERN Stack Guide",  issue: "Missing meta description" },
  { blog: "Docker Basics",     issue: "No feature image"         },
  { blog: "CSS Grid Mastery",  issue: "Slug has spaces"          },
];

 
export const mapStatus = (status) => {
  
  const labels = {
    draft:             'Draft',
    pending_review:    'Pending Review',
    changes_requested: 'Changes Requested',
    approved:          'Approved',
    published:         'Published',
    rejected:          'Rejected',
  };
  return labels[status] || status;
};

export const formatBlogDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  });
};

export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

 
export const blogToRow = (blog, currentUserId) => ({
  id:        blog._id,
  title:     blog.title,
  author:
    blog.author?._id === currentUserId || blog.author === currentUserId
      ? "You"
      : blog.author?.name || "Unknown",
   
  status:    blog.status,
  rawStatus: blog.status,
  label:     mapStatus(blog.status),   // human-readable label for text display
  date:      formatBlogDate(blog.createdAt),
  submitted: formatBlogDate(blog.updatedAt || blog.createdAt),
});

// ─── buildDashboardData ───────────────────────────────────────────────────────
export const buildDashboardData = (role, user, blogs = []) => {
  const userId = user?.id || user?._id;
  const rows   = blogs.map((b) => blogToRow(b, userId));

  const published          = blogs.filter((b) => b.status === "published");
  const drafts             = blogs.filter((b) => b.status === "draft");
  const pending            = blogs.filter((b) => b.status === "pending_review");
  const rejected           = blogs.filter((b) => b.status === "rejected");
  const approved           = blogs.filter((b) => b.status === "approved");
  const changesRequested   = blogs.filter((b) => b.status === "changes_requested");

  const myBlogs =
    role === "author"
      ? blogs.filter(
          (b) =>
            b.author?._id === userId ||
            b.author?.toString?.() === userId?.toString?.()
        )
      : blogs;

  const recentSource =
    role === "author"   ? myBlogs    :
    role === "viewer"   ? published  :
    blogs;

  const recentBlogs = [...recentSource]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)
    .map((b) => blogToRow(b, userId));

  const pendingApprovals = pending
    .slice(0, 6)
    .map((b) => ({
      ...blogToRow(b, userId),
      submitted: formatBlogDate(b.updatedAt || b.createdAt),
    }));

  const seoIssues = blogs
    .filter((b) => !b.metaDescription || !b.featureImage)
    .slice(0, 5)
    .map((b) => ({
      blog:  b.title,
      issue: !b.metaDescription ? "Missing meta description" : "No feature image",
    }));

  const baseUser = {
    name:      user?.name || "User",
    role:      role || user?.role,
    lastLogin: "Today",
    avatar:    getInitials(user?.name),
  };

  // ── Superadmin ──────────────────────────────────────────────────────────────
  if (role === "superadmin") {
    return {
      user: baseUser,
      stats: {
        totalBlogs:         blogs.length,
        published:          published.length,
        drafts:             drafts.length,
        pending:            pending.length,
        approved:           approved.length,
        changesRequested:   changesRequested.length,
        rejected:           rejected.length,
        totalUsers:         MOCK_USERS.length,
        seoIssues:          seoIssues.length || MOCK_SEO.length,
      },
      recentBlogs,
      pendingApprovals,
      users:               MOCK_USERS,
      seoIssues:           seoIssues.length ? seoIssues : MOCK_SEO,
      approvedCount:       approved.length,
    };
  }

  // ── Editor ──────────────────────────────────────────────────────────────────
  if (role === "editor") {
    return {
      user: baseUser,
      stats: {
        totalBlogs:        blogs.length,
        published:         published.length,
        drafts:            drafts.length,
        pending:           pending.length,
        approved:          approved.length,
        changesRequested:  changesRequested.length,
        rejected:          rejected.length,
      },
      recentBlogs,
      pendingApprovals,
      seoIssues: seoIssues.length ? seoIssues : MOCK_SEO.slice(0, 2),
    };
  }

  // ── Author ──────────────────────────────────────────────────────────────────
  if (role === "author") {
    const myRejected          = myBlogs.filter((b) => b.status === "rejected");
    const myChangesRequested  = myBlogs.filter((b) => b.status === "changes_requested");
    const myApproved          = myBlogs.filter((b) => b.status === "approved");
    const myPending           = myBlogs.filter((b) => b.status === "pending_review");

    return {
      user: baseUser,
      stats: {
        myBlogs:           myBlogs.length,
        published:         myBlogs.filter((b) => b.status === "published").length,
        drafts:            myBlogs.filter((b) => b.status === "draft").length,
        // FIX: show each status separately so author knows exact state
        pending:           myPending.length,
        approved:          myApproved.length,
        changesRequested:  myChangesRequested.length,
        rejected:          myRejected.length,
      },
      recentBlogs: myBlogs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)
        .map((b) => blogToRow(b, userId)),
    };
  }

  // ── Viewer / fallback ───────────────────────────────────────────────────────
  return {
    user: baseUser,
    stats: {
      totalBlogs: published.length,
      categories: 12,
      readToday:  0,
    },
    recentBlogs: published
      .slice(0, 6)
      .map((b) => blogToRow(b, userId)),
  };
};