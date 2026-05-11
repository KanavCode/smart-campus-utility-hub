const express = require('express');
const router = express.Router();
const eventsController = require('./events.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

/**
 * Events Routes
 * Base path: /api/events
 */

// Public routes
router.get('/', validate(validationSchemas.eventQuery, 'query'), eventsController.getAllEvents);
router.get('/:id', validate(validationSchemas.uuidParam, 'params'), eventsController.getEventById);

// Protected routes (authentication required)
router.get('/saved/my-events', verifyToken, eventsController.getSavedEvents);
router.post('/:id/save', verifyToken, validate(validationSchemas.uuidParam, 'params'), eventsController.saveEvent);
router.delete('/:id/save', verifyToken, validate(validationSchemas.uuidParam, 'params'), eventsController.unsaveEvent);

// Admin-only routes
router.post('/', verifyToken, verifyAdmin, validate(validationSchemas.createEvent), eventsController.createEvent);
router.put('/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), validate(validationSchemas.createEvent), eventsController.updateEvent);
router.delete('/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), eventsController.deleteEvent);

module.exports = router;
