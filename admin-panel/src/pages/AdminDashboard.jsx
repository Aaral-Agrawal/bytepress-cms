import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, FileText, Eye, BarChart3, FolderOpen,
  TrendingUp, PenSquare, Settings, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, blogAPI } from '../services/api';
import {
  AnalyticsCard, DashboardCards, SectionHeader,
  BlogRow, DataTable, EmptyState, CardSkeleton
} from '../components/AnalyticsCard';

// ─── Recharts custom tooltip ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-ink-100 rounded-xl shadow-glass px-3 py-2.5 text-xs">
        <p className="font-semibold text-ink-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Chart skeleton ───────────────────────────────────────────────────────────
const ChartSkeleton = ({ height = 220 }) => (
  <div className="animate-pulse space-y-3 pt-2">
    <div className="flex items-end gap-2" style={{ height }}>
      {Array(7).fill(0).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-ink-100 rounded-t-lg"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
    <div className="flex justify-between">
      {Array(7).fill(0).map((_, i) => (
        <div key={i} className="shimmer h-2 w-6 rounded" />
      ))}
    </div>
  </div>
);

// ─── Table skeleton ───────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-ink-100 shadow-card overflow-hidden">
    <div className="bg-ink-50 border-b border-ink-100 px-4 py-3 flex gap-8">
      {['Title', 'Author', 'Status', 'Date'].map((h) => (
        <div key={h} className="shimmer h-2.5 w-16 rounded" />
      ))}
    </div>
    {Array(5).fill(0).map((_, i) => (
      <div key={i} className="flex gap-8 px-4 py-3.5 border-b border-ink-50">
        <div className="shimmer h-3 w-48 rounded flex-1" />
        <div className="shimmer h-3 w-24 rounded" />
        <div className="shimmer h-3 w-16 rounded" />
        <div className="shimmer h-3 w-20 rounded" />
      </div>
    ))}
  </div>
);

// ─── Format date helper ───────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats,          setStats]          = useState(null);
  const [trafficData,    setTrafficData]    = useState([]);
  const [blogStatusData, setBlogStatusData] = useState([]);
  const [recentBlogs,    setRecentBlogs]    = useState([]);

  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingCharts,  setLoadingCharts]  = useState(true);
  const [loadingBlogs,   setLoadingBlogs]   = useState(true);

  const [statsError,     setStatsError]     = useState(null);
  const [chartsError,    setChartsError]    = useState(null);
  const [blogsError,     setBlogsError]     = useState(null);

  // ── Fetch dashboard stats ──────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await analyticsAPI.getAdminStats();
      setStats(res.data);
    } catch (err) {
      setStatsError('Failed to load statistics.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch chart data (traffic + blog status) ───────────────────────────────
  const fetchCharts = useCallback(async () => {
    setLoadingCharts(true);
    setChartsError(null);
    try {
      const [trafficRes, statusRes] = await Promise.all([
        analyticsAPI.getTrafficAnalytics(),
        analyticsAPI.getBlogStatusAnalytics(),
      ]);
      setTrafficData(trafficRes.data  || []);
      setBlogStatusData(statusRes.data || []);
    } catch (err) {
      setChartsError('Failed to load chart data.');
    } finally {
      setLoadingCharts(false);
    }
  }, []);

  // ── Fetch recent blogs ─────────────────────────────────────────────────────
  const fetchRecentBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    setBlogsError(null);
    try {
      const res = await blogAPI.getRecent();
      setRecentBlogs(res.data || []);
    } catch (err) {
      setBlogsError('Failed to load recent blogs.');
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  // ── Fetch all on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchCharts();
    fetchRecentBlogs();
  }, [fetchStats, fetchCharts, fetchRecentBlogs]);

  // ── Stat cards config ──────────────────────────────────────────────────────
  const cards = stats
    ? [
        { label: 'Total Users',     value: stats.totalUsers?.toLocaleString(),     icon: Users,     iconColor: 'bg-violet-100', iconText: 'text-violet-600', change: stats.usersChange     ?? null },
        { label: 'Total Blogs',     value: stats.totalBlogs?.toLocaleString(),     icon: FileText,  iconColor: 'bg-sky-100',    iconText: 'text-sky-600',    change: stats.blogsChange     ?? null },
        { label: 'Published',       value: stats.publishedBlogs?.toLocaleString(), icon: Eye,       iconColor: 'bg-emerald-100',iconText: 'text-emerald-600',change: stats.publishedChange ?? null },
        { label: 'Drafts',          value: stats.draftBlogs?.toLocaleString(),     icon: PenSquare, iconColor: 'bg-amber-100',  iconText: 'text-amber-600',  change: stats.draftsChange    ?? null },
        { label: 'Categories',      value: stats.categories?.toLocaleString(),     icon: FolderOpen,iconColor: 'bg-pink-100',   iconText: 'text-pink-600',   change: null },
        { label: 'Monthly Traffic', value: stats.monthlyTraffic,                   icon: BarChart3, iconColor: 'bg-indigo-100', iconText: 'text-indigo-600', change: stats.trafficChange   ?? null },
      ]
    : [];

   
  return (
    <div className="space-y-6">

      {/* ── Page heading ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-900">
            Good morning, {user?.name?.split(' ')[0] || 'Admin'} 👑
          </h1>
          <p className="text-ink-500 text-sm mt-0.5">
            Here's what's happening across your platform today.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchStats(); fetchCharts(); fetchRecentBlogs(); }}
            className="btn-ghost text-sm hidden sm:flex items-center gap-2"
            title="Refresh dashboard"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => navigate('/dashboard/admin/blogs/create')}
            className="btn-primary text-sm hidden sm:flex items-center gap-2"
          >
            <PenSquare size={14} /> New Blog
          </button>
        </div>
      </motion.div>

      {/* ── Stats grid ── */}
      {statsError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
          <span>⚠️</span>
          <span>{statsError}</span>
          <button onClick={fetchStats} className="ml-auto underline text-red-500 hover:text-red-700">
            Retry
          </button>
        </div>
      ) : (
        <DashboardCards cols={3}>
          {loadingStats
            ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : cards.map((card, i) => (
                <AnalyticsCard key={card.label} {...card} index={i} />
              ))}
        </DashboardCards>
      )}

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Traffic area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-ink-100 shadow-card p-5"
        >
          <SectionHeader
            title="Traffic Overview"
            subtitle="Monthly page views & unique visits"
          />
          {loadingCharts ? (
            <ChartSkeleton height={220} />
          ) : chartsError ? (
            <EmptyState
              icon="📊"
              title="Chart unavailable"
              message={chartsError}
              action={
                <button onClick={fetchCharts} className="btn-ghost text-sm">
                  Retry
                </button>
              }
            />
          ) : trafficData.length === 0 ? (
            <EmptyState icon="📈" title="No traffic data yet" message="Data will appear once your blogs receive visits." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6b5ce7" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6b5ce7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a0a0a0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a0a0a0' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="views"  name="Views"  stroke="#6b5ce7" strokeWidth={2} fill="url(#viewsGrad)"  />
                <Area type="monotone" dataKey="visits" name="Visits" stroke="#0ea5e9" strokeWidth={2} fill="url(#visitsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Blog status bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-ink-100 shadow-card p-5"
        >
          <SectionHeader title="Blog Status" subtitle="Distribution" />
          {loadingCharts ? (
            <ChartSkeleton height={220} />
          ) : chartsError ? (
            <EmptyState icon="📊" title="Unavailable" message="Could not load status data." />
          ) : blogStatusData.length === 0 ? (
            <EmptyState icon="📋" title="No blogs yet" message="Status distribution will appear here." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={blogStatusData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#a0a0a0' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Blogs" fill="#1a1a2e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Recent blogs table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SectionHeader
          title="Recent Blogs"
          subtitle="Latest content across the platform"
          action={
            <button
              onClick={() => navigate('/dashboard/admin/blogs')}
              className="btn-ghost text-sm"
            >
              View all →
            </button>
          }
        />

        {loadingBlogs ? (
          <TableSkeleton />
        ) : blogsError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
            <span>⚠️</span>
            <span>{blogsError}</span>
            <button onClick={fetchRecentBlogs} className="ml-auto underline">Retry</button>
          </div>
        ) : recentBlogs.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="No blogs yet"
            message="Create your first blog post to see it here."
            action={
              <button
                onClick={() => navigate('/dashboard/admin/blogs/create')}
                className="btn-primary text-sm"
              >
                Create Blog
              </button>
            }
          />
        ) : (
          <DataTable headers={['Title', 'Author', 'Status', 'Date']}>
            {recentBlogs.map((blog, i) => (
              <BlogRow
                key={blog._id || i}
                title={blog.title}
                author={blog.author?.name || 'Unknown'}
                status={blog.status}
                date={formatDate(blog.createdAt)}
                category={blog.categories?.[0] || ''}
                index={i}
              />
            ))}
          </DataTable>
        )}
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users',  icon: Users,      to: '/dashboard/admin/users',     color: 'hover:border-violet-200 hover:bg-violet-50' },
            { label: 'Site Settings', icon: Settings,   to: '/dashboard/admin/settings',  color: 'hover:border-sky-200 hover:bg-sky-50' },
            { label: 'SEO Settings',  icon: BarChart3,  to: '/dashboard/admin/seo',       color: 'hover:border-emerald-200 hover:bg-emerald-50' },
            { label: 'Analytics',     icon: TrendingUp, to: '/dashboard/admin/analytics', color: 'hover:border-amber-200 hover:bg-amber-50' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={`bg-white border border-ink-100 rounded-xl p-4 text-left transition-all duration-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 ${item.color}`}
            >
              <item.icon size={18} className="text-ink-600 mb-2" />
              <p className="text-sm font-medium text-ink-700">{item.label}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;