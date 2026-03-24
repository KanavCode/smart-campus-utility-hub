const { query } = require('../../config/db');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');
const timetableReadService = require('./timetable.read.service');

/**
 * Timetable Controller
 * Handles timetable generation and management
 * Note: This is a simplified version focusing on core CRUD operations
 * For full backtracking algorithm, refer to Kanav_Space1/services/solver.service.js
 */

/**
 * Get all teachers
 * GET /api/timetable/teachers
 */
const getAllTeachers = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const teachers = await timetableReadService.listTeachers({ department });
  
  res.json({
    success: true,
    data: { teachers, count: teachers.length }
  });
});

/**
 * Get all subjects
 * GET /api/timetable/subjects
 */
const getAllSubjects = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  const subjects = await timetableReadService.listSubjects({ department, semester });
  
  res.json({
    success: true,
    data: { subjects, count: subjects.length }
  });
});

/**
 * Get all rooms
 * GET /api/timetable/rooms
 */
const getAllRooms = asyncHandler(async (req, res) => {
  const { room_type } = req.query;
  const rooms = await timetableReadService.listRooms({ room_type });
  
  res.json({
    success: true,
    data: { rooms, count: rooms.length }
  });
});

/**
 * Get all student groups
 * GET /api/timetable/groups
 */
const getAllGroups = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  const groups = await timetableReadService.listGroups({ department, semester });
  
  res.json({
    success: true,
    data: { groups, count: groups.length }
  });
});

/**
 * Get timetable for a specific group
 * GET /api/timetable/:groupId
 */
const getTimetableByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { academic_year, semester_type } = req.query;
  const timetable = await timetableReadService.getGroupTimetable({
    groupId,
    academic_year,
    semester_type
  });
  
  res.json({
    success: true,
    data: { 
      timetable,
      group_id: groupId,
      count: timetable.length 
    }
  });
});

/**
 * Get timetable for a specific teacher
 * GET /api/timetable/teacher/:teacherId
 */
const getTimetableByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const timetable = await timetableReadService.getTeacherTimetable({ teacherId });
  
  res.json({
    success: true,
    data: { timetable, teacher_id: teacherId }
  });
});

/**
 * Create a teacher (Admin only)
 * POST /api/timetable/teachers
 */
const createTeacher = asyncHandler(async (req, res) => {
  const { teacher_code, full_name, department, email, phone } = req.body;
  
  const sql = `
    INSERT INTO teachers (teacher_code, full_name, department, email, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await query(sql, [teacher_code, full_name, department, email, phone]);
  
  logger.info('Teacher created', { teacherId: result.rows[0].id, createdBy: req.user.id });
  
  res.status(201).json({
    success: true,
    message: 'Teacher created successfully',
    data: { teacher: result.rows[0] }
  });
});

/**
 * Create a subject (Admin only)
 * POST /api/timetable/subjects
 */
const createSubject = asyncHandler(async (req, res) => {
  const { subject_code, subject_name, hours_per_week, course_type, department, semester } = req.body;
  
  const sql = `
    INSERT INTO subjects (subject_code, subject_name, hours_per_week, course_type, department, semester)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await query(sql, [subject_code, subject_name, hours_per_week, course_type, department, semester]);
  
  logger.info('Subject created', { subjectId: result.rows[0].id, createdBy: req.user.id });
  
  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: { subject: result.rows[0] }
  });
});

/**
 * Create a room (Admin only)
 * POST /api/timetable/rooms
 */
const createRoom = asyncHandler(async (req, res) => {
  const { room_code, room_name, capacity, room_type, floor_number, building } = req.body;
  
  const sql = `
    INSERT INTO rooms (room_code, room_name, capacity, room_type, floor_number, building)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await query(sql, [room_code, room_name, capacity, room_type, floor_number, building]);
  
  logger.info('Room created', { roomId: result.rows[0].id, createdBy: req.user.id });
  
  res.status(201).json({
    success: true,
    message: 'Room created successfully',
    data: { room: result.rows[0] }
  });
});

/**
 * Create a student group (Admin only)
 * POST /api/timetable/groups
 */
const createGroup = asyncHandler(async (req, res) => {
  const { group_code, group_name, strength, department, semester, academic_year } = req.body;
  
  const sql = `
    INSERT INTO student_groups (group_code, group_name, strength, department, semester, academic_year)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await query(sql, [group_code, group_name, strength, department, semester, academic_year]);
  
  logger.info('Student group created', { groupId: result.rows[0].id, createdBy: req.user.id });
  
  res.status(201).json({
    success: true,
    message: 'Student group created successfully',
    data: { group: result.rows[0] }
  });
});

/**
 * Update a teacher (Admin only)
 * PUT /api/timetable/teachers/:id
 */
const updateTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teacher_code, full_name, department, email, phone } = req.body;

  const sql = `
    UPDATE teachers
    SET teacher_code = $1, full_name = $2, department = $3, email = $4, phone = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND is_active = true
    RETURNING *
  `;

  const result = await query(sql, [teacher_code, full_name, department, email, phone, id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, 'Teacher not found');
  }

  logger.info('Teacher updated', { teacherId: id, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Teacher updated successfully',
    data: { teacher: result.rows[0] }
  });
});

/**
 * Update a subject (Admin only)
 * PUT /api/timetable/subjects/:id
 */
const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject_code, subject_name, hours_per_week, course_type, department, semester } = req.body;

  const sql = `
    UPDATE subjects
    SET subject_code = $1, subject_name = $2, hours_per_week = $3, course_type = $4, department = $5, semester = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $7 AND is_active = true
    RETURNING *
  `;

  const result = await query(sql, [subject_code, subject_name, hours_per_week, course_type, department, semester, id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, 'Subject not found');
  }

  logger.info('Subject updated', { subjectId: id, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Subject updated successfully',
    data: { subject: result.rows[0] }
  });
});

/**
 * Update a room (Admin only)
 * PUT /api/timetable/rooms/:id
 */
const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { room_code, room_name, capacity, room_type, floor_number, building } = req.body;

  const sql = `
    UPDATE rooms
    SET room_code = $1, room_name = $2, capacity = $3, room_type = $4, floor_number = $5, building = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $7 AND is_active = true
    RETURNING *
  `;

  const result = await query(sql, [room_code, room_name, capacity, room_type, floor_number, building, id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, 'Room not found');
  }

  logger.info('Room updated', { roomId: id, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Room updated successfully',
    data: { room: result.rows[0] }
  });
});

/**
 * Delete a teacher (Admin only, soft delete)
 * DELETE /api/timetable/teachers/:id
 */
const deleteTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE teachers
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_active = true
    RETURNING id
  `;

  const result = await query(sql, [id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, 'Teacher not found');
  }

  logger.info('Teacher deleted (soft)', { teacherId: id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Teacher deleted successfully'
  });
});

/**
 * Delete a subject (Admin only, soft delete)
 * DELETE /api/timetable/subjects/:id
 */
const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE subjects
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_active = true
    RETURNING id
  `;

  const result = await query(sql, [id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, 'Subject not found');
  }

  logger.info('Subject deleted (soft)', { subjectId: id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Subject deleted successfully'
  });
});

/**
 * Delete a room (Admin only, soft delete)
 * DELETE /api/timetable/rooms/:id
 */
const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE rooms
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_active = true
    RETURNING id
  `;

  const result = await query(sql, [id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, 'Room not found');
  }

  logger.info('Room deleted (soft)', { roomId: id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Room deleted successfully'
  });
});

/**
 * Assign teacher to subject (Admin only)
 * POST /api/timetable/assign/teacher-subject
 */
const assignTeacherToSubject = asyncHandler(async (req, res) => {
  const { teacher_id, subject_id, priority } = req.body;
  
  const sql = `
    INSERT INTO teacher_subject_assignments (teacher_id, subject_id, priority)
    VALUES ($1, $2, $3)
    ON CONFLICT (teacher_id, subject_id) 
    DO UPDATE SET priority = $3, is_active = true
    RETURNING *
  `;
  
  const result = await query(sql, [teacher_id, subject_id, priority || 1]);
  
  logger.info('Teacher assigned to subject', { 
    teacherId: teacher_id, 
    subjectId: subject_id,
    createdBy: req.user.id 
  });
  
  res.status(201).json({
    success: true,
    message: 'Teacher assigned to subject successfully',
    data: { assignment: result.rows[0] }
  });
});

/**
 * Assign subject to group (Admin only)
 * POST /api/timetable/assign/subject-group
 */
const assignSubjectToGroup = asyncHandler(async (req, res) => {
  const { subject_id, group_id } = req.body;
  
  const sql = `
    INSERT INTO subject_class_assignments (subject_id, group_id)
    VALUES ($1, $2)
    ON CONFLICT (subject_id, group_id) 
    DO UPDATE SET is_active = true
    RETURNING *
  `;
  
  const result = await query(sql, [subject_id, group_id]);
  
  logger.info('Subject assigned to group', { 
    subjectId: subject_id, 
    groupId: group_id,
    createdBy: req.user.id 
  });
  
  res.status(201).json({
    success: true,
    message: 'Subject assigned to group successfully',
    data: { assignment: result.rows[0] }
  });
});

/**
 * Generate timetable using backtracking algorithm (Admin only)
 * POST /api/timetable/generate
 */
const generateTimetable = asyncHandler(async (req, res) => {
  const { 
    groups, 
    days, 
    periods_per_day, 
    lunch_break_period,
    academic_year,
    semester_type,
    preferences 
  } = req.body;

  // Validate required fields
  if (!groups || !days || !periods_per_day || !academic_year || !semester_type) {
    throw new ApiError(400, 'Missing required fields');
  }

  logger.info('Starting timetable generation', { 
    groups: groups.length,
    days: days.length,
    periods_per_day,
    academic_year,
    semester_type,
    requestedBy: req.user.id 
  });

  // Import service
  const { generateTimetable: generate, saveTimetableToDatabase } = require('./timetable.service');

  // Generate timetable
  const result = await generate({
    groups,
    days,
    periods_per_day,
    lunch_break_period,
    preferences
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error,
      message: result.message,
      details: result.details
    });
  }

  // Save to database
  await saveTimetableToDatabase(result.timetable, academic_year, semester_type);

  logger.info('Timetable generation completed', {
    totalSlots: result.statistics.totalSlots,
    iterations: result.statistics.iterations
  });

  res.status(201).json({
    success: true,
    message: 'Timetable generated successfully',
    data: {
      timetable: result.timetable,
      statistics: result.statistics,
      academic_year,
      semester_type
    }
  });
});

/**
 * Get timetable generation constraints/configuration
 * GET /api/timetable/config
 */
const getTimetableConfig = asyncHandler(async (req, res) => {
  const configData = await timetableReadService.getConfigData();

  res.json({
    success: true,
    data: {
      groups: configData.groups,
      teachers: configData.teachers,
      subjects: configData.subjects,
      rooms: configData.rooms,
      defaultDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      defaultPeriodsPerDay: 7,
      defaultLunchBreak: 4
    }
  });
});

module.exports = {
  getAllTeachers,
  getAllSubjects,
  getAllRooms,
  getAllGroups,
  getTimetableByGroup,
  getTimetableByTeacher,
  createTeacher,
  createSubject,
  createRoom,
  createGroup,
  updateTeacher,
  updateSubject,
  updateRoom,
  deleteTeacher,
  deleteSubject,
  deleteRoom,
  assignTeacherToSubject,
  assignSubjectToGroup,
  generateTimetable,
  getTimetableConfig
};
