/**
 * Timetable & Electives API Tests
 * Tests timetable management and elective allocation endpoints
 */

const request = require('supertest');
const app = require('../src/app');

// Mock the database
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn() })),
  testConnection: jest.fn().mockResolvedValue(true),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

const { query, transaction } = require('../src/config/db');
const { generateToken } = require('../src/middleware/auth.middleware');

describe('Timetable API Tests', () => {
  let adminToken;

  beforeAll(() => {
    adminToken = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/timetable/teachers', () => {
    test('should get all teachers', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: '123e4567-e89b-12d3-a456-426614174000', full_name: 'Dr. Smith', department: 'Computer Science' },
          { id: '123e4567-e89b-12d3-a456-426614174001', full_name: 'Prof. Johnson', department: 'Mathematics' }
        ]
      });

      const response = await request(app).get('/api/timetable/teachers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teachers).toBeInstanceOf(Array);
      expect(response.body.data.teachers.length).toBe(2);
    });

    test('should filter teachers by department', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/timetable/teachers')
        .query({ department: 'Computer Science' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/timetable/subjects', () => {
    test('should get all subjects', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: '123e4567-e89b-12d3-a456-426614174000', subject_name: 'Data Structures', course_type: 'Theory' }
        ]
      });

      const response = await request(app).get('/api/timetable/subjects');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/timetable/group/:groupId', () => {
    test('should get timetable for a specific group', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            day_of_week: 'Monday',
            period_number: 1,
            subject_name: 'Data Structures',
            teacher_name: 'Dr. Smith',
            room_name: 'Room 301'
          }
        ]
      });

      const response = await request(app)
        .get('/api/timetable/group/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.timetable).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/timetable/teachers (Admin)', () => {
    test('should create a teacher with admin token', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            teacher_code: 'T001',
            full_name: 'Dr. New Teacher',
            department: 'Physics'
          }
        ]
      });

      const response = await request(app)
        .post('/api/timetable/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacher_code: 'T001',
          full_name: 'Dr. New Teacher',
          department: 'Physics',
          email: 'newteacher@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teacher).toBeDefined();
    });

    test('should reject teacher creation without admin privileges', async () => {
      const studentToken = generateToken({ id: 2, email: 'student@example.com', role: 'student' });

      const response = await request(app)
        .post('/api/timetable/teachers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacher_code: 'T001',
          full_name: 'Dr. New Teacher'
        });

      expect(response.status).toBe(403);
    });
  });
});

describe('Electives API Tests', () => {
  let studentToken, adminToken;

  beforeAll(() => {
    studentToken = generateToken({ id: 1, email: 'student@example.com', role: 'student' });
    adminToken = generateToken({ id: 2, email: 'admin@example.com', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/electives', () => {
    test('should get all electives', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, subject_name: 'Machine Learning', max_students: 50, department: 'Computer Science' },
          { id: 2, subject_name: 'Quantum Physics', max_students: 30, department: 'Physics' }
        ]
      });

      const response = await request(app).get('/api/electives');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.electives).toBeInstanceOf(Array);
      expect(response.body.data.electives.length).toBe(2);
    });
  });

  describe('POST /api/electives (Admin)', () => {
    test('should create elective with admin token', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, subject_name: 'New Elective', max_students: 40 }
        ]
      });

      const response = await request(app)
        .post('/api/electives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subject_name: 'New Elective',
          description: 'A new elective subject',
          max_students: 40,
          department: 'Computer Science',
          semester: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.elective).toBeDefined();
    });
  });

  describe('POST /api/electives/choices (Student)', () => {
    test('should allow student to submit elective choices', async () => {
      const mockClient = { query: jest.fn() };
      transaction.mockImplementation(async (callback) => {
        return await callback(mockClient);
      });

      mockClient.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/electives/choices')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          choices: [
            { elective_id: 1, preference_rank: 1 },
            { elective_id: 2, preference_rank: 2 },
            { elective_id: 3, preference_rank: 3 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject choices submission without authentication', async () => {
      const response = await request(app)
        .post('/api/electives/choices')
        .send({
          choices: [{ elective_id: 1, preference_rank: 1 }]
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/electives/my/choices (Student)', () => {
    test('should get student\'s elective choices', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { preference_rank: 1, subject_name: 'Machine Learning' },
          { preference_rank: 2, subject_name: 'Quantum Physics' }
        ]
      });

      const response = await request(app)
        .get('/api/electives/my/choices')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.choices).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/electives/my/allocation (Student)', () => {
    test('should get student\'s allocated elective', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { subject_name: 'Machine Learning', department: 'Computer Science' }
        ]
      });

      const response = await request(app)
        .get('/api/electives/my/allocation')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle no allocation case', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/electives/my/allocation')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.allocation).toBeNull();
    });
  });

  describe('POST /api/electives/allocate (Admin)', () => {
    test('should run allocation algorithm with admin token', async () => {
      const mockClient = { query: jest.fn() };
      transaction.mockImplementation(async (callback) => {
        return await callback(mockClient);
      });

      // Mock database operations
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Clear allocations
        .mockResolvedValueOnce({ // Get students
          rows: [
            { id: 1, full_name: 'Student A', cgpa: 9.5 },
            { id: 2, full_name: 'Student B', cgpa: 8.5 }
          ]
        })
        .mockResolvedValueOnce({ // Get electives
          rows: [
            { id: 1, subject_name: 'ML', max_students: 1 },
            { id: 2, subject_name: 'AI', max_students: 1 }
          ]
        })
        .mockResolvedValue({ rows: [] }); // Other queries

      const response = await request(app)
        .post('/api/electives/allocate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.allocationResults).toBeInstanceOf(Array);
    });

    test('should reject allocation by non-admin', async () => {
      const response = await request(app)
        .post('/api/electives/allocate')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });
});

describe('Integration - Full API Flow', () => {
  test('should handle complete request cycle', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
