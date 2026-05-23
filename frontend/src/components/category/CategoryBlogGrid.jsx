"use client";

import { getBlogsByCategory } from "@/lib/api";
import BlogGrid from "@/components/blog/BlogGrid";

export default function CategoryBlogGrid({ category, initialData }) {
  async function fetchPage(page) {
    return getBlogsByCategory(category, { page, limit: 6 });
  }

  return (
    <BlogGrid
      fetchFn={fetchPage}
      initialData={initialData}
      emptyMessage={`No articles found in the "${category}" category.`}
    />
  );
}