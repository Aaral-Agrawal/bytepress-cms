import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, ChevronDown, LogOut, User, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  editor: 'Editor',
  author: 'Author',
};

const ROLE_COLORS = {
  superadmin: 'bg-violet-100 text-violet-700',
  editor: 'bg-sky-100 text-sky-700',
  author: 'bg-emerald-100 text-emerald-700',
};

const breadcrumbFromPath = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((p, i) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '),
    path: '/' + parts.slice(0, i + 1).join('/'),
  }));
};

const Navbar = ({ onMenuClick }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const breadcrumbs = breadcrumbFromPath(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-ink-100 px-4 sm:px-6 h-14 flex items-center gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.path}>
            {i > 0 && <span className="text-ink-300 select-none">/</span>}
            <span
              className={`truncate ${
                i === breadcrumbs.length - 1
                  ? 'font-semibold text-ink-800'
                  : 'text-ink-400 hover:text-ink-600 cursor-pointer capitalize'
              }`}
              onClick={i < breadcrumbs.length - 1 ? () => navigate(crumb.path) : undefined}
            >
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors hidden sm:flex"
        >
          <Search size={17} />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-ink-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-ink-900 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-ink-800 leading-none mb-0.5">{user?.name || 'Admin'}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ROLE_COLORS[role] || 'bg-ink-100 text-ink-600'}`}>
                {ROLE_LABELS[role] || role}
              </span>
            </div>
            <ChevronDown size={13} className={`text-ink-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''} hidden sm:block`} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1.5 w-52 bg-white border border-ink-200 rounded-xl shadow-glass-lg overflow-hidden z-20"
                >
                  <div className="px-4 py-3 border-b border-ink-100">
                    <p className="text-sm font-semibold text-ink-800 truncate">{user?.name}</p>
                    <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors">
                      <User size={15} />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors">
                      <Settings size={15} />
                      Preferences
                    </button>
                    <hr className="border-ink-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
            >
              <div className="bg-white rounded-2xl shadow-glass-xl border border-ink-200 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink-100">
                  <Search size={16} className="text-ink-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search blogs, users, categories…"
                    className="flex-1 text-sm text-ink-800 placeholder:text-ink-400 outline-none bg-transparent"
                  />
                  <kbd className="text-xs text-ink-400 bg-ink-100 px-2 py-0.5 rounded font-mono">Esc</kbd>
                </div>
                <div className="p-3 text-xs text-ink-400 text-center py-5">
                  Start typing to search across all content…
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;