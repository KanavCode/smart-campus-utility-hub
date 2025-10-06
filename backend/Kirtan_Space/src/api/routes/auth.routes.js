const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware'); // Import the middleware

// Route for user registration
router.post('/register', authController.register);

// Route for user login
router.post('/login', authController.login);

// A protected route to get the current user's profile
// GET /api/auth/me
// We add verifyToken as a second argument. It will run before the controller function.
router.get('/me', verifyToken, authController.getMe);

module.exports = router;