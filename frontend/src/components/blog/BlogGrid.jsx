"use client";

 
import { useState, useTransition }  from "react";
import BlogCard        from "@/components/blog/BlogCard";
import BlogCardSkeleton from "@/components/ui/BlogCardSkeleton";
import Pagination      from "@/components/ui/Pagination";
import EmptyState      from "@/components/ui/EmptyState";

export default function BlogGrid({
  fetchFn,
  initialData   = {},
  emptyMessage  = "No blogs found.",
  className     = "",
}) {
  const [blogs,       setBlogs]       = useState(initialData.blogs       ?? []);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage ?? 1);
  const [totalPages,  setTotalPages]  = useState(initialData.totalPages  ?? 1);
  const [error,       setError]       = useState(null);
  const [isPending,   startTransition] = useTransition();

  async function goToPage(page) {
    setError(null);
    startTransition(async () => {
      try {
        const data = await fetchFn(page);
        setBlogs(data.blogs ?? []);
        setCurrentPage(data.currentPage ?? page);
        setTotalPages(data.totalPages   ?? 1);
        // Scroll to top of grid smoothly
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setError(err.message || "Failed to load blogs. Please try again.");
      }
    });
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to load blogs"
        message={error}
        action={{ label: "Try again", onClick: () => goToPage(currentPage) }}
      />
    );
  }

  // ── Loading skeleton ──────────────────────────────────────────
  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Loading blogs…"
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      >
        <BlogCardSkeleton count={6} />
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────
  if (!blogs.length) {
    return (
      <EmptyState
        type="empty"
        title="No blogs found"
        message={emptyMessage}
        action={{ label: "Back to home", href: "/" }}
      />
    );
  }

  return (
    <section aria-label="Blog posts">
      {/* Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {blogs.map((blog, i) => (
          <BlogCard key={blog._id} blog={blog} priority={i < 3} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        className="mt-10"
      />
    </section>
  );
}