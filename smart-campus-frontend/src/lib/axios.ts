import axios, { AxiosError } from 'axios';
import { ApiError } from '@/types';
import { getApiBaseUrl } from '@/lib/apiConfig';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});


const refreshClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10000,
});

const isRefreshExcludedEndpoint = (url?: string) => {
  if (!url) return false; 

  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].some((endpoint) => url.includes(endpoint));
};

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean });
    const shouldTryRefresh =
      !!originalRequest &&
      !originalRequest._retry &&
      error.response?.status === 401 &&
      !isRefreshExcludedEndpoint(originalRequest.url);

    if (shouldTryRefresh) {
      originalRequest._retry = true;
      try {
        await refreshClient.post('/auth/refresh');
        return api(originalRequest);
      } catch {
        // Fall through to normal error mapping below.
      }
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Network error:', error.message);
      const networkError: ApiError = {
        message: 'Cannot connect to server. Please ensure the backend server is running.',
        code: error.code,
      };
      return Promise.reject(networkError);
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      const timeoutError: ApiError = {
        message: 'Request timeout. Please try again.',
        code: error.code,
      };
      return Promise.reject(timeoutError);
    }
axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// New endpoint for classroom availability
api.get<{ classrooms: Classroom[] }>("/classrooms/availability?date=...&time=...");
    
    // Pass through other errors, structured by types
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export default api;
