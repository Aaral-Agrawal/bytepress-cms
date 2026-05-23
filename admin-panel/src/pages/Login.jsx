import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronDown, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'superadmin', label: 'Super Admin', icon: '👑', desc: 'Full platform control' },
  { value: 'editor', label: 'Editor', icon: '✏️', desc: 'Content & SEO management' },
  { value: 'author', label: 'Author', icon: '🖊️', desc: 'Personal blog management' },
];

const ROLE_REDIRECT = {
  superadmin: '/dashboard/admin',
  editor: '/dashboard/editor',
  author: '/dashboard/author',
};

// Animated floating orbs background
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { size: 300, x: '10%', y: '15%', color: 'from-violet-100 to-indigo-100', delay: 0 },
      { size: 200, x: '75%', y: '10%', color: 'from-sky-100 to-cyan-100', delay: 2 },
      { size: 250, x: '60%', y: '65%', color: 'from-rose-100 to-pink-100', delay: 4 },
      { size: 180, x: '5%', y: '70%', color: 'from-amber-100 to-yellow-100', delay: 1 },
      { size: 140, x: '85%', y: '45%', color: 'from-emerald-100 to-teal-100', delay: 3 },
    ].map((orb, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full bg-gradient-to-br ${orb.color} blur-3xl opacity-70`}
        style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8 + i * 1.5, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
      />
    ))}
    {/* subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
  </div>
);

const RoleDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = ROLES.find((r) => r.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm text-left transition-all duration-200 outline-none focus:border-ink-400 focus:bg-white focus:ring-2 focus:ring-ink-100 hover:border-ink-300"
      >
        {selected ? (
          <span className="flex items-center gap-2.5">
            <span className="text-base">{selected.icon}</span>
            <span className="font-medium text-ink-800">{selected.label}</span>
            <span className="text-ink-400 text-xs hidden sm:inline">— {selected.desc}</span>
          </span>
        ) : (
          <span className="text-ink-400">Select your role</span>
        )}
        <ChevronDown
          size={16}
          className={`text-ink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full bg-white border border-ink-200 rounded-xl shadow-glass-lg overflow-hidden"
          >
            {ROLES.map((r) => (
              <li key={r.value}>
                <button
                  type="button"
                  onClick={() => { onChange(r.value); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors duration-150 hover:bg-ink-50 ${value === r.value ? 'bg-ink-50' : ''}`}
                >
                  <span className="text-base w-6 text-center">{r.icon}</span>
                  <div>
                    <div className="font-medium text-ink-800">{r.label}</div>
                    <div className="text-ink-400 text-xs">{r.desc}</div>
                  </div>
                  {value === r.value && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ink-800" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const Login = () => {
  const { login, isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect if already authenticated
  if (isAuthenticated && role) {
    return <Navigate to={ROLE_REDIRECT[role] || '/dashboard/admin'} replace />;
  }

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address';
    if (!form.password) errors.password = 'Password is required';
    if (!form.role) errors.role = 'Please select a role';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);

    if (result.success) {
      const dest = ROLE_REDIRECT[result.role] || '/login';
      navigate(dest, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative">
      <FloatingOrbs />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white shadow-glass-xl rounded-3xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400" />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-10 bg-ink-900 rounded-xl flex items-center justify-center shadow-card">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <span className="font-display font-semibold text-ink-900 text-lg leading-none block">BytePress CMS</span>
                <span className="text-ink-400 text-xs tracking-widest uppercase leading-none">Where Developers Share Ideas</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 mb-1.5">
                Welcome back
              </h1>
              <p className="text-ink-500 text-sm">
                Sign in to your admin account to continue.
              </p>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                  Login as
                </label>
                <RoleDropdown
                  value={form.role}
                  onChange={(v) => { setForm((p) => ({ ...p, role: v })); setFieldErrors((p) => ({ ...p, role: '' })); }}
                />
                {fieldErrors.role && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {fieldErrors.role}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  className={`input-field ${fieldErrors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    placeholder="••••••••"
                    className={`input-field pr-11 ${fieldErrors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors p-1"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    'Sign in to Dashboard'
                  )}
                </button>
              </div>
            </motion.form>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center text-ink-400 text-xs"
            >
              This panel is for staff only.{' '}
              <span className="text-ink-300">Viewers use the public website.</span>
            </motion.p>
          </div>
        </div>

        {/* Below card tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-ink-400 text-xs mt-5"
        >
          BytePress CMS © {new Date().getFullYear()} — All rights reserved
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;