import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService, RegisterRequest } from '@/services/authService';
import { User, ApiError } from '@/types';
import { AxiosError } from 'axios';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission,
  PERMISSIONS 
} from '@/utils/permissions';


// User interface is now imported from @/types

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithToken: () => Promise<User>;
  register: (userData: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; department?: string; cgpa?: number; semester?: number }) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  // Permission checking methods
  hasPermission: (permission: typeof PERMISSIONS[keyof typeof PERMISSIONS]) => boolean;
  hasAllPermissions: (permissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][]) => boolean;
  hasAnyPermission: (permissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const COOKIE_AUTH_STATE = 'cookie-authenticated';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from cookie-backed session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authService.getProfile();
        const currentUser = response.data.user as User;
        setUser(currentUser);
        setToken(COOKIE_AUTH_STATE);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const revalidateSession = async () => {
      try {
        const response = await authService.getProfile();
        const currentUser = response.data.user as User;
        setUser(currentUser);
        setToken(COOKIE_AUTH_STATE);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
      }
    };

    const handleWindowFocus = () => {
      void revalidateSession();
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      const { user: userData } = response.data;
      setUser(userData as User);
      setToken(COOKIE_AUTH_STATE);
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData as User;
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      throw { message: errorMessage } as ApiError;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      const { user: newUser } = response.data;
      setUser(newUser as User);
      setToken(COOKIE_AUTH_STATE);
      
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser as User;
    } catch (error) {
      console.error('Registration error:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Registration failed. Please try again.';
      throw { message: errorMessage } as ApiError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: { full_name?: string; department?: string; cgpa?: number; semester?: number }): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authService.updateProfile(updates);
      
      const updatedUser = response.data.user;
      setUser(updatedUser as User);
      
      return updatedUser as User;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error as ApiError;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.changePassword(oldPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (): Promise<User> => {
    try {
      setIsLoading(true);
      
      const response = await authService.getProfile();
      const userData = response.data.user;
      
      setUser(userData as User);
      setToken(COOKIE_AUTH_STATE);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData as User;
    } catch (error) {
      console.error('SSO Login error:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    loginWithToken,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isLoading,
    // Permission checking methods
    hasPermission: (permission) => hasPermission(user?.role, permission),
    hasAllPermissions: (permissions) => hasAllPermissions(user?.role, permissions),
    hasAnyPermission: (permissions) => hasAnyPermission(user?.role, permissions),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
