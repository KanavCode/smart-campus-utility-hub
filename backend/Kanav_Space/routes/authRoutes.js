const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);
router.patch('/changePassword', authController.changePassword);

module.exports = router;