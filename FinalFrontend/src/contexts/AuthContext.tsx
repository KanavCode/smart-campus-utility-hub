import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Backend integration - axios.post('/auth/login', { email, password })
    // For now, create mock user for testing
    const mockUser: User = {
      id: '1',
      email: email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'student'
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-jwt-token');
    
    console.log('Login successful:', { email, password });
  };

  const signup = async (name: string, email: string, password: string) => {
    // TODO: Backend integration - axios.post('/auth/signup', { name, email, password })
    // For now, create mock user for testing
    const mockUser: User = {
      id: '1',
      email: email,
      name: name,
      role: 'student'
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-jwt-token');
    
    console.log('Signup successful:', { name, email, password });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
