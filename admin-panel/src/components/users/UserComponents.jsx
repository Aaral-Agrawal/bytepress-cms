// ─── RoleDropdown ──────────────────────────────────────────────────────────────
import React from 'react'
import { motion } from 'framer-motion'

const ROLE_CONFIG = {
  superadmin: { label: 'Super Admin', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  editor:     { label: 'Editor',      color: 'text-sky-700 bg-sky-50 border-sky-200'         },
  author:     { label: 'Author',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  viewer:     { label: 'Viewer',      color: 'text-ink-600 bg-ink-100 border-ink-200'         },
}

/**
 * RoleDropdown
 * Props:
 *  - value: current role string
 *  - onChange: (newRole) => void
 *  - disabled: boolean
 */
export const RoleDropdown = ({ value, onChange, disabled = false }) => {
  const config = ROLE_CONFIG[value] || ROLE_CONFIG.viewer

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border appearance-none
                  cursor-pointer outline-none transition-all duration-200
                  focus:ring-2 focus:ring-ink-100
                  disabled:cursor-not-allowed disabled:opacity-60
                  ${config.color}`}
    >
      <option value="superadmin">Super Admin</option>
      <option value="editor">Editor</option>
      <option value="author">Author</option>
      <option value="viewer">Viewer</option>
    </select>
  )
}

// ─── UserStatusBadge ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:    { label: 'Active',    bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive:  { label: 'Inactive',  bg: 'bg-ink-100',    text: 'text-ink-600',     dot: 'bg-ink-400'     },
  suspended: { label: 'Suspended', bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'     },
}

/**
 * UserStatusBadge
 * Props:
 *  - status: 'active' | 'inactive' | 'suspended'
 */
export const UserStatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.inactive
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full
                  ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </motion.span>
  )
}

export default { RoleDropdown, UserStatusBadge }