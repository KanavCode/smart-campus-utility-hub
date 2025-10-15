import { create } from 'zustand';

/**
 * Auth Store (Zustand)
 * Manages authentication state globally
 */

const useAuthStore = create((set) => ({
  // State
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  /**
   * Set user and token after successful authentication
   * @param {Object} userData - User object
   * @param {string} authToken - JWT token
   */
  setAuth: (userData, authToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    set({
      user: userData,
      token: authToken,
      isAuthenticated: true,
    });
  },

  /**
   * Update user data (e.g., after profile update)
   * @param {Object} userData - Updated user object
   */
  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  /**
   * Clear auth state (logout)
   */
  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));

export default useAuthStore;
