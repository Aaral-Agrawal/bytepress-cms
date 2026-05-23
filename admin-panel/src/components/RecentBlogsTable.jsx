import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, ExternalLink } from 'lucide-react'

const STATUS_BADGE = {
  published: 'bg-emerald-100 text-emerald-700',
  draft:     'bg-amber-100 text-amber-700',
  archived:  'bg-ink-100 text-ink-500',
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-5 py-4">
          <div className="animate-pulse bg-ink-100 rounded-lg h-4" style={{ width: i === 1 ? '70%' : i === 6 ? '60px' : '50%' }} />
        </td>
      ))}
    </tr>
  )
}

export default function RecentBlogsTable({ blogs = [], loading = false, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Recent Blogs</h3>
          <p className="text-xs text-ink-400 mt-0.5">Latest posts across all authors</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/blogs')}
          className="flex items-center gap-1.5 text-xs font-semibold text-accent-500 hover:text-accent-700 transition-colors"
        >
          View all <ExternalLink size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60">
              {['Title', 'Status', 'Category', 'Author', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-ink-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : blogs.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-ink-400">
                      <div className="w-10 h-10 rounded-2xl bg-ink-100 flex items-center justify-center">
                        <Edit2 size={18} className="text-ink-300" />
                      </div>
                      <p className="text-sm font-medium">No blogs yet</p>
                      <p className="text-xs">Create your first blog post to get started</p>
                    </div>
                  </td>
                </tr>
              )
              : blogs.map((blog, i) => (
                <motion.tr
                  key={blog._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="border-b border-ink-50 hover:bg-ink-50/60 transition-colors duration-150 group"
                >
                  {/* Title */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900 truncate max-w-[200px] group-hover:text-accent-600 transition-colors">
                      {blog.title || '—'}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`badge ${STATUS_BADGE[blog.status] || STATUS_BADGE.draft}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        blog.status === 'published' ? 'bg-emerald-500' :
                        blog.status === 'archived'  ? 'bg-ink-400' : 'bg-amber-500'
                      }`} />
                      {blog.status || 'draft'}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className="text-ink-600 text-xs font-medium">
                      {blog.category?.name || blog.category || '—'}
                    </span>
                  </td>

                  {/* Author */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {(blog.author?.name || blog.author || 'A').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-ink-600 text-xs truncate max-w-[80px]">
                        {blog.author?.name || blog.author || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4">
                    <span className="text-ink-400 text-xs">
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => navigate(`/dashboard/blogs/edit/${blog._id}`)}
                        className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={13} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onDelete?.(blog._id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
