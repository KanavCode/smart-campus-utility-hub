import { api } from '@/lib/axios';
import { withServiceError } from './serviceUtils';

// Interfaces for type safety - Matching database schema
export interface Teacher {
  id: string; // UUID
  teacher_code: string;
  full_name: string;
  department: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string; // UUID
  subject_code: string;
  subject_name: string;
  hours_per_week: number;
  course_type: 'Theory' | 'Practical' | 'Lab';
  department: string;
  semester: number;
  is_active: boolean;
  requires_consecutive_periods?: boolean;
  max_periods_per_day?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: string; // UUID
  room_code: string;
  room_name: string;
  capacity: number;
  room_type: 'Classroom' | 'Lab' | 'Auditorium' | 'Seminar_Hall';
  floor_number?: number;
  building?: string;
  has_projector?: boolean;
  has_computer?: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: string; // UUID
  group_code: string;
  group_name: string;
  strength: number;
  department: string;
  semester: number;
  academic_year: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Shared query params for server-side pagination and sorting. */
export interface PaginationSortParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/** Shape of the pagination metadata returned by list endpoints. */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

export const timetableService = {
  /**
   * Get all teachers
   * GET /api/timetable/teachers?department=...&page=1&limit=20&sort=full_name&order=asc
   */
  getTeachers: async (department = '', pagination: PaginationSortParams = {}) => {
    try {
      const query = buildQueryString({ department, ...pagination });
      const { data } = await api.get(`/timetable/teachers${query}`);
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to fetch teachers');
    }
  },

  /**
   * Get all subjects
   * GET /api/timetable/subjects?department=...&semester=5&page=1&limit=20&sort=subject_name&order=asc
   */
  getSubjects: async (
    filters: { department?: string; semester?: number } = {},
    pagination: PaginationSortParams = {}
  ) => {
    try {
      const query = buildQueryString({ ...filters, ...pagination });
      const { data } = await api.get(`/timetable/subjects${query}`);
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to fetch subjects');
    }
  },

  /**
   * Get all rooms
   * GET /api/timetable/rooms?room_type=Lab&page=1&limit=20&sort=room_name&order=asc
   */
  getRooms: async (roomType = '', pagination: PaginationSortParams = {}) => {
    try {
      const query = buildQueryString({ room_type: roomType, ...pagination });
      const { data } = await api.get(`/timetable/rooms${query}`);
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to fetch rooms');
    }
  },

  /**
   * Get all student groups
   * GET /api/timetable/groups?department=...&semester=5&page=1&limit=20&sort=group_name&order=asc
   */
  getGroups: async (
    filters: { department?: string; semester?: number } = {},
    pagination: PaginationSortParams = {}
  ) => {
    try {
      const query = buildQueryString({ ...filters, ...pagination });
      const { data } = await api.get(`/timetable/groups${query}`);
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to fetch groups');
    }
  },

  /**
   * Get timetable for a specific group
   * GET /api/timetable/group/:groupId?academic_year=2024-25&semester_type=odd
   * @param groupId - Group UUID
   * @param academicYear - Academic year (e.g., 2024-25)
   * @param semesterType - Semester type (odd/even)
   */
  getGroupTimetable: async (groupId: string, academicYear = '2024-25', semesterType = 'odd') => {
    try {
      const query = `?academic_year=${encodeURIComponent(academicYear)}&semester_type=${encodeURIComponent(semesterType)}`;
      const { data } = await api.get(`/timetable/group/${groupId}${query}`);
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to fetch group timetable');
    }
  },

  /**
   * Get schedule for a specific teacher
   * GET /api/timetable/teacher/:teacherId?academic_year=2024-25&semester_type=odd
   * @param teacherId - Teacher UUID
   * @param academicYear - Academic year (e.g., 2024-25)
   * @param semesterType - Semester type (odd/even)
   */
  getTeacherSchedule: async (teacherId: string, academicYear = '2024-25', semesterType = 'odd') => {
    try {
      const query = `?academic_year=${encodeURIComponent(academicYear)}&semester_type=${encodeURIComponent(semesterType)}`;
      const { data } = await api.get(`/timetable/teacher/${teacherId}${query}`);
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to fetch teacher schedule');
    }
  },

  /**
   * Get timetable configuration (all resources for generation)
   * GET /api/timetable/config
   */
  getConfig: async () => {
    try {
      const { data } = await api.get('/timetable/config');
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to fetch config');
    }
  },

  /**
   * Create a new teacher
   * POST /api/timetable/teachers
   * Required: teacher_code, full_name, department, email, phone
   */
  createTeacher: async (teacherData: Omit<Teacher, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    try {
      const { data } = await api.post('/timetable/teachers', {
        teacher_code: teacherData.teacher_code,
        full_name: teacherData.full_name,
        department: teacherData.department,
        email: teacherData.email,
        phone: teacherData.phone,
      });
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to create teacher');
    }
  },

  /**
   * Create a new subject
   * POST /api/timetable/subjects
   * Required: subject_code, subject_name, hours_per_week, course_type, department, semester
   */
  createSubject: async (subjectData: Omit<Subject, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    try {
      const { data } = await api.post('/timetable/subjects', {
        subject_code: subjectData.subject_code,
        subject_name: subjectData.subject_name,
        hours_per_week: subjectData.hours_per_week,
        course_type: subjectData.course_type,
        department: subjectData.department,
        semester: subjectData.semester,
      });
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to create subject');
    }
  },

  /**
   * Create a new room
   * POST /api/timetable/rooms
   * Required: room_code, room_name, capacity, room_type, floor_number, building
   */
  createRoom: async (roomData: Omit<Room, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    try {
      const { data } = await api.post('/timetable/rooms', {
        room_code: roomData.room_code,
        room_name: roomData.room_name,
        capacity: roomData.capacity,
        room_type: roomData.room_type,
        floor_number: roomData.floor_number,
        building: roomData.building,
      });
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to create room');
    }
  },

  /**
   * Create a new student group
   * POST /api/timetable/groups
   * Required: group_code, group_name, strength, department, semester, academic_year
   */
  createGroup: async (groupData: Omit<Group, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    try {
      const { data } = await api.post('/timetable/groups', {
        group_code: groupData.group_code,
        group_name: groupData.group_name,
        strength: groupData.strength,
        department: groupData.department,
        semester: groupData.semester,
        academic_year: groupData.academic_year,
      });
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to create group');
    }
  },

  /**
   * Assign a teacher to a subject
   * POST /api/timetable/assign/teacher-subject
   * Required: teacher_id (UUID), subject_id (UUID), priority?
   */
  assignTeacherSubject: async (assignmentData: { teacher_id: string; subject_id: string; priority?: number }) => {
    try {
      const { data } = await api.post('/timetable/assign/teacher-subject', {
        teacher_id: assignmentData.teacher_id,
        subject_id: assignmentData.subject_id,
        priority: assignmentData.priority || 1,
      });
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to assign teacher to subject');
    }
  },

  /**
   * Assign a subject to a group
   * POST /api/timetable/assign/subject-group
   * Required: subject_id (UUID), group_id (UUID)
   */
  assignSubjectGroup: async (assignmentData: { subject_id: string; group_id: string }) => {
    try {
      const { data } = await api.post('/timetable/assign/subject-group', {
        subject_id: assignmentData.subject_id,
        group_id: assignmentData.group_id,
      });
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to assign subject to group');
    }
  },

  /**
   * Generate complete timetable using backtracking algorithm
   * POST /api/timetable/generate
   */
  generateTimetable: async (generationData: {
    groups: string[]; // Array of group UUIDs
    days: string[]; // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    periods_per_day: number; // e.g., 7
    lunch_break_period: number; // e.g., 4
    academic_year: string; // e.g., "2024-25"
    semester_type: string; // "odd" or "even"
    preferences?: {
      respect_teacher_preferences?: boolean;
    };
  }) => {
    try {
      const { data } = await api.post('/timetable/generate', generationData);
      return data;
    } catch (error: unknown) {
      withServiceError(error, 'Failed to generate timetable');
    }
  },
};
