import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle, Search, Filter, LayoutGrid, List,
  Edit2, Trash2, Eye, Send, CheckCircle2, XCircle,
  MessageSquare, ChevronLeft, ChevronRight, Loader2,
  FileText, RefreshCw, SlidersHorizontal, CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { blogAPI, categoryAPI } from '../services/api'
import StatusBadge from '../components/blog/StatusBadge'
import DeleteModal from '../components/blog/DeleteModal'

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            max-w-xs pointer-events-auto border
            ${t.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : t.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-white text-ink-800 border-ink-200'
            }`}
        >
          {t.type === 'success' && <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />}
          {t.type === 'error' && <AlertCircle size={15} className="text-red-500 flex-shrink-0" />}
          {t.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
)

// ─── Skeleton rows ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-ink-100 rounded animate-pulse" style={{ width: `${50 + i * 7}%` }} />
      </td>
    ))}
  </tr>
)

// ─── Skeleton card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-ink-100 p-4 space-y-3 animate-pulse">
    <div className="h-36 bg-ink-100 rounded-xl" />
    <div className="h-4 bg-ink-100 rounded w-3/4" />
    <div className="h-3 bg-ink-100 rounded w-1/2" />
    <div className="flex gap-2">
      <div className="h-6 bg-ink-100 rounded-full w-16" />
      <div className="h-6 bg-ink-100 rounded-full w-20" />
    </div>
  </div>
)

// ─── Confirmation Modal for status actions ──────────────────────────────────────
const ConfirmModal = ({ open, onClose, onConfirm, loading, title, message, confirmLabel, confirmClass }) => {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        >
          <h3 className="text-base font-semibold text-ink-900 mb-2">{title}</h3>
          <p className="text-sm text-ink-500 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-ink-600 bg-ink-50 hover:bg-ink-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 ${confirmClass || 'bg-ink-900 hover:bg-ink-800'}`}
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Blogs = () => {
  const navigate  = useNavigate()
  const { role, user } = useAuth()

  // ── State ───────────────────────────────────────────────────────────────────
  const [blogs, setBlogs]         = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [viewMode, setViewMode]   = useState('table')
  const [toasts, setToasts]       = useState([])
  const [categories, setCategories] = useState([])

  // Filters
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 10

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  // Confirm modal (for approve/reject/publish etc.)
  const [confirmState, setConfirmState] = useState(null)
  // confirmState: { blog, action: 'approve'|'reject'|'publish'|'request_changes', loading }

  const searchTimer = useRef(null)

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  // ── Role-based path helpers ─────────────────────────────────────────────────
  const roleBase = role === 'superadmin' ? '/dashboard/admin'
    : role === 'editor' ? '/dashboard/editor'
    : '/dashboard/author'

  const createPath = `${roleBase}/blogs/create`

  const editPath = (blog) => `${roleBase}/blogs/edit/${blog._id}`

  const previewPath = (blog) => `${roleBase}/blogs/preview/${blog._id}`

  // ── Permission helpers ──────────────────────────────────────────────────────

  // Can the current user edit this blog?
  const canEdit = (blog) => {
    if (role === 'superadmin') return true
    if (role === 'editor') return true
    // Author: only their own blogs, and only if draft or changes_requested
    if (role === 'author') {
      const isOwner =
        blog.author?._id === user?._id ||
        blog.author?._id?.toString() === user?._id?.toString() ||
        blog.author === user?._id
      return isOwner && ['draft', 'changes_requested'].includes(blog.status)
    }
    return false
  }

  // Can the current user delete this blog?
  const canDelete = (blog) => {
    if (role === 'superadmin') return true
    if (role === 'editor') {
      // Editor cannot delete superadmin-created content
      return blog.author?.role !== 'superadmin'
    }
    // Author: only own drafts
    if (role === 'author') {
      const isOwner =
        blog.author?._id === user?._id ||
        blog.author?._id?.toString() === user?._id?.toString() ||
        blog.author === user?._id
      return isOwner && blog.status === 'draft'
    }
    return false
  }

  // Can submit for review (author only, own draft or changes_requested)
  const canSubmit = (blog) => {
    if (role !== 'author') return false
    const isOwner =
      blog.author?._id === user?._id ||
      blog.author?._id?.toString() === user?._id?.toString() ||
      blog.author === user?._id
    return isOwner && ['draft', 'changes_requested'].includes(blog.status)
  }

  // Can approve (editor/superadmin, only pending_review or changes_requested)
  const canApprove = (blog) =>
    ['superadmin', 'editor'].includes(role) &&
    ['pending_review', 'changes_requested'].includes(blog.status)

  // Can publish (editor/superadmin, only approved)
  const canPublish = (blog) =>
    ['superadmin', 'editor'].includes(role) &&
    blog.status === 'approved'

  // Can request changes (editor/superadmin, only pending_review)
  const canRequestChanges = (blog) =>
    ['superadmin', 'editor'].includes(role) &&
    blog.status === 'pending_review'

  // Can reject (editor/superadmin — not already rejected/published)
  const canReject = (blog) =>
    ['superadmin', 'editor'].includes(role) &&
    !['rejected', 'published'].includes(blog.status)

  // ── Fetch blogs ──────────────────────────────────────────────────────────────
  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      // Backend enforces author filter already, but sending it doesn't hurt

      const res  = await blogAPI.getAll(params)
      const list = res?.blogs || res?.data || res || []
      const tot  = res?.total || list.length
      setBlogs(Array.isArray(list) ? list : [])
      setTotal(tot)
    } catch {
      addToast('Failed to load blogs.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, categoryFilter, addToast])

  useEffect(() => { fetchBlogs() }, [fetchBlogs])

  // ── Load categories ──────────────────────────────────────────────────────────
  useEffect(() => {
    categoryAPI.getAll()
      .then((res) => {
        const cats = res?.categories || res?.data || res || []
        setCategories(Array.isArray(cats) ? cats : [])
      })
      .catch(() => {})
  }, [])

  // ── Search debounce ──────────────────────────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setPage(1), 400)
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await blogAPI.delete(deleteTarget._id)
      addToast('Blog deleted successfully.', 'success')
      setDeleteTarget(null)
      fetchBlogs()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete blog.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Status Actions ───────────────────────────────────────────────────────────
  const executeStatusAction = async () => {
    if (!confirmState) return
    const { blog, action } = confirmState
    setConfirmState((s) => ({ ...s, loading: true }))
    try {
      switch (action) {
        case 'submit':
          await blogAPI.submitForReview(blog._id)
          addToast('Blog submitted for review!', 'success')
          break
        case 'approve':
          await blogAPI.approve(blog._id)
          addToast('Blog approved successfully!', 'success')
          break
        case 'publish':
          await blogAPI.publish(blog._id)
          addToast('Blog published successfully!', 'success')
          break
        case 'request_changes':
          await blogAPI.updateStatus(blog._id, 'changes_requested')
          addToast('Changes requested.', 'success')
          break
        case 'reject':
          await blogAPI.updateStatus(blog._id, 'rejected')
          addToast('Blog rejected.', 'success')
          break
        case 'unpublish':
          await blogAPI.updateStatus(blog._id, 'draft')
          addToast('Blog moved back to draft.', 'success')
          break
        default:
          break
      }
      setConfirmState(null)
      fetchBlogs()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Action failed.', 'error')
      setConfirmState((s) => ({ ...s, loading: false }))
    }
  }

  const openConfirm = (blog, action) => setConfirmState({ blog, action, loading: false })

  // ── Confirm modal config per action ─────────────────────────────────────────
  const getConfirmConfig = (action, blog) => {
    const configs = {
      submit: {
        title: 'Submit for Review',
        message: `Submit "${blog?.title}" for editorial review? You won't be able to edit it until feedback is received.`,
        confirmLabel: 'Submit',
        confirmClass: 'bg-sky-600 hover:bg-sky-700',
      },
      approve: {
        title: 'Approve Blog',
        message: `Approve "${blog?.title}"? It will be moved to approved status and can then be published.`,
        confirmLabel: 'Approve',
        confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
      },
      publish: {
        title: 'Publish Blog',
        message: `Publish "${blog?.title}"? It will be live and visible to all readers.`,
        confirmLabel: 'Publish',
        confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
      },
      request_changes: {
        title: 'Request Changes',
        message: `Request changes on "${blog?.title}"? The author will be notified to revise and resubmit.`,
        confirmLabel: 'Request Changes',
        confirmClass: 'bg-amber-500 hover:bg-amber-600',
      },
      reject: {
        title: 'Reject Blog',
        message: `Reject "${blog?.title}"? The author will be notified.`,
        confirmLabel: 'Reject',
        confirmClass: 'bg-red-600 hover:bg-red-700',
      },
      unpublish: {
        title: 'Unpublish Blog',
        message: `Move "${blog?.title}" back to draft? It will be hidden from the public.`,
        confirmLabel: 'Unpublish',
        confirmClass: 'bg-amber-500 hover:bg-amber-600',
      },
    }
    return configs[action] || {}
  }

  const totalPages = Math.ceil(total / LIMIT)

  // ─── Status filter options by role ─────────────────────────────────────────
  const statusOptions = role === 'author'
    ? [
        { value: 'draft',             label: 'Draft' },
        { value: 'pending_review',    label: 'Pending Review' },
        { value: 'changes_requested', label: 'Changes Requested' },
        { value: 'approved',          label: 'Approved' },
        { value: 'published',         label: 'Published' },
        { value: 'rejected',          label: 'Rejected' },
      ]
    : [
        { value: 'draft',             label: 'Draft' },
        { value: 'pending_review',    label: 'Pending Review' },
        { value: 'changes_requested', label: 'Changes Requested' },
        { value: 'approved',          label: 'Approved' },
        { value: 'published',         label: 'Published' },
        { value: 'rejected',          label: 'Rejected' },
      ]

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="space-y-5">
      <Toast toasts={toasts} />

      {/* Delete confirmation modal */}
      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Blog Post"
        itemName={deleteTarget?.title}
        description="This will permanently delete the blog post and all its content. This action cannot be undone."
      />

      {/* Generic action confirmation modal */}
      {confirmState && (
        <ConfirmModal
          open={Boolean(confirmState)}
          onClose={() => !confirmState.loading && setConfirmState(null)}
          onConfirm={executeStatusAction}
          loading={confirmState.loading}
          {...getConfirmConfig(confirmState.action, confirmState.blog)}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">
            {role === 'author' ? 'My Blogs' : 'All Blogs'}
          </h1>
          <p className="text-xs text-ink-400 mt-0.5">
            {total} post{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBlogs}
            className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => navigate(createPath)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                       bg-ink-900 hover:bg-ink-800 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            New Post
          </button>
        </div>
      </motion.div>

      {/* ── Filters bar ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search blogs…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl
                       bg-white text-ink-800 placeholder-ink-400 outline-none
                       focus:border-ink-400 focus:ring-2 focus:ring-ink-100 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="pl-8 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl bg-white
                       text-ink-700 outline-none focus:border-ink-400 focus:ring-2
                       focus:ring-ink-100 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              className="pl-8 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl bg-white
                         text-ink-700 outline-none focus:border-ink-400 focus:ring-2
                         focus:ring-ink-100 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => {
                const name = typeof c === 'string' ? c : c.name || c.slug
                return <option key={name} value={name}>{name}</option>
              })}
            </select>
          </div>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-ink-100 rounded-xl p-1 ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-ink-800' : 'text-ink-400 hover:text-ink-700'}`}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-ink-800' : 'text-ink-400 hover:text-ink-700'}`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </motion.div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Grid view */}
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {loading
              ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
              : blogs.map((blog) => (
                  <motion.div
                    key={blog._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden
                               hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative h-36 bg-ink-50">
                      {blog.featureImage ? (
                        <img src={blog.featureImage} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText size={32} className="text-ink-200" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={blog.status} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-ink-900 line-clamp-2 mb-1 leading-snug">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-ink-400 mb-3">
                        {blog.author?.name || 'Unknown'} ·{' '}
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                      {blog.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {blog.categories.slice(0, 2).map((c) => (
                            <span key={c} className="text-[10px] px-2 py-0.5 bg-ink-100 text-ink-600 rounded-full">{c}</span>
                          ))}
                          {blog.categories.length > 2 && (
                            <span className="text-[10px] px-2 py-0.5 bg-ink-100 text-ink-500 rounded-full">+{blog.categories.length - 2}</span>
                          )}
                        </div>
                      )}
                      {/* Actions */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-ink-100 flex-wrap">
                        {/* Preview — always use internal preview route */}
                        <button
                          onClick={() => navigate(previewPath(blog))}
                          className="p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        {canEdit(blog) && (
                          <button
                            onClick={() => navigate(editPath(blog))}
                            className="p-1.5 text-ink-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {canSubmit(blog) && (
                          <button
                            onClick={() => openConfirm(blog, 'submit')}
                            className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Submit for Review"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        {canApprove(blog) && (
                          <button
                            onClick={() => openConfirm(blog, 'approve')}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {canPublish(blog) && (
                          <button
                            onClick={() => openConfirm(blog, 'publish')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-bold"
                            title="Publish"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {canRequestChanges(blog) && (
                          <button
                            onClick={() => openConfirm(blog, 'request_changes')}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Request Changes"
                          >
                            <MessageSquare size={14} />
                          </button>
                        )}
                        {canReject(blog) && (
                          <button
                            onClick={() => openConfirm(blog, 'reject')}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        {blog.status === 'published' && ['superadmin', 'editor'].includes(role) && (
                          <button
                            onClick={() => openConfirm(blog, 'unpublish')}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Unpublish"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        {canDelete(blog) && (
                          <button
                            onClick={() => setDeleteTarget(blog)}
                            className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
            }
          </motion.div>
        )}

        {/* Table view */}
        {viewMode === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/50">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider w-8">#</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {loading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : blogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <FileText size={36} className="text-ink-200 mx-auto mb-3" />
                        <p className="text-ink-500 font-medium text-sm">No blogs found</p>
                        <p className="text-ink-400 text-xs mt-1">
                          {search || statusFilter || categoryFilter
                            ? 'Try adjusting your filters'
                            : 'Create your first blog post to get started'}
                        </p>
                        {!search && !statusFilter && !categoryFilter && (
                          <button
                            onClick={() => navigate(createPath)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                                       text-white bg-ink-900 hover:bg-ink-800 rounded-xl transition-colors"
                          >
                            <PlusCircle size={14} />
                            Create Blog
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {blogs.map((blog, idx) => (
                        <motion.tr
                          key={blog._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="hover:bg-ink-50/50 transition-colors group"
                        >
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-ink-400 font-mono">
                              {(page - 1) * LIMIT + idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {blog.featureImage ? (
                                <img
                                  src={blog.featureImage}
                                  alt=""
                                  className="w-10 h-8 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                                />
                              ) : (
                                <div className="w-10 h-8 rounded-lg bg-ink-100 flex-shrink-0 hidden sm:flex items-center justify-center">
                                  <FileText size={14} className="text-ink-300" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink-900 line-clamp-1">{blog.title}</p>
                                <p className="text-xs text-ink-400 font-mono line-clamp-1 mt-0.5">/{blog.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <p className="text-sm text-ink-700">{blog.author?.name || '—'}</p>
                            {blog.author?.role && (
                              <p className="text-xs text-ink-400 capitalize">{blog.author.role}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {blog.categories?.slice(0, 2).map((c) => (
                                <span key={c} className="text-[10px] px-2 py-0.5 bg-ink-100 text-ink-600 rounded-full">{c}</span>
                              ))}
                              {(blog.categories?.length || 0) > 2 && (
                                <span className="text-[10px] text-ink-400">+{blog.categories.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={blog.status} animate />
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <p className="text-xs text-ink-500">
                              {blog.createdAt
                                ? new Date(blog.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                  })
                                : '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            {/* Actions — visible on row hover */}
                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">

                              {/* Preview — internal route, works for all statuses */}
                              <button
                                onClick={() => navigate(previewPath(blog))}
                                className="p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye size={14} />
                              </button>

                              {/* Edit */}
                              {canEdit(blog) && (
                                <button
                                  onClick={() => navigate(editPath(blog))}
                                  className="p-1.5 text-ink-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}

                              {/* Submit for Review (author only) */}
                              {canSubmit(blog) && (
                                <button
                                  onClick={() => openConfirm(blog, 'submit')}
                                  className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                  title="Submit for Review"
                                >
                                  <Send size={14} />
                                </button>
                              )}

                              {/* Approve (editor/superadmin) */}
                              {canApprove(blog) && (
                                <button
                                  onClick={() => openConfirm(blog, 'approve')}
                                  className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}

                              {/* Publish (editor/superadmin) */}
                              {canPublish(blog) && (
                                <button
                                  onClick={() => openConfirm(blog, 'publish')}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Publish"
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}

                              {/* Request Changes (editor/superadmin) */}
                              {canRequestChanges(blog) && (
                                <button
                                  onClick={() => openConfirm(blog, 'request_changes')}
                                  className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Request Changes"
                                >
                                  <MessageSquare size={14} />
                                </button>
                              )}

                              {/* Reject (editor/superadmin) */}
                              {canReject(blog) && (
                                <button
                                  onClick={() => openConfirm(blog, 'reject')}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={14} />
                                </button>
                              )}

                              {/* Unpublish (editor/superadmin) */}
                              {blog.status === 'published' && ['superadmin', 'editor'].includes(role) && (
                                <button
                                  onClick={() => openConfirm(blog, 'unpublish')}
                                  className="p-1.5 text-amber-400 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Unpublish to Draft"
                                >
                                  <XCircle size={14} />
                                </button>
                              )}

                              {/* Delete */}
                              {canDelete(blog) && (
                                <button
                                  onClick={() => setDeleteTarget(blog)}
                                  className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-ink-100 bg-ink-50/30">
                <p className="text-xs text-ink-500">
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-lg
                               transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                        page === i + 1 ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-lg
                               transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Blogs