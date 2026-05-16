const { sendSuccess } = require('../../utils/response');
const activityService = require('../../services/activity.service');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Get recent activities
 * GET /api/activities
 */
const getActivities = asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0, mine } = req.query;
  const userId = mine === 'true' ? req.user.id : null;

  const activities = await activityService.getActivities({
    userId,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  sendSuccess(res, 200, 'Activities fetched successfully', {
    activities
  });
});

module.exports = {
  getActivities
};
