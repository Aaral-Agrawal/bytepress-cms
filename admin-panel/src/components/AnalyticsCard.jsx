import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Skeleton loader ─────────────────────────────────────
export const CardSkeleton = () => (
  <div className="stat-card space-y-3">
    <div className="flex items-center justify-between">
      <div className="shimmer h-3 w-20 rounded" />
      <div className="shimmer h-9 w-9 rounded-xl" />
    </div>
    <div className="shimmer h-8 w-28 rounded" />
    <div className="shimmer h-2.5 w-16 rounded" />
  </div>
);

// ─── Analytics / Stat card ───────────────────────────────
/**
 * @param {string} label
 * @param {string|number} value
 * @param {React.ComponentType} icon
 * @param {string} iconColor  — Tailwind bg color class e.g. "bg-violet-100"
 * @param {string} iconText   — icon text color e.g. "text-violet-600"
 * @param {number} change     — percentage change (positive/negative/0)
 * @param {string} changePeriod — e.g. "vs last month"
 * @param {number} index      — for staggered animation
 */
export const AnalyticsCard = ({
  label,
  value,
  icon: Icon,
  iconColor = 'bg-ink-100',
  iconText = 'text-ink-600',
  change,
  changePeriod = 'vs last month',
  index = 0,
}) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0 || change == null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
          {Icon && <Icon size={17} className={iconText} />}
        </div>
      </div>

      <p className="text-3xl font-display font-semibold text-ink-900 mb-1.5 tracking-tight">
        {value ?? '—'}
      </p>

      {change != null && (
        <div className="flex items-center gap-1.5">
          {isPositive && <TrendingUp size={13} className="text-emerald-500" />}
          {isNegative && <TrendingDown size={13} className="text-red-500" />}
          {isNeutral && <Minus size={13} className="text-ink-400" />}
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-ink-400'}`}>
            {isPositive ? '+' : ''}{change}% {changePeriod}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ─── Dashboard grid wrapper ───────────────────────────────
export const DashboardCards = ({ children, cols = 4 }) => {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${colClass} gap-4`}>
      {children}
    </div>
  );
};

// ─── Section header ──────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-lg font-display font-semibold text-ink-900">{title}</h2>
      {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── Recent blogs table row ───────────────────────────────
export const BlogRow = ({ title, author, status, date, category, index }) => {
  const statusMap = {
    published: 'badge-green',
    draft: 'badge-yellow',
    review: 'badge-blue',
    archived: 'badge-gray',
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors"
    >
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-ink-800 truncate max-w-xs">{title}</p>
        {category && <p className="text-xs text-ink-400 mt-0.5">{category}</p>}
      </td>
      <td className="py-3 px-4 text-sm text-ink-500">{author}</td>
      <td className="py-3 px-4">
        <span className={statusMap[status] || 'badge-gray'}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'published' ? 'bg-emerald-500' :
            status === 'draft' ? 'bg-amber-500' :
            status === 'review' ? 'bg-blue-500' : 'bg-ink-400'
          }`} />
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-ink-400">{date}</td>
    </motion.tr>
  );
};

// ─── Table wrapper ───────────────────────────────────────
export const DataTable = ({ headers, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-ink-100 shadow-card overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-ink-50 border-b border-ink-100">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  </div>
);

// ─── Empty state ─────────────────────────────────────────
export const EmptyState = ({ icon, title, message, action }) => (
  <div className="text-center py-16">
    <div className="text-4xl mb-4">{icon || '📭'}</div>
    <h3 className="text-base font-semibold text-ink-800 mb-1.5">{title}</h3>
    <p className="text-sm text-ink-500 mb-5 max-w-xs mx-auto">{message}</p>
    {action}
  </div>
);

export default AnalyticsCard;