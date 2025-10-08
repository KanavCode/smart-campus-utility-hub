const { pool, logger } = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

const runMigration = async () => {
  try {
    logger.info('🔄 Running database migration...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    logger.info('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };