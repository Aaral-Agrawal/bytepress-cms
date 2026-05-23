import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})
 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

 
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminRole')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────
export const authAPI = {
  login: async (data) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
  register: async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
  updateProfile: async (data) => {
    const response = await api.put('/auth/update-profile', data)
    return response.data
  },
  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data)
    return response.data
  },
}

// ─────────────────────────────────────────────
// Analytics API
// ─────────────────────────────────────────────
export const analyticsAPI = {
  // GET /api/dashboard/admin — full admin stats
  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin')
    return response.data
  },

  // GET /api/dashboard/editor — editor stats
  getEditorStats: async () => {
    const response = await api.get('/dashboard/editor')
    return response.data
  },

  // GET /api/dashboard/author — author stats
  getAuthorStats: async () => {
    const response = await api.get('/dashboard/author')
    return response.data
  },

  // GET /api/dashboard/analytics/overview — full analytics overview
  getOverview: async () => {
    const response = await api.get('/dashboard/analytics/overview')
    return response.data
  },

  // GET /api/dashboard/analytics/traffic — monthly traffic chart data
  getTrafficAnalytics: async () => {
    const response = await api.get('/dashboard/analytics/traffic')
    return response.data
  },

  // GET /api/dashboard/analytics/blog-status — blog status distribution
  getBlogStatusAnalytics: async () => {
    const response = await api.get('/dashboard/analytics/blog-status')
    return response.data
  },
}

// ─────────────────────────────────────────────
// Blog API
// ─────────────────────────────────────────────
export const blogAPI = {
  // Create blog (draft or publish)
  create: async (data) => {
    const response = await api.post('/blogs', data)
    return response.data
  },

  // Get all blogs (role-filtered by backend)
  getAll: async (params = {}) => {
    const response = await api.get('/blogs', { params })
    return response.data
  },

  // GET /api/blogs/recent — latest 5 blogs for dashboard
  getRecent: async () => {
    const response = await api.get('/blogs/recent')
    return response.data
  },

  // Get single blog by ID (manage/edit)
  getById: async (id) => {
    const response = await api.get(`/blogs/${id}/manage`)
    return response.data
  },

  // Get preview blog
  getPreview: async (id) => {
    const response = await api.get(`/blogs/preview/${id}`)
    return response.data
  },

  // Update blog
  update: async (id, data) => {
    const response = await api.put(`/blogs/${id}`, data)
    return response.data
  },

  // Delete blog
  delete: async (id) => {
    const response = await api.delete(`/blogs/${id}`)
    return response.data
  },

  // Update blog status (superadmin/editor)
  updateStatus: async (id, status) => {
    const response = await api.put(`/blogs/${id}/status`, { status })
    return response.data
  },

  // Submit for review (author)
  submitForReview: async (id) => {
    const response = await api.put(`/blogs/${id}/submit`)
    return response.data
  },

  // Approve blog (editor/superadmin)
  approve: async (id) => {
    const response = await api.put(`/blogs/${id}/approve`)
    return response.data
  },

  // Publish blog (superadmin only)
  publish: async (id) => {
    const response = await api.put(`/blogs/${id}/publish`)
    return response.data
  },
}

// ─────────────────────────────────────────────
// Category API
// ─────────────────────────────────────────────
export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/categories')
    return response.data
  },
}

// ─────────────────────────────────────────────
// Tag API
// ─────────────────────────────────────────────
export const tagAPI = {
  getAll: async () => {
    const response = await api.get('/tags')
    return response.data
  },
}

// ─────────────────────────────────────────────
// Upload API
// ─────────────────────────────────────────────
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

// ─────────────────────────────────────────────
// User API (Super Admin only)
// ─────────────────────────────────────────────
export const userAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}

export default api