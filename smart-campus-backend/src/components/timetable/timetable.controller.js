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
 * NOTE: Timetable generation endpoint would integrate with solver.service.js
 * For the full backtracking algorithm implementation, refer to:
 * backend/Kanav_Space1/src/services/solver.service.js
 * 
 * POST /api/timetable/generate
 * This would require migrating the complex backtracking logic
 */

module.exports = {
  getAllTeachers,
  getAllSubjects,
  getAllRooms,
  getAllGroups,
  getTimetableByGroup,
  getTimetableByTeacher,
  createTeacher,
  createSubject,
  createRoom
};
