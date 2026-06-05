/**
 * Migration: Add Google Calendar token columns to the users table.
 * Run with: node sql/migrate_google_calendar.js
 */

require('dotenv').config();
const { pool, logger } = require('../src/config/db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    logger.info('🗓️  Running Google Calendar migration...');

    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS google_calendar_token JSONB    DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS google_email          TEXT     DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS google_last_synced    TIMESTAMPTZ DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS google_token_updated  TIMESTAMPTZ DEFAULT NULL;
    `);

    logger.info('✅  Google Calendar columns added to users table.');
    logger.info('   • google_calendar_token (JSONB)');
    logger.info('   • google_email (TEXT)');
    logger.info('   • google_last_synced (TIMESTAMPTZ)');
    logger.info('   • google_token_updated (TIMESTAMPTZ)');
  } catch (err) {
    logger.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
