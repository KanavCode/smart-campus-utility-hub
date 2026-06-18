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
router.get('/', validate(validationSchemas.clubQuery, 'query'), clubsController.getAllClubs);
router.get('/:id', validate(validationSchemas.uuidParam, 'params'), clubsController.getClubById);

// Admin-only routes
router.post('/', verifyToken, verifyAdmin, validate(validationSchemas.createClub), clubsController.createClub);
router.put('/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), validate(validationSchemas.createClub), clubsController.updateClub);
router.delete('/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), clubsController.deleteClub);

module.exports = router;
