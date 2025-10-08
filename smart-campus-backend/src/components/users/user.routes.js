const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

/**
 * User Routes
 * Base path: /api/auth and /api/users
 */

// Public routes (no authentication required)
router.post(
  '/register',
  validate(validationSchemas.register),
  userController.register
);

router.post(
  '/login',
  validate(validationSchemas.login),
  userController.login
);

// Protected routes (authentication required)
router.get(
  '/profile',
  verifyToken,
  userController.getProfile
);

router.put(
  '/profile',
  verifyToken,
  validate(validationSchemas.updateProfile),
  userController.updateProfile
);

router.post(
  '/change-password',
  verifyToken,
  userController.changePassword
);

// Admin-only routes
router.get(
  '/users',
  verifyToken,
  verifyAdmin,
  userController.getAllUsers
);

router.get(
  '/users/:id',
  verifyToken,
  verifyAdmin,
  validate(validationSchemas.idParam, 'params'),
  userController.getUserById
);

router.patch(
  '/users/:id/deactivate',
  verifyToken,
  verifyAdmin,
  validate(validationSchemas.idParam, 'params'),
  userController.deactivateUser
);

router.delete(
  '/users/:id',
  verifyToken,
  verifyAdmin,
  validate(validationSchemas.idParam, 'params'),
  userController.deleteUser
);

module.exports = router;
