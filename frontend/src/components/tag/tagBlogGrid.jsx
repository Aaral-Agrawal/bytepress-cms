"use client";

import { getBlogsByTag } from "@/lib/api";
import BlogGrid from "@/components/blog/BlogGrid";

export default function TagBlogGrid({ tag, initialData }) {
  async function fetchPage(page) {
    return getBlogsByTag(tag, { page, limit: 6 });
  }

  return (
    <BlogGrid
      fetchFn={fetchPage}
      initialData={initialData}
      emptyMessage={`No articles found with the tag #${tag}.`}
    />
  );
}