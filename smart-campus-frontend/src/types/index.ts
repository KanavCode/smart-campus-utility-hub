export interface ApiError {
  message?: string;
  code?: string;
  status?: number;
}

export type UserRole = 'student' | 'admin' | 'faculty' | string;

export interface User {
  id?: string | number;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  cgpa?: number | null;
  semester?: number | null;
  is_active?: boolean;
}

export interface UserFormData extends Partial<User> {
  password?: string;
}

export interface TeacherFormData {
  id?: string | number;
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
  id?: string | number;
  room_code: string;
  room_name: string;
  capacity?: number;
}

export interface GroupFormData {
  id?: string | number;
  group_code: string;
  group_name: string;
  department?: string;
  semester?: number;
  academic_year?: string;
}

export interface ClubFormData {
  id?: string | number;
  name: string;
  code?: string;
  description?: string;
}

export interface EventFormData {
  id?: string | number;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  club_id?: string | number;
}

export interface ElectiveFormData {
  id?: string | number;
  name: string;
  code?: string;
  seats?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
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

export { ApiError as ApiErrorType };
/**
 * Common API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standard API error shape
 */
export interface ApiError {
  message: string;
  code?: string;
  errors?: string[];
  success?: boolean;
}

/**
 * User Role type
 */
export type UserRole = 'student' | 'admin' | 'faculty';

/**
 * User interface
 */
export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  cgpa?: number;
  semester?: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Event interface
 */
export interface CampusEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  club_id?: number;
  club_name?: string;
  target_department?: string;
  is_featured: boolean;
  tags?: string[];
  image_url?: string;
}

/**
 * Elective interface
 */
export interface Elective {
  id: number;
  subject_name: string;
  description: string;
  max_students: number;
  department: string;
  semester: number;
  current_students?: number;
  teacher_name?: string;
}

/**
 * Club interface
 */
export interface Club {
  id: number;
  name: string;
  description: string;
  contact_email: string;
  category: string;
  image_url?: string;
}
