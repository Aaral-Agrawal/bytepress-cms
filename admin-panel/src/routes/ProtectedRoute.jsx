import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

 
const AuthLoader = () => (
  <div className="min-h-screen bg-ink-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-800 rounded-full animate-spin" />
      <p className="text-ink-400 text-sm font-medium">Authenticating…</p>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen bg-ink-50 flex items-center justify-center">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚫</span>
      </div>
      <h2 className="text-xl font-display font-semibold text-ink-800 mb-2">Access Denied</h2>
      <p className="text-ink-500 text-sm mb-6">
        You don't have permission to view this page.
      </p>
      <a href="/login" className="btn-primary inline-block text-sm">
        Back to Login
      </a>
    </div>
  </div>
);

/**
 * ProtectedRoute
 * @param {string[]} allowedRoles - roles allowed to access this route (empty = any authenticated)
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Unauthorized />;
  }

  return children;
};

export default ProtectedRoute;