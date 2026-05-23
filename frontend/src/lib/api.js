 

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─────────────────────────────────────────────────────────────
// Generic fetch helper
// ─────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    // Remove ISR caching so the homepage and API data are always fresh.
    next: { revalidate: 0 },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));

    throw new Error(
      err.message || `API Error ${res.status}: ${path}`
    );
  }

  return res.json();
}

// ═════════════════════════════════════════════════════════════
// BLOG APIs
// ═════════════════════════════════════════════════════════════

/**
 * GET /api/blogs/published?page=&limit=
 */
export async function getPublishedBlogs({
  page = 1,
  limit = 0,
} = {}) {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const qs = params.toString();

  return apiFetch(`/blogs/published${qs ? `?${qs}` : ""}`);
}

/**
 * GET /api/blogs/featured?limit=
 * Fallback → slice latest blogs
 */
export async function getFeaturedBlogs(limit = 3) {
  try {
    return await apiFetch(`/blogs/featured?limit=${limit}`);
  } catch {
    const data = await getPublishedBlogs({
      page: 1,
      limit,
    });

    return data?.blogs ?? data ?? [];
  }
}

/**
 * Latest blogs helper
 */
export async function getLatestBlogs(limit = 6) {
  const data = await getPublishedBlogs({
    page: 1,
    limit,
  });

  return data?.blogs ?? data ?? [];
}

/**
 * GET /api/blogs/slug/:slug
 */
export async function getBlogBySlug(slug) {
  return apiFetch(
    `/blogs/slug/${encodeURIComponent(slug)}`
  );
}

/**
 * GET /api/blogs/category/:category
 */
export async function getBlogsByCategory(
  category,
  { page = 1, limit = 6 } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiFetch(
    `/blogs/category/${encodeURIComponent(
      category
    )}?${params}`
  );
}

/**
 * GET /api/blogs/tag/:tag
 */
export async function getBlogsByTag(
  tag,
  { page = 1, limit = 6 } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiFetch(
    `/blogs/tag/${encodeURIComponent(tag)}?${params}`
  );
}

/**
 * GET /api/blogs/author/:authorId
 * Fallback if endpoint missing
 */
export async function getBlogsByAuthor(
  authorId,
  { page = 1, limit = 6 } = {}
) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    return apiFetch(
      `/blogs/author/${encodeURIComponent(
        authorId
      )}?${params}`
    );
  } catch {
    const blogs = await getPublishedBlogs();

    const allBlogs = blogs?.blogs ?? blogs ?? [];

    return allBlogs.filter(
      (b) =>
        b.author?._id?.toString() === authorId
    );
  }
}

// ═════════════════════════════════════════════════════════════
// TAXONOMY APIs
// ═════════════════════════════════════════════════════════════

/**
 * GET /api/categories
 * Fallback → derive from blogs
 */
export async function getCategories() {
  try {
    return await apiFetch("/categories");
  } catch {
    const blogs = await getPublishedBlogs();

    const allBlogs = blogs?.blogs ?? blogs ?? [];

    const seen = new Set();
    const categories = [];

    for (const blog of allBlogs) {
      if (Array.isArray(blog.categories)) {
        for (const c of blog.categories) {
          if (c && !seen.has(c)) {
            seen.add(c);

            categories.push({
              name: c,
            });
          }
        }
      }
    }

    return categories;
  }
}

/**
 * GET /api/tags
 * Fallback → derive from blogs
 */
export async function getTags() {
  try {
    return await apiFetch("/tags");
  } catch {
    const blogs = await getPublishedBlogs();

    const allBlogs = blogs?.blogs ?? blogs ?? [];

    const seen = new Set();
    const tags = [];

    for (const blog of allBlogs) {
      if (Array.isArray(blog.tags)) {
        for (const t of blog.tags) {
          if (t && !seen.has(t)) {
            seen.add(t);

            tags.push({
              name: t,
            });
          }
        }
      }
    }

    return tags;
  }
}

// ═════════════════════════════════════════════════════════════
// AUTHOR APIs
// ═════════════════════════════════════════════════════════════

/**
 * GET /api/authors
 * Fallback → derive from blogs
 */
export async function getAuthors() {
  try {
    return await apiFetch("/authors");
  } catch {
    const blogs = await getPublishedBlogs();

    const allBlogs = blogs?.blogs ?? blogs ?? [];

    const map = new Map();

    for (const blog of allBlogs) {
      if (!blog.author?._id) continue;

      const id = blog.author._id;

      if (!map.has(id)) {
        map.set(id, {
          ...blog.author,
          postCount: 0,
        });
      }

      map.get(id).postCount += 1;
    }

    return Array.from(map.values());
  }
}

/**
 * GET /api/authors/:id
 * Fallback → derive from blogs
 */
export async function getAuthorById(id) {
  try {
    return await apiFetch(
      `/authors/${encodeURIComponent(id)}`
    );
  } catch {
    const blogs = await getPublishedBlogs();

    const allBlogs = blogs?.blogs ?? blogs ?? [];

    const authorBlogs = allBlogs.filter(
      (b) =>
        b.author?._id?.toString() === id
    );

    if (!authorBlogs.length) return null;

    return {
      author: {
        ...authorBlogs[0].author,
        postCount: authorBlogs.length,
      },
      blogs: authorBlogs,
    };
  }
}

// ═════════════════════════════════════════════════════════════
// RELATED BLOGS
// ═════════════════════════════════════════════════════════════

export async function getRelatedBlogs(
  blog,
  limit = 3
) {
  if (!blog) return [];

  const blogs = await getPublishedBlogs();

  const allBlogs = blogs?.blogs ?? blogs ?? [];

  const currentId = blog._id?.toString();

  const cats = new Set(blog.categories || []);
  const tags = new Set(blog.tags || []);

  const scored = allBlogs
    .filter(
      (b) =>
        b._id?.toString() !== currentId
    )
    .map((b) => {
      let score = 0;

      (b.categories || []).forEach((c) => {
        if (cats.has(c)) score += 2;
      });

      (b.tags || []).forEach((t) => {
        if (tags.has(t)) score += 1;
      });

      return {
        blog: b,
        score,
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored
    .slice(0, limit)
    .map((x) => x.blog);
}

// ═════════════════════════════════════════════════════════════
// NEWSLETTER
// ═════════════════════════════════════════════════════════════

export async function subscribeNewsletter(
  email
) {
  return apiFetch("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ═════════════════════════════════════════════════════════════
// UPLOAD API
// ═════════════════════════════════════════════════════════════

export async function uploadImage(
  file,
  token
) {
  const form = new FormData();

  form.append("image", file);

  const res = await fetch(
    `${BASE_URL}/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    throw new Error(
      body.message || "Image upload failed"
    );
  }

  return res.json();
}

// ═════════════════════════════════════════════════════════════
// SLUG HELPERS
// ═════════════════════════════════════════════════════════════

export function nameToSlug(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToName(
  slug = "",
  list = []
) {
  const match = list.find(
    (item) => nameToSlug(item) === slug
  );

  return match || slug;
}