const { query, transaction } = require('../../config/db');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Handles database operations for users.
 */
class UserModel {
  static activeWhereClause(alias = '') {
    const prefix = alias ? `${alias}.` : '';
    return `${prefix}deleted_at IS NULL`;
  }

  static async create(userData) {
    const { full_name, email, password, role, department, cgpa, semester } = userData;

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

  static async findByEmail(email, includePassword = false) {
    const fields = includePassword
      ? 'id, full_name, email, password_hash, role, department, cgpa, semester, is_active, created_at, auth_provider, provider_id'
      : 'id, full_name, email, role, department, cgpa, semester, is_active, created_at, auth_provider, provider_id';

    const sql = `SELECT ${fields} FROM users WHERE email = $1 AND ${this.activeWhereClause()}`;
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const sql = `
      SELECT id, full_name, email, role, department, cgpa, semester, is_active, created_at, updated_at
      FROM users
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

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
      WHERE id = $${paramCounter} AND ${this.activeWhereClause()}
      RETURNING id, full_name, email, role, department, cgpa, semester, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

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
      WHERE id = $${paramCounter} AND ${this.activeWhereClause()}
      RETURNING id, full_name, email, role, department, cgpa, semester, is_active, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  static async changePassword(id, oldPassword, newPassword) {
    return transaction(async (client) => {
      const userResult = await client.query(
        `SELECT password_hash FROM users WHERE id = $1 AND ${this.activeWhereClause()}`,
        [id]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const isValid = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [password_hash, id]
      );

      return true;
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll(filters = {}) {
    const { role, department, is_active, limit = 50, offset = 0 } = filters;
    let sql = `
      SELECT id, full_name, email, role, department, cgpa, semester, is_active, created_at
      FROM users
      WHERE ${this.activeWhereClause()}
    `;
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

  static async deactivate(id) {
    const sql = `
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    const sql = `
      UPDATE users
      SET deleted_at = CURRENT_TIMESTAMP, is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  static async saveResetToken(email, resetToken, expiryTime) {
    const sql = `
      UPDATE users
      SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [resetToken, expiryTime, email]);
    return result.rowCount > 0;
  }

  static async findByResetToken(resetToken) {
    const sql = `
      SELECT id, full_name, email, role, reset_token_expiry, is_active
      FROM users
      WHERE reset_token = $1
        AND reset_token_expiry > CURRENT_TIMESTAMP
        AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [resetToken]);
    return result.rows[0] || null;
  }

  static async resetPasswordWithToken(resetToken, newPassword) {
    return transaction(async (client) => {
      const userResult = await client.query(
        `SELECT id FROM users
         WHERE reset_token = $1
           AND reset_token_expiry > CURRENT_TIMESTAMP
           AND ${this.activeWhereClause()}`,
        [resetToken]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      await client.query(
        `UPDATE users
         SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [password_hash, userResult.rows[0].id]
      );

      return true;
    });
  }

  static async saveRefreshTokenByUserId(userId, refreshTokenHash, refreshTokenExpiry) {
    const sql = `
      UPDATE users
      SET refresh_token_hash = $1, refresh_token_expires_at = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [refreshTokenHash, refreshTokenExpiry, userId]);
    return result.rowCount > 0;
  }

  static async findRefreshTokenStateByUserId(userId) {
    const sql = `
      SELECT id, email, role, is_active, refresh_token_hash, refresh_token_expires_at
      FROM users
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }

  static async clearRefreshTokenByUserId(userId) {
    const sql = `
      UPDATE users
      SET refresh_token_hash = NULL, refresh_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [userId]);
    return result.rowCount > 0;
  }

  static async clearRefreshTokenByHash(refreshTokenHash) {
    const sql = `
      UPDATE users
      SET refresh_token_hash = NULL, refresh_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE refresh_token_hash = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [refreshTokenHash]);
    return result.rowCount > 0;
  }

  static async clearExpiredTokens() {
    const sql = `
      UPDATE users
      SET reset_token = NULL, reset_token_expiry = NULL
      WHERE reset_token_expiry IS NOT NULL AND reset_token_expiry <= CURRENT_TIMESTAMP
    `;
    const result = await query(sql);
    return result.rowCount;
  }

  static async enable2FA(userId, secret, backupCodes) {
    const sql = `
      UPDATE users
      SET two_factor_secret = $1,
          two_factor_backup_codes = $2,
          two_factor_enabled = true,
          two_factor_enabled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [secret, backupCodes, userId]);
    return result.rowCount > 0;
  }

  static async disable2FA(userId) {
    const sql = `
      UPDATE users
      SET two_factor_secret = NULL,
          two_factor_backup_codes = NULL,
          two_factor_enabled = false,
          two_factor_enabled_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [userId]);
    return result.rowCount > 0;
  }

  static async get2FAStatus(userId) {
    const sql = `
      SELECT id, two_factor_enabled, two_factor_enabled_at, ARRAY_LENGTH(two_factor_backup_codes, 1) as backup_codes_count
      FROM users
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }

  static async findWithSecret(userId) {
    const sql = `
      SELECT id, email, two_factor_secret, two_factor_enabled, two_factor_backup_codes
      FROM users
      WHERE id = $1 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }

  static async update2FABackupCodes(userId, remainingCodes) {
    const sql = `
      UPDATE users
      SET two_factor_backup_codes = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND ${this.activeWhereClause()}
    `;
    const result = await query(sql, [remainingCodes, userId]);
    return result.rowCount > 0;
  }
}

module.exports = UserModel;
