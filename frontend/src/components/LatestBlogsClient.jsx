'use client';
 

import { useState } from 'react';
import BlogCard from '@/components/blog/BlogCard';
import { getLatestBlogs } from '@/lib/api';

export default function LatestBlogsClient({ initialBlogs = [] }) {
  const [blogs, setBlogs]         = useState(initialBlogs);
  const [limit, setLimit]         = useState(initialBlogs.length || 6);
  const [loadingMore, setLoading] = useState(false);

  async function handleLoadMore() {
    setLoading(true);
    try {
      const nextLimit = limit + 6;
      const more = await getLatestBlogs(nextLimit);
      if (more?.length) {
        setBlogs(more);
        setLimit(nextLimit);
      }
    } catch {
      // silently keep current list
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <BlogCard key={b._id} blog={b} />
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loadingMore ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              </svg>
              Loading…
            </span>
          ) : 'Load More Articles'}
        </button>
      </div>
    </>
  );
}