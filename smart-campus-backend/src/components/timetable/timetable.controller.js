const { query } = require('../../config/db');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');

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
  
  let sql = 'SELECT * FROM teachers WHERE is_active = true';
  const values = [];
  
  if (department) {
    sql += ' AND department = $1';
    values.push(department);
  }
  
  sql += ' ORDER BY full_name ASC';
  
  const result = await query(sql, values);
  
  res.json({
    success: true,
    data: { teachers: result.rows, count: result.rows.length }
  });
});

/**
 * Get all subjects
 * GET /api/timetable/subjects
 */
const getAllSubjects = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  
  let sql = 'SELECT * FROM subjects WHERE is_active = true';
  const values = [];
  let paramCounter = 1;
  
  if (department) {
    sql += ` AND department = $${paramCounter}`;
    values.push(department);
    paramCounter++;
  }
  
  if (semester) {
    sql += ` AND semester = $${paramCounter}`;
    values.push(parseInt(semester));
    paramCounter++;
  }
  
  sql += ' ORDER BY subject_name ASC';
  
  const result = await query(sql, values);
  
  res.json({
    success: true,
    data: { subjects: result.rows, count: result.rows.length }
  });
});

/**
 * Get all rooms
 * GET /api/timetable/rooms
 */
const getAllRooms = asyncHandler(async (req, res) => {
  const { room_type } = req.query;
  
  let sql = 'SELECT * FROM rooms WHERE is_active = true';
  const values = [];
  
  if (room_type) {
    sql += ' AND room_type = $1';
    values.push(room_type);
  }
  
  sql += ' ORDER BY room_name ASC';
  
  const result = await query(sql, values);
  
  res.json({
    success: true,
    data: { rooms: result.rows, count: result.rows.length }
  });
});

/**
 * Get all student groups
 * GET /api/timetable/groups
 */
const getAllGroups = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  
  let sql = 'SELECT * FROM student_groups WHERE is_active = true';
  const values = [];
  let paramCounter = 1;
  
  if (department) {
    sql += ` AND department = $${paramCounter}`;
    values.push(department);
    paramCounter++;
  }
  
  if (semester) {
    sql += ` AND semester = $${paramCounter}`;
    values.push(parseInt(semester));
    paramCounter++;
  }
  
  sql += ' ORDER BY group_name ASC';
  
  const result = await query(sql, values);
  
  res.json({
    success: true,
    data: { groups: result.rows, count: result.rows.length }
  });
});

/**
 * Get timetable for a specific group
 * GET /api/timetable/:groupId
 */
const getTimetableByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { academic_year, semester_type } = req.query;
  
  const sql = `
    SELECT 
      ts.id,
      ts.day_of_week,
      ts.period_number,
      s.subject_name,
      s.subject_code,
      t.full_name as teacher_name,
      t.teacher_code,
      r.room_name,
      r.room_code
    FROM timetable_slots ts
    JOIN subjects s ON ts.subject_id = s.id
    JOIN teachers t ON ts.teacher_id = t.id
    JOIN rooms r ON ts.room_id = r.id
    WHERE ts.group_id = $1
      AND ts.is_active = true
      ${academic_year ? 'AND ts.academic_year = $2' : ''}
      ${semester_type ? `AND ts.semester_type = $${academic_year ? 3 : 2}` : ''}
    ORDER BY 
      CASE ts.day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
      END,
      ts.period_number ASC
  `;
  
  const values = [groupId];
  if (academic_year) values.push(academic_year);
  if (semester_type) values.push(semester_type);
  
  const result = await query(sql, values);
  
  res.json({
    success: true,
    data: { 
      timetable: result.rows,
      group_id: groupId,
      count: result.rows.length 
    }
  });
});

/**
 * Get timetable for a specific teacher
 * GET /api/timetable/teacher/:teacherId
 */
const getTimetableByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  
  const sql = `
    SELECT 
      ts.day_of_week,
      ts.period_number,
      s.subject_name,
      sg.group_name,
      r.room_name
    FROM timetable_slots ts
    JOIN subjects s ON ts.subject_id = s.id
    JOIN student_groups sg ON ts.group_id = sg.id
    JOIN rooms r ON ts.room_id = r.id
    WHERE ts.teacher_id = $1 AND ts.is_active = true
    ORDER BY 
      CASE ts.day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
      END,
      ts.period_number ASC
  `;
  
  const result = await query(sql, [teacherId]);
  
  res.json({
    success: true,
    data: { timetable: result.rows, teacher_id: teacherId }
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
    throw new ApiError('Missing required fields', 400);
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
  const groupsResult = await query('SELECT id, group_code, group_name, department, semester FROM student_groups WHERE is_active = true');
  const teachersResult = await query('SELECT id, teacher_code, full_name, department FROM teachers WHERE is_active = true');
  const subjectsResult = await query('SELECT id, subject_code, subject_name, course_type, hours_per_week FROM subjects WHERE is_active = true');
  const roomsResult = await query('SELECT id, room_code, room_name, room_type, capacity FROM rooms WHERE is_active = true');

  res.json({
    success: true,
    data: {
      groups: groupsResult.rows,
      teachers: teachersResult.rows,
      subjects: subjectsResult.rows,
      rooms: roomsResult.rows,
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
  assignTeacherToSubject,
  assignSubjectToGroup,
  generateTimetable,
  getTimetableConfig
};
