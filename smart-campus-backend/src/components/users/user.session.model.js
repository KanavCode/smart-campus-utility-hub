const { query } = require('../../config/db');

class UserSessionModel {
  static async create({ user_id, refresh_token_hash, ip_address, user_agent, device_type, location, expires_at }) {
    const sql = `
      INSERT INTO user_sessions (user_id, refresh_token, ip_address, user_agent, device_type, location, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_id, ip_address, user_agent, device_type, location, last_active, expires_at, created_at
    `;
    const values = [user_id, refresh_token_hash, ip_address, user_agent, device_type, location, expires_at];
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async findByRefreshTokenHash(hash) {
    const sql = 'SELECT * FROM user_sessions WHERE refresh_token = $1 AND deleted_at IS NULL';
    const result = await query(sql, [hash]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM user_sessions WHERE id = $1 AND deleted_at IS NULL';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  static async findActiveByUserId(userId) {
    const sql = `
      SELECT * FROM user_sessions 
      WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP AND deleted_at IS NULL
      ORDER BY last_active DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  static async updateToken(id, { refresh_token_hash, expires_at, ip_address, user_agent, device_type, location }) {
    const sql = `
      UPDATE user_sessions
      SET refresh_token = $1, expires_at = $2, ip_address = $3, user_agent = $4, device_type = $5, location = $6, last_active = CURRENT_TIMESTAMP
      WHERE id = $7 AND deleted_at IS NULL
      RETURNING *
    `;
    const values = [refresh_token_hash, expires_at, ip_address, user_agent, device_type, location, id];
    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  static async updateLastActive(id) {
    const sql = 'UPDATE user_sessions SET last_active = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL';
    await query(sql, [id]);
  }

  // Soft Delete methods
  static async deleteById(id) {
    const sql = 'UPDATE user_sessions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  static async deleteByRefreshTokenHash(hash) {
    const sql = 'UPDATE user_sessions SET deleted_at = CURRENT_TIMESTAMP WHERE refresh_token = $1';
    const result = await query(sql, [hash]);
    return result.rowCount > 0;
  }

  static async deleteByUserId(userId) {
    const sql = 'UPDATE user_sessions SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rowCount > 0;
  }

  static async deleteExpired() {
    // Permanent purge for actual expired records can still happen
    const sql = 'DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP';
    const result = await query(sql);
    return result.rowCount;
  }
}

module.exports = UserSessionModel;
