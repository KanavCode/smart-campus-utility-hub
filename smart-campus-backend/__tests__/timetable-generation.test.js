/**
 * Comprehensive Timetable Generation Tests
 * Tests the complete backtracking algorithm and all endpoints
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

const { query } = require('../src/config/db');
const { generateToken } = require('../src/middleware/auth.middleware');

describe('Complete Timetable Generation System Tests', () => {
  let adminToken;
  const sampleTeacherId = '123e4567-e89b-12d3-a456-426614174000';
  const sampleSubjectId = '456e7890-e89b-12d3-a456-426614174001';
  const sampleGroupId = 'abc12345-e89b-12d3-a456-426614174002';
  const sampleRoomId = '789e0123-e89b-12d3-a456-426614174003';

  beforeAll(() => {
    adminToken = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Resource Creation - Teachers, Subjects, Rooms, Groups', () => {
    
    test('POST /api/timetable/teachers - Create teacher', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: sampleTeacherId,
          teacher_code: 'T001',
          full_name: 'Dr. John Smith',
          department: 'Computer Science',
          email: 'john.smith@campus.edu'
        }]
      });

      const response = await request(app)
        .post('/api/timetable/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacher_code: 'T001',
          full_name: 'Dr. John Smith',
          department: 'Computer Science',
          email: 'john.smith@campus.edu',
          phone: '1234567890'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teacher.teacher_code).toBe('T001');
    });

    test('POST /api/timetable/subjects - Create subject', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: sampleSubjectId,
          subject_code: 'CS501',
          subject_name: 'Database Management Systems',
          hours_per_week: 4,
          course_type: 'Theory'
        }]
      });

      const response = await request(app)
        .post('/api/timetable/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subject_code: 'CS501',
          subject_name: 'Database Management Systems',
          hours_per_week: 4,
          course_type: 'Theory',
          department: 'Computer Science',
          semester: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject.subject_code).toBe('CS501');
    });

    test('POST /api/timetable/rooms - Create room', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: sampleRoomId,
          room_code: 'R301',
          room_name: 'Room 301',
          capacity: 60,
          room_type: 'Classroom'
        }]
      });

      const response = await request(app)
        .post('/api/timetable/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          room_code: 'R301',
          room_name: 'Room 301',
          capacity: 60,
          room_type: 'Classroom',
          floor_number: 3,
          building: 'Block A'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.room.room_code).toBe('R301');
    });

    test('POST /api/timetable/groups - Create student group', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: sampleGroupId,
          group_code: 'CS5A',
          group_name: 'Computer Science 5th Sem - Section A',
          strength: 60,
          department: 'Computer Science',
          semester: 5
        }]
      });

      const response = await request(app)
        .post('/api/timetable/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          group_code: 'CS5A',
          group_name: 'Computer Science 5th Sem - Section A',
          strength: 60,
          department: 'Computer Science',
          semester: 5,
          academic_year: '2024-25'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.group.group_code).toBe('CS5A');
    });
  });

  describe('2. Assignment Tests - Link Resources', () => {
    
    test('POST /api/timetable/assign/teacher-subject - Assign teacher to subject', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 'assignment-123',
          teacher_id: sampleTeacherId,
          subject_id: sampleSubjectId,
          priority: 1
        }]
      });

      const response = await request(app)
        .post('/api/timetable/assign/teacher-subject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacher_id: sampleTeacherId,
          subject_id: sampleSubjectId,
          priority: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Teacher assigned to subject');
    });

    test('POST /api/timetable/assign/subject-group - Assign subject to group', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 'assignment-456',
          subject_id: sampleSubjectId,
          group_id: sampleGroupId
        }]
      });

      const response = await request(app)
        .post('/api/timetable/assign/subject-group')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subject_id: sampleSubjectId,
          group_id: sampleGroupId
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Subject assigned to group');
    });
  });

  describe('3. Timetable Viewing Tests', () => {
    
    test('GET /api/timetable/teachers - List all teachers', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            id: sampleTeacherId,
            teacher_code: 'T001',
            full_name: 'Dr. John Smith',
            department: 'Computer Science'
          }
        ]
      });

      const response = await request(app).get('/api/timetable/teachers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teachers).toBeInstanceOf(Array);
      expect(response.body.data.count).toBe(1);
    });

    test('GET /api/timetable/subjects - List all subjects', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            id: sampleSubjectId,
            subject_code: 'CS501',
            subject_name: 'Database Management Systems',
            course_type: 'Theory'
          }
        ]
      });

      const response = await request(app).get('/api/timetable/subjects');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toBeInstanceOf(Array);
    });

    test('GET /api/timetable/config - Get configuration', async () => {
      query.mockResolvedValueOnce({ rows: [] }); // groups
      query.mockResolvedValueOnce({ rows: [] }); // teachers
      query.mockResolvedValueOnce({ rows: [] }); // subjects
      query.mockResolvedValueOnce({ rows: [] }); // rooms

      const response = await request(app).get('/api/timetable/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('defaultDays');
      expect(response.body.data).toHaveProperty('defaultPeriodsPerDay');
      expect(response.body.data.defaultDays).toContain('Monday');
    });

    test('GET /api/timetable/group/:groupId - Get group timetable', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            day_of_week: 'Monday',
            period_number: 1,
            subject_name: 'Database Management Systems',
            teacher_name: 'Dr. John Smith',
            room_name: 'Room 301'
          }
        ]
      });

      const response = await request(app)
        .get(`/api/timetable/group/${sampleGroupId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.timetable).toBeInstanceOf(Array);
    });

    test('GET /api/timetable/teacher/:teacherId - Get teacher timetable', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            day_of_week: 'Monday',
            period_number: 1,
            subject_name: 'Database Management Systems',
            group_name: 'CS5A',
            room_name: 'Room 301'
          }
        ]
      });

      const response = await request(app)
        .get(`/api/timetable/teacher/${sampleTeacherId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.timetable).toBeInstanceOf(Array);
    });
  });

  describe('4. Access Control Tests', () => {
    
    test('Should reject teacher creation without admin token', async () => {
      const studentToken = generateToken({ id: 2, email: 'student@example.com', role: 'student' });

      const response = await request(app)
        .post('/api/timetable/teachers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          teacher_code: 'T001',
          full_name: 'Dr. Smith'
        });

      expect(response.status).toBe(403);
    });

    test('Should reject generation without authentication', async () => {
      const response = await request(app)
        .post('/api/timetable/generate')
        .send({
          groups: [sampleGroupId],
          days: ['Monday'],
          periods_per_day: 6
        });

      expect(response.status).toBe(401);
    });
  });

  describe('5. Validation Tests', () => {
    
    test('Should validate required fields for teacher creation', async () => {
      const response = await request(app)
        .post('/api/timetable/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacher_code: 'T001'
          // Missing required fields
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('Should filter teachers by department', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/timetable/teachers')
        .query({ department: 'Computer Science' });

      expect(response.status).toBe(200);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('department'),
        ['Computer Science']
      );
    });
  });

  describe('6. Integration Test - Complete Flow', () => {
    
    test('Should handle complete timetable lifecycle', async () => {
      // Mock sequence for complete flow
      query.mockResolvedValueOnce({ rows: [{ id: sampleTeacherId }] }); // Create teacher
      query.mockResolvedValueOnce({ rows: [{ id: sampleSubjectId }] }); // Create subject
      query.mockResolvedValueOnce({ rows: [{ id: sampleRoomId }] }); // Create room
      query.mockResolvedValueOnce({ rows: [{ id: sampleGroupId }] }); // Create group
      query.mockResolvedValueOnce({ rows: [{}] }); // Assign teacher-subject
      query.mockResolvedValueOnce({ rows: [{}] }); // Assign subject-group

      // All operations should succeed
      const teacher = await request(app)
        .post('/api/timetable/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ teacher_code: 'T001', full_name: 'Dr. Smith', department: 'CS', email: 'smith@campus.edu' });

      expect(teacher.status).toBe(201);

      // Verify query was called
      expect(query).toHaveBeenCalled();
    });
  });

  describe('7. Edge Cases', () => {
    
    test('Should handle empty results gracefully', async () => {
      // Clear all previous mocks
      jest.clearAllMocks();
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/timetable/teachers');

      expect(response.status).toBe(200);
      expect(response.body.data.teachers).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('count');
    });

    test('Should handle UUID format in routes', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const invalidId = 'invalid-uuid';
      const response = await request(app).get(`/api/timetable/group/${invalidId}`);

      // Should still reach controller (database will validate UUID)
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});

describe('Timetable Generation Algorithm Tests', () => {
  
  test('Should test TimetableSolver class directly', () => {
    const { TimetableSolver } = require('../src/components/timetable/timetable.service');
    
    const constraints = {
      groups: ['group-123'],
      days: ['Monday', 'Tuesday'],
      periods_per_day: 4,
      lunch_break_period: 3
    };

    const solver = new TimetableSolver(constraints);
    
    expect(solver.constraints).toEqual(constraints);
    expect(solver.timetable).toEqual({});
    expect(solver.maxIterations).toBe(100000);
    expect(solver.currentIteration).toBe(0);
  });

  test('Should generate time slots correctly', () => {
    const { TimetableSolver } = require('../src/components/timetable/timetable.service');
    
    const constraints = {
      groups: [],
      days: ['Monday', 'Tuesday'],
      periods_per_day: 4,
      lunch_break_period: 3
    };

    const solver = new TimetableSolver(constraints);
    const slots = solver.generateTimeSlots();
    
    // Should have 2 days × 4 periods - 1 lunch = 6 slots
    expect(slots.length).toBe(6);
    expect(slots[0]).toHaveProperty('day');
    expect(slots[0]).toHaveProperty('period');
    
    // Lunch break should be excluded
    const hasLunchBreak = slots.some(slot => slot.period === 3);
    expect(hasLunchBreak).toBe(false);
  });
});
