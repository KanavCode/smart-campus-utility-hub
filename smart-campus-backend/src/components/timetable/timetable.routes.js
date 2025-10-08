const express = require('express');
const router = express.Router();
const timetableController = require('./timetable.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');

/**
 * Timetable Routes
 * Base path: /api/timetable
 */

// Public/Protected routes - viewing timetables
router.get('/teachers', timetableController.getAllTeachers);
router.get('/subjects', timetableController.getAllSubjects);
router.get('/rooms', timetableController.getAllRooms);
router.get('/groups', timetableController.getAllGroups);
router.get('/group/:groupId', timetableController.getTimetableByGroup);
router.get('/teacher/:teacherId', timetableController.getTimetableByTeacher);

// Admin routes - creating resources
router.post('/teachers', verifyToken, verifyAdmin, timetableController.createTeacher);
router.post('/subjects', verifyToken, verifyAdmin, timetableController.createSubject);
router.post('/rooms', verifyToken, verifyAdmin, timetableController.createRoom);

module.exports = router;
