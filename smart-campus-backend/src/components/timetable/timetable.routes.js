const express = require('express');
const router = express.Router();
const timetableController = require('./timetable.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

/**
 * Timetable Routes
 * Base path: /api/timetable
 */

// Public/Protected routes - viewing timetables
router.get('/teachers', validate(validationSchemas.timetableQuery, 'query'), timetableController.getAllTeachers);
router.get('/subjects', validate(validationSchemas.timetableQuery, 'query'), timetableController.getAllSubjects);
router.get('/rooms', validate(validationSchemas.timetableQuery, 'query'), timetableController.getAllRooms);
router.get('/groups', validate(validationSchemas.timetableQuery, 'query'), timetableController.getAllGroups);
router.get('/group/:groupId', validate(validationSchemas.groupIdParam, 'params'), validate(validationSchemas.timetableQuery, 'query'), timetableController.getTimetableByGroup);
router.get('/teacher/:teacherId', validate(validationSchemas.teacherIdParam, 'params'), validate(validationSchemas.timetableQuery, 'query'), timetableController.getTimetableByTeacher);
router.get('/config', timetableController.getTimetableConfig);

// Admin routes - creating resources
router.post('/teachers', verifyToken, verifyAdmin, validate(validationSchemas.timetableTeacher, 'body'), timetableController.createTeacher);
router.post('/subjects', verifyToken, verifyAdmin, validate(validationSchemas.timetableSubject, 'body'), timetableController.createSubject);
router.post('/rooms', verifyToken, verifyAdmin, validate(validationSchemas.timetableRoom, 'body'), timetableController.createRoom);
router.post('/groups', verifyToken, verifyAdmin, validate(validationSchemas.timetableGroup, 'body'), timetableController.createGroup);

// Admin routes - updating resources
router.put('/teachers/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), validate(validationSchemas.timetableTeacher, 'body'), timetableController.updateTeacher);
router.put('/subjects/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), validate(validationSchemas.timetableSubject, 'body'), timetableController.updateSubject);
router.put('/rooms/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), validate(validationSchemas.timetableRoom, 'body'), timetableController.updateRoom);

// Admin routes - deleting resources (soft delete)
router.delete('/teachers/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), timetableController.deleteTeacher);
router.delete('/subjects/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), timetableController.deleteSubject);
router.delete('/rooms/:id', verifyToken, verifyAdmin, validate(validationSchemas.uuidParam, 'params'), timetableController.deleteRoom);

// Admin routes - assignments
router.post('/assign/teacher-subject', verifyToken, verifyAdmin, validate(validationSchemas.assignTeacherSubject, 'body'), timetableController.assignTeacherToSubject);
router.post('/assign/subject-group', verifyToken, verifyAdmin, validate(validationSchemas.assignSubjectGroup, 'body'), timetableController.assignSubjectToGroup);

// Admin routes - timetable generation
router.post('/generate', verifyToken, verifyAdmin, validate(validationSchemas.generateTimetable, 'body'), timetableController.generateTimetable);

module.exports = router;
