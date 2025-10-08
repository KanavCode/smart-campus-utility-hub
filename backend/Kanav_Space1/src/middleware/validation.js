const Joi = require('joi');
const { logger } = require('../../config/db');

// Validation schemas
const schemas = {
  teacher: Joi.object({
    teacher_code: Joi.string().min(2).max(10).required(),
    full_name: Joi.string().min(2).max(100).required(),
    department: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().min(10).max(15).optional()
  }),

  subject: Joi.object({
    subject_code: Joi.string().min(2).max(10).required(),
    subject_name: Joi.string().min(2).max(100).required(),
    hours_per_week: Joi.number().integer().min(1).max(10).required(),
    course_type: Joi.string().valid('Theory', 'Practical', 'Lab').required(),
    department: Joi.string().min(2).max(50).required(),
    semester: Joi.number().integer().min(1).max(8).required(),
    requires_consecutive_periods: Joi.boolean().default(false),
    max_periods_per_day: Joi.number().integer().min(1).max(4).default(2)
  }),

  room: Joi.object({
    room_code: Joi.string().min(2).max(20).required(),
    room_name: Joi.string().min(2).max(100).required(),
    capacity: Joi.number().integer().min(1).required(),
    room_type: Joi.string().valid('Classroom', 'Lab', 'Auditorium', 'Seminar_Hall').required(),
    floor_number: Joi.number().integer().min(0).optional(),
    building: Joi.string().max(50).optional(),
    has_projector: Joi.boolean().default(false),
    has_computer: Joi.boolean().default(false)
  }),

  studentGroup: Joi.object({
    group_code: Joi.string().min(2).max(10).required(),
    group_name: Joi.string().min(2).max(100).required(),
    strength: Joi.number().integer().min(1).required(),
    department: Joi.string().min(2).max(50).required(),
    semester: Joi.number().integer().min(1).max(8).required(),
    academic_year: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
  }),

  teacherSubjectAssignment: Joi.object({
    teacher_id: Joi.string().uuid().required(),
    subject_id: Joi.string().uuid().required(),
    priority: Joi.number().integer().min(1).max(5).default(1)
  }),

  subjectClassAssignment: Joi.object({
    subject_id: Joi.string().uuid().required(),
    group_id: Joi.string().uuid().required()
  }),

  teacherUnavailability: Joi.object({
    teacher_id: Joi.string().uuid().required(),
    day_of_week: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday').required(),
    period_number: Joi.number().integer().min(1).max(8).required(),
    reason: Joi.string().max(200).optional(),
    is_permanent: Joi.boolean().default(true),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional()
  }),

  timetableGeneration: Joi.object({
    academic_year: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
    semester_type: Joi.string().valid('odd', 'even').required(),
    groups: Joi.array().items(Joi.string().uuid()).min(1).required(),
    days: Joi.array().items(
      Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
    ).min(1).max(6).default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    periods_per_day: Joi.number().integer().min(4).max(8).default(6),
    lunch_break_period: Joi.number().integer().min(1).max(8).optional(),
    preferences: Joi.object({
      minimize_gaps: Joi.boolean().default(true),
      consecutive_labs: Joi.boolean().default(true),
      balanced_distribution: Joi.boolean().default(true),
      respect_teacher_preferences: Joi.boolean().default(true)
    }).default({})
  }),

  // bulkCreate schema will be defined separately to avoid circular reference
};

// Generic validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      logger.warn('Validation error:', {
        url: req.originalUrl,
        method: req.method,
        errors: errorDetails,
        body: req.body
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Specific validation middlewares
const validateTeacher = validateInput(schemas.teacher);
const validateSubject = validateInput(schemas.subject);
const validateRoom = validateInput(schemas.room);
const validateStudentGroup = validateInput(schemas.studentGroup);
const validateTeacherSubjectAssignment = validateInput(schemas.teacherSubjectAssignment);
const validateSubjectClassAssignment = validateInput(schemas.subjectClassAssignment);
const validateTeacherUnavailability = validateInput(schemas.teacherUnavailability);
const validateTimetableGeneration = validateInput(schemas.timetableGeneration);
// Define bulkCreate schema separately to avoid circular reference
const bulkCreateSchema = Joi.object({
  teachers: Joi.array().items(schemas.teacher).optional(),
  subjects: Joi.array().items(schemas.subject).optional(),
  rooms: Joi.array().items(schemas.room).optional(),
  student_groups: Joi.array().items(schemas.studentGroup).optional(),
  teacher_subject_assignments: Joi.array().items(schemas.teacherSubjectAssignment).optional(),
  subject_class_assignments: Joi.array().items(schemas.subjectClassAssignment).optional(),
  teacher_unavailability: Joi.array().items(schemas.teacherUnavailability).optional()
});

const validateBulkCreate = validateInput(bulkCreateSchema);

// UUID parameter validation
const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidSchema = Joi.string().uuid();
    const { error } = uuidSchema.validate(uuid);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UUID format',
        parameter: paramName,
        value: uuid
      });
    }

    next();
  };
};

// Custom business logic validations
const validateBusinessRules = {
  // Check if teacher can teach the subject
  teacherSubjectCompatibility: async (req, res, next) => {
    try {
      // This would contain business logic to validate teacher-subject assignments
      // For now, we'll just pass through
      next();
    } catch (error) {
      logger.error('Business rule validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Business rule validation failed'
      });
    }
  },

  // Check room capacity vs group strength
  roomCapacityValidation: async (req, res, next) => {
    try {
      // This would contain business logic to validate room capacity
      // For now, we'll just pass through
      next();
    } catch (error) {
      logger.error('Room capacity validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Room capacity validation failed'
      });
    }
  }
};

module.exports = {
  schemas,
  validateInput,
  validateTeacher,
  validateSubject,
  validateRoom,
  validateStudentGroup,
  validateTeacherSubjectAssignment,
  validateSubjectClassAssignment,
  validateTeacherUnavailability,
  validateTimetableGeneration,
  validateBulkCreate,
  validateUUID,
  validateBusinessRules
};