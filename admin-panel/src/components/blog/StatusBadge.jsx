import React from 'react'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  // Blog statuses
  draft:             { label: 'Draft',            bg: 'bg-ink-100',     text: 'text-ink-600',    dot: 'bg-ink-400'    },
  pending_review:    { label: 'Pending Review',    bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-500'  },
  changes_requested: { label: 'Changes Needed',   bg: 'bg-orange-50',   text: 'text-orange-700', dot: 'bg-orange-500' },
  approved:          { label: 'Approved',          bg: 'bg-sky-50',      text: 'text-sky-700',    dot: 'bg-sky-500'    },
  published:         { label: 'Published',         bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-500'},
  rejected:          { label: 'Rejected',          bg: 'bg-red-50',      text: 'text-red-700',    dot: 'bg-red-500'    },

  // User statuses
  active:            { label: 'Active',            bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-500'},
  inactive:          { label: 'Inactive',          bg: 'bg-ink-100',     text: 'text-ink-600',    dot: 'bg-ink-400'    },
  suspended:         { label: 'Suspended',         bg: 'bg-red-50',      text: 'text-red-700',    dot: 'bg-red-500'    },
}

const PULSE_STATUSES = ['pending_review', 'changes_requested']

const StatusBadge = ({ status, size = 'sm', animate = false, className = '' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'bg-ink-100',
    text: 'text-ink-500',
    dot: 'bg-ink-400',
  }

  const shouldPulse = animate && PULSE_STATUSES.includes(status)
  const sizeClasses = size === 'md'
    ? 'px-3 py-1 text-sm gap-2'
    : 'px-2.5 py-0.5 text-xs gap-1.5'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center font-medium rounded-full whitespace-nowrap
        ${config.bg} ${config.text} ${sizeClasses} ${className}`}
    >
      <span className={`relative flex-shrink-0 rounded-full w-1.5 h-1.5 ${config.dot}`}>
        {shouldPulse && (
          <span className={`absolute inset-0 rounded-full ${config.dot} animate-ping opacity-75`} />
        )}
      </span>
      {config.label}
    </motion.span>
  )
}

export default StatusBadge