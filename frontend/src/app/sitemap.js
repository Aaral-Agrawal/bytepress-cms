 

import { getPublishedBlogs } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bytepress.dev";

export default async function sitemap() {
  // Static pages
  const staticPages = [
    { url: SITE_URL,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/blog`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/authors`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/about`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  // Dynamic blog pages
  let blogPages = [];
  try {
    // Fetch all published blogs (no limit) for sitemap
    const data = await getPublishedBlogs({ page: 1, limit: 0 });
    const blogs = data?.blogs ?? [];

    blogPages = blogs.map((blog) => ({
      url:             `${SITE_URL}/blog/${blog.slug}`,
      lastModified:    blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    }));
  } catch {
    // Sitemap still works with static pages if API is unavailable
  }

  return [...staticPages, ...blogPages];
}