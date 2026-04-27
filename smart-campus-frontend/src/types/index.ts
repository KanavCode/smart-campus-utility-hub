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
