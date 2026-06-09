const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth.middleware');
const { submitFeedback } = require('./feedback.controller');

router.post('/', verifyToken, submitFeedback);

module.exports = router;
