import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookMarked, FileEdit, Eye, PenSquare,
  TrendingUp, Star, ArrowRight, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, blogAPI } from '../services/api';
import {
  AnalyticsCard, DashboardCards, SectionHeader,
  BlogRow, DataTable, CardSkeleton, EmptyState
} from '../components/AnalyticsCard';

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-ink-100 rounded-xl shadow-glass px-3 py-2 text-xs">
        <p className="font-semibold text-ink-700">{label}</p>
        <p className="text-emerald-600">Views: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// ─── Top blog card ────────────────────────────────────────────────────────────
const TopBlogCard = ({ rank, title, views, category }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-ink-50 last:border-0">
    <span className="w-6 h-6 rounded-lg bg-ink-100 text-ink-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
      {rank}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-ink-800 truncate">{title}</p>
      <p className="text-xs text-ink-400">{category}</p>
    </div>
    <span className="text-sm font-semibold text-ink-700 flex items-center gap-1 flex-shrink-0">
      <Eye size={12} className="text-ink-400" /> {typeof views === 'number' ? views.toLocaleString() : views}
    </span>
  </div>
);

// ─── Table skeleton ───────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-ink-100 shadow-card overflow-hidden">
    <div className="bg-ink-50 border-b border-ink-100 px-4 py-3 flex gap-8">
      {['Title', 'Author', 'Status', 'Last Updated'].map((h) => (
        <div key={h} className="shimmer h-2.5 w-16 rounded" />
      ))}
    </div>
    {Array(4).fill(0).map((_, i) => (
      <div key={i} className="flex gap-8 px-4 py-3.5 border-b border-ink-50">
        <div className="shimmer h-3 w-48 rounded flex-1" />
        <div className="shimmer h-3 w-24 rounded" />
        <div className="shimmer h-3 w-16 rounded" />
        <div className="shimmer h-3 w-20 rounded" />
      </div>
    ))}
  </div>
);

// ─── Format date ──────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AuthorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,        setStats]        = useState(null);
  const [myBlogs,      setMyBlogs]      = useState([]);
  const [topBlogs,     setTopBlogs]     = useState([]);
  const [viewsData,    setViewsData]    = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [statsError,   setStatsError]   = useState(null);
  const [blogsError,   setBlogsError]   = useState(null);

  // ── Fetch author stats ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await analyticsAPI.getAuthorStats();
      setStats(res.data);
    } catch {
      setStatsError('Failed to load statistics.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch author's own blogs ───────────────────────────────────────────────
  const fetchMyBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    setBlogsError(null);
    try {
      // getAllBlogs on backend filters by author automatically for 'author' role
      const res = await blogAPI.getAll();
      const blogs = Array.isArray(res) ? res : res.blogs || res.data || [];

      // Recent 5 for the table
      setMyBlogs(blogs.slice(0, 5));

      // Top 4 by views for the sidebar widget
      const sorted = [...blogs]
        .filter((b) => b.status === 'published')
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 4);
      setTopBlogs(sorted);

      
      const weeklyMap = {};
      blogs.forEach((b) => {
        if (!b.createdAt) return;
        const date    = new Date(b.createdAt);
        const weekNum = Math.floor((Date.now() - date.getTime()) / (7 * 86400000));
        const key     = `W${8 - weekNum}`;
        if (weekNum >= 0 && weekNum < 8) {
          weeklyMap[key] = (weeklyMap[key] || 0) + (b.views || 1);
        }
      });

      const weeklyData = Array.from({ length: 8 }, (_, i) => {
        const k = `W${i + 1}`;
        return { week: k, views: weeklyMap[k] || 0 };
      });
      setViewsData(weeklyData);
    } catch {
      setBlogsError('Failed to load your blogs.');
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchMyBlogs();
  }, [fetchStats, fetchMyBlogs]);

  // ── Stat cards ────────────────────────────────────────────────────────────
  const cards = stats
    ? [
        { label: 'My Blogs',    value: stats.myBlogs?.toString(),   icon: BookMarked, iconColor: 'bg-emerald-100', iconText: 'text-emerald-600', change: null },
        { label: 'My Drafts',   value: stats.myDrafts?.toString(),  icon: FileEdit,   iconColor: 'bg-amber-100',   iconText: 'text-amber-600',   change: null },
        { label: 'Published',   value: stats.published?.toString(), icon: Eye,        iconColor: 'bg-sky-100',     iconText: 'text-sky-600',     change: null },
        { label: 'Total Views', value: stats.totalViews,            icon: TrendingUp, iconColor: 'bg-violet-100',  iconText: 'text-violet-600',  change: null },
      ]
    : [];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-900">
            Hi, {user?.name?.split(' ')[0] || 'Author'} 🖊️
          </h1>
          <p className="text-ink-500 text-sm mt-0.5">
            Your writing dashboard — create, draft, and publish with ease.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchStats(); fetchMyBlogs(); }}
            className="btn-ghost text-sm hidden sm:flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => navigate('/dashboard/author/blogs/create')}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <PenSquare size={14} /> Write New
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {statsError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
          <span>⚠️</span><span>{statsError}</span>
          <button onClick={fetchStats} className="ml-auto underline">Retry</button>
        </div>
      ) : (
        <DashboardCards cols={4}>
          {loadingStats
            ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : cards.map((card, i) => <AnalyticsCard key={card.label} {...card} index={i} />)}
        </DashboardCards>
      )}

      {/* Charts + top blogs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Views chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-ink-100 shadow-card p-5"
        >
          <SectionHeader title="My Blog Views" subtitle="Weekly views across your published posts" />
          {loadingBlogs ? (
            <div className="animate-pulse flex items-end gap-2 h-[200px]">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex-1 bg-ink-100 rounded-t-lg" style={{ height: `${30 + Math.random() * 60}%` }} />
              ))}
            </div>
          ) : viewsData.every((d) => d.views === 0) ? (
            <div className="flex items-center justify-center h-[200px] text-ink-300 text-sm flex-col gap-2">
              <TrendingUp size={32} className="text-ink-200" />
              <p>No views data yet</p>
              <p className="text-xs text-ink-200">Views will appear once your blogs are published</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={viewsData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a0a0a0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a0a0a0' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" fill="#0f9b8e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top posts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-ink-100 shadow-card p-5"
        >
          <SectionHeader title="Top Posts" />
          {loadingBlogs ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="shimmer w-6 h-6 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="shimmer h-3 w-full rounded" />
                    <div className="shimmer h-2 w-16 rounded" />
                  </div>
                  <div className="shimmer h-3 w-10 rounded" />
                </div>
              ))}
            </div>
          ) : topBlogs.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-400">
              <p>No published posts yet</p>
            </div>
          ) : (
            <div>
              {topBlogs.map((blog, i) => (
                <TopBlogCard
                  key={blog._id || i}
                  rank={i + 1}
                  title={blog.title}
                  views={blog.views || 0}
                  category={blog.categories?.[0] || '—'}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* My recent blogs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SectionHeader
          title="My Recent Blogs"
          subtitle="Your latest published and draft content"
          action={
            <button onClick={() => navigate('/dashboard/author/blogs')} className="btn-ghost text-sm">
              View all →
            </button>
          }
        />
        {loadingBlogs ? (
          <TableSkeleton />
        ) : blogsError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
            <span>⚠️</span><span>{blogsError}</span>
            <button onClick={fetchMyBlogs} className="ml-auto underline">Retry</button>
          </div>
        ) : myBlogs.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="No blogs yet"
            message="Start writing your first post!"
            action={
              <button
                onClick={() => navigate('/dashboard/author/blogs/create')}
                className="btn-primary text-sm"
              >
                Write Now
              </button>
            }
          />
        ) : (
          <DataTable headers={['Title', 'Author', 'Status', 'Last Updated']}>
            {myBlogs.map((blog, i) => (
              <BlogRow
                key={blog._id || i}
                title={blog.title}
                author={user?.name || 'You'}
                status={blog.status}
                date={formatDate(blog.updatedAt || blog.createdAt)}
                category={blog.categories?.[0] || ''}
                index={i}
              />
            ))}
          </DataTable>
        )}
      </motion.div>

     
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-gradient-to-br from-ink-900 to-ink-700 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-6 top-6 opacity-10">
          <Star size={80} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 mb-2">Pro Tip</p>
        <h3 className="font-display text-xl font-semibold mb-2">Consistency is key 🗓️</h3>
        <p className="text-ink-300 text-sm mb-4 max-w-md">
          Authors who publish at least once a week see 3× more organic traffic within 3 months. Set a writing schedule and stick to it.
        </p>
        <button
          onClick={() => navigate('/dashboard/author/blogs/create')}
          className="inline-flex items-center gap-2 bg-white text-ink-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-ink-100 transition-colors"
        >
          Start Writing <ArrowRight size={14} />
        </button>
      </motion.div>
    </div>
  );
};

export default AuthorDashboard;