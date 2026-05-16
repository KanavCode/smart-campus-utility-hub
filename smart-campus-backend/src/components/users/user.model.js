const { query, transaction } = require('../../config/db');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Handles all database operations for users
 */

class UserModel {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  static async create(userData) {
    const { full_name, email, password, role, department, cgpa, semester } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO users (full_name, email, password_hash, role, department, cgpa, semester)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name, email, role, department, cgpa, semester, created_at
    `;

    const values = [full_name, email, password_hash, role || 'student', department, cgpa, semester];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Create a new user via SSO
   * @param {Object} userData - User data from SSO provider
   * @returns {Promise<Object>} Created user
   */
  static async createSSO(userData) {
    const { full_name, email, role, auth_provider, provider_id } = userData;
    
    const sql = `
      INSERT INTO users (full_name, email, role, auth_provider, provider_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, role, department, cgpa, semester, created_at
    `;

    const values = [full_name, email, role || 'student', auth_provider, provider_id];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password_hash
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email, includePassword = false) {
    const fields = includePassword 
      ? 'id, full_name, email, password_hash, role, department, cgpa, semester, is_active, created_at, auth_provider, provider_id'
      : 'id, full_name, email, role, department, cgpa, semester, is_active, created_at, auth_provider, provider_id';
    
    const sql = `SELECT ${fields} FROM users WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    const sql = `
      SELECT id, full_name, email, role, department, cgpa, semester, is_active, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  static async update(id, updates) {
    const allowedFields = ['full_name', 'department', 'cgpa', 'semester'];
    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCounter}
      RETURNING id, full_name, email, role, department, cgpa, semester, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Admin update of user fields
   * @param {number} id - User ID
   * @param {Object} updates - Admin-editable fields
   * @returns {Promise<Object>} Updated user
   */
  static async updateByAdmin(id, updates) {
    const allowedFields = ['full_name', 'email', 'role', 'department', 'cgpa', 'semester', 'is_active'];
    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCounter}
      RETURNING id, full_name, email, role, department, cgpa, semester, is_active, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  /**
   * Change user password
   * @param {number} id - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  static async changePassword(id, oldPassword, newPassword) {
    return await transaction(async (client) => {
      // Get current password hash
      const userResult = await client.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [id]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [password_hash, id]
      );

      return true;
    });
  }

  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get all users (admin only)
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of users
   */
  static async findAll(filters = {}) {
    const { role, department, is_active, limit = 50, offset = 0 } = filters;
    let sql = 'SELECT id, full_name, email, role, department, cgpa, semester, is_active, created_at FROM users WHERE 1=1';
    const values = [];
    let paramCounter = 1;

    if (role) {
      sql += ` AND role = $${paramCounter}`;
      values.push(role);
      paramCounter++;
    }

    if (department) {
      sql += ` AND department = $${paramCounter}`;
      values.push(department);
      paramCounter++;
    }

    if (is_active !== undefined && is_active !== null) {
      sql += ` AND is_active = $${paramCounter}`;
      values.push(is_active === 'true' || is_active === true);
      paramCounter++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  /**
   * Deactivate user account
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Delete user account
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Save password reset token for user
   * @param {string} email - User email
   * @param {string} resetToken - Secure reset token
   * @param {Date} expiryTime - Token expiry timestamp
   * @returns {Promise<boolean>} Success status
   */
  static async saveResetToken(email, resetToken, expiryTime) {
    const sql = `
      UPDATE users 
      SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3
    `;
    const result = await query(sql, [resetToken, expiryTime, email]);
    return result.rowCount > 0;
  }

  /**
   * Find user by reset token
   * @param {string} resetToken - Reset token
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByResetToken(resetToken) {
    const sql = `
      SELECT id, full_name, email, role, reset_token_expiry, is_active
      FROM users 
      WHERE reset_token = $1 AND reset_token_expiry > CURRENT_TIMESTAMP
    `;
    const result = await query(sql, [resetToken]);
    return result.rows[0] || null;
  }

  /**
   * Reset user password using reset token
   * @param {string} resetToken - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  static async resetPasswordWithToken(resetToken, newPassword) {
    return await transaction(async (client) => {
      // Verify token exists and hasn't expired
      const userResult = await client.query(
        `SELECT id FROM users 
         WHERE reset_token = $1 AND reset_token_expiry > CURRENT_TIMESTAMP`,
        [resetToken]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await client.query(
        `UPDATE users 
         SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [password_hash, userResult.rows[0].id]
      );

      return true;
    });
  }

  /**
   * Persist refresh token hash and expiry for token rotation.
   * @param {number} userId
   * @param {string} refreshTokenHash
   * @param {Date} refreshTokenExpiry
   * @returns {Promise<boolean>}
   */
  static async saveRefreshTokenByUserId(userId, refreshTokenHash, refreshTokenExpiry) {
    const sql = `
      UPDATE users
      SET refresh_token_hash = $1, refresh_token_expires_at = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    const result = await query(sql, [refreshTokenHash, refreshTokenExpiry, userId]);
    return result.rowCount > 0;
  }

  /**
   * Lookup active refresh token state for a user.
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  static async findRefreshTokenStateByUserId(userId) {
    const sql = `
      SELECT id, email, role, is_active, refresh_token_hash, refresh_token_expires_at
      FROM users
      WHERE id = $1
    `;
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Clear persisted refresh token state for a user (logout/revocation).
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  static async clearRefreshTokenByUserId(userId) {
    const sql = `
      UPDATE users
      SET refresh_token_hash = NULL, refresh_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const result = await query(sql, [userId]);
    return result.rowCount > 0;
  }

  /**
   * Clear persisted refresh token state by token hash.
   * @param {string} refreshTokenHash
   * @returns {Promise<boolean>}
   */
  static async clearRefreshTokenByHash(refreshTokenHash) {
    const sql = `
      UPDATE users
      SET refresh_token_hash = NULL, refresh_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE refresh_token_hash = $1
    `;
    const result = await query(sql, [refreshTokenHash]);
    return result.rowCount > 0;
  }

  /**
   * Clear expired reset tokens
   * @returns {Promise<number>} Number of tokens cleared
   */
  static async clearExpiredTokens() {
    const sql = `
      UPDATE users 
      SET reset_token = NULL, reset_token_expiry = NULL
      WHERE reset_token_expiry IS NOT NULL AND reset_token_expiry <= CURRENT_TIMESTAMP
    `;
    const result = await query(sql);
    return result.rowCount;
  }
}

module.exports = UserModel;
