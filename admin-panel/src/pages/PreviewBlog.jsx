import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Edit2, Eye, Share2, ExternalLink,
  AlertCircle, Loader2, Globe,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { blogAPI } from '../services/api'
import PreviewHeader from '../components/preview/PreviewHeader'
import TableOfContents, { injectHeadingIds, extractHeadings } from '../components/preview/TableOfContents'
import SEOPreview from '../components/preview/SEOPreview'
import FAQPreview from '../components/preview/FAQPreview'

// ─── Prose renderer — safely renders HTML blog content ────────────────────────
const BlogContent = ({ content, contentRef }) => {
  if (!content) {
    return (
      <div className="text-center py-12 text-ink-400">
        <p className="text-sm">No content yet.</p>
      </div>
    )
  }

  // Determine if content is HTML or plain text
  const isHtml = /<[a-z][\s\S]*>/i.test(content)

  if (isHtml) {
    return (
      <div
        ref={contentRef}
        className="prose prose-ink max-w-none
          prose-headings:font-display prose-headings:text-ink-900 prose-headings:font-bold
          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
          prose-p:text-ink-700 prose-p:leading-relaxed prose-p:text-base
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-ink-900 prose-strong:font-semibold
          prose-blockquote:border-l-4 prose-blockquote:border-ink-300 prose-blockquote:pl-4
          prose-blockquote:text-ink-600 prose-blockquote:italic
          prose-code:bg-ink-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-code:text-sm prose-code:text-ink-700
          prose-pre:bg-ink-900 prose-pre:text-ink-100 prose-pre:rounded-xl
          prose-img:rounded-xl prose-img:shadow-md
          prose-ul:text-ink-700 prose-ol:text-ink-700
          prose-li:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Plain text — render with line breaks
  return (
    <div ref={contentRef} className="space-y-4">
      {content.split('\n\n').map((para, i) => (
        <p key={i} className="text-ink-700 leading-relaxed text-base">
          {para}
        </p>
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const PreviewSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-6 bg-ink-100 rounded-full w-24" />
    <div className="space-y-3">
      <div className="h-10 bg-ink-100 rounded-xl w-4/5" />
      <div className="h-10 bg-ink-100 rounded-xl w-3/5" />
    </div>
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-ink-100" />
      <div className="space-y-1.5">
        <div className="h-3.5 bg-ink-100 rounded w-24" />
        <div className="h-3 bg-ink-100 rounded w-16" />
      </div>
    </div>
    <div className="h-64 bg-ink-100 rounded-2xl" />
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-3.5 bg-ink-100 rounded" style={{ width: `${75 + i * 5}%` }} />
      ))}
    </div>
  </div>
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PreviewBlog = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const contentRef = useRef(null)

  // ── Fetch blog ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await blogAPI.getPreview(id)
        const blogData = res?.blog || res
        setBlog(blogData)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load blog preview.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  // ── Inject heading IDs for TOC scroll ────────────────────────────────────────
  useEffect(() => {
    if (!blog?.content || !contentRef.current) return
    const headings = extractHeadings(blog.content)
    injectHeadingIds(contentRef.current, headings)
  }, [blog])

  // ── Navigation helper ─────────────────────────────────────────────────────────
  const goBack = () => navigate(-1)

  const editPath = () => {
    const base = role === 'superadmin' ? '/dashboard/admin'
      : role === 'editor' ? '/dashboard/editor'
      : '/dashboard/author'
    return `${base}/blogs/edit/${id}`
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="h-8 bg-ink-100 rounded-xl w-32 animate-pulse" />
        <PreviewSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <h2 className="font-semibold text-ink-800 mb-2">Preview Unavailable</h2>
        <p className="text-sm text-ink-500 mb-5">{error}</p>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                     text-white bg-ink-900 hover:bg-ink-800 rounded-xl transition-colors"
        >
          <ArrowLeft size={14} />
          Go Back
        </button>
      </motion.div>
    )
  }

  if (!blog) return null

  const hasContent = Boolean(blog.content)
  const hasTOC = hasContent && /<h[1-4]/i.test(blog.content)

  return (
    <div className="space-y-5">
      {/* ── Top action bar ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium
                     text-ink-600 border border-ink-200 hover:bg-ink-50 rounded-xl
                     transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex items-center gap-2">
          {/* Preview indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200
                          rounded-xl text-amber-700 text-xs font-medium">
            <Eye size={13} />
            Preview Mode
          </div>

          {/* Edit button */}
          {['superadmin', 'editor', 'author'].includes(role) && (
            <button
              onClick={() => navigate(editPath())}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                         text-white bg-ink-900 hover:bg-ink-800 rounded-xl transition-colors"
            >
              <Edit2 size={14} />
              Edit Post
            </button>
          )}

          {/* Open public if published */}
          {blog.status === 'published' && blog.slug && (
            <a
              href={`http://localhost:3000/blog/${blog.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                         text-ink-700 border border-ink-200 hover:bg-ink-50 rounded-xl
                         transition-colors"
            >
              <Globe size={14} />
              Live
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </motion.div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Left: Article ───────────────────────────────────────────────── */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 sm:p-8 space-y-8">

            {/* Hero */}
            <PreviewHeader blog={blog} />

            {/* Content */}
            {hasContent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <BlogContent content={blog.content} contentRef={contentRef} />
              </motion.div>
            ) : (
              <div className="py-12 text-center border border-dashed border-ink-200 rounded-xl">
                <p className="text-ink-400 text-sm">No content has been written yet.</p>
              </div>
            )}

            {/* FAQ — embedded in article if detected */}
            <FAQPreview blog={blog} />

            {/* Author card */}
            {blog.author && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="flex items-center gap-4 p-5 bg-ink-50 rounded-2xl border border-ink-100"
              >
                {blog.author.avatar ? (
                  <img
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-ink-900 flex items-center justify-center
                                  ring-2 ring-white shadow flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {blog.author.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide font-medium mb-0.5">Written by</p>
                  <p className="font-semibold text-ink-900">{blog.author.name}</p>
                  {blog.author.bio && (
                    <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{blog.author.bio}</p>
                  )}
                  <p className="text-xs text-ink-400 capitalize mt-0.5">{blog.author.role}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.article>

        {/* ── Right: Sidebar ──────────────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-4">

          {/* Table of contents */}
          {hasTOC && (
            <TableOfContents content={blog.content} />
          )}

          {/* SEO Preview */}
          <SEOPreview blog={blog} />

          {/* Blog metadata card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3.5 border-b border-ink-100">
              <h3 className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Post Details</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Status', value: blog.status?.replace(/_/g, ' '), capitalize: true },
                { label: 'Slug', value: `/${blog.slug || '—'}`, mono: true },
                { label: 'Categories', value: blog.categories?.join(', ') || '—' },
                { label: 'Tags', value: blog.tags?.join(', ') || '—' },
                {
                  label: 'Created',
                  value: blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })
                    : '—',
                },
              ].map(({ label, value, mono, capitalize }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-ink-400 font-semibold uppercase tracking-wide">
                    {label}
                  </span>
                  <span className={`text-xs text-ink-700 ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PreviewBlog