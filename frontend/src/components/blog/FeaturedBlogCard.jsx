 
import Link      from "next/link";
import BlogImage from "@/components/ui/BlogImage";

export default function FeaturedBlogCard({ blog, index = 0 }) {
  if (!blog) return null;

  const category   = blog.categories?.[0] ?? null;
  const authorName = blog.author?.name      ?? "BytePress";
  const authorId   = blog.author?._id;

  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  return (
    <article
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100
                 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col"
      aria-label={`Featured blog: ${blog.title}`}
    >
      {/* ── Image ──────────────────────────────────────────────── */}
      <Link href={`/blog/${blog.slug}`} aria-label={`Read: ${blog.title}`} tabIndex={-1}>
        <BlogImage
          src={blog.featureImage}
          alt={blog.title}
          aspectRatio="16/9"
          priority={index < 2}
          className="w-full group-hover:scale-[1.02] transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>

      {/* Featured badge */}
      <div
        className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-400
                   text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
        aria-label="Featured article"
      >
        ★ Featured
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="p-5 md:p-6 flex flex-col gap-3">

        {/* Category */}
        {category && (
          <Link
            href={`/category/${encodeURIComponent(category.toLowerCase())}`}
            className="w-fit text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1
                       rounded-full hover:bg-blue-100 transition-colors focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={`Category: ${category}`}
          >
            {category}
          </Link>
        )}

        {/* Title */}
        <h2 className="font-bold text-gray-900 leading-snug line-clamp-2 text-lg md:text-xl">
          <Link
            href={`/blog/${blog.slug}`}
            className="hover:text-blue-600 transition-colors focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            {blog.title}
          </Link>
        </h2>

        {blog.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
            {blog.description}
          </p>
        )}

        {/* Author + date */}
        <footer className="flex items-center gap-2.5 pt-2 mt-auto border-t border-gray-50">
          <div aria-hidden="true">
            {blog.author?.avatar ? (
              <img
                src={blog.author.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                              flex items-center justify-center text-white text-xs font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {authorId ? (
              <Link
                href={`/author/${authorId}`}
                className="text-xs font-medium text-gray-700 hover:text-blue-600 transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                aria-label={`Author: ${authorName}`}
              >
                {authorName}
              </Link>
            ) : (
              <span className="text-xs font-medium text-gray-700">{authorName}</span>
            )}
          </div>

          {publishedDate && (
            <time dateTime={blog.publishedAt} className="text-xs text-gray-400 flex-shrink-0">
              {publishedDate}
            </time>
          )}
        </footer>
      </div>
    </article>
  );
}