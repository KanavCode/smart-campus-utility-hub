const db = require('../config/db');
const generationService = require('../services/generationService');

/**
 * Generate a new timetable
 */
exports.generateTimetable = async (req, res, next) => {
  try {
    console.log('🔄 Starting timetable generation...');

    // Fetch all required data from database
    const [teachers, subjects, classes, classrooms, constraints, classSubjects] = await Promise.all([
      db.query('SELECT * FROM teachers ORDER BY id'),
      db.query('SELECT * FROM subjects ORDER BY id'),
      db.query('SELECT * FROM classes ORDER BY id'),
      db.query('SELECT * FROM classrooms ORDER BY id'),
      db.query('SELECT * FROM constraints ORDER BY id'),
      db.query(`
        SELECT csm.*, c.name as class_name, s.name as subject_name, s.code as subject_code
        FROM class_subject_map csm
        JOIN classes c ON csm.class_id = c.id
        JOIN subjects s ON csm.subject_id = s.id
        ORDER BY csm.class_id, csm.subject_id
      `)
    ]);

    // Validate that we have all required data
    if (teachers.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No teachers found. Please add teachers before generating timetable.'
      });
    }

    if (subjects.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No subjects found. Please add subjects before generating timetable.'
      });
    }

    if (classes.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No classes found. Please add classes before generating timetable.'
      });
    }

    if (classrooms.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No classrooms found. Please add classrooms before generating timetable.'
      });
    }

    if (classSubjects.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No class-subject mappings found. Please map subjects to classes before generating timetable.'
      });
    }

    // Prepare data for generation service
    const data = {
      teachers: teachers.rows,
      subjects: subjects.rows,
      classes: classes.rows,
      classrooms: classrooms.rows,
      constraints: constraints.rows,
      classSubjects: classSubjects.rows,
      config: {
        workingDays: 5, // Monday to Friday
        periodsPerDay: 8 // 8 periods per day
      }
    };

    console.log(`📊 Data summary:
      - Teachers: ${data.teachers.length}
      - Subjects: ${data.subjects.length}
      - Classes: ${data.classes.length}
      - Classrooms: ${data.classrooms.length}
      - Class-Subject mappings: ${data.classSubjects.length}`);

    // Generate timetable using the generation service
    const timetableSlots = generationService.run(data);

    if (!timetableSlots || timetableSlots.length === 0) {
      return res.status(409).json({
        status: 'fail',
        message: 'Could not generate a valid timetable with the given constraints. Please check your data and try again.'
      });
    }

    console.log(`✅ Generated ${timetableSlots.length} timetable slots`);

    // Save the generated timetable to database using transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Clear existing timetable
      await client.query('DELETE FROM timetable_slots');
      console.log('🗑️  Cleared existing timetable');

      // Insert new timetable slots
      const insertPromises = timetableSlots.map(slot => {
        const query = `
          INSERT INTO timetable_slots (day_of_week, period_number, class_id, subject_id, teacher_id, classroom_id) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        return client.query(query, [
          slot.day,
          slot.period,
          slot.class_id,
          slot.subject_id,
          slot.teacher_id,
          slot.classroom_id
        ]);
      });

      await Promise.all(insertPromises);
      await client.query('COMMIT');
      console.log('💾 Saved timetable to database');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error saving timetable:', error);
      throw error;
    } finally {
      client.release();
    }

    res.status(201).json({
      status: 'success',
      message: 'Timetable generated and saved successfully!',
      data: {
        totalSlots: timetableSlots.length,
        schedule: timetableSlots
      }
    });

  } catch (error) {
    console.error('🔥 Error generating timetable:', error);
    next(error);
  }
};

/**
 * Get timetable for a specific class
 */
exports.getClassTimetable = async (req, res, next) => {
  try {
    const { classId } = req.params;

    if (!classId || isNaN(classId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid class ID.'
      });
    }

    const query = `
      SELECT 
        ts.*,
        c.name as class_name,
        s.name as subject_name,
        s.code as subject_code,
        t.name as teacher_name,
        cr.room_number,
        cr.type as room_type
      FROM timetable_slots ts
      JOIN classes c ON ts.class_id = c.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN classrooms cr ON ts.classroom_id = cr.id
      WHERE ts.class_id = $1
      ORDER BY ts.day_of_week, ts.period_number
    `;

    const { rows } = await db.query(query, [classId]);

    // Organize timetable by days and periods
    const timetable = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    days.forEach((day, index) => {
      timetable[day] = {};
      for (let period = 1; period <= 8; period++) {
        timetable[day][`Period ${period}`] = null;
      }
    });

    rows.forEach(slot => {
      const dayName = days[slot.day_of_week - 1];
      const periodName = `Period ${slot.period_number}`;
      
      timetable[dayName][periodName] = {
        id: slot.id,
        subject: slot.subject_name,
        subjectCode: slot.subject_code,
        teacher: slot.teacher_name,
        classroom: slot.room_number,
        roomType: slot.room_type
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        classId: parseInt(classId),
        className: rows.length > 0 ? rows[0].class_name : null,
        timetable
      }
    });

  } catch (error) {
    console.error('Error fetching class timetable:', error);
    next(error);
  }
};

/**
 * Get timetable for a specific teacher
 */
exports.getTeacherTimetable = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId || isNaN(teacherId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid teacher ID.'
      });
    }

    const query = `
      SELECT 
        ts.*,
        c.name as class_name,
        s.name as subject_name,
        s.code as subject_code,
        t.name as teacher_name,
        cr.room_number,
        cr.type as room_type
      FROM timetable_slots ts
      JOIN classes c ON ts.class_id = c.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN classrooms cr ON ts.classroom_id = cr.id
      WHERE ts.teacher_id = $1
      ORDER BY ts.day_of_week, ts.period_number
    `;

    const { rows } = await db.query(query, [teacherId]);

    // Organize timetable by days and periods
    const timetable = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    days.forEach((day, index) => {
      timetable[day] = {};
      for (let period = 1; period <= 8; period++) {
        timetable[day][`Period ${period}`] = null;
      }
    });

    rows.forEach(slot => {
      const dayName = days[slot.day_of_week - 1];
      const periodName = `Period ${slot.period_number}`;
      
      timetable[dayName][periodName] = {
        id: slot.id,
        subject: slot.subject_name,
        subjectCode: slot.subject_code,
        class: slot.class_name,
        classroom: slot.room_number,
        roomType: slot.room_type
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        teacherId: parseInt(teacherId),
        teacherName: rows.length > 0 ? rows[0].teacher_name : null,
        timetable
      }
    });

  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    next(error);
  }
};

/**
 * Update a specific timetable slot
 */
exports.updateSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { teacher_id, classroom_id } = req.body;

    if (!slotId || isNaN(slotId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid slot ID.'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (teacher_id) {
      updates.push(`teacher_id = $${valueIndex++}`);
      values.push(teacher_id);
    }

    if (classroom_id) {
      updates.push(`classroom_id = $${valueIndex++}`);
      values.push(classroom_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide teacher_id or classroom_id to update.'
      });
    }

    values.push(slotId);
    const query = `
      UPDATE timetable_slots 
      SET ${updates.join(', ')} 
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No timetable slot found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Timetable slot updated successfully',
      data: rows[0]
    });

  } catch (error) {
    console.error('Error updating timetable slot:', error);
    next(error);
  }
};

/**
 * Get complete timetable (all classes)
 */
exports.getCompleteTimetable = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        ts.*,
        c.name as class_name,
        s.name as subject_name,
        s.code as subject_code,
        t.name as teacher_name,
        cr.room_number,
        cr.type as room_type
      FROM timetable_slots ts
      JOIN classes c ON ts.class_id = c.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN classrooms cr ON ts.classroom_id = cr.id
      ORDER BY c.name, ts.day_of_week, ts.period_number
    `;

    const { rows } = await db.query(query);

    // Group by classes
    const timetableByClass = {};
    
    rows.forEach(slot => {
      if (!timetableByClass[slot.class_name]) {
        timetableByClass[slot.class_name] = {
          classId: slot.class_id,
          className: slot.class_name,
          schedule: {}
        };
      }

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayName = days[slot.day_of_week - 1];
      const periodName = `Period ${slot.period_number}`;

      if (!timetableByClass[slot.class_name].schedule[dayName]) {
        timetableByClass[slot.class_name].schedule[dayName] = {};
      }

      timetableByClass[slot.class_name].schedule[dayName][periodName] = {
        id: slot.id,
        subject: slot.subject_name,
        subjectCode: slot.subject_code,
        teacher: slot.teacher_name,
        classroom: slot.room_number,
        roomType: slot.room_type
      };
    });

    res.status(200).json({
      status: 'success',
      data: Object.values(timetableByClass)
    });

  } catch (error) {
    console.error('Error fetching complete timetable:', error);
    next(error);
  }
};

/**
 * Delete current timetable
 */
exports.deleteTimetable = async (req, res, next) => {
  try {
    await db.query('DELETE FROM timetable_slots');

    res.status(200).json({
      status: 'success',
      message: 'Timetable deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting timetable:', error);
    next(error);
  }
};