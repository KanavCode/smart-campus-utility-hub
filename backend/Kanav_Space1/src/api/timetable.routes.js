const express = require('express');
const router = express.Router();

// Import controllers
const timetableController = require('../controllers/timetable.controller');

// Import validation middleware
const {
  validateTeacher,
  validateSubject,
  validateRoom,
  validateStudentGroup,
  validateTeacherSubjectAssignment,
  validateSubjectClassAssignment,
  validateTeacherUnavailability,
  validateTimetableGeneration,
  validateBulkCreate,
  validateUUID
} = require('../middleware/validation');

// ============= CORE ENTITIES ROUTES =============

// Teachers routes
router.get('/teachers', timetableController.getAllTeachers);
router.get('/teachers/:id', validateUUID('id'), timetableController.getTeacherById);
router.post('/teachers', validateTeacher, timetableController.createTeacher);
router.get('/teachers/:id/subjects', validateUUID('id'), timetableController.getTeacherSubjects);
router.get('/teachers/:id/unavailability', validateUUID('id'), timetableController.getTeacherUnavailability);

// Subjects routes
router.get('/subjects', timetableController.getAllSubjects);
router.get('/subjects/:id', validateUUID('id'), timetableController.getSubjectById);
router.post('/subjects', validateSubject, timetableController.createSubject);
router.get('/subjects/:id/teachers', validateUUID('id'), timetableController.getSubjectTeachers);

// Rooms routes
router.get('/rooms', timetableController.getAllRooms);
router.get('/rooms/:id', validateUUID('id'), timetableController.getRoomById);
router.post('/rooms', validateRoom, timetableController.createRoom);

// Student Groups routes
router.get('/groups', timetableController.getAllGroups);
router.get('/groups/:id', validateUUID('id'), timetableController.getGroupById);
router.post('/groups', validateStudentGroup, timetableController.createStudentGroup);
router.get('/groups/:id/subjects', validateUUID('id'), timetableController.getGroupSubjects);

// ============= RELATIONSHIP ROUTES =============

// Teacher-Subject assignments
router.post('/assignments/teacher-subject', validateTeacherSubjectAssignment, timetableController.createTeacherSubjectAssignment);
router.get('/assignments/teacher-subject', timetableController.getAllTeacherSubjectAssignments);

// Subject-Class assignments
router.post('/assignments/subject-class', validateSubjectClassAssignment, timetableController.createSubjectClassAssignment);
router.get('/assignments/subject-class', timetableController.getAllSubjectClassAssignments);

// Teacher unavailability
router.post('/unavailability', validateTeacherUnavailability, timetableController.createTeacherUnavailability);
router.get('/unavailability', timetableController.getAllTeacherUnavailability);

// ============= TIMETABLE OPERATIONS =============

// Generate timetable
router.post('/timetable/generate', validateTimetableGeneration, timetableController.generateTimetable);

// Get generated timetables
router.get('/timetable/:academic_year/:semester_type', timetableController.getTimetable);
router.get('/timetable/:academic_year/:semester_type/group/:group_id', 
  validateUUID('group_id'), 
  timetableController.getTimetableByGroup
);

// Clear timetable
router.delete('/timetable/:academic_year/:semester_type', timetableController.clearTimetable);

// ============= BULK OPERATIONS =============

// Bulk create entities
router.post('/bulk', validateBulkCreate, timetableController.bulkCreate);

// Export/Import routes
router.get('/export/:academic_year/:semester_type', timetableController.exportTimetable);
router.post('/import', timetableController.importTimetable);

// ============= UTILITY ROUTES =============

// Get system statistics
router.get('/stats', timetableController.getSystemStats);

// Validate timetable constraints
router.post('/validate', timetableController.validateConstraints);

// Get sample data for testing
router.get('/sample-data', timetableController.getSampleData);

module.exports = router;