import { z } from 'zod';

// User Validation Schema
export const userSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.enum(['student', 'admin'], { errorMap: () => ({ message: 'Invalid role' }) }),
  department: z.string().max(50, 'Department is too long').optional().or(z.literal('')),
  cgpa: z.coerce.number().min(0, 'CGPA cannot be negative').max(10, 'CGPA cannot exceed 10').optional().or(z.literal('')),
  semester: z.coerce.number().min(1, 'Semester must be at least 1').max(8, 'Semester cannot exceed 8').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.role === 'student' && (!data.cgpa || !data.semester)) {
      return false;
    }
    return true;
  },
  {
    message: 'CGPA and Semester are required for student accounts',
    path: ['cgpa', 'semester'],
  }
);

// Teacher Validation Schema
export const teacherSchema = z.object({
  teacher_code: z.string().min(1, 'Teacher code is required').max(20, 'Teacher code is too long'),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  department: z.string().min(1, 'Department is required').max(50, 'Department is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
});

// Subject Validation Schema
export const subjectSchema = z.object({
  subject_code: z.string().min(1, 'Subject code is required').max(20, 'Subject code is too long'),
  subject_name: z.string().min(1, 'Subject name is required').max(100, 'Subject name is too long'),
  hours_per_week: z.coerce.number().min(1, 'Hours per week must be at least 1').max(24, 'Hours per week cannot exceed 24'),
  course_type: z.enum(['Theory', 'Practical', 'Lab'], { errorMap: () => ({ message: 'Invalid course type' }) }),
  department: z.string().min(1, 'Department is required').max(50, 'Department is too long'),
  semester: z.coerce.number().min(1, 'Semester must be at least 1').max(8, 'Semester cannot exceed 8'),
});

// Room Validation Schema
export const roomSchema = z.object({
  room_code: z.string().min(1, 'Room code is required').max(20, 'Room code is too long'),
  room_name: z.string().min(1, 'Room name is required').max(100, 'Room name is too long'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(500, 'Capacity cannot exceed 500'),
  room_type: z.enum(['Classroom', 'Lab', 'Auditorium', 'Seminar_Hall'], { errorMap: () => ({ message: 'Invalid room type' }) }),
  floor_number: z.coerce.number().min(0, 'Floor number cannot be negative').max(50, 'Floor number is too high').optional().or(z.literal('')),
  building: z.string().min(1, 'Building is required').max(50, 'Building name is too long'),
});

// Group Validation Schema
export const groupSchema = z.object({
  group_code: z.string().min(1, 'Group code is required').max(20, 'Group code is too long'),
  group_name: z.string().min(1, 'Group name is required').max(100, 'Group name is too long'),
  department: z.string().min(1, 'Department is required').max(50, 'Department is too long'),
  semester: z.coerce.number().min(1, 'Semester must be at least 1').max(8, 'Semester cannot exceed 8'),
  strength: z.coerce.number().min(1, 'Student strength must be at least 1').max(1000, 'Student strength is too high'),
  academic_year: z.string().min(1, 'Academic year is required').regex(/^\d{4}-\d{2}$/, 'Academic year format should be YYYY-YY'),
});

// Event Validation Schema
export const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200, 'Event title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
  location: z.string().min(1, 'Location is required').max(100, 'Location is too long'),
  club_id: z.string().min(1, 'Associated club is required').or(z.number().min(1)),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  target_department: z.string().max(50, 'Target department is too long').optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  is_featured: z.boolean().optional().default(false),
}).refine(
  (data) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    return end > start;
  },
  {
    message: 'End time must be after start time',
    path: ['end_time'],
  }
);

// Elective Validation Schema
export const electiveSchema = z.object({
  subject_name: z.string().min(1, 'Subject name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  max_students: z.coerce.number().min(1, 'Max students must be at least 1').max(200, 'Max students cannot exceed 200'),
  department: z.string().min(1, 'Department is required').max(50, 'Department is too long'),
  semester: z.coerce.number().min(1, 'Semester must be at least 1').max(8, 'Semester cannot exceed 8'),
});

// Club Validation Schema
export const clubSchema = z.object({
  name: z.string().min(1, 'Club name is required').max(100, 'Club name is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  contact_email: z.string().email('Invalid email address'),
  category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
});

// Teacher-Subject Assignment Validation Schema
export const assignTeacherSubjectSchema = z.object({
  teacher_id: z.string().min(1, 'Please select a teacher'),
  subject_id: z.string().min(1, 'Please select a subject'),
  priority: z.coerce.number().min(1, 'Priority must be at least 1').max(5, 'Priority cannot exceed 5').optional().default(1),
});

// Subject-Group Assignment Validation Schema
export const assignSubjectGroupSchema = z.object({
  subject_id: z.string().min(1, 'Please select a subject'),
  group_id: z.string().min(1, 'Please select a group'),
});

// Export all schemas as a map for easy access
export const validationSchemas = {
  user: userSchema,
  teacher: teacherSchema,
  subject: subjectSchema,
  room: roomSchema,
  group: groupSchema,
  event: eventSchema,
  elective: electiveSchema,
  club: clubSchema,
  assignTeacherSubject: assignTeacherSubjectSchema,
  assignSubjectGroup: assignSubjectGroupSchema,
} as const;

// Type exports for use with forms
export type UserFormData = z.infer<typeof userSchema>;
export type TeacherFormData = z.infer<typeof teacherSchema>;
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type RoomFormData = z.infer<typeof roomSchema>;
export type GroupFormData = z.infer<typeof groupSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type ElectiveFormData = z.infer<typeof electiveSchema>;
export type ClubFormData = z.infer<typeof clubSchema>;
