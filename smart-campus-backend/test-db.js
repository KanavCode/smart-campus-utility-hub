// Simple test to validate database configuration
const { testConnection, logger } = require('./src/config/db');

async function test() {
  try {
    logger.info('Testing database connection...');
    await testConnection();
    logger.info('✅ Database configuration is valid!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

test();
