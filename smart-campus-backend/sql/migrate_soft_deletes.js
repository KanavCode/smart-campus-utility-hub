const { pool, logger } = require('../src/config/db');

async function migrate() {
  try {
    logger.info('🚀 Running soft-delete migration...');

    const statements = [
      'ALTER TABLE events    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL',
      'ALTER TABLE clubs     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL',
      'ALTER TABLE electives ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL',
      'CREATE INDEX IF NOT EXISTS idx_events_deleted_at    ON events(deleted_at)',
      'CREATE INDEX IF NOT EXISTS idx_clubs_deleted_at     ON clubs(deleted_at)',
      'CREATE INDEX IF NOT EXISTS idx_electives_deleted_at ON electives(deleted_at)',
    ];

    for (const sql of statements) {
      await pool.query(sql);
    }

    logger.info('✅ Soft-delete migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Soft-delete migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
