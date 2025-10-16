const { query } = require('../../config/db');

/**
 * Teacher Model
 */
class Teacher {
  static async findById(id) {
    const result = await query('SELECT * FROM teachers WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM teachers WHERE is_active = true ORDER BY full_name');
    return result.rows;
  }

  static async getUnavailability(teacherId) {
    const result = await query(
      `SELECT * FROM teacher_unavailability 
       WHERE teacher_id = $1 
       AND (is_permanent = true OR (start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE))`,
      [teacherId]
    );
    return result.rows;
  }

  static async create(teacherData) {
    const { teacher_code, full_name, department, email, phone } = teacherData;
    const result = await query(
      `INSERT INTO teachers (teacher_code, full_name, department, email, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [teacher_code, full_name, department, email, phone]
    );
    return result.rows[0];
  }
}

/**
 * Subject Model
 */
class Subject {
  static async findById(id) {
    const result = await query('SELECT * FROM subjects WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM subjects WHERE is_active = true ORDER BY subject_name');
    return result.rows;
  }

  static async getSubjectTeachers(subjectId) {
    const result = await query(
      `SELECT t.* FROM teachers t
       JOIN teacher_subject_assignments tsa ON t.id = tsa.teacher_id
       WHERE tsa.subject_id = $1 AND t.is_active = true AND tsa.is_active = true
       ORDER BY tsa.priority ASC, t.full_name`,
      [subjectId]
    );
    return result.rows;
  }

  static async create(subjectData) {
    const { subject_code, subject_name, hours_per_week, course_type, department, semester } = subjectData;
    const result = await query(
      `INSERT INTO subjects (subject_code, subject_name, hours_per_week, course_type, department, semester)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [subject_code, subject_name, hours_per_week, course_type, department, semester]
    );
    return result.rows[0];
  }
}

/**
 * Room Model
 */
class Room {
  static async findById(id) {
    const result = await query('SELECT * FROM rooms WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM rooms WHERE is_active = true ORDER BY room_name');
    return result.rows;
  }

  static async findSuitableRooms(courseType, requiredCapacity) {
    let sql = 'SELECT * FROM rooms WHERE is_active = true AND capacity >= $1';
    const params = [requiredCapacity];

    if (courseType === 'Lab' || courseType === 'Practical') {
      sql += ' AND room_type = $2';
      params.push('Lab');
    }

    sql += ' ORDER BY capacity ASC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async create(roomData) {
    const { room_code, room_name, capacity, room_type, floor_number, building } = roomData;
    const result = await query(
      `INSERT INTO rooms (room_code, room_name, capacity, room_type, floor_number, building)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [room_code, room_name, capacity, room_type, floor_number, building]
    );
    return result.rows[0];
  }
}

/**
 * StudentGroup Model
 */
class StudentGroup {
  static async findById(id) {
    const result = await query('SELECT * FROM student_groups WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM student_groups WHERE is_active = true ORDER BY group_name');
    return result.rows;
  }

  static async getGroupSubjects(groupId) {
    const result = await query(
      `SELECT s.* FROM subjects s
       JOIN subject_class_assignments sca ON s.id = sca.subject_id
       WHERE sca.group_id = $1 AND s.is_active = true AND sca.is_active = true
       ORDER BY s.subject_name`,
      [groupId]
    );
    return result.rows;
  }

  static async create(groupData) {
    const { group_code, group_name, strength, department, semester, academic_year } = groupData;
    const result = await query(
      `INSERT INTO student_groups (group_code, group_name, strength, department, semester, academic_year)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [group_code, group_name, strength, department, semester, academic_year]
    );
    return result.rows[0];
  }
}

/**
 * TimetableSlot Model
 */
class TimetableSlot {
  static async create(slotData) {
    const { day_of_week, period_number, teacher_id, subject_id, group_id, room_id, academic_year, semester_type } = slotData;
    const result = await query(
      `INSERT INTO timetable_slots 
       (day_of_week, period_number, teacher_id, subject_id, group_id, room_id, academic_year, semester_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [day_of_week, period_number, teacher_id, subject_id, group_id, room_id, academic_year, semester_type]
    );
    return result.rows[0];
  }

  static async clearTimetable(academic_year, semester_type) {
    await query(
      'DELETE FROM timetable_slots WHERE academic_year = $1 AND semester_type = $2',
      [academic_year, semester_type]
    );
  }

  static async findByGroup(groupId, academic_year = null, semester_type = null) {
    let sql = 'SELECT * FROM timetable_slots WHERE group_id = $1 AND is_active = true';
    const params = [groupId];
    
    if (academic_year) {
      params.push(academic_year);
      sql += ` AND academic_year = $${params.length}`;
    }
    
    if (semester_type) {
      params.push(semester_type);
      sql += ` AND semester_type = $${params.length}`;
    }
    
    const result = await query(sql, params);
    return result.rows;
  }

  static async findByTeacher(teacherId) {
    const result = await query(
      'SELECT * FROM timetable_slots WHERE teacher_id = $1 AND is_active = true',
      [teacherId]
    );
    return result.rows;
  }
}

module.exports = {
  Teacher,
  Subject,
  Room,
  StudentGroup,
  TimetableSlot
};
