# BytePress CMS 🚀

### Modern Full Stack Blogging Platform with Advanced Editorial Workflow & SEO Optimization

BytePress CMS is a production-ready MERN + Next.js blogging platform designed for modern content publishing.
It includes a powerful admin CMS, role-based dashboards, SEO optimization tools, editorial workflow management, analytics, and a responsive public blogging platform.

This project was built as a full-stack assignment to demonstrate scalable architecture, clean UI/UX, authentication, authorization, and real-world CMS workflows.

---

# 🌟 Live Features

## 🔐 Authentication & Security

* JWT Authentication
* Protected Routes
* Role-Based Access Control (RBAC)
* Secure API Authorization
* Middleware-Based Permission System

---

# 👥 Role Based Dashboards

## 🛡️ Super Admin

* Full platform access
* Manage users & roles
* Manage all blogs
* Publish/reject content
* Manage categories & tags
* Access analytics dashboard

## ✍️ Editor

* Review submitted blogs
* Approve/reject content
* Request changes
* Publish approved blogs
* Manage categories & tags

## 👨‍💻 Author

* Create blogs
* Save drafts
* Submit blogs for review
* Edit own blogs
* Track blog status

---

# 📝 Advanced Blog Management

* Create / Edit / Delete Blogs
* Rich Content Editor
* Dynamic Slug Generation
* Featured Blogs
* Draft & Publish Workflow
* Blog Preview System
* Reading Time Calculation
* Category & Tag Support
* Responsive Blog Pages

---

# 🔄 Editorial Workflow System

```txt
draft
→ pending_review
→ changes_requested
→ pending_review
→ approved
→ published
```

### Workflow Highlights

* Authors submit blogs for review
* Editors review content quality
* Editors can approve, reject, or request changes
* Authors fix issues and resubmit
* Published blogs become publicly visible

---

# 📈 SEO Optimization Features

* Dynamic Meta Tags
* Open Graph Support
* Twitter Cards
* Canonical URLs
* FAQ Schema
* JSON-LD Structured Data
* Sitemap.xml
* robots.txt
* SEO Preview Panel
* SEO Score Checker

---

# 🌐 Public Blogging Platform

* Modern Responsive UI
* Featured Blog Section
* Dynamic Blog Pages
* Category Pages
* Tag Pages
* Author Pages
* Search Functionality
* Pagination
* Table of Contents (TOC)
* FAQ Sections

---

# 📊 Admin Dashboard Features

* Analytics Cards
* Recent Blogs Table
* Pending Review Queue
* User Management
* Blog Status Management
* SEO Preview Tools
* Category & Tag Management
* Professional CMS UI

---

# 🛠️ Tech Stack

## Frontend Public Platform

* Next.js
* React.js
* Tailwind CSS

## Admin Panel

* React.js
* Tailwind CSS
* Framer Motion

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

## Authentication

* JWT Authentication

## Media Handling

* Cloudinary

---

# 📂 Project Structure

```bash
blog-platform/
│
├── admin-panel/      # React Admin CMS Dashboard
├── backend/          # Express.js Backend APIs
├── frontend/         # Next.js Public Blog Platform
```

---

# 📁 Important Modules

## Backend

* Authentication APIs
* Blog APIs
* Category APIs
* Tag APIs
* Dashboard Analytics APIs
* User Management APIs
* Upload APIs

## Admin Panel

* Role-Based Dashboards
* Blog Editor
* Blog Preview System
* Editorial Workflow
* SEO Tools
* User Management

## Frontend

* Dynamic Blog Rendering
* SEO Metadata
* Sitemap & Robots
* TOC System
* Responsive UI

---

# ⚡ Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Aaral-Agrawal/bytepress-cms.git
```

---

# 2️⃣ Install Dependencies

## Backend

```bash
cd backend
npm install
```

## Frontend

```bash
cd frontend
npm install
```

## Admin Panel

```bash
cd admin-panel
npm install
```

---

# 3️⃣ Setup Environment Variables

Create `.env` inside backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

# 🚀 Run Project

## Start Backend

```bash
cd backend
npm run dev
```

## Start Frontend

```bash
cd frontend
npm run dev
```

## Start Admin Panel

```bash
cd admin-panel
npm start
```

---

# 🎯 Assignment Objectives Covered

✅ JWT Authentication
✅ Role Based Access Control
✅ Full Blog CRUD System
✅ SEO Optimization
✅ Open Graph Metadata
✅ Dynamic Meta Tags
✅ Editorial Workflow
✅ Public Blogging Platform
✅ Admin CMS Dashboard
✅ User Management
✅ Categories & Tags
✅ Responsive UI
✅ Protected Routes
✅ Search & Pagination
✅ Modern Dashboard UI

---

# 🧠 Key Learning Outcomes

* Full Stack MERN Development
* RBAC Architecture
* REST API Design
* SEO Implementation
* CMS Workflow Systems
* Protected Routing
* State Management
* Responsive Dashboard Design
* Dynamic Rendering in Next.js

---

# 👨‍💻 Developer

### Aaral Agrawal

Built using MERN Stack + Next.js

---

# 📌 Future Improvements

* AI Content Assistant
* Blog Comments System
* Real-Time Notifications
* Autosave Drafts
* Scheduled Publishing
* Dark/Light Theme Toggle
* Advanced Analytics

---

# 📄 License

This project is developed for educational and internship assignment purposes.
