const { pool } = require('../../config/db');

class Teacher {
  static async create(teacherData) {
    const { teacher_code, full_name, department, email, phone } = teacherData;
    
    const query = `
      INSERT INTO teachers (teacher_code, full_name, department, email, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [teacher_code, full_name, department, email, phone]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM teachers WHERE is_active = true ORDER BY teacher_code';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM teachers WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByCode(teacher_code) {
    const query = 'SELECT * FROM teachers WHERE teacher_code = $1 AND is_active = true';
    const result = await pool.query(query, [teacher_code]);
    return result.rows[0];
  }

  static async getTeacherSubjects(teacherId) {
    const query = `
      SELECT s.*, tsa.priority 
      FROM subjects s
      JOIN teacher_subject_assignments tsa ON s.id = tsa.subject_id
      WHERE tsa.teacher_id = $1 AND tsa.is_active = true AND s.is_active = true
      ORDER BY tsa.priority, s.subject_code
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }

  static async getUnavailability(teacherId) {
    const query = `
      SELECT * FROM teacher_unavailability 
      WHERE teacher_id = $1 
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      ORDER BY day_of_week, period_number
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }
}

class Subject {
  static async create(subjectData) {
    const { 
      subject_code, subject_name, hours_per_week, course_type, 
      department, semester, requires_consecutive_periods, max_periods_per_day 
    } = subjectData;
    
    const query = `
      INSERT INTO subjects (
        subject_code, subject_name, hours_per_week, course_type, 
        department, semester, requires_consecutive_periods, max_periods_per_day
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      subject_code, subject_name, hours_per_week, course_type,
      department, semester, requires_consecutive_periods, max_periods_per_day
    ]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM subjects WHERE is_active = true ORDER BY subject_code';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM subjects WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getSubjectTeachers(subjectId) {
    const query = `
      SELECT t.*, tsa.priority 
      FROM teachers t
      JOIN teacher_subject_assignments tsa ON t.id = tsa.teacher_id
      WHERE tsa.subject_id = $1 AND tsa.is_active = true AND t.is_active = true
      ORDER BY tsa.priority, t.teacher_code
    `;
    const result = await pool.query(query, [subjectId]);
    return result.rows;
  }
}

class Room {
  static async create(roomData) {
    const { 
      room_code, room_name, capacity, room_type, 
      floor_number, building, has_projector, has_computer 
    } = roomData;
    
    const query = `
      INSERT INTO rooms (
        room_code, room_name, capacity, room_type, 
        floor_number, building, has_projector, has_computer
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      room_code, room_name, capacity, room_type,
      floor_number, building, has_projector, has_computer
    ]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM rooms WHERE is_active = true ORDER BY room_code';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM rooms WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findSuitableRooms(courseType, requiredCapacity) {
    let query = `
      SELECT * FROM rooms 
      WHERE is_active = true AND capacity >= $1
    `;
    const params = [requiredCapacity];

    if (courseType === 'Lab' || courseType === 'Practical') {
      query += ` AND room_type = 'Lab'`;
    } else {
      query += ` AND room_type IN ('Classroom', 'Auditorium', 'Seminar_Hall')`;
    }

    query += ' ORDER BY capacity ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

class StudentGroup {
  static async create(groupData) {
    const { 
      group_code, group_name, strength, department, 
      semester, academic_year 
    } = groupData;
    
    const query = `
      INSERT INTO student_groups (
        group_code, group_name, strength, department, semester, academic_year
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      group_code, group_name, strength, department, semester, academic_year
    ]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM student_groups WHERE is_active = true ORDER BY group_code';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM student_groups WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getGroupSubjects(groupId) {
    const query = `
      SELECT s.* 
      FROM subjects s
      JOIN subject_class_assignments sca ON s.id = sca.subject_id
      WHERE sca.group_id = $1 AND sca.is_active = true AND s.is_active = true
      ORDER BY s.subject_code
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows;
  }
}

class TimetableSlot {
  static async create(slotData) {
    const {
      day_of_week, period_number, teacher_id, subject_id,
      group_id, room_id, academic_year, semester_type
    } = slotData;

    const query = `
      INSERT INTO timetable_slots (
        day_of_week, period_number, teacher_id, subject_id,
        group_id, room_id, academic_year, semester_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      day_of_week, period_number, teacher_id, subject_id,
      group_id, room_id, academic_year, semester_type
    ]);
    return result.rows[0];
  }

  static async findByFilters(filters) {
    let query = 'SELECT * FROM timetable_slots WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filters.academic_year) {
      paramCount++;
      query += ` AND academic_year = $${paramCount}`;
      params.push(filters.academic_year);
    }

    if (filters.semester_type) {
      paramCount++;
      query += ` AND semester_type = $${paramCount}`;
      params.push(filters.semester_type);
    }

    if (filters.group_id) {
      paramCount++;
      query += ` AND group_id = $${paramCount}`;
      params.push(filters.group_id);
    }

    query += ' ORDER BY day_of_week, period_number';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async clearTimetable(academic_year, semester_type) {
    const query = `
      DELETE FROM timetable_slots 
      WHERE academic_year = $1 AND semester_type = $2
    `;
    await pool.query(query, [academic_year, semester_type]);
  }

  static async getFullTimetable(academic_year, semester_type) {
    const query = `
      SELECT 
        ts.*,
        t.full_name as teacher_name,
        t.teacher_code,
        s.subject_name,
        s.subject_code,
        sg.group_name,
        sg.group_code,
        r.room_name,
        r.room_code
      FROM timetable_slots ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN student_groups sg ON ts.group_id = sg.id
      JOIN rooms r ON ts.room_id = r.id
      WHERE ts.academic_year = $1 AND ts.semester_type = $2
      ORDER BY ts.day_of_week, ts.period_number, sg.group_code
    `;
    
    const result = await pool.query(query, [academic_year, semester_type]);
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