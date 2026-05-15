import { api } from '@/lib/axios';
import { withServiceError } from './serviceUtils';
import { User, ApiResponse, ApiError, UserRole } from '@/types';
import { AxiosError } from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  department?: string;
  // Student-specific fields
  
  semester?: number;
  cgpa?: number;
}

export type AuthResponse = ApiResponse<{
  user: User;
}>;

export interface ProfileUpdate {
  full_name?: string;
  department?: string;
  cgpa?: number;
  semester?: number;
}

export const authService = {
  /**
   * Login user with email and password
   * Works for both student and admin roles
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      // Extract error message from various possible error formats
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error || 
        axiosError.message || 
        'Login failed. Please check your credentials and try again.';
      
      // Check if backend is reachable
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
        throw { 
          message: 'Cannot connect to server. Please ensure the backend server is running.' 
        } as ApiError;
      }
      
      throw { message: errorMessage } as ApiError;
    }
  },

  /**
   * Register new user
   * Supports both student and admin registration
   * Student role requires: cgpa, semester
   * Admin role: department only
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      // Validate role-specific fields
      if (userData.role === 'student') {
        if (!userData.cgpa || !userData.semester) {
          throw { message: 'CGPA and Semester are required for students' } as ApiError;
        }
        if (userData.cgpa < 0 || userData.cgpa > 10) {
          throw { message: 'CGPA must be between 0 and 10' } as ApiError;
        }
        if (userData.semester < 1 || userData.semester > 8) {
          throw { message: 'Semester must be between 1 and 8' } as ApiError;
        }
      }

      const payload: Partial<RegisterRequest> = {
        full_name: userData.full_name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        department: userData.department || undefined
      };

      // Only add cgpa and semester for students
      if (userData.role === 'student') {
        payload.semester = userData.semester;
        payload.cgpa = userData.cgpa;
      }

      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      // If it's the specific validation errors we just threw
      if (!(axiosError instanceof AxiosError) && (axiosError as ApiError).message) {
        throw axiosError;
      }

      // Extract error message from various possible error formats
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error || 
        axiosError.message || 
        'Registration failed. Please check your information and try again.';
      
      // Check if backend is reachable
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
        throw { 
          message: 'Cannot connect to server. Please ensure the backend server is running.' 
        } as ApiError;
      }
      
      // Handle validation errors
      if (axiosError.response?.status === 400) {
        const validationErrors = axiosError.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          throw { message: validationErrors.join(', ') } as ApiError;
        }
      }
      
      throw { message: errorMessage } as ApiError;
    }
  },

  /**
   * Get current authenticated user profile
   * Protected route - requires valid JWT token
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
      return data;
    } catch (error) {
      withServiceError(error, 'Failed to fetch profile');
    }
  },

  /**
   * Update user profile
   * Can update: full_name, department, cgpa (for students), semester (for students)
   * Protected route - requires valid JWT token
   */
  updateProfile: async (updates: ProfileUpdate): Promise<ApiResponse<{ user: User }>> => {
    try {
      const { data } = await api.put<ApiResponse<{ user: User }>>('/auth/profile', updates);
      
      // Update localStorage user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return data;
    } catch (error) {
      withServiceError(error, 'Failed to update profile');
    }
  },

  /**
   * Change user password
   * Requires old and new password
   * Protected route - requires valid JWT token
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    try {
      const { data } = await api.post<ApiResponse<null>>('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return data;
    } catch (error) {
      withServiceError(error, 'Failed to change password');
    }
  },

  /**
   * Logout user
   * Clears local user state and invalidates auth cookie server-side
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('user');
    } catch (error) {
      localStorage.removeItem('user');
      withServiceError(error, 'Logout failed');
    }
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) as User : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('user');
  },

  /**
   * Check if user has admin role
   */
  isAdmin: (): boolean => {
    const user = authService.getStoredUser();
    return user?.role === 'admin';
  },

  /**
   * Check if user is student
   */
  isStudent: (): boolean => {
    const user = authService.getStoredUser();
    return user?.role === 'student';
    },

    /**
     * Request password reset link via email
     */
    forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
      try {
        const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        const errorMessage = 
          axiosError.response?.data?.message || 
          axiosError.message || 
          'Failed to send password reset email. Please try again.';
        throw { message: errorMessage } as ApiError;
      }
    },

    /**
     * Reset password using token from email link
     */
    resetPassword: async (
      token: string,
      newPassword: string,
      confirmPassword: string
    ): Promise<ApiResponse<{ message: string }>> => {
      try {
        const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
          token,
          newPassword,
          confirmPassword
        });
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        const errorMessage = 
          axiosError.response?.data?.message || 
          axiosError.message || 
          'Failed to reset password. Please check your information and try again.';
        throw { message: errorMessage } as ApiError;
      }
    }
};
