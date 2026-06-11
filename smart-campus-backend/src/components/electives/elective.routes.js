const express = require('express');
const router = express.Router();
const electiveController = require('./elective.controller');
const { verifyToken, verifyAdmin, verifyStudent } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');
const { apiLimiter } = require('../../middleware/rateLimiter.middleware'); // 🛡️ Added Rate Limiter

/**
 * Electives Routes
 * Base path: /api/electives
 */

// Public routes 🛡️ (Applied apiLimiter)
router.get('/', apiLimiter, validate(validationSchemas.electiveQuery, 'query'), electiveController.getAllElectives);

// Static student routes — must be BEFORE /:id to avoid route shadowing
router.post('/choices', verifyToken, verifyStudent, validate(validationSchemas.submitChoices), electiveController.submitChoices);
router.get('/my/choices', verifyToken, verifyStudent, electiveController.getMyChoices);
router.get('/my/allocation', verifyToken, verifyStudent, electiveController.getMyAllocation);
router.get('/my/waitlist', verifyToken, verifyStudent, electiveController.getMyWaitlist);

// Static admin routes — must be BEFORE /:id to avoid route shadowing
router.post('/allocate', verifyToken, verifyAdmin, electiveController.allocateElectives);
router.post('/waitlist/process', verifyToken, verifyAdmin, validate(validationSchemas.processWaitlist), electiveController.processWaitlist);

// Dynamic ID routes
router.get('/:id', apiLimiter, validate(validationSchemas.idParam, 'params'), electiveController.getElectiveById);
router.post('/', verifyToken, verifyAdmin, validate(validationSchemas.createElective), electiveController.createElective);
router.put('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), validate(validationSchemas.createElective), electiveController.updateElective);
router.delete('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), electiveController.deleteElective);

module.exports = router;