/**
 * Query Validation Tests
 * Tests Joi schema validation for query parameters
 */

const request = require('supertest');
const app = require('../src/app');

// Mock the database to avoid actual DB calls
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

const { query } = require('../src/config/db');

describe('Query Parameter Validation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Events Query Validation', () => {
    test('should allow valid query parameters for events', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/events')
        .query({
          search: 'tech',
          tag: 'workshop',
          club_id: 1,
          department: 'Computer Science',
          is_featured: 'true',
          upcoming: 'false',
          page: 1,
          limit: 10,
          sort: 'title',
          order: 'DESC'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid club_id (not a number)', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ club_id: 'abc' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('"club_id" must be a number');
    });

    test('should reject invalid is_featured (not true/false string)', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ is_featured: 'yes' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('"is_featured" must be one of [true, false]');
    });

    test('should reject invalid sort field', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ sort: 'invalid_field' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('"sort" must be one of [start_time, title, created_at]');
    });

    test('should reject negative page number', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ page: -1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('"page" must be greater than or equal to 1');
    });
  });

  describe('Clubs Query Validation', () => {
    test('should allow valid query parameters for clubs', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/clubs')
        .query({
          category: 'Technical',
          search: 'coding',
          page: 2,
          limit: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject search term that is too long', async () => {
      const longSearch = 'a'.repeat(101);
      const response = await request(app)
        .get('/api/clubs')
        .query({ search: longSearch });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('"search" length must be less than or equal to 100 characters');
    });
  });
});
