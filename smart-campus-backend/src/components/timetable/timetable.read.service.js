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

const buildActiveEntityQuery = ({ table, orderBy, filters = [] }) => {
  const values = [];
  let sql = `SELECT * FROM ${table} WHERE is_active = true`;

  filters.forEach((filter) => {
    const value = filter.transform ? filter.transform(filter.value) : filter.value;
    if (value != null && value !== '') {
      values.push(value);
      sql += ` AND ${filter.column} = $${values.length}`;
    }
  });

  sql += ` ORDER BY ${orderBy} ASC`;

  return { sql, values };
};

const listTeachers = async ({ department }) => {
  const { sql, values } = buildActiveEntityQuery({
    table: 'teachers',
    orderBy: 'full_name',
    filters: [{ column: 'department', value: department }]
  });

  const result = await query(sql, values);
  return result.rows;
};

const listSubjects = async ({ department, semester }) => {
  const { sql, values } = buildActiveEntityQuery({
    table: 'subjects',
    orderBy: 'subject_name',
    filters: [
      { column: 'department', value: department },
      { column: 'semester', value: semester, transform: parseInteger }
    ]
  });

  const result = await query(sql, values);
  return result.rows;
};

const listRooms = async ({ room_type }) => {
  const { sql, values } = buildActiveEntityQuery({
    table: 'rooms',
    orderBy: 'room_name',
    filters: [{ column: 'room_type', value: room_type }]
  });

  const result = await query(sql, values);
  return result.rows;
};

const listGroups = async ({ department, semester }) => {
  const { sql, values } = buildActiveEntityQuery({
    table: 'student_groups',
    orderBy: 'group_name',
    filters: [
      { column: 'department', value: department },
      { column: 'semester', value: semester, transform: parseInteger }
    ]
  });

  const result = await query(sql, values);
  return result.rows;
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
  listTeachers,
  listSubjects,
  listRooms,
  listGroups,
  getGroupTimetable,
  getTeacherTimetable,
  getConfigData
};
