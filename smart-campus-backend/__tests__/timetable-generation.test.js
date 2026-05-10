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
      // data query
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
      // count query
      query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const response = await request(app).get('/api/timetable/teachers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teachers).toBeInstanceOf(Array);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
    });

    test('GET /api/timetable/subjects - List all subjects', async () => {
      // data query
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
      // count query
      query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const response = await request(app).get('/api/timetable/subjects');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeDefined();
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
      query.mockResolvedValueOnce({ rows: [] }); // data query
      query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // count query

      const response = await request(app)
        .get('/api/timetable/teachers')
        .query({ department: 'Computer Science' });

      expect(response.status).toBe(200);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('department'),
        expect.arrayContaining(['Computer Science'])
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
      // Reset mock queue to clear any leftover mocks from previous tests
      query.mockReset();
      query.mockResolvedValueOnce({ rows: [] }); // data query
      query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // count query

      const response = await request(app).get('/api/timetable/teachers');

      expect(response.status).toBe(200);
      expect(response.body.data.teachers).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('count');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.total).toBe(0);
    });

    test('Should handle UUID format in routes', async () => {
      const invalidId = 'invalid-uuid';
      const response = await request(app).get(`/api/timetable/group/${invalidId}`);

      // Should be blocked by validation middleware with 400 status
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
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

describe('Conflict Detection & Smart Suggestion Engine - Issue #96', () => {
  const { ConflictDetector } = require('../src/components/timetable/conflict.detector');
  const { SuggestionEngine } = require('../src/components/timetable/suggestion.engine');
  const { detectConflictsAndSuggest } = require('../src/components/timetable/timetable.service');

  let mockState;

  beforeEach(() => {
    // Setup mock timetable state
    mockState = {
      timetable: {
        Monday: { 1: [], 2: [], 3: [], 4: [], 5: [] },
        Tuesday: { 1: [], 2: [], 3: [], 4: [], 5: [] }
      },
      teacherSchedule: {
        Monday: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() },
        Tuesday: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() }
      },
      roomSchedule: {
        Monday: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() },
        Tuesday: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() }
      },
      groupSchedule: {
        Monday: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() },
        Tuesday: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() }
      },
      constraints: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        periods_per_day: 5,
        lunch_break_period: 3
      }
    };
  });

  describe('ConflictDetector', () => {
    let detector;

    beforeEach(() => {
      detector = new ConflictDetector(
        mockState.timetable,
        mockState.teacherSchedule,
        mockState.roomSchedule,
        mockState.groupSchedule
      );
    });

    test('Should detect TEACHER_CONFLICT when teacher already scheduled', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 30 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      // Pre-occupy teacher on Monday period 2
      mockState.teacherSchedule['Monday']['2'].add('T1');

      const conflicts = await detector.detectConflicts(teacher, subject, group, room, 'Monday', 2);

      expect(conflicts).toContainEqual(expect.objectContaining({
        type: 'TEACHER_CONFLICT',
        severity: 'HIGH'
      }));
    });

    test('Should detect ROOM_CONFLICT when room already occupied', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 30 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      // Pre-occupy room on Monday period 2
      mockState.roomSchedule['Monday']['2'].add('R1');

      const conflicts = await detector.detectConflicts(teacher, subject, group, room, 'Monday', 2);

      expect(conflicts).toContainEqual(expect.objectContaining({
        type: 'ROOM_CONFLICT',
        severity: 'HIGH'
      }));
    });

    test('Should detect GROUP_CONFLICT when group already scheduled', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 30 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      // Pre-occupy group on Monday period 2
      mockState.groupSchedule['Monday']['2'].add('G1');

      const conflicts = await detector.detectConflicts(teacher, subject, group, room, 'Monday', 2);

      expect(conflicts).toContainEqual(expect.objectContaining({
        type: 'GROUP_CONFLICT',
        severity: 'HIGH'
      }));
    });

    test('Should detect CAPACITY_CONFLICT when room too small', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 50 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 30, room_type: 'Classroom' };

      const conflicts = await detector.detectConflicts(teacher, subject, group, room, 'Monday', 2);

      expect(conflicts).toContainEqual(expect.objectContaining({
        type: 'CAPACITY_CONFLICT',
        severity: 'MEDIUM'
      }));
    });

    test('Should detect ROOM_TYPE_CONFLICT for lab class in classroom', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Physics Lab', course_type: 'Lab' };
      const group = { id: 'G1', group_name: 'Group A', strength: 20 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      const conflicts = await detector.detectConflicts(teacher, subject, group, room, 'Monday', 2);

      expect(conflicts).toContainEqual(expect.objectContaining({
        type: 'ROOM_TYPE_CONFLICT',
        severity: 'MEDIUM'
      }));
    });

    test('Should return empty array when no conflicts', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 30 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      const conflicts = await detector.detectConflicts(teacher, subject, group, room, 'Monday', 2);

      expect(conflicts.length).toBe(0);
    });

    test('Should detect multiple conflicts simultaneously', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Physics Lab', course_type: 'Lab' };
      const group = { id: 'G1', group_name: 'Group A', strength: 50 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 30, room_type: 'Classroom' };

      // Create multiple conflicts
      mockState.teacherSchedule['Monday']['2'].add('T1');
      mockState.roomSchedule['Monday']['2'].add('R1');

      const conflicts = await detector.detectConflicts(teacher, subject, group, room, 'Monday', 2);

      expect(conflicts.length).toBeGreaterThan(1);
      expect(conflicts.some(c => c.type === 'TEACHER_CONFLICT')).toBe(true);
      expect(conflicts.some(c => c.type === 'ROOM_CONFLICT')).toBe(true);
    });
  });

  describe('SuggestionEngine', () => {
    let engine;

    beforeEach(() => {
      engine = new SuggestionEngine(
        mockState.timetable,
        mockState.constraints,
        mockState.teacherSchedule,
        mockState.roomSchedule,
        mockState.groupSchedule
      );
    });

    test('Should generate suggestions for available slots', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 30 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      const suggestions = await engine.getSuggestions(teacher, subject, group, room, 'Monday', 2);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    test('Should return top 3 suggestions sorted by score', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 30 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      const suggestions = await engine.getSuggestions(teacher, subject, group, room, 'Monday', 2);

      // Verify max 3 suggestions
      expect(suggestions.length).toBeLessThanOrEqual(3);

      // Verify sorted by score descending
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].score).toBeGreaterThanOrEqual(suggestions[i + 1].score);
      }

      // Verify each suggestion has required fields
      suggestions.forEach(s => {
        expect(s).toHaveProperty('day');
        expect(s).toHaveProperty('period');
        expect(s).toHaveProperty('score');
        expect(s).toHaveProperty('rank');
      });
    });

    test('Should score proximity correctly', () => {
      // Same day, adjacent period should have high proximity
      const score1 = engine.scoreProximity('Monday', 3, 'Monday', 2);
      expect(score1).toBeGreaterThan(2);

      // Different day should have lower proximity
      const score2 = engine.scoreProximity('Tuesday', 2, 'Monday', 2);
      expect(score2).toBeLessThan(score1);
    });

    test('Should score teacher load balance', () => {
      // Day with no classes should score high
      const score1 = engine.scoreTeacherLoad('T1', 'Monday');
      expect(score1).toBe(4); // Max score

      // Pre-occupy 2 slots for teacher on Tuesday
      mockState.teacherSchedule['Tuesday']['2'].add('T1');
      mockState.teacherSchedule['Tuesday']['4'].add('T1');

      const score2 = engine.scoreTeacherLoad('T1', 'Tuesday');
      expect(score2).toBeLessThan(score1);
    });

    test('Should score room utilization correctly', () => {
      // Optimal utilization (70-85%)
      const score1 = engine.scoreRoomUtilization(35, 50); // 70%
      expect(score1).toBe(3);

      // Good utilization (60-95%)
      const score2 = engine.scoreRoomUtilization(40, 50); // 80%
      expect(score2).toBe(3);

      // Poor utilization
      const score3 = engine.scoreRoomUtilization(10, 50); // 20%
      expect(score3).toBe(0);
    });

    test('Should validate slot constraints properly', async () => {
      const teacher = { id: 'T1', full_name: 'Dr. Smith' };
      const subject = { id: 'S1', subject_name: 'Database', course_type: 'Theory' };
      const group = { id: 'G1', group_name: 'Group A', strength: 30 };
      const room = { id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' };

      // Pre-occupy a slot
      mockState.teacherSchedule['Monday']['1'].add('T1');

      // Should not suggest occupied slot
      const isValid = await engine.isSlotValid(teacher, subject, group, room, 'Monday', 1);
      expect(isValid).toBe(false);

      // Should suggest empty slot
      const isValidEmpty = await engine.isSlotValid(teacher, subject, group, room, 'Tuesday', 1);
      expect(isValidEmpty).toBe(true);
    });


  });

  describe('Service Integration - detectConflictsAndSuggest', () => {
    
    test('Should return suggestions when conflicts detected', async () => {
      const { query } = require('../src/config/db');
      query.mockReset();

      // Mock Teacher.findById
      query.mockResolvedValueOnce({ rows: [{ id: 'T1', full_name: 'Dr. Smith' }] });
      // Mock Subject.findById
      query.mockResolvedValueOnce({ rows: [{ id: 'S1', subject_name: 'Database', course_type: 'Theory' }] });
      // Mock StudentGroup.findById
      query.mockResolvedValueOnce({ rows: [{ id: 'G1', group_name: 'Group A', strength: 30 }] });
      // Mock Room.findById
      query.mockResolvedValueOnce({ rows: [{ id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' }] });

      // Pre-create a conflict
      mockState.teacherSchedule['Monday']['2'].add('T1');

      const result = await detectConflictsAndSuggest(
        { teacher_id: 'T1', subject_id: 'S1', group_id: 'G1', room_id: 'R1', day: 'Monday', period: 2 },
        mockState
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('conflicts');
      expect(result).toHaveProperty('suggestions');
      expect(result.conflicts.length).toBeGreaterThan(0);
    });

    test('Should return success when no conflicts', async () => {
      const { query } = require('../src/config/db');
      query.mockReset();

      query.mockResolvedValueOnce({ rows: [{ id: 'T1', full_name: 'Dr. Smith' }] });
      query.mockResolvedValueOnce({ rows: [{ id: 'S1', subject_name: 'Database', course_type: 'Theory' }] });
      query.mockResolvedValueOnce({ rows: [{ id: 'G1', group_name: 'Group A', strength: 30 }] });
      query.mockResolvedValueOnce({ rows: [{ id: 'R1', room_name: 'Room 101', capacity: 50, room_type: 'Classroom' }] });

      const result = await detectConflictsAndSuggest(
        { teacher_id: 'T1', subject_id: 'S1', group_id: 'G1', room_id: 'R1', day: 'Monday', period: 2 },
        mockState
      );

      expect(result.success).toBe(true);
      expect(result.conflicts.length).toBe(0);
    });
  });
});
