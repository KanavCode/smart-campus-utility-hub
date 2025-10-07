const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Log successful connections
pool.on('connect', (client) => {
  console.log('✅ Successfully connected to PostgreSQL database!');
});

// Log connection errors
pool.on('error', (err, client) => {
  console.error('🔥 Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('🔗 Database connection test successful:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
  }
};

// Run connection test
testConnection();

// Export query function for easier use
const query = (text, params) => {
  return pool.query(text, params);
};

// Export both the query function and pool
module.exports = {
  query,
  pool
};