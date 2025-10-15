/**
 * Authentication Store - Zustand
 * Engineer 💻: Global authentication state management
 * Handles user auth state, tokens, and profile data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Set user and token after successful login/register
       * @param {Object} userData - User data from API
       * @param {string} authToken - JWT token
       */
      login: (userData, authToken) => {
        set({
          user: userData,
          token: authToken,
          isAuthenticated: true,
        });
        localStorage.setItem('authToken', authToken);
      },

      /**
       * Update user profile data
       * @param {Object} updates - Profile updates
       */
      updateUser: (updates) => {
        set(state => ({
          user: { ...state.user, ...updates }
        }));
      },

      /**
       * Clear auth state and logout
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('authToken');
      },

      /**
       * Set loading state
       * @param {boolean} loading - Loading state
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Initialize auth from stored token
       * @param {Object} userData - User data
       */
      initializeAuth: (userData) => {
        const token = localStorage.getItem('authToken');
        if (token && userData) {
          set({
            user: userData,
            token,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
export const useAuth = useAuthStore; // Named export for convenience

