const fs = require('fs');
const path = require('path');
const { pool, logger } = require('../src/config/db');

/**
 * Run database migration from schema.sql file
 */
async function migrate() {
  try {
    logger.info('🚀 Starting database migration...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    logger.info('📄 Schema file loaded successfully');
    
    // Execute schema
    await pool.query(schema);
    
    logger.info('✅ Database migration completed successfully!');
    logger.info('📊 All tables, indexes, and triggers created');
    
    // Display created tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    logger.info('\n📋 Created tables:');
    tablesResult.rows.forEach(row => {
      logger.info(`   ✓ ${row.table_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run migration
migrate();
