const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');
const { authLimiter } = require('../../middleware/rateLimiter.middleware');

/**
 * User Routes
 * Base path: /api/auth and /api/users
 */

// Public routes (no authentication required)
router.post(
  '/register',
  authLimiter,
  validate(validationSchemas.register),
  userController.register
);

router.post(
  '/login',
  authLimiter,
  validate(validationSchemas.login),
  userController.login
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(validationSchemas.forgotPassword),
  userController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validate(validationSchemas.resetPassword),
  userController.resetPassword
);

// Protected routes (authentication required)
router.get(
  '/profile',
  verifyToken,
  userController.getProfile
);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is working. Available routes: /register, /login, /profile',
  });
});

router.put(
  '/profile',
  verifyToken,
  validate(validationSchemas.updateProfile),
  userController.updateProfile
);

router.post(
  '/change-password',
  verifyToken,
  authLimiter,
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

router.put(
  '/users/:id',
  verifyToken,
  verifyAdmin,
  validate(validationSchemas.idParam, 'params'),
  validate(validationSchemas.adminUpdateUser),
  userController.updateUserByAdmin
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

// SSO Routes
router.get(
  '/sso/:provider',
  userController.ssoRedirect
);

router.get(
  '/sso/:provider/callback',
  userController.ssoCallback
);

module.exports = router;
