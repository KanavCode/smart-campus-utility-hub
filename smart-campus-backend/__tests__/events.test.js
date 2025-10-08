/**
 * Campus Events & Clubs API Tests
 * Tests event and club management endpoints
 */

const request = require('supertest');
const app = require('../src/app');

// Mock the database
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
const { generateToken } = require('../src/middleware/auth.middleware');

describe('Campus Events API Tests', () => {
  let studentToken, adminToken;

  beforeAll(() => {
    studentToken = generateToken({ id: 1, email: 'student@example.com', role: 'student' });
    adminToken = generateToken({ id: 2, email: 'admin@example.com', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    test('should get all events (public)', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: 'Tech Conference',
            description: 'Annual tech event',
            start_time: new Date(),
            club_name: 'Tech Club'
          }
        ]
      });

      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toBeInstanceOf(Array);
    });

    test('should filter events by search query', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/events')
        .query({ search: 'tech' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should filter events by tag', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/events')
        .query({ tag: 'workshop' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/events/:id', () => {
    test('should get event by ID', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: 'Tech Conference',
            club_name: 'Tech Club'
          }
        ]
      });

      const response = await request(app).get('/api/events/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBeDefined();
    });

    test('should return 404 for non-existent event', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/events/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/events (Admin only)', () => {
    test('should create event with admin token', async () => {
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: 'New Event',
            start_time: new Date(),
            end_time: new Date()
          }
        ]
      });

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Event',
          description: 'Test event',
          location: 'Main Hall',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          club_id: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBeDefined();
    });

    test('should reject event creation without admin privileges', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'New Event',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          club_id: 1
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should reject event creation without authentication', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          title: 'New Event',
          club_id: 1
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/events/:id/save (Protected)', () => {
    test('should allow authenticated user to save event', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Event exists
      query.mockResolvedValueOnce({ rows: [] }); // Not already saved
      query.mockResolvedValueOnce({ rows: [{ user_id: 1, event_id: 1 }] }); // Insert successful

      const response = await request(app)
        .post('/api/events/1/save')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject saving event without authentication', async () => {
      const response = await request(app).post('/api/events/1/save');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/events/saved/my-events (Protected)', () => {
    test('should get user\'s saved events', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, title: 'Saved Event 1' },
          { id: 2, title: 'Saved Event 2' }
        ]
      });

      const response = await request(app)
        .get('/api/events/saved/my-events')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toBeInstanceOf(Array);
    });
  });
});

describe('Clubs API Tests', () => {
  let adminToken, studentToken;

  beforeAll(() => {
    studentToken = generateToken({ id: 1, email: 'student@example.com', role: 'student' });
    adminToken = generateToken({ id: 2, email: 'admin@example.com', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/clubs', () => {
    test('should get all clubs (public)', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'Tech Club', category: 'Technical' },
          { id: 2, name: 'Drama Club', category: 'Cultural' }
        ]
      });

      const response = await request(app).get('/api/clubs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.clubs).toBeInstanceOf(Array);
      expect(response.body.data.clubs.length).toBe(2);
    });

    test('should filter clubs by category', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/clubs')
        .query({ category: 'Technical' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/clubs/:id', () => {
    test('should get club by ID with events', async () => {
      query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Tech Club' }]
      });
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, title: 'Event 1' },
          { id: 2, title: 'Event 2' }
        ]
      });

      const response = await request(app).get('/api/clubs/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.club).toBeDefined();
      expect(response.body.data.events).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/clubs (Admin only)', () => {
    test('should create club with admin token', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'New Club', category: 'Sports' }
        ]
      });

      const response = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Club',
          description: 'A new club',
          category: 'Sports',
          contact_email: 'newclub@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.club).toBeDefined();
    });

    test('should reject club creation by non-admin', async () => {
      const response = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'New Club'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/clubs/:id (Admin only)', () => {
    test('should delete club with admin token', async () => {
      query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

      const response = await request(app)
        .delete('/api/clubs/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 404 when deleting non-existent club', async () => {
      query.mockResolvedValueOnce({ rowCount: 0 });

      const response = await request(app)
        .delete('/api/clubs/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
