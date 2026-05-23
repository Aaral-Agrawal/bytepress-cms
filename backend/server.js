// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const connectDB = require("./config/db");
// const Blog = require("./models/Blog");
// const blogRoutes = require("./routes/blogRoutes");
// const authorRoutes = require('./routes/Authorroutes');
// const uploadRoutes = require('./routes/Uploadroutes');
// const dashboardRoutes = require("./routes/dashboardRoutes");

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;
// const authRoutes = require("./routes/authRoutes");

// connectDB();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }))
// app.use(cookieParser());
// app.use("/api/auth", authRoutes);
// app.use("/api/blogs", blogRoutes);
// app.use('/api/blogs',   blogRoutes);
// app.use('/api/authors', authorRoutes);
// app.use('/api/upload',  uploadRoutes);
// app.use("/api/dashboard", dashboardRoutes);


// app.get("/", (req, res) => {
//     res.send("API is running...");
// });

 
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const blogRoutes      = require('./routes/blogRoutes');
const categoryRoutes  = require('./routes/categoryRoutes');
const tagRoutes       = require('./routes/tagRoutes');
const settingsRoutes  = require('./routes/settingsRoutes');
const uploadRoutes    = require('./routes/Uploadroutes');
const authorRoutes    = require('./routes/Authorroutes');

// User routes — if you have a userRoutes file, add it here:
const userRoutes = require('./routes/UserRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ─────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001', // alternate dev port
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Global rate limiter ─────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api', globalLimiter);

// ─── Body parsing ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Health check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/users', userRoutes);

// Analytics alias
app.use('/api/analytics', dashboardRoutes);

// ─── 404 handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global error handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Database + Start ────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/blog_cms'
    );
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }


};

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐  Admin Panel: http://localhost:3001`);
  });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;