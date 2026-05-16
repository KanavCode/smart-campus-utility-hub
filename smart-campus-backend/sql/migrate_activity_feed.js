const { query } = require('../src/config/db');

async function migrate() {
  try {
    console.log('--- Activity Feed Migration ---');
    
    // Create activities table
    await query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Activity Feed table created');
    
    // Create an index for faster queries
    await query('CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);');
    
    console.log('✅ Activity Feed indices created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
