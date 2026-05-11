const { query } = require('../../config/db');

/**
 * Teacher Model (v2.0)
 * Teachers are now stored in the `users` table with role = 'faculty'.
 * Faculty-specific fields (teacher_code, phone) live in users.metadata JSONB.
 */
class Teacher {
  static async findById(id) {
    const result = await query(
      `SELECT id, full_name, email, department, is_active,
              metadata->>'teacher_code' AS teacher_code,
              metadata->>'phone' AS phone,
              created_at, updated_at
       FROM users
       WHERE id = $1 AND role = 'faculty' AND is_active = true`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      `SELECT id, full_name, email, department, is_active,
              metadata->>'teacher_code' AS teacher_code,
              metadata->>'phone' AS phone,
              created_at, updated_at
       FROM users
       WHERE role = 'faculty' AND is_active = true
       ORDER BY full_name`
    );
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
    const metadata = { teacher_code, phone: phone || null, auth_provider: 'local' };

    const result = await query(
      `INSERT INTO users (full_name, email, department, role, metadata)
       VALUES ($1, $2, $3, 'faculty', $4)
       RETURNING id, full_name, email, department, is_active,
                 metadata->>'teacher_code' AS teacher_code,
                 metadata->>'phone' AS phone,
                 created_at, updated_at`,
      [full_name, email, department, JSON.stringify(metadata)]
    );
    return result.rows[0];
  }
}

/**
 * Subject Model (v2.0)
 * Scheduling hints (requires_consecutive, max_periods_per_day) now live in scheduling JSONB.
 */
class Subject {
  static async findById(id) {
    const result = await query(
      `SELECT id, subject_code, subject_name, hours_per_week, course_type,
              department, semester, is_active,
              COALESCE((scheduling->>'requires_consecutive')::boolean, false) AS requires_consecutive_periods,
              COALESCE((scheduling->>'max_periods_per_day')::int, 2) AS max_periods_per_day,
              created_at, updated_at
       FROM subjects WHERE id = $1 AND is_active = true`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      `SELECT id, subject_code, subject_name, hours_per_week, course_type,
              department, semester, is_active,
              COALESCE((scheduling->>'requires_consecutive')::boolean, false) AS requires_consecutive_periods,
              COALESCE((scheduling->>'max_periods_per_day')::int, 2) AS max_periods_per_day,
              created_at, updated_at
       FROM subjects WHERE is_active = true ORDER BY subject_name`
    );
    return result.rows;
  }

  static async getSubjectTeachers(subjectId) {
    const result = await query(
      `SELECT u.id, u.full_name, u.email, u.department, u.is_active,
              u.metadata->>'teacher_code' AS teacher_code,
              u.metadata->>'phone' AS phone
       FROM users u
       JOIN teacher_subject_assignments tsa ON u.id = tsa.teacher_id
       WHERE tsa.subject_id = $1 AND u.is_active = true AND tsa.is_active = true
       ORDER BY tsa.priority ASC, u.full_name`,
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
 * Room Model (v2.0)
 * Amenities (has_projector, has_computer, floor_number, building) now live in amenities JSONB.
 */
class Room {
  static async findById(id) {
    const result = await query(
      `SELECT id, room_code, room_name, capacity, room_type, is_active,
              COALESCE((amenities->>'has_projector')::boolean, false) AS has_projector,
              COALESCE((amenities->>'has_computer')::boolean, false) AS has_computer,
              (amenities->>'floor_number')::int AS floor_number,
              amenities->>'building' AS building,
              created_at, updated_at
       FROM rooms WHERE id = $1 AND is_active = true`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      `SELECT id, room_code, room_name, capacity, room_type, is_active,
              COALESCE((amenities->>'has_projector')::boolean, false) AS has_projector,
              COALESCE((amenities->>'has_computer')::boolean, false) AS has_computer,
              (amenities->>'floor_number')::int AS floor_number,
              amenities->>'building' AS building,
              created_at, updated_at
       FROM rooms WHERE is_active = true ORDER BY room_name`
    );
    return result.rows;
  }

  static async findSuitableRooms(courseType, requiredCapacity) {
    let sql = `SELECT id, room_code, room_name, capacity, room_type, is_active,
                      COALESCE((amenities->>'has_projector')::boolean, false) AS has_projector,
                      COALESCE((amenities->>'has_computer')::boolean, false) AS has_computer,
                      (amenities->>'floor_number')::int AS floor_number,
                      amenities->>'building' AS building
               FROM rooms WHERE is_active = true AND capacity >= $1`;
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
    const { room_code, room_name, capacity, room_type, floor_number, building, has_projector, has_computer } = roomData;
    const amenities = {
      has_projector: has_projector || false,
      has_computer: has_computer || false,
      floor_number: floor_number || null,
      building: building || null
    };

    const result = await query(
      `INSERT INTO rooms (room_code, room_name, capacity, room_type, amenities)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, room_code, room_name, capacity, room_type, is_active,
                 COALESCE((amenities->>'has_projector')::boolean, false) AS has_projector,
                 COALESCE((amenities->>'has_computer')::boolean, false) AS has_computer,
                 (amenities->>'floor_number')::int AS floor_number,
                 amenities->>'building' AS building,
                 created_at, updated_at`,
      [room_code, room_name, capacity, room_type, JSON.stringify(amenities)]
    );
    return result.rows[0];
  }
}

/**
 * StudentGroup Model (v2.0 — unchanged structure, just UUID PKs)
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
      `SELECT s.id, s.subject_code, s.subject_name, s.hours_per_week, s.course_type,
              s.department, s.semester, s.is_active,
              COALESCE((s.scheduling->>'requires_consecutive')::boolean, false) AS requires_consecutive_periods,
              COALESCE((s.scheduling->>'max_periods_per_day')::int, 2) AS max_periods_per_day
       FROM subjects s
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
 * TimetableSlot Model (v2.0)
 * teacher_id now references users.id instead of the old teachers.id
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
