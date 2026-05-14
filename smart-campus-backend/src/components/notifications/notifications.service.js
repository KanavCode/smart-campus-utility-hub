const { query } = require('../../config/db');
const { parseInteger } = require('../../utils/request');
const { ApiError } = require('../../middleware/errorHandler');

const listForUser = async ({ userId, unreadOnly = false, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const whereSql = unreadOnly ? 'WHERE user_id = $1 AND is_read = false' : 'WHERE user_id = $1';

  const dataSql = `
    SELECT id, event_type, title, message, metadata, is_read, read_at, email_status, email_sent_at, created_at
    FROM notifications
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countSql = `SELECT COUNT(*) FROM notifications ${whereSql}`;

  const [dataResult, countResult, unreadCountResult] = await Promise.all([
    query(dataSql, [userId, limit, offset]),
    query(countSql, [userId]),
    query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false', [userId]),
  ]);

  return {
    notifications: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    unreadCount: parseInt(unreadCountResult.rows[0].count, 10),
    page,
    limit,
  };
};

const markAsRead = async ({ notificationId, userId }) => {
  const id = parseInteger(notificationId);

  const result = await query(
    `
      UPDATE notifications
      SET is_read = true, read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE id = $1 AND user_id = $2
      RETURNING id, event_type, title, message, metadata, is_read, read_at, email_status, email_sent_at, created_at
    `,
    [id, userId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Notification not found');
  }

  return result.rows[0];
};

const markAllAsRead = async ({ userId }) => {
  const result = await query(
    `
      UPDATE notifications
      SET is_read = true, read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE user_id = $1 AND is_read = false
      RETURNING id
    `,
    [userId]
  );

  return { updated: result.rowCount };
};

module.exports = {
  listForUser,
  markAsRead,
  markAllAsRead,
};
