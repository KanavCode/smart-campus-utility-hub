const express = require('express');
const router = express.Router();
const calendarController = require('./calendar.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

/**
 * Google Calendar Routes
 * Base path: /api/calendar
 */

// ── OAuth flow ──────────────────────────────────────────────────────────────
// Initiates consent screen — must be authenticated (carries state with userId)
router.get('/auth', verifyToken, calendarController.initiateAuth);

// Google redirects here — PUBLIC (browser redirect, no cookie/header auth)
router.get('/callback', calendarController.handleCallback);

// ── Authenticated calendar actions ──────────────────────────────────────────
router.get('/status',       verifyToken, calendarController.getStatus);
router.post('/sync',        verifyToken, calendarController.syncCalendar);
router.delete('/disconnect', verifyToken, calendarController.disconnect);

module.exports = router;
