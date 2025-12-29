const { query, transaction } = require('../../config/db');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');

/**
 * Electives Controller
 * Handles elective subject management and allocation
 */

/**
 * Create a new elective (Admin only)
 * POST /api/electives
 */
const createElective = asyncHandler(async (req, res) => {
  const { subject_name, description, max_students, department, semester } = req.body;

  const sql = `
    INSERT INTO electives (subject_name, description, max_students, department, semester)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await query(sql, [subject_name, description, max_students || 50, department, semester]);

  logger.info('Elective created', { electiveId: result.rows[0].id, createdBy: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Elective created successfully',
    data: { elective: result.rows[0] }
  });
});

/**
 * Get all electives
 * GET /api/electives
 * Public route
 */
const getAllElectives = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  
  let sql = 'SELECT * FROM electives WHERE 1=1';
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
    data: { electives: result.rows, count: result.rows.length }
  });
});

/**
 * Get elective by ID
 * GET /api/electives/:id
 */
const getElectiveById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM electives WHERE id = $1';
  const result = await query(sql, [parseInt(id)]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Elective not found');
  }

  res.json({
    success: true,
    data: { elective: result.rows[0] }
  });
});

/**
 * Update elective (Admin only)
 * PUT /api/electives/:id
 */
const updateElective = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject_name, description, max_students, department, semester } = req.body;

  const sql = `
    UPDATE electives
    SET subject_name = $1, description = $2, max_students = $3, department = $4, semester = $5
    WHERE id = $6
    RETURNING *
  `;

  const result = await query(sql, [subject_name, description, max_students, department, semester, parseInt(id)]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Elective not found');
  }

  logger.info('Elective updated', { electiveId: id, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Elective updated successfully',
    data: { elective: result.rows[0] }
  });
});

/**
 * Delete elective (Admin only)
 * DELETE /api/electives/:id
 */
const deleteElective = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query('DELETE FROM electives WHERE id = $1 RETURNING *', [parseInt(id)]);

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Elective not found');
  }

  logger.info('Elective deleted', { electiveId: id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Elective deleted successfully'
  });
});

/**
 * Submit elective choices (Protected - Student only)
 * POST /api/electives/choices
 */
const submitChoices = asyncHandler(async (req, res) => {
  const { choices } = req.body; // Array of { subject_name, preference_rank }
  const userId = req.user.id;

  // Fetch electives from DB
  const electivesResult = await query('SELECT id, subject_name FROM electives');
  const subjectToId = {};
  electivesResult.rows.forEach(e => {
    subjectToId[e.subject_name] = e.id;
  });

  // Validate submitted subjects
  const invalidSubjects = choices.filter(c => !subjectToId[c.subject_name]);
  if (invalidSubjects.length > 0) {
    return res.status(400).json({
      message: `Invalid subjects: ${invalidSubjects.map(c => c.subject_name).join(', ')}`
    });
  }

  // Save choices in transaction
  await transaction(async (client) => {
    await client.query('DELETE FROM student_choices WHERE student_id = $1', [userId]);

    for (const choice of choices) {
      const electiveId = subjectToId[choice.subject_name];
      await client.query(
        'INSERT INTO student_choices (student_id, elective_id, preference_rank) VALUES ($1, $2, $3)',
        [userId, electiveId, choice.preference_rank]
      );
    }
  });

  logger.info('Elective choices submitted', { userId, choicesCount: choices.length });

  res.json({
    success: true,
    message: 'Elective choices submitted successfully'
  });
});

/**
 * Get user's elective choices (Protected)
 * GET /api/electives/my-choices
 */
const getMyChoices = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT sc.preference_rank, e.*
    FROM student_choices sc
    JOIN electives e ON sc.elective_id = e.id
    WHERE sc.student_id = $1
    ORDER BY sc.preference_rank ASC
  `;

  const result = await query(sql, [userId]);

  res.json({
    success: true,
    data: { choices: result.rows }
  });
});

/**
 * Get user's allocated elective (Protected)
 * GET /api/electives/my-allocation
 */
const getMyAllocation = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT ae.*, e.subject_name, e.description, e.department
    FROM allocated_electives ae
    JOIN electives e ON ae.elective_id = e.id
    WHERE ae.student_id = $1
  `;

  const result = await query(sql, [userId]);

  if (result.rows.length === 0) {
    return res.json({
      success: true,
      message: 'No elective allocated yet',
      data: { allocation: null }
    });
  }

  res.json({
    success: true,
    data: { allocation: result.rows[0] }
  });
});

/**
 * Run elective allocation algorithm (Admin only)
 * POST /api/electives/allocate
 */
const allocateElectives = asyncHandler(async (req, res) => {
  const allocationResults = await transaction(async (client) => {
    // Clear previous allocations
    await client.query('DELETE FROM allocated_electives');

    // Get all students with CGPA sorted (highest first)
    const studentsResult = await client.query(
      'SELECT id, full_name, email, cgpa FROM users WHERE role = $1 AND cgpa IS NOT NULL ORDER BY cgpa DESC',
      ['student']
    );

    const students = studentsResult.rows;

    // Get all electives with available seats
    const electivesResult = await client.query('SELECT id, subject_name, max_students FROM electives');
    
    // Create a map to track available seats
    const electiveSeats = {};
    electivesResult.rows.forEach(e => {
      electiveSeats[e.id] = e.max_students;
    });

    const results = [];

    // Process each student in CGPA order
    for (const student of students) {
      // Get student's preferences in order
      const choicesResult = await client.query(
        'SELECT elective_id FROM student_choices WHERE student_id = $1 ORDER BY preference_rank ASC',
        [student.id]
      );

      let allocated = false;

      // Try to allocate based on preferences
      for (const choice of choicesResult.rows) {
        const electiveId = choice.elective_id;
        
        if (electiveSeats[electiveId] && electiveSeats[electiveId] > 0) {
          // Allocate this elective
          await client.query(
            'INSERT INTO allocated_electives (student_id, elective_id, allocation_round) VALUES ($1, $2, $3)',
            [student.id, electiveId, 1]
          );

          electiveSeats[electiveId]--;
          
          const electiveName = electivesResult.rows.find(e => e.id === electiveId).subject_name;
          
          results.push({
            student_name: student.full_name,
            cgpa: student.cgpa,
            allocated_elective: electiveName,
            preference_rank: choicesResult.rows.indexOf(choice) + 1
          });

          allocated = true;
          break;
        }
      }

      if (!allocated) {
        results.push({
          student_name: student.full_name,
          cgpa: student.cgpa,
          allocated_elective: 'None (No seat available)',
          preference_rank: null
        });
      }
    }

    return results;
  });

  logger.info('Elective allocation completed', { 
    allocatedBy: req.user.id, 
    totalStudents: allocationResults.length 
  });

  res.json({
    success: true,
    message: 'Elective allocation completed successfully',
    data: { allocationResults }
  });
});

module.exports = {
  createElective,
  getAllElectives,
  getElectiveById,
  updateElective,
  deleteElective,
  submitChoices,
  getMyChoices,
  getMyAllocation,
  allocateElectives
};
