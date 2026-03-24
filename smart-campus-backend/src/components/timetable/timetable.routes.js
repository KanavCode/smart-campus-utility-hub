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
router.get('/config', timetableController.getTimetableConfig);

// Admin routes - creating resources
router.post('/teachers', verifyToken, verifyAdmin, timetableController.createTeacher);
router.post('/subjects', verifyToken, verifyAdmin, timetableController.createSubject);
router.post('/rooms', verifyToken, verifyAdmin, timetableController.createRoom);
router.post('/groups', verifyToken, verifyAdmin, timetableController.createGroup);

// Admin routes - updating resources
router.put('/teachers/:id', verifyToken, verifyAdmin, timetableController.updateTeacher);
router.put('/subjects/:id', verifyToken, verifyAdmin, timetableController.updateSubject);
router.put('/rooms/:id', verifyToken, verifyAdmin, timetableController.updateRoom);

// Admin routes - deleting resources (soft delete)
router.delete('/teachers/:id', verifyToken, verifyAdmin, timetableController.deleteTeacher);
router.delete('/subjects/:id', verifyToken, verifyAdmin, timetableController.deleteSubject);
router.delete('/rooms/:id', verifyToken, verifyAdmin, timetableController.deleteRoom);

// Admin routes - assignments
router.post('/assign/teacher-subject', verifyToken, verifyAdmin, timetableController.assignTeacherToSubject);
router.post('/assign/subject-group', verifyToken, verifyAdmin, timetableController.assignSubjectToGroup);

// Admin routes - timetable generation
router.post('/generate', verifyToken, verifyAdmin, timetableController.generateTimetable);

module.exports = router;
