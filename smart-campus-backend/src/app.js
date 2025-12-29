const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, logger, isDatabaseConnected } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./components/users/user.routes');
const eventsRoutes = require('./components/campus-events/events.routes');
const clubsRoutes = require('./components/campus-events/clubs.routes');
const timetableRoutes = require('./components/timetable/timetable.routes');
const electiveRoutes = require('./components/electives/elective.routes');

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================================
// SECURITY MIDDLEWARE
// =====================================================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGINS || '').split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

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
    health: '/health'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Smart Campus Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: isDatabaseConnected() ? 'Connected' : 'Disconnected'
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
    app.listen(PORT, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 Smart Campus Backend Server Started`);
      logger.info('='.repeat(60));
      logger.info(`📍 Server running on: http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🗄️  Database: ${dbConnected ? 'Connected' : 'Not Connected (features limited)'}`);
      logger.info(`📅 Started at: ${new Date().toISOString()}`);
      logger.info('='.repeat(60));
      logger.info(`\n📚 API Documentation:`);
      logger.info(`   Health Check: http://localhost:${PORT}/health`);
      logger.info(`   Auth API: http://localhost:${PORT}/api/auth`);
      logger.info('='.repeat(60));
      
      if (!dbConnected) {
        logger.warn('\n⚠️  DATABASE NOT CONNECTED');
        logger.warn('Most API endpoints will return errors until PostgreSQL is configured.');
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
