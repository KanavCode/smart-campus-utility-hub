# Frontend Integration Guide - Timetable Generator API

## 🌐 Complete Frontend Integration Manual

This guide provides detailed instructions for connecting your React.js frontend to the Intelligent College Timetable Generator backend API.

## 📋 Table of Contents
- [API Base Configuration](#api-base-configuration)
- [Authentication Integration](#authentication-integration)
- [API Service Layer](#api-service-layer)
- [React Components Examples](#react-components-examples)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Production Deployment](#production-deployment)

## 🔧 API Base Configuration

### 1. Environment Setup
Create `.env` file in your React project root:

```env
# Development
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development

# Production
# REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
# REACT_APP_ENVIRONMENT=production
```

### 2. API Client Setup
Create `src/services/api.js`:

```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 🔐 Authentication Integration

### 1. Auth Service
Create `src/services/authService.js`:

```javascript
import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true, data: data.user, token };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  // Register user
  register: async (name, email, password, role = 'teacher') => {
    try {
      const response = await api.post('/auth/register', { 
        name, email, password, role 
      });
      const { token, data } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true, data: data.user, token };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  }
};
```

### 2. Login Component
Create `src/components/Auth/Login.jsx`:

```javascript
import React, { useState } from 'react';
import { authService } from '../../services/authService';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(formData.email, formData.password);
    
    if (result.success) {
      onLogin(result.data);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login to Timetable Generator</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

## 🔧 API Service Layer

### 1. Setup Service
Create `src/services/setupService.js`:

```javascript
import api from './api';

export const setupService = {
  // Get all statistics
  getStats: async () => {
    const response = await api.get('/setup/stats');
    return response.data;
  },

  // Teachers CRUD
  teachers: {
    getAll: async () => {
      const response = await api.get('/setup/teachers');
      return response.data;
    },
    create: async (teacher) => {
      const response = await api.post('/setup/teachers', teacher);
      return response.data;
    },
    update: async (id, teacher) => {
      const response = await api.put(`/setup/teachers/${id}`, teacher);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/setup/teachers/${id}`);
      return response.data;
    }
  },

  // Subjects CRUD
  subjects: {
    getAll: async () => {
      const response = await api.get('/setup/subjects');
      return response.data;
    },
    create: async (subject) => {
      const response = await api.post('/setup/subjects', subject);
      return response.data;
    },
    update: async (id, subject) => {
      const response = await api.put(`/setup/subjects/${id}`, subject);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/setup/subjects/${id}`);
      return response.data;
    }
  },

  // Classes CRUD
  classes: {
    getAll: async () => {
      const response = await api.get('/setup/classes');
      return response.data;
    },
    create: async (classData) => {
      const response = await api.post('/setup/classes', classData);
      return response.data;
    },
    update: async (id, classData) => {
      const response = await api.put(`/setup/classes/${id}`, classData);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/setup/classes/${id}`);
      return response.data;
    }
  },

  // Classrooms CRUD
  classrooms: {
    getAll: async () => {
      const response = await api.get('/setup/classrooms');
      return response.data;
    },
    create: async (classroom) => {
      const response = await api.post('/setup/classrooms', classroom);
      return response.data;
    },
    update: async (id, classroom) => {
      const response = await api.put(`/setup/classrooms/${id}`, classroom);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/setup/classrooms/${id}`);
      return response.data;
    }
  },

  // Class-Subject Mappings
  classSubjects: {
    getAll: async () => {
      const response = await api.get('/setup/class_subject_map');
      return response.data;
    },
    create: async (mapping) => {
      const response = await api.post('/setup/class_subject_map', mapping);
      return response.data;
    },
    bulkCreate: async (mappings) => {
      const response = await api.post('/setup/class-subjects/bulk', { mappings });
      return response.data;
    },
    update: async (id, mapping) => {
      const response = await api.put(`/setup/class_subject_map/${id}`, mapping);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/setup/class_subject_map/${id}`);
      return response.data;
    }
  }
};
```

### 2. Timetable Service
Create `src/services/timetableService.js`:

```javascript
import api from './api';

export const timetableService = {
  // Generate new timetable
  generate: async () => {
    const response = await api.post('/timetable/generate');
    return response.data;
  },

  // Get complete timetable
  getComplete: async () => {
    const response = await api.get('/timetable/complete');
    return response.data;
  },

  // Get class timetable
  getClassTimetable: async (classId) => {
    const response = await api.get(`/timetable/class/${classId}`);
    return response.data;
  },

  // Get teacher timetable
  getTeacherTimetable: async (teacherId) => {
    const response = await api.get(`/timetable/teacher/${teacherId}`);
    return response.data;
  },

  // Update timetable slot
  updateSlot: async (slotId, updates) => {
    const response = await api.put(`/timetable/slot/${slotId}`, updates);
    return response.data;
  },

  // Delete timetable
  delete: async () => {
    const response = await api.delete('/timetable');
    return response.data;
  }
};
```

## 🎛️ React Components Examples

### 1. Dashboard Component
Create `src/components/Dashboard/Dashboard.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { setupService } from '../../services/setupService';
import { timetableService } from '../../services/timetableService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await setupService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTimetable = async () => {
    setGenerating(true);
    try {
      const response = await timetableService.generate();
      alert(`Timetable generated successfully! ${response.data.totalSlots} slots created.`);
      loadStats(); // Refresh stats
    } catch (error) {
      alert('Error generating timetable: ' + error.response?.data?.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>Timetable Generator Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Teachers</h3>
          <p className="stat-number">{stats?.teachers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Subjects</h3>
          <p className="stat-number">{stats?.subjects || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Classes</h3>
          <p className="stat-number">{stats?.classes || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Classrooms</h3>
          <p className="stat-number">{stats?.classrooms || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Timetable Slots</h3>
          <p className="stat-number">{stats?.timetableSlots || 0}</p>
        </div>
      </div>

      <div className="actions">
        <button 
          onClick={handleGenerateTimetable}
          disabled={generating}
          className="generate-btn"
        >
          {generating ? 'Generating...' : 'Generate New Timetable'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
```

### 2. Timetable View Component
Create `src/components/Timetable/TimetableView.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { timetableService } from '../../services/timetableService';
import { setupService } from '../../services/setupService';

const TimetableView = () => {
  const [viewType, setViewType] = useState('complete'); // 'complete', 'class', 'teacher'
  const [selectedId, setSelectedId] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (viewType === 'complete') {
      loadTimetable();
    } else if (viewType === 'class' && selectedId) {
      loadClassTimetable(selectedId);
    } else if (viewType === 'teacher' && selectedId) {
      loadTeacherTimetable(selectedId);
    }
  }, [viewType, selectedId]);

  const loadOptions = async () => {
    try {
      const [classesResponse, teachersResponse] = await Promise.all([
        setupService.classes.getAll(),
        setupService.teachers.getAll()
      ]);
      setClasses(classesResponse.data);
      setTeachers(teachersResponse.data);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const response = await timetableService.getComplete();
      setTimetable(response.data);
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassTimetable = async (classId) => {
    setLoading(true);
    try {
      const response = await timetableService.getClassTimetable(classId);
      setTimetable([response.data]);
    } catch (error) {
      console.error('Error loading class timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherTimetable = async (teacherId) => {
    setLoading(true);
    try {
      const response = await timetableService.getTeacherTimetable(teacherId);
      setTimetable({ teacherSchedule: response.data });
    } catch (error) {
      console.error('Error loading teacher timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimetableGrid = (schedule, title) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = Array.from({ length: 8 }, (_, i) => `Period ${i + 1}`);

    return (
      <div className="timetable-section">
        <h3>{title}</h3>
        <table className="timetable-table">
          <thead>
            <tr>
              <th>Period/Day</th>
              {days.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period}>
                <td className="period-header">{period}</td>
                {days.map(day => {
                  const slot = schedule[day]?.[period];
                  return (
                    <td key={`${day}-${period}`} className="timetable-cell">
                      {slot ? (
                        <div className="slot-content">
                          <div className="subject">{slot.subject}</div>
                          <div className="teacher">{slot.teacher || slot.class}</div>
                          <div className="classroom">{slot.classroom}</div>
                        </div>
                      ) : (
                        <div className="empty-slot">Free</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="timetable-view">
      <div className="view-controls">
        <div className="control-group">
          <label>View Type:</label>
          <select 
            value={viewType} 
            onChange={(e) => setViewType(e.target.value)}
          >
            <option value="complete">Complete Timetable</option>
            <option value="class">Class Timetable</option>
            <option value="teacher">Teacher Timetable</option>
          </select>
        </div>

        {viewType === 'class' && (
          <div className="control-group">
            <label>Select Class:</label>
            <select 
              value={selectedId} 
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {viewType === 'teacher' && (
          <div className="control-group">
            <label>Select Teacher:</label>
            <select 
              value={selectedId} 
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading timetable...</div>}

      {!loading && timetable && (
        <div className="timetable-content">
          {viewType === 'complete' && Array.isArray(timetable) && 
            timetable.map(classSchedule => 
              renderTimetableGrid(
                classSchedule.schedule, 
                classSchedule.className
              )
            )
          }
          
          {viewType === 'class' && Array.isArray(timetable) && timetable.length > 0 &&
            renderTimetableGrid(
              timetable[0].timetable, 
              timetable[0].className
            )
          }
          
          {viewType === 'teacher' && timetable.teacherSchedule &&
            renderTimetableGrid(
              timetable.teacherSchedule.timetable, 
              timetable.teacherSchedule.teacherName
            )
          }
        </div>
      )}
    </div>
  );
};

export default TimetableView;
```

## 📱 State Management (Context API)

### 1. Auth Context
Create `src/contexts/AuthContext.js`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.data);
    }
    return result;
  };

  const register = async (name, email, password, role) => {
    const result = await authService.register(name, email, password, role);
    if (result.success) {
      setUser(result.data);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Main App Component
Update `src/App.js`:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import TimetableView from './components/Timetable/TimetableView';
import TeacherManagement from './components/Setup/TeacherManagement';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/timetable" 
        element={
          <ProtectedRoute>
            <TimetableView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/setup/teachers" 
        element={
          <ProtectedRoute adminOnly={true}>
            <TeacherManagement />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## 🚀 Production Deployment

### 1. Backend Deployment Checklist
- [ ] Set strong JWT secret in production
- [ ] Configure PostgreSQL database
- [ ] Set CORS origins to your frontend domain
- [ ] Enable HTTPS
- [ ] Set up environment variables
- [ ] Configure logging
- [ ] Set up health checks
- [ ] Configure rate limiting

### 2. Frontend Deployment Checklist
- [ ] Update API base URL to production backend
- [ ] Enable production optimizations
- [ ] Configure routing for single-page app
- [ ] Set up HTTPS
- [ ] Configure error boundaries
- [ ] Set up analytics (optional)

### 3. Environment Variables for Production

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
DB_USER=production_user
DB_PASSWORD=strong_production_password
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=timetable_db
JWT_SECRET=super-strong-production-jwt-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env.production):**
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_ENVIRONMENT=production
```

## 🔧 Testing API Endpoints

### Using curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}'

# Get teachers (with token)
curl -X GET http://localhost:5000/api/setup/teachers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Generate timetable
curl -X POST http://localhost:5000/api/timetable/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript fetch:
```javascript
// Example usage in React component
const generateTimetable = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/timetable/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('Timetable generated:', result.data);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

## 📞 Support and Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure backend CORS is configured properly
2. **401 Unauthorized**: Check if token is valid and included in headers
3. **Connection Refused**: Verify backend server is running
4. **Database Errors**: Check PostgreSQL connection and schema

### Debug Tips:
- Check browser Network tab for API requests
- Verify API responses in browser DevTools
- Check backend console logs for errors
- Use Postman/Insomnia for API testing

This guide provides a complete foundation for integrating your React frontend with the timetable generator backend. Customize the components and styling according to your specific requirements!