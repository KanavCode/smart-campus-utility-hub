/**
 * Authentication API Tests
 * Tests user registration, login, and profile management
 */

const request = require('supertest');
const app = require('../src/app');

// Mock the database module to avoid actual DB connections during tests
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

const { query } = require('../src/config/db');

describe('Authentication API Tests', () => {
  let authToken;
  let testUserId;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      // Mock database responses: first for checking existing user, then for creating user
      query.mockResolvedValueOnce({ rows: [] }); // No existing user
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            full_name: 'Test User',
            email: 'test@example.com',
            role: 'student',
            department: 'Computer Science',
            created_at: new Date()
          }
        ]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'student',
          department: 'Computer Science',
          cgpa: 8.5,
          semester: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject duplicate email registration', async () => {
      // Mock finding existing user
      query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'test@example.com' }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Mock finding user with password
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            full_name: 'Test User',
            email: 'test@example.com',
            password_hash: hashedPassword,
            role: 'student',
            is_active: true,
            created_at: new Date()
          }
        ]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      
      // Store token for protected route tests
      authToken = response.body.data.token;
      testUserId = response.body.data.user.id;
    });

    test('should reject login with invalid email', async () => {
      // Mock no user found
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject login with incorrect password', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            password_hash: hashedPassword,
            is_active: true
          }
        ]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should get profile with valid token', async () => {
      // Generate a valid token
      const { generateToken } = require('../src/middleware/auth.middleware');
      const token = generateToken({ id: 1, email: 'test@example.com', role: 'student' });

      // Mock finding user
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            full_name: 'Test User',
            email: 'test@example.com',
            role: 'student',
            department: 'Computer Science',
            cgpa: 8.5
          }
        ]
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('should update profile with valid data', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const token = generateToken({ id: 1, email: 'test@example.com', role: 'student' });

      // Mock update query
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            full_name: 'Updated Name',
            email: 'test@example.com',
            role: 'student',
            cgpa: 9.0,
            updated_at: new Date()
          }
        ]
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Updated Name',
          cgpa: 9.0
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.full_name).toBe('Updated Name');
    });
  });

  describe('Admin Routes', () => {
    test('should allow admin to get all users', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const adminToken = generateToken({ id: 2, email: 'admin@example.com', role: 'admin' });

      query.mockResolvedValueOnce({
        rows: [
          { id: 1, full_name: 'User 1', email: 'user1@example.com', role: 'student' },
          { id: 2, full_name: 'Admin', email: 'admin@example.com', role: 'admin' }
        ]
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
    });

    test('should reject non-admin from accessing admin routes', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const studentToken = generateToken({ id: 1, email: 'student@example.com', role: 'student' });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('Health Check', () => {
  test('GET /health should return server status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe('OK');
  });
});

describe('404 Handler', () => {
  test('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/api/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
