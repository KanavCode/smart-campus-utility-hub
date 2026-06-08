const { query } = require('../../config/db');

class UserSessionModel {
  /**
   * Create a new user session
   */
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

  /**
   * Find session by refresh token hash
   */
  static async findByRefreshTokenHash(hash) {
    const sql = `
      SELECT id, user_id, refresh_token, ip_address, user_agent, device_type, location, last_active, expires_at, created_at
      FROM user_sessions
      WHERE refresh_token = $1
    `;
    const result = await query(sql, [hash]);
    return result.rows[0] || null;
  }

  /**
   * Find session by ID
   */
  static async findById(id) {
    const sql = `
      SELECT id, user_id, refresh_token, ip_address, user_agent, device_type, location, last_active, expires_at, created_at
      FROM user_sessions
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find active sessions by User ID
   */
  static async findActiveByUserId(userId) {
    const sql = `
      SELECT id, user_id, ip_address, user_agent, device_type, location, last_active, expires_at, created_at
      FROM user_sessions
      WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
      ORDER BY last_active DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  /**
   * Update token and activity for a session
   */
  static async updateToken(id, { refresh_token_hash, expires_at, ip_address, user_agent, device_type, location }) {
    const sql = `
      UPDATE user_sessions
      SET refresh_token = $1, expires_at = $2, ip_address = $3, user_agent = $4, device_type = $5, location = $6, last_active = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, user_id, ip_address, user_agent, device_type, location, last_active, expires_at, created_at
    `;
    const values = [refresh_token_hash, expires_at, ip_address, user_agent, device_type, location, id];
    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  /**
   * Update last active timestamp
   */
  static async updateLastActive(id) {
    const sql = `
      UPDATE user_sessions
      SET last_active = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await query(sql, [id]);
  }

  /**
   * Delete session by ID
   */
  static async deleteById(id) {
    const sql = 'DELETE FROM user_sessions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Delete session by refresh token hash
   */
  static async deleteByRefreshTokenHash(hash) {
    const sql = 'DELETE FROM user_sessions WHERE refresh_token = $1';
    const result = await query(sql, [hash]);
    return result.rowCount > 0;
  }

  /**
   * Delete all sessions for a user
   */
  static async deleteByUserId(userId) {
    const sql = 'DELETE FROM user_sessions WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rowCount > 0;
  }

  /**
   * Clean up expired sessions
   */
  static async deleteExpired() {
    const sql = 'DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP';
    const result = await query(sql);
    return result.rowCount;
  }
}

module.exports = UserSessionModel;
