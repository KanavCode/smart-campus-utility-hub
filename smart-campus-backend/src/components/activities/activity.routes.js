const express = require('express');
const router = express.Router();
const activityController = require('./activity.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.get('/', verifyToken, activityController.getActivities);

module.exports = router;
