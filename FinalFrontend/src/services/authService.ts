import { api } from '@/lib/axios';

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

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      full_name: string;
      email: string;
      role: string;
      department?: string;
      cgpa?: number;
      semester?: number;
      is_active: boolean;
      created_at: string;
    };
    token: string;
  };
}

export const authService = {
  /**
   * Login user with email and password
   * Works for both student and admin roles
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Store token in localStorage
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error: any) {
      // Extract error message from various possible error formats
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Login failed. Please check your credentials and try again.';
      
      // Check if backend is reachable
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw { 
          message: 'Cannot connect to server. Please ensure the backend server is running on http://localhost:5000' 
        };
      }
      
      throw { message: errorMessage };
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
          throw new Error('CGPA and Semester are required for students');
        }
        if (userData.cgpa < 0 || userData.cgpa > 10) {
          throw new Error('CGPA must be between 0 and 10');
        }
        if (userData.semester < 1 || userData.semester > 8) {
          throw new Error('Semester must be between 1 and 8');
        }
      }

      const payload: any = {
        full_name: userData.full_name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        department: userData.department || null
      };

      // Only add cgpa and semester for students
      if (userData.role === 'student') {
        payload.semester = userData.semester;
        payload.cgpa = userData.cgpa;
      }

      const { data } = await api.post('/auth/register', payload);
      
      // Store token in localStorage
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error: any) {
      // Extract error message from various possible error formats
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Registration failed. Please check your information and try again.';
      
      // Check if backend is reachable
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw { 
          message: 'Cannot connect to server. Please ensure the backend server is running on http://localhost:5000' 
        };
      }
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          throw { message: validationErrors.join(', ') };
        }
      }
      
      throw { message: errorMessage };
    }
  },

  /**
   * Get current authenticated user profile
   * Protected route - requires valid JWT token
   */
  getProfile: async (): Promise<{ success: boolean; data: { user: any } }> => {
    try {
      const { data } = await api.get('/auth/profile');
      return data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  /**
   * Update user profile
   * Can update: full_name, department, cgpa (for students), semester (for students)
   * Protected route - requires valid JWT token
   */
  updateProfile: async (updates: any): Promise<{ success: boolean; message: string; data: { user: any } }> => {
    try {
      const { data } = await api.put('/auth/profile', updates);
      
      // Update localStorage user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  /**
   * Change user password
   * Requires old and new password
   * Protected route - requires valid JWT token
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data } = await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },

  /**
   * Logout user
   * Clears local storage and removes token
   */
  logout: async (): Promise<void> => {
    try {
      // Optional: Call backend logout endpoint if needed
      // await api.post('/auth/logout');
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error: any) {
      // Still clear local storage even if logout fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get stored token from localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
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
  }
};
