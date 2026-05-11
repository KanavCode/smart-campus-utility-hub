const { query, transaction } = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

/**
 * Elective Service (v2.0 — UUID-based)
 * All IDs are now UUIDs. Removed parseInteger calls.
 */

const createElective = async ({ subject_name, description, max_students, department, semester }) => {
  const sql = `
    INSERT INTO electives (subject_name, description, max_students, department, semester)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await query(sql, [subject_name, description, max_students || 50, department, semester]);
  return result.rows[0];
};

const listElectives = async ({ department, semester }) => {
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
  return result.rows;
};

const getElectiveById = async (id) => {
  const result = await query('SELECT * FROM electives WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Elective not found');
  }

  return result.rows[0];
};

const updateElective = async (id, { subject_name, description, max_students, department, semester }) => {
  const sql = `
    UPDATE electives
    SET subject_name = $1, description = $2, max_students = $3, department = $4, semester = $5
    WHERE id = $6
    RETURNING *
  `;

  const result = await query(sql, [subject_name, description, max_students, department, semester, id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Elective not found');
  }

  return result.rows[0];
};

const deleteElective = async (id) => {
  const result = await query('DELETE FROM electives WHERE id = $1 RETURNING id', [id]);

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Elective not found');
  }

  return result.rows[0];
};

const submitChoices = async ({ choices, userId }) => {
  const allChoicesUseIds = choices.every((choice) => choice.elective_id != null);
  let normalizedChoices = [];

  if (allChoicesUseIds) {
    normalizedChoices = choices.map((choice) => ({
      elective_id: choice.elective_id,
      preference_rank: choice.preference_rank,
      subject_name: choice.subject_name
    }));
  } else {
    const electivesResult = await query('SELECT id, subject_name FROM electives');
    const subjectToId = {};
    const validElectiveIds = new Set();

    electivesResult.rows.forEach((elective) => {
      subjectToId[elective.subject_name] = elective.id;
      validElectiveIds.add(elective.id);
    });

    normalizedChoices = choices.map((choice) => {
      const electiveId = choice.elective_id || subjectToId[choice.subject_name];
      return {
        elective_id: electiveId,
        preference_rank: choice.preference_rank,
        subject_name: choice.subject_name
      };
    });

    const invalidChoices = normalizedChoices.filter((choice) => !validElectiveIds.has(choice.elective_id));
    if (invalidChoices.length > 0) {
      return { success: false, message: 'Invalid electives in choices submission' };
    }
  }

  await transaction(async (client) => {
    await client.query('DELETE FROM student_choices WHERE student_id = $1', [userId]);

    for (const choice of normalizedChoices) {
      await client.query(
        'INSERT INTO student_choices (student_id, elective_id, preference_rank) VALUES ($1, $2, $3)',
        [userId, choice.elective_id, choice.preference_rank]
      );
    }
  });

  return { success: true };
};

const getMyChoices = async (userId) => {
  const sql = `
    SELECT sc.preference_rank, e.*
    FROM student_choices sc
    JOIN electives e ON sc.elective_id = e.id
    WHERE sc.student_id = $1
    ORDER BY sc.preference_rank ASC
  `;

  const result = await query(sql, [userId]);
  return result.rows;
};

const getMyAllocation = async (userId) => {
  const sql = `
    SELECT ae.*, e.subject_name, e.description, e.department
    FROM allocated_electives ae
    JOIN electives e ON ae.elective_id = e.id
    WHERE ae.student_id = $1
  `;

  const result = await query(sql, [userId]);
  return result.rows[0] || null;
};

const allocateElectives = async () => {
  return transaction(async (client) => {
    await client.query('DELETE FROM allocated_electives');

    const studentsResult = await client.query(
      `SELECT id, full_name, email, metadata->>'cgpa' AS cgpa
       FROM users
       WHERE role = $1 AND metadata->>'cgpa' IS NOT NULL
       ORDER BY (metadata->>'cgpa')::decimal DESC`,
      ['student']
    );

    const students = studentsResult.rows;
    const electivesResult = await client.query('SELECT id, subject_name, max_students FROM electives');

    const electiveSeats = {};
    electivesResult.rows.forEach((elective) => {
      electiveSeats[elective.id] = elective.max_students;
    });

    const results = [];

    for (const student of students) {
      const choicesResult = await client.query(
        'SELECT elective_id FROM student_choices WHERE student_id = $1 ORDER BY preference_rank ASC',
        [student.id]
      );

      let allocated = false;

      for (const choice of choicesResult.rows) {
        const electiveId = choice.elective_id;

        if (electiveSeats[electiveId] && electiveSeats[electiveId] > 0) {
          await client.query(
            'INSERT INTO allocated_electives (student_id, elective_id, allocation_round) VALUES ($1, $2, $3)',
            [student.id, electiveId, 1]
          );

          electiveSeats[electiveId]--;

          const electiveName = electivesResult.rows.find((elective) => elective.id === electiveId).subject_name;

          results.push({
            student_name: student.full_name,
            cgpa: parseFloat(student.cgpa),
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
          cgpa: parseFloat(student.cgpa),
          allocated_elective: 'None (No seat available)',
          preference_rank: null
        });
      }
    }

    return results;
  });
};

module.exports = {
  createElective,
  listElectives,
  getElectiveById,
  updateElective,
  deleteElective,
  submitChoices,
  getMyChoices,
  getMyAllocation,
  allocateElectives
};
