const express = require('express');
const router = express.Router();
const electiveController = require('./elective.controller');
const { verifyToken, verifyAdmin, verifyStudent } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

/**
 * Electives Routes
 * Base path: /api/electives
 */

// Public routes
router.get('/', electiveController.getAllElectives);
router.get('/:id', validate(validationSchemas.idParam, 'params'), electiveController.getElectiveById);

// Student routes (protected)
router.post('/choices', verifyToken, verifyStudent, validate(validationSchemas.submitChoices), electiveController.submitChoices);
router.get('/my/choices', verifyToken, verifyStudent, electiveController.getMyChoices);
router.get('/my/allocation', verifyToken, verifyStudent, electiveController.getMyAllocation);

// Admin routes
router.post('/', verifyToken, verifyAdmin, validate(validationSchemas.createElective), electiveController.createElective);
router.put('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), validate(validationSchemas.createElective), electiveController.updateElective);
router.delete('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), electiveController.deleteElective);
router.post('/allocate', verifyToken, verifyAdmin, electiveController.allocateElectives);

module.exports = router;
