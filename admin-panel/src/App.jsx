import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// ─── Pages ───────────────────────────────────────────────────────────────────
import Login from './pages/Login';

// Dashboards
import AdminDashboard from './pages/AdminDashboard';
import EditorDashboard from './pages/EditorDashboard';
import AuthorDashboard from './pages/AuthorDashboard'; 

// Blog
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import Blogs from './pages/Blogs';
import MyBlogs from './pages/MyBlogs';
import PendingBlogs from './pages/PendingBlogs';
import PreviewBlog from './pages/PreviewBlog';

// Other pages
import Users from './pages/Users';
import Categories from './pages/Categories';
import Tags from './pages/Tags';

// ─── Placeholder   ───────────────────────────────────
const PlaceholderPage = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mb-4">
      <span className="text-3xl">🚧</span>
    </div>
    <h2 className="font-display text-xl font-semibold text-ink-800 mb-2">{title}</h2>
    <p className="text-ink-500 text-sm max-w-xs">
      {description || 'This page is under construction. Check back soon.'}
    </p>
  </div>
);

// ─── Role-based redirect from /dashboard root ─────────────────────────────────
const DashboardRedirect = () => {
  const { role } = useAuth();
  const map = {
    superadmin: '/dashboard/admin',
    editor:     '/dashboard/editor',
    author:     '/dashboard/author',
  };
  return <Navigate to={map[role] || '/login'} replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Navigate to="/login" replace />} />
 
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardRedirect />} />

     
      <Route
        path="admin"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* All blogs */}
      <Route
        path="admin/blogs"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Blogs />
          </ProtectedRoute>
        }
      />

      {/* Create blog */}
      <Route
        path="admin/blogs/create"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <CreateBlog />
          </ProtectedRoute>
        }
      />

      {/* Edit blog — uses EditBlog page */}
      <Route
        path="admin/blogs/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <EditBlog />
          </ProtectedRoute>
        }
      />

      {/* Preview blog */}
      <Route
        path="admin/blogs/preview/:id"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <PreviewBlog />
          </ProtectedRoute>
        }
      />

      {/* Pending / review queue */}
      <Route
        path="admin/blogs/pending"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <PendingBlogs />
          </ProtectedRoute>
        }
      />

      {/* Users */}
      <Route
        path="admin/users"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Categories */}
      <Route
        path="admin/categories"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Categories />
          </ProtectedRoute>
        }
      />

      {/* Tags */}
      <Route
        path="admin/tags"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Tags />
          </ProtectedRoute>
        }
      />

      {/* SEO Settings — placeholder until page is built */}
      <Route
        path="admin/seo"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <PlaceholderPage title="SEO Settings" description="Manage global SEO configuration." />
          </ProtectedRoute>
        }
      />

      {/* Site Settings — placeholder */}
      <Route
        path="admin/settings"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <PlaceholderPage title="Site Settings" description="Configure platform-wide settings." />
          </ProtectedRoute>
        }
      />

      {/* Analytics — placeholder */}
      <Route
        path="admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <PlaceholderPage title="Analytics" description="Deep dive into traffic and content performance." />
          </ProtectedRoute>
        }
      />

      {/* ══════════════════════════════════════════
          EDITOR
      ══════════════════════════════════════════ */}
      <Route
        path="editor"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <EditorDashboard />
          </ProtectedRoute>
        }
      />

      {/* All blogs */}
      <Route
        path="editor/blogs"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <Blogs />
          </ProtectedRoute>
        }
      />

      {/* Create blog */}
      <Route
        path="editor/blogs/create"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <CreateBlog />
          </ProtectedRoute>
        }
      />

      {/* Edit blog */}
      <Route
        path="editor/blogs/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <EditBlog />
          </ProtectedRoute>
        }
      />

      {/* Preview blog */}
      <Route
        path="editor/blogs/preview/:id"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <PreviewBlog />
          </ProtectedRoute>
        }
      />

      {/* Pending / review queue */}
      <Route
        path="editor/blogs/pending"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <PendingBlogs />
          </ProtectedRoute>
        }
      />

      {/* Categories */}
      <Route
        path="editor/categories"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <Categories />
          </ProtectedRoute>
        }
      />

      {/* Tags */}
      <Route
        path="editor/tags"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <Tags />
          </ProtectedRoute>
        }
      />

      {/* SEO — placeholder */}
      <Route
        path="editor/seo"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <PlaceholderPage title="SEO Overview" description="Monitor and improve content SEO scores." />
          </ProtectedRoute>
        }
      />

      {/* ══════════════════════════════════════════
          AUTHOR
      ══════════════════════════════════════════ */}
      <Route
        path="author"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <AuthorDashboard />
          </ProtectedRoute>
        }
      />

      {/* My blogs */}
      <Route
        path="author/blogs"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <MyBlogs />
          </ProtectedRoute>
        }
      />

      {/* Create blog */}
      <Route
        path="author/blogs/create"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <CreateBlog />
          </ProtectedRoute>
        }
      />

      {/* Edit blog */}
      <Route
        path="author/blogs/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <EditBlog />
          </ProtectedRoute>
        }
      />

      {/* Preview blog */}
      <Route
        path="author/blogs/preview/:id"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <PreviewBlog />
          </ProtectedRoute>
        }
      />

      {/* Pending blogs (submitted, awaiting review) */}
      <Route
        path="author/blogs/pending"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <PendingBlogs />
          </ProtectedRoute>
        }
      />

      {/* Drafts — uses MyBlogs filtered, or reuse placeholder if separate page needed */}
      <Route
        path="author/drafts"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <PlaceholderPage title="My Drafts" description="Continue working on your saved drafts." />
          </ProtectedRoute>
        }
      />

      {/* Profile — placeholder until built */}
      <Route
        path="author/profile"
        element={
          <ProtectedRoute allowedRoles={['author']}>
            <PlaceholderPage title="My Profile" description="Manage your author profile and bio." />
          </ProtectedRoute>
        }
      />
    </Route>

    {/* 404 fallback */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;