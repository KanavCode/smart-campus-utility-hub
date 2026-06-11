const { asyncHandler } = require('../../middleware/errorHandler');
const notificationsService = require('./notifications.service');
const activityService = require('../../services/activity.service');

const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const unreadOnly = req.query.unread_only === 'true';
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);

  const result = await notificationsService.listForUser({
    userId,
    unreadOnly,
    page,
    limit,
  });

  res.json({
    success: true,
    data: result,
  });
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markAsRead({
    notificationId: req.params.id,
    userId: req.user.id,
  });

  await activityService.logActivity({
    userId: req.user.id,
    action: 'NOTICE_READ',
    entityType: 'notification',
    entityId: notification.id,
    description: `Read notice: ${notification.title}`,
    metadata: {
      notificationId: notification.id,
      eventType: notification.event_type,
    },
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await notificationsService.markAllAsRead({ userId: req.user.id });

  if (result.updated > 0) {
    await activityService.logActivity({
      userId: req.user.id,
      action: 'ALL_NOTICES_READ',
      entityType: 'notification',
      entityId: null,
      description: 'Marked all notices as read',
      metadata: {
        updatedCount: result.updated,
      },
    });
  }

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
