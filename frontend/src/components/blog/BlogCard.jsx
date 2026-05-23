'use client';

import Link from 'next/link';
import BlogImage from '@/components/ui/BlogImage';

const FALLBACK_COLORS = [
  'from-blue-50 to-indigo-100',
  'from-emerald-50 to-teal-100',
  'from-violet-50 to-purple-100',
  'from-amber-50 to-orange-100',
  'from-rose-50 to-pink-100',
  'from-sky-50 to-cyan-100',
];

const FALLBACK_EMOJIS = [
  '🚀',
  '⚡',
  '🤖',
  '🌐',
  '🔬',
  '💡',
  '🛡️',
  '📊',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return '';

  return new Date(dateStr).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

function nameToSlug(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogCard({
  blog,
  featured = false,
  priority = false,
  className = '',
}) {
  if (!blog) return null;

  const {
    _id,
    title = 'Untitled',
    slug,
    description = '',
    featureImage,
    coverImage,
    tags = [],
    categories = [],
    category = {},
    author = {},
    publishedAt,
    readTime,
  } = blog;

  const categoryName =
    categories?.[0] ||
    category?.name ||
    null;

  const primaryTag =
    tags?.[0] || null;

  const authorName =
    author?.name || 'BytePress';

  const authorId =
    author?._id;

  const imageSrc =
    featureImage || coverImage;

  const colorClass =
    FALLBACK_COLORS[
      (_id?.charCodeAt(0) || 0) %
        FALLBACK_COLORS.length
    ];

  const emoji =
    FALLBACK_EMOJIS[
      (_id?.charCodeAt(1) || 0) %
        FALLBACK_EMOJIS.length
    ];

  const href = `/blog/${slug || _id}`;

  return (
    <article
      className={`
        group bg-white rounded-2xl overflow-hidden
        border border-gray-100
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)]
        hover:border-blue-100
        ${featured ? 'ring-2 ring-blue-500/10' : ''}
        h-full flex flex-col
        ${className}
      `}
      aria-label={`Blog post: ${title}`}
    >
      {/* Cover image */}
      <Link
        href={href}
        aria-label={`Read: ${title}`}
        tabIndex={-1}
        className="relative overflow-hidden h-48 flex-shrink-0 block"
      >
        {imageSrc ? (
          <BlogImage
            src={imageSrc}
            alt={title}
            aspectRatio="16/9"
            priority={priority}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div
            className={`
              w-full h-full
              bg-gradient-to-br ${colorClass}
              flex items-center justify-center
              text-5xl
              transition-transform duration-500
              group-hover:scale-105
            `}
          >
            {emoji}
          </div>
        )}

        {/* Featured badge */}
        {featured && (
          <span
            className="
              absolute top-3 left-3
              bg-gradient-to-r
              from-blue-600 to-violet-600
              text-white text-[10px]
              font-bold px-2.5 py-1
              rounded-full uppercase tracking-wider
            "
          >
            Featured
          </span>
        )}

        {/* Category badge */}
        {categoryName && (
          <span
            className="
              absolute top-3 right-3
              bg-white/90 backdrop-blur-sm
              text-blue-700 text-[10px]
              font-bold px-2.5 py-1
              rounded-full uppercase tracking-wider
            "
          >
            {categoryName}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Tags */}
        {(tags?.length > 0 ||
          categoryName) && (
          <div
            className="flex gap-1.5 flex-wrap mb-3"
            aria-label="Categories and tags"
          >

            {categoryName && (
              <Link
                href={`/category/${nameToSlug(categoryName)}`}
                className="
                  text-[11px] font-semibold
                  px-2.5 py-0.5 rounded-full
                  bg-blue-50 text-blue-600
                  border border-blue-100
                  hover:bg-blue-100
                  transition-colors
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-blue-500
                "
              >
                {categoryName}
              </Link>
            )}

            {tags
              .slice(0, 2)
              .map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${nameToSlug(tag)}`}
                  className="
                    text-[11px] font-semibold
                    px-2.5 py-0.5 rounded-full
                    bg-gray-100 text-gray-600
                    border border-gray-200
                    hover:bg-gray-200
                    transition-colors
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-blue-500
                  "
                >
                  #{tag}
                </Link>
              ))}
          </div>
        )}

        {/* Title */}
        <h3
          className="
            font-bold text-gray-900
            text-[1.02rem]
            leading-snug mb-2
            line-clamp-2
            font-[var(--font-display)]
          "
        >
          <Link
            href={href}
            className="
              group-hover:text-blue-600
              transition-colors duration-200
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              rounded
            "
          >
            {title}
          </Link>
        </h3>

        {/* Description */}
        {description && (
          <p
            className="
              text-gray-500 text-sm
              leading-relaxed line-clamp-2
              mb-4 flex-1
            "
          >
            {description}
          </p>
        )}

        {/* Footer */}
        <footer
          className="
            flex items-center justify-between
            mt-auto pt-3
            border-t border-gray-50
          "
        >
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">

            {author?.avatar ? (
              <img
                src={author.avatar}
                alt=""
                className="
                  w-8 h-8 rounded-full
                  object-cover border
                  border-gray-200
                "
              />
            ) : (
              <div
                className="
                  w-8 h-8 rounded-full
                  bg-gradient-to-br
                  from-blue-500 to-indigo-600
                  flex items-center
                  justify-center
                  text-white text-xs
                  font-bold flex-shrink-0
                "
              >
                {getInitials(authorName)}
              </div>
            )}

            <div className="min-w-0">
              {authorId ? (
                <Link
                  href={`/author/${authorId}`}
                  className="
                    text-xs font-semibold
                    text-gray-700
                    hover:text-blue-600
                    transition-colors
                    truncate block
                  "
                >
                  {authorName}
                </Link>
              ) : (
                <span
                  className="
                    text-xs font-semibold
                    text-gray-700
                  "
                >
                  {authorName}
                </span>
              )}

              {publishedAt && (
                <p className="text-[11px] text-gray-400">
                  {formatDate(
                    publishedAt
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Read time */}
          {readTime && (
            <span
              className="
                text-[11px]
                text-gray-400
                font-medium
                flex-shrink-0
              "
            >
              {readTime} min read
            </span>
          )}
        </footer>
      </div>
    </article>
  );
}