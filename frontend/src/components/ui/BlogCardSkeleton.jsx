/**
 * components/ui/BlogCardSkeleton.jsx
 * ────────────────────────────────────
 * Animated skeleton placeholder that matches BlogCard dimensions.
 * Prevents layout shift during loading.
 *
 * Usage:  <BlogCardSkeleton count={6} />
 */

export default function BlogCardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          aria-hidden="true"
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        >
          {/* Image placeholder */}
          <div className="aspect-[16/9] bg-gray-100 animate-pulse" />

          <div className="p-5 space-y-3">
            {/* Category badge */}
            <div className="h-5 w-20 rounded-full bg-gray-100 animate-pulse" />

            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 w-full  rounded bg-gray-100 animate-pulse" />
              <div className="h-5 w-4/5  rounded bg-gray-100 animate-pulse" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="h-4 w-full  rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-5/6  rounded bg-gray-100 animate-pulse" />
            </div>

            {/* Author row */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
              <div className="ml-auto h-4 w-16 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </article>
      ))}
    </>
  );
}