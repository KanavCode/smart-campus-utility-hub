const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { testConnection, logger, isDatabaseConnected } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { verifyToken, verifyAdmin } = require('./middleware/auth.middleware');
const notificationService = require('./services/notification.service');

// Import routes
const userRoutes = require("./components/users/user.routes");
const eventsRoutes = require("./components/campus-events/events.routes");
const clubsRoutes = require("./components/campus-events/clubs.routes");
const timetableRoutes = require("./components/timetable/timetable.routes");
const electiveRoutes = require("./components/electives/elective.routes");
const settingsRoutes = require("./components/settings/settings.routes");
const notificationsRoutes = require("./components/notifications/notifications.routes");
const searchRoutes = require("./components/search/search.routes");
const activityRoutes = require("./components/activities/activity.routes");

// Create Express application
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
notificationService.init(server);

// Only trust proxy headers when explicitly configured for deployments
// that are actually behind trusted reverse proxies.
const trustProxySetting = process.env.TRUST_PROXY;

if (typeof trustProxySetting === 'string' && trustProxySetting.trim() !== '') {
  const normalizedTrustProxy = trustProxySetting.trim().toLowerCase();

  if (normalizedTrustProxy === 'true') {
    app.set('trust proxy', 1);
  } else if (normalizedTrustProxy === 'false') {
    app.set('trust proxy', false);
  } else {
    const trustProxyHops = Number(trustProxySetting);
    app.set('trust proxy', Number.isNaN(trustProxyHops) ? trustProxySetting : trustProxyHops);
  }
} else {
  app.set('trust proxy', false);
}

// =====================================================================
// SECURITY MIDDLEWARE
// =====================================================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGINS || '')
          .split(',')
          .map((origin) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'], // Allow multiple Vite ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
app.use('/api/', apiLimiter);

// Compression middleware
app.use(compression());

// =====================================================================
// BODY PARSING MIDDLEWARE
// =====================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================================
// LOGGING MIDDLEWARE
// =====================================================================
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// =====================================================================
// HEALTH CHECK & ROOT ENDPOINTS
// =====================================================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Smart Campus Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbState =
    typeof isDatabaseConnected === 'function' ? isDatabaseConnected() : false;

  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Smart Campus Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbState ? 'Connected' : 'Disconnected',
  });
});

// =====================================================================
// API ROUTES
// =====================================================================

// User & Authentication routes
app.use('/api/auth', userRoutes);
app.use('/api', userRoutes); // For /api/users endpoints

// Campus Events & Clubs routes
app.use('/api/events', eventsRoutes);
app.use('/api/clubs', clubsRoutes);

// Timetable routes
app.use('/api/timetable', timetableRoutes);

// Electives routes
app.use('/api/electives', electiveRoutes);

// Test Socket endpoint
app.get('/api/test-socket', verifyToken, verifyAdmin, (req, res) => {
  const type = req.query.type || 'EVENT_CREATED';
  notificationService.broadcast(type, {
    message: `Test notification for ${type}`,
    title: 'Test Title',
    courseName: 'Test Course',
    action: 'TEST_ACTION',
    time: new Date().toISOString()
  });
  res.json({ success: true, message: `Broadcasted ${type} successfully` });
});

// Admin settings routes
app.use("/api/settings", settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activities', activityRoutes);

// =====================================================================
// ERROR HANDLING
// =====================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =====================================================================
// SERVER INITIALIZATION
// =====================================================================

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Test database connection (non-blocking)
    const dbConnected = await testConnection();

    // Start listening
    server.listen(PORT, () => {
      logger.info('='.repeat(60));
      logger.info('🚀 Smart Campus Backend Server Started');
      logger.info('='.repeat(60));
      logger.info(`📍 Server running on: http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(
        `🗄️  Database: ${dbConnected ? 'Connected' : 'Not Connected (features limited)'}`,
      );
      logger.info(`📅 Started at: ${new Date().toISOString()}`);
      logger.info('='.repeat(60));
      logger.info('\n📚 API Documentation:');
      logger.info(`   Health Check: http://localhost:${PORT}/health`);
      logger.info(`   Auth API: http://localhost:${PORT}/api/auth`);
      logger.info('='.repeat(60));

      if (!dbConnected) {
        logger.warn('\n⚠️  DATABASE NOT CONNECTED');
        logger.warn(
          'Most API endpoints will return errors until PostgreSQL is configured.',
        );
        logger.warn('See DATABASE_SETUP.md for setup instructions.\n');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export app for testing
module.exports = app;

