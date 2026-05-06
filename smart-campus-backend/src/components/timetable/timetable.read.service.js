const { query } = require('../../config/db');
const { parseInteger } = require('../../utils/request');

const DAY_ORDER_SQL = `
  CASE ts.day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
  END
`;

/**
 * Whitelisted sort columns per table.
 * Used by the controller to validate the `sort` query parameter.
 */
const ALLOWED_SORT = {
  teachers: ['full_name', 'department', 'created_at'],
  subjects: ['subject_name', 'subject_code', 'department', 'semester', 'created_at'],
  rooms: ['room_name', 'room_code', 'room_type', 'capacity', 'created_at'],
  student_groups: ['group_name', 'group_code', 'department', 'semester', 'created_at'],
};

/**
 * Builds data and count SQL queries for an active-entity listing.
 */
const buildActiveEntityQuery = ({ table, selectClause, defaultOrderBy, filters = [], sort, order, limit, offset }) => {
  const filterValues = [];
  let conditions = 'WHERE is_active = true';

  filters.forEach((filter) => {
    const value = filter.transform ? filter.transform(filter.value) : filter.value;
    if (value != null && value !== '') {
      filterValues.push(value);
      conditions += ` AND ${filter.column} = $${filterValues.length}`;
    }
  });

  const sortField = sort || defaultOrderBy;
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const countSql = `SELECT COUNT(*) FROM ${table} ${conditions}`;

  const limitIdx = filterValues.length + 1;
  const offsetIdx = filterValues.length + 2;
  const cols = selectClause || '*';
  const dataSql = `SELECT ${cols} FROM ${table} ${conditions} ORDER BY ${sortField} ${sortOrder} LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const dataValues = [...filterValues, limit, offset];

  return { dataSql, countSql, filterValues, dataValues };
};

/**
 * List teachers (v2.0 — queries `users` table WHERE role = 'faculty')
 */
const listTeachers = async ({ department, sort, order, limit, offset }) => {
  const filterValues = [];
  let conditions = "WHERE role = 'faculty' AND is_active = true";

  if (department) {
    filterValues.push(department);
    conditions += ` AND department = $${filterValues.length}`;
  }

  const sortField = sort || 'full_name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const countSql = `SELECT COUNT(*) FROM users ${conditions}`;

  const limitIdx = filterValues.length + 1;
  const offsetIdx = filterValues.length + 2;
  const dataSql = `
    SELECT id, full_name, email, department, is_active,
           metadata->>'teacher_code' AS teacher_code,
           metadata->>'phone' AS phone,
           created_at, updated_at
    FROM users ${conditions}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;
  const dataValues = [...filterValues, limit, offset];

  const [dataResult, countResult] = await Promise.all([
    query(dataSql, dataValues),
    query(countSql, filterValues),
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) };
};

const listSubjects = async ({ department, semester, sort, order, limit, offset }) => {
  const { dataSql, countSql, filterValues, dataValues } = buildActiveEntityQuery({
    table: 'subjects',
    defaultOrderBy: 'subject_name',
    filters: [
      { column: 'department', value: department },
      { column: 'semester', value: semester, transform: parseInteger },
    ],
    sort,
    order,
    limit,
    offset,
  });

  const [dataResult, countResult] = await Promise.all([
    query(dataSql, dataValues),
    query(countSql, filterValues),
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) };
};

const listRooms = async ({ room_type, sort, order, limit, offset }) => {
  const { dataSql, countSql, filterValues, dataValues } = buildActiveEntityQuery({
    table: 'rooms',
    defaultOrderBy: 'room_name',
    filters: [{ column: 'room_type', value: room_type }],
    sort,
    order,
    limit,
    offset,
  });

  const [dataResult, countResult] = await Promise.all([
    query(dataSql, dataValues),
    query(countSql, filterValues),
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) };
};

const listGroups = async ({ department, semester, sort, order, limit, offset }) => {
  const { dataSql, countSql, filterValues, dataValues } = buildActiveEntityQuery({
    table: 'student_groups',
    defaultOrderBy: 'group_name',
    filters: [
      { column: 'department', value: department },
      { column: 'semester', value: semester, transform: parseInteger },
    ],
    sort,
    order,
    limit,
    offset,
  });

  const [dataResult, countResult] = await Promise.all([
    query(dataSql, dataValues),
    query(countSql, filterValues),
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) };
};

/**
 * Get timetable for a group (v2.0 — teacher data from `users` table)
 */
const getGroupTimetable = async ({ groupId, academic_year, semester_type }) => {
  const sql = `
    SELECT
      ts.id,
      ts.day_of_week,
      ts.period_number,
      s.subject_name,
      s.subject_code,
      u.full_name as teacher_name,
      u.metadata->>'teacher_code' as teacher_code,
      r.room_name,
      r.room_code
    FROM timetable_slots ts
    JOIN subjects s ON ts.subject_id = s.id
    JOIN users u ON ts.teacher_id = u.id
    JOIN rooms r ON ts.room_id = r.id
    WHERE ts.group_id = $1
      AND ts.is_active = true
      ${academic_year ? 'AND ts.academic_year = $2' : ''}
      ${semester_type ? `AND ts.semester_type = $${academic_year ? 3 : 2}` : ''}
    ORDER BY
      ${DAY_ORDER_SQL},
      ts.period_number ASC
  `;

  const values = [groupId];
  if (academic_year) values.push(academic_year);
  if (semester_type) values.push(semester_type);

  const result = await query(sql, values);
  return result.rows;
};

/**
 * Get timetable for a teacher (v2.0 — teacher is a user)
 */
const getTeacherTimetable = async ({ teacherId }) => {
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
      ${DAY_ORDER_SQL},
      ts.period_number ASC
  `;

  const result = await query(sql, [teacherId]);
  return result.rows;
};

/**
 * Get config data (v2.0 — teachers from users table)
 */
const getConfigData = async () => {
  const [groupsResult, teachersResult, subjectsResult, roomsResult] = await Promise.all([
    query('SELECT id, group_code, group_name, department, semester FROM student_groups WHERE is_active = true'),
    query("SELECT id, metadata->>'teacher_code' as teacher_code, full_name, department FROM users WHERE role = 'faculty' AND is_active = true"),
    query('SELECT id, subject_code, subject_name, course_type, hours_per_week FROM subjects WHERE is_active = true'),
    query('SELECT id, room_code, room_name, room_type, capacity FROM rooms WHERE is_active = true')
  ]);

  return {
    groups: groupsResult.rows,
    teachers: teachersResult.rows,
    subjects: subjectsResult.rows,
    rooms: roomsResult.rows
  };
};

module.exports = {
  ALLOWED_SORT,
  listTeachers,
  listSubjects,
  listRooms,
  listGroups,
  getGroupTimetable,
  getTeacherTimetable,
  getConfigData
};
