const { asyncHandler } = require('../../middleware/errorHandler');
const notificationsService = require('./notifications.service');

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

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await notificationsService.markAllAsRead({ userId: req.user.id });

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
