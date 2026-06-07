'use strict';

const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { logger } = require('../config/db');

// =====================================================================
// PATHS & CONSTANTS
// =====================================================================

/** Absolute path to the /backups directory (one level up from /src) */
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'backups');

/** Number of days before a backup file is considered old and deleted */
const RETENTION_DAYS = 7;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

// =====================================================================
// HELPERS
// =====================================================================

/**
 * Ensures the /backups directory exists. Creates it recursively if not.
 */
function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    logger.info(`[Backup] Created backups directory at: ${BACKUPS_DIR}`);
  }
}

/**
 * Returns a date string formatted as YYYY-MM-DD for use in filenames.
 * @returns {string} e.g. "2026-06-04"
 */
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Deletes backup .sql files older than RETENTION_DAYS from the /backups directory.
 */
function deleteOldBackups() {
  logger.info(`[Backup] Running cleanup — removing backups older than ${RETENTION_DAYS} days...`);

  let files;
  try {
    files = fs.readdirSync(BACKUPS_DIR);
  } catch (err) {
    logger.error('[Backup] Could not read backups directory during cleanup:', err.message);
    return;
  }

  const now = Date.now();
  let deletedCount = 0;

  files
    .filter((file) => file.startsWith('backup-') && file.endsWith('.sql'))
    .forEach((file) => {
      const filePath = path.join(BACKUPS_DIR, file);
      try {
        const { mtime } = fs.statSync(filePath);
        const ageMs = now - mtime.getTime();

        if (ageMs > RETENTION_MS) {
          fs.unlinkSync(filePath);
          logger.info(`[Backup] 🗑️  Deleted old backup: ${file}`);
          deletedCount++;
        }
      } catch (err) {
        logger.warn(`[Backup] Could not process file "${file}" during cleanup: ${err.message}`);
      }
    });

  if (deletedCount === 0) {
    logger.info('[Backup] Cleanup complete — no old backups to delete.');
  } else {
    logger.info(`[Backup] Cleanup complete — deleted ${deletedCount} file(s).`);
  }
}

// =====================================================================
// CORE BACKUP LOGIC
// =====================================================================

/**
 * Runs the pg_dump command via child_process.exec() and saves the output
 * to a timestamped .sql file in the /backups directory.
 */
function runBackup() {
  ensureBackupsDir();

  const date = getTodayDateString();
  const filename = `backup-${date}.sql`;
  const filepath = path.join(BACKUPS_DIR, filename);

  // Read DB credentials from environment variables (already loaded by dotenv in app.js)
  const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
  } = process.env;

  if (!DB_NAME || !DB_USER) {
    logger.error('[Backup] ❌ DB_NAME or DB_USER is not set in environment. Aborting backup.');
    return;
  }

  logger.info(`[Backup] ⏳ Starting database backup → ${filename}`);

  // Build the pg_dump command.
  // We use the -F p flag for plain-text SQL format.
  // PGPASSWORD is set as an env variable so we never expose the password in the shell command string.
  const command = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -F p -f "${filepath}"`;

  const env = {
    ...process.env,
    PGPASSWORD: DB_PASSWORD || '',
  };

  exec(command, { env }, (error, stdout, stderr) => {
    if (error) {
      logger.error(`[Backup] ❌ pg_dump failed: ${error.message}`);
      if (stderr) {
        logger.error(`[Backup] pg_dump stderr: ${stderr}`);
      }
      return;
    }

    logger.info(`[Backup] ✅ Backup saved successfully → ${filename}`);

    // After a successful backup, clean up old files
    deleteOldBackups();
  });
}

// =====================================================================
// CRON SCHEDULE
// =====================================================================

/**
 * Registers the backup cron job.
 * Schedule: "0 0 * * *" — fires every day at midnight (00:00).
 *
 * Simply importing this module from app.js is enough to register the job.
 */
function initBackupJob() {
  logger.info('[Backup] 🕛 Automated backup job registered — runs daily at midnight.');

  cron.schedule('0 0 * * *', () => {
    logger.info('[Backup] ⏰ Midnight trigger fired — initiating backup...');
    runBackup();
  });
}

module.exports = { initBackupJob, runBackup };
