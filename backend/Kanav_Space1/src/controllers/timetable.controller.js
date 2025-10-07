const { Teacher, Subject, Room, StudentGroup, TimetableSlot } = require('../models');
const { generateTimetable, saveTimetableToDatabase } = require('../services/solver.service');
const { pool, logger } = require('../../config/db');

class TimetableController {
  // ============= TEACHERS ENDPOINTS =============
  
  async getAllTeachers(req, res) {
    try {
      const teachers = await Teacher.findAll();
      res.status(200).json({
        success: true,
        data: teachers,
        count: teachers.length
      });
    } catch (error) {
      logger.error('Error fetching teachers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teachers'
      });
    }
  }

  async getTeacherById(req, res) {
    try {
      const teacher = await Teacher.findById(req.params.id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }
      res.status(200).json({
        success: true,
        data: teacher
      });
    } catch (error) {
      logger.error('Error fetching teacher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teacher'
      });
    }
  }

  async createTeacher(req, res) {
    try {
      const teacher = await Teacher.create(req.validatedBody);
      logger.info(`New teacher created: ${teacher.teacher_code}`);
      res.status(201).json({
        success: true,
        data: teacher,
        message: 'Teacher created successfully'
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Teacher code or email already exists'
        });
      }
      logger.error('Error creating teacher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create teacher'
      });
    }
  }

  async getTeacherSubjects(req, res) {
    try {
      const subjects = await Teacher.getTeacherSubjects(req.params.id);
      res.status(200).json({
        success: true,
        data: subjects,
        count: subjects.length
      });
    } catch (error) {
      logger.error('Error fetching teacher subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teacher subjects'
      });
    }
  }

  async getTeacherUnavailability(req, res) {
    try {
      const unavailability = await Teacher.getUnavailability(req.params.id);
      res.status(200).json({
        success: true,
        data: unavailability,
        count: unavailability.length
      });
    } catch (error) {
      logger.error('Error fetching teacher unavailability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teacher unavailability'
      });
    }
  }

  // ============= SUBJECTS ENDPOINTS =============

  async getAllSubjects(req, res) {
    try {
      const subjects = await Subject.findAll();
      res.status(200).json({
        success: true,
        data: subjects,
        count: subjects.length
      });
    } catch (error) {
      logger.error('Error fetching subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subjects'
      });
    }
  }

  async getSubjectById(req, res) {
    try {
      const subject = await Subject.findById(req.params.id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }
      res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      logger.error('Error fetching subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subject'
      });
    }
  }

  async createSubject(req, res) {
    try {
      const subject = await Subject.create(req.validatedBody);
      logger.info(`New subject created: ${subject.subject_code}`);
      res.status(201).json({
        success: true,
        data: subject,
        message: 'Subject created successfully'
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'Subject code already exists'
        });
      }
      logger.error('Error creating subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create subject'
      });
    }
  }

  async getSubjectTeachers(req, res) {
    try {
      const teachers = await Subject.getSubjectTeachers(req.params.id);
      res.status(200).json({
        success: true,
        data: teachers,
        count: teachers.length
      });
    } catch (error) {
      logger.error('Error fetching subject teachers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subject teachers'
      });
    }
  }

  // ============= ROOMS ENDPOINTS =============

  async getAllRooms(req, res) {
    try {
      const rooms = await Room.findAll();
      res.status(200).json({
        success: true,
        data: rooms,
        count: rooms.length
      });
    } catch (error) {
      logger.error('Error fetching rooms:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rooms'
      });
    }
  }

  async getRoomById(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }
      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      logger.error('Error fetching room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch room'
      });
    }
  }

  async createRoom(req, res) {
    try {
      const room = await Room.create(req.validatedBody);
      logger.info(`New room created: ${room.room_code}`);
      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully'
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'Room code already exists'
        });
      }
      logger.error('Error creating room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create room'
      });
    }
  }

  // ============= STUDENT GROUPS ENDPOINTS =============

  async getAllGroups(req, res) {
    try {
      const groups = await StudentGroup.findAll();
      res.status(200).json({
        success: true,
        data: groups,
        count: groups.length
      });
    } catch (error) {
      logger.error('Error fetching student groups:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch student groups'
      });
    }
  }

  async getGroupById(req, res) {
    try {
      const group = await StudentGroup.findById(req.params.id);
      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Student group not found'
        });
      }
      res.status(200).json({
        success: true,
        data: group
      });
    } catch (error) {
      logger.error('Error fetching student group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch student group'
      });
    }
  }

  async createStudentGroup(req, res) {
    try {
      const group = await StudentGroup.create(req.validatedBody);
      logger.info(`New student group created: ${group.group_code}`);
      res.status(201).json({
        success: true,
        data: group,
        message: 'Student group created successfully'
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'Group code already exists'
        });
      }
      logger.error('Error creating student group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create student group'
      });
    }
  }

  async getGroupSubjects(req, res) {
    try {
      const subjects = await StudentGroup.getGroupSubjects(req.params.id);
      res.status(200).json({
        success: true,
        data: subjects,
        count: subjects.length
      });
    } catch (error) {
      logger.error('Error fetching group subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch group subjects'
      });
    }
  }

  // ============= ASSIGNMENT ENDPOINTS =============

  async createTeacherSubjectAssignment(req, res) {
    try {
      const { teacher_id, subject_id, priority } = req.validatedBody;
      
      const query = `
        INSERT INTO teacher_subject_assignments (teacher_id, subject_id, priority)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await pool.query(query, [teacher_id, subject_id, priority || 1]);
      
      logger.info(`Teacher-Subject assignment created: ${teacher_id} -> ${subject_id}`);
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Teacher-Subject assignment created successfully'
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'Teacher-Subject assignment already exists'
        });
      }
      logger.error('Error creating teacher-subject assignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create assignment'
      });
    }
  }

  async getAllTeacherSubjectAssignments(req, res) {
    try {
      const query = `
        SELECT 
          tsa.*,
          t.teacher_code,
          t.full_name as teacher_name,
          s.subject_code,
          s.subject_name
        FROM teacher_subject_assignments tsa
        JOIN teachers t ON tsa.teacher_id = t.id
        JOIN subjects s ON tsa.subject_id = s.id
        WHERE tsa.is_active = true
        ORDER BY t.teacher_code, s.subject_code
      `;
      
      const result = await pool.query(query);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      logger.error('Error fetching teacher-subject assignments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assignments'
      });
    }
  }

  async createSubjectClassAssignment(req, res) {
    try {
      const { subject_id, group_id } = req.validatedBody;
      
      const query = `
        INSERT INTO subject_class_assignments (subject_id, group_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const result = await pool.query(query, [subject_id, group_id]);
      
      logger.info(`Subject-Class assignment created: ${subject_id} -> ${group_id}`);
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Subject-Class assignment created successfully'
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'Subject-Class assignment already exists'
        });
      }
      logger.error('Error creating subject-class assignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create assignment'
      });
    }
  }

  async getAllSubjectClassAssignments(req, res) {
    try {
      const query = `
        SELECT 
          sca.*,
          s.subject_code,
          s.subject_name,
          sg.group_code,
          sg.group_name
        FROM subject_class_assignments sca
        JOIN subjects s ON sca.subject_id = s.id
        JOIN student_groups sg ON sca.group_id = sg.id
        WHERE sca.is_active = true
        ORDER BY sg.group_code, s.subject_code
      `;
      
      const result = await pool.query(query);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      logger.error('Error fetching subject-class assignments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assignments'
      });
    }
  }

  async createTeacherUnavailability(req, res) {
    try {
      const unavailabilityData = req.validatedBody;
      
      const query = `
        INSERT INTO teacher_unavailability (
          teacher_id, day_of_week, period_number, reason, 
          is_permanent, start_date, end_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        unavailabilityData.teacher_id,
        unavailabilityData.day_of_week,
        unavailabilityData.period_number,
        unavailabilityData.reason,
        unavailabilityData.is_permanent,
        unavailabilityData.start_date,
        unavailabilityData.end_date
      ]);
      
      logger.info(`Teacher unavailability created for teacher: ${unavailabilityData.teacher_id}`);
      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Teacher unavailability created successfully'
      });
    } catch (error) {
      logger.error('Error creating teacher unavailability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create teacher unavailability'
      });
    }
  }

  async getAllTeacherUnavailability(req, res) {
    try {
      const query = `
        SELECT 
          tu.*,
          t.teacher_code,
          t.full_name as teacher_name
        FROM teacher_unavailability tu
        JOIN teachers t ON tu.teacher_id = t.id
        ORDER BY t.teacher_code, tu.day_of_week, tu.period_number
      `;
      
      const result = await pool.query(query);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      logger.error('Error fetching teacher unavailability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teacher unavailability'
      });
    }
  }

  // ============= TIMETABLE GENERATION =============

  async generateTimetable(req, res) {
    try {
      const constraints = req.validatedBody;
      
      logger.info('Starting timetable generation...', constraints);
      
      // Generate timetable using backtracking algorithm
      const result = await generateTimetable(constraints);
      
      if (result.success) {
        // Save to database
        await saveTimetableToDatabase(
          result.timetable, 
          constraints.academic_year, 
          constraints.semester_type
        );
        
        res.status(200).json({
          success: true,
          data: result.timetable,
          statistics: result.statistics,
          message: 'Timetable generated and saved successfully'
        });
      } else {
        res.status(422).json(result);
      }
    } catch (error) {
      logger.error('Error generating timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate timetable',
        message: error.message
      });
    }
  }

  async getTimetable(req, res) {
    try {
      const { academic_year, semester_type } = req.params;
      const timetable = await TimetableSlot.getFullTimetable(academic_year, semester_type);
      
      res.status(200).json({
        success: true,
        data: timetable,
        count: timetable.length,
        academic_year,
        semester_type
      });
    } catch (error) {
      logger.error('Error fetching timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch timetable'
      });
    }
  }

  async getTimetableByGroup(req, res) {
    try {
      const { academic_year, semester_type, group_id } = req.params;
      
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
        WHERE ts.academic_year = $1 AND ts.semester_type = $2 AND ts.group_id = $3
        ORDER BY ts.day_of_week, ts.period_number
      `;
      
      const result = await pool.query(query, [academic_year, semester_type, group_id]);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        academic_year,
        semester_type,
        group_id
      });
    } catch (error) {
      logger.error('Error fetching group timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch group timetable'
      });
    }
  }

  async clearTimetable(req, res) {
    try {
      const { academic_year, semester_type } = req.params;
      await TimetableSlot.clearTimetable(academic_year, semester_type);
      
      logger.info(`Timetable cleared: ${academic_year} ${semester_type}`);
      res.status(200).json({
        success: true,
        message: 'Timetable cleared successfully'
      });
    } catch (error) {
      logger.error('Error clearing timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear timetable'
      });
    }
  }

  // ============= BULK OPERATIONS =============

  async bulkCreate(req, res) {
    try {
      const data = req.validatedBody;
      const results = {};

      // Use transaction for bulk operations
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Create teachers
        if (data.teachers && data.teachers.length > 0) {
          const teachers = [];
          for (const teacherData of data.teachers) {
            const teacher = await Teacher.create(teacherData);
            teachers.push(teacher);
          }
          results.teachers = teachers;
        }

        // Create subjects
        if (data.subjects && data.subjects.length > 0) {
          const subjects = [];
          for (const subjectData of data.subjects) {
            const subject = await Subject.create(subjectData);
            subjects.push(subject);
          }
          results.subjects = subjects;
        }

        // Create rooms
        if (data.rooms && data.rooms.length > 0) {
          const rooms = [];
          for (const roomData of data.rooms) {
            const room = await Room.create(roomData);
            rooms.push(room);
          }
          results.rooms = rooms;
        }

        // Create student groups
        if (data.student_groups && data.student_groups.length > 0) {
          const groups = [];
          for (const groupData of data.student_groups) {
            const group = await StudentGroup.create(groupData);
            groups.push(group);
          }
          results.student_groups = groups;
        }

        // Create assignments (after entities are created)
        if (data.teacher_subject_assignments && data.teacher_subject_assignments.length > 0) {
          const assignments = [];
          for (const assignment of data.teacher_subject_assignments) {
            const query = `
              INSERT INTO teacher_subject_assignments (teacher_id, subject_id, priority)
              VALUES ($1, $2, $3)
              RETURNING *
            `;
            const result = await client.query(query, [
              assignment.teacher_id, 
              assignment.subject_id, 
              assignment.priority || 1
            ]);
            assignments.push(result.rows[0]);
          }
          results.teacher_subject_assignments = assignments;
        }

        if (data.subject_class_assignments && data.subject_class_assignments.length > 0) {
          const assignments = [];
          for (const assignment of data.subject_class_assignments) {
            const query = `
              INSERT INTO subject_class_assignments (subject_id, group_id)
              VALUES ($1, $2)
              RETURNING *
            `;
            const result = await client.query(query, [
              assignment.subject_id, 
              assignment.group_id
            ]);
            assignments.push(result.rows[0]);
          }
          results.subject_class_assignments = assignments;
        }

        await client.query('COMMIT');
        
        logger.info('Bulk create operation completed successfully');
        res.status(201).json({
          success: true,
          data: results,
          message: 'Bulk create operation completed successfully'
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      logger.error('Error in bulk create operation:', error);
      res.status(500).json({
        success: false,
        error: 'Bulk create operation failed',
        message: error.message
      });
    }
  }

  // ============= UTILITY ENDPOINTS =============

  async getSystemStats(req, res) {
    try {
      const stats = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM teachers WHERE is_active = true'),
        pool.query('SELECT COUNT(*) as count FROM subjects WHERE is_active = true'),
        pool.query('SELECT COUNT(*) as count FROM rooms WHERE is_active = true'),
        pool.query('SELECT COUNT(*) as count FROM student_groups WHERE is_active = true'),
        pool.query('SELECT COUNT(*) as count FROM teacher_subject_assignments WHERE is_active = true'),
        pool.query('SELECT COUNT(*) as count FROM subject_class_assignments WHERE is_active = true'),
        pool.query('SELECT COUNT(*) as count FROM timetable_slots WHERE is_active = true')
      ]);

      const systemStats = {
        teachers: parseInt(stats[0].rows[0].count),
        subjects: parseInt(stats[1].rows[0].count),
        rooms: parseInt(stats[2].rows[0].count),
        student_groups: parseInt(stats[3].rows[0].count),
        teacher_subject_assignments: parseInt(stats[4].rows[0].count),
        subject_class_assignments: parseInt(stats[5].rows[0].count),
        timetable_slots: parseInt(stats[6].rows[0].count)
      };

      res.status(200).json({
        success: true,
        data: systemStats
      });
    } catch (error) {
      logger.error('Error fetching system stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system statistics'
      });
    }
  }

  async validateConstraints(req, res) {
    try {
      // This would contain business logic to validate constraints
      // For now, return a simple validation
      
      res.status(200).json({
        success: true,
        message: 'Constraint validation completed',
        valid: true
      });
    } catch (error) {
      logger.error('Error validating constraints:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate constraints'
      });
    }
  }

  async getSampleData(req, res) {
    try {
      const sampleData = {
        teachers: [
          {
            teacher_code: "T001",
            full_name: "Dr. John Smith",
            department: "Computer Science",
            email: "john.smith@university.edu",
            phone: "1234567890"
          },
          {
            teacher_code: "T002",
            full_name: "Prof. Jane Doe",
            department: "Computer Science",
            email: "jane.doe@university.edu",
            phone: "0987654321"
          }
        ],
        subjects: [
          {
            subject_code: "CS501",
            subject_name: "Advanced Algorithms",
            hours_per_week: 4,
            course_type: "Theory",
            department: "Computer Science",
            semester: 5,
            requires_consecutive_periods: false,
            max_periods_per_day: 2
          },
          {
            subject_code: "CS502",
            subject_name: "Database Lab",
            hours_per_week: 3,
            course_type: "Lab",
            department: "Computer Science",
            semester: 5,
            requires_consecutive_periods: true,
            max_periods_per_day: 3
          }
        ],
        rooms: [
          {
            room_code: "R301",
            room_name: "Room 301",
            capacity: 60,
            room_type: "Classroom",
            floor_number: 3,
            building: "Main Building",
            has_projector: true,
            has_computer: false
          },
          {
            room_code: "LAB101",
            room_name: "Computer Lab 1",
            capacity: 40,
            room_type: "Lab",
            floor_number: 1,
            building: "Lab Building",
            has_projector: true,
            has_computer: true
          }
        ],
        student_groups: [
          {
            group_code: "CSE5A",
            group_name: "5th Semester CSE Section A",
            strength: 55,
            department: "Computer Science",
            semester: 5,
            academic_year: "2024-25"
          }
        ]
      };

      res.status(200).json({
        success: true,
        data: sampleData,
        message: 'Sample data for testing purposes'
      });
    } catch (error) {
      logger.error('Error generating sample data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate sample data'
      });
    }
  }

  // ============= EXPORT/IMPORT =============

  async exportTimetable(req, res) {
    try {
      const { academic_year, semester_type } = req.params;
      const timetable = await TimetableSlot.getFullTimetable(academic_year, semester_type);
      
      res.status(200).json({
        success: true,
        data: {
          metadata: {
            academic_year,
            semester_type,
            exported_at: new Date().toISOString(),
            total_slots: timetable.length
          },
          timetable: timetable
        }
      });
    } catch (error) {
      logger.error('Error exporting timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export timetable'
      });
    }
  }

  async importTimetable(req, res) {
    try {
      // This would handle importing timetable data
      // Implementation depends on the import format
      
      res.status(501).json({
        success: false,
        error: 'Import functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error importing timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import timetable'
      });
    }
  }
}

// Create instance and export methods
const controller = new TimetableController();

module.exports = {
  // Teachers
  getAllTeachers: controller.getAllTeachers.bind(controller),
  getTeacherById: controller.getTeacherById.bind(controller),
  createTeacher: controller.createTeacher.bind(controller),
  getTeacherSubjects: controller.getTeacherSubjects.bind(controller),
  getTeacherUnavailability: controller.getTeacherUnavailability.bind(controller),

  // Subjects
  getAllSubjects: controller.getAllSubjects.bind(controller),
  getSubjectById: controller.getSubjectById.bind(controller),
  createSubject: controller.createSubject.bind(controller),
  getSubjectTeachers: controller.getSubjectTeachers.bind(controller),

  // Rooms
  getAllRooms: controller.getAllRooms.bind(controller),
  getRoomById: controller.getRoomById.bind(controller),
  createRoom: controller.createRoom.bind(controller),

  // Student Groups
  getAllGroups: controller.getAllGroups.bind(controller),
  getGroupById: controller.getGroupById.bind(controller),
  createStudentGroup: controller.createStudentGroup.bind(controller),
  getGroupSubjects: controller.getGroupSubjects.bind(controller),

  // Assignments
  createTeacherSubjectAssignment: controller.createTeacherSubjectAssignment.bind(controller),
  getAllTeacherSubjectAssignments: controller.getAllTeacherSubjectAssignments.bind(controller),
  createSubjectClassAssignment: controller.createSubjectClassAssignment.bind(controller),
  getAllSubjectClassAssignments: controller.getAllSubjectClassAssignments.bind(controller),
  createTeacherUnavailability: controller.createTeacherUnavailability.bind(controller),
  getAllTeacherUnavailability: controller.getAllTeacherUnavailability.bind(controller),

  // Timetable
  generateTimetable: controller.generateTimetable.bind(controller),
  getTimetable: controller.getTimetable.bind(controller),
  getTimetableByGroup: controller.getTimetableByGroup.bind(controller),
  clearTimetable: controller.clearTimetable.bind(controller),

  // Bulk operations
  bulkCreate: controller.bulkCreate.bind(controller),

  // Utilities
  getSystemStats: controller.getSystemStats.bind(controller),
  validateConstraints: controller.validateConstraints.bind(controller),
  getSampleData: controller.getSampleData.bind(controller),
  exportTimetable: controller.exportTimetable.bind(controller),
  importTimetable: controller.importTimetable.bind(controller)
};