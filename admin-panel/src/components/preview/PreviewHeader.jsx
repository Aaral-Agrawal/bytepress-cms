import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ExternalLink, Eye } from 'lucide-react'

const PreviewHeader = ({ blog }) => {
  if (!blog) return null

  const {
    title, featureImage, author, createdAt, publishedAt,
    categories = [], tags = [], status, readTime,
  } = blog

  const displayDate = publishedAt || createdAt
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

   
  const estimatedRead = readTime || Math.max(1, Math.ceil((blog.content?.length || 0) / 1000))

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Draft banner */}
      {status !== 'published' && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200
                        rounded-xl text-amber-700 text-sm">
          <Eye size={15} className="flex-shrink-0" />
          <span className="font-medium">Preview Mode</span>
          <span className="text-amber-500">—</span>
          <span className="capitalize text-amber-600">{status?.replace(/_/g, ' ')}</span>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="text-xs px-3 py-1 bg-ink-900 text-white rounded-full font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-ink-900
                     leading-tight tracking-tight">
        {title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-ink-100">
        {/* Author */}
        <div className="flex items-center gap-2.5">
          {author?.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center
                            ring-2 ring-white shadow-sm">
              <span className="text-white text-xs font-bold">
                {author?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-ink-800">{author?.name || 'Unknown'}</p>
            <p className="text-xs text-ink-400 capitalize">{author?.role || 'Author'}</p>
          </div>
        </div>

        <div className="h-4 w-px bg-ink-200" />

        {formattedDate && (
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <Clock size={13} />
          <span>{estimatedRead} min read</span>
        </div>
      </div>

      {/* Feature image */}
      {featureImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-ink-100"
        >
          <img
            src={featureImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 bg-ink-100 text-ink-600 rounded-lg font-medium
                         hover:bg-ink-200 transition-colors cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.header>
  )
}

export default PreviewHeader