/**
 * Frontend Type Definitions (v2.0 — Supabase-Ready)
 * All entity IDs are now UUID strings (not integers).
 */

// ─── API Infrastructure ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: string[];
  success?: boolean;
  status?: number;
}

export { ApiError as ApiErrorType };

// ─── Users ───────────────────────────────────────────────────────────

export type UserRole = 'student' | 'admin' | 'faculty';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  cgpa?: number | null;
  semester?: number | null;
  is_active?: boolean;
  auth_provider?: string;
  provider_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData extends Partial<User> {
  password?: string;
}

// ─── Timetable Entities ──────────────────────────────────────────────

export interface TeacherFormData {
  id?: string;
  teacher_code: string;
  full_name: string;
  email?: string;
}

export interface SubjectFormData {
  subject_code?: string;
  subject_name: string;
  course_type?: string;
}

export interface RoomFormData {
  id?: string;
  room_code: string;
  room_name: string;
  capacity?: number;
}

export interface GroupFormData {
  id?: string;
  group_code: string;
  group_name: string;
  department?: string;
  semester?: number;
  academic_year?: string;
}

export interface TimetableSlot {
  id: string;
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

// ─── Campus Events ──────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  description: string;
  contact_email: string;
  category: string;
  image_url?: string;
}

export interface ClubFormData {
  id?: string;
  name: string;
  code?: string;
  description?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  club_id?: string;
  club_name?: string;
  target_department?: string;
  is_featured: boolean;
  tags?: string[];
  image_url?: string;
}

export interface EventFormData {
  id?: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  club_id?: string;
}

// ─── Electives ──────────────────────────────────────────────────────

export interface Elective {
  id: string;
  subject_name: string;
  description: string;
  max_students: number;
  department: string;
  semester: number;
  current_students?: number;
  teacher_name?: string;
}

export interface ElectiveFormData {
  id?: string;
  name: string;
  code?: string;
  seats?: number;
}
