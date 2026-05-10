/**
 * Integration tests for pagination and sorting on timetable list endpoints.
 * Covers valid combinations, invalid query params (→ 400), and boundary cases.
 */

const request = require('supertest');
const app = require('../src/app');

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

// Helper: mock a successful list response (data + count queries via Promise.all)
const mockListResponse = (rows, total) => {
  query.mockResolvedValueOnce({ rows });          // data query
  query.mockResolvedValueOnce({ rows: [{ count: String(total) }] }); // count query
};

describe('Timetable Listing – Pagination and Sorting', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Valid combinations ────────────────────────────────────────────────────

  describe('Valid pagination parameters', () => {

    test('GET /api/timetable/teachers?page=1&limit=5 returns metadata', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ page: '1', limit: '5' });

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(5);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.teachers).toBeInstanceOf(Array);
    });

    test('GET /api/timetable/subjects?page=2&limit=10 returns correct page', async () => {
      mockListResponse([], 25);

      const res = await request(app)
        .get('/api/timetable/subjects')
        .query({ page: '2', limit: '10' });

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.limit).toBe(10);
      expect(res.body.data.total).toBe(25);
    });

    test('GET /api/timetable/rooms?page=1&limit=100 (max allowed limit)', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/rooms')
        .query({ page: '1', limit: '100' });

      expect(res.status).toBe(200);
      expect(res.body.data.limit).toBe(100);
    });

    test('GET /api/timetable/groups?page=1 uses default limit', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/groups')
        .query({ page: '1' });

      expect(res.status).toBe(200);
      expect(res.body.data.limit).toBe(20);
    });
  });

  describe('Valid sort parameters', () => {

    test('GET /api/timetable/teachers?sort=full_name&order=asc', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ sort: 'full_name', order: 'asc' });

      expect(res.status).toBe(200);
      // Verify the SQL was called with the sort column
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('full_name'),
        expect.any(Array)
      );
    });

    test('GET /api/timetable/teachers?sort=department&order=desc', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ sort: 'department', order: 'desc' });

      expect(res.status).toBe(200);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DESC'),
        expect.any(Array)
      );
    });

    test('GET /api/timetable/subjects?sort=subject_name&order=asc', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/subjects')
        .query({ sort: 'subject_name', order: 'asc' });

      expect(res.status).toBe(200);
    });

    test('GET /api/timetable/subjects?sort=semester', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/subjects')
        .query({ sort: 'semester' });

      expect(res.status).toBe(200);
    });

    test('GET /api/timetable/rooms?sort=capacity&order=desc', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/rooms')
        .query({ sort: 'capacity', order: 'desc' });

      expect(res.status).toBe(200);
    });

    test('GET /api/timetable/groups?sort=group_name', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/groups')
        .query({ sort: 'group_name' });

      expect(res.status).toBe(200);
    });

    test('GET /api/timetable/teachers?sort=created_at&order=desc', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ sort: 'created_at', order: 'desc' });

      expect(res.status).toBe(200);
    });
  });

  // ─── Invalid combinations → 400 ───────────────────────────────────────────

  describe('Invalid pagination parameters → 400', () => {

    test('Non-numeric page → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ page: 'abc' });

      expect(res.status).toBe(400);
    });

    test('Non-numeric limit → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ limit: 'ten' });

      expect(res.status).toBe(400);
    });

    test('page=0 → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/subjects')
        .query({ page: '0' });

      expect(res.status).toBe(400);
    });

    test('page=-1 → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/rooms')
        .query({ page: '-1' });

      expect(res.status).toBe(400);
    });

    test('limit=0 → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/groups')
        .query({ limit: '0' });

      expect(res.status).toBe(400);
    });

    test('limit exceeding max (101) → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ limit: '101' });

      expect(res.status).toBe(400);
    });

    test('limit=-1 → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ limit: '-1' });

      expect(res.status).toBe(400);
    });

    test('limit=-100 → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ limit: '-100' });

      expect(res.status).toBe(400);
    });

    test('Non-integer page (float) → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ page: '1.5' });

      expect(res.status).toBe(400);
    });

    test('Non-integer limit (float) → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ limit: '5.5' });

      expect(res.status).toBe(400);
    });
  });

  describe('Invalid sort parameters → 400', () => {

    test('Unknown sort field for teachers → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ sort: 'password' });

      expect(res.status).toBe(400);
    });

    test('SQL injection attempt in sort → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ sort: '1; DROP TABLE teachers; --' });

      expect(res.status).toBe(400);
    });

    test('Unknown sort field for subjects → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/subjects')
        .query({ sort: 'nonexistent_column' });

      expect(res.status).toBe(400);
    });

    test('Unknown sort field for rooms → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/rooms')
        .query({ sort: 'id' });

      expect(res.status).toBe(400);
    });

    test('Unknown sort field for groups → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/groups')
        .query({ sort: 'strength' });

      expect(res.status).toBe(400);
    });

    test('Invalid order value → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ sort: 'full_name', order: 'sideways' });

      expect(res.status).toBe(400);
    });

    test('Invalid order value "random" → 400', async () => {
      const res = await request(app)
        .get('/api/timetable/subjects')
        .query({ order: 'random' });

      expect(res.status).toBe(400);
    });
  });

  // ─── Boundary cases ────────────────────────────────────────────────────────

  describe('Boundary cases', () => {

    test('Page beyond total returns empty array with correct metadata', async () => {
      mockListResponse([], 5); // only 5 total records

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ page: '999', limit: '10' });

      expect(res.status).toBe(200);
      expect(res.body.data.teachers).toEqual([]);
      expect(res.body.data.total).toBe(5);
      expect(res.body.data.page).toBe(999);
      expect(res.body.data.count).toBe(0);
    });

    test('Page 1 with large limit returns all items and correct count', async () => {
      const rows = [{ id: '1', full_name: 'Alice' }, { id: '2', full_name: 'Bob' }];
      mockListResponse(rows, 2);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ page: '1', limit: '100' });

      expect(res.status).toBe(200);
      expect(res.body.data.teachers).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.count).toBe(2);
    });

    test('Combined filter + pagination + sort', async () => {
      mockListResponse([], 0);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ department: 'Computer Science', page: '1', limit: '5', sort: 'full_name', order: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(5);
    });

    test('Large dataset simulation (1,000,000 records)', async () => {
      const totalRecords = 1000000;
      const currentPage = 5000;
      const currentLimit = 50;
      
      // Mock returning a single page of data in a sea of 1M records
      const mockRows = Array.from({ length: 50 }, (_, i) => ({ 
        id: `id-${i}`, 
        full_name: `Teacher ${i + (currentPage - 1) * currentLimit}` 
      }));
      
      mockListResponse(mockRows, totalRecords);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ page: currentPage, limit: currentLimit });

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(totalRecords);
      expect(res.body.data.page).toBe(currentPage);
      expect(res.body.data.count).toBe(currentLimit);
      expect(res.body.data.teachers).toHaveLength(currentLimit);
    });

    test('Extremely large page number (beyond 32-bit int) returns empty result', async () => {
      // Postgres/JS handles large numbers, but we check if it breaks anything
      const largePage = 2147483648; 
      mockListResponse([], 100);

      const res = await request(app)
        .get('/api/timetable/teachers')
        .query({ page: largePage.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(largePage);
      expect(res.body.data.teachers).toEqual([]);
    });

    test('page=1&limit=20 (defaults) returns valid structure for all list endpoints', async () => {
      const endpoints = [
        { path: '/api/timetable/teachers', key: 'teachers' },
        { path: '/api/timetable/subjects', key: 'subjects' },
        { path: '/api/timetable/rooms',    key: 'rooms' },
        { path: '/api/timetable/groups',   key: 'groups' },
      ];

      for (const { path, key } of endpoints) {
        jest.clearAllMocks();
        mockListResponse([], 0);

        const res = await request(app).get(path);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[key]).toBeInstanceOf(Array);
        expect(res.body.data).toHaveProperty('total');
        expect(res.body.data).toHaveProperty('page');
        expect(res.body.data).toHaveProperty('limit');
      }
    });
  });
});
