const calendarService = require('./calendar.service');
const { logger } = require('../../config/db');

/**
 * GET /api/calendar/auth
 * Initiates the Google OAuth2 consent flow.
 * Query params: group_id, academic_year, semester_type, redirect_origin
 */
const initiateAuth = (req, res) => {
  try {
    const { group_id, academic_year, semester_type } = req.query;

    if (!group_id || !academic_year || !semester_type) {
      return res.status(400).json({
        success: false,
        message: 'group_id, academic_year, and semester_type are required.',
      });
    }

    const authUrl = calendarService.getAuthUrl({
      userId: req.user.id,
      groupId: group_id,
      academicYear: academic_year,
      semesterType: semester_type,
    });

    // Redirect the browser to Google's consent screen
    return res.redirect(authUrl);
  } catch (err) {
    logger.error('Calendar auth initiation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to initiate Google authorization.' });
  }
};

/**
 * GET /api/calendar/callback
 * Google redirects here after the user grants / denies access.
 * Public — no verifyToken (browser redirect carries no cookie).
 */
const handleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

  // User denied access
  if (error) {
    logger.warn('Google OAuth denied by user:', error);
    return res.redirect(`${frontendUrl}/student/timetable?calendar_status=denied`);
  }

  if (!code || !state) {
    return res.redirect(`${frontendUrl}/student/timetable?calendar_status=error&reason=missing_params`);
  }

  try {
    const statePayload = await calendarService.handleOAuthCallback(code, state);

    // Redirect back with success — frontend will trigger the sync via POST /api/calendar/sync
    const params = new URLSearchParams({
      calendar_status:  'connected',    // 'connected' = OAuth done, sync pending
      group_id:         statePayload.groupId,
      academic_year:    statePayload.academicYear,
      semester_type:    statePayload.semesterType,
    });

    return res.redirect(`${frontendUrl}/student/my-timetable?${params.toString()}`);
  } catch (err) {
    logger.error('Calendar OAuth callback error:', err?.message || err);
    return res.redirect(`${frontendUrl}/student/my-timetable?calendar_status=error&reason=callback_failed`);
  }
};

/**
 * GET /api/calendar/status
 * Returns whether the current user has connected Google Calendar.
 */
const getStatus = async (req, res) => {
  try {
    const status = await calendarService.getCalendarStatus(req.user.id);
    return res.json({ success: true, data: status });
  } catch (err) {
    logger.error('Calendar status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch calendar status.' });
  }
};

/**
 * POST /api/calendar/sync
 * Push the group's timetable to the user's Google Calendar.
 * Body: { group_id, academic_year, semester_type }
 */
const syncCalendar = async (req, res) => {
  try {
    const { group_id, academic_year, semester_type } = req.body;

    if (!group_id || !academic_year || !semester_type) {
      return res.status(400).json({
        success: false,
        message: 'group_id, academic_year, and semester_type are required.',
      });
    }

    const result = await calendarService.syncTimetableToCalendar({
      userId: req.user.id,
      groupId: group_id,
      academicYear: academic_year,
      semesterType: semester_type,
    });

    return res.json({
      success: true,
      message: `Timetable synced! ${result.eventsCreated} events created.`,
      data: result,
    });
  } catch (err) {
    logger.error('Calendar sync error:', err);

    if (err.message.includes('not connected')) {
      return res.status(401).json({ success: false, message: err.message });
    }

    return res.status(500).json({ success: false, message: 'Failed to sync timetable to Google Calendar.' });
  }
};

/**
 * DELETE /api/calendar/disconnect
 * Revoke Google access and clear stored tokens.
 */
const disconnect = async (req, res) => {
  try {
    await calendarService.disconnectCalendar(req.user.id);
    return res.json({ success: true, message: 'Google Calendar disconnected successfully.' });
  } catch (err) {
    logger.error('Calendar disconnect error:', err);
    return res.status(500).json({ success: false, message: 'Failed to disconnect Google Calendar.' });
  }
};

module.exports = {
  initiateAuth,
  handleCallback,
  getStatus,
  syncCalendar,
  disconnect,
};
