import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService, RegisterRequest } from '@/services/authService';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'admin';
  department?: string;
  cgpa?: number;
  semester?: number;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      const { user: userData, token: newToken } = response.data;
      setUser(userData as User);
      setToken(newToken);
      
      // Store in localStorage
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData as User;
    } catch (error: any) {
      console.error('Login error:', error);
      // Ensure error has a message property
      const errorMessage = error?.message || 'Login failed. Please try again.';
      throw { message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      const { user: newUser, token: newToken } = response.data;
      setUser(newUser as User);
      setToken(newToken);
      
      // Store in localStorage
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser as User;
    } catch (error: any) {
      console.error('Registration error:', error);
      // Ensure error has a message property
      const errorMessage = error?.message || 'Registration failed. Please try again.';
      throw { message: errorMessage };
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

  const updateProfile = async (updates: any): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await authService.updateProfile(updates);
      
      const updatedUser = response.data.user;
      setUser(updatedUser as User);
      
      return updatedUser as User;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
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

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isLoading
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
