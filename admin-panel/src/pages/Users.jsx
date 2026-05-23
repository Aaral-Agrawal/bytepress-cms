import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UserX, UserCheck, Trash2, Shield, Users,
  ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
  CheckCircle, User, Mail, Calendar, MoreVertical,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'
import { RoleDropdown, UserStatusBadge } from '../components/users/UserComponents'
import DeleteModal from '../components/blog/DeleteModal'
import { Navigate } from 'react-router-dom'

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            max-w-xs pointer-events-auto border
            ${t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : t.type === 'error' ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-white text-ink-800 border-ink-200'
            }`}
        >
          {t.type === 'success' && <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />}
          {t.type === 'error' && <AlertCircle size={15} className="text-red-500 flex-shrink-0" />}
          {t.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
)

// ─── Skeleton row ───────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-ink-100 rounded animate-pulse" style={{ width: `${55 + i * 10}%` }} />
      </td>
    ))}
  </tr>
)

// ─── Avatar ─────────────────────────────────────────────────────────────────────
const Avatar = ({ user }) => {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const colors = ['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700']
  const color = colors[user.name?.charCodeAt(0) % colors.length] || colors[0]

  if (user.avatar) {
    return (
      <img src={user.avatar} alt={user.name}
        className="w-9 h-9 rounded-full object-cover ring-2 ring-white flex-shrink-0" />
    )
  }
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                     flex-shrink-0 ring-2 ring-white ${color}`}>
      {initials}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const UsersPage = () => {
  const { role: currentRole, user: currentUser } = useAuth()

  // Guard: only superadmin
  if (currentRole !== 'superadmin') {
    return <Navigate to="/login" replace />
  }

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 12

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Role updating
  const [updatingRole, setUpdatingRole] = useState({})
  const [updatingStatus, setUpdatingStatus] = useState({})

  const searchTimer = useRef(null)

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter

      const res = await userAPI.getAll(params)
      const list = res?.users || res?.data || res || []
      const tot = res?.total || res?.pagination?.total || list.length
      setUsers(Array.isArray(list) ? list : [])
      setTotal(tot)
    } catch {
      addToast('Failed to load users.', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, statusFilter, addToast])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ── Search debounce ──────────────────────────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setPage(1), 400)
  }

  // ── Update role ──────────────────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?._id) {
      addToast("You cannot change your own role.", 'error')
      return
    }
    setUpdatingRole((prev) => ({ ...prev, [userId]: true }))
    try {
      await userAPI.update(userId, { role: newRole })
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u))
      addToast(`Role updated to ${newRole}.`, 'success')
    } catch {
      addToast('Failed to update role.', 'error')
    } finally {
      setUpdatingRole((prev) => ({ ...prev, [userId]: false }))
    }
  }

  // ── Block / Unblock ───────────────────────────────────────────────────────────
  const handleToggleStatus = async (user) => {
    if (user._id === currentUser?._id) {
      addToast("You cannot block your own account.", 'error')
      return
    }
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended'
    setUpdatingStatus((prev) => ({ ...prev, [user._id]: true }))
    try {
      await userAPI.update(user._id, { status: newStatus })
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, status: newStatus } : u))
      addToast(`User ${newStatus === 'suspended' ? 'blocked' : 'unblocked'} successfully.`, 'success')
    } catch {
      addToast('Failed to update user status.', 'error')
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [user._id]: false }))
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    if (deleteTarget._id === currentUser?._id) {
      addToast("You cannot delete your own account.", 'error')
      return
    }
    setDeleting(true)
    try {
      await userAPI.delete(deleteTarget._id)
      addToast('User deleted successfully.', 'success')
      setDeleteTarget(null)
      fetchUsers()
    } catch {
      addToast('Failed to delete user.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const isSelf = (u) => u._id === currentUser?._id

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="space-y-5">
      <Toast toasts={toasts} />
      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete User Account"
        itemName={deleteTarget?.name}
        description="This will permanently delete the user account and all associated data. This action cannot be undone."
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
              <Shield size={16} className="text-purple-600" />
            </div>
            <h1 className="text-xl font-display font-bold text-ink-900">User Management</h1>
          </div>
          <p className="text-xs text-ink-400 mt-0.5 ml-10.5">
            {total} user{total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-xl transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </motion.div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-ink-200 rounded-xl bg-white
                       text-ink-800 placeholder-ink-400 outline-none focus:border-ink-400
                       focus:ring-2 focus:ring-ink-100 transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 text-sm border border-ink-200 rounded-xl bg-white text-ink-700
                     outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-100
                     transition-all appearance-none cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="viewer">Viewer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 text-sm border border-ink-200 rounded-xl bg-white text-ink-700
                     outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-100
                     transition-all appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </motion.div>

      {/* ── Stats cards ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Total',      value: total,                                                  color: 'bg-ink-50 text-ink-700',       icon: Users },
          { label: 'Active',     value: users.filter(u => u.status === 'active').length,        color: 'bg-emerald-50 text-emerald-700', icon: UserCheck },
          { label: 'Suspended',  value: users.filter(u => u.status === 'suspended').length,     color: 'bg-red-50 text-red-700',        icon: UserX },
          { label: 'Admins',     value: users.filter(u => u.role === 'superadmin').length,      color: 'bg-purple-50 text-purple-700',  icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl p-3.5 flex items-center gap-3 ${color}`}>
            <Icon size={18} className="flex-shrink-0 opacity-70" />
            <div>
              <p className="text-lg font-bold leading-none">{loading ? '—' : value}</p>
              <p className="text-xs opacity-70 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Users size={36} className="text-ink-200 mx-auto mb-3" />
                    <p className="text-ink-500 font-medium text-sm">No users found</p>
                    <p className="text-ink-400 text-xs mt-1">
                      {search || roleFilter || statusFilter
                        ? 'Try adjusting your filters'
                        : 'No users registered yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {users.map((user, idx) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className={`hover:bg-ink-50/40 transition-colors group
                                  ${isSelf(user) ? 'bg-blue-50/30' : ''}`}
                    >
                      {/* User info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-ink-900 truncate">
                                {user.name}
                              </p>
                              {isSelf(user) && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700
                                                 rounded-full font-medium flex-shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            {/* Show email here on mobile (hidden email column) */}
                            <p className="text-xs text-ink-400 truncate md:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-ink-300 flex-shrink-0" />
                          <span className="text-sm text-ink-600 truncate max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <RoleDropdown
                          value={user.role}
                          onChange={(newRole) => handleRoleChange(user._id, newRole)}
                          disabled={isSelf(user) || updatingRole[user._id]}
                        />
                        {updatingRole[user._id] && (
                          <div className="w-3 h-3 border border-ink-300 border-t-ink-700 rounded-full
                                          animate-spin inline-block ml-2" />
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <UserStatusBadge status={user.status} />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-ink-300" />
                          <span className="text-xs text-ink-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center gap-1 justify-end transition-opacity
                                        ${isSelf(user) ? 'opacity-30 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={updatingStatus[user._id]}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1
                                        text-xs font-medium
                                        ${user.status === 'suspended'
                                          ? 'text-emerald-600 hover:bg-emerald-50'
                                          : 'text-amber-600 hover:bg-amber-50'
                                        }`}
                            title={user.status === 'suspended' ? 'Unblock' : 'Block'}
                          >
                            {updatingStatus[user._id] ? (
                              <div className="w-3.5 h-3.5 border border-current/30 border-t-current
                                              rounded-full animate-spin" />
                            ) : user.status === 'suspended' ? (
                              <UserCheck size={14} />
                            ) : (
                              <UserX size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg
                                       transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-ink-100 bg-ink-50/30">
            <p className="text-xs text-ink-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} users
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-lg
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                // Show pages around current
                const pageNum = totalPages <= 7 ? i + 1
                  : i === 0 ? 1
                  : i === 6 ? totalPages
                  : Math.max(2, Math.min(page - 2, totalPages - 4)) + i - 1
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                      page === pageNum ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-lg
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default UsersPage