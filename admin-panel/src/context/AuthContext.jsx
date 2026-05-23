import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    const storedRole = localStorage.getItem('adminRole');

    if (storedToken && storedUser && storedRole) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminRole');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password, role: selectedRole }) => {
    setLoading(true);
    setError(null);
    try {
      const  data  = await authAPI.login({ email, password, role: selectedRole });
      const { token: jwt, user: userData } = data;
      if (userData.role !== selectedRole.toLowerCase()) {
        throw new Error("Selected role does not match your account role.");
      }

      localStorage.setItem('adminToken', jwt);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      localStorage.setItem('adminRole', userData.role);

      setToken(jwt);
      setUser(userData);
      setRole(userData.role);

      return { success: true, role: userData.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminRole');
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = Boolean(token && user);

  const hasRole = useCallback(
    (...roles) => roles.includes(role),
    [role]
  );

  const value = {
    user,
    role,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;