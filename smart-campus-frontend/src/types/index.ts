// ─────────────────────────────────────────────────────────────────────────────
// Core API Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: string[];
  success?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// User & Auth
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'admin' | 'faculty';

/**
 * User entity — id is UUID string in the Supabase schema
 */
export interface User {
  id: string;           // UUID
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  cgpa?: number | null;
  semester?: number | null;
  is_active: boolean;
  two_factor_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData extends Partial<User> {
  password?: string;
}

export interface TwoFactorChallenge {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  twoFactorEnabled: boolean;
  enabledAt?: string;
  backupCodesCount: number;
}

export interface UserSession {
  id: string;           // UUID
  ip_address: string;
  user_agent: string;
  device_type: string;
  location: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Timetable — IDs are all UUID strings
// ─────────────────────────────────────────────────────────────────────────────

export interface TimetableSlot {
  id: string;           // UUID
  day_of_week: string;
  period_number: number;
  subject: {
    subject_code: string;
    subject_name: string;
    course_type?: string;
  };
  teacher: {
    teacher_code: string;
    full_name: string;
  };
  room: {
    room_code: string;
    room_name: string;
  };
  academic_year?: string;
  semester_type?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin CRUD Form Data
// ─────────────────────────────────────────────────────────────────────────────

export interface TeacherFormData {
  id?: string;          // UUID
  teacher_code: string;
  full_name: string;
  email?: string;
}

export interface SubjectFormData {
  id?: string;          // UUID
  subject_code?: string;
  subject_name: string;
  course_type?: string;
}

export interface RoomFormData {
  id?: string;          // UUID
  room_code: string;
  room_name: string;
  capacity?: number;
}

export interface GroupFormData {
  id?: string;          // UUID
  group_code: string;
  group_name: string;
  department?: string;
  semester?: number;
  academic_year?: string;
}

export interface ClubFormData {
  id?: string;          // UUID
  name: string;
  code?: string;
  description?: string;
}

export interface EventFormData {
  id?: string;          // UUID
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  club_id?: string;     // UUID
}

export interface ElectiveFormData {
  id?: string;          // UUID
  name: string;
  code?: string;
  seats?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain Entities — IDs are UUID strings (Supabase schema)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Campus Event entity
 */
export interface CampusEvent {
  id: string;           // UUID
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  club_id?: string;     // UUID
  club_name?: string;
  target_department?: string;
  is_featured: boolean;
  tags?: string[];
  image_url?: string;
  capacity?: number;
  rsvp_count?: number;
}

/**
 * Elective entity
 */
export interface Elective {
  id: string;           // UUID
  subject_name: string;
  description: string;
  max_students: number;
  department: string;
  semester: number;
  current_students?: number;
  teacher_name?: string;
}

/**
 * Club entity
 */
export interface Club {
  id: string;           // UUID
  name: string;
  description: string;
  contact_email: string;
  category: string;
  image_url?: string;
}

// Re-export ApiError under alias for backward compatibility
export type { ApiError as ApiErrorType };
