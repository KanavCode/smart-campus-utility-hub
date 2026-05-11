const { asyncHandler } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');
const { sendSuccess } = require('../../utils/response');
const settingsService = require('./settings.service');

const getSettings = asyncHandler(async (_req, res) => {
  const settings = await settingsService.getSettings();
  sendSuccess(res, 200, 'Settings fetched successfully', { settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const { academic_year, current_semester, campus_name } = req.body;

  const settings = await settingsService.upsertSettings({
    academic_year,
    current_semester,
    campus_name,
    updated_by: req.user.id
  });

  logger.info('System settings updated', { updatedBy: req.user.id });
  sendSuccess(res, 200, 'Settings updated successfully', { settings });
});

module.exports = {
  getSettings,
  updateSettings
};
