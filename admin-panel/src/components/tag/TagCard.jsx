import React from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, FileText } from 'lucide-react'

const TagCard = ({ tag, onEdit, onDelete, index = 0 }) => {
  const { name, description, color = '#6366f1', blogCount = 0, slug } = tag

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden
                 hover:shadow-md transition-shadow duration-300 group"
    >
      {/* Color stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          {/* Tag badge */}
          <span
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: color + '18', color }}
          >
            <span className="opacity-60">#</span>
            {name}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(tag)}
              className="p-1.5 text-ink-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              title="Edit tag"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onDelete(tag)}
              className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete tag"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Slug */}
        {slug && (
          <p className="text-[10px] text-ink-400 font-mono mb-2">/{slug}</p>
        )}

        {/* Description */}
        {description ? (
          <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        ) : (
          <p className="text-xs text-ink-300 italic mb-3">No description</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1.5 pt-2.5 border-t border-ink-100">
          <FileText size={11} className="text-ink-400" />
          <span className="text-xs text-ink-500">
            <span className="font-semibold text-ink-700">{blogCount}</span>{' '}
            {blogCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default TagCard