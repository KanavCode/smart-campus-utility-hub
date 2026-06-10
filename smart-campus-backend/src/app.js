const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { testConnection, logger } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { verifyToken, verifyAdmin } = require('./middleware/auth.middleware');
const notificationService = require('./services/notification.service');
const { initBackupJob } = require('./jobs/backup.job');

// =====================================================================
// VALIDATE REQUIRED ENVIRONMENT VARIABLES (FAIL FAST)
// =====================================================================
const REQUIRED_ENV_VARS = [
  { name: 'JWT_SECRET', message: 'JWT_SECRET is required for authentication' },
  { name: 'JWT_REFRESH_SECRET', message: 'JWT_REFRESH_SECRET is required for token refresh' },
];

if (process.env.NODE_ENV !== 'test') {
  const missing = REQUIRED_ENV_VARS.filter(({ name }) => !process.env[name]);
  if (missing.length > 0) {
    console.error('FATAL: Missing required environment variables:');
    missing.forEach(({ name, message }) => console.error(`  - ${name}: ${message}`));
    process.exit(1);
  }
}

// =====================================================================
// IMPORT ROUTES (UNIFIED & SINGLE DECLARATION)
// =====================================================================
const userRoutes = require('./components/users/user.routes');
const eventsRoutes = require('./components/campus-events/events.routes');
const clubsRoutes = require('./components/campus-events/clubs.routes');
const timetableRoutes = require('./components/timetable/timetable.routes');
const electiveRoutes = require('./components/electives/elective.routes');
const settingsRoutes = require('./components/settings/settings.routes');
const notificationsRoutes = require('./components/notifications/notifications.routes');
const searchRoutes = require('./components/search/search.routes');
const activityRoutes = require('./components/activities/activity.routes');
const calendarRoutes = require('./components/calendar/calendar.routes');
const feedbackRoutes = require('./components/feedback/feedback.routes');

// Create Express application
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
notificationService.init(server);

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
// SECURITY & BODY PARSING MIDDLEWARE
// =====================================================================
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

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use('/api/', apiLimiter);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// =====================================================================
// HEALTH CHECK ENDPOINTS
// =====================================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Smart Campus Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

const healthResponse = () => ({
  success: true,
  status: 'OK',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
});

app.get('/health', (req, res) => res.status(200).json(healthResponse()));
app.get('/api/health', (req, res) => res.status(200).json(healthResponse()));

// =====================================================================
// API ROUTE MOUNTING
// =====================================================================
app.use('/api/auth', userRoutes);
app.use('/api', userRoutes); 
app.use('/api/events', eventsRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/electives', electiveRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/calendar',   calendarRoutes);
app.use('/api/feedback', feedbackRoutes);

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

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// =====================================================================
// SERVER INITIALIZATION
// =====================================================================
const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    server.listen(PORT, () => {
      logger.info('='.repeat(60));
      logger.info('🚀 Smart Campus Backend Server Started');
      logger.info('='.repeat(60));
      if (!dbConnected) {
        logger.warn('⚠️  DATABASE NOT CONNECTED');
      }

      // Register automated daily database backup job (runs at midnight)
      initBackupJob();
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;