const { query, transaction } = require('../../config/db');
const bcrypt = require('bcryptjs');

/**
 * User Model (v2.0 — Supabase-Ready)
 * Handles all database operations for the unified users table.
 *
 * Role-specific data lives in the `metadata` JSONB column:
 *   Student : { cgpa, semester, auth_provider }
 *   Faculty : { teacher_code, phone, auth_provider }
 *   Admin   : { auth_provider }
 *   SSO     : { auth_provider, provider_id }
 */

class UserModel {
  /**
   * Create a new user (local auth)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  static async create(userData) {
    const { full_name, email, password, role, department, cgpa, semester } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Build role-specific metadata
    const metadata = { auth_provider: 'local' };
    if (role === 'student') {
      metadata.cgpa = cgpa;
      metadata.semester = semester;
    }

    const sql = `
      INSERT INTO users (full_name, email, password_hash, role, department, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, role, department, metadata, is_active, created_at
    `;

    const values = [full_name, email, password_hash, role || 'student', department, JSON.stringify(metadata)];
    const result = await query(sql, values);
    return UserModel._flattenUser(result.rows[0]);
  }

  /**
   * Create a new user via SSO
   * @param {Object} userData - User data from SSO provider
   * @returns {Promise<Object>} Created user
   */
  static async createSSO(userData) {
    const { full_name, email, role, auth_provider, provider_id } = userData;

    const metadata = {
      auth_provider: auth_provider,
      provider_id: provider_id
    };

    const sql = `
      INSERT INTO users (full_name, email, role, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role, department, metadata, is_active, created_at
    `;

    const values = [full_name, email, role || 'student', JSON.stringify(metadata)];
    const result = await query(sql, values);
    return UserModel._flattenUser(result.rows[0]);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password_hash
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email, includePassword = false) {
    const fields = includePassword
      ? 'id, full_name, email, password_hash, role, department, metadata, is_active, created_at'
      : 'id, full_name, email, role, department, metadata, is_active, created_at';

    const sql = `SELECT ${fields} FROM users WHERE email = $1`;
    const result = await query(sql, [email]);
    if (result.rows.length === 0) return null;

    const user = UserModel._flattenUser(result.rows[0]);
    if (includePassword) {
      user.password_hash = result.rows[0].password_hash;
    }
    return user;
  }

  /**
   * Find user by ID (UUID)
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    const sql = `
      SELECT id, full_name, email, role, department, metadata, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) return null;
    return UserModel._flattenUser(result.rows[0]);
  }

  /**
   * Update user profile
   * @param {string} id - User UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  static async update(id, updates) {
    // Separate top-level fields from metadata fields
    const topLevelAllowed = ['full_name', 'department'];
    const metadataFields = ['cgpa', 'semester'];

    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (topLevelAllowed.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }

    // Handle metadata updates via a single chained jsonb_set expression
    let metadataExpression = `COALESCE(metadata, '{}'::jsonb)`;
    let hasMetadataUpdates = false;

    for (const key of metadataFields) {
      if (updates[key] !== undefined) {
        metadataExpression = `jsonb_set(${metadataExpression}, '{${key}}', $${paramCounter}::jsonb)`;
        values.push(JSON.stringify(updates[key]));
        paramCounter++;
        hasMetadataUpdates = true;
      }
    }

    if (hasMetadataUpdates) {
      fields.push(`metadata = ${metadataExpression}`);
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCounter}
      RETURNING id, full_name, email, role, department, metadata, is_active, updated_at
    `;

    const result = await query(sql, values);
    if (result.rows.length === 0) return null;
    return UserModel._flattenUser(result.rows[0]);
  }

  /**
   * Admin update of user fields
   * @param {string} id - User UUID
   * @param {Object} updates - Admin-editable fields
   * @returns {Promise<Object>} Updated user
   */
  static async updateByAdmin(id, updates) {
    const topLevelAllowed = ['full_name', 'email', 'role', 'department', 'is_active'];
    const metadataFields = ['cgpa', 'semester'];

    const fields = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (topLevelAllowed.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }

    for (const key of metadataFields) {
      if (updates[key] !== undefined) {
        const val = updates[key];
        if (val === null) {
          fields.push(`metadata = metadata - '${key}'`);
        } else {
          fields.push(`metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{${key}}', $${paramCounter}::jsonb)`);
          values.push(JSON.stringify(val));
          paramCounter++;
        }
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
      RETURNING id, full_name, email, role, department, metadata, is_active, updated_at
    `;

    const result = await query(sql, values);
    if (result.rows.length === 0) return null;
    return UserModel._flattenUser(result.rows[0]);
  }

  /**
   * Change user password
   * @param {string} id - User UUID
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
    let sql = 'SELECT id, full_name, email, role, department, metadata, is_active, created_at FROM users WHERE 1=1';
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
    return result.rows.map(UserModel._flattenUser);
  }

  /**
   * Deactivate user account
   * @param {string} id - User UUID
   * @returns {Promise<boolean>} Success status
   */
  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Delete user account
   * @param {string} id - User UUID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  /**
   * Flatten metadata JSONB into top-level fields for API backward compatibility.
   * The API still returns cgpa, semester, auth_provider, provider_id as top-level keys.
   * @param {Object} row - Raw database row
   * @returns {Object} Flattened user object
   */
  static _flattenUser(row) {
    if (!row) return null;
    const { metadata, ...rest } = row;
    const meta = metadata || {};
    return {
      ...rest,
      cgpa: meta.cgpa ?? null,
      semester: meta.semester ?? null,
      auth_provider: meta.auth_provider ?? 'local',
      provider_id: meta.provider_id ?? null,
      // Preserve raw metadata for frontend that wants it
      metadata
    };
  }
}

module.exports = UserModel;
