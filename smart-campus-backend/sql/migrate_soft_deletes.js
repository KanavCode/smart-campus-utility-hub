require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log("Connecting to database...");
    await connection.execute(`ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`);
    await connection.execute(`ALTER TABLE sessions ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`);
    console.log("Migration successful: deleted_at columns added.");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await connection.end();
  }
}

runMigration();