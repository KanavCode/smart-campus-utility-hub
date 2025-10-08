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
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password_hash
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email, includePassword = false) {
    const fields = includePassword 
      ? 'id, full_name, email, password_hash, role, department, cgpa, semester, is_active, created_at'
      : 'id, full_name, email, role, department, cgpa, semester, is_active, created_at';
    
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
    const { role, department, limit = 50, offset = 0 } = filters;
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
}

module.exports = UserModel;
