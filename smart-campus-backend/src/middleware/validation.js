const Joi = require('joi');
const { ApiError } = require('./errorHandler');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'query', 'params')
 * @returns {Function} Middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new ApiError(400, errorMessage, error.details));
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};
// Core elective subjects
const allowedSubjects = [
  'Artificial Intelligence',
  'Statistics in Data Science',
  'Data Warehousing & Data Mining',
  'Distributed Systems',
  'Network Security',
  'Big Data Analytics',
  'Cloud Computing',
  'Machine Learning',
  'Mobile Computing',
  'Computer Vision & Applications',
];


// Common validation schemas
const validationSchemas = {
  // User registration
  register: Joi.object({
    full_name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('student', 'admin').default('student'),
    department: Joi.string().max(100).optional(),
    cgpa: Joi.number().min(0).max(10).precision(2).optional(),
    semester: Joi.number().integer().min(1).max(8).optional()
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Update profile
  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    department: Joi.string().max(100).optional(),
    cgpa: Joi.number().min(0).max(10).precision(2).optional(),
    semester: Joi.number().integer().min(1).max(8).optional()
  }),

  // Admin update user
  adminUpdateUser: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('student', 'admin').optional(),
    department: Joi.string().max(100).allow('', null).optional(),
    cgpa: Joi.number().min(0).max(10).precision(2).allow(null).optional(),
    semester: Joi.number().integer().min(1).max(8).allow(null).optional(),
    is_active: Joi.boolean().optional()
  }).min(1),

  // Event creation
  createEvent: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().optional(),
    location: Joi.string().max(255).optional(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
    club_id: Joi.number().integer().required(),
    target_department: Joi.string().max(100).optional(),
    is_featured: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  // Club creation
  createClub: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().optional(),
    contact_email: Joi.string().email().optional(),
    category: Joi.string().max(50).optional()
  }),

  // Elective creation
  createElective: Joi.object({
    subject_name: Joi.string().min(2).max(100).required(),
    description: Joi.string().optional(),
    max_students: Joi.number().integer().min(1).default(50),
    department: Joi.string().max(100).optional(),
    semester: Joi.number().integer().min(1).max(8).optional()
  }),

  // Elective choices submission
  submitChoices: Joi.object({
    choices: Joi.array().items(
      Joi.object({
        elective_id: Joi.number().integer().positive(),
        subject_name: Joi.string().valid(...allowedSubjects),
        preference_rank: Joi.number().integer().min(1).max(5).required()
      }).or('elective_id', 'subject_name')
    ).min(1).max(5).required()
  }),


  // UUID parameter validation
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  }),

  // Integer ID parameter validation
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // Pagination query validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('asc')
  }),

  // Timetable list/query validation
  timetableQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().max(50).optional(),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('asc'),
    department: Joi.string().max(100).optional(),
    semester: Joi.number().integer().min(1).max(8).optional(),
    room_type: Joi.string().max(50).optional(),
    academic_year: Joi.string().max(20).optional(),
    semester_type: Joi.string().max(20).optional()
  }),

  groupIdParam: Joi.object({
    groupId: Joi.string().uuid().required()
  }),

  teacherIdParam: Joi.object({
    teacherId: Joi.string().uuid().required()
  }),

  timetableTeacher: Joi.object({
    teacher_code: Joi.string().min(1).max(20).required(),
    full_name: Joi.string().min(2).max(100).required(),
    department: Joi.string().max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20).allow('', null).optional()
  }),

  timetableSubject: Joi.object({
    subject_code: Joi.string().min(1).max(20).required(),
    subject_name: Joi.string().min(2).max(100).required(),
    hours_per_week: Joi.number().integer().min(1).max(20).required(),
    course_type: Joi.string().valid('Theory', 'Practical', 'Lab').required(),
    department: Joi.string().max(100).required(),
    semester: Joi.number().integer().min(1).max(8).required()
  }),

  timetableRoom: Joi.object({
    room_code: Joi.string().min(1).max(20).required(),
    room_name: Joi.string().min(2).max(100).required(),
    capacity: Joi.number().integer().min(1).required(),
    room_type: Joi.string().max(50).required(),
    floor_number: Joi.number().integer().min(0).required(),
    building: Joi.string().min(1).max(100).required()
  }),

  timetableGroup: Joi.object({
    group_code: Joi.string().min(1).max(20).required(),
    group_name: Joi.string().min(2).max(100).required(),
    strength: Joi.number().integer().min(1).required(),
    department: Joi.string().max(100).required(),
    semester: Joi.number().integer().min(1).max(8).required(),
    academic_year: Joi.string().min(4).max(20).required()
  }),

  assignTeacherSubject: Joi.object({
    teacher_id: Joi.string().uuid().required(),
    subject_id: Joi.string().uuid().required(),
    priority: Joi.number().integer().min(1).optional()
  }),

  assignSubjectGroup: Joi.object({
    subject_id: Joi.string().uuid().required(),
    group_id: Joi.string().uuid().required()
  }),

  generateTimetable: Joi.object({
    groups: Joi.array().items(Joi.object()).min(1).required(),
    days: Joi.array().items(Joi.string()).min(1).required(),
    periods_per_day: Joi.number().integer().min(1).required(),
    lunch_break_period: Joi.number().integer().min(1).optional(),
    academic_year: Joi.string().min(4).max(20).required(),
    semester_type: Joi.string().min(1).max(20).required(),
    preferences: Joi.object().optional()
  }),

  // Event list query validation
  eventQuery: Joi.object({
    search: Joi.string().max(100).optional(),
    tag: Joi.string().max(50).optional(),
    club_id: Joi.number().integer().positive().optional(),
    department: Joi.string().max(100).optional(),
    is_featured: Joi.string().valid('true', 'false').optional(),
    upcoming: Joi.string().valid('true', 'false').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('start_time', 'title', 'created_at').default('start_time'),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('ASC')
  }),

  // Club list query validation
  clubQuery: Joi.object({
    category: Joi.string().max(50).optional(),
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('name', 'category', 'created_at').default('name'),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('ASC')
  }),

  // Elective list query validation
  electiveQuery: Joi.object({
    department: Joi.string().max(100).optional(),
    semester: Joi.number().integer().min(1).max(8).optional()
  })
};

/**
 * Custom validator for specific requirements
 */
const customValidators = {
  // Check if user is owner of resource
  isOwner: (userId) => (req, res, next) => {
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return next(new ApiError(403, 'You do not have permission to access this resource'));
    }
    next();
  },

  // Check if email domain is allowed
  allowedEmailDomain: (domains = []) => (req, res, next) => {
    const email = req.body.email;
    if (email) {
      const domain = email.split('@')[1];
      if (domains.length > 0 && !domains.includes(domain)) {
        return next(new ApiError(400, `Email domain must be one of: ${domains.join(', ')}`));
      }
    }
    next();
  }
};

module.exports = {
  validate,
  validationSchemas,
  customValidators
};
