const { Pool } = require('pg');
const winston = require('winston');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Database connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'smart_campus_unified',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  
  // Pool configuration
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000,
};

// Create connection pool
const pool = new Pool(poolConfig);

// Database connection state
let isDbConnected = false;

// Pool error handling
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  isDbConnected = false;
  // Don't exit the process, allow graceful degradation
});

pool.on('connect', (client) => {
  logger.debug('New client connected to database');
  isDbConnected = true;
});

pool.on('remove', (client) => {
  logger.debug('Client removed from pool');
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('✅ Database connected successfully');
    logger.info(`📅 Server time: ${result.rows[0].now}`);
    logger.info(`🗄️  Database: ${poolConfig.database}`);
    logger.info(`🏢 Host: ${poolConfig.host}:${poolConfig.port}`);
    isDbConnected = true;
    return true;
  } catch (err) {
    logger.warn('⚠️ Database connection failed:', err.message);
    logger.warn('Server will start but database features will be unavailable.');
    logger.warn('Please ensure PostgreSQL is running and configured correctly.');
    isDbConnected = false;
    return false;
  } finally {
    if (client) client.release();
  }
};

/**
 * Check if database is connected
 * @returns {boolean} Connection state
 */
const isDatabaseConnected = () => isDbConnected;

/**
 * Execute a query with automatic connection management
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (err) {
    logger.error('Query error:', { text, error: err.message });
    throw err;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
const getClient = async () => {
  try {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds for queries
    const timeout = setTimeout(() => {
      logger.error('Client query timeout');
    }, 5000);
    
    // Monkey patch the query method to add logging
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    // Monkey patch the release method to clear timeout
    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  } catch (err) {
    logger.error('Failed to get client from pool:', err.message);
    throw err;
  }
};

/**
 * Execute a transaction
 * @param {Function} callback - Async function to execute within transaction
 * @returns {Promise<*>} Transaction result
 */
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    logger.debug('Transaction committed successfully');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  logger.info('🛑 Shutting down database connection pool...');
  try {
    await pool.end();
    logger.info('✅ Database connection pool closed successfully');
  } catch (err) {
    logger.error('❌ Error closing database pool:', err.message);
    throw err;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  isDatabaseConnected,
  shutdown,
  logger
};
