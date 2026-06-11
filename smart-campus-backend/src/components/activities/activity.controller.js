const { sendSuccess } = require('../../utils/response');
const activityService = require('../../services/activity.service');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Get recent activities
 * GET /api/activities
 */
const getActivities = asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const userId = req.user.id;

  const result = await activityService.getActivities({
    userId,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  sendSuccess(res, 200, 'Activities fetched successfully', {
    activities: result.activities,
    pagination: {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.offset + result.limit < result.total,
    },
  });
});

module.exports = {
  getActivities
};
