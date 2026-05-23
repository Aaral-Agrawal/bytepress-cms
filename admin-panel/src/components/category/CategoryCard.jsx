import React from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, FileText, Hash } from 'lucide-react'

const CategoryCard = ({ category, onEdit, onDelete, index = 0 }) => {
  const { name, description, color = '#f97316', blogCount = 0, slug, createdAt } = category

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

      <div className="p-5">
        {/* Icon + Name row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: color + '18' }}
            >
              <Hash size={18} style={{ color }} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-ink-900 truncate leading-tight">
                {name}
              </h3>
              {slug && (
                <p className="text-[11px] text-ink-400 font-mono mt-0.5 truncate">
                  /{slug}
                </p>
              )}
            </div>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 text-ink-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              title="Edit category"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete category"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Description */}
        {description ? (
          <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        ) : (
          <p className="text-xs text-ink-300 italic mb-3">No description</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-ink-100">
          <div className="flex items-center gap-1.5">
            <FileText size={12} className="text-ink-400" />
            <span className="text-xs text-ink-500">
              <span className="font-semibold text-ink-700">{blogCount}</span>{' '}
              {blogCount === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {/* Badge pill */}
          <span
            className="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: color + '18', color }}
          >
            {name}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default CategoryCard