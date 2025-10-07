const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// --- Public Routes ---
// GET /api/events - Get all events (with optional search and tag filters)
router.get('/', eventsController.getAllEvents);

// --- Admin-Only Routes ---
router.post('/', [verifyToken, verifyAdmin], eventsController.createEvent);
router.put('/:id', [verifyToken, verifyAdmin], eventsController.updateEvent);
router.delete('/:id', [verifyToken, verifyAdmin], eventsController.deleteEvent);

module.exports = router;