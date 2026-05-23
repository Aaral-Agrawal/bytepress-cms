# BlogCMS Admin Panel

A production-ready admin panel for a full-stack Blog Management Platform.
Built with **React.js** (no Vite), **Tailwind CSS**, **Framer Motion**, and a **Node.js + Express + MongoDB** backend.

---

## 📁 Project Structure

```
/
├── admin-panel/          ← React frontend (CRA)
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── EditorDashboard.jsx
│       │   └── AuthorDashboard.jsx
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Navbar.jsx
│       │   └── DashboardCards.jsx
│       ├── layouts/
│       │   └── DashboardLayout.jsx
│       ├── routes/
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js
│       └── App.jsx
│
└── backend/              ← Node.js + Express API
    ├── models/User.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── dashboardRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   └── dashboardController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    ├── utils/
    │   ├── generateToken.js
    │   └── seeder.js
    └── server.js
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET

# Seed test users
npm run seed

# Start backend
npm run dev          # development (nodemon)
npm start            # production
```

Backend runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd admin-panel
npm install
# Optional: create .env with REACT_APP_API_URL=http://localhost:5000/api

npm start            # development
npm run build        # production build
```

Frontend runs on: `http://localhost:3000`

---

## 🔑 Test Login Credentials

| Role        | Email                  | Password       |
|-------------|------------------------|----------------|
| Super Admin | admin@blogcms.com      | Admin@12345    |
| Editor      | editor@blogcms.com     | Editor@12345   |
| Author      | author@blogcms.com     | Author@12345   |

> **Viewer** accounts exist in the database but **cannot** log in to the admin panel.

---

## 🧑‍💼 Role Permissions

| Feature              | Super Admin | Editor | Author |
|----------------------|:-----------:|:------:|:------:|
| View own dashboard   | ✅          | ✅     | ✅     |
| Create blogs         | ✅          | ✅     | ✅     |
| Edit all blogs       | ✅          | ✅     | ❌     |
| Edit own blogs only  | ✅          | ✅     | ✅     |
| Delete any blog      | ✅          | ❌     | ❌     |
| Delete own blogs     | ✅          | ✅     | ✅     |
| Publish blogs        | ✅          | ✅     | ❌     |
| Manage users         | ✅          | ❌     | ❌     |
| Manage categories    | ✅          | ✅     | ❌     |
| Manage tags          | ✅          | ✅     | ❌     |
| SEO settings         | ✅          | ✅     | ❌     |
| Site settings        | ✅          | ❌     | ❌     |
| Analytics            | ✅          | ❌     | ❌     |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint         | Description          | Access      |
|--------|-----------------|----------------------|-------------|
| POST   | /api/auth/login  | Login with role      | Public      |
| POST   | /api/auth/logout | Logout               | Authenticated |
| GET    | /api/auth/me     | Get current user     | Authenticated |

### Dashboard
| Method | Endpoint                   | Access       |
|--------|---------------------------|--------------|
| GET    | /api/dashboard/admin       | superadmin   |
| GET    | /api/dashboard/editor      | editor       |
| GET    | /api/dashboard/author      | author       |
| GET    | /api/analytics/overview    | superadmin   |

---

## 🛡 Login Flow

```
User submits { email, password, role }
        ↓
POST /api/auth/login
        ↓
Backend validates:
  1. Role is not 'viewer'
  2. User exists
  3. Account is active
  4. Selected role === user.role   ← IMPORTANT
  5. Password matches
        ↓
Returns { token, user }
        ↓
Frontend stores in localStorage
        ↓
Redirects by role:
  superadmin → /dashboard/admin
  editor     → /dashboard/editor
  author     → /dashboard/author
```

---

## 🎨 Design System

- **Font**: DM Sans (body) + Playfair Display (headings)
- **Theme**: White/light with soft ink-toned grays
- **Effects**: Glassmorphism cards, soft shadows, backdrop blur
- **Motion**: Framer Motion — staggered card entrances, sidebar animations, page transitions
- **Charts**: Recharts — area charts, bar charts
- **Icons**: Lucide React

---

## 🔧 Environment Variables

### Backend `.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/blog_cms
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` (optional)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📦 Tech Stack

### Frontend
- React 18 (Create React App — no Vite)
- Tailwind CSS 3
- React Router DOM v6
- Framer Motion
- Axios (with interceptors)
- Recharts
- Lucide React

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Helmet, CORS, express-rate-limit
- Morgan (logging)