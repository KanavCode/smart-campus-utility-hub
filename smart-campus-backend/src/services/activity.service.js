const { query } = require('../config/db');
const { logger } = require('../config/db');

/**
 * Activity Service
 * Handles logging and retrieving user activities
 */
const activityService = {
  /**
   * Log a new activity
   */
  logActivity: async ({ userId, action, entityType, entityId, description, metadata }) => {
    try {
      const sql = `
        INSERT INTO activities (user_id, action, entity_type, entity_id, description, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [userId, action, entityType, entityId, description, metadata ? JSON.stringify(metadata) : null];
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to log activity:', error);
      return null;
    }
  },

  /**
   * Get activities with optional filtering
   */
  getActivities: async ({ userId, limit = 20, offset = 0 }) => {
    let sql = `
      SELECT a.*, u.full_name as user_name, u.role as user_role
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCounter = 1;

    if (userId) {
      sql += ` AND a.user_id = $${paramCounter}`;
      values.push(userId);
      paramCounter++;
    }

    sql += ` ORDER BY a.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }
};

module.exports = activityService;
