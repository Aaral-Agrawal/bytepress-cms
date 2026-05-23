"use client";

import { getBlogsByAuthor } from "@/lib/api";
import BlogGrid from "@/components/blog/BlogGrid";

export default function AuthorBlogGrid({ authorId, initialData }) {
  async function fetchPage(page) {
    return getBlogsByAuthor(authorId, { page, limit: 6 });
  }

  return (
    <BlogGrid
      fetchFn={fetchPage}
      initialData={initialData}
      emptyMessage="This author hasn't published any articles yet."
    />
  );
}