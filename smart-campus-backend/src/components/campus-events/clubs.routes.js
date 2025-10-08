const express = require('express');
const router = express.Router();
const clubsController = require('./clubs.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

/**
 * Clubs Routes
 * Base path: /api/clubs
 */

// Public routes
router.get('/', clubsController.getAllClubs);
router.get('/:id', validate(validationSchemas.idParam, 'params'), clubsController.getClubById);

// Admin-only routes
router.post('/', verifyToken, verifyAdmin, validate(validationSchemas.createClub), clubsController.createClub);
router.put('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), validate(validationSchemas.createClub), clubsController.updateClub);
router.delete('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), clubsController.deleteClub);

module.exports = router;
