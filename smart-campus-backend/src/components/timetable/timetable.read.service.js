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
  teachers: ['full_name', 'department', 'teacher_code', 'created_at'],
  subjects: ['subject_name', 'subject_code', 'department', 'semester', 'created_at'],
  rooms: ['room_name', 'room_code', 'room_type', 'capacity', 'created_at'],
  student_groups: ['group_name', 'group_code', 'department', 'semester', 'created_at'],
};

/**
 * Builds data and count SQL queries for an active-entity listing.
 * Returns separate value arrays for the count and data queries.
 *
 * @param {object} opts
 * @param {string}   opts.table          - Table name
 * @param {string}   opts.defaultOrderBy - Column used when no `sort` is supplied
 * @param {Array}    opts.filters        - [{ column, value, transform? }]
 * @param {string}   [opts.sort]         - Pre-validated sort column
 * @param {string}   [opts.order]        - 'asc' | 'desc'
 * @param {number}   opts.limit
 * @param {number}   opts.offset
 */
const buildActiveEntityQuery = ({ table, defaultOrderBy, filters = [], sort, order, limit, offset }) => {
  const filterValues = [];
  let conditions = `WHERE is_active = true`;

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
  const dataSql = `SELECT * FROM ${table} ${conditions} ORDER BY ${sortField} ${sortOrder} LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const dataValues = [...filterValues, limit, offset];

  return { dataSql, countSql, filterValues, dataValues };
};

const listTeachers = async ({ department, sort, order, limit, offset }) => {
  const { dataSql, countSql, filterValues, dataValues } = buildActiveEntityQuery({
    table: 'teachers',
    defaultOrderBy: 'full_name',
    filters: [{ column: 'department', value: department }],
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

const getGroupTimetable = async ({ groupId, academic_year, semester_type }) => {
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
      ${DAY_ORDER_SQL},
      ts.period_number ASC
  `;

  const values = [groupId];
  if (academic_year) values.push(academic_year);
  if (semester_type) values.push(semester_type);

  const result = await query(sql, values);
  return result.rows;
};

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

const getConfigData = async () => {
  const [groupsResult, teachersResult, subjectsResult, roomsResult] = await Promise.all([
    query('SELECT id, group_code, group_name, department, semester FROM student_groups WHERE is_active = true'),
    query('SELECT id, teacher_code, full_name, department FROM teachers WHERE is_active = true'),
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
