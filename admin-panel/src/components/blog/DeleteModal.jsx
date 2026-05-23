import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, AlertTriangle } from 'lucide-react'


const DeleteModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'This action cannot be undone.',
  itemName,
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                disabled={loading}
                className="absolute top-4 right-4 p-1.5 text-ink-400 hover:text-ink-700
                           hover:bg-ink-100 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>

              {/* Icon */}
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-display font-semibold text-ink-900 mb-1">{title}</h3>

              {itemName && (
                <div className="flex items-center gap-2 mb-3 p-2.5 bg-ink-50 rounded-xl">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-ink-700 font-medium truncate">"{itemName}"</span>
                </div>
              )}

              <p className="text-sm text-ink-500 leading-relaxed mb-6">{description}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-ink-700 bg-ink-100
                             hover:bg-ink-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500
                             hover:bg-red-600 rounded-xl transition-colors disabled:opacity-70
                             flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DeleteModal