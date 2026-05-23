import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle, Clock, Search, PenSquare,
  AlertTriangle, ArrowRight, Globe, Tag, FolderOpen, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
        <p className="text-sky-600">Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// ─── SEO health row ───────────────────────────────────────────────────────────
const SEOHealthItem = ({ label, score, status }) => (
  <div className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
    <div className="flex items-center gap-2.5">
      <div className={`w-2 h-2 rounded-full ${
        status === 'good' ? 'bg-emerald-400' :
        status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
      }`} />
      <span className="text-sm text-ink-700">{label}</span>
    </div>
    <span className={`text-sm font-semibold ${
      score >= 80 ? 'text-emerald-600' :
      score >= 60 ? 'text-amber-600' : 'text-red-600'
    }`}>
      {score}/100
    </span>
  </div>
);

// ─── Skeleton for table ───────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-ink-100 shadow-card overflow-hidden">
    <div className="bg-ink-50 border-b border-ink-100 px-4 py-3 flex gap-8">
      {['Title', 'Author', 'Status', 'Submitted'].map((h) => (
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

// ─── Format date helper ───────────────────────────────────────────────────────
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
const EditorDashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [stats,        setStats]        = useState(null);
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [statsError,   setStatsError]   = useState(null);
  const [blogsError,   setBlogsError]   = useState(null);

  // ── Fetch editor stats ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await analyticsAPI.getEditorStats();
      setStats(res.data);
    } catch {
      setStatsError('Failed to load statistics.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch pending review blogs ────────────────────────────────────────────
  const fetchPendingBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    setBlogsError(null);
    try {
      // Reuse getAll with status filter — backend returns role-filtered results
      const res = await blogAPI.getAll({ status: 'pending_review' });
      const blogs = Array.isArray(res) ? res : res.blogs || res.data || [];
      setPendingBlogs(blogs.slice(0, 5));
    } catch {
      setBlogsError('Failed to load pending blogs.');
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPendingBlogs();
  }, [fetchStats, fetchPendingBlogs]);

  // ── Stat cards ────────────────────────────────────────────────────────────
  const cards = stats
    ? [
        { label: 'Pending Review',  value: stats.pendingReview?.toString(),   icon: Clock,        iconColor: 'bg-amber-100',  iconText: 'text-amber-600',  change: null },
        { label: 'Published Today', value: stats.publishedToday?.toString(),  icon: CheckCircle,  iconColor: 'bg-emerald-100',iconText: 'text-emerald-600',change: null },
        { label: 'Total Drafts',    value: stats.totalDrafts?.toString(),     icon: FileText,     iconColor: 'bg-sky-100',    iconText: 'text-sky-600',    change: null },
        { label: 'Total Blogs',     value: stats.totalBlogs?.toString(),      icon: Search,       iconColor: 'bg-violet-100', iconText: 'text-violet-600', change: null },
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
            Editor Dashboard ✏️
          </h1>
          <p className="text-ink-500 text-sm mt-0.5">
            Review content, manage SEO, and keep the platform humming.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchStats(); fetchPendingBlogs(); }}
            className="btn-ghost text-sm hidden sm:flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => navigate('/dashboard/editor/blogs/create')}
            className="btn-primary text-sm hidden sm:flex items-center gap-2"
          >
            <PenSquare size={14} /> New Blog
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

      {/* Alert banner — driven by real pendingReview count */}
      {!loadingStats && stats?.pendingReview > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
        >
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{stats.pendingReview} blogs</span> are awaiting your review before they can be published.
          </p>
          <button
            onClick={() => navigate('/dashboard/editor/blogs')}
            className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
          >
            Review now <ArrowRight size={12} />
          </button>
        </motion.div>
      )}

      {/* SEO chart row — static for now (no SEO analytics endpoint yet) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-ink-100 shadow-card p-5"
        >
          <SectionHeader title="SEO Score Trend" subtitle="7-day average across all published blogs" />
          {/* SEO analytics are a separate feature — placeholder chart shown until endpoint exists */}
          <div className="flex items-center justify-center h-[200px] text-ink-300 text-sm flex-col gap-2">
            <Search size={32} className="text-ink-200" />
            <p>SEO analytics coming soon</p>
            <p className="text-xs text-ink-200">Connect a SEO analytics endpoint to populate this chart</p>
          </div>
        </motion.div>

        {/* SEO health — static scores, replace with real SEO API when available */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-ink-100 shadow-card p-5"
        >
          <SectionHeader title="SEO Health" />
          <div className="space-y-0.5">
            <SEOHealthItem label="Meta Titles"      score={94} status="good"    />
            <SEOHealthItem label="Meta Descriptions"score={87} status="good"    />
            <SEOHealthItem label="Image Alt Text"   score={62} status="warning" />
            <SEOHealthItem label="Internal Links"   score={71} status="warning" />
            <SEOHealthItem label="Page Speed"       score={88} status="good"    />
            <SEOHealthItem label="Structured Data"  score={45} status="poor"    />
          </div>
        </motion.div>
      </div>

      {/* Pending review table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SectionHeader
          title="Pending Review"
          subtitle="Blogs waiting for your approval"
          action={
            <button onClick={() => navigate('/dashboard/editor/blogs')} className="btn-ghost text-sm">
              View all →
            </button>
          }
        />
        {loadingBlogs ? (
          <TableSkeleton />
        ) : blogsError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
            <span>⚠️</span><span>{blogsError}</span>
            <button onClick={fetchPendingBlogs} className="ml-auto underline">Retry</button>
          </div>
        ) : pendingBlogs.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All caught up!"
            message="No blogs are currently waiting for review."
          />
        ) : (
          <DataTable headers={['Title', 'Author', 'Status', 'Submitted']}>
            {pendingBlogs.map((blog, i) => (
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

      {/* Quick access */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <SectionHeader title="Quick Access" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Manage Categories', icon: FolderOpen, to: '/dashboard/editor/categories', desc: 'Organise content structure',  color: 'hover:border-sky-200'     },
            { label: 'Manage Tags',       icon: Tag,        to: '/dashboard/editor/tags',       desc: 'Organise content tags',      color: 'hover:border-violet-200'  },
            { label: 'SEO Overview',      icon: Globe,      to: '/dashboard/editor/seo',        desc: 'Review SEO performance',     color: 'hover:border-emerald-200' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={`bg-white border border-ink-100 rounded-xl p-4 text-left transition-all duration-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 ${item.color}`}
            >
              <item.icon size={18} className="text-ink-600 mb-2" />
              <p className="text-sm font-semibold text-ink-800">{item.label}</p>
              <p className="text-xs text-ink-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EditorDashboard;