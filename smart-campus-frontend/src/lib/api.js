import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * API Configuration
 * Base API client with interceptors for auth and error handling
 */

// Base API URL - points to the backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors and token expiration globally
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;

        case 403:
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          toast.error(data.message || 'Resource not found.');
          break;

        case 422:
          // Validation error
          if (data.errors) {
            Object.values(data.errors).forEach(err => {
              toast.error(err);
            });
          } else {
            toast.error(data.message || 'Validation failed.');
          }
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data.data || response.data; // Handle both response formats
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Register new user
   * @param {Object} userData - { full_name, email, password, role }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data.data || response.data; // Handle both response formats
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} updates - Profile fields to update
   */
  updateProfile: async (updates) => {
    const response = await api.put('/auth/profile', updates);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

/**
 * Events Service
 */
export const eventService = {
  /**
   * Get all events with optional filters
   * @param {Object} filters - { category, search, startDate, endDate }
   */
  getEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single event by ID
   * @param {string} id - Event ID
   */
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  /**
   * Get saved events for current user
   */
  getSavedEvents: async () => {
    const response = await api.get('/events/saved');
    return response.data;
  },

  /**
   * Save/bookmark an event
   * @param {string} eventId - Event ID
   */
  saveEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/save`);
    return response.data;
  },

  /**
   * Unsave/unbookmark an event
   * @param {string} eventId - Event ID
   */
  unsaveEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}/save`);
    return response.data;
  },
};

/**
 * Clubs Service
 */
export const clubService = {
  /**
   * Get all clubs
   */
  getClubs: async () => {
    const response = await api.get('/clubs');
    return response.data;
  },

  /**
   * Get single club by ID
   * @param {string} id - Club ID
   */
  getClubById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },
};

/**
 * Electives Service
 */
export const electiveService = {
  /**
   * Get all available electives
   */
  getElectives: async () => {
    const response = await api.get('/electives');
    return response.data;
  },

  /**
   * Submit elective choices
   * @param {Object} choices - { preferences: [electiveId1, electiveId2, ...] }
   */
  submitChoices: async (choices) => {
    const response = await api.post('/electives/choices', choices);
    return response.data;
  },

  /**
   * Get user's elective allocation
   */
  getMyAllocation: async () => {
    const response = await api.get('/electives/my/allocation');
    return response.data;
  },
};

/**
 * Timetable Service
 */
export const timetableService = {
  /**
   * Get timetable by group ID
   * @param {string} groupId - Group/Class ID
   */
  getTimetableByGroup: async (groupId) => {
    const response = await api.get(`/timetable/group/${groupId}`);
    return response.data;
  },

  /**
   * Get timetable by teacher ID
   * @param {string} teacherId - Teacher ID
   */
  getTimetableByTeacher: async (teacherId) => {
    const response = await api.get(`/timetable/teacher/${teacherId}`);
    return response.data;
  },
};

// Export the configured axios instance for custom use
export default api;
