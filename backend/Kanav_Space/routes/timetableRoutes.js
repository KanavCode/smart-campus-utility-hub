const express = require('express');
const timetableController = require('../controllers/timetableController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin-only routes
router.post('/generate', restrictTo('admin'), timetableController.generateTimetable);
router.put('/slot/:slotId', restrictTo('admin'), timetableController.updateSlot);
router.delete('/', restrictTo('admin'), timetableController.deleteTimetable);

// Routes accessible by both admin and teacher
router.get('/complete', timetableController.getCompleteTimetable);
router.get('/class/:classId', timetableController.getClassTimetable);
router.get('/teacher/:teacherId', timetableController.getTeacherTimetable);

module.exports = router;