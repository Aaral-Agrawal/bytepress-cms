 import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, CheckCircle, Clock, Users, FolderOpen,
  PenSquare, UserCog, Archive, Tag, ArrowRight, Feather
} from 'lucide-react'
import AnalyticsCard, { AnalyticsCardSkeleton } from '../components/AnalyticsCard'
import RecentBlogsTable from '../components/RecentBlogsTable'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const QUICK_ACTIONS = [
  { label: 'Create Blog',    icon: PenSquare,  to: '/dashboard/blogs/create', color: 'bg-accent-500 hover:bg-accent-600',    desc: 'Write a new post' },
  { label: 'Manage Users',   icon: UserCog,    to: '/dashboard/users',        color: 'bg-sky-500 hover:bg-sky-600',           desc: 'Edit team members' },
  { label: 'View Drafts',    icon: Archive,    to: '/dashboard/blogs?status=draft', color: 'bg-amber-500 hover:bg-amber-600', desc: 'Unpublished posts' },
  { label: 'Categories',     icon: FolderOpen, to: '/dashboard/categories',   color: 'bg-violet-500 hover:bg-violet-600',     desc: 'Organise content' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [stats,        setStats]        = useState(null)
  const [recentBlogs,  setRecentBlogs]  = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingBlogs, setLoadingBlogs] = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/dashboard/stats')
        setStats(data)
      } catch {
        setError('Failed to load dashboard statistics.')
      } finally {
        setLoadingStats(false)
      }
    }

    async function fetchBlogs() {
      try {
        const { data } = await api.get('/blogs?limit=8&sort=-createdAt')
        // Support both { blogs: [...] } and [...] shapes
        setRecentBlogs(Array.isArray(data) ? data : data.blogs || data.data || [])
      } catch {
        // silently fail — table shows empty state
      } finally {
        setLoadingBlogs(false)
      }
    }

    fetchStats()
    fetchBlogs()
  }, [])

  const CARDS = [
    { label: 'Total Blogs',     value: stats?.totalBlogs,      icon: FileText,    color: 'orange', trend: 'up',      trendValue: 12, delay: 0    },
    { label: 'Published',       value: stats?.publishedBlogs,  icon: CheckCircle, color: 'green',  trend: 'up',      trendValue: 8,  delay: 0.08 },
    { label: 'Drafts',          value: stats?.draftBlogs,      icon: Clock,       color: 'purple', trend: 'neutral', trendValue: 0,  delay: 0.16 },
    { label: 'Total Users',     value: stats?.totalUsers,      icon: Users,       color: 'blue',   trend: 'up',      trendValue: 5,  delay: 0.24 },
    { label: 'Categories',      value: stats?.totalCategories, icon: FolderOpen,  color: 'rose',   trend: 'neutral', trendValue: 0,  delay: 0.32 },
  ]

  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p className="text-sm text-ink-400 font-medium mb-0.5">{GREETING()},</p>
          <h1 className="font-display text-2xl md:text-3xl text-ink-950 leading-tight">
            {user?.name || 'Admin'} <span className="text-ink-300">👋</span>
          </h1>
          <p className="text-sm text-ink-400 mt-1">Here's what's happening on your blog today.</p>
        </div>

        <motion.button
          onClick={() => navigate('/dashboard/blogs/create')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn-accent flex items-center gap-2 self-start sm:self-auto"
        >
          <Feather size={15} />
          New Blog Post
        </motion.button>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Analytics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loadingStats
          ? Array.from({ length: 5 }).map((_, i) => <AnalyticsCardSkeleton key={i} />)
          : CARDS.map(card => <AnalyticsCard key={card.label} {...card} />)
        }
      </div>

      {/* Main content: table + quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent blogs table — takes 2/3 */}
        <div className="xl:col-span-2">
          <RecentBlogsTable blogs={recentBlogs} loading={loadingBlogs} />
        </div>

        {/* Quick actions panel — takes 1/3 */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-ink-900 mb-1">Quick Actions</h3>
            <p className="text-xs text-ink-400 mb-4">Jump to common tasks</p>
            <div className="space-y-2.5">
              {QUICK_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-ink-200 hover:bg-ink-50/60 transition-all duration-150 text-left group"
                >
                  <div className={`w-9 h-9 ${action.color} rounded-xl flex items-center justify-center shadow-soft transition-colors shrink-0`}>
                    <action.icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800">{action.label}</p>
                    <p className="text-xs text-ink-400">{action.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-ink-300 group-hover:text-ink-600 group-hover:translate-x-0.5 transition-all" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Role info card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="card p-5 bg-gradient-to-br from-ink-950 to-ink-800 border-0"
          >
            <div className="flex items-center gap-2 mb-3">
              <Feather size={15} className="text-accent-400" />
              <span className="text-xs font-semibold text-accent-400 uppercase tracking-widest">Your Role</span>
            </div>
            <p className="text-xl font-display font-semibold text-white capitalize mb-1">
              {user?.role || 'Admin'}
            </p>
            <p className="text-xs text-ink-400 leading-relaxed">
              {user?.role === 'superadmin'
                ? 'Full platform access — manage users, content, and settings.'
                : user?.role === 'editor'
                ? 'You can manage all content, categories, and tags.'
                : user?.role === 'author'
                ? 'You can create and manage your own blog posts.'
                : 'Read-only access across the platform.'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
