/**
 * Electives API Tests
 * Tests elective CRUD operations and admin-only routes
 */

const request = require('supertest');
const app = require('../src/app');

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

jest.mock('../src/components/electives/elective.service', () => ({
  createElective: jest.fn(),
  listElectives: jest.fn(),
  getElectiveById: jest.fn(),
  updateElective: jest.fn(),
  deleteElective: jest.fn(),
  submitChoices: jest.fn(),
  getMyChoices: jest.fn(),
  getMyAllocation: jest.fn(),
  getMyWaitlist: jest.fn(),
  allocateElectives: jest.fn(),
  processWaitlist: jest.fn()
}));

const { query } = require('../src/config/db');
const electiveService = require('../src/components/electives/elective.service');

describe('Electives API Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/electives', () => {
    test('should return list of electives', async () => {
      const mockElectives = [
        { id: 1, subject_name: 'AI Fundamentals', description: 'Intro to AI', max_students: 30, department: 'Computer Science', semester: 5 },
        { id: 2, subject_name: 'Machine Learning', description: 'ML basics', max_students: 25, department: 'Computer Science', semester: 5 }
      ];
      electiveService.listElectives.mockResolvedValue(mockElectives);

      const response = await request(app).get('/api/electives');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.electives).toBeInstanceOf(Array);
      expect(response.body.data.electives.length).toBe(2);
    });

    test('should return empty array when no electives exist', async () => {
      electiveService.listElectives.mockResolvedValue([]);

      const response = await request(app).get('/api/electives');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.electives).toEqual([]);
    });

    test('should filter electives by department and semester', async () => {
      const mockElectives = [{ id: 1, subject_name: 'AI Fundamentals', department: 'Computer Science', semester: 5 }];
      electiveService.listElectives.mockResolvedValue(mockElectives);

      const response = await request(app).get('/api/electives?department=Computer Science&semester=5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(electiveService.listElectives).toHaveBeenCalledWith({ department: 'Computer Science', semester: '5' });
    });
  });

  describe('GET /api/electives/:id', () => {
    test('should return single elective by id', async () => {
      const mockElective = { id: 1, subject_name: 'AI Fundamentals', description: 'Intro to AI', max_students: 30 };
      electiveService.getElectiveById.mockResolvedValue(mockElective);

      const response = await request(app).get('/api/electives/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.elective.subject_name).toBe('AI Fundamentals');
    });

    test('should return 404 when elective not found', async () => {
      electiveService.getElectiveById.mockResolvedValue(null);

      const response = await request(app).get('/api/electives/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/electives', () => {
    test('should create new elective with admin token', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const adminToken = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });

      const mockCreatedElective = { id: 1, subject_name: 'AI Fundamentals', description: 'Intro to AI', max_students: 30, department: 'Computer Science', semester: 5 };
      electiveService.createElective.mockResolvedValue(mockCreatedElective);

      const response = await request(app)
        .post('/api/electives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subject_name: 'AI Fundamentals',
          description: 'Intro to AI',
          max_students: 30,
          department: 'Computer Science',
          semester: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.elective).toBeDefined();
    });

    test('should reject non-admin from creating elective', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const studentToken = generateToken({ id: 2, email: 'student@example.com', role: 'student' });

      const response = await request(app)
        .post('/api/electives')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subject_name: 'AI Fundamentals',
          description: 'Intro to AI',
          max_students: 30
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/electives')
        .send({
          subject_name: 'AI Fundamentals',
          description: 'Intro to AI'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/electives/:id', () => {
    test('should update elective with admin token', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const adminToken = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });

      const mockUpdatedElective = { id: 1, subject_name: 'AI Advanced', description: 'Advanced AI', max_students: 25 };
      electiveService.updateElective.mockResolvedValue(mockUpdatedElective);

      const response = await request(app)
        .put('/api/electives/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subject_name: 'AI Advanced',
          max_students: 25
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.elective.subject_name).toBe('AI Advanced');
    });

    test('should reject non-admin from updating elective', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const studentToken = generateToken({ id: 2, email: 'student@example.com', role: 'student' });

      const response = await request(app)
        .put('/api/electives/1')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subject_name: 'AI Advanced'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should return 404 when updating non-existent elective', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const adminToken = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });

      electiveService.updateElective.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/electives/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subject_name: 'AI Advanced'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/electives/:id', () => {
    test('should delete elective with admin token', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const adminToken = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });

      electiveService.deleteElective.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/electives/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Elective deleted successfully');
    });

    test('should reject non-admin from deleting elective', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const studentToken = generateToken({ id: 2, email: 'student@example.com', role: 'student' });

      const response = await request(app)
        .delete('/api/electives/1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should return 404 when deleting non-existent elective', async () => {
      const { generateToken } = require('../src/middleware/auth.middleware');
      const adminToken = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });

      electiveService.deleteElective.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/electives/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});