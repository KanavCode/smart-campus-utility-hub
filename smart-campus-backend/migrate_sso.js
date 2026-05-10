const { pool } = require('./src/config/db');

async function applySSOMigration() {
  try {
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);`);
    console.log('Migration applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applySSOMigration();
