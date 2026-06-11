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
    const normalizedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
    const normalizedOffset = Math.max(0, parseInt(offset, 10) || 0);

    const dataSql = `
      SELECT a.*, u.full_name as user_name, u.role as user_role
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countSql = 'SELECT COUNT(*)::int AS total FROM activities WHERE user_id = $1';

    const [dataResult, countResult] = await Promise.all([
      query(dataSql, [userId, normalizedLimit, normalizedOffset]),
      query(countSql, [userId]),
    ]);

    return {
      activities: dataResult.rows,
      total: countResult.rows[0]?.total || 0,
      limit: normalizedLimit,
      offset: normalizedOffset,
    };
  }
};

module.exports = activityService;
