const { query, transaction, logger } = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');
const { parseInteger } = require('../../utils/request');
const notificationService = require('../../services/notification.service');
const NO_ALLOCATION_MESSAGE = 'None (No seat available)';

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
    values.push(parseInteger(semester));
    paramCounter++;
  }

  sql += ' ORDER BY subject_name ASC';

  const result = await query(sql, values);
  return result.rows;
};

const getElectiveById = async (id) => {
  const result = await query('SELECT * FROM electives WHERE id = $1', [parseInteger(id)]);

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

  const parsedId = parseInteger(id);
  const result = await query(sql, [subject_name, description, max_students, department, semester, parsedId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Elective not found');
  }

  await processWaitlist({ electiveId: parsedId });

  return result.rows[0];
};

const deleteElective = async (id) => {
  const result = await query('DELETE FROM electives WHERE id = $1 RETURNING id', [parseInteger(id)]);

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
      elective_id: parseInteger(choice.elective_id),
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

const getMyWaitlist = async (userId) => {
  const sql = `
    SELECT
      ew.id,
      ew.elective_id,
      ew.preference_rank,
      ew.status,
      ew.created_at,
      ew.allocated_at,
      e.subject_name,
      e.department,
      e.semester
    FROM elective_waitlist ew
    JOIN electives e ON e.id = ew.elective_id
    WHERE ew.student_id = $1
    ORDER BY ew.status = 'waiting' DESC, ew.preference_rank ASC, ew.created_at ASC
  `;

  const result = await query(sql, [userId]);
  return result.rows;
};

const processWaitlistWithClient = async ({ client, electiveId = null }) => {
  const electiveParams = [];
  let electiveFilterSql = '';

  if (electiveId != null) {
    electiveFilterSql = 'WHERE e.id = $1';
    electiveParams.push(parseInteger(electiveId));
  }

  const electiveCapacitySql = `
    SELECT
      e.id,
      e.subject_name,
      e.max_students - COUNT(ae.id)::int AS seats_available
    FROM electives e
    LEFT JOIN allocated_electives ae ON ae.elective_id = e.id
    ${electiveFilterSql}
    GROUP BY e.id, e.subject_name, e.max_students
    ORDER BY e.id ASC
  `;

  const electivesResult = await client.query(electiveCapacitySql, electiveParams);
  const promotions = [];

  for (const elective of electivesResult.rows) {
    let seatsAvailable = Number(elective.seats_available);
    if (!Number.isFinite(seatsAvailable)) {
      logger.warn('Invalid seats_available value while processing waitlist', {
        electiveId: elective.id,
        seats_available: elective.seats_available,
      });
      continue;
    }

    if (seatsAvailable <= 0) {
      continue;
    }

    const waitlistResult = await client.query(
      `
        SELECT ew.id, ew.student_id, ew.preference_rank, u.full_name, u.email
        FROM elective_waitlist ew
        JOIN users u ON u.id = ew.student_id
        WHERE ew.elective_id = $1 AND ew.status = 'waiting'
        ORDER BY ew.preference_rank ASC, u.cgpa DESC NULLS LAST, ew.created_at ASC
      `,
      [elective.id]
    );

    for (const waitEntry of waitlistResult.rows) {
      if (seatsAvailable <= 0) {
        break;
      }

      const allocationInsert = await client.query(
        `
          INSERT INTO allocated_electives (student_id, elective_id, allocation_round)
          VALUES ($1, $2, $3)
          ON CONFLICT (student_id) DO NOTHING
          RETURNING id
        `,
        [waitEntry.student_id, elective.id, 2]
      );

      if (allocationInsert.rowCount === 0) {
        await client.query(
          `UPDATE elective_waitlist SET status = 'skipped' WHERE id = $1`,
          [waitEntry.id]
        );
        continue;
      }

      await client.query(
        `
          UPDATE elective_waitlist
          SET status = 'allocated', allocated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [waitEntry.id]
      );

      await client.query(
        `
          UPDATE elective_waitlist
          SET status = 'removed'
          WHERE student_id = $1 AND status = 'waiting'
        `,
        [waitEntry.student_id]
      );

      promotions.push({
        student_id: waitEntry.student_id,
        student_name: waitEntry.full_name,
        email: waitEntry.email,
        elective_id: elective.id,
        elective_name: elective.subject_name,
      });

      seatsAvailable -= 1;
    }
  }

  return promotions;
};

const processWaitlist = async ({ electiveId = null } = {}) => {
  const promotions = await transaction(async (client) => {
    return processWaitlistWithClient({ client, electiveId });
  });

  if (promotions.length > 0) {
    await notificationService.createNotificationsForUsers({
      users: promotions.map((entry) => ({
        id: entry.student_id,
        email: entry.email,
      })),
      eventType: 'WAITLIST_PROMOTED',
      title: 'Elective Waitlist Promotion',
      message: 'You have been auto-enrolled from the elective waitlist.',
      metadata: {
        promotions: promotions.map((entry) => ({
          student_id: entry.student_id,
          elective_id: entry.elective_id,
          elective_name: entry.elective_name,
        })),
      },
      sendEmail: true,
    });
  }

  return promotions;
};

const allocateElectives = async () => {
  const payload = await transaction(async (client) => {
    await client.query('DELETE FROM allocated_electives');
    await client.query('DELETE FROM elective_waitlist');

    const studentsResult = await client.query(
      'SELECT id, full_name, email, cgpa FROM users WHERE role = $1 AND cgpa IS NOT NULL ORDER BY cgpa DESC',
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
            student_id: student.id,
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
          student_id: student.id,
          student_name: student.full_name,
          cgpa: student.cgpa,
          allocated_elective: NO_ALLOCATION_MESSAGE,
          preference_rank: null
        });
      }
    }

    for (const resultEntry of results) {
      if (resultEntry.allocated_elective !== NO_ALLOCATION_MESSAGE) {
        continue;
      }

      const student = students.find((item) => item.id === resultEntry.student_id);
      if (!student) {
        continue;
      }

      const choicesResult = await client.query(
        'SELECT elective_id, preference_rank FROM student_choices WHERE student_id = $1 ORDER BY preference_rank ASC',
        [student.id]
      );

      for (const waitChoice of choicesResult.rows) {
        await client.query(
          `
            INSERT INTO elective_waitlist (student_id, elective_id, preference_rank, status)
            VALUES ($1, $2, $3, 'waiting')
            ON CONFLICT (student_id, elective_id) DO NOTHING
          `,
          [student.id, waitChoice.elective_id, waitChoice.preference_rank]
        );
      }
    }

    const promotions = await processWaitlistWithClient({ client });

    return { results, promotions };
  });

  const studentsResult = await query(
    'SELECT id, email FROM users WHERE role = $1 AND is_active = true',
    ['student']
  );

  await notificationService.createNotificationsForUsers({
    users: studentsResult.rows,
    eventType: 'ELECTIVE_ALLOCATION_PUBLISHED',
    title: 'Elective Allocation Updated',
    message: 'Elective allocation results are available. Check your dashboard for allocation and waitlist status.',
    metadata: {
      allocatedCount: payload.results.filter((entry) => entry.preference_rank != null).length,
      waitlistPromotions: payload.promotions.length,
    },
    sendEmail: true,
  });

  return payload.results;
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
  getMyWaitlist,
  processWaitlist,
  allocateElectives
};
