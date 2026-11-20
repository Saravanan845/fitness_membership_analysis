const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async (conn) => {
    if (conn) {
      // Check if we need to auto-seed initial data
      const Member = require('./models/Member');
      const count = await Member.countDocuments();
      if (count === 0) {
        console.log('[Server] Database is empty. Running initial seed...');
        const seedDatabase = require('./utils/seedData');
        await seedDatabase();
      }
    }
  });
}

// Global Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint (Deployment Deliverable Task 16)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FitTrack Retention Analytics API',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve frontend static build in production (Deployment Deliverable Task 17)
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
}

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 FitTrack API Server running on port ${PORT} [Env: ${process.env.NODE_ENV || 'development'}]`);
    console.log(`📡 Local endpoint: http://localhost:${PORT}`);
  });
}

module.exports = app;
