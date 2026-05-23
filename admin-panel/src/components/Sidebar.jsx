import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, PenSquare, Users, Tag, FolderOpen,
  Settings, BarChart3, Search, LogOut, BookOpen, ChevronLeft,
  ChevronRight, FileEdit, User, BookMarked, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  superadmin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard/admin' },
    { label: 'Blogs', icon: FileText, to: '/dashboard/admin/blogs' },
    { label: 'Create Blog', icon: PenSquare, to: '/dashboard/admin/blogs/create' },
    { label: 'Users', icon: Users, to: '/dashboard/admin/users' },
    { label: 'Categories', icon: FolderOpen, to: '/dashboard/admin/categories' },
    { label: 'Tags', icon: Tag, to: '/dashboard/admin/tags' },
    { label: 'SEO Settings', icon: Search, to: '/dashboard/admin/seo' },
    { label: 'Site Settings', icon: Settings, to: '/dashboard/admin/settings' },
    { label: 'Analytics', icon: BarChart3, to: '/dashboard/admin/analytics' },
  ],
  editor: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard/editor' },
    { label: 'Blogs', icon: FileText, to: '/dashboard/editor/blogs' },
    { label: 'Create Blog', icon: PenSquare, to: '/dashboard/editor/blogs/create' },
    { label: 'Categories', icon: FolderOpen, to: '/dashboard/editor/categories' },
    { label: 'Tags', icon: Tag, to: '/dashboard/editor/tags' },
    { label: 'SEO', icon: Search, to: '/dashboard/editor/seo' },
  ],
  author: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard/author' },
    { label: 'My Blogs', icon: BookMarked, to: '/dashboard/author/blogs' },
    { label: 'Create Blog', icon: PenSquare, to: '/dashboard/author/blogs/create' },
    { label: 'Drafts', icon: FileEdit, to: '/dashboard/author/drafts' },
    { label: 'Profile', icon: User, to: '/dashboard/author/profile' },
  ],
};

const ROLE_CONFIG = {
  superadmin: {
    gradient: 'from-violet-500 to-indigo-500',
    dotColor: 'bg-violet-300',
    label: 'Super Admin',
    avatarBg: 'bg-violet-100',
    avatarText: 'text-violet-700',
  },
  editor: {
    gradient: 'from-sky-500 to-blue-500',
    dotColor: 'bg-sky-300',
    label: 'Editor',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
  },
  author: {
    gradient: 'from-emerald-500 to-teal-500',
    dotColor: 'bg-emerald-300',
    label: 'Author',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
  },
};

const getInitials = (name = '') =>
  name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

/* ─── Nav Section Label ─── */
const SectionLabel = ({ label, collapsed }) => (
  <AnimatePresence>
    {!collapsed && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="px-3 pt-5 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-ink-400 select-none"
      >
        {label}
      </motion.p>
    )}
  </AnimatePresence>
);

/* ─── Shared Sidebar Content ─── */
const SidebarContent = ({ role, user, navItems, onLogout, collapsed, onClose }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.author;
  const initials = getInitials(user?.name);

  // Group nav items into sections
  const mainItems = navItems.slice(0, 3);
  const manageItems = navItems.slice(3);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo bar ── */}
      <div
        className={`flex items-center gap-3 h-16 border-b border-ink-100 flex-shrink-0 ${
          collapsed ? 'px-4 justify-center' : 'px-5'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-ink-900 flex items-center justify-center flex-shrink-0 shadow-sm">
          <BookOpen size={15} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="min-w-0"
            >
              <span className="font-semibold text-ink-900 text-[15px] tracking-tight leading-none block">
                BytePress CMS
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-ink-400">
                Admin
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Role pill ── */}
      <div className={`flex-shrink-0 ${collapsed ? 'px-3 pt-4' : 'px-4 pt-4'}`}>
        <div
          className={`flex items-center gap-2 rounded-xl overflow-hidden bg-gradient-to-r ${cfg.gradient} ${
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${cfg.dotColor} animate-pulse flex-shrink-0`} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="text-white text-xs font-semibold tracking-wide truncate"
              >
                {cfg.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2 mt-1 space-y-0.5 scrollbar-none">

        {/* Main section */}
        {!collapsed && <SectionLabel label="Main" collapsed={collapsed} />}
        {collapsed && <div className="pt-4" />}

        {mainItems.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}

        {/* Manage section */}
        {manageItems.length > 0 && (
          <>
            {!collapsed && <SectionLabel label="Manage" collapsed={collapsed} />}
            {collapsed && <div className="pt-3" />}
            {manageItems.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className="flex-shrink-0 border-t border-ink-100 px-3 pt-3 pb-4 space-y-1">
        {/* User card */}
        <AnimatePresence>
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-ink-50 mb-2"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${cfg.avatarBg} ${cfg.avatarText}`}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-800 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-ink-400 truncate leading-tight">
                  {user.email}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed avatar */}
        {collapsed && user && (
          <div className="flex justify-center pb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${cfg.avatarBg} ${cfg.avatarText}`}
              title={user.name}
            >
              {initials}
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group
            text-red-500 hover:bg-red-50 hover:text-red-600
            ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={16} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

/* ─── Individual Nav Item ─── */
const NavItem = ({ item, collapsed }) => (
  <NavLink
    to={item.to}
    end={item.label === 'Dashboard'}
    title={collapsed ? item.label : undefined}
    className={({ isActive }) =>
      `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group
      ${collapsed ? 'justify-center px-2' : ''}
      ${
        isActive
          ? 'bg-ink-900 text-white shadow-sm'
          : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <item.icon
          size={16}
          className={`flex-shrink-0 transition-colors ${
            isActive ? 'text-white' : 'text-ink-400 group-hover:text-ink-600'
          }`}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.12 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        
        {collapsed && isActive && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white opacity-60" />
        )}
      </>
    )}
  </NavLink>
);

/* ─── Mobile Overlay Sidebar ─── */
const MobileSidebar = ({ role, user, navItems, onLogout, open, onClose }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
        <motion.aside
          initial={{ x: -288 }}
          animate={{ x: 0 }}
          exit={{ x: -288 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-ink-100 shadow-2xl z-50 lg:hidden flex flex-col"
        >
          <SidebarContent
            role={role}
            user={user}
            navItems={navItems}
            onLogout={onLogout}
            collapsed={false}
            onClose={onClose}
          />
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

/* ─── Main Sidebar ─── */
const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = NAV_BY_ROLE[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 248 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-ink-100 flex-shrink-0 relative overflow-visible"
      >
        <SidebarContent
          role={role}
          user={user}
          navItems={navItems}
          onLogout={handleLogout}
          collapsed={collapsed}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-[72px] w-7 h-7 bg-white border border-ink-200 rounded-full flex items-center justify-center shadow-md text-ink-400 hover:text-ink-700 hover:border-ink-300 transition-all z-10"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </motion.aside>

      {/* Mobile */}
      <MobileSidebar
        role={role}
        user={user}
        navItems={navItems}
        onLogout={handleLogout}
        open={mobileOpen}
        onClose={onMobileClose}
      />
    </>
  );
};

export default Sidebar;