const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

router.get('/', verifyToken, validate(validationSchemas.notificationsQuery, 'query'), notificationsController.getMyNotifications);
router.patch('/read-all', verifyToken, notificationsController.markAllNotificationsAsRead);
router.patch('/:id/read', verifyToken, validate(validationSchemas.idParam, 'params'), notificationsController.markNotificationAsRead);

module.exports = router;
