"use client";

 

import { getPublishedBlogs } from "@/lib/api";
import BlogGrid from "@/components/blog/BlogGrid";

export default function LatestBlogs({ initialData }) {
  // fetchFn is passed to BlogGrid which calls it on page change
  async function fetchPage(page) {
    return getPublishedBlogs({ page, limit: 6 });
  }

  return (
    <BlogGrid
      fetchFn={fetchPage}
      initialData={initialData}
      emptyMessage="No articles have been published yet. Check back soon!"
    />
  );
}