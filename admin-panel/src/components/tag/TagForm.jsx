import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Loader2, Palette } from 'lucide-react'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#14b8a6', '#f43f5e', '#64748b',
]

const TagForm = ({ open, onClose, onSubmit, initialData = null, loading = false }) => {
  const isEdit = Boolean(initialData)

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        description: initialData?.description || '',
        color: initialData?.color || '#6366f1',
      })
      setErrors({})
    }
  }, [open, initialData])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Tag name is required.'
    if (form.name.trim().length > 50) e.name = 'Name cannot exceed 50 characters.'
    if (form.description.length > 300) e.description = 'Description cannot exceed 300 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      color: form.color,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-ink-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: form.color + '20' }}>
                    <Tag size={15} style={{ color: form.color }} />
                  </div>
                  <h2 className="font-semibold text-ink-900 text-sm">
                    {isEdit ? 'Edit Tag' : 'New Tag'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Tag Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. javascript"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-ink-800
                                placeholder-ink-400 outline-none transition-all
                                ${errors.name
                                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                  : 'border-ink-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100'
                                }`}
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Description <span className="text-ink-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of this tag…"
                    rows={2}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-ink-800
                                placeholder-ink-400 outline-none transition-all resize-none
                                ${errors.description
                                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                  : 'border-ink-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100'
                                }`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.description
                      ? <p className="text-xs text-red-500">{errors.description}</p>
                      : <span />
                    }
                    <span className="text-xs text-ink-400">{form.description.length}/300</span>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-2">
                    <span className="flex items-center gap-1.5"><Palette size={13} />Color</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color }))}
                        className="w-7 h-7 rounded-lg transition-transform hover:scale-110 flex-shrink-0"
                        style={{
                          backgroundColor: color,
                          outline: form.color === color ? `2px solid ${color}` : '2px solid transparent',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-ink-500">Preview:</span>
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: form.color + '18', color: form.color }}
                    >
                      #{form.name || 'tag-name'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 text-sm font-medium text-ink-600 border border-ink-200
                               hover:bg-ink-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 text-sm font-medium text-white rounded-xl
                               transition-all disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                    style={{ backgroundColor: form.color }}
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {isEdit ? 'Save Changes' : 'Create Tag'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TagForm