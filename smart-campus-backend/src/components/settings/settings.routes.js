const express = require('express');

const router = express.Router();
const settingsController = require('./settings.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

router.get('/', verifyToken, verifyAdmin, settingsController.getSettings);
router.put(
  '/',
  verifyToken,
  verifyAdmin,
  validate(validationSchemas.updateSettings),
  settingsController.updateSettings
);

module.exports = router;
