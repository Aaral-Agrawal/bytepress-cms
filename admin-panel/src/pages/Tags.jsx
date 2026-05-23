import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Tag, RefreshCw,
  CheckCircle, AlertCircle, Trash2, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { tagAPI } from '../services/api'
import TagCard from '../components/tag/TagCard'
import TagForm from '../components/tag/TagForm'

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

// ─── Delete Confirm ────────────────────────────────────────────────────────────
const ConfirmDeleteModal = ({ open, target, onClose, onConfirm, loading }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-ink-100 p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-ink-900 mb-1">Delete Tag</h3>
            <p className="text-sm text-ink-500 mb-5">
              Are you sure you want to delete tag{' '}
              <span className="font-semibold text-ink-800">#{target?.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium text-ink-600 border border-ink-200
                           hover:bg-ink-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500
                           hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60
                           flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                  : <Trash2 size={14} />
                }
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden animate-pulse">
    <div className="h-1.5 bg-ink-100" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-ink-100 rounded-full w-24" />
        <div className="flex gap-1">
          <div className="w-7 h-7 bg-ink-100 rounded-lg" />
          <div className="w-7 h-7 bg-ink-100 rounded-lg" />
        </div>
      </div>
      <div className="h-3 bg-ink-100 rounded w-full" />
      <div className="h-3 bg-ink-100 rounded w-2/3" />
      <div className="h-px bg-ink-100" />
      <div className="h-3 bg-ink-100 rounded w-16" />
    </div>
  </div>
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Tags = () => {
  const { role } = useAuth()
  const canManage = ['superadmin', 'editor'].includes(role)

  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState([])

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const searchTimer = useRef(null)

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const fetchTags = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      const res = await tagAPI.getAll(params)
      const list = res?.tags || res?.data || res || []
      setTags(Array.isArray(list) ? list : [])
    } catch {
      addToast('Failed to load tags.', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, addToast])

  useEffect(() => { fetchTags() }, [fetchTags])

  const handleSearchChange = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {}, 400)
  }

  const handleFormSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editTarget) {
        const res = await tagAPI.update(editTarget._id, data)
        setTags((prev) => prev.map((t) => (t._id === editTarget._id ? res.tag : t)))
        addToast('Tag updated.', 'success')
      } else {
        const res = await tagAPI.create(data)
        setTags((prev) => [res.tag, ...prev])
        addToast('Tag created.', 'success')
      }
      setFormOpen(false)
      setEditTarget(null)
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save tag.', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (tag) => { setEditTarget(tag); setFormOpen(true) }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await tagAPI.delete(deleteTarget._id)
      setTags((prev) => prev.filter((t) => t._id !== deleteTarget._id))
      addToast('Tag deleted.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete tag.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = search.trim()
    ? tags.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : tags

  const totalPosts = tags.reduce((sum, t) => sum + (t.blogCount || 0), 0)

  return (
    <div className="space-y-5">
      <Toast toasts={toasts} />
      <TagForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        loading={formLoading}
      />
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Tag size={16} className="text-indigo-500" />
            </div>
            <h1 className="text-xl font-display font-bold text-ink-900">Tags</h1>
          </div>
          <p className="text-xs text-ink-400 mt-0.5 ml-10.5">
            {tags.length} tag{tags.length !== 1 ? 's' : ''} · {totalPosts} total posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTags}
            className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          {canManage && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                         text-white bg-ink-900 hover:bg-ink-800 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={15} />
              New Tag
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {[
          { label: 'Total Tags', value: tags.length, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Total Tagged Posts', value: totalPosts, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Avg Posts/Tag', value: tags.length ? Math.round(totalPosts / tags.length) : 0, color: 'bg-pink-50 text-pink-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-3.5 ${color}`}>
            <p className="text-lg font-bold leading-none">{loading ? '—' : value}</p>
            <p className="text-xs opacity-70 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="relative max-w-sm"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search tags…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl bg-white
                     text-ink-800 placeholder-ink-400 outline-none focus:border-ink-400
                     focus:ring-2 focus:ring-ink-100 transition-all"
        />
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Tag size={24} className="text-indigo-400" />
          </div>
          <p className="text-ink-600 font-semibold text-sm mb-1">
            {search ? 'No tags found' : 'No tags yet'}
          </p>
          <p className="text-ink-400 text-xs mb-5">
            {search
              ? 'Try a different search term'
              : 'Tags help readers discover related content'}
          </p>
          {canManage && !search && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                         text-white bg-ink-900 hover:bg-ink-800 rounded-xl transition-colors"
            >
              <Plus size={14} />
              Create Tag
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map((tag, i) => (
              <TagCard
                key={tag._id}
                tag={tag}
                index={i}
                onEdit={canManage ? openEdit : () => {}}
                onDelete={canManage ? setDeleteTarget : () => {}}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default Tags